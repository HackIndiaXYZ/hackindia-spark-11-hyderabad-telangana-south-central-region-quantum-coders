import { Link } from "react-router-dom";
import { OrganScore, useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbX,
  TbHeart,
  TbLungs,
  TbDroplet,
  TbStethoscope,
  TbBrain,
  TbActivityHeartbeat,
  TbSparkles,
  TbCheck,
  TbBookmark,
  TbTrendingUp,
  TbAlertCircle
} from "react-icons/tb";

interface OrganDetailModalProps {
  organKey: string | null;
  organData: OrganScore | null;
  onClose: () => void;
}

export default function OrganDetailModal({ organKey, organData, onClose }: OrganDetailModalProps) {
  const medicalRecords = useStore((state) => state.medicalRecords || []);
  if (!organKey || !organData) return null;

  const organIcons: Record<string, any> = {
    heart: TbHeart,
    lungs: TbLungs,
    liver: TbDroplet,
    kidneys: TbStethoscope,
    brain: TbBrain
  };

  const Icon = organIcons[organKey] || TbActivityHeartbeat;

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "low":
      case "healthy":
        return "text-emerald-800 bg-emerald-50 border-emerald-200";
      case "moderate":
      case "borderline":
        return "text-amber-800 bg-amber-50 border-amber-200";
      case "high":
      case "critical":
        return "text-rose-800 bg-rose-50 border-rose-200";
      default:
        return "text-slate-800 bg-slate-100 border-slate-200";
    }
  };

  const organFormulas: Record<string, { formula: string; source: string }> = {
    heart: {
      formula: "AHA PREVENT™ 2023 Guidelines",
      source: "American Heart Association (AHA)"
    },
    kidneys: {
      formula: "CKD-EPI 2021 Race-Free eGFR",
      source: "Kidney Disease: Improving Global Outcomes (KDIGO 2024)"
    },
    liver: {
      formula: "FIB-4 Index / MELD-Na Protocol",
      source: "American Association for the Study of Liver Diseases (AASLD)"
    },
    lungs: {
      formula: "GOLD 2026 Spirometry Grading",
      source: "Global Initiative for Chronic Obstructive Lung Disease"
    },
    brain: {
      formula: "CHA₂DS₂-VASc Stroke Risk Framework",
      source: "European Society of Cardiology (ESC)"
    }
  };

  const formulaInfo = organFormulas[organKey] || {
    formula: organData.formula_name || "Evidence-Based Clinical Formula",
    source: organData.source_citation || "Clinical Practice Guidelines"
  };

  // Filter matching uploaded records for trend analysis
  const matchingRecords = medicalRecords.filter((r) => {
    const text = `${r.documentType || ""} ${r.documentLabel || ""} ${r.primaryDiagnosis || ""}`.toLowerCase();
    return r.targetOrgan === organKey || text.includes(organKey);
  });

  const hasMultipleReports = matchingRecords.length >= 2;
  const trendText = hasMultipleReports
    ? `Calculated from ${matchingRecords.length} historical records.`
    : "No previous reports available for comparison.";

  const whyChangedText = hasMultipleReports
    ? `Variance calculated against baseline from visit on ${matchingRecords[1]?.visitDate || "previous report"}.`
    : "Trend analysis will become available after future clinical reports.";

  const snapshot = organData.input_snapshot || {};
  const snapshotEntries = Object.entries(snapshot).filter(([_, val]) => val !== undefined && val !== null);
  const isValidatedOCR = organData.is_active && organData.confidence_level === "Biomarker Verified" && snapshotEntries.length > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-xl space-y-6 relative max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl border border-blue-100">
                <Icon />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Clinical Evaluation Report
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Ref: DT-{organKey?.toUpperCase()}</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 capitalize mt-0.5">
                  {organKey} System Clinical Breakdown
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <TbX className="text-xl" />
            </button>
          </div>

          {/* Biological Score Gauge & Clinical Model Header */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Score</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  {organData.is_active && typeof organData.numerical_score === "number" ? (
                    <>
                      <span className="text-4xl font-black text-slate-900">
                        {Number.isInteger(organData.numerical_score) ? organData.numerical_score : parseFloat(organData.numerical_score.toFixed(1))}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-amber-700">Waiting for Report</span>
                  )}
                </div>
              </div>

              <div className="text-right space-y-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${getRiskColor(organData.risk_label)}`}>
                  {organData.risk_label}
                </span>
                <div className="text-[10px] font-bold flex items-center justify-end gap-1">
                  {isValidatedOCR ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <TbCheck className="text-emerald-600" /> Validated by Lab OCR
                    </span>
                  ) : (
                    <span className="text-amber-700 flex items-center gap-1">
                      <TbAlertCircle className="text-amber-600" /> Awaiting Laboratory Report
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Formula Citation */}
            <div className="pt-3 border-t border-slate-200/60 space-y-1 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-slate-900">
                  Formula: {formulaInfo.formula}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                <span className="font-semibold text-slate-700">Official Citation:</span> {formulaInfo.source}
              </div>
            </div>
          </div>

          {/* Biomarkers Used in Calculation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <TbBookmark className="text-blue-600 text-sm" />
              Parameters Used in Calculation
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              {snapshotEntries.length > 0 ? (
                snapshotEntries.map(([key, val]) => (
                  <div key={key} className="p-2.5 rounded-xl bg-white border border-slate-200/60 text-xs space-y-0.5">
                    <span className="text-slate-500 font-medium capitalize block truncate">{key.replace(/_/g, " ")}</span>
                    <span className="font-extrabold text-slate-900 text-sm block truncate">{String(val)}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-3 p-3 bg-white rounded-xl border border-slate-200/60 text-xs text-amber-800 font-medium">
                  No verified parameters available for {organKey} module. Upload a clinical report to populate.
                </div>
              )}
            </div>
          </div>

          {/* Longitudinal Trend & Why Score Changed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <TbTrendingUp className="text-blue-600" /> Historical Trend
              </span>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">{trendText}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Why Score Changed</span>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{whyChangedText}</p>
            </div>
          </div>

          {/* Clinical Interpretation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Interpretation</h4>
            <p className="text-xs text-slate-700 font-medium leading-relaxed bg-blue-50/60 p-4 rounded-2xl border border-blue-200/60">
              {organData.explanation}
            </p>
          </div>

          {/* Intervention */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <TbCheck className="text-emerald-600 text-sm" />
              Patient-Specific Care Intervention
            </h4>
            <div className="p-4 rounded-2xl bg-emerald-50/70 text-emerald-950 border border-emerald-200/80 text-xs font-semibold leading-relaxed">
              {organData.recommendation}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <Link
              to="/aura-ai"
              onClick={onClose}
              className="flex-1 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-xs transition-all text-center flex items-center justify-center gap-2"
            >
              <TbSparkles className="text-base" />
              <span>Consult Aura Companion on {organKey}</span>
            </Link>
            <button
              onClick={onClose}
              className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-colors"
            >
              Close Report
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

