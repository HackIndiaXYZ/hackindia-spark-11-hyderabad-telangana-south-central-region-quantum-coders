import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { 
  TbArrowLeft, 
  TbActivity, 
  TbUser, 
  TbScale, 
  TbFlame, 
  TbHeartRateMonitor, 
  TbHourglass, 
  TbShieldCheck,
  TbSparkles,
  TbHelp,
  TbChevronRight,
  TbDna,
  TbInfoCircle,
  TbReportMedical
} from "react-icons/tb";

export default function LifestyleMethodology() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<string>("sources");

  const sections = [
    { id: "sources", label: "1. Data Sources", icon: TbUser },
    { id: "bmi", label: "2. BMI Formula", icon: TbScale },
    { id: "wellness", label: "3. Wellness Score", icon: TbFlame },
    { id: "risk", label: "4. Risk Levels", icon: TbHeartRateMonitor },
    { id: "readiness", label: "5. Health Readiness", icon: TbShieldCheck },
    { id: "bioage", label: "6. Biological Age", icon: TbHourglass },
    { id: "tiers", label: "7. Preventive Tiers", icon: TbDna },
    { id: "ai", label: "8. Gemini AI Role", icon: TbSparkles },
    { id: "arch", label: "9. Architecture", icon: TbReportMedical },
    { id: "faq", label: "10. FAQ & Guide", icon: TbHelp }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16 max-w-6xl mx-auto">
        {/* Navigation & Header */}
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 mb-4 transition-colors"
          >
            <TbArrowLeft className="text-base" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20">
                <TbActivity />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  General Lifestyle Assessment Methodology
                </h1>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  How the Lifestyle Assessment Engine evaluates profile, habit, and preventive data
                </p>
              </div>
            </div>
            
            <div className="text-left md:text-right border-l-2 md:border-l-0 md:border-r-2 border-slate-300 dark:border-slate-700 pl-3 md:pl-0 pr-3">
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-905">
                Methodology Center
              </span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1">Lifestyle Reference</p>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed max-w-4xl">
            Understand how AURA Health evaluates lifestyle health using deterministic algorithms derived from patient registration and lifestyle intake data. **This module does not require laboratory reports.**
          </p>
        </div>

        {/* Tab Selection */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-wrap gap-1.5 justify-start">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeTab === sec.id
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/10"
                    : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="text-sm shrink-0" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 md:p-8">
          
          {/* 1. DATA SOURCES */}
          {activeTab === "sources" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">1. Patient Intake Data Sources</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  The Lifestyle Assessment Engine reads self-reported clinical information from the intake form:
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Profile */}
                <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 space-y-3">
                  <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Patient Profile
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 font-medium">
                    <li>• Age (demographic adjustments)</li>
                    <li>• Biological Sex</li>
                    <li>• Height (meters)</li>
                    <li>• Weight (kilograms)</li>
                  </ul>
                </div>

                {/* Habits */}
                <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 space-y-3">
                  <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Lifestyle Habits
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 font-medium">
                    <li>• Sleep Duration (hours/night)</li>
                    <li>• Physical Activity Level</li>
                    <li>• Dietary Regime (balanced, average, poor)</li>
                    <li>• Smoking Habits (active status)</li>
                    <li>• Alcohol Consumption</li>
                    <li>• Stress Load Factors</li>
                  </ul>
                </div>

                {/* History */}
                <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 space-y-3">
                  <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Medical & Family History
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 font-medium">
                    <li>• Diagnosed Diseases (Hypertension, Diabetes, etc.)</li>
                    <li>• Daily Medications Profile</li>
                    <li>• Prior Minor / Major Surgeries</li>
                    <li>• Hereditary Burden (Heart disease, cancer, etc.)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 2. BMI FORMULA */}
          {activeTab === "bmi" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">2. Body Mass Index (BMI) Formulation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Body Mass Index (BMI) is a standardized screening metric representing weight relative to height.
                </p>
              </div>

              {/* Formula box */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 font-sans text-sm font-semibold max-w-sm">
                <div className="flex items-center gap-3">
                  <span>BMI = </span>
                  <div className="flex flex-col items-center">
                    <span className="pb-1 border-b border-slate-400 text-center px-3">Weight (kg)</span>
                    <span className="pt-1 text-center px-3">Height (m)<sup>2</sup></span>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto max-w-lg border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                      <th className="py-2.5 px-4">BMI Range</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Aura Health Score Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td className="py-2.5 px-4">&lt; 18.5</td>
                      <td className="py-2.5 px-4 text-amber-600 dark:text-amber-400">Underweight</td>
                      <td className="py-2.5 px-4">Minor Penalty (-4 pts)</td>
                    </tr>
                    <tr className="bg-slate-50/30 dark:bg-slate-900/10">
                      <td className="py-2.5 px-4">18.5 – 24.9</td>
                      <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">Normal / Healthy</td>
                      <td className="py-2.5 px-4">Optimal baseline (0 pts)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4">25.0 – 29.9</td>
                      <td className="py-2.5 px-4 text-amber-600 dark:text-amber-400">Overweight</td>
                      <td className="py-2.5 px-4">Moderate Penalty (-5 pts)</td>
                    </tr>
                    <tr className="bg-slate-50/30 dark:bg-slate-900/10">
                      <td className="py-2.5 px-4">&ge; 30.0</td>
                      <td className="py-2.5 px-4 text-rose-600 dark:text-rose-400 font-bold">Obese</td>
                      <td className="py-2.5 px-4">Severe Penalty (-12 pts)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs block mb-1">
                  How BMI contributes to overall wellness:
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  BMI serves as a primary surrogate marker for excess adipose tissue, which is clinically correlated with increased systemic vascular resistance, metabolic load, and cardiovascular disease markers.
                </p>
              </div>
            </div>
          )}

          {/* 3. WELLNESS SCORE */}
          {activeTab === "wellness" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">3. Deterministic Wellness Score Calculation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  The Wellness Score is a cumulative mathematical index representing overall preventive health based on habits and health metrics.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 font-mono text-sm font-semibold max-w-lg">
                Wellness Score = 100 - Lifestyle Penalties + Habit Bonuses
              </div>

              {/* Factors */}
              <div className="space-y-3">
                <span className="font-extrabold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Contributing Factors:
                </span>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { title: "Smoking Status", val: "-15 Points", desc: "Active nicotine consumption imposes severe vascular and pulmonary penalties." },
                    { title: "Sleep Duration", val: "-10 Points if < 6h", desc: "Short sleep restricts cellular and cognitive glymphatic recovery cycles." },
                    { title: "Adiposity (BMI)", val: "Up to -12 Points", desc: "Obesity triggers vascular resistance and metabolic load penalties." },
                    { title: "Sedentary Activity", val: "-8 Points", desc: "Lack of movement causes cardiovascular capacity loss." },
                    { title: "Excessive Alcohol", val: "-8 Points", desc: "Daily alcohol intake penalizes liver enzymes and cardiovascular lines." },
                    { title: "Dietary Quality", val: "Up to -8 Points", desc: "Poor nutrition (high fat/sugar) contributes to metabolic penalties." },
                    { title: "Stress Level", val: "Up to -5 Points", desc: "High chronic stress spikes circulating cortisol, raising cardiovascular load." },
                    { title: "Chronic Diseases", val: "Up to -12 Points", desc: "Active chronic diseases (e.g. diabetes) incur high physiological burden." },
                    { title: "Hereditary Family History", val: "Up to -4 Points", desc: "Close family histories of cardiac or renal failure increase baseline vulnerability." }
                  ].map((f) => (
                    <div key={f.title} className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs">
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span className="text-slate-900 dark:text-slate-100">{f.title}</span>
                        <span className="text-rose-600 dark:text-rose-400">{f.val}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed font-medium">
                        {f.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. RISK LEVELS */}
          {activeTab === "risk" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">4. Lifestyle Risk Classification</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Intake data is categorized into three lifestyle risk tiers:
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-emerald-50/40 dark:bg-emerald-950/15 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                  <span className="font-extrabold text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                    Low Risk
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Nonsmoking, healthy BMI (18.5–24.9), regular physical activity, optimal sleep, and no active chronic conditions.
                  </p>
                </div>

                <div className="bg-amber-50/40 dark:bg-amber-950/15 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/40 space-y-2">
                  <span className="font-extrabold text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                    Moderate Risk
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Light activity levels, overweight BMI range, occasional high stress, or family history factors with zero primary disease.
                  </p>
                </div>

                <div className="bg-rose-50/40 dark:bg-rose-950/15 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/40 space-y-2">
                  <span className="font-extrabold text-xs text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                    High Risk
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Active smokers, obese BMI category (&ge;30), severe sedentary habits, or active chronic diseases (Diabetes, Hypertension).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. HEALTH READINESS */}
          {activeTab === "readiness" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">5. Health Readiness Index (HRI)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Health Readiness estimates how prepared a person is for maintaining long-term wellness.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 font-mono text-sm font-semibold max-w-xl">
                Health Readiness = Lifestyle + BMI + Exercise + Sleep + Medical History
              </div>

              <div className="space-y-4">
                <span className="font-extrabold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Index Components Explained:
                </span>
                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <strong className="text-slate-900 dark:text-slate-200">1. Habits Factor:</strong>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Weighting of nutrition consistency, non-smoking status, and low alcohol metrics.</p>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-900 dark:text-slate-200">2. Physical Reserve:</strong>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Calculated from physical exercise frequency and current body structure (BMI).</p>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-900 dark:text-slate-200">3. Sleep & Stress Buffer:</strong>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Sleep cycles (ideal: 7-8h) and stress load markers representing daily autonomic reserve.</p>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-900 dark:text-slate-200">4. Medical Load:</strong>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">The biological burden from existing diseases, medications, and hereditary factors.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. BIOLOGICAL AGE */}
          {activeTab === "bioage" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">6. Lifestyle Biological Age Estimation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Lifestyle Biological Age estimates how lifestyle habits influence biological aging relative to chronological age.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 font-mono text-sm font-semibold max-w-xl">
                Lifestyle Biological Age = Chronological Age + Lifestyle Adjustments
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                <div className="bg-emerald-50/30 dark:bg-emerald-950/10 p-5 rounded-2xl border border-emerald-100/40 dark:border-emerald-900/20 space-y-2">
                  <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Healthy Habits &rarr; Biological Age Decreases (Maximum -6.5 years)
                  </span>
                  <ul className="space-y-1.5">
                    <li>• Regular active lifestyle: -2.0 years</li>
                    <li>• Balanced diet: -1.5 years</li>
                    <li>• Consistent 7-8h sleep: -1.0 years</li>
                    <li>• Healthy BMI: -1.0 years</li>
                    <li>• Non-smoking, non-drinking: Baseline reductions</li>
                  </ul>
                </div>

                <div className="bg-rose-50/30 dark:bg-rose-950/10 p-5 rounded-2xl border border-rose-100/40 dark:border-rose-900/20 space-y-2">
                  <span className="font-extrabold text-xs text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                    Poor Habits &rarr; Biological Age Increases
                  </span>
                  <ul className="space-y-1.5">
                    <li>• Active smoking: +3.5 years</li>
                    <li>• Obese BMI: +3.0 years</li>
                    <li>• Sedentary lifestyle: +2.0 years</li>
                    <li>• Sleep deprivation (&lt; 6h): +2.0 years</li>
                    <li>• Excessive alcohol: +1.5 years</li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
                <TbInfoCircle className="text-blue-500 shrink-0" />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                  Disclaimer: This is a lifestyle-based mathematical estimate representing cumulative metabolic reserve and is not a clinical epigenetic diagnosis.
                </span>
              </div>
            </div>
          )}

          {/* 7. PREVENTIVE TIERS */}
          {activeTab === "tiers" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">7. Preventive Health Tiers</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Patients are grouped into preventive categories to help prioritize preventive clinical action:
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { tier: "Tier 1 — Healthy Baseline", desc: "Optimal habit tracking. Primary target: maintain active status, regular vitals checkups, and nutritional continuity." },
                  { tier: "Tier 2 — Moderate Lifestyle Risk", desc: "Minor penalties present. Target: incorporate physical activity regimens, address stress, and review sleep guidelines." },
                  { tier: "Tier 3 — High Lifestyle Risk", desc: "Significant lifestyle penalties. Immediate target: primary screening, active risk cessation programs (e.g. smoking), and clinical checkups." }
                ].map((t) => (
                  <div key={t.tier} className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                    <strong className="text-slate-900 dark:text-slate-100 text-xs block mb-1">{t.tier}</strong>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. GEMINI AI ROLE */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">8. Gemini AI Natural Language Role</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Understanding the difference between the deterministic engine and the generative interpretation layer:
                </p>
              </div>

              {/* Pipeline Diagram */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row items-center gap-4 justify-center text-xs font-bold font-sans">
                <span className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">Patient Intake</span>
                <TbChevronRight className="text-slate-400 rotate-90 md:rotate-0" />
                <span className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">Lifestyle Assessment Engine</span>
                <TbChevronRight className="text-slate-400 rotate-90 md:rotate-0" />
                <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">Deterministic Results</span>
                <TbChevronRight className="text-slate-400 rotate-90 md:rotate-0" />
                <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">Gemini AI Translator</span>
                <TbChevronRight className="text-slate-400 rotate-90 md:rotate-0" />
                <span className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">Natural Language Explanation</span>
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-xs leading-relaxed font-medium">
                <div>
                  <strong className="text-slate-900 dark:text-slate-200 block mb-1">Generated Insight Sections:</strong>
                  <ul className="space-y-1 text-slate-500 dark:text-slate-400">
                    <li>• Lifestyle Summary (empathetic overview)</li>
                    <li>• Positive Habits (reinforcing success)</li>
                    <li>• Lifestyle Concerns (highlighting risks)</li>
                    <li>• Personalized Recommendations</li>
                    <li>• Preventive Advice & Screenings</li>
                    <li>• Weekly Action Plan</li>
                    <li>• Daily Motivation</li>
                  </ul>
                </div>

                <div className="bg-blue-50/40 dark:bg-blue-950/15 p-5 rounded-2xl border border-blue-100/60 dark:border-blue-900/40 flex items-start gap-3">
                  <TbSparkles className="text-blue-600 text-lg shrink-0 mt-0.5" />
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>Critical Guardrail:</strong> All numerical values (Wellness Score, BMI, Risk Categories, Biological Age estimate) originate from the **deterministic Lifestyle Assessment Engine**. Gemini only explains these calculated outputs in natural language and **never recalculates, overrides, or modifies** any scores.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 9. COMPLETE ARCHITECTURE */}
          {activeTab === "arch" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">9. Lifestyle Assessment Engine Architecture Flow</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  The complete sequential processing flow of patient lifestyle metrics:
                </p>
              </div>

              {/* ASCII / HTML Flow */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                <div className="flex flex-col gap-4 text-xs font-bold text-slate-700 dark:text-slate-300 max-w-sm mx-auto">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-xs">
                    Patient Registration & Profile Onboarding
                  </div>
                  <div className="text-center text-slate-400 font-black">↓</div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-xs">
                    Lifestyle & Habit Intake Form Inputs
                  </div>
                  <div className="text-center text-slate-400 font-black">↓</div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-emerald-900/60 rounded-xl text-center shadow-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/15">
                    Lifestyle Assessment Engine
                  </div>
                  <div className="text-center text-slate-400 font-black">↓</div>
                  
                  {/* Outputs Group */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-100/50 dark:bg-slate-950/80 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800/60">
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg text-center shadow-2xs">BMI Calculation</div>
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg text-center shadow-2xs">Wellness Score (100 pts)</div>
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg text-center shadow-2xs">Lifestyle Risk Staging</div>
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg text-center shadow-2xs">Health Readiness Index</div>
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg text-center shadow-2xs">Biological Age Estimate</div>
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg text-center shadow-2xs">Preventive Health Tier</div>
                  </div>

                  <div className="text-center text-slate-400 font-black">↓</div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-xs">
                    Zustand Global State Sync (<code>activeWellness</code>)
                  </div>
                  <div className="text-center text-slate-400 font-black">↓</div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-xs text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/15">
                    Gemini AI Explanatory Narrative Writer
                  </div>
                  <div className="text-center text-slate-400 font-black">↓</div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-center shadow-xs">
                    Overview Dashboard & My Health Pages
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 10. FAQ */}
          {activeTab === "faq" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">10. Methodology Frequently Asked Questions</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Common queries regarding the Lifestyle Assessment Engine:
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    q: "How is the Wellness Score calculated?",
                    a: "It starts from a base score of 95. The engine subtracts fixed points for negative factors (smoking: -15, sleep < 6h: -10, sedentary: -8, obesity: -12, diseases: up to -12) and clamps the result strictly between 35 and 98 points."
                  },
                  {
                    q: "Does this assessment require laboratory reports?",
                    a: "No. The General Lifestyle Assessment Engine is purely habit-based and profile-based. It requires zero laboratory values to calculate its scores, unlike the Clinical Engine."
                  },
                  {
                    q: "Can the Lifestyle Assessment work without medical records?",
                    a: "Yes. It evaluates self-reported demographic data, daily habits (exercise, nutrition, sleep), and medical histories entered during registration."
                  },
                  {
                    q: "Does Gemini calculate any numerical scores?",
                    a: "No. All scores are computed deterministically on the backend. Gemini only translates those numerical scores and parameters into a clear, natural language summary."
                  },
                  {
                    q: "Why is my Biological Age different from actual chronological age?",
                    a: "It represents a lifestyle adjustment. If you have healthy habits (exercise, diet), the engine subtracts up to 6.5 years from your chronological age. If you have high-risk habits (smoking, obesity), it adds years to estimate your biological aging rate."
                  },
                  {
                    q: "How often are lifestyle scores updated?",
                    a: "They update immediately whenever you modify your user profile parameters or adjust the lifestyle sliders in the Simulation Control Panel."
                  }
                ].map((faq, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <strong className="text-xs text-slate-900 dark:text-slate-100 block">Q: {faq.q}</strong>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                      A: {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Disclaimer */}
        <footer className="text-center pt-8 border-t border-slate-200 dark:border-slate-800/60">
          <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-semibold max-w-4xl mx-auto leading-relaxed">
            Lifestyle Assessment Disclaimer: The General Lifestyle Assessment Engine is intended for educational and preventive wellness guidance. It evaluates self-reported lifestyle and health history using deterministic algorithms. It is not intended to diagnose disease or replace professional medical consultation.
          </p>
        </footer>

      </div>
    </DashboardLayout>
  );
}
