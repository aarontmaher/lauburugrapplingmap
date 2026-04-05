/**
 * Multi-User Health Data Model
 * ============================
 * Provider-agnostic normalized health data for multiple users.
 * Supports: WHOOP, Apple Health, Garmin, Polar, Cronometer, manual-only.
 *
 * Per-user isolation: every record has a user_id.
 * Backend: Supabase (when available) + localStorage fallback (per-user keyed).
 *
 * The website AI reads ONLY the current authenticated user's data.
 * Operators can inspect any user's data through the CC.
 */

(function () {
  'use strict';

  // ─── PROVIDERS ─────────────────────────────────────────────────────────────
  var PROVIDERS = {
    WHOOP: 'whoop',
    APPLE_HEALTH: 'apple_health',
    GARMIN: 'garmin',
    POLAR: 'polar',
    CRONOMETER: 'cronometer',
    MANUAL: 'manual'
  };

  // ─── ROLES ─────────────────────────────────────────────────────────────────
  var ROLES = {
    USER: 'user',               // can see own data, track progress
    TESTER: 'tester',           // user + can send feedback, see beta features
    COACH: 'coach',             // can view trainees' data (with consent)
    OPERATOR: 'operator',       // full CC access, system admin
    ADMIN: 'admin'              // operator + can manage roles
  };

  var OPERATOR_ROLES = ['operator', 'admin'];
  var COACH_ROLES = ['coach', 'operator', 'admin'];

  // ─── NORMALIZED DAILY HEALTH RECORD ────────────────────────────────────────
  // Provider-agnostic. WHOOP populates the richest set; others fill what they can.

  function createDailyRecord(fields) {
    return {
      // Identity
      user_id: fields.user_id || null,
      date: fields.date || null,
      provider: fields.provider || PROVIDERS.MANUAL,
      provider_record_id: fields.provider_record_id || null,

      // Recovery / readiness
      recovery_score: fields.recovery_score != null ? fields.recovery_score : null,    // 0-100
      readiness_label: fields.readiness_label || null,  // 'high' | 'moderate' | 'low' | 'unknown'
      hrv_ms: fields.hrv_ms != null ? fields.hrv_ms : null,
      resting_hr: fields.resting_hr != null ? fields.resting_hr : null,

      // Sleep
      sleep_hours: fields.sleep_hours != null ? fields.sleep_hours : null,
      sleep_performance_pct: fields.sleep_performance_pct != null ? fields.sleep_performance_pct : null,
      sleep_efficiency_pct: fields.sleep_efficiency_pct != null ? fields.sleep_efficiency_pct : null,
      sws_hours: fields.sws_hours != null ? fields.sws_hours : null,
      rem_hours: fields.rem_hours != null ? fields.rem_hours : null,
      respiratory_rate: fields.respiratory_rate != null ? fields.respiratory_rate : null,

      // Strain / activity
      daily_strain: fields.daily_strain != null ? fields.daily_strain : null,
      active_calories: fields.active_calories != null ? fields.active_calories : null,
      step_count: fields.step_count != null ? fields.step_count : null,

      // Biometrics
      spo2_pct: fields.spo2_pct != null ? fields.spo2_pct : null,
      skin_temp_c: fields.skin_temp_c != null ? fields.skin_temp_c : null,
      weight_kg: fields.weight_kg != null ? fields.weight_kg : null,

      // Workouts (array)
      workouts: Array.isArray(fields.workouts) ? fields.workouts : [],
      // Each: { type, sport_label, duration_min, strain, avg_hr, max_hr, calories, is_grappling }

      // Grappling context (manual input)
      grappling_session: fields.grappling_session || null,
      // { type, intensity, duration_min, rounds, sparring, techniques, notes }

      // Nutrition (from Cronometer or manual)
      nutrition: fields.nutrition || null,
      // { calories, protein_g, carbs_g, fat_g, water_ml }

      // Subjective (manual)
      subjective: fields.subjective || null,
      // { mood: 1-5, perceived_exertion: 1-10, energy: 1-5, notes }

      // Substance timeline
      substances: Array.isArray(fields.substances) ? fields.substances : [],
      // Each: { name, amount, unit, time, category: 'caffeine'|'alcohol'|'supplement'|'medication' }

      // Provenance
      data_source: fields.data_source || 'unknown',
      imported_at: fields.imported_at || new Date().toISOString(),

      // Computed (filled by feature derivation)
      _computed: null
    };
  }

  // ─── WHOOP → NORMALIZED MAPPER ─────────────────────────────────────────────
  function fromWhoop(whoopData, userId) {
    return createDailyRecord({
      user_id: userId,
      date: whoopData.date,
      provider: PROVIDERS.WHOOP,
      recovery_score: whoopData.recovery_score,
      readiness_label: whoopData.readiness_state,
      hrv_ms: whoopData.hrv_ms,
      resting_hr: whoopData.resting_hr,
      sleep_hours: whoopData.sleep_hours,
      sleep_performance_pct: whoopData.sleep_performance_pct,
      sleep_efficiency_pct: whoopData.sleep_efficiency_pct,
      sws_hours: whoopData.sws_hours,
      rem_hours: whoopData.rem_hours,
      respiratory_rate: whoopData.respiratory_rate,
      daily_strain: whoopData.daily_strain,
      spo2_pct: whoopData.spo2_pct,
      skin_temp_c: whoopData.skin_temp_c,
      workouts: (whoopData.workouts || []).map(function (w) {
        return {
          type: w.sport_id,
          sport_label: w.sport_label || null,
          duration_min: w.duration_min,
          strain: w.strain,
          avg_hr: w.avg_hr,
          max_hr: w.max_hr,
          is_grappling: w.sport_id === 43 || w.sport_id === 44 || w.sport_id === 84
        };
      }),
      grappling_session: whoopData.grappling_session,
      subjective: whoopData.subjective,
      data_source: whoopData.data_source || 'whoop_api'
    });
  }

  // ─── APPLE HEALTH → NORMALIZED MAPPER ──────────────────────────────────────
  function fromAppleHealth(appleData, userId) {
    return createDailyRecord({
      user_id: userId,
      date: appleData.date,
      provider: PROVIDERS.APPLE_HEALTH,
      hrv_ms: appleData.hrv,
      resting_hr: appleData.resting_heart_rate,
      sleep_hours: appleData.sleep_duration_hours,
      active_calories: appleData.active_energy,
      step_count: appleData.steps,
      spo2_pct: appleData.blood_oxygen,
      weight_kg: appleData.body_mass,
      workouts: (appleData.workouts || []).map(function (w) {
        return {
          type: w.workout_type,
          sport_label: w.workout_type_name,
          duration_min: w.duration_minutes,
          avg_hr: w.average_heart_rate,
          max_hr: w.max_heart_rate,
          calories: w.active_energy,
          is_grappling: (w.workout_type_name || '').toLowerCase().indexOf('martial') !== -1 ||
                        (w.workout_type_name || '').toLowerCase().indexOf('wrestling') !== -1
        };
      }),
      data_source: 'apple_health'
    });
  }

  // ─── MANUAL → NORMALIZED ───────────────────────────────────────────────────
  // ─── POLAR → NORMALIZED MAPPER ──────────────────────────────────────────
  // Polar provides: sleep, Nightly Recharge (HRV + ANS), Training Load, workouts
  function fromPolar(polarData, userId) {
    // Polar Nightly Recharge provides ANS charge (-5 to +5) and HRV
    var rechargeScore = polarData.nightly_recharge_status; // 'very_poor'|'poor'|'compromised'|'ok'|'good'|'very_good'
    var readinessLabel = 'unknown';
    if (rechargeScore === 'good' || rechargeScore === 'very_good') readinessLabel = 'high';
    else if (rechargeScore === 'ok' || rechargeScore === 'compromised') readinessLabel = 'moderate';
    else if (rechargeScore === 'poor' || rechargeScore === 'very_poor') readinessLabel = 'low';

    return createDailyRecord({
      user_id: userId,
      date: polarData.date,
      provider: PROVIDERS.POLAR,
      // Recovery: Polar uses Nightly Recharge, not a 0-100 score
      recovery_score: polarData.ans_charge != null ? Math.round(((polarData.ans_charge + 5) / 10) * 100) : null, // normalize -5..+5 to 0-100
      readiness_label: readinessLabel,
      hrv_ms: polarData.hrv_rmssd != null ? polarData.hrv_rmssd : null,
      resting_hr: polarData.resting_heart_rate || polarData.sleeping_hr || null,
      // Sleep: Polar Sleep Plus Stages
      sleep_hours: polarData.sleep_duration_hours || (polarData.sleep_duration_ms ? polarData.sleep_duration_ms / 3600000 : null),
      sleep_performance_pct: polarData.sleep_score || null, // Polar Sleep Score 0-100
      sws_hours: polarData.deep_sleep_ms ? polarData.deep_sleep_ms / 3600000 : null,
      rem_hours: polarData.rem_sleep_ms ? polarData.rem_sleep_ms / 3600000 : null,
      respiratory_rate: polarData.breathing_rate || null,
      // Strain: Polar Training Load
      daily_strain: polarData.training_load || polarData.cardio_load || null,
      active_calories: polarData.active_calories || null,
      step_count: polarData.steps || null,
      // Workouts
      workouts: (polarData.exercises || polarData.workouts || []).map(function (w) {
        var sportName = (w.sport || w.detailed_sport_info || '').toLowerCase();
        return {
          type: w.sport_id || w.sport,
          sport_label: w.sport || w.detailed_sport_info || null,
          duration_min: w.duration_ms ? Math.round(w.duration_ms / 60000) : (w.duration_minutes || null),
          strain: w.training_load || null,
          avg_hr: w.average_heart_rate || null,
          max_hr: w.max_heart_rate || null,
          calories: w.calories || null,
          is_grappling: sportName.indexOf('martial') !== -1 || sportName.indexOf('wrestling') !== -1 ||
                        sportName.indexOf('bjj') !== -1 || sportName.indexOf('jiu') !== -1
        };
      }),
      grappling_session: polarData.grappling_session || null,
      subjective: polarData.subjective || null,
      data_source: 'polar'
    });
  }

  // ─── GARMIN → NORMALIZED MAPPER (stub) ─────────────────────────────────────
  function fromGarmin(garminData, userId) {
    return createDailyRecord({
      user_id: userId,
      date: garminData.date,
      provider: PROVIDERS.GARMIN,
      hrv_ms: garminData.hrv_weekly_avg || null,
      resting_hr: garminData.resting_heart_rate || null,
      sleep_hours: garminData.sleep_time_seconds ? garminData.sleep_time_seconds / 3600 : null,
      daily_strain: garminData.training_load || null,
      active_calories: garminData.active_kilocalories || null,
      step_count: garminData.total_steps || null,
      spo2_pct: garminData.spo2 || null,
      weight_kg: garminData.weight_grams ? garminData.weight_grams / 1000 : null,
      data_source: 'garmin'
    });
  }

  // ─── CRONOMETER → NORMALIZED MAPPER (stub) ─────────────────────────────────
  function fromCronometer(cronoData, userId) {
    return createDailyRecord({
      user_id: userId,
      date: cronoData.date,
      provider: PROVIDERS.CRONOMETER,
      nutrition: {
        calories: cronoData.energy_kcal || null,
        protein_g: cronoData.protein_g || null,
        carbs_g: cronoData.carbs_g || null,
        fat_g: cronoData.fat_g || null,
        water_ml: cronoData.water_ml || null
      },
      weight_kg: cronoData.weight_kg || null,
      data_source: 'cronometer'
    });
  }

  function fromManual(manualData, userId) {
    return createDailyRecord({
      user_id: userId,
      date: manualData.date,
      provider: PROVIDERS.MANUAL,
      sleep_hours: manualData.sleep_hours,
      grappling_session: manualData.grappling_session,
      subjective: manualData.subjective,
      substances: manualData.substances,
      nutrition: manualData.nutrition,
      data_source: 'manual'
    });
  }

  // ─── PER-USER STORE ────────────────────────────────────────────────────────
  // Keyed by user_id. Each user has their own history.

  function _userKey(userId) {
    return 'gm_health_' + (userId || 'anonymous');
  }

  function loadUserHistory(userId) {
    try {
      var raw = localStorage.getItem(_userKey(userId));
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveUserHistory(userId, history) {
    try { localStorage.setItem(_userKey(userId), JSON.stringify(history)); }
    catch (e) { /* storage full */ }
  }

  function appendDay(userId, record) {
    if (!record || !record.date) return;
    record.user_id = userId;
    var history = loadUserHistory(userId);
    var idx = -1;
    for (var i = 0; i < history.length; i++) {
      if (history[i].date === record.date && history[i].provider === record.provider) { idx = i; break; }
    }
    if (idx >= 0) history[idx] = record; else history.push(record);
    history.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    if (history.length > 365) history = history.slice(history.length - 365);
    saveUserHistory(userId, history);
    return record;
  }

  // ─── ROLE CHECKS ──────────────────────────────────────────────────────────
  function isOperatorRole(role) {
    return OPERATOR_ROLES.indexOf(role) !== -1;
  }

  function isCoachRole(role) {
    return COACH_ROLES.indexOf(role) !== -1;
  }

  function canViewUser(viewerRole, viewerUserId, targetUserId) {
    if (viewerUserId === targetUserId) return true; // own data
    if (isOperatorRole(viewerRole)) return true;     // operators see all
    if (isCoachRole(viewerRole)) return true;         // coaches see trainees
    return false;
  }

  // ─── PROVIDER AVAILABILITY ─────────────────────────────────────────────────
  function getProviderFields(provider) {
    switch (provider) {
      case PROVIDERS.WHOOP:
        return {
          recovery: true, hrv: true, resting_hr: true,
          sleep_detail: true, strain: true, spo2: true, skin_temp: true,
          workouts: true, hr_zones: true
        };
      case PROVIDERS.APPLE_HEALTH:
        return {
          hrv: true, resting_hr: true, sleep_hours: true,
          active_calories: true, steps: true, spo2: true, weight: true,
          workouts: true
        };
      case PROVIDERS.GARMIN:
        return {
          hrv: true, resting_hr: true, sleep_hours: true,
          body_battery: true, stress: true, steps: true,
          active_calories: true, spo2: true, workouts: true
        };
      case PROVIDERS.POLAR:
        return {
          hrv: true, resting_hr: true, sleep_hours: true,
          sleep_detail: true, strain: true, workouts: true
        };
      case PROVIDERS.CRONOMETER:
        return { nutrition: true };
      case PROVIDERS.MANUAL:
        return { subjective: true, grappling_session: true, substances: true, nutrition: true };
      default:
        return {};
    }
  }

  // ─── PUBLIC API ────────────────────────────────────────────────────────────
  window.MultiUserHealth = {
    PROVIDERS: PROVIDERS,
    ROLES: ROLES,

    // Schema
    createDailyRecord: createDailyRecord,

    // Provider mappers
    fromWhoop: fromWhoop,
    fromPolar: fromPolar,
    fromAppleHealth: fromAppleHealth,
    fromGarmin: fromGarmin,
    fromCronometer: fromCronometer,
    fromManual: fromManual,

    // Per-user store
    loadUserHistory: loadUserHistory,
    appendDay: appendDay,

    // Role checks
    isOperatorRole: isOperatorRole,
    isCoachRole: isCoachRole,
    canViewUser: canViewUser,

    // Provider info
    getProviderFields: getProviderFields
  };

})();
