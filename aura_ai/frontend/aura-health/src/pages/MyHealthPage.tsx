import { useState, useEffect } from "react";
import { useStore, OrganScore } from "@/store/useStore";
import DashboardLayout from "@/components/DashboardLayout";
import OrganDetailModal from "@/components/OrganDetailModal";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  TbHeart,
  TbLungs,
  TbDroplet,
  TbStethoscope,
  TbBrain,
  TbActivityHeartbeat,
  TbArrowRight,
  TbShieldCheck,
  TbRefresh,
  TbCheck,
  TbAlertCircle,
  TbScale,
  TbSparkles,
  TbFileAnalytics,
  TbAward,
  TbActivity
} from "react-icons/tb";

export default function MyHealthPage() {
  const clinicalAssessmentState = useStore((s) => s.clinicalAssessmentState);
  const report = useStore((s) => s.report);
  const wellnessData = useStore((s) => s.wellnessData);
  const passportData = useStore((s) => s.passportData);
  const lifestyleData = useStore((s) => s.lifestyleData);
  const user = useStore((s) => s.user);
  const loading = useStore((s) => s.loading);
  const runSimulation = useStore((s) => s.runSimulation);
  const medicalRecords = useStore((s) => s.medicalRecords);
  const lifestyleAIInterpretation = useStore((s) => s.lifestyleAIInterpretation);
  const isAIInterpretationLoading = useStore((s) => s.isAIInterpretationLoading);
  const fetchLifestyleAIInterpretation = useStore((s) => s.fetchLifestyleAIInterpretation);

  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);

  // Auto-run simulation on mount if state is empty
  useEffect(() => {
    if (!clinicalAssessmentState) {
      runSimulation();
    }
  }, [clinicalAssessmentState, runSimulation]);

  const organIcons: Record<string, any> = {
    heart: TbHeart,
    lungs: TbLungs,
    liver: TbDroplet,
    kidneys: TbStethoscope,
    brain: TbBrain
  };

  const organFormulas: Record<string, string> = {
    heart: "AHA PREVENT™ 2023 Guidelines",
    kidneys: "CKD-EPI 2021 Race-Free eGFR",
    liver: "FIB-4 Index / MELD-Na Protocol",
    lungs: "GOLD 2026 Spirometry Grading",
    brain: "CHA₂DS₂-VASc Stroke Risk"
  };

  const organDescriptions: Record<string, string> = {
    heart: "Cardiovascular output, blood pressure metrics, and heart rate variability.",
    lungs: "Pulmonary oxygen exchange efficiency and respiratory capacity.",
    liver: "Hepatic metabolic synthesis, enzyme processing, and detox efficiency.",
    kidneys: "Renal filtration rate, electrolyte balance, and fluid regulation.",
    brain: "Neuro-cognitive activity index, sleep recovery, and stress resilience."
  };

  const getRiskBadge = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "low":
      case "healthy":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "moderate":
      case "borderline":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "high":
      case "critical":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  const masterInsights = clinicalAssessmentState?.organ_insights || report?.organ_insights;
  const activeWellness = wellnessData || clinicalAssessmentState?.wellness_assessment;
  const passportLevel = clinicalAssessmentState?.passport_level ?? passportData?.passport_level ?? 1;
  const passportTitle = clinicalAssessmentState?.passport_title ?? passportData?.passport_title ?? "Level 1 — Emergency Health Passport";
  const reportCount = clinicalAssessmentState?.uploaded_reports_count ?? (medicalRecords || []).length;

  const selectedData = selectedOrgan && masterInsights
    ? (masterInsights[selectedOrgan as keyof typeof masterInsights] as OrganScore)
    : null;

  // General Lifestyle Assessment parameters
  const chronoAge = lifestyleData?.age ?? user?.age ?? 32;
  const bmiVal = lifestyleData?.bmi ?? 22.5;
  let bmiCategory = "Normal Weight";
  if (bmiVal < 18.5) bmiCategory = "Underweight";
  else if (bmiVal >= 25 && bmiVal < 30) bmiCategory = "Overweight";
  else if (bmiVal >= 30) bmiCategory = "Class I/II Obesity";

  const sleepHours = lifestyleData?.sleep ?? 7;
  const activityLevel = lifestyleData?.activity ?? 3;
  const isSmoker = Boolean(lifestyleData?.smoking);
  const isAlcohol = Boolean(lifestyleData?.alcohol);

  const overallWellnessScore = activeWellness?.wellness_score ?? 88;
  const bioAgeEstimate = activeWellness?.lifestyle_biological_age_estimate ?? chronoAge;

  const supportedOrgans = ["heart", "kidneys", "liver", "lungs", "brain"];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Health
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Patient Health Assessment (Lifestyle & Clinical Organ Insights)
            </p>
          </div>

          <button
            onClick={() => runSimulation()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto cursor-pointer"
          >
            <TbRefresh className={`text-base ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Health Assessment</span>
          </button>
        </div>

        {/* 1. Patient Summary */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-500/20 flex-shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "P"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {user?.full_name || "Registered Patient"}
                </h2>
                <span className="text-xs font-semibold text-slate-400">
                  ({chronoAge} yrs, {lifestyleData?.sex || user?.gender || "male"})
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {report?.summary || clinicalAssessmentState?.overall_clinical_status || "Digital Twin physiological baseline active."}
              </p>
              <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 pt-1">
                <span>Patient ID: AURA-{user?.id || "6a71b42f3e54"}</span>
                <span>•</span>
                <span>{reportCount} Clinical Reports Uploaded</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
            <div className="text-right">
              <p className="text-[10px] font-extrabold uppercase text-slate-400">System Risk Status</p>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white capitalize">
                {reportCount > 0 ? (report?.risk_level ?? "Active") : "Lifestyle Baseline"}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border uppercase ${getRiskBadge(reportCount > 0 ? (report?.risk_level as string) : "healthy")}`}>
              {reportCount > 0 ? (report?.risk_level ?? "Active") : "Baseline Active"}
            </span>
          </div>
        </div>

        {/* 2. General Lifestyle Assessment */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <TbSparkles className="text-blue-600 text-xl" />
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  General Lifestyle Assessment
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Calculated from patient intake metrics and registration profile
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              Active
            </span>
          </div>

          {/* Grid of Key Lifestyle Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* Overall Wellness Score */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Overall Wellness</span>
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-slate-800 flex items-center justify-center text-lg">
                  <TbAward />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{overallWellnessScore}</span>
                  <span className="text-xs text-slate-400 font-bold">/ 100</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${overallWellnessScore}%` }}
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Tier: <span className="font-extrabold text-slate-900 dark:text-white">{activeWellness?.overall_lifestyle_tier ?? "Healthy Baseline"}</span>
              </div>
            </div>

            {/* BMI */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">BMI Metric</span>
                <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 dark:bg-slate-800 flex items-center justify-center text-lg">
                  <TbScale />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{bmiVal}</span>
                  <span className="text-xs text-purple-700 dark:text-purple-400 font-extrabold">{bmiCategory}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Sleep: {sleepHours}h • Activity: L{activityLevel}
                </p>
              </div>
              <div className="text-[11px] text-slate-400">
                {isSmoker ? "Tobacco" : "Non-Smoker"} • {isAlcohol ? "Alcohol" : "No Alcohol"}
              </div>
            </div>

            {/* Biological Age Estimate (Lifestyle-Based) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Lifestyle Bio Age</span>
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-slate-800 flex items-center justify-center text-lg">
                  <TbActivity />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{bioAgeEstimate}</span>
                  <span className="text-xs text-slate-400 font-bold">yrs</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Chrono Age: {chronoAge} yrs
                </p>
              </div>
              <div className="text-[11px] text-slate-400">
                Habit-based estimate
              </div>
            </div>

            {/* Lifestyle Risk */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Lifestyle Risk</span>
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-slate-800 flex items-center justify-center text-lg">
                  <TbShieldCheck />
                </div>
              </div>
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${getRiskBadge(activeWellness?.overall_lifestyle_tier?.toLowerCase().includes("elevated") ? "moderate" : "low")}`}>
                  {activeWellness?.overall_lifestyle_tier ?? "Healthy Baseline"}
                </span>
                <p className="text-[11px] text-slate-500 font-medium mt-2">
                  {(activeWellness?.risk_factors || []).length} active factor(s)
                </p>
              </div>
              <div className="text-[11px] text-slate-400">
                Non-clinical habit risk
              </div>
            </div>

            {/* Health Readiness */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Health Readiness</span>
                <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 dark:bg-slate-800 flex items-center justify-center text-lg">
                  <TbActivity />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {clinicalAssessmentState?.overall_readiness ?? "100% Active"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Intake profile verified
                </p>
              </div>
              <div className="text-[11px] text-slate-400">
                Registration baseline complete
              </div>
            </div>
          </div>

          {/* Lifestyle Recommendations */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <TbFileAnalytics className="text-blue-600 text-base" />
              Lifestyle Recommendations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Actionable Guidance</h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {(activeWellness?.wellness_recommendations || [
                    "Target 7–8 hours of quality sleep nightly to support autonomic recovery.",
                    "Engage in at least 150 minutes of moderate physical activity weekly.",
                    "Maintain balanced nutritional habits with adequate hydration."
                  ]).map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <TbCheck className="text-emerald-500 text-base flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risk Factors & Insights</h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {(activeWellness?.risk_factors && activeWellness.risk_factors.length > 0) ? (
                    activeWellness.risk_factors.map((rf, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-amber-50/60 dark:bg-amber-950/30 p-3 rounded-2xl border border-amber-200/60 dark:border-amber-900/50 text-amber-900 dark:text-amber-300">
                        <TbAlertCircle className="text-amber-600 text-base flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-extrabold">{rf.title}:</strong> {rf.description}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-300">
                      <TbShieldCheck className="text-emerald-600 text-base flex-shrink-0 mt-0.5" />
                      <span>No critical lifestyle risk factors identified. Maintain strong daily physical activity and rest.</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* 2.1. AI Lifestyle Insights Card (LLM Interpretation Layer) */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-6 md:p-8 rounded-3xl border border-indigo-900/50 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xl shadow-md flex-shrink-0">
                  <TbSparkles />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold tracking-tight text-white">AI Lifestyle Insights</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                      {lifestyleAIInterpretation?.is_ai_generated ? "Gemini AI Coach" : "Intelligent Coach"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Personalized natural language interpretation complementing deterministic wellness scores
                  </p>
                </div>
              </div>

              <button
                onClick={() => fetchLifestyleAIInterpretation(true)}
                disabled={isAIInterpretationLoading}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer self-start sm:self-auto"
              >
                <TbRefresh className={`text-sm ${isAIInterpretationLoading ? "animate-spin" : ""}`} />
                <span>{isAIInterpretationLoading ? "Re-evaluating..." : "Re-evaluate Insights"}</span>
              </button>
            </div>

            {isAIInterpretationLoading ? (
              <div className="py-8 text-center space-y-3">
                <TbSparkles className="animate-spin text-3xl text-indigo-400 mx-auto" />
                <p className="text-xs font-bold text-slate-300">Generating personalized lifestyle insights...</p>
                <p className="text-[11px] text-slate-500">Synthesizing habits, metabolic baselines, and hereditary factors</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Summary */}
                {lifestyleAIInterpretation?.summary && (
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-400">Lifestyle Overview</h4>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {lifestyleAIInterpretation.summary}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* 2. Positive Habits */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <TbCheck className="text-emerald-400 text-base" />
                      <span>Positive Habits</span>
                    </h4>
                    <ul className="space-y-2">
                      {(lifestyleAIInterpretation?.positive_habits || []).map((item, idx) => (
                        <li key={idx} className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200 font-medium flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. Lifestyle Concerns */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <TbAlertCircle className="text-amber-400 text-base" />
                      <span>Lifestyle Focus Areas</span>
                    </h4>
                    <ul className="space-y-2">
                      {(lifestyleAIInterpretation?.lifestyle_concerns || []).map((item, idx) => (
                        <li key={idx} className="p-3 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 font-medium flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 4. Personalized Recommendations & Preventive Screenings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-blue-400">Personalized Recommendations</h4>
                    <ul className="space-y-2">
                      {(lifestyleAIInterpretation?.recommendations || []).map((rec, idx) => (
                        <li key={idx} className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 font-medium flex items-start gap-2">
                          <span className="text-blue-400 font-bold text-xs">{idx + 1}.</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-purple-400">Preventive Advice & Screenings</h4>
                      <ul className="space-y-2">
                        {(lifestyleAIInterpretation?.preventive_screenings || []).map((scr, idx) => (
                          <li key={idx} className="p-3 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 font-medium flex items-start gap-2">
                            <TbStethoscope className="text-purple-400 text-base flex-shrink-0 mt-0.5" />
                            <span>{scr}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {lifestyleAIInterpretation?.weekly_action_plan && (
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Weekly Action Plan</h4>
                        <ul className="space-y-2">
                          {lifestyleAIInterpretation.weekly_action_plan.map((act, idx) => (
                            <li key={idx} className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-xs text-emerald-300 font-medium flex items-center gap-2">
                              <TbCheck className="text-emerald-400 text-sm flex-shrink-0" />
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Motivation Message */}
                {lifestyleAIInterpretation?.motivation && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-blue-900/40 border border-indigo-700/50 text-center">
                    <p className="text-xs font-semibold text-indigo-200 italic">
                      "{lifestyleAIInterpretation.motivation}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. Clinical Health Assessment */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <TbActivityHeartbeat className="text-blue-600 text-xl" />
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Clinical Health Assessment
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Evidence-based organ risk evaluations derived strictly from uploaded clinical reports
              </p>
            </div>
            <Link
              to="/medical-reports"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-800 transition-colors"
            >
              <TbFileAnalytics />
              <span>Upload Medical Report</span>
            </Link>
          </div>

          {/* Organ Cards Grid (Heart, Kidneys, Liver, Lungs, Brain) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {masterInsights ? (
              supportedOrgans.map((organ) => {
                const data = masterInsights[organ as keyof typeof masterInsights] as OrganScore | undefined;
                const Icon = organIcons[organ] || TbActivityHeartbeat;
                const isActive = Boolean(data?.is_active && data?.status !== "Waiting for Reports");
                const rawScore = data?.numerical_score;
                const score = isActive && typeof rawScore === "number" 
                  ? (Number.isInteger(rawScore) ? rawScore : parseFloat(rawScore.toFixed(1))) 
                  : "N/A";
                const riskLabel = data?.risk_label ?? (isActive ? "low" : "Waiting for Reports");
                const formulaName = data?.formula_name || organFormulas[organ] || "Clinical Guideline";

                const snapshot = data?.input_snapshot || {};
                const snapshotEntries = Object.entries(snapshot).filter(([_, val]) => val !== undefined && val !== null);

                return (
                  <motion.div
                    key={organ}
                    whileHover={{ y: -4 }}
                    className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-5 relative overflow-hidden group min-w-0 ${
                      isActive
                        ? "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
                        : "bg-slate-50/60 dark:bg-slate-900/60 border-amber-200/80 dark:border-slate-800"
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform flex-shrink-0 ${
                          isActive ? "bg-blue-50 text-blue-600 dark:bg-slate-800" : "bg-amber-50 text-amber-600 dark:bg-slate-800"
                        }`}>
                          <Icon />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white capitalize truncate">
                            {organ}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-medium truncate">{formulaName}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border flex-shrink-0 ${getRiskBadge(riskLabel)}`}>
                        {riskLabel}
                      </span>
                    </div>

                    {/* Clinical Interpretation */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                      {isActive 
                        ? (data?.explanation || organDescriptions[organ]) 
                        : "Upload clinical lab reports to activate organ risk assessment."}
                    </p>

                    {/* Clinical Score Bar */}
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-baseline justify-between text-xs font-bold gap-2">
                        <span className="text-slate-500 truncate">Clinical Score</span>
                        <span className="text-slate-900 dark:text-white flex-shrink-0">
                          {score} {isActive ? "/ 100" : ""}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            !isActive 
                              ? "bg-amber-400" 
                              : (Number(score) < 50 ? "bg-emerald-500" : Number(score) < 75 ? "bg-amber-500" : "bg-rose-500")
                          }`}
                          style={{ width: `${isActive ? Math.min(Number(score) || 0, 100) : 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-medium text-slate-400">
                      <span>
                        Metrics Used: {snapshotEntries.length || (isActive ? "Verified" : "None")}
                      </span>
                      <span className={isActive ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                        {data?.confidence_level === "Biomarker Verified" ? "Extraction Verified" : (data?.confidence_level || (isActive ? "Extraction Verified" : "Awaiting Reports"))}
                      </span>
                    </div>

                    {/* Action Button */}
                    {isActive ? (
                      <button
                        onClick={() => setSelectedOrgan(organ)}
                        className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white cursor-pointer"
                      >
                        <span>View Clinical Details</span>
                        <TbArrowRight className="text-base" />
                      </button>
                    ) : (
                      <Link
                        to="/medical-reports"
                        className="w-full py-2.5 px-4 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-2 text-center"
                      >
                        <span>Upload Report to Activate</span>
                        <TbArrowRight className="text-base" />
                      </Link>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center text-slate-400 text-sm font-semibold bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                Loading clinical organ scores...
              </div>
            )}
          </div>
        </div>

        {/* 4. Overall Health Summary */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <TbAward className="text-blue-600 text-xl" />
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Overall Health Summary
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Unified summary of your current physiological and lifestyle health status
              </p>
            </div>
            <Link
              to="/passport"
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>View Health Passport</span>
              <TbArrowRight />
            </Link>
          </div>

          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                <TbShieldCheck className="text-sm" />
                <span>{passportTitle}</span>
              </div>
              <h3 className="text-2xl font-black tracking-tight">
                Passport Level {passportLevel} Verification Active
              </h3>
              <p className="text-xs text-blue-200/80 leading-relaxed font-medium">
                {passportLevel >= 2 
                  ? "Clinical lab records verified. Your Digital Twin health passport is active with evidence-based parameter mapping."
                  : "Emergency Health Passport active based on profile intake. Upload clinical lab reports to upgrade to Level 2/3 Clinical Health Passport."}
              </p>
            </div>

            <div className="flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-end">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-blue-300">Passport Level</p>
                <p className="text-3xl font-black text-white">{passportLevel} / 3</p>
              </div>
              <Link
                to="/passport"
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <span>Open Passport</span>
                <TbArrowRight />
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Clinical Organ Detail Modal */}
      <OrganDetailModal
        organKey={selectedOrgan}
        organData={selectedData}
        onClose={() => setSelectedOrgan(null)}
      />
    </DashboardLayout>
  );
}
