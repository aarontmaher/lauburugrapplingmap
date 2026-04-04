/**
 * WHOOP Grappling Intelligence Layer
 * ===================================
 * Strict, evidence-backed intelligence pipeline for GrapplingMap.
 *
 * Architecture:
 *   Raw WHOOP data → Derived features → Insight candidates → Review → Approved rules → Website consumption
 *
 * Nothing experimental reaches the website. Only approved, structured, explainable outputs.
 */

(function () {
  'use strict';

  // ─── STORAGE KEYS ──────────────────────────────────────────────────────────
  var STORAGE_KEY_INSIGHTS = 'gm_whoop_insights';
  var STORAGE_KEY_HISTORY = 'gm_whoop_history';
  var STORAGE_KEY_RULES = 'gm_whoop_approved_rules';

  // ─── CLASSIFICATION ENUM ───────────────────────────────────────────────────
  var INSIGHT_CLASS = {
    FACT: 'FACT',                                   // directly observable, no inference
    OBSERVED_PATTERN: 'OBSERVED_PATTERN',            // repeated observation, not causal
    WORKING_HYPOTHESIS: 'WORKING_HYPOTHESIS',        // plausible but needs more data
    TENTATIVE_RECOMMENDATION: 'TENTATIVE_RECOMMENDATION', // actionable but low-confidence
    WEBSITE_READY_RULE: 'WEBSITE_READY_RULE'         // approved for website consumption
  };

  var INSIGHT_STATUS = {
    CANDIDATE: 'candidate',
    UNDER_REVIEW: 'under_review',
    CHALLENGED: 'challenged',
    REVISED: 'revised',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SUPERSEDED: 'superseded'
  };

  // ─── INSIGHT SCHEMA ────────────────────────────────────────────────────────
  function createInsight(fields) {
    var now = new Date().toISOString();
    return {
      id: fields.id || ('INS-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7)),
      title: fields.title || '',
      rule: fields.rule || '',                        // the actual rule statement
      context: fields.context || '',                  // when this applies
      scope: fields.scope || 'personal',              // 'personal' | 'general'
      classification: fields.classification || INSIGHT_CLASS.OBSERVED_PATTERN,
      status: fields.status || INSIGHT_STATUS.CANDIDATE,
      evidence_window: fields.evidence_window || null, // { start: ISO, end: ISO, days: N }
      supporting_facts: fields.supporting_facts || [], // array of strings
      counterpoints: fields.counterpoints || [],       // things that weaken this
      confidence: fields.confidence != null ? fields.confidence : 0.5, // 0.0–1.0
      approved_for_website: fields.approved_for_website || false,
      approval_reason: fields.approval_reason || null,
      rejection_reason: fields.rejection_reason || null,
      created_at: fields.created_at || now,
      updated_at: now,
      source_model: fields.source_model || 'whoop-intelligence-v1',
      source_flow: fields.source_flow || 'feature-analysis',
      what_would_increase_confidence: fields.what_would_increase_confidence || [],
      review_history: fields.review_history || [],     // array of { date, action, by, reason }
      reviewed_at: fields.reviewed_at || null,
      reviewed_by: fields.reviewed_by || null,        // 'claude' | 'chatgpt' | 'operator' | model id
      evidence_fields_used: fields.evidence_fields_used || [],    // which data fields this insight relied on
      evidence_fields_missing: fields.evidence_fields_missing || [], // fields that would strengthen this if available
      data_provenance: fields.data_provenance || null,  // { sources: {}, days: N }
      challenge_notes: fields.challenge_notes || [],   // array of { model, date, note }
      revised_from: fields.revised_from || null,       // insight ID this was revised from
      superseded_by: fields.superseded_by || null,
      supersedes: fields.supersedes || null,            // insight ID this supersedes
      tags: fields.tags || []
    };
  }

  // ─── APPROVED RULE SCHEMA (website-facing) ─────────────────────────────────
  function createApprovedRule(insight) {
    return {
      id: insight.id,
      title: insight.title,
      rule: insight.rule,
      context: insight.context,
      scope: insight.scope,
      confidence: insight.confidence,
      supporting_facts: insight.supporting_facts.slice(0, 3), // limit for UI
      explanation: buildExplanation(insight),
      approved_at: new Date().toISOString(),
      source_insight_id: insight.id
    };
  }

  function buildExplanation(insight) {
    var parts = [];
    if (insight.supporting_facts.length > 0) {
      parts.push('Based on: ' + insight.supporting_facts[0]);
    }
    if (insight.evidence_window && insight.evidence_window.days) {
      parts.push('Observed over ' + insight.evidence_window.days + ' days of data.');
    }
    if (insight.confidence >= 0.8) {
      parts.push('High confidence — consistent pattern.');
    } else if (insight.confidence >= 0.6) {
      parts.push('Moderate confidence — more data would strengthen this.');
    }
    return parts.join(' ') || 'Derived from WHOOP performance data.';
  }

  // ─── HISTORY STORE ─────────────────────────────────────────────────────────
  // Stores normalized daily WHOOP snapshots for feature derivation.
  // Each entry is a single day's worth of data.

  function loadHistory() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveHistory(history) {
    try { localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history)); }
    catch (e) { /* storage full — silent */ }
  }

  function appendDayToHistory(whoopData) {
    if (!whoopData || !whoopData.date) return;
    var history = loadHistory();
    // Dedupe by date — replace if same date exists
    var idx = -1;
    for (var i = 0; i < history.length; i++) {
      if (history[i].date === whoopData.date) { idx = i; break; }
    }
    var entry = {
      date: whoopData.date,
      // Core metrics (always expected from basic WHOOP)
      recovery_score: whoopData.recovery_score != null ? whoopData.recovery_score : null,
      hrv_ms: whoopData.hrv_ms != null ? whoopData.hrv_ms : null,
      resting_hr: whoopData.resting_hr != null ? whoopData.resting_hr : null,
      daily_strain: whoopData.daily_strain != null ? whoopData.daily_strain : null,
      readiness_state: whoopData.readiness_state || 'unknown',
      // Sleep — basic
      sleep_hours: whoopData.sleep_hours != null ? whoopData.sleep_hours : null,
      sleep_performance_pct: whoopData.sleep_performance_pct != null ? whoopData.sleep_performance_pct : null,
      // Sleep — detailed (CSV/full-API when available)
      sleep_efficiency_pct: whoopData.sleep_efficiency_pct != null ? whoopData.sleep_efficiency_pct : null,
      sws_hours: whoopData.sws_hours != null ? whoopData.sws_hours : null,
      rem_hours: whoopData.rem_hours != null ? whoopData.rem_hours : null,
      light_hours: whoopData.light_hours != null ? whoopData.light_hours : null,
      awake_hours: whoopData.awake_hours != null ? whoopData.awake_hours : null,
      respiratory_rate: whoopData.respiratory_rate != null ? whoopData.respiratory_rate : null,
      // Biometrics (when available)
      spo2_pct: whoopData.spo2_pct != null ? whoopData.spo2_pct : null,
      skin_temp_c: whoopData.skin_temp_c != null ? whoopData.skin_temp_c : null,
      // Strain — detail
      kilojoules: whoopData.kilojoules != null ? whoopData.kilojoules : null,
      avg_hr: whoopData.avg_hr != null ? whoopData.avg_hr : null,
      max_hr: whoopData.max_hr != null ? whoopData.max_hr : null,
      rolling_3_day_load: whoopData.rolling_3_day_load != null ? whoopData.rolling_3_day_load : null,
      rolling_7_day_load: whoopData.rolling_7_day_load != null ? whoopData.rolling_7_day_load : null,
      // Workouts — array of { sport_id, strain, duration_min, avg_hr, max_hr, kilojoules, hr_zones }
      workouts: Array.isArray(whoopData.workouts) ? whoopData.workouts : null,
      // Grappling session context (manual/structured input)
      grappling_session: whoopData.grappling_session || null,
      // { type: 'bjj'|'wrestling'|'conditioning'|'walking', intensity: 'light'|'moderate'|'hard',
      //   duration_min, rounds, notes, techniques_practiced: [], sparring: boolean }
      // Subjective context (manual input)
      subjective: whoopData.subjective || null,
      // { mood: 1-5, perceived_exertion: 1-10, notes: string }
      // Provenance
      data_source: whoopData.data_source || whoopData.source || 'unknown',
      // 'whoop_api' | 'whoop_csv' | 'manual' | 'debug' | 'mcp'
      stored_at: new Date().toISOString()
    };
    if (idx >= 0) { history[idx] = entry; } else { history.push(entry); }
    history.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    // Cap at 365 days
    if (history.length > 365) history = history.slice(history.length - 365);
    saveHistory(history);
    return entry;
  }

  // ─── DERIVED FEATURES ──────────────────────────────────────────────────────
  // Grappling-oriented feature generation from WHOOP history.

  function deriveFeatures(history) {
    if (!history || history.length === 0) return null;
    var today = history[history.length - 1];
    var n = history.length;

    // Rolling averages
    var recoveries = history.map(function (d) { return d.recovery_score; }).filter(function (v) { return v != null; });
    var hrvs = history.map(function (d) { return d.hrv_ms; }).filter(function (v) { return v != null; });
    var strains = history.map(function (d) { return d.daily_strain; }).filter(function (v) { return v != null; });
    var sleepHours = history.map(function (d) { return d.sleep_hours; }).filter(function (v) { return v != null; });
    var sleepPerfs = history.map(function (d) { return d.sleep_performance_pct; }).filter(function (v) { return v != null; });

    function avg(arr) { if (!arr.length) return null; return arr.reduce(function (s, v) { return s + v; }, 0) / arr.length; }
    function last(arr, k) { return arr.slice(Math.max(0, arr.length - k)); }
    function stddev(arr) {
      if (arr.length < 2) return null;
      var m = avg(arr);
      var sq = arr.reduce(function (s, v) { return s + (v - m) * (v - m); }, 0) / (arr.length - 1);
      return Math.sqrt(sq);
    }

    var recoveryMean = avg(recoveries);
    var recoveryStd = stddev(recoveries);
    var hrvMean = avg(hrvs);
    var hrvStd = stddev(hrvs);
    var strainMean = avg(strains);
    var sleepMean = avg(sleepHours);

    // Recent windows
    var recent3Recovery = avg(last(recoveries, 3));
    var recent7Recovery = avg(last(recoveries, 7));
    var recent3Strain = avg(last(strains, 3));
    var recent7Strain = avg(last(strains, 7));
    var recent3Sleep = avg(last(sleepHours, 3));
    var recent3HRV = avg(last(hrvs, 3));

    // Flags
    var lowRecoveryDay = today.recovery_score != null && recoveryMean != null && recoveryStd != null
      ? today.recovery_score < (recoveryMean - 0.5 * recoveryStd)
      : (today.recovery_score != null && today.recovery_score < 34);

    var hrvBelowBaseline = today.hrv_ms != null && hrvMean != null && hrvStd != null
      ? today.hrv_ms < (hrvMean - 0.5 * hrvStd)
      : false;

    var highStrainYesterday = n >= 2 && history[n - 2].daily_strain != null && strainMean != null
      ? history[n - 2].daily_strain > strainMean + (stddev(strains) || 2)
      : false;

    // Sleep debt: 3-day average below personal mean
    var sleepDebtStreak = recent3Sleep != null && sleepMean != null
      ? recent3Sleep < (sleepMean - 0.5)
      : false;

    // Back-to-back hard days (strain above mean for 2+ consecutive recent days)
    var backToBackHard = false;
    if (n >= 2 && strainMean != null) {
      var s1 = history[n - 1].daily_strain;
      var s2 = history[n - 2].daily_strain;
      if (s1 != null && s2 != null && s1 > strainMean && s2 > strainMean) backToBackHard = true;
    }

    // Sleep detail features (when available)
    var swsArr = history.map(function (d) { return d.sws_hours; }).filter(function (v) { return v != null; });
    var remArr = history.map(function (d) { return d.rem_hours; }).filter(function (v) { return v != null; });
    var effArr = history.map(function (d) { return d.sleep_efficiency_pct; }).filter(function (v) { return v != null; });
    var hasSleepDetail = swsArr.length >= 3;
    var swsMean = avg(swsArr);
    var remMean = avg(remArr);
    var effMean = avg(effArr);

    // Sleep quality ratio: SWS+REM as proportion of total sleep
    var todayDeepRatio = null;
    if (today.sws_hours != null && today.rem_hours != null && today.sleep_hours != null && today.sleep_hours > 0) {
      todayDeepRatio = (today.sws_hours + today.rem_hours) / today.sleep_hours;
    }
    var baselineDeepRatio = null;
    if (swsMean != null && remMean != null && sleepMean != null && sleepMean > 0) {
      baselineDeepRatio = (swsMean + remMean) / sleepMean;
    }
    var lowDeepSleepToday = todayDeepRatio != null && baselineDeepRatio != null
      ? todayDeepRatio < baselineDeepRatio - 0.05  // 5% below baseline ratio
      : false;

    // Workout detail features
    var todayWorkouts = today.workouts || [];
    var hasWorkoutDetail = todayWorkouts.length > 0;
    var grapplingWorkouts = todayWorkouts.filter(function (w) {
      // WHOOP sport_id: 43=Wrestling, 44=Brazilian Jiu Jitsu, 84=Martial Arts
      return w.sport_id === 43 || w.sport_id === 44 || w.sport_id === 84;
    });
    var hasGrapplingWorkout = grapplingWorkouts.length > 0;
    var workoutTotalStrain = todayWorkouts.reduce(function (s, w) { return s + (w.strain || 0); }, 0);
    var highHRWorkouts = todayWorkouts.filter(function (w) { return w.max_hr != null && w.max_hr > 180; });

    // Grappling session context (manual/structured — richer than workout auto-detect)
    var hasGrapplingSession = today.grappling_session != null;
    var sessionType = hasGrapplingSession ? today.grappling_session.type : null;
    var sessionIntensity = hasGrapplingSession ? today.grappling_session.intensity : null;
    var sessionSparring = hasGrapplingSession && today.grappling_session.sparring === true;

    // Subjective context
    var hasSubjective = today.subjective != null;
    var subjectiveMood = hasSubjective ? today.subjective.mood : null;
    var subjectiveRPE = hasSubjective ? today.subjective.perceived_exertion : null;

    // Suggested training intensity based on recovery + all available context
    var suggestedIntensity = 'moderate';
    var intensityReasons = [];
    if (lowRecoveryDay) { suggestedIntensity = 'light'; intensityReasons.push('recovery below baseline'); }
    if (sleepDebtStreak) { suggestedIntensity = 'light'; intensityReasons.push('3-day sleep debt'); }
    if (lowDeepSleepToday) { intensityReasons.push('deep sleep (SWS+REM) ratio below baseline'); }
    if (backToBackHard) { intensityReasons.push('back-to-back high-strain days'); if (suggestedIntensity !== 'light') suggestedIntensity = 'moderate'; }
    if (today.recovery_score != null && today.recovery_score >= 67 && !backToBackHard && !sleepDebtStreak) {
      suggestedIntensity = 'hard';
      intensityReasons.push('recovery green and load manageable');
    }
    // Subjective override: high RPE + low mood → don't push
    if (subjectiveRPE != null && subjectiveRPE >= 8 && subjectiveMood != null && subjectiveMood <= 2) {
      if (suggestedIntensity === 'hard') suggestedIntensity = 'moderate';
      intensityReasons.push('subjective: high exertion + low mood');
    }

    // Suggested focus type
    var suggestedFocus = 'technique';
    if (suggestedIntensity === 'hard') suggestedFocus = 'sparring';
    else if (suggestedIntensity === 'light') suggestedFocus = 'drilling';

    // Data provenance tracking
    var provenanceSources = {};
    history.forEach(function (d) {
      var src = d.data_source || 'unknown';
      provenanceSources[src] = (provenanceSources[src] || 0) + 1;
    });

    // Evidence field availability — explicit tracking
    var evidenceFields = {
      // Always expected
      recovery: recoveries.length,
      hrv: hrvs.length,
      strain: strains.length,
      sleep_hours: sleepHours.length,
      sleep_performance: sleepPerfs.length,
      resting_hr: history.filter(function (d) { return d.resting_hr != null; }).length,
      // Richer fields (may be 0 if not available)
      sws: swsArr.length,
      rem: remArr.length,
      sleep_efficiency: effArr.length,
      spo2: history.filter(function (d) { return d.spo2_pct != null; }).length,
      skin_temp: history.filter(function (d) { return d.skin_temp_c != null; }).length,
      respiratory_rate: history.filter(function (d) { return d.respiratory_rate != null; }).length,
      workouts: history.filter(function (d) { return d.workouts != null; }).length,
      grappling_sessions: history.filter(function (d) { return d.grappling_session != null; }).length,
      subjective: history.filter(function (d) { return d.subjective != null; }).length
    };

    return {
      date: today.date,
      days_of_data: n,

      // Today's raw
      today_recovery: today.recovery_score,
      today_hrv: today.hrv_ms,
      today_strain: today.daily_strain,
      today_sleep_hours: today.sleep_hours,
      today_sleep_performance: today.sleep_performance_pct,
      today_resting_hr: today.resting_hr,
      today_readiness: today.readiness_state,

      // Today's richer data (null when not available)
      today_sws_hours: today.sws_hours || null,
      today_rem_hours: today.rem_hours || null,
      today_sleep_efficiency: today.sleep_efficiency_pct || null,
      today_deep_sleep_ratio: todayDeepRatio != null ? Math.round(todayDeepRatio * 1000) / 1000 : null,
      today_respiratory_rate: today.respiratory_rate || null,
      today_spo2: today.spo2_pct || null,

      // Baselines
      baseline_recovery_mean: recoveryMean != null ? Math.round(recoveryMean * 10) / 10 : null,
      baseline_recovery_std: recoveryStd != null ? Math.round(recoveryStd * 10) / 10 : null,
      baseline_hrv_mean: hrvMean != null ? Math.round(hrvMean * 10) / 10 : null,
      baseline_hrv_std: hrvStd != null ? Math.round(hrvStd * 10) / 10 : null,
      baseline_strain_mean: strainMean != null ? Math.round(strainMean * 10) / 10 : null,
      baseline_sleep_mean: sleepMean != null ? Math.round(sleepMean * 10) / 10 : null,
      baseline_sws_mean: swsMean != null ? Math.round(swsMean * 100) / 100 : null,
      baseline_rem_mean: remMean != null ? Math.round(remMean * 100) / 100 : null,
      baseline_sleep_efficiency_mean: effMean != null ? Math.round(effMean * 10) / 10 : null,
      baseline_deep_ratio: baselineDeepRatio != null ? Math.round(baselineDeepRatio * 1000) / 1000 : null,

      // Recent windows
      recent_3d_recovery: recent3Recovery != null ? Math.round(recent3Recovery * 10) / 10 : null,
      recent_7d_recovery: recent7Recovery != null ? Math.round(recent7Recovery * 10) / 10 : null,
      recent_3d_strain: recent3Strain != null ? Math.round(recent3Strain * 10) / 10 : null,
      recent_7d_strain: recent7Strain != null ? Math.round(recent7Strain * 10) / 10 : null,
      recent_3d_sleep: recent3Sleep != null ? Math.round(recent3Sleep * 10) / 10 : null,
      recent_3d_hrv: recent3HRV != null ? Math.round(recent3HRV * 10) / 10 : null,

      // Flags
      flag_low_recovery: lowRecoveryDay,
      flag_hrv_below_baseline: hrvBelowBaseline,
      flag_high_strain_yesterday: highStrainYesterday,
      flag_sleep_debt_streak: sleepDebtStreak,
      flag_back_to_back_hard: backToBackHard,
      flag_low_deep_sleep: lowDeepSleepToday,

      // Workout detail (when available)
      has_workout_detail: hasWorkoutDetail,
      has_grappling_workout: hasGrapplingWorkout,
      workout_count: todayWorkouts.length,
      workout_total_strain: workoutTotalStrain > 0 ? Math.round(workoutTotalStrain * 10) / 10 : null,
      high_hr_workouts: highHRWorkouts.length,

      // Grappling session context (when available)
      has_grappling_session: hasGrapplingSession,
      session_type: sessionType,
      session_intensity: sessionIntensity,
      session_sparring: sessionSparring,

      // Subjective (when available)
      has_subjective: hasSubjective,
      subjective_mood: subjectiveMood,
      subjective_rpe: subjectiveRPE,

      // Recommendations
      suggested_intensity: suggestedIntensity,
      suggested_focus: suggestedFocus,
      intensity_reasons: intensityReasons,

      // Evidence audit — how many days have each field
      evidence_fields: evidenceFields,
      provenance: provenanceSources,

      // Missing data markers
      missing: {
        grappling_sessions: !hasGrapplingSession,
        grappling_workout: !hasGrapplingWorkout,
        sleep_data: today.sleep_hours == null,
        sleep_detail: today.sws_hours == null,
        strain_data: today.daily_strain == null,
        hrv_data: today.hrv_ms == null,
        workout_detail: !hasWorkoutDetail,
        subjective_data: !hasSubjective,
        insufficient_history: n < 7
      }
    };
  }

  // ─── INSIGHT GENERATION PIPELINE ───────────────────────────────────────────
  // Generates CANDIDATE insights from the full history. Conservative. Preserves uncertainty.

  function generateInsightCandidates(history) {
    if (!history || history.length < 7) return []; // need minimum data
    var candidates = [];
    var features = deriveFeatures(history);
    if (!features) return [];

    var evidenceWindow = {
      start: history[0].date,
      end: history[history.length - 1].date,
      days: history.length
    };
    var ef = features.evidence_fields; // shorthand

    // --- Pattern 1: Low recovery correlated with sleep debt ---
    var lowRecDays = history.filter(function (d) {
      return d.recovery_score != null && d.recovery_score < 34;
    });
    var lowRecWithBadSleep = lowRecDays.filter(function (d) {
      return d.sleep_hours != null && features.baseline_sleep_mean != null && d.sleep_hours < features.baseline_sleep_mean - 0.5;
    });
    if (lowRecDays.length >= 3) {
      var sleepCorrelation = lowRecDays.length > 0 ? lowRecWithBadSleep.length / lowRecDays.length : 0;
      candidates.push(createInsight({
        title: 'Low recovery days and sleep',
        rule: sleepCorrelation > 0.6
          ? 'Low recovery days are frequently preceded by below-average sleep.'
          : 'Low recovery days show mixed sleep patterns — sleep alone does not fully explain low recovery.',
        context: 'Recovery interpretation',
        classification: sleepCorrelation > 0.6 ? INSIGHT_CLASS.OBSERVED_PATTERN : INSIGHT_CLASS.WORKING_HYPOTHESIS,
        evidence_window: evidenceWindow,
        supporting_facts: [
          lowRecDays.length + ' low-recovery days observed in ' + history.length + ' days.',
          Math.round(sleepCorrelation * 100) + '% of low-recovery days had below-average sleep.',
          'Average sleep on low-recovery days: ' + (lowRecWithBadSleep.length > 0
            ? Math.round(avg(lowRecWithBadSleep.map(function (d) { return d.sleep_hours; })) * 10) / 10 + 'h'
            : 'insufficient data')
        ],
        counterpoints: sleepCorrelation <= 0.6
          ? ['Some low-recovery days had adequate sleep — other factors (strain, stress) likely contribute.']
          : [],
        confidence: Math.min(0.85, 0.4 + sleepCorrelation * 0.45),
        evidence_fields_used: ['recovery', 'sleep_hours'],
        evidence_fields_missing: ef.sws === 0 ? ['sws', 'rem', 'sleep_efficiency'] : [],
        data_provenance: { sources: features.provenance, days: history.length },
        what_would_increase_confidence: [
          'More data points (currently ' + lowRecDays.length + ' low-recovery days).',
          ef.sws === 0 ? 'Sleep stage data (SWS/REM) to distinguish shallow vs deep sleep deficit.' : null,
          ef.grappling_sessions === 0 ? 'Grappling session intensity data to separate physical vs external stressors.' : null
        ].filter(Boolean),
        tags: ['recovery', 'sleep']
      }));
    }

    // --- Pattern 2: High strain preceding suppressed HRV ---
    var daysWithBothMetrics = [];
    for (var i = 1; i < history.length; i++) {
      if (history[i - 1].daily_strain != null && history[i].hrv_ms != null) {
        daysWithBothMetrics.push({ strain: history[i - 1].daily_strain, nextHRV: history[i].hrv_ms });
      }
    }
    if (daysWithBothMetrics.length >= 7) {
      var highStrainDays = daysWithBothMetrics.filter(function (d) {
        return features.baseline_strain_mean != null && d.strain > features.baseline_strain_mean;
      });
      var highStrainLowHRV = highStrainDays.filter(function (d) {
        return features.baseline_hrv_mean != null && d.nextHRV < features.baseline_hrv_mean;
      });
      var strainHRVCorrelation = highStrainDays.length > 0 ? highStrainLowHRV.length / highStrainDays.length : 0;

      if (highStrainDays.length >= 3) {
        candidates.push(createInsight({
          title: 'High strain and next-day HRV',
          rule: strainHRVCorrelation > 0.55
            ? 'Above-average strain days tend to suppress next-day HRV.'
            : 'Strain-to-HRV relationship is inconsistent — recovery tolerance may vary.',
          context: 'Strain management',
          classification: strainHRVCorrelation > 0.55 ? INSIGHT_CLASS.OBSERVED_PATTERN : INSIGHT_CLASS.WORKING_HYPOTHESIS,
          evidence_window: evidenceWindow,
          supporting_facts: [
            highStrainDays.length + ' above-average strain days analyzed.',
            Math.round(strainHRVCorrelation * 100) + '% followed by below-average HRV.',
            'Baseline strain: ' + features.baseline_strain_mean + ', baseline HRV: ' + features.baseline_hrv_mean + 'ms.'
          ],
          counterpoints: strainHRVCorrelation <= 0.55
            ? ['Many high-strain days still had normal next-day HRV — individual recovery capacity varies.']
            : [],
          confidence: Math.min(0.8, 0.35 + strainHRVCorrelation * 0.45),
          evidence_fields_used: ['daily_strain', 'hrv'],
          evidence_fields_missing: ef.workouts === 0 ? ['workouts', 'hr_zones'] : [],
          data_provenance: { sources: features.provenance, days: history.length },
          what_would_increase_confidence: [
            ef.workouts === 0 ? 'Workout detail: grappling vs conditioning may affect HRV differently.' : null,
            ef.grappling_sessions === 0 ? 'Grappling session context for strain interpretation.' : null,
            'Longer time window to establish consistency.'
          ].filter(Boolean),
          tags: ['strain', 'hrv', 'recovery']
        }));
      }
    }

    // --- Pattern 3: Back-to-back hard days and recovery trajectory ---
    var consecutiveHardPairs = [];
    for (var j = 2; j < history.length; j++) {
      var d1 = history[j - 2], d2 = history[j - 1], d3 = history[j];
      if (d1.daily_strain != null && d2.daily_strain != null && d3.recovery_score != null &&
          features.baseline_strain_mean != null) {
        if (d1.daily_strain > features.baseline_strain_mean && d2.daily_strain > features.baseline_strain_mean) {
          consecutiveHardPairs.push({ day3Recovery: d3.recovery_score });
        }
      }
    }
    if (consecutiveHardPairs.length >= 2) {
      var avgRecoveryAfterB2B = avg(consecutiveHardPairs.map(function (d) { return d.day3Recovery; }));
      var belowBaseline = features.baseline_recovery_mean != null && avgRecoveryAfterB2B < features.baseline_recovery_mean;

      candidates.push(createInsight({
        title: 'Back-to-back hard days impact',
        rule: belowBaseline
          ? 'Two consecutive high-strain days tend to suppress third-day recovery.'
          : 'Back-to-back hard days do not consistently suppress recovery — possibly well-adapted.',
        context: 'Training load management',
        classification: belowBaseline ? INSIGHT_CLASS.OBSERVED_PATTERN : INSIGHT_CLASS.WORKING_HYPOTHESIS,
        evidence_window: evidenceWindow,
        supporting_facts: [
          consecutiveHardPairs.length + ' back-to-back hard day pairs found.',
          'Average recovery on day 3: ' + Math.round(avgRecoveryAfterB2B) + '%.',
          'Personal baseline recovery: ' + features.baseline_recovery_mean + '%.'
        ],
        counterpoints: !belowBaseline
          ? ['Recovery after hard pairs is near baseline — may indicate good conditioning.']
          : ['Small sample size limits confidence.'],
        confidence: Math.min(0.7, 0.3 + consecutiveHardPairs.length * 0.1),
        evidence_fields_used: ['daily_strain', 'recovery'],
        evidence_fields_missing: ef.grappling_sessions === 0 ? ['grappling_sessions', 'workouts'] : [],
        data_provenance: { sources: features.provenance, days: history.length },
        what_would_increase_confidence: [
          'More back-to-back pairs (currently ' + consecutiveHardPairs.length + ').',
          ef.grappling_sessions === 0 ? 'Grappling session data to confirm "hard" means grappling, not just high-strain cardio.' : null,
          ef.workouts === 0 ? 'Workout-level detail to distinguish session types.' : null
        ].filter(Boolean),
        tags: ['strain', 'recovery', 'load-management']
      }));
    }

    // --- Pattern 4: Sleep performance trend ---
    var sleepPerfDays = history.filter(function (d) { return d.sleep_performance_pct != null; });
    if (sleepPerfDays.length >= 14) {
      var firstHalf = sleepPerfDays.slice(0, Math.floor(sleepPerfDays.length / 2));
      var secondHalf = sleepPerfDays.slice(Math.floor(sleepPerfDays.length / 2));
      var firstAvg = avg(firstHalf.map(function (d) { return d.sleep_performance_pct; }));
      var secondAvg = avg(secondHalf.map(function (d) { return d.sleep_performance_pct; }));
      var trend = secondAvg - firstAvg;

      if (Math.abs(trend) > 3) {
        candidates.push(createInsight({
          title: 'Sleep performance trend',
          rule: trend > 0
            ? 'Sleep performance is trending upward (' + Math.round(trend) + '% improvement).'
            : 'Sleep performance is trending downward (' + Math.round(Math.abs(trend)) + '% decline).',
          context: 'Sleep quality tracking',
          classification: INSIGHT_CLASS.FACT,
          evidence_window: evidenceWindow,
          supporting_facts: [
            'First half average: ' + Math.round(firstAvg) + '%.',
            'Second half average: ' + Math.round(secondAvg) + '%.',
            'Based on ' + sleepPerfDays.length + ' days of sleep data.'
          ],
          counterpoints: [],
          confidence: 0.9,
          evidence_fields_used: ['sleep_performance'],
          evidence_fields_missing: ef.sws === 0 ? ['sws', 'rem'] : [],
          data_provenance: { sources: features.provenance, days: history.length },
          what_would_increase_confidence: ef.sws === 0
            ? ['Sleep stage data (SWS/REM) would reveal whether the trend is driven by deep sleep changes.']
            : [],
          tags: ['sleep', 'trend']
        }));
      }
    }

    // --- Pattern 5: Deep sleep quality and recovery (only when sleep detail available) ---
    if (ef.sws >= 7 && ef.rem >= 7) {
      var daysWithSleepAndRecovery = history.filter(function (d) {
        return d.sws_hours != null && d.rem_hours != null && d.sleep_hours != null && d.sleep_hours > 0 && d.recovery_score != null;
      });
      if (daysWithSleepAndRecovery.length >= 7) {
        var deepRatios = daysWithSleepAndRecovery.map(function (d) {
          return { ratio: (d.sws_hours + d.rem_hours) / d.sleep_hours, recovery: d.recovery_score };
        });
        var medianRatio = deepRatios.map(function (d) { return d.ratio; }).sort()[Math.floor(deepRatios.length / 2)];
        var aboveMedian = deepRatios.filter(function (d) { return d.ratio >= medianRatio; });
        var belowMedian = deepRatios.filter(function (d) { return d.ratio < medianRatio; });
        var avgRecAbove = avg(aboveMedian.map(function (d) { return d.recovery; }));
        var avgRecBelow = avg(belowMedian.map(function (d) { return d.recovery; }));
        var recoveryGap = avgRecAbove - avgRecBelow;

        if (Math.abs(recoveryGap) > 5) {
          candidates.push(createInsight({
            title: 'Deep sleep ratio and recovery',
            rule: recoveryGap > 0
              ? 'Nights with higher deep sleep ratio (SWS+REM) are associated with ' + Math.round(recoveryGap) + '% higher next-day recovery.'
              : 'Deep sleep ratio does not clearly predict recovery — other factors dominate.',
            context: 'Sleep quality and recovery',
            classification: recoveryGap > 0 && recoveryGap > 8 ? INSIGHT_CLASS.OBSERVED_PATTERN : INSIGHT_CLASS.WORKING_HYPOTHESIS,
            evidence_window: evidenceWindow,
            supporting_facts: [
              daysWithSleepAndRecovery.length + ' days with full sleep stage + recovery data.',
              'Above-median deep ratio: avg recovery ' + Math.round(avgRecAbove) + '%.',
              'Below-median deep ratio: avg recovery ' + Math.round(avgRecBelow) + '%.',
              'Median deep sleep ratio: ' + Math.round(medianRatio * 100) + '%.'
            ],
            counterpoints: recoveryGap <= 8
              ? ['Gap is small (' + Math.round(recoveryGap) + '%) — may not be practically significant.']
              : [],
            confidence: Math.min(0.8, 0.35 + Math.abs(recoveryGap) / 30),
            evidence_fields_used: ['sws', 'rem', 'sleep_hours', 'recovery'],
            evidence_fields_missing: ef.respiratory_rate === 0 ? ['respiratory_rate'] : [],
            data_provenance: { sources: features.provenance, days: history.length },
            what_would_increase_confidence: [
              'Respiratory rate data to cross-validate sleep quality assessment.',
              ef.grappling_sessions === 0 ? 'Grappling session data to control for training intensity effects.' : null
            ].filter(Boolean),
            tags: ['sleep', 'recovery', 'sleep-stages']
          }));
        }
      }
    }

    // --- Pattern 6: Grappling workout strain vs general conditioning (when workout detail available) ---
    if (ef.workouts >= 7) {
      var daysWithWorkouts = history.filter(function (d) { return d.workouts != null && d.workouts.length > 0; });
      var grapplingDays = daysWithWorkouts.filter(function (d) {
        return d.workouts.some(function (w) { return w.sport_id === 43 || w.sport_id === 44 || w.sport_id === 84; });
      });
      var nonGrapplingDays = daysWithWorkouts.filter(function (d) {
        return !d.workouts.some(function (w) { return w.sport_id === 43 || w.sport_id === 44 || w.sport_id === 84; });
      });
      if (grapplingDays.length >= 3 && nonGrapplingDays.length >= 3) {
        var avgGrapplingStrain = avg(grapplingDays.map(function (d) { return d.daily_strain; }).filter(Boolean));
        var avgNonGrapplingStrain = avg(nonGrapplingDays.map(function (d) { return d.daily_strain; }).filter(Boolean));
        if (avgGrapplingStrain != null && avgNonGrapplingStrain != null) {
          var strainDiff = avgGrapplingStrain - avgNonGrapplingStrain;
          candidates.push(createInsight({
            title: 'Grappling vs non-grappling strain comparison',
            rule: Math.abs(strainDiff) > 1
              ? 'Grappling days average ' + Math.round(Math.abs(strainDiff) * 10) / 10 + ' ' + (strainDiff > 0 ? 'higher' : 'lower') + ' strain than non-grappling training days.'
              : 'Grappling and non-grappling days produce similar strain levels.',
            context: 'Training load characterization',
            classification: INSIGHT_CLASS.FACT,
            evidence_window: evidenceWindow,
            supporting_facts: [
              grapplingDays.length + ' grappling days, ' + nonGrapplingDays.length + ' non-grappling days.',
              'Avg grappling strain: ' + Math.round(avgGrapplingStrain * 10) / 10 + '.',
              'Avg non-grappling strain: ' + Math.round(avgNonGrapplingStrain * 10) / 10 + '.'
            ],
            counterpoints: [],
            confidence: 0.85,
            evidence_fields_used: ['workouts', 'daily_strain'],
            evidence_fields_missing: ef.grappling_sessions === 0 ? ['grappling_sessions'] : [],
            data_provenance: { sources: features.provenance, days: history.length },
            what_would_increase_confidence: [
              ef.grappling_sessions === 0 ? 'Manual grappling session context (sparring vs drilling, rounds).' : null
            ].filter(Boolean),
            tags: ['strain', 'grappling', 'workout-type']
          }));
        }
      }
    }

    return candidates;
  }

  function avg(arr) {
    if (!arr || !arr.length) return null;
    return arr.reduce(function (s, v) { return s + v; }, 0) / arr.length;
  }

  // ─── INSIGHT STORE ─────────────────────────────────────────────────────────

  function loadInsights() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY_INSIGHTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveInsights(insights) {
    try { localStorage.setItem(STORAGE_KEY_INSIGHTS, JSON.stringify(insights)); }
    catch (e) { /* storage full */ }
  }

  function loadApprovedRules() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY_RULES);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveApprovedRules(rules) {
    try { localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules)); }
    catch (e) { /* storage full */ }
  }

  // ─── REVIEW/CHALLENGE WORKFLOW ─────────────────────────────────────────────

  function reviewInsight(insightId, action, reason) {
    var insights = loadInsights();
    var rules = loadApprovedRules();
    var found = null;
    for (var i = 0; i < insights.length; i++) {
      if (insights[i].id === insightId) { found = insights[i]; break; }
    }
    if (!found) return { ok: false, error: 'insight_not_found' };

    var now = new Date().toISOString();
    found.review_history.push({ date: now, action: action, reason: reason || '' });
    found.updated_at = now;

    if (action === 'approve') {
      found.status = INSIGHT_STATUS.APPROVED;
      found.approved_for_website = true;
      found.approval_reason = reason || 'Operator approved';
      // Create website-safe rule
      var rule = createApprovedRule(found);
      // Replace if exists
      var ruleIdx = -1;
      for (var r = 0; r < rules.length; r++) {
        if (rules[r].source_insight_id === found.id) { ruleIdx = r; break; }
      }
      if (ruleIdx >= 0) rules[ruleIdx] = rule; else rules.push(rule);
      saveApprovedRules(rules);
    } else if (action === 'reject') {
      found.status = INSIGHT_STATUS.REJECTED;
      found.approved_for_website = false;
      found.rejection_reason = reason || 'Operator rejected';
      // Remove from approved rules if it was there
      rules = rules.filter(function (r) { return r.source_insight_id !== found.id; });
      saveApprovedRules(rules);
    } else if (action === 'challenge') {
      found.status = INSIGHT_STATUS.CHALLENGED;
      if (found.confidence > 0.2) found.confidence -= 0.15;
      found.counterpoints.push(reason || 'Challenged during review');
    } else if (action === 'supersede') {
      found.status = INSIGHT_STATUS.SUPERSEDED;
      found.approved_for_website = false;
      found.superseded_by = reason || null; // reason = new insight ID
    }

    saveInsights(insights);
    return { ok: true, insight: found };
  }

  // ─── RUN PIPELINE ──────────────────────────────────────────────────────────
  // Full pipeline: generates candidates, merges with existing, preserves reviewed ones.

  function runPipeline() {
    var history = loadHistory();
    if (history.length < 7) {
      return {
        ok: true,
        message: 'Insufficient history (' + history.length + ' days). Need at least 7.',
        candidates_generated: 0,
        total_insights: loadInsights().length
      };
    }

    var newCandidates = generateInsightCandidates(history);
    var existing = loadInsights();

    // Merge: don't overwrite reviewed insights. Match by title.
    var existingTitles = {};
    existing.forEach(function (ins) { existingTitles[ins.title] = ins; });

    var added = 0;
    var updated = 0;
    newCandidates.forEach(function (candidate) {
      var prev = existingTitles[candidate.title];
      if (!prev) {
        existing.push(candidate);
        added++;
      } else if (prev.status === INSIGHT_STATUS.CANDIDATE) {
        // Update candidate with fresher analysis, keep ID
        candidate.id = prev.id;
        candidate.created_at = prev.created_at;
        candidate.review_history = prev.review_history;
        for (var k = 0; k < existing.length; k++) {
          if (existing[k].id === prev.id) { existing[k] = candidate; break; }
        }
        updated++;
      }
      // If reviewed/approved/rejected — leave it alone
    });

    saveInsights(existing);

    return {
      ok: true,
      candidates_generated: newCandidates.length,
      added: added,
      updated: updated,
      total_insights: existing.length,
      total_approved_rules: loadApprovedRules().length,
      history_days: history.length
    };
  }

  // ─── WEBSITE-FACING CONSUMPTION LAYER ──────────────────────────────────────
  // Only safe, approved, structured outputs.

  function getDailyCoachingOutput() {
    var history = loadHistory();
    var features = history.length > 0 ? deriveFeatures(history) : null;
    var rules = loadApprovedRules();

    // Build readiness recommendation
    var readiness = { level: 'unknown', label: 'No data', color: '#7f8ba3' };
    if (features && features.today_recovery != null) {
      if (features.today_recovery >= 67) {
        readiness = { level: 'high', label: 'Recovery is green', color: '#34d399' };
      } else if (features.today_recovery >= 34) {
        readiness = { level: 'moderate', label: 'Recovery is moderate', color: '#ffd166' };
      } else {
        readiness = { level: 'low', label: 'Recovery is low', color: '#ff7c70' };
      }
    }

    // Build training recommendation from features
    var training = { intensity: 'moderate', focus: 'technique', reason: 'Default — no WHOOP data available.', reasons: [] };
    if (features) {
      training.intensity = features.suggested_intensity;
      training.focus = features.suggested_focus;
      training.reasons = features.intensity_reasons || [];

      var reasons = [];
      if (features.flag_low_recovery) reasons.push('Recovery is below your personal baseline.');
      if (features.flag_sleep_debt_streak) reasons.push('Sleep has been below average for 3+ days.');
      if (features.flag_low_deep_sleep) reasons.push('Deep sleep ratio was below your baseline.');
      if (features.flag_back_to_back_hard) reasons.push('Two consecutive high-strain days — allow recovery.');
      if (features.flag_hrv_below_baseline) reasons.push('HRV is suppressed below your baseline.');
      if (features.has_subjective && features.subjective_rpe != null && features.subjective_rpe >= 8) {
        reasons.push('Subjective exertion was high recently.');
      }
      if (features.today_recovery >= 67 && !features.flag_back_to_back_hard) {
        reasons.push('Recovery is green and load is manageable.');
      }
      // Context caveat when grappling data is absent
      if (features.missing.grappling_sessions && features.missing.grappling_workout) {
        reasons.push('Note: no grappling session context — intensity suggestion is based on WHOOP metrics only.');
      }
      training.reason = reasons.length > 0 ? reasons.join(' ') : 'Based on current recovery and strain balance.';
    }

    // Collect applicable approved rules
    var applicableRules = rules.filter(function (r) {
      if (!features) return false;
      // Match rules to current state
      var tags = r.context ? r.context.toLowerCase() : '';
      if (tags.indexOf('recovery') !== -1 && features.flag_low_recovery) return true;
      if (tags.indexOf('strain') !== -1 && features.flag_high_strain_yesterday) return true;
      if (tags.indexOf('sleep') !== -1 && features.flag_sleep_debt_streak) return true;
      if (tags.indexOf('load') !== -1 && features.flag_back_to_back_hard) return true;
      return false;
    }).map(function (r) {
      return { title: r.title, rule: r.rule, explanation: r.explanation, confidence: r.confidence };
    });

    return {
      date: features ? features.date : new Date().toISOString().slice(0, 10),
      readiness: readiness,
      training: training,
      applicable_rules: applicableRules,
      data_quality: {
        days_of_history: history.length,
        has_today: features ? true : false,
        evidence_fields: features ? features.evidence_fields : null,
        provenance: features ? features.provenance : null,
        missing: features ? features.missing : {
          grappling_sessions: true, grappling_workout: true, sleep_data: true,
          sleep_detail: true, strain_data: true, hrv_data: true,
          workout_detail: true, subjective_data: true, insufficient_history: true
        }
      }
    };
  }

  function getInsightSummary() {
    var insights = loadInsights();
    var rules = loadApprovedRules();
    return {
      total_insights: insights.length,
      by_status: {
        candidate: insights.filter(function (i) { return i.status === INSIGHT_STATUS.CANDIDATE; }).length,
        revised: insights.filter(function (i) { return i.status === INSIGHT_STATUS.REVISED; }).length,
        challenged: insights.filter(function (i) { return i.status === INSIGHT_STATUS.CHALLENGED; }).length,
        approved: insights.filter(function (i) { return i.status === INSIGHT_STATUS.APPROVED; }).length,
        rejected: insights.filter(function (i) { return i.status === INSIGHT_STATUS.REJECTED; }).length,
        superseded: insights.filter(function (i) { return i.status === INSIGHT_STATUS.SUPERSEDED; }).length
      },
      by_classification: {
        fact: insights.filter(function (i) { return i.classification === INSIGHT_CLASS.FACT; }).length,
        observed_pattern: insights.filter(function (i) { return i.classification === INSIGHT_CLASS.OBSERVED_PATTERN; }).length,
        working_hypothesis: insights.filter(function (i) { return i.classification === INSIGHT_CLASS.WORKING_HYPOTHESIS; }).length,
        tentative_recommendation: insights.filter(function (i) { return i.classification === INSIGHT_CLASS.TENTATIVE_RECOMMENDATION; }).length,
        website_ready: insights.filter(function (i) { return i.classification === INSIGHT_CLASS.WEBSITE_READY_RULE; }).length
      },
      approved_rules_count: rules.length,
      approved_rules: rules
    };
  }

  // ─── MODEL INSIGHT BRIDGE ───────────────────────────────────────────────────
  // Automatic bridge: Claude/ChatGPT MCP analysis → structured candidates → review → website rules.
  // No model output reaches the website without explicit approval.

  var REQUIRED_IMPORT_FIELDS = ['title', 'rule', 'source_model'];

  function validateModelInsight(payload) {
    var errors = [];
    REQUIRED_IMPORT_FIELDS.forEach(function (f) {
      if (!payload[f]) errors.push('missing required field: ' + f);
    });
    if (payload.confidence != null && (payload.confidence < 0 || payload.confidence > 1)) {
      errors.push('confidence must be 0.0–1.0');
    }
    if (payload.classification && !INSIGHT_CLASS[payload.classification] &&
        Object.keys(INSIGHT_CLASS).map(function (k) { return INSIGHT_CLASS[k]; }).indexOf(payload.classification) === -1) {
      errors.push('invalid classification: ' + payload.classification);
    }
    return errors;
  }

  /**
   * importModelInsight(payload) — ingest a structured candidate from Claude/ChatGPT.
   * Always enters as CANDIDATE. Never auto-approved.
   * Returns { ok, insight, errors }.
   */
  function importModelInsight(payload) {
    var errors = validateModelInsight(payload);
    if (errors.length > 0) return { ok: false, errors: errors };

    var insight = createInsight({
      title: payload.title,
      rule: payload.rule,
      context: payload.context || '',
      scope: payload.scope || 'personal',
      classification: payload.classification || INSIGHT_CLASS.WORKING_HYPOTHESIS,
      status: INSIGHT_STATUS.CANDIDATE,    // ALWAYS candidate on import
      evidence_window: payload.evidence_window || null,
      supporting_facts: Array.isArray(payload.supporting_facts) ? payload.supporting_facts : [],
      counterpoints: Array.isArray(payload.counterpoints) ? payload.counterpoints :
                     Array.isArray(payload.counterpoints_or_uncertainties) ? payload.counterpoints_or_uncertainties : [],
      confidence: payload.confidence != null ? Math.max(0, Math.min(1, payload.confidence)) : 0.5,
      approved_for_website: false,          // NEVER auto-approved
      source_model: payload.source_model,
      source_flow: payload.source_flow || 'model-bridge',
      evidence_fields_used: Array.isArray(payload.evidence_fields_used) ? payload.evidence_fields_used : [],
      evidence_fields_missing: Array.isArray(payload.evidence_fields_missing) ? payload.evidence_fields_missing : [],
      data_provenance: payload.data_provenance || null,
      what_would_increase_confidence: Array.isArray(payload.what_would_increase_confidence) ? payload.what_would_increase_confidence : [],
      revised_from: payload.revised_from || null,
      supersedes: payload.supersedes || null,
      tags: Array.isArray(payload.tags) ? payload.tags : []
    });

    var insights = loadInsights();

    // If this supersedes another insight, mark that one
    if (insight.supersedes) {
      for (var i = 0; i < insights.length; i++) {
        if (insights[i].id === insight.supersedes) {
          insights[i].status = INSIGHT_STATUS.SUPERSEDED;
          insights[i].superseded_by = insight.id;
          insights[i].approved_for_website = false;
          insights[i].updated_at = new Date().toISOString();
          // Remove from approved rules
          var rules = loadApprovedRules().filter(function (r) { return r.source_insight_id !== insights[i].id; });
          saveApprovedRules(rules);
          break;
        }
      }
    }

    insights.push(insight);
    saveInsights(insights);
    return { ok: true, insight: insight };
  }

  /**
   * importModelInsightBatch(payloads) — ingest multiple candidates at once.
   */
  function importModelInsightBatch(payloads) {
    if (!Array.isArray(payloads)) return { ok: false, errors: ['payloads must be an array'] };
    var results = payloads.map(function (p) { return importModelInsight(p); });
    return {
      ok: results.every(function (r) { return r.ok; }),
      imported: results.filter(function (r) { return r.ok; }).length,
      failed: results.filter(function (r) { return !r.ok; }).length,
      results: results
    };
  }

  /**
   * challengeInsight(id, challengerModel, notes) — a second model challenges a candidate.
   * Records the challenge with provenance. Reduces confidence. Does NOT reject.
   */
  function challengeInsight(insightId, challengerModel, notes) {
    var insights = loadInsights();
    var found = null;
    for (var i = 0; i < insights.length; i++) {
      if (insights[i].id === insightId) { found = insights[i]; break; }
    }
    if (!found) return { ok: false, error: 'insight_not_found' };
    if (found.status === INSIGHT_STATUS.APPROVED) return { ok: false, error: 'cannot_challenge_approved_insight' };

    var now = new Date().toISOString();
    found.status = INSIGHT_STATUS.CHALLENGED;
    found.updated_at = now;
    found.reviewed_at = now;
    found.reviewed_by = challengerModel || 'unknown';
    if (found.confidence > 0.15) found.confidence = Math.round((found.confidence - 0.15) * 100) / 100;
    found.challenge_notes.push({
      model: challengerModel || 'unknown',
      date: now,
      note: notes || 'Challenged without specific notes.'
    });
    found.counterpoints.push((challengerModel || 'Reviewer') + ': ' + (notes || 'Challenged.'));
    found.review_history.push({ date: now, action: 'challenge', by: challengerModel || 'unknown', reason: notes || '' });

    saveInsights(insights);
    return { ok: true, insight: found };
  }

  /**
   * reviseInsight(originalId, revisedPayload) — create a revised version that supersedes the original.
   * The original is marked SUPERSEDED. The revision enters as REVISED (still needs approval).
   */
  function reviseInsight(originalId, revisedPayload) {
    var insights = loadInsights();
    var original = null;
    for (var i = 0; i < insights.length; i++) {
      if (insights[i].id === originalId) { original = insights[i]; break; }
    }
    if (!original) return { ok: false, error: 'original_not_found' };

    // Merge original fields with revisions
    var merged = {};
    var keys = ['title', 'rule', 'context', 'scope', 'classification', 'evidence_window',
                'supporting_facts', 'counterpoints', 'confidence', 'source_model', 'source_flow',
                'what_would_increase_confidence', 'tags'];
    keys.forEach(function (k) { merged[k] = revisedPayload[k] != null ? revisedPayload[k] : original[k]; });
    merged.revised_from = originalId;
    merged.supersedes = originalId;
    merged.status = INSIGHT_STATUS.REVISED; // not candidate, not approved — revised

    var result = importModelInsight(merged);
    if (result.ok) {
      // Override status to REVISED (importModelInsight sets CANDIDATE)
      var newInsights = loadInsights();
      for (var j = 0; j < newInsights.length; j++) {
        if (newInsights[j].id === result.insight.id) {
          newInsights[j].status = INSIGHT_STATUS.REVISED;
          newInsights[j].review_history.push({
            date: new Date().toISOString(),
            action: 'revised',
            by: revisedPayload.source_model || original.source_model || 'unknown',
            reason: 'Revised from ' + originalId
          });
          result.insight = newInsights[j];
          break;
        }
      }
      saveInsights(newInsights);
    }
    return result;
  }

  /**
   * approveForWebsite(id, approverReason, approvedBy) — explicit website approval.
   * Only this function promotes an insight into the approved rules store.
   */
  function approveForWebsite(insightId, approverReason, approvedBy) {
    var insights = loadInsights();
    var found = null;
    for (var i = 0; i < insights.length; i++) {
      if (insights[i].id === insightId) { found = insights[i]; break; }
    }
    if (!found) return { ok: false, error: 'insight_not_found' };
    if (found.status === INSIGHT_STATUS.REJECTED) return { ok: false, error: 'cannot_approve_rejected_insight' };

    var now = new Date().toISOString();
    found.status = INSIGHT_STATUS.APPROVED;
    found.approved_for_website = true;
    found.approval_reason = approverReason || 'Approved for website';
    found.reviewed_at = now;
    found.reviewed_by = approvedBy || 'operator';
    found.updated_at = now;
    found.review_history.push({ date: now, action: 'approve', by: approvedBy || 'operator', reason: approverReason || '' });

    saveInsights(insights);

    // Create or update approved rule
    var rules = loadApprovedRules();
    var rule = createApprovedRule(found);
    var ruleIdx = -1;
    for (var r = 0; r < rules.length; r++) {
      if (rules[r].source_insight_id === found.id) { ruleIdx = r; break; }
    }
    if (ruleIdx >= 0) rules[ruleIdx] = rule; else rules.push(rule);
    saveApprovedRules(rules);

    return { ok: true, insight: found, rule: rule };
  }

  /**
   * rejectInsight(id, reason, rejectedBy) — explicit rejection.
   */
  function rejectInsight(insightId, reason, rejectedBy) {
    var insights = loadInsights();
    var found = null;
    for (var i = 0; i < insights.length; i++) {
      if (insights[i].id === insightId) { found = insights[i]; break; }
    }
    if (!found) return { ok: false, error: 'insight_not_found' };

    var now = new Date().toISOString();
    found.status = INSIGHT_STATUS.REJECTED;
    found.approved_for_website = false;
    found.rejection_reason = reason || 'Rejected';
    found.reviewed_at = now;
    found.reviewed_by = rejectedBy || 'operator';
    found.updated_at = now;
    found.review_history.push({ date: now, action: 'reject', by: rejectedBy || 'operator', reason: reason || '' });

    saveInsights(insights);

    // Remove from approved rules if it was there
    var rules = loadApprovedRules().filter(function (r) { return r.source_insight_id !== found.id; });
    saveApprovedRules(rules);

    return { ok: true, insight: found };
  }

  // ─── OPERATOR QUERY FUNCTIONS ──────────────────────────────────────────────

  function getPendingCandidates() {
    return loadInsights().filter(function (i) {
      return i.status === INSIGHT_STATUS.CANDIDATE || i.status === INSIGHT_STATUS.REVISED;
    });
  }

  function getChallengedInsights() {
    return loadInsights().filter(function (i) { return i.status === INSIGHT_STATUS.CHALLENGED; });
  }

  function getInsightById(id) {
    var insights = loadInsights();
    for (var i = 0; i < insights.length; i++) {
      if (insights[i].id === id) return insights[i];
    }
    return null;
  }

  function getInsightsByModel(modelName) {
    return loadInsights().filter(function (i) {
      return i.source_model && i.source_model.toLowerCase().indexOf(modelName.toLowerCase()) !== -1;
    });
  }

  // ─── PUBLIC API ────────────────────────────────────────────────────────────
  // Exposed on window.GrapplingIntelligence for website and operator consumption.

  window.GrapplingIntelligence = {
    // Constants
    INSIGHT_CLASS: INSIGHT_CLASS,
    INSIGHT_STATUS: INSIGHT_STATUS,

    // History management
    appendDay: appendDayToHistory,
    getHistory: loadHistory,
    clearHistory: function () { saveHistory([]); },

    // Feature derivation
    deriveFeatures: function () { return deriveFeatures(loadHistory()); },

    // Pipeline
    runPipeline: runPipeline,

    // Insight store
    getInsights: loadInsights,
    getInsightSummary: getInsightSummary,
    getInsightById: getInsightById,
    getInsightsByModel: getInsightsByModel,

    // Model insight bridge — the core automation path
    importInsight: importModelInsight,
    importInsightBatch: importModelInsightBatch,
    challengeInsight: challengeInsight,
    reviseInsight: reviseInsight,
    approveForWebsite: approveForWebsite,
    rejectInsight: rejectInsight,

    // Legacy review (still works, wraps the above)
    reviewInsight: reviewInsight,

    // Operator queries
    getPendingCandidates: getPendingCandidates,
    getChallengedInsights: getChallengedInsights,

    // Approved rules
    getApprovedRules: loadApprovedRules,

    // Website-facing safe consumption
    getDailyCoaching: getDailyCoachingOutput,

    // Debug / operator
    _generateCandidates: function () { return generateInsightCandidates(loadHistory()); },
    _createInsight: createInsight,
    _validatePayload: validateModelInsight
  };

})();
