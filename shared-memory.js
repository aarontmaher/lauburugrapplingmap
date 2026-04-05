/**
 * Shared Structured Memory Layer
 * ===============================
 * Cross-model memory for ChatGPT, Claude, Control Centre, and website AI.
 *
 * Stores structured artifacts — NOT raw conversation transcripts.
 * Only approved rules reach the website. Everything else is operator/research-only.
 *
 * Storage: GrapplingMap MCP backend (SHARED_MEMORY.json) + localStorage fallback.
 * Read/write: MCP HTTP API at /api/shared-memory + browser fallback.
 */

(function () {
  'use strict';

  var MCP_API = 'https://mcp.lauburugrapplingmap.com/api';
  var LOCAL_KEY_PREFIX = 'gm_shared_memory';

  function _getCurrentUserId() {
    return (typeof getCurrentUserId === 'function' ? getCurrentUserId() : null) || 'default';
  }

  function _localKey(userId) {
    return LOCAL_KEY_PREFIX + '_' + (userId || _getCurrentUserId());
  }

  // ─── ITEM TYPES ────────────────────────────────────────────────────────────
  var ITEM_TYPE = {
    FACT: 'fact',                           // directly observable, no inference
    CONTEXT: 'context',                     // current training/WHOOP/life context
    SUBSTANCE_EVENT: 'substance_event',     // caffeine, alcohol, supplements, etc.
    INSIGHT: 'insight',                     // derived observation or hypothesis
    RULE: 'rule',                           // actionable coaching rule
    QUESTION: 'question'                    // open question needing investigation
  };

  var ITEM_STATUS = {
    CANDIDATE: 'candidate',
    UNDER_REVIEW: 'under_review',
    REVIEWED: 'reviewed',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SUPERSEDED: 'superseded',
    RESOLVED: 'resolved'                    // for questions that have been answered
  };

  // ─── SCHEMA ────────────────────────────────────────────────────────────────
  function createItem(fields) {
    var now = new Date().toISOString();
    return {
      id: fields.id || ('SM-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)),
      type: fields.type || ITEM_TYPE.FACT,
      status: fields.status || ITEM_STATUS.CANDIDATE,
      title: fields.title || '',
      body: fields.body || '',
      scope: fields.scope || 'personal',        // 'personal' | 'general'
      confidence: fields.confidence != null ? fields.confidence : 0.5,
      source_model: fields.source_model || 'unknown',
      source_flow: fields.source_flow || 'manual',
      evidence: fields.evidence || [],           // array of strings
      counterpoints: fields.counterpoints || [], // things that weaken this
      tags: fields.tags || [],
      related_ids: fields.related_ids || [],
      approved_for_website: fields.approved_for_website || false,
      review_history: fields.review_history || [],
      superseded_by: fields.superseded_by || null,
      created_at: fields.created_at || now,
      updated_at: now,
      expires_at: fields.expires_at || null      // for time-limited context
    };
  }

  // ─── STORE ─────────────────────────────────────────────────────────────────
  var _cache = null;
  var _lastFetched = 0;

  function _emptyStore() {
    return {
      schema_version: 1,
      updated_at: null,
      facts: [],
      context: [],
      substance_timeline: [],
      insights: [],
      open_questions: [],
      approved_rules: []
    };
  }

  function _collectionForType(store, type) {
    switch (type) {
      case ITEM_TYPE.FACT: return store.facts;
      case ITEM_TYPE.CONTEXT: return store.context;
      case ITEM_TYPE.SUBSTANCE_EVENT: return store.substance_timeline;
      case ITEM_TYPE.INSIGHT: return store.insights;
      case ITEM_TYPE.RULE: return store.approved_rules;
      case ITEM_TYPE.QUESTION: return store.open_questions;
      default: return store.insights;
    }
  }

  function _loadLocal(userId) {
    try {
      var raw = localStorage.getItem(_localKey(userId));
      return raw ? JSON.parse(raw) : _emptyStore();
    } catch (e) { return _emptyStore(); }
  }

  function _saveLocal(store, userId) {
    try { localStorage.setItem(_localKey(userId), JSON.stringify(store)); }
    catch (e) { /* storage full */ }
  }

  async function _fetchFromBackend(userId) {
    try {
      var uid = userId || _getCurrentUserId();
      var resp = await fetch(MCP_API + '/shared-memory?user_id=' + encodeURIComponent(uid), { signal: AbortSignal.timeout(6000) });
      if (!resp.ok) return null;
      var data = await resp.json();
      return (data && data.ok) ? data.item : null;
    } catch (e) { return null; }
  }

  async function _pushToBackend(store, userId) {
    try {
      var uid = userId || _getCurrentUserId();
      await fetch(MCP_API + '/shared-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', user_id: uid, item: store }),
        signal: AbortSignal.timeout(6000)
      });
    } catch (e) { /* best-effort */ }
  }

  async function getStore(userId) {
    var uid = userId || _getCurrentUserId();
    var now = Date.now();
    if (_cache && _cache._userId === uid && now - _lastFetched < 10000) return _cache;
    var backend = await _fetchFromBackend(uid);
    if (backend && backend.schema_version) {
      backend._userId = uid;
      _cache = backend;
      _saveLocal(backend, uid);
    } else {
      _cache = _loadLocal(uid);
      _cache._userId = uid;
    }
    _lastFetched = now;
    return _cache;
  }

  async function saveStore(store, userId) {
    var uid = userId || _getCurrentUserId();
    store.updated_at = new Date().toISOString();
    store._userId = uid;
    _cache = store;
    _saveLocal(store, uid);
    await _pushToBackend(store, uid);
  }

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  async function addItem(fields) {
    var item = createItem(fields);
    var store = await getStore();
    var col = _collectionForType(store, item.type);
    col.push(item);
    await saveStore(store);
    return { ok: true, item: item };
  }

  async function updateItem(id, updates) {
    var store = await getStore();
    var found = _findItem(store, id);
    if (!found) return { ok: false, error: 'not_found' };
    Object.keys(updates).forEach(function (k) {
      if (k !== 'id' && k !== 'created_at') found[k] = updates[k];
    });
    found.updated_at = new Date().toISOString();
    await saveStore(store);
    return { ok: true, item: found };
  }

  async function reviewItem(id, action, reason, reviewer) {
    var store = await getStore();
    var item = _findItem(store, id);
    if (!item) return { ok: false, error: 'not_found' };
    var now = new Date().toISOString();
    item.review_history.push({ date: now, action: action, by: reviewer || 'operator', reason: reason || '' });
    item.updated_at = now;

    if (action === 'approve') {
      item.status = ITEM_STATUS.APPROVED;
      item.approved_for_website = true;
    } else if (action === 'reject') {
      item.status = ITEM_STATUS.REJECTED;
      item.approved_for_website = false;
    } else if (action === 'challenge') {
      item.status = ITEM_STATUS.UNDER_REVIEW;
      if (item.confidence > 0.15) item.confidence = Math.round((item.confidence - 0.1) * 100) / 100;
      item.counterpoints.push((reviewer || 'Reviewer') + ': ' + (reason || 'Challenged.'));
    } else if (action === 'resolve') {
      item.status = ITEM_STATUS.RESOLVED;
    } else if (action === 'supersede') {
      item.status = ITEM_STATUS.SUPERSEDED;
      item.approved_for_website = false;
      item.superseded_by = reason; // reason = new item ID
    }
    await saveStore(store);
    return { ok: true, item: item };
  }

  async function removeItem(id) {
    var store = await getStore();
    var removed = false;
    ['facts', 'context', 'substance_timeline', 'insights', 'open_questions', 'approved_rules'].forEach(function (col) {
      var before = store[col].length;
      store[col] = store[col].filter(function (i) { return i.id !== id; });
      if (store[col].length < before) removed = true;
    });
    if (!removed) return { ok: false, error: 'not_found' };
    await saveStore(store);
    return { ok: true };
  }

  function _findItem(store, id) {
    var collections = ['facts', 'context', 'substance_timeline', 'insights', 'open_questions', 'approved_rules'];
    for (var c = 0; c < collections.length; c++) {
      var col = store[collections[c]];
      for (var i = 0; i < col.length; i++) {
        if (col[i].id === id) return col[i];
      }
    }
    return null;
  }

  // ─── QUERY ─────────────────────────────────────────────────────────────────

  async function getByType(type) {
    var store = await getStore();
    return _collectionForType(store, type);
  }

  async function getByStatus(status) {
    var store = await getStore();
    var all = [].concat(store.facts, store.context, store.substance_timeline, store.insights, store.open_questions, store.approved_rules);
    return all.filter(function (i) { return i.status === status; });
  }

  async function getCandidates() { return getByStatus(ITEM_STATUS.CANDIDATE); }
  async function getApproved() { return getByStatus(ITEM_STATUS.APPROVED); }
  async function getOpenQuestions() {
    var store = await getStore();
    return store.open_questions.filter(function (q) { return q.status !== ITEM_STATUS.RESOLVED; });
  }

  // ─── WEBSITE-SAFE LAYER ────────────────────────────────────────────────────
  // Only approved items reach the website. No candidates, no raw analysis.

  async function getWebsiteSafeRules() {
    var store = await getStore();
    return store.approved_rules.filter(function (r) { return r.approved_for_website && r.status === ITEM_STATUS.APPROVED; });
  }

  async function getWebsafeContext() {
    var store = await getStore();
    // Only approved facts + approved context items
    var safeFacts = store.facts.filter(function (f) { return f.status === ITEM_STATUS.APPROVED; });
    var safeContext = store.context.filter(function (c) { return c.status === ITEM_STATUS.APPROVED; });
    return { facts: safeFacts, context: safeContext, rules: await getWebsiteSafeRules() };
  }

  // ─── MODEL IMPORT ──────────────────────────────────────────────────────────
  // Structured import from ChatGPT or Claude analysis output.

  async function importModelOutput(payload) {
    if (!payload || !payload.items || !Array.isArray(payload.items)) {
      return { ok: false, error: 'payload must have items array' };
    }
    var results = [];
    for (var i = 0; i < payload.items.length; i++) {
      var raw = payload.items[i];
      raw.source_model = raw.source_model || payload.source_model || 'unknown';
      raw.source_flow = raw.source_flow || payload.source_flow || 'model-import';
      raw.status = ITEM_STATUS.CANDIDATE; // always candidate on import
      raw.approved_for_website = false;    // never auto-approved
      var result = await addItem(raw);
      results.push(result);
    }
    return {
      ok: true,
      imported: results.filter(function (r) { return r.ok; }).length,
      failed: results.filter(function (r) { return !r.ok; }).length,
      items: results.map(function (r) { return r.item; }).filter(Boolean)
    };
  }

  // ─── SUMMARY ───────────────────────────────────────────────────────────────

  async function getSummary() {
    var store = await getStore();
    return {
      facts: store.facts.length,
      context: store.context.length,
      substance_events: store.substance_timeline.length,
      insights: store.insights.length,
      open_questions: store.open_questions.length,
      approved_rules: store.approved_rules.length,
      by_status: {
        candidate: [].concat(store.facts, store.context, store.insights, store.open_questions).filter(function (i) { return i.status === ITEM_STATUS.CANDIDATE; }).length,
        approved: [].concat(store.facts, store.context, store.insights, store.approved_rules).filter(function (i) { return i.status === ITEM_STATUS.APPROVED; }).length,
        rejected: [].concat(store.facts, store.context, store.insights).filter(function (i) { return i.status === ITEM_STATUS.REJECTED; }).length
      },
      updated_at: store.updated_at
    };
  }

  // ─── PUBLIC API ────────────────────────────────────────────────────────────
  window.SharedMemory = {
    ITEM_TYPE: ITEM_TYPE,
    ITEM_STATUS: ITEM_STATUS,

    // Store
    getStore: getStore,

    // CRUD
    addItem: addItem,
    updateItem: updateItem,
    reviewItem: reviewItem,
    removeItem: removeItem,

    // Query
    getByType: getByType,
    getByStatus: getByStatus,
    getCandidates: getCandidates,
    getApproved: getApproved,
    getOpenQuestions: getOpenQuestions,

    // Website-safe (approved only)
    getWebsiteSafeRules: getWebsiteSafeRules,
    getWebsafeContext: getWebsafeContext,

    // Model import
    importModelOutput: importModelOutput,

    // Summary
    getSummary: getSummary
  };

})();
