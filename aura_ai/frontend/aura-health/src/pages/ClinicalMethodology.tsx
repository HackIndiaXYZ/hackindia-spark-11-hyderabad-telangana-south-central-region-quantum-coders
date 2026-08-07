import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { 
  TbArrowLeft, 
  TbMathFunction, 
  TbHeart, 
  TbStethoscope, 
  TbDroplet, 
  TbLungs, 
  TbBrain,
  TbExternalLink,
  TbSearch,
  TbChevronDown,
  TbChevronUp,
  TbBookmark,
  TbInfoCircle,
  TbInfoSquareRounded,
  TbActivity
} from "react-icons/tb";

interface Terminology {
  abbreviation: string;
  definition: string;
}

interface FormulaData {
  id: number;
  name: string;
  fullForm: string;
  purpose: string;
  organ: "heart" | "kidneys" | "liver" | "lungs" | "brain";
  icon: any;
  colorClass: string;
  badgeColor: string;
  biomarkers: string[];
  mathConcept: string;
  formulaHtml: React.ReactNode;
  terminology: Terminology[];
  interpretation: string;
  whyUsed: string;
  normalization: string;
  normalizationFormulaHtml?: React.ReactNode;
  officialSource: string;
  officialSourceUrl: string;
  paperTitle: string;
  paperUrl: string;
  lastUpdated: string;
}

export default function ClinicalMethodology() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrgan, setSelectedOrgan] = useState<string>("all");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const { user } = useStore();

  const formulas: FormulaData[] = [
    {
      id: 1,
      name: "AHA PREVENT™",
      fullForm: "American Heart Association – Predicting Risk of Cardiovascular Disease Events Tool",
      purpose: "Estimate a patient's future risk of cardiovascular disease (CVD) over the next 10 years.",
      organ: "heart",
      icon: TbHeart,
      colorClass: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60",
      badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
      biomarkers: ["Age", "Biological Sex", "Systolic Blood Pressure (SBP)", "Total Cholesterol", "HDL Cholesterol", "Diabetes Status", "Smoking Status", "eGFR (Kidney Function)"],
      mathConcept: "Risk Accumulation & Calibration Model",
      formulaHtml: (
        <div className="space-y-2 py-1.5 font-sans">
          <div className="flex flex-wrap items-center gap-1.5 text-slate-800 dark:text-slate-200 text-sm font-semibold">
            <span>Risk Score (points) = </span>
            <span>1.2</span>
            <span className="text-slate-400 font-normal">+ (Age - 40) &times; 0.25</span>
            <span className="text-slate-400 font-normal">+ (SBP - 120) &times; 0.15 [ &times; 1.2 if treated ]</span>
            <span className="text-slate-400 font-normal">+ (Total Chol - 200) &times; 0.05</span>
            <span className="text-slate-400 font-normal">- (HDL - 40) &times; 0.2</span>
            <span className="text-slate-400 font-normal">+ 3.5 [ if Smoker ]</span>
            <span className="text-slate-400 font-normal">+ 3.0 [ if Diabetic ]</span>
            <span className="text-slate-400 font-normal">+ (60 - eGFR) &times; 0.1 [ if eGFR &lt; 60 ]</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            *Final 10-year risk percentage is clamped between 0.5% and 50.0%.
          </p>
        </div>
      ),
      terminology: [
        { abbreviation: "HDL", definition: "High-Density Lipoprotein ('good' cholesterol that clears cholesterol from arteries)" },
        { abbreviation: "LDL", definition: "Low-Density Lipoprotein ('bad' cholesterol that deposits in vascular walls)" },
        { abbreviation: "eGFR", definition: "Estimated Glomerular Filtration Rate (measure of kidney waste clearing capacity)" },
        { abbreviation: "SBP", definition: "Systolic Blood Pressure (peak pressure exerted on vascular walls during cardiac contraction)" }
      ],
      interpretation: "Higher 10-year CVD risk percentage directly indicates increased probability of adverse cardiac events, translating to a lower Heart Integrity Score.",
      whyUsed: "Predicts future cardiovascular health outcomes using evidence-based parameters endorsed by modern preventive cardiology.",
      normalization: "Converts calculated risk percentage to a 0–100 Organ Integrity Index using a multiplier that penalizes high-risk scores.",
      normalizationFormulaHtml: (
        <code className="text-xs text-blue-600 dark:text-blue-400 font-mono">
          Heart Integrity Score = max(0.0, min(100.0, 100.0 - (10_Year_Risk_Percent &times; 3.2)))
        </code>
      ),
      officialSource: "American Heart Association PREVENT™ Risk Calculator",
      officialSourceUrl: "https://professional.heart.org/en/guidelines-and-statements/prevent-risk-calculator",
      paperTitle: "AHA PREVENT Equations for Cardiovascular Disease Risk Prediction (Circulation 2024)",
      paperUrl: "https://www.ahajournals.org/doi/abs/10.1161/CIRCULATIONAHA.123.067626",
      lastUpdated: "2024"
    },
    {
      id: 2,
      name: "CKD-EPI (2021)",
      fullForm: "Chronic Kidney Disease Epidemiology Collaboration Equation (2021)",
      purpose: "Estimate glomerular filtration efficiency to assess overall kidney metabolic function.",
      organ: "kidneys",
      icon: TbStethoscope,
      colorClass: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      biomarkers: ["Serum Creatinine (Scr)", "Age", "Biological Sex (Female/Male)"],
      mathConcept: "Race-free power function exponential model",
      formulaHtml: (
        <div className="space-y-3 font-sans py-1">
          <div className="flex flex-wrap items-center gap-1.5 text-slate-800 dark:text-slate-200 text-sm font-semibold">
            <span>eGFR = 142 &times; min(Scr / &kappa;, 1)<sup>&alpha;</sup> &times; max(Scr / &kappa;, 1)<sup>-1.200</sup> &times; 0.9938<sup>Age</sup> &times; Sex_Multiplier</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100/60 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200/40 dark:border-slate-800/50">
            <div><strong>&kappa; (Kappa):</strong> Female: 0.7 | Male: 0.9</div>
            <div><strong>&alpha; (Alpha):</strong> Female: -0.241 | Male: -0.302</div>
            <div><strong>Sex Multiplier:</strong> Female: 1.012 | Male: 1.0</div>
            <div><strong>Scr:</strong> Serum Creatinine (mg/dL)</div>
          </div>
        </div>
      ),
      terminology: [
        { abbreviation: "Scr", definition: "Serum Creatinine (a chemical waste product produced by muscle metabolism)" },
        { abbreviation: "κ (Kappa)", definition: "Sex-specific creatinine reference normalization divisor" },
        { abbreviation: "α (Alpha)", definition: "Sex-specific exponent modifier for creatinine concentration slope" },
        { abbreviation: "eGFR", definition: "Estimated Glomerular Filtration Rate expressed in mL/min/1.73m²" }
      ],
      interpretation: "Higher eGFR values indicate superior renal filtration efficiency. Reduced eGFR represents glomerular decline, indicating a drop in kidney integrity.",
      whyUsed: "Calculates baseline renal function independently of race parameters as recommended by contemporary nephrology guidelines.",
      normalization: "Calculates the kidney score directly from the estimated eGFR, clamped between a minimum of 0 and maximum of 100.",
      normalizationFormulaHtml: (
        <code className="text-xs text-blue-600 dark:text-blue-400 font-mono">
          Kidneys Integrity Score = min(100.0, max(0.0, eGFR_Value))
        </code>
      ),
      officialSource: "National Kidney Foundation (NKF) eGFR Standards",
      officialSourceUrl: "https://www.kidney.org/professionals/kdoqi/gfr_calculator",
      paperTitle: "A New Equation to Estimate GFR without Race (Inker LA, et al. NEJM 2021)",
      paperUrl: "https://www.nejm.org/doi/full/10.1056/NEJMoa2102953",
      lastUpdated: "2021"
    },
    {
      id: 3,
      name: "KDIGO Staging",
      fullForm: "Kidney Disease: Improving Global Outcomes Staging System",
      purpose: "Classify chronic kidney disease severity into progressive therapeutic stages.",
      organ: "kidneys",
      icon: TbStethoscope,
      colorClass: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      biomarkers: ["Estimated Glomerular Filtration Rate (eGFR)"],
      mathConcept: "Clinical staging classification (no direct equation)",
      formulaHtml: (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2 px-3">Stage</th>
                <th className="py-2 px-3">Classification</th>
                <th className="py-2 px-3">eGFR Range (mL/min/1.73m²)</th>
                <th className="py-2 px-3">Aura Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-2 px-3 font-semibold text-emerald-600 dark:text-emerald-400">G1</td>
                <td className="py-2 px-3">Normal or High function</td>
                <td className="py-2 px-3">&ge; 90</td>
                <td className="py-2 px-3">Low Risk</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-emerald-600 dark:text-emerald-400">G2</td>
                <td className="py-2 px-3">Mildly decreased</td>
                <td className="py-2 px-3">60 – 89</td>
                <td className="py-2 px-3">Moderate Risk</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-amber-600 dark:text-amber-400">G3a</td>
                <td className="py-2 px-3">Mild to moderately decreased</td>
                <td className="py-2 px-3">45 – 59</td>
                <td className="py-2 px-3">High Risk</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-amber-600 dark:text-amber-400">G3b</td>
                <td className="py-2 px-3">Moderate to severely decreased</td>
                <td className="py-2 px-3">30 – 44</td>
                <td className="py-2 px-3">High Risk</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-rose-600 dark:text-rose-400">G4</td>
                <td className="py-2 px-3">Severely decreased</td>
                <td className="py-2 px-3">15 – 29</td>
                <td className="py-2 px-3">Critical Risk</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-rose-600 dark:text-rose-400">G5</td>
                <td className="py-2 px-3">Kidney failure (Uremia)</td>
                <td className="py-2 px-3">&lt; 15</td>
                <td className="py-2 px-3">Critical Risk</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
      terminology: [
        { abbreviation: "KDIGO", definition: "Kidney Disease: Improving Global Outcomes (international non-profit guideline organization)" },
        { abbreviation: "Uremia", definition: "Accumulation of toxic nitrogenous waste products in blood due to renal failure" }
      ],
      interpretation: "Lower staging (G1/G2) points to optimal function, whereas progress to G4/G5 signals renal insufficiency requiring nephrology consult.",
      whyUsed: "Interprets numeric CKD-EPI output values into actionable clinical classification bands.",
      normalization: "Translates G-stages directly into risk label limits utilized on the dashboard.",
      officialSource: "KDIGO Clinical Practice Guideline for Diabetes Management in Chronic Kidney Disease",
      officialSourceUrl: "https://kdigo.org/guidelines/",
      paperTitle: "KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease",
      paperUrl: "https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf",
      lastUpdated: "2024"
    },
    {
      id: 4,
      name: "FIB-4 Index",
      fullForm: "Fibrosis-4 Index for Liver Fibrosis",
      purpose: "Provide a non-invasive estimate of liver scarring (fibrosis) utilizing standard lab chemistry values.",
      organ: "liver",
      icon: TbDroplet,
      colorClass: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      biomarkers: ["Patient Age (years)", "AST (U/L)", "ALT (U/L)", "Platelet Count (10^9/L)"],
      mathConcept: "Biochemical ratio modeling index",
      formulaHtml: (
        <div className="space-y-2 py-1 font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-3">
            <span>FIB-4 = </span>
            <div className="flex flex-col items-center">
              <span className="pb-1 border-b border-slate-400 text-center px-2">Age (years) &times; AST (U/L)</span>
              <span className="pt-1 text-center px-2">Platelet Count (10<sup>9</sup>/L) &times; &radic;ALT (U/L)</span>
            </div>
          </div>
        </div>
      ),
      terminology: [
        { abbreviation: "AST", definition: "Aspartate Aminotransferase (enzyme indicating hepatic cellular injury)" },
        { abbreviation: "ALT", definition: "Alanine Aminotransferase (highly liver-specific enzyme indicator of cell death)" },
        { abbreviation: "Platelets", definition: "Thrombocytes (blood cells responsible for coagulation, produced by hepatic-regulated hormones)" }
      ],
      interpretation: "Low index scores indicate low probability of advanced fibrosis. Elevated index scores indicate high probability of advanced fibrosis/cirrhosis.",
      whyUsed: "Screens for liver scarring without liver biopsy, relying on common biomarkers retrieved from basic metabolic profiles.",
      normalization: "Applies clinical cutoff boundaries to map FIB-4 scores into discrete integrity points (Low risk: 92.0, Moderate: 75.0, High risk: 45.0).",
      normalizationFormulaHtml: (
        <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400 font-mono">
          <div>If FIB-4 &lt; 1.30 (or &lt; 2.00 if Age &gt; 65) &rarr; Integrity Score = 92.0</div>
          <div>If FIB-4 &le; 2.67 &rarr; Integrity Score = 75.0</div>
          <div>If FIB-4 &gt; 2.67 &rarr; Integrity Score = 45.0</div>
        </div>
      ),
      officialSource: "AASLD Non-Invasive Staging Consensus",
      officialSourceUrl: "https://www.aasld.org/practice-guidelines",
      paperTitle: "Development of a simple noninvasive index to predict significant fibrosis (Sterling RK, et al. Hepatology 2006)",
      paperUrl: "https://aasldpubs.onlinelibrary.wiley.com/doi/full/10.1002/hep.21178",
      lastUpdated: "2006"
    },
    {
      id: 5,
      name: "MELD-Na",
      fullForm: "Model for End-Stage Liver Disease with Sodium Correction",
      purpose: "Measure the severity of chronic liver disease to estimate survival outcomes.",
      organ: "liver",
      icon: TbDroplet,
      colorClass: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      biomarkers: ["Serum Creatinine (mg/dL)", "Total Bilirubin (mg/dL)", "International Normalized Ratio (INR)", "Serum Sodium (mEq/L)"],
      mathConcept: "Logarithmic regression scale",
      formulaHtml: (
        <div className="space-y-2 py-1.5 font-sans">
          <div className="flex flex-col gap-1.5 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold">
            <div>MELD(i) = 0.957 &times; ln(Creatinine) + 0.378 &times; ln(Bilirubin) + 1.120 &times; ln(INR) + 0.643</div>
            <div className="text-slate-500 font-medium font-sans">If MELD(i) &gt; 11:</div>
            <div>MELD-Na = MELD(i) + 1.32 &times; (137 - Sodium) - [0.033 &times; MELD(i) &times; (137 - Sodium)]</div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            *Inputs are physiologically clamped: Bilirubin/INR/Creatinine &ge; 1.0; Creatinine is capped at 4.0; Sodium ranges between 125.0 and 137.0.
          </p>
        </div>
      ),
      terminology: [
        { abbreviation: "INR", definition: "International Normalized Ratio (standardized measure of blood clotting speed reflecting hepatic function)" },
        { abbreviation: "Bilirubin", definition: "Yellow bile breakdown pigment processed and cleared by the biliary tract" },
        { abbreviation: "Na (Sodium)", definition: "Primary extracellular fluid electrolyte critical to vascular volume homeostasis" }
      ],
      interpretation: "Lower scores (6-10) represent healthy hepatic status, whereas higher scores (up to 40) correspond to severe dysfunction.",
      whyUsed: "Used globally by UNOS/OPTN to measure organ dysfunction severity and allocate critical clinical liver care resources.",
      normalization: "Applies a linear slope mapping to convert the MELD-Na score (range 6 to 40) into the 0–100 Organ Integrity scale.",
      normalizationFormulaHtml: (
        <code className="text-xs text-blue-600 dark:text-blue-400 font-mono">
          Liver Integrity Score = max(0.0, 100.0 - ((MELD_Na - 6.0) / 34.0 &times; 80.0))
        </code>
      ),
      officialSource: "OPTN Allocation Policies",
      officialSourceUrl: "https://optn.transplant.hrsa.gov/policies-by-laws/",
      paperTitle: "An Alteration of MELD Formula to Include Serum Sodium (Kim WR, et al. NEJM 2008)",
      paperUrl: "https://www.nejm.org/doi/full/10.1056/NEJMoa0707660",
      lastUpdated: "2016"
    },
    {
      id: 6,
      name: "GOLD Criteria",
      fullForm: "Global Initiative for Chronic Obstructive Lung Disease Guidelines",
      purpose: "Detect respiratory pathway obstruction and classify COPD severity based on spirometry values.",
      organ: "lungs",
      icon: TbLungs,
      colorClass: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60",
      badgeColor: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800",
      biomarkers: ["FEV1 (Forced Expiratory Volume in 1 second)", "FVC (Forced Vital Capacity)", "SpO2 (Oxygen Saturation %)", "Smoking History (Pack-Years)"],
      mathConcept: "Spirometric classification and hazard reduction matrix",
      formulaHtml: (
        <div className="space-y-2 py-1.5 font-sans">
          <div className="text-slate-800 dark:text-slate-200 text-sm font-semibold">
            <span>Obstruction Defined as: FEV1 / FVC Ratio &lt; 0.70</span>
          </div>
          <div className="pl-4 text-xs text-slate-500 dark:text-slate-400 space-y-1 font-medium">
            <div>• GOLD 1 (Mild) &rarr; FEV1 % Predicted &ge; 80%</div>
            <div>• GOLD 2 (Moderate) &rarr; FEV1 % Predicted 50% – 79%</div>
            <div>• GOLD 3 (Severe) &rarr; FEV1 % Predicted 30% – 49%</div>
            <div>• GOLD 4 (Very Severe) &rarr; FEV1 % Predicted &lt; 30%</div>
          </div>
        </div>
      ),
      terminology: [
        { abbreviation: "FEV1", definition: "Forced Expiratory Volume in One Second (volume of air forcefully blown out in the first second of expiration)" },
        { abbreviation: "FVC", definition: "Forced Vital Capacity (total volume of air exhaled after full inhalation)" },
        { abbreviation: "COPD", definition: "Chronic Obstructive Pulmonary Disease (progressive lung disease causing airflow limitation)" }
      ],
      interpretation: "A FEV1/FVC ratio below 0.70 indicates airway obstruction, with the GOLD grade classifying the degree of lung function loss.",
      whyUsed: "Acts as the gold standard for clinical classification, severity staging, and guidance for therapy in chronic airway diseases.",
      normalization: "Converts spirometric grades to static values (GOLD 1: 85, GOLD 2: 70, GOLD 3: 45, GOLD 4: 25) or maps healthy metrics adjusted by smoking pack-years.",
      normalizationFormulaHtml: (
        <code className="text-xs text-blue-600 dark:text-blue-400 font-mono">
          Non-Obstructed Score = max(0.0, min(100.0, SpO2_Value - (Smoking_Pack_Years &times; 0.5)))
        </code>
      ),
      officialSource: "Global Strategy for Prevention, Diagnosis and Management of COPD",
      officialSourceUrl: "https://goldcopd.org/2024-gold-reports/",
      paperTitle: "Global Strategy for COPD Diagnosis and Management: 2026 Guidelines Update",
      paperUrl: "https://goldcopd.org/gold-reports/",
      lastUpdated: "2026"
    },
    {
      id: 7,
      name: "CHA₂DS₂-VASc Score",
      fullForm: "Cardiovascular Stroke Risk Staging (ESC/ACC Atrial Fibrillation Guidelines)",
      purpose: "Stratify stroke risk in patients diagnosed with Atrial Fibrillation.",
      organ: "brain",
      icon: TbBrain,
      colorClass: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60",
      badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
      biomarkers: ["Congestive Heart Failure History", "Hypertension History", "Age (years)", "Diabetes Status", "Prior Stroke / TIA", "Vascular Disease History", "Biological Sex (Female/Male)"],
      mathConcept: "Additive Clinical Scoring Matrix",
      formulaHtml: (
        <div className="space-y-2 py-1 font-sans text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
          <div>Stroke Risk Index Score = C + H + A<sub>2</sub> + D + S<sub>2</sub> + V + A + Sc</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-normal text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/60 dark:bg-slate-950/40 p-2.5 rounded-lg mt-1 border border-slate-200/40 dark:border-slate-800/50">
            <div><strong>C:</strong> CHF history (1 pt)</div>
            <div><strong>H:</strong> Hypertension (1 pt)</div>
            <div><strong>A<sub>2</sub>:</strong> Age &ge; 75 (2 pts)</div>
            <div><strong>D:</strong> Diabetes (1 pt)</div>
            <div><strong>S<sub>2</sub>:</strong> Stroke/TIA history (2 pts)</div>
            <div><strong>V:</strong> Vascular history (1 pt)</div>
            <div><strong>A:</strong> Age 65-74 (1 pt)</div>
            <div><strong>Sc:</strong> Female sex category (1 pt)</div>
          </div>
        </div>
      ),
      terminology: [
        { abbreviation: "TIA", definition: "Transient Ischemic Attack (temporary, focal neurological deficit caused by blood flow interruption)" },
        { abbreviation: "Atrial Fibrillation", definition: "Cardiac arrhythmia characterized by irregular, rapid electrical activation of the atria" },
        { abbreviation: "Vascular Disease", definition: "Pathological narrowing or occlusion of arterial walls (e.g., coronary disease, plaque)" }
      ],
      interpretation: "Accumulating points increases calculated risk of arterial thromboembolism, mapping to a lower Brain Integrity Score.",
      whyUsed: "Standard recommendation in ACC/AHA and European Society of Cardiology clinical guidelines for managing stroke risk.",
      normalization: "Converts accumulated clinical points into bracketed integrity score values representing clinical status risk.",
      normalizationFormulaHtml: (
        <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400 font-mono">
          <div>Score 0 (or 1 if female) &rarr; Integrity Score = 95.0 (Low Risk)</div>
          <div>Score 2 &rarr; Integrity Score = 75.0 (Moderate Risk)</div>
          <div>Score 3 – 4 &rarr; Integrity Score = 55.0 (High Risk)</div>
          <div>Score &ge; 5 &rarr; Integrity Score = 35.0 (Critical Risk)</div>
        </div>
      ),
      officialSource: "ESC Guidelines for Atrial Fibrillation Management",
      officialSourceUrl: "https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Atrial-Fibrillation-Management",
      paperTitle: "Refinement of Stroke Risk Stratification in Patients with Atrial Fibrillation (Lip GYH, et al. Chest 2010)",
      paperUrl: "https://journal.chestnet.org/article/S0012-3692(10)60083-4/fulltext",
      lastUpdated: "2020"
    }
  ];

  const organFilters = [
    { value: "all", label: "All Systems" },
    { value: "heart", label: "Cardiovascular (Heart)" },
    { value: "kidneys", label: "Renal (Kidneys)" },
    { value: "liver", label: "Hepatic (Liver)" },
    { value: "lungs", label: "Pulmonary (Lungs)" },
    { value: "brain", label: "Neurological (Brain)" }
  ];

  const filteredFormulas = formulas.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.fullForm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.biomarkers.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesOrgan = selectedOrgan === "all" || item.organ === selectedOrgan;

    return matchesSearch && matchesOrgan;
  });

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
              <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
                <TbMathFunction />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Clinical Formula Knowledge Center
                </h1>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Evidence-Based Medical Scoring Systems Used by AURA Health
                </p>
              </div>
            </div>
            
            <div className="text-left md:text-right border-l-2 md:border-l-0 md:border-r-2 border-slate-300 dark:border-slate-700 pl-3 md:pl-0 pr-3">
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-905">
                Methodology Center
              </span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1">Educational Reference</p>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed max-w-4xl">
            These internationally validated clinical standards are implemented within the Clinical Assessment Engine to generate deterministic organ assessments.
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <TbSearch className="text-base" />
            </span>
            <input
              type="text"
              placeholder="Search formulas or parameters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {organFilters.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedOrgan(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedOrgan === opt.value
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10"
                    : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {filteredFormulas.map((item, index) => {
              const OrganIcon = item.icon;
              const isExpanded = expandedCard === item.id;
              
              return (
                <motion.div
                  key={item.id}
                  layoutId={`formula-card-${item.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden"
                >
                  {/* Card Header (Visible initially) */}
                  <div 
                    onClick={() => setExpandedCard(isExpanded ? null : item.id)}
                    className="p-6 md:p-8 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-xl border ${item.colorClass}`}>
                        <OrganIcon />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-slate-950 dark:text-white tracking-tight">
                            {item.name}
                          </h3>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                            {item.organ.toUpperCase()} SYSTEM
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5 tracking-tight line-clamp-1">
                          {item.fullForm}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pl-4">
                      <span className="hidden sm:inline-block text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-900/60">
                        {item.mathConcept}
                      </span>
                      <button className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-base hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        {isExpanded ? <TbChevronUp /> : <TbChevronDown />}
                      </button>
                    </div>
                  </div>

                  {/* Card Body (Visible when expanded) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-slate-100 dark:border-slate-800/80"
                      >
                        <div className="p-6 md:p-8 space-y-6">
                          
                          {/* Top Specs Grid */}
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                                  Medical Purpose
                                </span>
                                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 font-semibold mt-1">
                                  {item.purpose}
                                </p>
                              </div>

                              <div>
                                <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                                  Required Input Parameters
                                </span>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {item.biomarkers.map((bio) => (
                                    <span 
                                      key={bio}
                                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold text-[10px] border border-slate-200/50 dark:border-slate-800"
                                    >
                                      {bio}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                                  Clinical Interpretation
                                </span>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                                  {item.interpretation}
                                </p>
                              </div>

                              <div>
                                <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                                  Why AURA AI Integrates It
                                </span>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                                  {item.whyUsed}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Mathematical Formula Box */}
                          <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider block mb-2">
                              Clinically Derived Equation Implementation
                            </span>
                            {item.formulaHtml}
                          </div>

                          {/* Normalization & Mapping Section */}
                          <div className="bg-blue-50/40 dark:bg-blue-950/15 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-3">
                            <div>
                              <span className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400 tracking-wider block">
                                Aura 0–100 Organ Integrity Normalization
                              </span>
                              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1">
                                {item.normalization}
                              </p>
                            </div>
                            
                            {item.normalizationFormulaHtml && (
                              <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-blue-100/50 dark:border-blue-900/20">
                                {item.normalizationFormulaHtml}
                              </div>
                            )}
                          </div>

                          {/* Medical Terminology Glossary */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider block">
                              Glossary / Medical Terminology
                            </span>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {item.terminology.map((t) => (
                                <div key={t.abbreviation} className="bg-slate-100/30 dark:bg-slate-800/20 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40 text-xs">
                                  <span className="font-extrabold text-blue-600 dark:text-blue-400 block mb-0.5">
                                    {t.abbreviation}
                                  </span>
                                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                                    {t.definition}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* References / Official Guidelines */}
                          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                            <div className="flex items-start gap-2.5">
                              <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm shrink-0 border border-blue-100 dark:border-blue-900/40">
                                <TbBookmark />
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-400 dark:text-slate-500 block uppercase text-[10px]">
                                  Official Staging Guideline:
                                </span>
                                <a 
                                  href={item.officialSourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-800 dark:text-slate-200 font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 hover:underline mt-0.5"
                                >
                                  <span>{item.officialSource}</span>
                                  <TbExternalLink className="text-[10px]" />
                                </a>
                              </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                              <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm shrink-0 border border-emerald-100 dark:border-emerald-900/40">
                                <TbActivity />
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-400 dark:text-slate-500 block uppercase text-[10px]">
                                  Original Research Paper:
                                </span>
                                <a 
                                  href={item.paperUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-800 dark:text-slate-200 font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 hover:underline mt-0.5"
                                >
                                  <span className="line-clamp-1">{item.paperTitle}</span>
                                  <TbExternalLink className="text-[10px] shrink-0" />
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Guideline Update Metadata */}
                          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-semibold pt-2">
                            <span>Guideline Standard Class: Deterministic Algorithm</span>
                            <span>Last Updated Guideline Year: {item.lastUpdated}</span>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredFormulas.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/80">
              <TbInfoSquareRounded className="text-4xl text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500">No formula matches found. Try another search query.</p>
            </div>
          )}
        </div>

        {/* Informational Disclaimer Box */}
        <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 flex items-start gap-4">
          <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg shrink-0 border border-slate-200/50 dark:border-slate-800">
            <TbInfoCircle />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Educational Reference Portal
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              This Center provides an interactive clinical index documentation and does not run real-time clinical simulations or user calculation engines on this page. All mathematical evaluations displayed serve as read-only academic representations.
            </p>
          </div>
        </div>

        {/* Footer Clinical Disclaimer */}
        <footer className="text-center pt-8 border-t border-slate-200 dark:border-slate-800/60">
          <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-semibold max-w-4xl mx-auto leading-relaxed">
            Clinical Disclaimer: AURA Health implements internationally recognized clinical guidelines for educational decision support. Clinical scores are generated using deterministic algorithms based on published medical standards and are intended to support—not replace—professional medical judgment. Always consult a qualified healthcare provider for diagnosis and treatment decisions.
          </p>
        </footer>

      </div>
    </DashboardLayout>
  );
}
