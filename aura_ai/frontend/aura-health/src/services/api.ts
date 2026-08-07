import axios from "axios";
import type { LifestyleData, HealthReport } from "@/store/useStore";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
console.log("Aura Health API Target:", API_BASE);

const client = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

export async function fetchHealthReport(
  data: LifestyleData,
  labBiomarkers: Record<string, any> = {},
  language: string = "en"
): Promise<HealthReport> {
  const langMap: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    te: "Telugu",
  };

  const activityMap: Record<number, string> = {
    0: "low",
    1: "low",
    2: "moderate",
    3: "moderate",
    4: "high",
    5: "high",
  };

  const payload = {
    payload: {
      user_profile: {
        age: Math.floor(data.age),
        sex: data.sex,
        bmi: parseFloat(data.bmi.toString()),
        sleep_hours: parseFloat(data.sleep.toString()),
        activity_level: activityMap[data.activity] || "moderate",
        diet_type: data.diet,
        smoker: data.smoking,
        alcohol_units_per_week: data.alcohol ? 10.0 : 0.0,
      },
      lab_biomarkers: labBiomarkers,
      organ_scores: {
        heart: { score: 60, uncertainty: 5 },
        lungs: { score: 60, uncertainty: 5 },
        liver: { score: 60, uncertainty: 5 },
        kidneys: { score: 60, uncertainty: 5 },
        brain: { score: 60, uncertainty: 5 },
      },
      guidelines_applied: ["clinical_standard_v1"],
      language: langMap[language] || "English",
      report_type: "full_simulation",
    },
    writer_mode: "deterministic",
  };

  console.log("Sending Health Report Request:", payload);

  const res = await client.post<HealthReport>("/v1/health-report", payload);
  return res.data;
}

export async function fetchWellnessAssessment(data: LifestyleData): Promise<any> {
  const payload = {
    user_profile: {
      age: Math.floor(data.age),
      sex: data.sex,
      bmi: parseFloat(data.bmi.toString()),
      sleep_hours: parseFloat(data.sleep.toString()),
      activity_level: data.activity,
      diet_type: data.diet,
      smoker: data.smoking,
      alcohol_units_per_week: data.alcohol ? 10.0 : 0.0,
    }
  };
  const res = await client.post("/v1/wellness-assessment", payload);
  return res.data;
}

export async function fetchCurrentUser(): Promise<any> {
  const token = localStorage.getItem("twin_token");
  if (!token) throw new Error("No token found");
  
  const res = await client.get("/v1/auth/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
