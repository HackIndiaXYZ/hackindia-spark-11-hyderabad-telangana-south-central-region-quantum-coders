import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  TbShieldCheck, 
  TbHeart, 
  TbLungs, 
  TbDroplet, 
  TbStethoscope, 
  TbBrain,
  TbPhoneCall,
  TbArrowLeft,
  TbPill,
  TbSparkles,
  TbCode,
  TbCopy,
  TbCheck,
  TbFileReport,
  TbInfoCircle,
  TbAlertCircle
} from "react-icons/tb";
import { useState } from "react";
import { useStore } from "@/store/useStore";

export default function PassportPage() {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const { user, clinicalAssessmentState, passportData, medicalRecords, lifestyleData } = useStore();

  const passportLevel = clinicalAssessmentState?.passport_level || passportData?.passport_level || 1;
  const levelTitle = clinicalAssessmentState?.passport_title || passportData?.passport_title || "Level 1 — Emergency Health Passport";
  const levelBadgeColor = passportLevel === 3 ? "bg-emerald-100 text-emerald-900 border-emerald-300" :
                          passportLevel === 2 ? "bg-blue-100 text-blue-900 border-blue-300" :
                          "bg-amber-100 text-amber-900 border-amber-300";
  const recordCount = clinicalAssessmentState?.uploaded_reports_count ?? (medicalRecords || []).length;

  // Patient Identity details
  const name = user?.full_name || searchParams.get("name") || "Rohit";
  const email = user?.email || searchParams.get("email") || "patient@aura.health";
  const auraId = user?.patientId || searchParams.get("id") || "AURA-77392";
  const bloodGroup = lifestyleData?.bloodGroup || user?.bloodGroup || "O+";
  const allergies = lifestyleData?.allergies || user?.allergies || "No documented drug allergies";
  const medications = lifestyleData?.medications || user?.medications || "No chronic daily medications";
  const emergencyName = lifestyleData?.emergencyContactName || user?.emergencyName || "Primary Care Giver";
  const emergencyPhone = lifestyleData?.emergencyContactPhone || user?.emergencyPhone || "+91-9876543210";

  const fullJSONObject = {
    passport_level: passportLevel,
    passport_title: levelTitle,
    patient_id: auraId,
    patient_name: name,
    email: email,
    blood_group: bloodGroup,
    allergies: allergies,
    current_medications: medications,
    emergency_contact: { name: emergencyName, phone: emergencyPhone },
    uploaded_reports_count: recordCount,
    active_clinical_assessments: passportData?.active_clinical_assessments || [],
    timestamp: new Date().toISOString()
  };

  const jsonString = JSON.stringify(fullJSONObject, null, 2);

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const organIcons: Record<string, any> = {
    heart: TbHeart,
    lungs: TbLungs,
    liver: TbDroplet,
    kidneys: TbStethoscope,
    brain: TbBrain
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 flex flex-col items-center justify-center font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
      >
        {/* Top MedRouter Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center relative">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-2 ${levelBadgeColor}`}>
            <TbShieldCheck className="text-sm" />
            <span>{levelTitle}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Living Health Passport</h1>
          <p className="text-xs text-blue-100 mt-1 font-medium">
            {passportLevel === 1 && "Emergency medical identity & critical contact profile."}
            {passportLevel === 2 && "Clinical evidence verified across uploaded hospital reports."}
            {passportLevel === 3 && "Activated Digital Twin with international clinical assessments."}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Identity Header Card */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Name</p>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{name}</h2>
              <p className="text-xs text-slate-500">{email}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Twin ID</p>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono text-xs font-bold rounded-lg mt-0.5">
                {auraId}
              </span>
            </div>
          </div>

          {/* LEVEL 1 EMERGENCY INFORMATION */}
          <div className="p-4 bg-rose-50/60 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-extrabold text-rose-900 dark:text-rose-300">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <TbAlertCircle className="text-rose-600 text-base" />
                Emergency Passport Information
              </span>
              <span className="text-[10px] bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-full font-bold">Level 1 Active</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Blood Group</span>
                <p className="font-extrabold text-slate-900 dark:text-white">{bloodGroup}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Emergency Contact</span>
                <p className="font-bold text-slate-900 dark:text-white">{emergencyName} ({emergencyPhone})</p>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Allergies</span>
                <p className="font-medium text-slate-700 dark:text-slate-300">{allergies}</p>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current Medications</span>
                <p className="font-medium text-slate-700 dark:text-slate-300">{medications}</p>
              </div>
            </div>
          </div>

          {/* LEVEL 2 CLINICAL REPORTS SUMMARY (If reports exist) */}
          {passportLevel >= 2 && (
            <div className="p-4 bg-blue-50/60 dark:bg-slate-800/50 rounded-2xl border border-blue-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-extrabold text-blue-900 dark:text-blue-300">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <TbFileReport className="text-blue-600 text-base" />
                  Clinical Reports Record ({recordCount} Verified)
                </span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">Level 2 Active</span>
              </div>

              {passportData?.module_readiness && (
                <div className="text-xs text-slate-700 font-medium grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(passportData.module_readiness).map(([organ, status]: [string, any]) => (
                    <div key={organ} className="flex justify-between items-center bg-white dark:bg-slate-900 p-1.5 rounded-md border border-slate-100 dark:border-slate-800">
                      <span className="capitalize">{organ}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold ${status.status === "Ready" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{status.status}</span>
                    </div>
                  ))}
                </div>
              )}

              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 font-medium pt-2 border-t border-blue-100 dark:border-slate-700">
                {medicalRecords.slice(0, 3).map((rec, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>• {rec.fileName || rec.primaryDiagnosis}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{rec.visitDate || "Recent"}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* LEVEL 3 DIGITAL TWIN ORGAN ASSESSMENTS (If activated) */}
          {passportLevel === 3 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Activated Digital Twin Assessments
                </p>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Level 3 Active</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {passportData?.active_clinical_assessments?.map((a, idx) => {
                    const organ = a.organ;
                    const Icon = organIcons[organ] || TbHeart;
                    return (
                      <div key={organ} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 dark:text-white capitalize">{organ} Assessment</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {a.confidence || "Verified"}
                          </span>
                        </div>
                        <div className="space-y-1">
                           <div className="flex justify-between text-[10px] text-slate-500"><span>Assessment Date</span><span className="font-medium text-slate-700 dark:text-slate-300">{a.date}</span></div>
                           <div className="flex justify-between text-[10px] text-slate-500"><span>Formula Version</span><span className="font-medium text-slate-700 dark:text-slate-300 truncate ml-2 max-w-[120px] text-right">{a.formula}</span></div>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate pt-1 border-t border-slate-200 dark:border-slate-700">{a.citation}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-1">
              <p className="text-xs font-bold text-slate-700">Digital Twin Level 3 Unlocked Upon Uploading Clinical Reports</p>
              <p className="text-[11px] text-slate-500">Upload KFT, LFT, Lipid Profile, or Spirometry reports to activate organ assessments on your passport.</p>
            </div>
          )}

          {/* Raw Scanned JSON Payload */}
          <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[10px] uppercase font-bold tracking-wider text-emerald-400">
              <span className="flex items-center gap-1.5">
                <TbCode className="text-base" />
                <span>Scanned Passport JSON Payload</span>
              </span>
              <button
                onClick={handleCopyJSON}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                {copied ? <TbCheck className="text-emerald-400" /> : <TbCopy />}
                <span>{copied ? "Copied!" : "Copy JSON"}</span>
              </button>
            </div>
            <pre className="whitespace-pre-wrap max-h-40 overflow-y-auto scrollbar-thin text-[10px] text-slate-300">
              {jsonString}
            </pre>
          </div>

          {/* Emergency Action Call Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <a
              href="tel:108"
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
            >
              <TbPhoneCall className="text-base" />
              <span>Call Emergency Medical Response (108 / 911)</span>
            </a>

            <Link
              to="/dashboard"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <TbArrowLeft className="text-base" />
              <span>Return to Health Readiness Dashboard</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

