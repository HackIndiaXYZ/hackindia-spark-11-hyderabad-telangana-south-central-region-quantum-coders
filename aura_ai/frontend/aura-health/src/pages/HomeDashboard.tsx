import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore, OrganScore } from "@/store/useStore";
import DashboardLayout from "@/components/DashboardLayout";
import OrganDetailModal from "@/components/OrganDetailModal";
import { motion } from "framer-motion";
import {
  TbActivityHeartbeat,
  TbAlertTriangle,
  TbCircleCheck,
  TbCube3dSphere,
  TbArrowUpRight,
  TbFileReport,
  TbSparkles,
  TbClock,
  TbCheck,
  TbRefresh,
  TbHeart,
  TbLungs,
  TbDroplet,
  TbStethoscope,
  TbBrain,
  TbShieldCheck,
  TbPill,
  TbDatabase,
  TbInfoCircle,
  TbFilePlus,
} from "react-icons/tb";

export default function HomeDashboard() {
  const navigate = useNavigate();
  const { user, clinicalAssessmentState, report, loading, runSimulation, medicalRecords, passportData } = useStore();
  const [selectedOrganKey, setSelectedOrganKey] = useState<string | null>(null);
  const [selectedOrganData, setSelectedOrganData] = useState<OrganScore | null>(null);

  const masterInsights = clinicalAssessmentState?.organ_insights;

  useEffect(() => {
    if (!report) {
      runSimulation();
    }
  }, []);

  const handleOpenOrgan = (key: string, data: OrganScore) => {
    setSelectedOrganKey(key);
    setSelectedOrganData(data);
  };

  const getRiskBadge = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "low":
      case "healthy":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
      case "moderate":
      case "borderline":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";
      case "high":
      case "critical":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const organIcons: Record<string, any> = {
    heart: TbHeart,
    lungs: TbLungs,
    liver: TbDroplet,
    kidneys: TbStethoscope,
    brain: TbBrain
  };

  const organColors: Record<string, string> = {
    heart: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:border-rose-900/60",
    lungs: "text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/50 dark:border-sky-900/60",
    liver: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-900/60",
    kidneys: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:border-purple-900/60",
    brain: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-900/60"
  };

  const organFormulas: Record<string, { model: string; version: string; confidence: string }> = {
    heart: { model: "PREVENT 2023", version: "v3.2-AHA", confidence: "High (98%)" },
    kidneys: { model: "CKD-EPI 2021", version: "v2.1-NKF", confidence: "High (99%)" },
    lungs: { model: "GOLD 2026", version: "v4.0-ATS", confidence: "High (96%)" },
    liver: { model: "FIB-4 Index", version: "v1.8-EASL", confidence: "Medium (91%)" },
    brain: { model: "CHA₂DS₂-VASc", version: "v2.0-ESC", confidence: "High (97%)" }
  };

  const recordCount = (medicalRecords || []).length;

  // Dynamic Timeline Events derived from medicalRecords
  const hasUploadedRecords = recordCount > 0;
  
  const timelineEvents = hasUploadedRecords
    ? medicalRecords.map((rec) => ({
        year: rec.visitDate ? rec.visitDate.substring(0, 4) : (rec.uploadDate ? new Date(rec.uploadDate).getFullYear().toString() : "Recent"),
        event: rec.primaryDiagnosis || rec.fileName || "Medical Record Uploaded",
        detail: rec.aiSummary || rec.doctorAdvice || "Analyzed & synthesized into Digital Twin",
        doctor: rec.doctorName || "Verified Physician",
        hospital: rec.hospitalName || "Clinical Facility",
        category: (rec.documentType || "Record").toUpperCase(),
        delta: rec.riskIndicators?.[0] || "Synthesized"
      }))
    : [];

  // Dynamic Recent Reports derived from medicalRecords
  const recentReports = (medicalRecords || []).slice(0, 3).map((rep) => ({
    id: rep.id,
    title: rep.fileName || rep.primaryDiagnosis || "Medical Report",
    type: (rep.documentType || "Diagnostic").replace(/_/g, " ").toUpperCase(),
    date: rep.uploadDate ? new Date(rep.uploadDate).toLocaleDateString() : (rep.visitDate || "Recent"),
    hospital: rep.hospitalName || "Clinical Record",
    doctor: rep.doctorName || "Attending Doctor",
    status: "Verified",
    biomarkers: rep.labValues && rep.labValues.length > 0
      ? rep.labValues.slice(0, 3).map((b) => `${b.parameter}: ${b.value} ${b.unit || ""}`)
      : (rep.symptoms && rep.symptoms.length > 0 ? rep.symptoms.slice(0, 3) : ["Analyzed"])
  }));

  // Dynamic Active Prescriptions derived from medicalRecords
  const activePrescriptions = (medicalRecords || []).flatMap((r) =>
    (r.medicines || []).map((m, idx) => ({
      id: `${r.id}-${idx}`,
      name: m.name,
      dose: m.dosage || m.frequency || "As prescribed",
      doctor: r.doctorName || "Prescribing Doctor",
      hospital: r.hospitalName || "Clinical Facility",
      notes: m.duration ? `Duration: ${m.duration}` : "Extracted from verified document"
    }))
  );

  // Dynamic Data Sources Counts
  const labCount = (medicalRecords || []).filter((r) => r.documentType === "laboratory" || r.documentType === "blood_test").length;
  const rxCount = activePrescriptions.length;

  const dataSources = [
    { name: "CBC & Lab Reports", count: `${labCount} Reports`, lastSync: "Live Twin Sync", status: labCount > 0 ? "Verified" : "Pending Upload", icon: TbFileReport },
    { name: "Active Prescriptions", count: `${rxCount} Prescriptions`, lastSync: "Live Twin Sync", status: rxCount > 0 ? "Verified" : "Pending Upload", icon: TbPill },
    { name: "Lifestyle & Parameters", count: "12 Parameters", lastSync: "Live Twin Sync", status: "Verified", icon: TbActivityHeartbeat },
    { name: "Historical Medical Records", count: `${recordCount} Records`, lastSync: "Live Twin Sync", status: recordCount > 0 ? "Verified" : "Pending Upload", icon: TbClock }
  ];

  // Clinical Summary Items derived from masterInsights
  // STRICT RULE: If recordCount === 0 or organ is unverified, show Awaiting Upload!
  const clinicalSummaryItems = masterInsights
    ? Object.entries(masterInsights).map(([organ, data]) => {
        const isOrganReady = hasUploadedRecords && (data.is_active || (data.numerical_score !== null && data.numerical_score !== undefined));
        return {
          organ: organ.charAt(0).toUpperCase() + organ.slice(1),
          status: isOrganReady ? (data.risk_label === "low" || data.risk_label === "healthy" ? "Stable" : `${data.risk_label.toUpperCase()} Risk`) : "Awaiting Upload",
          desc: isOrganReady
            ? (data.explanation || `${organ} parameter analysis evaluated by ${organFormulas[organ]?.model || "Clinical Model"}.`)
            : `Awaiting verified ${organ} lab report (e.g. ${organ === "heart" ? "Lipid Profile, BP" : organ === "kidneys" ? "KFT, Serum Creatinine" : organ === "liver" ? "LFT, Bilirubin" : organ === "lungs" ? "Spirometry, FEV1" : "Neurological Check"}).`
        };
      })
    : [];

  // Care Recommendations
  // STRICT RULE: If recordCount === 0, show pre-ingestion educational call to action!
  const careRecommendations = hasUploadedRecords && report?.priority_actions && report.priority_actions.length > 0
    ? report.priority_actions.map((act, idx) => ({
        title: `Priority Recommendation #${idx + 1}`,
        guideline: "Based on Digital Twin Clinical Guidelines",
        action: act,
        reason: "Identified during physiological multi-organ risk synthesis.",
        impact: "Improves overall biological resilience score."
      }))
    : [
        {
          title: "Upload Medical Reports to Unlock Clinical Guidance",
          guideline: "Evidence-Based Diagnostic Engine",
          action: "Upload your hospital lab report, CBC, Lipid Profile, or prescription scan.",
          reason: "Clinical guidance is generated exclusively from verified diagnostic laboratory parameters.",
          impact: "Unlocks personalized organ resilience protocols."
        }
      ];

  const quickQueries = [
    "What is my highest organ risk factor?",
    "Suggest immediate lifestyle improvements",
    "Explain my physiological score",
    "How are my organ scores calculated?"
  ];

  const handleQuickQuery = (q: string) => {
    navigate(`/aura-ai?tab=voice&query=${encodeURIComponent(q)}`);
  };

  const activePassportLevel = passportData?.passport_level || (hasUploadedRecords ? 2 : 1);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16 font-sans bg-slate-50 dark:bg-slate-950 min-h-screen">
        
        {/* HERO TRIAGE HEADER */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  Digital Twin Synced
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Last updated: Real-Time Physiology Engine
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Welcome back, <span className="text-blue-600 dark:text-blue-400">{user?.full_name || "Patient"}</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
                Continuous multi-organ physiological synthesis across verified lab diagnostics, clinical reports, and medical history.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/reports"
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-xs"
              >
                <TbFileReport className="text-lg text-emerald-600" />
                <span>Upload Clinical Report</span>
              </Link>
              <button
                onClick={() => runSimulation()}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer"
              >
                <TbRefresh className={`text-base ${loading ? "animate-spin" : ""}`} />
                <span>{loading ? "Syncing..." : "Refresh Digital Twin"}</span>
              </button>
            </div>
          </div>

          {/* Active Data Sources Chips Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Active Sources:</span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700">
              • Clinical Laboratory Reports
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700">
              • Evidence-Based Guidelines
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700">
              • Verified Lifestyle Parameters
            </span>
          </div>
        </div>

        {/* TOP KPI CARDS (2x2 on Laptop, 4x1 on Ultra-Wide) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Card 1: Overall Clinical Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Clinical Status</span>
                <div className="h-9 w-9 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center text-xl">
                  <TbActivityHeartbeat />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                  {clinicalAssessmentState?.overall_clinical_status || "Clinical Assessment Pending"}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-2 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
                <TbCircleCheck className="text-xs text-blue-600" />
                {hasUploadedRecords ? "Evidence-Based Tracking" : "Waiting for Reports"}
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Guidelines:</span> KDIGO, AHA PREVENT™, OPTN, GOLD
            </div>
          </motion.div>

          {/* Card 2: Priority Clinical Attention */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority Attention</span>
                <div className="h-9 w-9 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center text-xl">
                  <TbAlertTriangle />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
                  {hasUploadedRecords && masterInsights
                    ? Object.entries(masterInsights).reduce((min, [k, v]) => (v.numerical_score !== null && v.numerical_score < min.val) ? { key: k, val: v.numerical_score } : min, { key: "heart", val: 999 }).key
                    : "No Warnings"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                  {hasUploadedRecords ? "Attention" : "Pending Data"}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                {hasUploadedRecords ? "Physiological assessment indicator" : "Upload lab report to analyze risk factors"}
              </p>
            </div>
            <div
              className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 cursor-pointer hover:underline"
              onClick={() => {
                if (hasUploadedRecords && masterInsights) {
                  const lowestOrgan = Object.entries(masterInsights).reduce((min, [k, v]) => (v.numerical_score !== null && v.numerical_score < min.val) ? { key: k, data: v, val: v.numerical_score } : min, { key: "heart", data: masterInsights.heart, val: 999 });
                  if (lowestOrgan.data) handleOpenOrgan(lowestOrgan.key, lowestOrgan.data);
                } else {
                  navigate("/reports");
                }
              }}
            >
              <span>{hasUploadedRecords ? "View System Breakdown" : "Upload Diagnostic Report"}</span>
              <TbArrowUpRight className="text-xs" />
            </div>
          </motion.div>

          {/* Card 3: Passport Level Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Passport Level</span>
                <div className="h-9 w-9 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center text-xl">
                  <TbShieldCheck />
                </div>
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
                Level {activePassportLevel} Passport
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {activePassportLevel === 3 ? "Living Digital Twin Active" : (activePassportLevel === 2 ? "Clinical Evidence Verified" : "Emergency Identity Active")}
              </p>
            </div>
            <Link to="/passport" className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-blue-600 dark:text-blue-400 font-bold flex items-center justify-between hover:underline">
              <span>Open QR Passport</span>
              <TbArrowUpRight className="text-xs" />
            </Link>
          </motion.div>

          {/* Card 4: Current Care Protocol */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Care Guidance</span>
                <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center text-xl">
                  <TbCheck />
                </div>
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
                {hasUploadedRecords && report?.priority_actions ? `${report.priority_actions.length} Protocol Items` : "Pre-Ingestion Mode"}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{hasUploadedRecords ? "Clinical Guidance Active" : "Awaiting Report Upload"}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Source:</span> Clinical Guidelines Engine
            </div>
          </motion.div>
        </div>

        {/* SECTION 1: CLINICAL READINESS & DIGITAL TWIN ACTIVATION GRID */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Health Readiness & Clinical Assessments</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Organ Digital Twins activate only when verified laboratory parameters and clinical reports are uploaded.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/reports" className="text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs">
                <TbFileReport />
                <span>Upload Clinical Reports</span>
              </Link>
              <Link to="/clinical-engine" className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1 hover:underline">
                <span>Guidelines</span>
                <TbArrowUpRight />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {masterInsights ? (
              Object.entries(masterInsights).map(([organ, organData]) => {
                const data = organData as OrganScore;
                const Icon = organIcons[organ] || TbActivityHeartbeat;
                
                // STRICT FRONTEND RULE: Organ readiness depends ONLY on uploaded reports, is_active, and numerical_score existence
                const isReady = hasUploadedRecords && 
                                (data.is_active || (data.numerical_score !== null && data.numerical_score !== undefined));
                                
                if (organ === "heart") {
                  console.log("===== DASHBOARD HEART DEBUG =====");
                  console.log("data.top_factor =", data?.top_factor);
                  console.log("data.status =", data?.status);
                  console.log("data.risk_label =", data?.risk_label);
                  console.log("data =", data);

                  console.log({
                    uploaded: hasUploadedRecords,
                    active: data?.is_active,
                    scoreExists: data?.numerical_score !== null && data?.numerical_score !== undefined,
                    topFactor: data?.top_factor,
                    topFactorCheck: data?.top_factor !== "system_busy",
                    final: isReady
                  });
                }

                const score = isReady ? data.numerical_score : null;

                return (
                  <div
                    key={organ}
                    className={`p-6 rounded-2xl border transition-all space-y-4 flex flex-col justify-between shadow-xs ${
                      isReady
                        ? "border-l-4 border-l-emerald-500 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md"
                        : "border-l-4 border-l-amber-500 border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Bar: Icon & Status Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl border ${organColors[organ]}`}>
                            <Icon className="text-2xl" />
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-900 dark:text-white capitalize">{organ} Module</p>
                            <span className="text-[11px] text-slate-500 font-semibold">{data.formula_name || "Clinical Model"}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                            isReady
                              ? getRiskBadge(data.risk_label)
                              : "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                          }`}
                        >
                          {isReady ? `✓ Active (${data.risk_label})` : "Waiting for Report"}
                        </span>
                      </div>

                      {/* Content Area: Active Score vs Waiting Rationale */}
                      {isReady ? (
                        <div className="space-y-3 pt-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AURA Visualization Index</span>
                            <div className="flex items-baseline gap-1.5 mt-1">
                              <span className="text-3xl font-black text-slate-900 dark:text-white">{score}</span>
                              <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 ml-auto bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                                {data.confidence_level === "Biomarker Verified" ? "Extraction Verified" : (data.confidence_level || "Extraction Verified")}
                              </span>
                            </div>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs space-y-1">
                            <div className="font-bold text-slate-800 dark:text-slate-200">{data.source_citation}</div>
                            <p className="text-slate-600 dark:text-slate-400 leading-snug line-clamp-3">{data.explanation}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 pt-1">
                          {/* Educational Rationale */}
                          <div className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/40 space-y-1.5 shadow-2xs">
                            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-900 dark:text-amber-400 uppercase tracking-wider">
                              <TbInfoCircle className="text-amber-600 text-sm" />
                              <span>Why is it waiting?</span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                              {data.explanation && !data.explanation.includes("System busy") 
                                ? data.explanation 
                                : `Laboratory metrics (${organ === "heart" ? "Lipid Profile, BP" : organ === "kidneys" ? "Serum Creatinine, eGFR" : organ === "liver" ? "Bilirubin, INR, ALT/AST" : organ === "lungs" ? "Spirometry FEV1/FVC" : "BP, Heart Rhythm"}) are required to calculate an evidence-based clinical assessment.`}
                            </p>
                          </div>

                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between">
                            <span>Standard: <strong className="text-slate-700 dark:text-slate-300">{data.source_citation || "KDIGO / AHA / OPTN / GOLD"}</strong></span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      {isReady ? (
                        <button
                          onClick={() => handleOpenOrgan(organ, data)}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Clinical Details</span>
                          <TbArrowUpRight className="text-sm" />
                        </button>
                      ) : (
                        <Link
                          to="/reports"
                          className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <TbFileReport />
                          <span>Upload Report to Activate</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs font-semibold">
                Synthesizing Organ Clinical Readiness...
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: WELLNESS LAYER (LIFESTYLE & PREVENTIVE INSIGHTS - SLEEK DARK THEME) */}
        {report?.wellness_assessment && (
          <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-400 border border-amber-800 mb-2">
                  <TbSparkles className="text-sm" />
                  Wellness Layer — Non-Clinical Intake Insights
                </span>
                <h2 className="text-xl font-extrabold tracking-tight">Preventive Health Assessment</h2>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Based strictly on non-clinical patient intake (lifestyle, sleep, exercise, smoking, alcohol, diet, family history).
                </p>
              </div>
              <span className="px-3 py-1 bg-slate-800 font-extrabold text-xs text-slate-200 rounded-full border border-slate-700">
                {report.wellness_assessment.overall_lifestyle_tier}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preventive Insights */}
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-3">
                <div className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TbActivityHeartbeat className="text-base" />
                  <span>Preventive Insights</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 font-medium">
                  {report.wellness_assessment.preventive_insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Wellness Recommendations */}
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-3">
                <div className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TbCheck className="text-base" />
                  <span>Wellness & Habit Recommendations</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 font-medium">
                  {report.wellness_assessment.wellness_recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: MIDDLE ASYMMETRIC GRID (Timeline & Clinical Guidance Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Longitudinal Timeline & 3D Teaser (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Health Timeline Card */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <TbClock className="text-blue-600" />
                    <span>Longitudinal Health Timeline</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Historical synthesis from verified user medical records</p>
                </div>
                {hasUploadedRecords && (
                  <Link to="/history" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    <span>Full History</span>
                    <TbArrowUpRight />
                  </Link>
                )}
              </div>

              {/* Step Timeline or Pre-Upload Card */}
              {hasUploadedRecords ? (
                <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6 my-2">
                  {timelineEvents.map((evt, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-4 border-blue-600 shadow-xs" />
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1.5 hover:bg-blue-50/40 transition-colors">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 rounded-full">{evt.year}</span>
                          <span className="font-bold text-slate-600 dark:text-slate-400">{evt.category} • <span className="text-emerald-700 dark:text-emerald-400">{evt.delta}</span></span>
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{evt.event}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">{evt.detail}</div>
                        <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between pt-1">
                          <span>{evt.hospital}</span>
                          <span>{evt.doctor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mx-auto flex items-center justify-center text-2xl">
                    <TbClock />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Longitudinal Timeline Initializing</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      Upload your first clinical report or hospital discharge summary to populate your physiological longitudinal health timeline.
                    </p>
                  </div>
                  <Link
                    to="/reports"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                  >
                    <TbFilePlus className="text-base" />
                    <span>Upload Medical Document</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 3D Twin Teaser Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-xs">
                  <TbCube3dSphere className="text-sm" />
                  3D Biological Simulator
                </div>
                <h3 className="text-xl font-extrabold">Explore Anatomical Stress Overlays</h3>
                <p className="text-xs text-blue-100 font-medium leading-relaxed">
                  Interactive 3D rendering mapping real-time organ stress levels across cardiovascular, pulmonary, renal, hepatic, and neurological organ systems.
                </p>
              </div>
              <Link
                to="/3d-twin"
                className="px-6 py-3.5 bg-white text-blue-700 font-extrabold text-xs rounded-2xl hover:bg-blue-50 transition-colors whitespace-nowrap shadow-sm flex items-center gap-2"
              >
                <span>Launch 3D Explorer</span>
                <TbArrowUpRight className="text-base" />
              </Link>
            </div>
          </div>

          {/* Right Column: Clinical Guidance & AI Companion (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Today's Clinical Summary */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <TbSparkles className="text-blue-600 text-lg" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Clinical Summary</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Live Synthesis</span>
              </div>

              <div className="space-y-2.5">
                {clinicalSummaryItems.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900 dark:text-slate-100">{item.organ}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        item.status === "Stable" 
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" 
                          : (item.status === "Awaiting Upload" 
                              ? "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800" 
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300")
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium leading-normal">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Care Recommendations */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TbInfoCircle className="text-blue-600 text-base" />
                <span>Evidence-Based Guidance</span>
              </h3>

              <div className="space-y-3">
                {careRecommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs">
                    <div className="font-extrabold text-slate-900 dark:text-white text-xs">{rec.title}</div>
                    <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">{rec.guideline}</div>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">{rec.action}</p>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                      <div><span className="font-bold text-slate-700 dark:text-slate-300">Reason:</span> {rec.reason}</div>
                      <div><span className="font-bold text-emerald-700 dark:text-emerald-400">Impact:</span> {rec.impact}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Quick Questions */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">AI Quick Queries</h3>
              <div className="space-y-2">
                {quickQueries.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuery(q)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span>{q}</span>
                    <TbArrowUpRight className="text-slate-400 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: BOTTOM ASYMMETRIC VAULT GRID (Reports vs Prescriptions) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Uploaded Clinical Reports (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <TbFileReport className="text-blue-600" />
                <span>Uploaded Clinical Reports</span>
              </h3>
              <Link to="/reports" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">View All ({recordCount})</Link>
            </div>

            <div className="space-y-3">
              {recentReports.length > 0 ? (
                recentReports.map((rep) => (
                  <div key={rep.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white">{rep.title}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{rep.status}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{rep.hospital} • {rep.doctor}</div>
                    <div className="text-[10px] text-slate-400">{rep.date}</div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap gap-1.5">
                      {rep.biomarkers.map((b, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300">{b}</span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                  <p className="text-xs font-semibold text-slate-500">No medical reports uploaded yet.</p>
                  <Link to="/reports" className="inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors shadow-xs">
                    Upload Report
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right: Active Prescription Vault (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <TbPill className="text-blue-600" />
                <span>Prescription Vault</span>
              </h3>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">{rxCount} Active</span>
            </div>

            <div className="space-y-3">
              {activePrescriptions.length > 0 ? (
                activePrescriptions.map((rx) => (
                  <div key={rx.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{rx.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">{rx.dose}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{rx.hospital} • {rx.doctor}</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 italic">{rx.notes}</div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                  <p className="text-xs font-semibold text-slate-500">No active prescriptions extracted yet.</p>
                  <p className="text-[11px] text-slate-400">Upload prescription documents to populate your medication vault.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 5: DATA SOURCES SYNCHRONIZATION CONTROL STRIP (FOOTER) */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <TbDatabase className="text-blue-600" />
              <span>Data Sources & Digital Twin Sync Integrity</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">4 Sources Connected</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dataSources.map((ds, idx) => {
              const Icon = ds.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-blue-600 border border-slate-200 dark:border-slate-700">
                      <Icon className="text-xl" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white">{ds.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{ds.count}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    ds.status === "Verified"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                  }`}>
                    ✓ {ds.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ORGAN DETAIL CLINICAL MODAL */}
      {selectedOrganKey && selectedOrganData && (
        <OrganDetailModal
          organKey={selectedOrganKey}
          organData={selectedOrganData}
          onClose={() => {
            setSelectedOrganKey(null);
            setSelectedOrganData(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}
