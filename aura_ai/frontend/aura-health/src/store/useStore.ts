import { create } from "zustand";
import { fetchHealthReport, API_BASE } from "@/services/api";
import i18n from "i18next";

export type RiskLevel = "low" | "moderate" | "high" | "critical" | "healthy";
export type DietType = "balanced" | "average" | "poor";

export interface LifestyleData {
  age: number;
  sex: "male" | "female";
  bmi: number;
  sleep: number;
  activity: number;
  smoking: boolean;
  alcohol: boolean;
  diet: DietType;
  allergies?: string;
  existingDiseases?: string;
  medications?: string;
  familyHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
  primaryDisease?: string;
  sectors?: Record<string, boolean>;
  minorSurgeries?: string;
  majorSurgeries?: string;
}

export interface OrganReadiness {
  organ_name: string;
  status: "Ready" | "Partially Ready" | "Waiting for Reports";
  is_ready: boolean;
  required_reports: string[];
  required_biomarkers: string[];
  present_biomarkers: string[];
  missing_biomarkers: string[];
  clinical_standard: string;
  clinical_formula: string;
  why_waiting: string;
}

export interface ClinicalAssessmentsData {
  organ_assessments: Record<string, OrganScore>;
  readiness_state: Record<string, any>;
  overall_clinical_status: string;
  biomarker_snapshot: Record<string, any>;
}

export interface PassportData {
  passport_level: number;
  passport_title: string;
  active_clinical_assessments: Array<{organ: string, formula: string, citation: string, confidence: string, date: string}>;
  module_readiness: Record<string, any>;
}

export interface WellnessAssessment {
  assessment_type: "wellness_layer";
  overall_lifestyle_tier: string;
  wellness_score?: number;
  lifestyle_biological_age_estimate?: number;
  normalized_diseases?: string[];
  risk_factors: { category: string; severity: string; title: string; description: string }[];
  preventive_insights: string[];
  wellness_recommendations: string[];
  disclaimer: string;
}

export interface LifestyleAIInterpretation {
  summary: string;
  positive_habits: string[];
  lifestyle_concerns: string[];
  recommendations: string[];
  preventive_screenings: string[];
  weekly_action_plan: string[];
  motivation: string;
  is_ai_generated?: boolean;
}

export interface OrganScore {
  status?: "Ready" | "Waiting for Reports" | "Partially Ready" | "Active";
  is_active?: boolean;
  numerical_score?: number | null;
  aura_visualization_index?: number | null;
  risk_label: RiskLevel | string;
  top_factor: string;
  explanation: string;
  recommendation: string;
  formula_name?: string;
  formula_version?: string;
  source_citation?: string;
  input_snapshot?: Record<string, any>;
  confidence_level?: string;
  missing_biomarkers?: string[];
  why_waiting?: string;
}

export interface OrganInsights {
  heart: OrganScore;
  lungs: OrganScore;
  liver: OrganScore;
  kidneys: OrganScore;
  brain: OrganScore;
}

export interface EmergencyQRPayload {
  patient_name: string;
  age: number;
  gender: string;
  clinical_scores: {
    heart: number | "Waiting for Reports";
    kidneys: number | "Waiting for Reports";
    liver: number | "Waiting for Reports";
    lungs: number | "Waiting for Reports";
    brain: number | "Waiting for Reports";
  };
}

export function getEmergencyQRPayload(
  user: any,
  lifestyleData: LifestyleData,
  clinicalAssessmentState: MasterClinicalAssessmentState | null
): EmergencyQRPayload {
  const insights = clinicalAssessmentState?.organ_insights;

  const getScore = (key: keyof OrganInsights): number | "Waiting for Reports" => {
    const data = insights?.[key];
    const isActive = Boolean(data?.is_active && data?.status !== "Waiting for Reports");
    if (isActive && typeof data?.numerical_score === "number") {
      return Number.isInteger(data.numerical_score) 
        ? data.numerical_score 
        : parseFloat(data.numerical_score.toFixed(1));
    }
    return "Waiting for Reports";
  };

  return {
    patient_name: user?.full_name || "Registered Patient",
    age: lifestyleData?.age ?? user?.age ?? 30,
    gender: lifestyleData?.sex || user?.gender || "male",
    clinical_scores: {
      heart: getScore("heart"),
      kidneys: getScore("kidneys"),
      liver: getScore("liver"),
      lungs: getScore("lungs"),
      brain: getScore("brain"),
    },
  };
}

export interface HealthReport {
  digital_twin_status?: "profile_only" | "partial_clinical" | "twin_active";
  active_modules_count?: number;
  total_modules_count?: number;
  wellness_assessment?: WellnessAssessment;
  summary: string;
  risk_level: RiskLevel | string;
  organ_insights: OrganInsights;
  causal_narrative: string;
  priority_actions: string[];
  what_if_insight: string;
  feedback_integration: string;
  disclaimer: string;
  language_note: string;
}

  
export interface ReportAnalysis {
  summary: string;
  key_findings: string[];
  organ_impacts: Record<string, string>;
  recommendations: string[];
  language: string;
  primary_specialist_needed?: string;
  risk_level?: RiskLevel;
}

export type OrganScores = OrganInsights;

export interface Doctor {
  hospital_name: string;
  doctor_type: string;
  tier: string;
  rating: number;
  userRatingCount: number;
  address: string;
  phone: string;
  maps_url: string;
}

export interface TrendPoint {
  month: string;
  heart: number;
  lungs: number;
  liver: number;
  kidneys: number;
  brain: number;
}

export interface PrescribedMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface LabValue {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: "normal" | "high" | "low";
}

export interface MedicalRecord {
  id: string;
  documentType: "prescription" | "laboratory" | "blood_test" | "radiology" | "discharge" | "certificate" | "referral" | "diagnostic" | "followup" | "cardiac_panel" | "renal_panel" | "hepatic_panel" | "pulmonary_panel" | "brain_panel" | string;
  documentLabel?: string;
  targetOrgan?: string;
  fileName: string;
  fileUrl?: string;
  uploadDate: string; // ISO string
  visitDate: string;  // YYYY-MM-DD
  hospitalName: string;
  doctorName: string;
  doctorSpecialization: string;
  department: string;
  primaryDiagnosis: string;
  symptoms: string[];
  medicines: PrescribedMedicine[];
  labValues?: LabValue[];
  doctorAdvice: string;
  followUpDate?: string;
  patientName?: string;
  hospitalAddress?: string;
  clinicalNotes?: string;
  riskIndicators: string[];
  ocrText: string;
  aiSummary: string;
  organImpacts: Record<string, string>;
  digitalTwinImpact: string;
}

export interface CareGuidanceData {
  immediate_care_steps: string[];
  dos_and_donts: string[];
  warning_signs: string[];
  supportive_note: string;
  safety_disclaimer: string;
}

export interface HealthProjectionResponse {
  projection: Record<string, number[]>;
  note?: string;
}

export interface MasterClinicalAssessmentState {
  overall_clinical_status: string;
  overall_readiness: string;
  passport_level: number;
  passport_title: string;
  uploaded_reports_count: number;
  organ_insights: OrganInsights;
  wellness_assessment: WellnessAssessment | null;
  module_readiness: Record<string, any>;
  active_clinical_assessments: Array<{ organ: string; formula: string; citation: string; confidence: string; date: string }>;
  medical_timeline: MedicalRecord[];
}

interface StoreState {
  lifestyleData: LifestyleData;
  report: HealthReport | null;
  wellnessData: WellnessAssessment | null;
  clinicalReadiness: Record<string, any> | null;
  clinicalAssessments: ClinicalAssessmentsData | null;
  passportData: PassportData | null;
  clinicalAssessmentState: MasterClinicalAssessmentState | null;
  medicalTimeline: MedicalRecord[];
  extractedBiomarkers: Record<string, any>;
  saveBiomarkers: (biomarkers: Record<string, any>) => void;

  loading: boolean;
  user: any | null;
  hoveredOrgan: keyof OrganInsights | null;
  medicalRecords: MedicalRecord[];
  addMedicalRecord: (record: MedicalRecord) => void;
  deleteMedicalRecord: (id: string) => void;
  setLifestyle: <K extends keyof LifestyleData>(k: K, v: LifestyleData[K]) => void;
  setLifestyleBatch: (data: Partial<LifestyleData>) => void;
  setHoveredOrgan: (o: keyof OrganInsights | null) => void;
  runSimulation: () => Promise<void>;
  setUser: (user: any) => void;
  initializeAuth: () => Promise<void>;
  logout: () => void;
  reportAnalysisData: ReportAnalysis | null;
  analyzing: boolean;
  analyzerError: string | null;
  analyzerStatus: string | null;
  analyzeReport: (file: File, language: string) => Promise<void>;
  recommendedDoctors: Doctor[];
  fetchingDoctors: boolean;
  doctorError: string | null;
  userCity: string;
  setCity: (city: string) => void;
  fetchDoctors: (specialist: string, city: string, risk_level: string) => Promise<void>;
  careGuidanceData: CareGuidanceData | null;
  fetchingGuidance: boolean;
  guidanceError: string | null;
  fetchGuidance: () => Promise<void>;
  careChatData: CareGuidanceData | null;
  sendingChat: boolean;
  chatError: string | null;
  sendCareChatMessage: (query: string) => Promise<void>;
  resetCareChat: () => void;
  lifestyleAIInterpretation: LifestyleAIInterpretation | null;
  isAIInterpretationLoading: boolean;
  lastLifestyleHash: string;
  fetchLifestyleAIInterpretation: (forceRefresh?: boolean) => Promise<void>;

  simulationTimeframe: number; // 0, 1, 2, 3 (Now, 6M, 1Y, 2Y)
  setSimulationTimeframe: (idx: number) => void;
  getOrganRisk: (organ: keyof OrganInsights) => number;
  projectionData: HealthProjectionResponse | null;
  fetchingProjection: boolean;
  projectionError: string | null;
  fetchHealthProjection: () => Promise<void>;
  // Voice AI
  voiceMessages: { role: "user" | "ai"; content: string }[];
  sendingVoice: boolean;
  voiceError: string | null;
  sendVoiceConsult: (message: string, isVoice?: boolean) => Promise<void>;
  resetVoiceChat: () => void;
}

function parseBiomarkersFromOCR(text: string): Record<string, number> {
  if (!text) return {};
  const biomarkers: Record<string, number> = {};

  // 1. Kidney: Serum Creatinine
  const creatMatch = text.match(/(?:serum\s+creatinine|creatinine|s\.\s*creatinine)\s*[:\-\s]+(\d+(?:\.\d+)?)/i);
  if (creatMatch) biomarkers.serum_creatinine = parseFloat(creatMatch[1]);

  // 2. Heart: Total Cholesterol, HDL, LDL, Systolic BP, Diastolic BP
  const tcMatch = text.match(/(?:total\s+cholesterol|cholesterol)\s*[:\-\s]+(\d+(?:\.\d+)?)/i);
  if (tcMatch) biomarkers.total_cholesterol = parseFloat(tcMatch[1]);

  const hdlMatch = text.match(/(?:hdl\s+cholesterol|hdl)\s*[:\-\s]+(\d+(?:\.\d+)?)/i);
  if (hdlMatch) {
    biomarkers.hdl = parseFloat(hdlMatch[1]);
    biomarkers.hdl_cholesterol = parseFloat(hdlMatch[1]);
  }

  const sbpMatch = text.match(/(?:systolic\s+blood\s+pressure|systolic\s+bp|systolic)\s*[:\-\s]+(\d+(?:\.\d+)?)/i);
  if (sbpMatch) biomarkers.systolic_bp = parseFloat(sbpMatch[1]);

  const dbpMatch = text.match(/(?:diastolic\s+blood\s+pressure|diastolic\s+bp|diastolic)\s*[:\-\s]+(\d+(?:\.\d+)?)/i);
  if (dbpMatch) biomarkers.diastolic_bp = parseFloat(dbpMatch[1]);

  // 3. Liver: Total Bilirubin, INR, AST, ALT
  const biliMatch = text.match(/(?:total\s+bilirubin|t\.\s*bilirubin|bilirubin)\s*[:\-\s]+(\d+(?:\.\d+)?)/i);
  if (biliMatch) biomarkers.total_bilirubin = parseFloat(biliMatch[1]);

  const inrMatch = text.match(/(?:inr|prothrombin\s+time\s+inr)\s*[:\-\s]+(\d+(?:\.\d+)?)/i);
  if (inrMatch) biomarkers.inr = parseFloat(inrMatch[1]);

  const astMatch = text.match(/(?:sgot\s*\/\s*ast|sgot|ast)\s*[:\-\s]+(\d+(?:\.\d+)?)/i);
  if (astMatch) biomarkers.ast = parseFloat(astMatch[1]);

  const altMatch = text.match(/(?:sgpt\s*\/\s*alt|sgpt|alt)\s*[:\-\s]+(\d+(?:\.\d+)?)/i);
  if (altMatch) biomarkers.alt = parseFloat(altMatch[1]);

  return biomarkers;
}

/**
 * Re-classifies a medical record's targetOrgan and documentType based on its
 * ocrText content. This fixes stale records loaded from localStorage that were
 * misclassified by previous classifier bugs (e.g. "cap" substring matching "KAPOOR").
 */
function reclassifyRecord(rec: MedicalRecord): MedicalRecord {
  // If already correctly classified with a valid targetOrgan, skip
  if (rec.targetOrgan && ["heart", "kidneys", "liver", "lungs", "brain"].includes(rec.targetOrgan)) {
    return rec;
  }
  
  const text = `${rec.ocrText || ""} ${rec.documentLabel || ""} ${rec.fileName || ""} ${rec.primaryDiagnosis || ""}`.toLowerCase();
  
  // Cardiac / Heart detection
  if (text.includes("lipid") || text.includes("cholesterol") || text.includes("cardiac") || text.includes("cardiac panel")) {
    return { ...rec, targetOrgan: "heart", documentType: "cardiac_panel", documentLabel: rec.documentLabel || "Cardiac & Lipid Panel Report" };
  }
  
  // Renal / Kidney detection
  if (text.includes("creatinine") || text.includes("kidney") || text.includes("kft") || text.includes("rft") || text.includes("renal")) {
    return { ...rec, targetOrgan: "kidneys", documentType: "renal_panel", documentLabel: rec.documentLabel || "Renal & Kidney Function Test (KFT)" };
  }
  
  // Hepatic / Liver detection
  if (text.includes("bilirubin") || text.includes("lft") || text.includes("hepatic") || text.includes("liver") || text.includes("sgot") || text.includes("sgpt")) {
    return { ...rec, targetOrgan: "liver", documentType: "hepatic_panel", documentLabel: rec.documentLabel || "Hepatic & Liver Function Test (LFT)" };
  }
  
  // Pulmonary / Lungs detection
  if (text.includes("spirometry") || text.includes("fev1") || text.includes("pulmonary") || text.includes("pft")) {
    return { ...rec, targetOrgan: "lungs", documentType: "pulmonary_panel", documentLabel: rec.documentLabel || "Pulmonary Function Test (PFT)" };
  }
  
  // Brain / Neurological detection
  if (text.includes("neurological") || text.includes("brain") || text.includes("stroke") || text.includes("cha2ds2")) {
    return { ...rec, targetOrgan: "brain", documentType: "brain_panel", documentLabel: rec.documentLabel || "Neurological Report" };
  }
  
  return rec;
}

const LIFESTYLE_SCORING_CONFIG = {
  base_wellness_score: 95,
  min_wellness_score: 35,
  max_wellness_score: 98,
  penalties: {
    smoker: 15,
    alcohol_exceeds_limit: 8,
    sleep_under_6h: 10,
    sleep_over_9h: 3,
    activity_sedentary: 8,
    activity_light: 4,
    bmi_obese: 12,
    bmi_overweight: 5,
    bmi_underweight: 4,
    diet_poor: 8,
    diet_average: 2,
    clinical_sector_per_active: 3,
    disease_burden_high: 12,
    disease_burden_moderate: 6,
  },
  bio_age_deltas: {
    smoker: 3.5,
    alcohol: 1.5,
    bmi_obese: 3.0,
    bmi_overweight: 1.0,
    bmi_healthy: -1.0,
    sleep_under_6h: 2.0,
    sleep_healthy: -1.0,
    activity_vigorous: -2.0,
    activity_sedentary: 2.0,
    diet_balanced: -1.5,
    diet_poor: 2.0,
  }
};

const DISEASE_NORMALIZATION_MAP: Record<string, string> = {
  htn: "Hypertension (High Blood Pressure)",
  "high bp": "Hypertension (High Blood Pressure)",
  bp: "Hypertension (High Blood Pressure)",
  hypertension: "Hypertension (High Blood Pressure)",
  dm: "Diabetes Mellitus",
  "type 2 diabetes": "Diabetes Mellitus",
  "type 1 diabetes": "Diabetes Mellitus",
  diabetes: "Diabetes Mellitus",
  sugar: "Diabetes Mellitus",
  "blood sugar": "Diabetes Mellitus",
  asthma: "Chronic Respiratory Condition",
  copd: "Chronic Respiratory Condition",
  pulmonary: "Chronic Respiratory Condition",
  "fatty liver": "Hepatic / Metabolic Condition",
  cirrhosis: "Hepatic / Metabolic Condition",
  liver: "Hepatic / Metabolic Condition",
  ckd: "Renal Condition",
  "kidney disease": "Renal Condition",
  renal: "Renal Condition",
  thyroid: "Thyroid Disorder",
  cardio: "Cardiovascular Condition",
  chd: "Cardiovascular Condition",
  "heart attack": "Cardiovascular Condition",
  "heart disease": "Cardiovascular Condition",
};

const FAMILY_HISTORY_PATTERNS: Record<string, string[]> = {
  cardiovascular: ["heart", "cardio", "coronary", "attack", "angina", "bp", "hypertension"],
  metabolic: ["diabetes", "sugar", "thyroid", "obesity"],
  neurological: ["stroke", "brain", "dementia", "parkinson", "alzheimer"],
  oncology: ["cancer", "tumor", "malignancy", "carcinoma"]
};

function normalizeDiseaseTermsTS(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [];
  const normalized = new Set<string>();
  const lower = rawText.toLowerCase();
  Object.entries(DISEASE_NORMALIZATION_MAP).forEach(([key, canonical]) => {
    if (lower.includes(key)) normalized.add(canonical);
  });
  return Array.from(normalized);
}

function parseFamilyHistoryCategoriesTS(rawText: string): Record<string, boolean> {
  if (!rawText || !rawText.trim()) {
    return { cardiovascular: false, metabolic: false, neurological: false, oncology: false };
  }
  const lower = rawText.toLowerCase();
  const res: Record<string, boolean> = {};
  Object.entries(FAMILY_HISTORY_PATTERNS).forEach(([category, keywords]) => {
    res[category] = keywords.some((kw) => lower.includes(kw));
  });
  return res;
}

function evaluateWellnessAssessmentFallback(lifestyle: LifestyleData, userProfile?: any): WellnessAssessment {
  const age = lifestyle?.age || userProfile?.age || 32;
  const sex = (lifestyle?.sex || userProfile?.gender || "male").toLowerCase();
  const sleep = lifestyle?.sleep ?? 7;
  const activity = lifestyle?.activity ?? 3;
  const smoker = Boolean(lifestyle?.smoking);
  const alcohol = Boolean(lifestyle?.alcohol);
  const bmi = lifestyle?.bmi || 22.5;
  const diet = lifestyle?.diet || "average";
  const familyHistoryRaw = lifestyle?.familyHistory || userProfile?.family_history || "";
  const primaryDiseaseRaw = lifestyle?.primaryDisease || userProfile?.primary_disease || "";
  const majorSurgeries = lifestyle?.majorSurgeries || userProfile?.major_surgeries || "";
  const sectors = lifestyle?.sectors || userProfile?.sectors || {};

  const cfg = LIFESTYLE_SCORING_CONFIG;
  const penalties = cfg.penalties;
  const bioDeltas = cfg.bio_age_deltas;

  let score = cfg.base_wellness_score;
  let bioAgeDelta = 0.0;

  const riskFactors: { category: string; severity: string; title: string; description: string }[] = [];
  const preventiveInsights: string[] = [];
  const recommendations: string[] = [];

  // 1. Sleep Assessment
  if (sleep < 6) {
    score -= penalties.sleep_under_6h;
    bioAgeDelta += bioDeltas.sleep_under_6h;
    riskFactors.push({ category: "Sleep Recovery", severity: "Moderate", title: "Short Sleep Duration (<6 hrs)", description: "Getting fewer than 6 hours of sleep regularly impacts recovery and stress regulation." });
    preventiveInsights.push("Poor sleep may increase long-term cardiovascular and metabolic strain.");
    recommendations.push("Target 7–8 hours of quality sleep nightly to improve autonomic recovery.");
  } else if (sleep > 9) {
    score -= penalties.sleep_over_9h;
    preventiveInsights.push("Prolonged sleep duration (>9 hrs) can sometimes reflect low physical activity or fatigue.");
  } else {
    bioAgeDelta += bioDeltas.sleep_healthy;
  }

  // 2. Tobacco Assessment
  if (smoker) {
    score -= penalties.smoker;
    bioAgeDelta += bioDeltas.smoker;
    riskFactors.push({ category: "Tobacco Exposure", severity: "High", title: "Active Tobacco Exposure", description: "Tobacco use is a primary driver of respiratory and vascular strain over time." });
    preventiveInsights.push("Smoking increases future lung and cardiovascular disease risk.");
    recommendations.push("Consider structured tobacco cessation guidance to reduce overall vascular strain.");
  }

  // 3. Alcohol Assessment
  const weeklyLimit = sex.includes("f") ? 7.0 : 14.0;
  if (alcohol) {
    score -= penalties.alcohol_exceeds_limit;
    bioAgeDelta += bioDeltas.alcohol;
    riskFactors.push({ category: "Alcohol Intake", severity: "Moderate", title: "Regular Alcohol Consumption", description: `Consuming >${weeklyLimit.toFixed(0)} units/week increases metabolic and hepatic strain.` });
    preventiveInsights.push("Frequent high alcohol intake can elevate blood pressure and metabolic load over time.");
    recommendations.push(`Moderate weekly alcohol consumption to below ${weeklyLimit.toFixed(0)} units.`);
  }

  // 4. BMI Assessment
  if (bmi >= 30.0) {
    score -= penalties.bmi_obese;
    bioAgeDelta += bioDeltas.bmi_obese;
    riskFactors.push({ category: "Metabolic", severity: "High", title: "Elevated Body Mass Index (BMI ≥ 30)", description: "Higher adiposity increases long-term metabolic and joint strain." });
    preventiveInsights.push("Elevated body mass places progressive load on cardiovascular and renal systems.");
    recommendations.push("Incorporate daily low-impact aerobic exercise and nutritional balance.");
  } else if (bmi >= 25.0) {
    score -= penalties.bmi_overweight;
    bioAgeDelta += bioDeltas.bmi_overweight;
    riskFactors.push({ category: "Metabolic", severity: "Moderate", title: "Overweight BMI (25.0 - 29.9)", description: "Mildly elevated body weight." });
    preventiveInsights.push("Maintaining a balanced weight supports long-term metabolic health.");
  } else if (bmi < 18.5) {
    score -= penalties.bmi_underweight;
    preventiveInsights.push("Underweight BMI (<18.5) may require dietary evaluation to support muscle mass.");
  } else {
    bioAgeDelta += bioDeltas.bmi_healthy;
  }

  // 5. Activity Assessment
  if (activity <= 1) {
    score -= penalties.activity_sedentary;
    bioAgeDelta += bioDeltas.activity_sedentary;
    riskFactors.push({ category: "Physical Activity", severity: "Moderate", title: "Sedentary Lifestyle", description: "Low physical activity reduces cardiovascular conditioning." });
    preventiveInsights.push("Sedentary habits correlate with reduced vascular elasticity and stamina over time.");
    recommendations.push("Aim for at least 150 minutes of moderate activity (e.g. brisk walking) weekly.");
  } else if (activity >= 3) {
    bioAgeDelta += bioDeltas.activity_vigorous;
  }

  // 6. Diet Quality
  if (diet === "poor") {
    score -= penalties.diet_poor;
    bioAgeDelta += bioDeltas.diet_poor;
    preventiveInsights.push("High intake of processed foods increases systemic inflammatory and glycemic load.");
    recommendations.push("Increase whole grains, fresh vegetables, and lean proteins in daily diet.");
  } else if (diet === "balanced") {
    bioAgeDelta += bioDeltas.diet_balanced;
  } else {
    score -= penalties.diet_average;
  }

  // 7. Medical Term Normalization (Refinement #3)
  const normalizedDiseases = normalizeDiseaseTermsTS(primaryDiseaseRaw);
  if (normalizedDiseases.length > 0) {
    score -= penalties.disease_burden_moderate * normalizedDiseases.length;
    const diseaseStr = normalizedDiseases.join(", ");
    preventiveInsights.push(`Documented health condition(s): ${diseaseStr}.`);
    recommendations.push(`Maintain routine clinical follow-up and monitoring for ${diseaseStr}.`);
  }

  // 8. Clinical Focus Sectors
  if (sectors && typeof sectors === "object") {
    const activeCount = Object.values(sectors).filter(Boolean).length;
    if (activeCount > 0) {
      score -= penalties.clinical_sector_per_active * activeCount;
    }
  }

  // 9. Structured Family History Categories (Refinement #4)
  const familyCat = parseFamilyHistoryCategoriesTS(familyHistoryRaw);
  if (familyCat.cardiovascular) {
    preventiveInsights.push("Hereditary cardiovascular risk detected from family history.");
    recommendations.push("Schedule annual lipid profile and resting blood pressure monitoring.");
  }
  if (familyCat.metabolic) {
    preventiveInsights.push("Hereditary metabolic/diabetes risk detected from family history.");
    recommendations.push("Schedule routine annual HbA1c blood sugar screening.");
  }
  if (familyCat.oncology) {
    preventiveInsights.push("Hereditary oncology history documented.");
    recommendations.push("Discuss age-appropriate routine cancer screening with your primary care provider.");
  }

  // 10. Surgical History Guidance (Refinement #5: Follow-up focused, no BioAge penalty)
  if (majorSurgeries && majorSurgeries.trim().length > 3) {
    recommendations.push(`Maintain annual specialist follow-up for major surgical history (${majorSurgeries.trim()}).`);
  }

  if (preventiveInsights.length === 0) {
    preventiveInsights.push("Your general intake indicates strong foundational wellness habits. Keep maintaining regular activity and sleep.");
    recommendations.push("Continue regular wellness checkups and maintain balanced nutrition.");
  }

  const finalScore = Math.max(cfg.min_wellness_score, Math.min(cfg.max_wellness_score, Math.round(score)));
  const lifestyleBioAgeEstimate = Math.max(18, Math.round(age + bioAgeDelta));

  let overall_lifestyle_tier = "Healthy Baseline";
  if (riskFactors.some((r) => r.severity === "High") || finalScore < 65) {
    overall_lifestyle_tier = "Elevated Lifestyle Risk";
  } else if (riskFactors.length >= 2 || finalScore < 82) {
    overall_lifestyle_tier = "Moderate Lifestyle Risk";
  }

  return {
    assessment_type: "wellness_layer",
    overall_lifestyle_tier,
    wellness_score: finalScore,
    lifestyle_biological_age_estimate: lifestyleBioAgeEstimate,
    risk_factors: riskFactors,
    preventive_insights: preventiveInsights,
    wellness_recommendations: Array.from(new Set(recommendations)),
    normalized_diseases: normalizedDiseases,
    disclaimer: "These lifestyle-derived insights are based on non-clinical patient intake demographics and habits, not report-derived organ scores."
  };
}

export const useStore = create<StoreState>((set, get) => ({
  lifestyleData: {
    age: 32,
    sex: "male",
    bmi: 27,
    sleep: 5.5,
    activity: 2,
    smoking: true,
    alcohol: true,
    diet: "average",
  },
  lifestyleAIInterpretation: null,
  isAIInterpretationLoading: false,
  lastLifestyleHash: "",
  fetchLifestyleAIInterpretation: async (forceRefresh = false) => {
    const { lifestyleData, user, wellnessData, lifestyleAIInterpretation, lastLifestyleHash } = get();
    
    // Construct dynamic non-PII payload (Refinements #3 & #4)
    const currentPayload = {
      age: lifestyleData.age ?? user?.age ?? 32,
      sex: lifestyleData.sex || user?.gender || "male",
      bmi: lifestyleData.bmi || 22.5,
      height: user?.height || 175,
      weight: user?.weight || 72,
      sleep: lifestyleData.sleep ?? 7,
      activity: lifestyleData.activity ?? 3,
      smoking: Boolean(lifestyleData.smoking),
      alcohol: Boolean(lifestyleData.alcohol),
      diet: lifestyleData.diet || "average",
      normalized_diseases: wellnessData?.normalized_diseases || [],
      sectors: lifestyleData.sectors || user?.sectors || {},
      family_history_categories: parseFamilyHistoryCategoriesTS(lifestyleData.familyHistory || user?.family_history || ""),
      major_surgeries: lifestyleData.majorSurgeries || user?.major_surgeries || "None",
      wellness_score: wellnessData?.wellness_score ?? 88,
      overall_lifestyle_tier: wellnessData?.overall_lifestyle_tier ?? "Healthy Baseline",
      lifestyle_biological_age_estimate: wellnessData?.lifestyle_biological_age_estimate ?? 32
    };

    const payloadHash = JSON.stringify(currentPayload);

    // Intelligent Caching (Refinement #6): Reuse existing result if input hasn't changed
    if (!forceRefresh && lifestyleAIInterpretation && lastLifestyleHash === payloadHash) {
      return;
    }

    set({ isAIInterpretationLoading: true });

    try {
      const axiosModule = await import("axios");
      const axios = axiosModule.default;
      const res = await axios.post(`${API_BASE}/v1/lifestyle-ai-interpretation`, currentPayload);
      if (res.data) {
        set({
          lifestyleAIInterpretation: res.data,
          lastLifestyleHash: payloadHash,
          isAIInterpretationLoading: false
        });
        return;
      }
    } catch (err) {
      console.warn("AI Lifestyle Interpretation API fallback:", err);
    }

    // Rule-Based Fallback if Gemini unavailable (Refinement #7)
    const fallbackResult: LifestyleAIInterpretation = {
      summary: `Your lifestyle assessment shows an overall wellness score of ${currentPayload.wellness_score}/100 with a '${currentPayload.overall_lifestyle_tier}' tier. Based on your intake habits, your estimated lifestyle bio age is ${currentPayload.lifestyle_biological_age_estimate} years.`,
      positive_habits: [
        currentPayload.sleep >= 7 ? "Adequate sleep duration (7+ hours nightly)." : "Active completion of wellness intake tracking.",
        !currentPayload.smoking ? "Non-smoker maintaining vascular health." : "Regular tracking of personal health goals.",
        !currentPayload.alcohol ? "Zero alcohol consumption minimizing metabolic load." : "Proactive metabolic health awareness."
      ],
      lifestyle_concerns: [
        currentPayload.sleep < 6 ? "Short sleep duration (<6h) affecting autonomic recovery." : "Sedentary activity risks over prolonged periods.",
        currentPayload.bmi >= 25 ? `Body Mass Index (${currentPayload.bmi}) is elevated.` : "Ongoing nutritional balance requirements."
      ],
      recommendations: [
        "Aim for at least 150 minutes of moderate aerobic exercise weekly.",
        "Maintain a consistent sleep routine aiming for 7-8 hours per night.",
        "Focus on whole-food nutrition with adequate daily hydration."
      ],
      preventive_screenings: [
        "Schedule routine annual preventive health examinations with your primary physician.",
        "Track blood pressure and metabolic panel baselines annually."
      ],
      weekly_action_plan: [
        "Take a 20-minute walk after dinner 4 days this week.",
        "Set a fixed bedtime 30 minutes earlier to improve sleep recovery."
      ],
      motivation: "Small, consistent daily habits build strong long-term health resilience. Keep taking positive steps for your well-being!",
      is_ai_generated: false
    };

    set({
      lifestyleAIInterpretation: fallbackResult,
      lastLifestyleHash: payloadHash,
      isAIInterpretationLoading: false
    });
  },
  projectionData: null,
  fetchingProjection: false,
  projectionError: null,
  simulationTimeframe: 0,
  setSimulationTimeframe: (idx) => set({ simulationTimeframe: idx }),
  getOrganRisk: (organ) => {
    const s = get();
    if (s.simulationTimeframe === 0) {
      return s.report?.organ_insights[organ]?.numerical_score || 0;
    }
    if (s.projectionData && s.projectionData.projection[organ]) {
      return s.projectionData.projection[organ][s.simulationTimeframe] || 0;
    }
    return s.report?.organ_insights[organ]?.numerical_score || 0;
  },
  medicalRecords: (JSON.parse(localStorage.getItem("twin_medical_records") || "[]") as MedicalRecord[]).map(reclassifyRecord),
  addMedicalRecord: (record) => {
    console.log("[PIPELINE 7] addMedicalRecord called with record:", record);
    set((state) => {
      const updated = [record, ...state.medicalRecords];
      localStorage.setItem("twin_medical_records", JSON.stringify(updated));
      console.log("[PIPELINE 8] Zustand updated medicalRecords array. New length:", updated.length);
      return { medicalRecords: updated, medicalTimeline: updated };
    });
    import("axios").then(({ default: axios }) => {
      axios.post(`${API_BASE}/v1/medical-records`, record).catch((e) => console.error("MongoDB Save Error:", e));
    });
    get().runSimulation();
  },
  deleteMedicalRecord: (id) => {
    set((state) => {
      const updated = state.medicalRecords.filter((r) => r.id !== id);
      localStorage.setItem("twin_medical_records", JSON.stringify(updated));
      return { medicalRecords: updated, medicalTimeline: updated };
    });
    import("axios").then(({ default: axios }) => {
      axios.delete(`${API_BASE}/v1/medical-records/${id}`).catch((e) => console.error("MongoDB Delete Error:", e));
    });
    get().runSimulation();
  },
  report: null,
  wellnessData: null,
  clinicalReadiness: null,
  clinicalAssessments: null,
  passportData: null,
  clinicalAssessmentState: null,
  medicalTimeline: (JSON.parse(localStorage.getItem("twin_medical_records") || "[]") as MedicalRecord[]).map(reclassifyRecord),
  loading: false,
  user: null,
  hoveredOrgan: null,
  setLifestyle: (k, v) => {
    set((s) => ({ lifestyleData: { ...s.lifestyleData, [k]: v } }));
    get().runSimulation();
  },
  setLifestyleBatch: (data) => {
    set((s) => ({ lifestyleData: { ...s.lifestyleData, ...data } }));
    get().runSimulation();
  },
  setHoveredOrgan: (o) => set({ hoveredOrgan: o }),
  logout: () => {
    localStorage.removeItem("twin_token");
    set({
      user: null,
      report: null,
      projectionData: null,
      projectionError: null,
      fetchingProjection: false,
    });
  },
  setUser: (user) => set({ user }),
  initializeAuth: async () => {
    const token = localStorage.getItem("twin_token");
    const savedProfile = localStorage.getItem("twin_user_profile");
    const localProfile = savedProfile ? JSON.parse(savedProfile) : {};

    const mapProfileToLifestyle = (profile: any, currentLifestyle: any) => {
      if (!profile) return currentLifestyle;
      if (profile.lifestyle_data) {
        return { ...currentLifestyle, ...profile.lifestyle_data };
      }
      
      if (!profile.age) return currentLifestyle;
      const calcBmi = profile.weight && profile.height ? (profile.weight / ((profile.height/100) * (profile.height/100))) : null;
      return {
        ...currentLifestyle,
        age: profile.age,
        sex: profile.gender === "female" ? "female" : "male",
        bmi: calcBmi || profile.bmi || currentLifestyle.bmi,
      };
    };

    // Fetch medical records from MongoDB on load & merge with local records (preserving upload order & deduplicating by ID)
    import("axios").then(({ default: axios }) => {
      axios.get(`${API_BASE}/v1/medical-records`)
        .then((res) => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            const currentRecords = get().medicalRecords;
            const mongoRecords: MedicalRecord[] = res.data.map(reclassifyRecord);
            
            // Map current records by ID to preserve local state & deduplicate
            const recordMap = new Map<string, MedicalRecord>();
            currentRecords.forEach((r) => recordMap.set(r.id, r));
            mongoRecords.forEach((r) => {
              if (!recordMap.has(r.id)) {
                recordMap.set(r.id, r);
              }
            });

            const merged = Array.from(recordMap.values());
            set({ medicalRecords: merged, medicalTimeline: merged });
            localStorage.setItem("twin_medical_records", JSON.stringify(merged));
            get().runSimulation();
          }
        })
        .catch((err) => console.log("MongoDB records sync:", err));
    });

    if (!token) {
      if (localProfile && localProfile.full_name) {
        set({ 
          user: localProfile, 
          lifestyleData: mapProfileToLifestyle(localProfile, get().lifestyleData) 
        });
      }
      get().runSimulation();
      return;
    }

    try {
      const { fetchCurrentUser } = await import("@/services/api");
      const fetchedUser = await fetchCurrentUser();
      const mergedUser = { ...localProfile, ...fetchedUser };
      set({ 
        user: mergedUser,
        lifestyleData: {
          ...mapProfileToLifestyle(localProfile, get().lifestyleData),
          ...fetchedUser.lifestyle_data,
        }
      });
      get().runSimulation();
    } catch (e) {
      console.error("Auth initialization failed:", e);
      if (localProfile && localProfile.full_name) {
        set({ 
          user: localProfile, 
          lifestyleData: mapProfileToLifestyle(localProfile, get().lifestyleData) 
        });
      } else {
        localStorage.removeItem("twin_token");
        set({ user: null });
      }
      get().runSimulation();
    }
  },
  extractedBiomarkers: JSON.parse(localStorage.getItem("twin_extracted_biomarkers") || "{}"),
  saveBiomarkers: (biomarkers: Record<string, any>) => {
    set((state) => {
      const updated = { ...state.extractedBiomarkers, ...biomarkers };
      localStorage.setItem("twin_extracted_biomarkers", JSON.stringify(updated));
      return { extractedBiomarkers: updated };
    });
    get().runSimulation();
  },
  runSimulation: async () => {
    console.log("[PIPELINE 9] runSimulation started. State BEFORE update:", get().clinicalAssessmentState);
    set({ loading: true });
    try {
      const records = get().medicalRecords.map(reclassifyRecord);
      const recordCount = records.length;
      let effectiveBiomarkers = { ...get().extractedBiomarkers };

      console.log(`[PIPELINE 10] records in store: count=${recordCount}`, records);

      // Extract & map real lab values and OCR text from all uploaded medical records
      records.forEach((rec) => {
        const textToParse = `${rec.ocrText || ""} ${rec.fileName || ""} ${rec.aiSummary || ""}`;
        const extractedFromText = parseBiomarkersFromOCR(textToParse);
        effectiveBiomarkers = { ...effectiveBiomarkers, ...extractedFromText };

        if (rec.labValues && Array.isArray(rec.labValues)) {
          rec.labValues.forEach((item: any) => {
            const param = String(item.parameter || "").toLowerCase();
            const val = parseFloat(item.value);
            if (!isNaN(val)) {
              if (param.includes("creatinine")) effectiveBiomarkers.serum_creatinine = val;
              if (param.includes("bp") || param.includes("systolic")) effectiveBiomarkers.systolic_bp = val;
              if (param.includes("diastolic")) effectiveBiomarkers.diastolic_bp = val;
              if (param.includes("cholesterol")) effectiveBiomarkers.total_cholesterol = val;
              if (param.includes("hdl")) {
                effectiveBiomarkers.hdl = val;
                effectiveBiomarkers.hdl_cholesterol = val;
              }
              if (param.includes("bilirubin")) effectiveBiomarkers.total_bilirubin = val;
              if (param.includes("fev1")) effectiveBiomarkers.fev1_pct_predicted = val;
              if (param.includes("inr")) effectiveBiomarkers.inr = val;
            }
          });
        }
      });

      console.log("[PIPELINE 11] effectiveBiomarkers calculated:", effectiveBiomarkers);

      // Determine organ report presence directly from backend classification & targetOrgan
      const hasHeartReport = records.some((r) => r.targetOrgan === "heart" || r.documentType === "cardiac_panel") || Boolean(effectiveBiomarkers.total_cholesterol || effectiveBiomarkers.systolic_bp);
      const hasKidneyReport = records.some((r) => r.targetOrgan === "kidneys" || r.documentType === "renal_panel") || Boolean(effectiveBiomarkers.serum_creatinine);
      const hasLiverReport = records.some((r) => r.targetOrgan === "liver" || r.documentType === "hepatic_panel") || Boolean(effectiveBiomarkers.total_bilirubin || effectiveBiomarkers.inr);
      const hasLungReport = records.some((r) => r.targetOrgan === "lungs" || r.documentType === "pulmonary_panel") || Boolean(effectiveBiomarkers.fev1_pct_predicted);
      const hasBrainReport = records.some((r) => r.targetOrgan === "brain" || r.documentType === "brain_panel");

      console.log("[PIPELINE 12] Organ Report Flags:", {
        hasHeartReport,
        hasKidneyReport,
        hasLiverReport,
        hasLungReport,
        hasBrainReport
      });

      const report = await fetchHealthReport(get().lifestyleData, effectiveBiomarkers, i18n.language);
      const axios = (await import("axios")).default;
      const baseUrl = API_BASE;
      
      const payload = {
        user_profile: get().lifestyleData,
        biomarkers: effectiveBiomarkers,
        uploaded_reports_count: recordCount
      };
      
      const [wellnessRes, readinessRes, clinicalRes, passportRes] = await Promise.all([
        axios.post(`${baseUrl}/v1/wellness-assessment`, payload),
        axios.post(`${baseUrl}/v1/health-readiness`, payload),
        axios.post(`${baseUrl}/v1/clinical-assessments`, payload),
        axios.post(`${baseUrl}/v1/passport`, payload)
      ]).catch(e => {
        console.error("Failed to fetch dedicated slices", e);
        return [null, null, null, null];
      });

      // Construct Canonical Master Organ Insights
      const getOrganVal = (key: string, defaultVal: number) => {
        const repVal = report?.organ_insights?.[key as keyof OrganInsights]?.numerical_score;
        if (typeof repVal === "number") return repVal;
        const clinVal = clinicalRes?.data?.organ_assessments?.[key]?.score;
        if (typeof clinVal === "number") return clinVal;
        return defaultVal;
      };

      const masterOrganInsights: OrganInsights = {
        heart: {
          status: hasHeartReport ? "Ready" : "Waiting for Reports",
          is_active: hasHeartReport,
          numerical_score: hasHeartReport ? getOrganVal("heart", 82) : null,
          aura_visualization_index: hasHeartReport ? getOrganVal("heart", 82) : null,
          risk_label: hasHeartReport ? (report?.organ_insights?.heart?.risk_label || "borderline") : "Waiting for Reports",
          top_factor: hasHeartReport ? (report?.organ_insights?.heart?.top_factor || "Systolic Blood Pressure & Lipids") : "Clinical Biomarkers Required",
          explanation: hasHeartReport ? (report?.organ_insights?.heart?.explanation || "Heart assessment active based on verified BP & Lipid profile.") : "Upload clinical lab reports (Lipid Profile, BP) to activate heart assessment.",
          recommendation: report?.organ_insights?.heart?.recommendation || "Maintain balanced diet and periodic BP tracking.",
          formula_name: "AHA PREVENT™ 2023",
          source_citation: "American Heart Association (AHA)",
          confidence_level: hasHeartReport ? "Biomarker Verified" : "Awaiting Laboratory Reports",
          input_snapshot: hasHeartReport ? {
            systolic_bp: effectiveBiomarkers.systolic_bp,
            diastolic_bp: effectiveBiomarkers.diastolic_bp,
            total_cholesterol: effectiveBiomarkers.total_cholesterol,
            hdl_cholesterol: effectiveBiomarkers.hdl || effectiveBiomarkers.hdl_cholesterol,
            ldl_cholesterol: effectiveBiomarkers.ldl,
            triglycerides: effectiveBiomarkers.triglycerides
          } : {}
        },
        lungs: {
          status: hasLungReport ? "Ready" : "Waiting for Reports",
          is_active: hasLungReport,
          numerical_score: hasLungReport ? getOrganVal("lungs", 90) : null,
          aura_visualization_index: hasLungReport ? getOrganVal("lungs", 90) : null,
          risk_label: hasLungReport ? (report?.organ_insights?.lungs?.risk_label || "low") : "Waiting for Reports",
          top_factor: hasLungReport ? (report?.organ_insights?.lungs?.top_factor || "Pulmonary Capacity") : "Clinical Biomarkers Required",
          explanation: hasLungReport ? (report?.organ_insights?.lungs?.explanation || "Lung assessment active based on baseline spirometry.") : "Upload spirometry report (FEV1, FVC) to activate lung assessment.",
          recommendation: report?.organ_insights?.lungs?.recommendation || "Upload Spirometry report to activate.",
          formula_name: "GOLD 2026 Spirometry",
          source_citation: "Global Initiative for Chronic Obstructive Lung Disease",
          confidence_level: hasLungReport ? "Biomarker Verified" : "Awaiting Spirometry Test",
          input_snapshot: hasLungReport ? {
            fev1_pct_predicted: effectiveBiomarkers.fev1_pct_predicted,
            fev1_fvc_ratio: effectiveBiomarkers.fev1_fvc_ratio,
            spo2: effectiveBiomarkers.spo2
          } : {}
        },
        liver: {
          status: hasLiverReport ? "Ready" : "Waiting for Reports",
          is_active: hasLiverReport,
          numerical_score: hasLiverReport ? getOrganVal("liver", 94) : null,
          aura_visualization_index: hasLiverReport ? getOrganVal("liver", 94) : null,
          risk_label: hasLiverReport ? (report?.organ_insights?.liver?.risk_label || "low") : "Waiting for Reports",
          top_factor: hasLiverReport ? (report?.organ_insights?.liver?.top_factor || "Hepatic Enzymes & Bilirubin") : "Clinical Biomarkers Required",
          explanation: hasLiverReport ? (report?.organ_insights?.liver?.explanation || "Liver assessment active based on verified Bilirubin & PT/INR.") : "Upload Liver Function Test (LFT: ALT, AST, Bilirubin, INR) to activate liver assessment.",
          recommendation: report?.organ_insights?.liver?.recommendation || "Upload LFT report to activate.",
          formula_name: "FIB-4 Index / MELD-Na",
          source_citation: "American Association for the Study of Liver Diseases",
          confidence_level: hasLiverReport ? "Biomarker Verified" : "Awaiting Laboratory Reports",
          input_snapshot: hasLiverReport ? {
            total_bilirubin: effectiveBiomarkers.total_bilirubin,
            inr: effectiveBiomarkers.inr,
            ast: effectiveBiomarkers.ast,
            alt: effectiveBiomarkers.alt,
            serum_albumin: effectiveBiomarkers.serum_albumin
          } : {}
        },
        kidneys: {
          status: hasKidneyReport ? "Ready" : "Waiting for Reports",
          is_active: hasKidneyReport,
          numerical_score: hasKidneyReport ? getOrganVal("kidneys", 96) : null,
          aura_visualization_index: hasKidneyReport ? getOrganVal("kidneys", 96) : null,
          risk_label: hasKidneyReport ? (report?.organ_insights?.kidneys?.risk_label || "low") : "Waiting for Reports",
          top_factor: hasKidneyReport ? (report?.organ_insights?.kidneys?.top_factor || "Serum Creatinine & eGFR") : "Clinical Biomarkers Required",
          explanation: hasKidneyReport ? (report?.organ_insights?.kidneys?.explanation || "Kidney assessment active based on verified Serum Creatinine & eGFR.") : "Upload Kidney Function Test (KFT: Serum Creatinine, eGFR, BUN) to activate kidney assessment.",
          recommendation: report?.organ_insights?.kidneys?.recommendation || "Upload KFT report to activate.",
          formula_name: "CKD-EPI 2021 (KDIGO)",
          source_citation: "Kidney Disease: Improving Global Outcomes (KDIGO)",
          confidence_level: hasKidneyReport ? "Biomarker Verified" : "Awaiting Laboratory Reports",
          input_snapshot: hasKidneyReport ? {
            serum_creatinine: effectiveBiomarkers.serum_creatinine,
            blood_urea_nitrogen: effectiveBiomarkers.blood_urea_nitrogen,
            egfr: effectiveBiomarkers.egfr || 96,
            serum_sodium: effectiveBiomarkers.serum_sodium,
            serum_potassium: effectiveBiomarkers.serum_potassium
          } : {}
        },
        brain: {
          status: hasBrainReport ? "Ready" : "Waiting for Reports",
          is_active: hasBrainReport,
          numerical_score: hasBrainReport ? getOrganVal("brain", 95) : null,
          aura_visualization_index: hasBrainReport ? getOrganVal("brain", 95) : null,
          risk_label: hasBrainReport ? (report?.organ_insights?.brain?.risk_label || "low") : "Waiting for Reports",
          top_factor: hasBrainReport ? (report?.organ_insights?.brain?.top_factor || "Vascular Risk & Blood Pressure") : "Clinical Biomarkers Required",
          explanation: hasBrainReport ? (report?.organ_insights?.brain?.explanation || "Brain stroke risk assessment active based on CHA₂DS₂-VASc framework.") : "Upload neurological checkup or BP records to activate stroke risk assessment.",
          recommendation: report?.organ_insights?.brain?.recommendation || "Upload BP & neurological records to activate.",
          formula_name: "CHA₂DS₂-VASc Risk",
          source_citation: "European Society of Cardiology (ESC)",
          confidence_level: hasBrainReport ? "Biomarker Verified" : "Awaiting Neurological Report",
          input_snapshot: hasBrainReport ? {
            systolic_bp: effectiveBiomarkers.systolic_bp,
            stroke_risk_points: 0
          } : {}
        }
      };

      const isUnverified = recordCount === 0;

      const fallbackWellness = evaluateWellnessAssessmentFallback(get().lifestyleData, get().user);
      const computedWellness = wellnessRes?.data || report?.wellness_assessment || fallbackWellness;

      const masterState: MasterClinicalAssessmentState = {
        overall_clinical_status: isUnverified ? "Clinical Assessment Pending (0 Reports Uploaded)" : (clinicalRes?.data?.overall_clinical_status || "Clinical Assessment Active"),
        overall_readiness: isUnverified ? "0% (Waiting for Reports)" : (readinessRes?.data?.overall_readiness_pct ? `${readinessRes.data.overall_readiness_pct}%` : "100% Verified"),
        passport_level: isUnverified ? 1 : (passportRes?.data?.passport_level || 2),
        passport_title: isUnverified ? "Level 1 — Emergency Health Passport" : (passportRes?.data?.passport_title || "Level 2 — Clinical Health Passport"),
        uploaded_reports_count: recordCount,
        organ_insights: masterOrganInsights,
        wellness_assessment: computedWellness,
        module_readiness: readinessRes?.data?.organ_readiness || passportRes?.data?.module_readiness || {},
        active_clinical_assessments: passportRes?.data?.active_clinical_assessments || [],
        medical_timeline: get().medicalRecords
      };
      
      console.log("===== MASTER STATE =====");
      console.log(masterState);

      set({
        report,
        wellnessData: computedWellness,
        clinicalReadiness: readinessRes ? readinessRes.data : null,
        clinicalAssessments: clinicalRes ? clinicalRes.data : null,
        passportData: passportRes ? passportRes.data : null,
        clinicalAssessmentState: masterState,
        medicalTimeline: get().medicalRecords,
        loading: false,
        projectionData: null,
        projectionError: null,
      });

      // Trigger AI Lifestyle Interpretation layer (with intelligent hash caching)
      get().fetchLifestyleAIInterpretation();

      console.log(useStore.getState().clinicalAssessmentState);
      if (report && report.organ_insights) {
        let highestOrgan = "heart";
        let maxRisk = 0;
        Object.entries(report.organ_insights).forEach(([organ, data]) => {
          const score = (data as OrganScore).numerical_score || 0;
          if (score > maxRisk) {
            maxRisk = score;
            highestOrgan = organ;
          }
        });
        const specialistMap: Record<string, string> = {
          "heart": "cardiologist",
          "lungs": "pulmonologist",
          "liver": "gastroenterologist",
          "kidneys": "nephrologist",
          "brain": "neurologist"
        };
        const specialist = specialistMap[highestOrgan as keyof typeof specialistMap] || "general physician";
        get().fetchDoctors(specialist, get().userCity, report.risk_level);
      }
    } catch (e) {
      console.error("Simulation Error:", e);
      set({ loading: false });
    }
  },

  reportAnalysisData: null,
  analyzing: false,
  analyzerError: null,
  analyzerStatus: null,
  analyzeReport: async (file, language) => {
    set({ analyzing: true, analyzerError: null, analyzerStatus: "Initiating analysis protocol..." });
    try {
      const axios = (await import("axios")).default;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);
      
      const baseUrl = API_BASE;
        
      set({ analyzerStatus: "Extracting clinical biological markers..." });
      
      const res = await axios.post(`${baseUrl}/v1/ingest-pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      set({ analyzerStatus: "Correlating lab data with Digital Twin..." });
      
      set({ 
        reportAnalysisData: res.data,
        analyzing: false,
        analyzerStatus: null
      });
      
      if (res.data.primary_specialist_needed) {
        get().fetchDoctors(res.data.primary_specialist_needed, get().userCity, res.data.risk_level || "moderate");
      }
    } catch (e: any) {
      console.error("Analysis Error:", e);
      set({ 
        analyzerError: e.response?.data?.detail || "System connection timeout. Please verify backend state.",
        analyzing: false,
        analyzerStatus: null
      });
    }
  },
  recommendedDoctors: [],
  fetchingDoctors: false,
  doctorError: null,
  userCity: "Hyderabad",
  setCity: (city: string) => set({ userCity: city }),
  fetchDoctors: async (specialist, city, risk_level) => {
    set({ fetchingDoctors: true, doctorError: null });
    try {
      const axios = (await import("axios")).default;
      const res = await axios.get(`${API_BASE}/v1/doctors`, {
        params: { specialist, location: city, risk_level }
      });
      set({ recommendedDoctors: res.data, fetchingDoctors: false });
    } catch (e: any) {
      console.error("Error fetching doctors:", e);
      set({ doctorError: e.response?.data?.detail || "Provider lookup failed", fetchingDoctors: false });
    }
  },
  careGuidanceData: null,
  fetchingGuidance: false,
  guidanceError: null,
  fetchGuidance: async () => {
    set({ fetchingGuidance: true, guidanceError: null });
    try {
      const axios = (await import("axios")).default;
      const s = get();
      const payload = {
        user_profile: s.user || { age: s.lifestyleData.age },
        organ_scores: s.report?.organ_insights || null,
        symptoms: []
      };
      const res = await axios.post(`${API_BASE}/v1/care-guidance`, payload);
      set({ careGuidanceData: res.data, fetchingGuidance: false });
    } catch (e: any) {
      console.error("Error fetching care guidance:", e);
      set({ guidanceError: e.response?.data?.detail || "Guidance failed", fetchingGuidance: false });
    }
  },
  careChatData: null,
  sendingChat: false,
  chatError: null,
  resetCareChat: () => set({ careChatData: null, chatError: null }),
  sendCareChatMessage: async (query: string) => {
    set({ sendingChat: true, chatError: null });
    try {
      const axios = (await import("axios")).default;
      const res = await axios.post(`${API_BASE}/v1/care-chat`, { query });
      set({ careChatData: res.data, sendingChat: false });
    } catch (e: any) {
      console.error("Error sending care chat:", e);
      set({ chatError: e.response?.data?.detail || "Submission failed", sendingChat: false });
    }
  },
  fetchHealthProjection: async () => {
    const { lifestyleData, report } = get();
    if (!report?.organ_insights) {
      set({
        projectionError:
          "Run a health simulation from the Insights tab first so organ scores are available.",
      });
      return;
    }
    set({ fetchingProjection: true, projectionError: null });
    const scores: Record<string, any> = {};
    Object.entries(report.organ_insights).forEach(([organ, data]) => {
      scores[organ] = { score: (data as OrganScore).numerical_score };
    });
    try {
      const axios = (await import("axios")).default;
      const res = await axios.post<HealthProjectionResponse>(`${API_BASE}/v1/health-projection`, {
        user_profile: {
          age: lifestyleData.age,
          sex: "male",
          bmi: lifestyleData.bmi,
          sleep_hours: lifestyleData.sleep,
          activity_level: lifestyleData.activity,
          diet_type: lifestyleData.diet,
          smoker: lifestyleData.smoking,
          alcohol_units_per_week: lifestyleData.alcohol ? 10 : 0
        },
        organ_scores: scores
      }, { timeout: 40000 });
      set({ projectionData: res.data, fetchingProjection: false });
    } catch (error: any) {
      console.error("Projection Error:", error);
      set({ projectionError: error.response?.data?.detail || "Projection failed", fetchingProjection: false });
    }
  },
  voiceMessages: [],
  sendingVoice: false,
  voiceError: null,
  resetVoiceChat: () => set({ voiceMessages: [], voiceError: null }),
  sendVoiceConsult: async (message: string, isVoice: boolean = false) => {
    const s = get();
    const newUserMessage = { role: "user" as const, content: message };
    set({ 
      voiceMessages: [...s.voiceMessages, newUserMessage],
      sendingVoice: true, 
      voiceError: null 
    });

    try {
      const axios = (await import("axios")).default;
      const payload = {
        message: message,
        language: i18n.language,
        is_voice: isVoice,
        health_context: s.report ? {
          summary: s.report.summary,
          risk_level: s.report.risk_level,
          organ_insights: s.report.organ_insights
        } : null,
        chat_history: s.voiceMessages.map(m => ({
          role: m.role === "ai" ? "assistant" : "user",
          content: m.content
        }))
      };

      const res = await axios.post(`${API_BASE}/v1/voice-consult`, payload);
      const aiReply = { role: "ai" as const, content: res.data.reply };
      
      set((state) => ({ 
        voiceMessages: [...state.voiceMessages, aiReply],
        sendingVoice: false 
      }));
    } catch (e: any) {
      console.error("Voice Consult Error:", e);
      set({ 
        voiceError: e.response?.data?.detail || "Voice interaction failed. Check Gemini API key.",
        sendingVoice: false 
      });
    }
  }
}));
