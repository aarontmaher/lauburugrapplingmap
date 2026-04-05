/**
 * Health Context Input Module
 * ===========================
 * Structured input for grappling sessions, daily context, substances, and nutrition.
 * Fills the gaps that no wearable can provide automatically.
 *
 * Stores to: multi-user health layer (per-user, per-date).
 * Can also push to MCP backend for persistence.
 */

(function () {
  'use strict';

  var MCP_API = 'https://mcp.lauburugrapplingmap.com/api';

  // ─── GRAPPLING SESSION BUILDER ─────────────────────────────────────────────
  function createGrapplingSession(fields) {
    return {
      date: fields.date || new Date().toISOString().slice(0, 10),
      type: fields.type || 'bjj',             // 'bjj' | 'wrestling' | 'mma' | 'judo'
      intensity: fields.intensity || 'moderate', // 'light' | 'moderate' | 'hard'
      focus: fields.focus || 'mixed',          // 'drilling' | 'positional' | 'sparring' | 'comp_prep' | 'mixed'
      gi_mode: fields.gi_mode || 'no-gi',      // 'gi' | 'no-gi' | 'both'
      duration_min: fields.duration_min || null,
      rounds: fields.rounds || null,
      sparring: fields.sparring != null ? fields.sparring : false,
      comp_prep: fields.comp_prep || false,
      techniques_practiced: Array.isArray(fields.techniques_practiced) ? fields.techniques_practiced : [],
      positions_worked: Array.isArray(fields.positions_worked) ? fields.positions_worked : [],
      rpe: fields.rpe != null ? fields.rpe : null,     // 1-10
      soreness: Array.isArray(fields.soreness) ? fields.soreness : [],  // ['neck', 'knees', etc.]
      injuries: Array.isArray(fields.injuries) ? fields.injuries : [],
      notes: fields.notes || ''
    };
  }

  // ─── DAILY CONTEXT BUILDER ─────────────────────────────────────────────────
  function createDailyContext(fields) {
    return {
      date: fields.date || new Date().toISOString().slice(0, 10),
      mood: fields.mood != null ? fields.mood : null,           // 1-5
      energy: fields.energy != null ? fields.energy : null,     // 1-5
      fatigue: fields.fatigue != null ? fields.fatigue : null,   // 1-10
      soreness: fields.soreness != null ? fields.soreness : null, // 1-10
      stress: fields.stress != null ? fields.stress : null,       // 1-5
      injury_status: fields.injury_status || '',
      body_weight_kg: fields.body_weight_kg != null ? fields.body_weight_kg : null,
      notes: fields.notes || ''
    };
  }

  // ─── SUBSTANCE EVENT BUILDER ───────────────────────────────────────────────
  function createSubstanceEvent(fields) {
    return {
      date: fields.date || new Date().toISOString().slice(0, 10),
      time: fields.time || null,               // 'HH:MM' or null
      name: fields.name || '',                 // 'coffee', 'beer', 'creatine', etc.
      category: fields.category || 'other',    // 'caffeine' | 'alcohol' | 'supplement' | 'medication' | 'other'
      amount: fields.amount != null ? fields.amount : null,
      unit: fields.unit || '',                 // 'mg', 'ml', 'cups', etc.
      notes: fields.notes || ''
    };
  }

  // ─── NUTRITION SUMMARY BUILDER ─────────────────────────────────────────────
  function createNutritionSummary(fields) {
    return {
      date: fields.date || new Date().toISOString().slice(0, 10),
      calories: fields.calories != null ? fields.calories : null,
      protein_g: fields.protein_g != null ? fields.protein_g : null,
      carbs_g: fields.carbs_g != null ? fields.carbs_g : null,
      fat_g: fields.fat_g != null ? fields.fat_g : null,
      water_ml: fields.water_ml != null ? fields.water_ml : null,
      source: fields.source || 'manual'  // 'cronometer' | 'myfitnesspal' | 'manual'
    };
  }

  // ─── SAVE TO MULTI-USER HEALTH LAYER ───────────────────────────────────────

  function saveGrapplingSession(userId, session) {
    if (!window.MultiUserHealth) return { ok: false, error: 'multi-user-health not loaded' };
    var record = window.MultiUserHealth.createDailyRecord({
      user_id: userId,
      date: session.date,
      provider: 'manual',
      grappling_session: session,
      subjective: session.rpe ? { perceived_exertion: session.rpe } : null,
      data_source: 'manual_grappling'
    });
    window.MultiUserHealth.appendDay(userId, record);
    return { ok: true, record: record };
  }

  function saveDailyContext(userId, context) {
    if (!window.MultiUserHealth) return { ok: false, error: 'multi-user-health not loaded' };
    var record = window.MultiUserHealth.createDailyRecord({
      user_id: userId,
      date: context.date,
      provider: 'manual',
      weight_kg: context.body_weight_kg,
      subjective: {
        mood: context.mood,
        energy: context.energy,
        perceived_exertion: context.fatigue,
        notes: context.notes
      },
      data_source: 'manual_context'
    });
    window.MultiUserHealth.appendDay(userId, record);
    return { ok: true, record: record };
  }

  function saveSubstanceEvent(userId, event) {
    if (!window.MultiUserHealth) return { ok: false, error: 'multi-user-health not loaded' };
    // Substance events merge into the existing day record
    var history = window.MultiUserHealth.loadUserHistory(userId);
    var existing = history.find(function (r) { return r.date === event.date; });
    if (existing) {
      if (!Array.isArray(existing.substances)) existing.substances = [];
      existing.substances.push(event);
      window.MultiUserHealth.appendDay(userId, existing);
      return { ok: true, merged: true };
    }
    var record = window.MultiUserHealth.createDailyRecord({
      user_id: userId,
      date: event.date,
      provider: 'manual',
      substances: [event],
      data_source: 'manual_substance'
    });
    window.MultiUserHealth.appendDay(userId, record);
    return { ok: true, record: record };
  }

  function saveNutrition(userId, nutrition) {
    if (!window.MultiUserHealth) return { ok: false, error: 'multi-user-health not loaded' };
    var record = window.MultiUserHealth.createDailyRecord({
      user_id: userId,
      date: nutrition.date,
      provider: nutrition.source === 'cronometer' ? 'cronometer' : 'manual',
      nutrition: nutrition,
      data_source: nutrition.source || 'manual_nutrition'
    });
    window.MultiUserHealth.appendDay(userId, record);
    return { ok: true, record: record };
  }

  // ─── BATCH IMPORT (for retroactive tagging) ────────────────────────────────

  function batchImportGrapplingSessions(userId, sessions) {
    var results = sessions.map(function (s) {
      return saveGrapplingSession(userId, createGrapplingSession(s));
    });
    return {
      ok: true,
      imported: results.filter(function (r) { return r.ok; }).length,
      failed: results.filter(function (r) { return !r.ok; }).length
    };
  }

  function batchImportDailyContext(userId, contexts) {
    var results = contexts.map(function (c) {
      return saveDailyContext(userId, createDailyContext(c));
    });
    return {
      ok: true,
      imported: results.filter(function (r) { return r.ok; }).length,
      failed: results.filter(function (r) { return !r.ok; }).length
    };
  }

  // ─── DATA COMPLETENESS CHECK ───────────────────────────────────────────────

  function getCompletenessReport(userId) {
    if (!window.MultiUserHealth) return null;
    var history = window.MultiUserHealth.loadUserHistory(userId);
    var total = history.length;
    if (total === 0) return { total: 0, message: 'No health data yet.' };

    var withGrappling = history.filter(function (r) { return r.grappling_session; }).length;
    var withSubjective = history.filter(function (r) { return r.subjective; }).length;
    var withSubstances = history.filter(function (r) { return r.substances && r.substances.length > 0; }).length;
    var withNutrition = history.filter(function (r) { return r.nutrition; }).length;
    var withRecovery = history.filter(function (r) { return r.recovery_score != null; }).length;
    var withSleep = history.filter(function (r) { return r.sleep_hours != null; }).length;

    return {
      total_days: total,
      with_recovery: withRecovery,
      with_sleep: withSleep,
      with_grappling_context: withGrappling,
      with_subjective: withSubjective,
      with_substances: withSubstances,
      with_nutrition: withNutrition,
      gaps: {
        missing_grappling: total - withGrappling,
        missing_subjective: total - withSubjective,
        missing_substances: total - withSubstances,
        missing_nutrition: total - withNutrition
      },
      message: 'Grappling context on ' + withGrappling + '/' + total + ' days. ' +
               'Subjective on ' + withSubjective + '/' + total + ' days.'
    };
  }

  // ─── PUBLIC API ────────────────────────────────────────────────────────────
  window.HealthContextInput = {
    // Builders
    createGrapplingSession: createGrapplingSession,
    createDailyContext: createDailyContext,
    createSubstanceEvent: createSubstanceEvent,
    createNutritionSummary: createNutritionSummary,

    // Save
    saveGrapplingSession: saveGrapplingSession,
    saveDailyContext: saveDailyContext,
    saveSubstanceEvent: saveSubstanceEvent,
    saveNutrition: saveNutrition,

    // Batch import
    batchImportGrapplingSessions: batchImportGrapplingSessions,
    batchImportDailyContext: batchImportDailyContext,

    // Completeness
    getCompletenessReport: getCompletenessReport
  };

})();
