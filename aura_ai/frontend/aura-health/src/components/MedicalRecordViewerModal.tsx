import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, type MedicalRecord } from "@/store/useStore";
import { toast } from "sonner";
import {
  TbX,
  TbFileReport,
  TbStethoscope,
  TbPill,
  TbTestPipe,
  TbBrain,
  TbDownload,
  TbPrinter,
  TbCalendar,
  TbBuildingHospital,
  TbUserCheck,
  TbActivityHeartbeat,
  TbFileText,
  TbShieldCheck,
  TbCpu,
  TbAlertTriangle,
  TbCheck,
  TbTrash
} from "react-icons/tb";

interface Props {
  record: MedicalRecord | null;
  onClose: () => void;
}

export default function MedicalRecordViewerModal({ record, onClose }: Props) {
  const { deleteMedicalRecord } = useStore();
  const [activeTab, setActiveTab] = useState<"summary" | "labs" | "ocr" | "twin" | "diagnostics">("summary");

  if (!record) return null;

  const handleDownload = () => {
    const textContent = `AURA HEALTH CLINICAL RECORD
Hospital: ${record.hospitalName}
Doctor: ${record.doctorName} (${record.doctorSpecialization})
Visit Date: ${record.visitDate}
Diagnosis: ${record.primaryDiagnosis}
Advice: ${record.doctorAdvice}

Medicines:
${record.medicines.map((m) => `- ${m.name}: ${m.dosage} (${m.frequency}) for ${m.duration}`).join("\n")}

OCR Extracted Text:
${record.ocrText}
`;
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.fileName.replace(/\.pdf$/i, "")}_Clinical_Record.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Modal Header */}
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-md shadow-blue-500/20 shrink-0">
                <TbFileReport />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border border-blue-200">
                    {record.documentType.replace("_", " ")}
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <TbCalendar className="text-blue-600" /> Visit Date: {record.visitDate}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {record.primaryDiagnosis || record.fileName}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1"><TbBuildingHospital className="text-slate-400" /> {record.hospitalName}</span>
                  <span className="flex items-center gap-1"><TbUserCheck className="text-slate-400" /> {record.doctorName}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-500 transition-colors cursor-pointer"
            >
              <TbX className="text-lg" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
            <button
              onClick={() => setActiveTab("summary")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "summary"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <TbStethoscope className="text-base" />
              <span>Clinical Summary & Rx</span>
            </button>

            {record.labValues && record.labValues.length > 0 && (
              <button
                onClick={() => setActiveTab("labs")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "labs"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <TbTestPipe className="text-base" />
                <span>Lab Values ({record.labValues.length})</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("twin")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "twin"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <TbBrain className="text-base" />
              <span>Digital Twin Correlation</span>
            </button>

            <button
              onClick={() => setActiveTab("diagnostics")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "diagnostics"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <TbCpu className="text-base" />
              <span>Pipeline Diagnostics</span>
            </button>

            <button
              onClick={() => setActiveTab("ocr")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "ocr"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <TbFileText className="text-base" />
              <span>OCR Text</span>
            </button>
          </div>

          {/* Modal Content Scroll Area */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* TAB 1: SUMMARY & RX */}
            {activeTab === "summary" && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-slate-800/70 border border-blue-200/60 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-blue-700 dark:text-blue-400 uppercase">
                    <TbBrain className="text-base" />
                    <span>Deterministic Extraction Summary</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {record.aiSummary}
                  </p>
                </div>

                {record.medicines && record.medicines.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                      <TbPill className="text-blue-600 text-sm" />
                      <span>Prescribed Pharmacotherapy ({record.medicines.length})</span>
                    </h4>

                    <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/80 text-[10px] uppercase font-black text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                            <th className="p-3 pl-4">Medicine Name</th>
                            <th className="p-3">Dosage</th>
                            <th className="p-3">Frequency</th>
                            <th className="p-3 pr-4">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {record.medicines.map((med, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="p-3 pl-4 font-bold text-blue-600 dark:text-blue-400">{med.name}</td>
                              <td className="p-3">{med.dosage}</td>
                              <td className="p-3">{med.frequency}</td>
                              <td className="p-3 pr-4 text-slate-500">{med.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Attending Physician Advice</span>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {record.doctorAdvice || "No specific advice noted."}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: LAB VALUES */}
            {activeTab === "labs" && record.labValues && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                  <TbTestPipe className="text-blue-600 text-sm" />
                  <span>Laboratory Parameters ({record.labValues.length})</span>
                </h4>

                <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 text-[10px] uppercase font-black text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                        <th className="p-3 pl-4">Parameter</th>
                        <th className="p-3">Observed Value</th>
                        <th className="p-3">Reference Range</th>
                        <th className="p-3 pr-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {record.labValues.map((lab, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-3 pl-4 font-bold">{lab.parameter}</td>
                          <td className="p-3 font-mono">{lab.value} {lab.unit}</td>
                          <td className="p-3 text-slate-400 font-normal">{lab.referenceRange}</td>
                          <td className="p-3 pr-4 text-right">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                lab.status === "high"
                                  ? "bg-rose-50 text-rose-600 border-rose-200"
                                  : lab.status === "low"
                                  ? "bg-amber-50 text-amber-600 border-amber-200"
                                  : "bg-emerald-50 text-emerald-600 border-emerald-200"
                              }`}
                            >
                              {lab.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: DIGITAL TWIN IMPACT */}
            {activeTab === "twin" && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-white/20 rounded-full backdrop-blur-md">
                      Digital Twin Correlation
                    </span>
                    <TbShieldCheck className="text-2xl text-blue-200" />
                  </div>

                  <h3 className="text-base font-bold">Longitudinal Trajectory Impact</h3>
                  <p className="text-xs text-blue-100 font-medium leading-relaxed">
                    {record.digitalTwinImpact}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: PIPELINE DIAGNOSTICS */}
            {activeTab === "diagnostics" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <TbCpu className="text-base" /> Deterministic Pipeline Metadata
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Zero Vision-LLM Mode
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Stage A Engine</span>
                      <p className="font-extrabold text-slate-800 dark:text-slate-200">PaddleOCR v4 (Header)</p>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Stage B Engine</span>
                      <p className="font-extrabold text-slate-800 dark:text-slate-200">Microsoft TrOCR (Handwriting Body)</p>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Hospital Extractor</span>
                      <p className="font-extrabold text-slate-800 dark:text-slate-200">Fuzzy Provider Dictionary Match</p>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Doctor Extractor</span>
                      <p className="font-extrabold text-slate-800 dark:text-slate-200">Degree & Salutation Local NER</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: OCR TEXT */}
            {activeTab === "ocr" && (
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                  <TbFileText className="text-blue-600 text-sm" />
                  <span>Raw OCR Extracted Document Text</span>
                </h4>
                <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800">
                  <pre className="whitespace-pre-wrap">{record.ocrText || "No raw OCR text available."}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 px-6 bg-slate-50/80 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="text-[11px] text-slate-400 font-medium">
              Uploaded: {new Date(record.uploadDate).toLocaleDateString()}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  deleteMedicalRecord(record.id);
                  toast.success("Document removed from repository.");
                  onClose();
                }}
                className="py-2 px-4 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer border border-rose-200 dark:border-rose-900"
              >
                <TbTrash className="text-base" />
                <span>Delete Document</span>
              </button>

              <button
                onClick={handleDownload}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <TbDownload className="text-base" />
                <span>Download Record</span>
              </button>

              <button
                onClick={handlePrint}
                className="py-2 px-4 bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <TbPrinter className="text-base" />
                <span>Print Record</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
