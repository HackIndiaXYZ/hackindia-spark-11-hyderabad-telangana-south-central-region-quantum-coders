import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { 
  TbArrowLeft, 
  TbMathFunction, 
  TbHeart, 
  TbStethoscope, 
  TbDroplet, 
  TbLungs, 
  TbBrain,
  TbAward,
  TbExternalLink
} from "react-icons/tb";

export default function ClinicalEnginePage() {
  const engines = [
    {
      organ: "Kidney Health Engine",
      icon: TbStethoscope,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
      badge: "CKD-EPI 2021",
      equation: "eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^(-1.200) × 0.9938^Age × (1.012 if Female)",
      summary: "Race-free estimated Glomerular Filtration Rate equation standard endorsed by KDIGO.",
      biomarkers: ["Serum Creatinine (mg/dL)", "Age", "Biological Sex"],
      citation: "Kidney Disease: Improving Global Outcomes (KDIGO 2024 Clinical Guidelines)",
      link: "https://kdigo.org/"
    },
    {
      organ: "Heart & Vascular Engine",
      icon: TbHeart,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
      badge: "AHA PREVENT™ (2023)",
      equation: "10-Year ASCVD Risk = 1 - S_10(t)^exp(β_age(Age) + β_bp(SBP) + β_chol(TC-HDL) - β_egfr(eGFR))",
      summary: "Predicts 10-year risk of cardiovascular disease incorporating renal & metabolic integration.",
      biomarkers: ["Systolic Blood Pressure (mmHg)", "Total & HDL Cholesterol", "BMI", "Smoking Status"],
      citation: "American Heart Association (AHA) 2023 Cardiovascular Disease Prevention Protocol",
      link: "https://www.heart.org/"
    },
    {
      organ: "Liver & Hepatic Engine",
      icon: TbDroplet,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
      badge: "FIB-4 & MELD-Na",
      equation: "FIB-4 = (Age × AST) / (Platelets × √ALT)",
      summary: "Evaluates liver fibrosis and hepatic synthetic function using standard liver enzymes.",
      biomarkers: ["AST (U/L)", "ALT (U/L)", "Platelet Count (10^9/L)", "Serum Sodium (mEq/L)"],
      citation: "American Association for the Study of Liver Diseases (AASLD 2023)",
      link: "https://www.aasld.org/"
    },
    {
      organ: "Pulmonary & Lung Engine",
      icon: TbLungs,
      color: "text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
      badge: "GOLD 2026",
      equation: "Lung Integrity = 100 × (FEV1 / FVC_ref) - (PackYears × 2.5) + Activity_Bonus",
      summary: "Spirometric ratio calculation evaluating airway resistance and chronic respiratory risk.",
      biomarkers: ["FEV1 / FVC Ratio", "Smoking Pack-Years", "Physical Activity Hours"],
      citation: "Global Initiative for Chronic Obstructive Lung Disease (GOLD 2026 Guidelines)",
      link: "https://goldcopd.org/"
    },
    {
      organ: "Brain & Neurological Engine",
      icon: TbBrain,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
      badge: "CHA₂DS₂-VASc Index",
      equation: "Stroke Risk Index = Age_Score + HTN_Score + Diabetes_Score + Vascular_Score",
      summary: "Clinical score predicting cerebrovascular integrity and stroke risk factor weighting.",
      biomarkers: ["Age", "Hypertension Status", "Diabetes Status", "Vascular History"],
      citation: "European Society of Cardiology (ESC) & ACC/AHA Cerebrovascular Standards",
      link: "https://www.escardio.org/"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12 max-w-5xl mx-auto">
        {/* Navigation & Header */}
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 mb-4 transition-colors"
          >
            <TbArrowLeft className="text-base" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
              <TbMathFunction />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Clinical Engine & Mathematical Specifications
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Transparent, evidence-based medical equations powering your Digital Twin biological simulation
              </p>
            </div>
          </div>
        </div>

        {/* Engine Formula Cards */}
        <div className="space-y-6">
          {engines.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.organ}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl border ${item.color}`}>
                      <Icon />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {item.organ}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{item.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      {item.badge}
                    </span>
                  </div>
                </div>

                {/* Mathematical Equation Box */}
                <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 font-sans">
                    Clinical Formula Equation
                  </p>
                  <code>{item.equation}</code>
                </div>

                {/* Biomarkers & Guidelines Grid */}
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Required Input Parameters:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.biomarkers.map((b) => (
                        <span
                          key={b}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-[11px]"
                        >
                          • {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                      <TbAward className="text-emerald-500 text-sm" />
                      Official Guideline Source:
                    </span>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium inline-flex items-center gap-1 hover:underline"
                    >
                      <span>{item.citation}</span>
                      <TbExternalLink className="text-xs" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
