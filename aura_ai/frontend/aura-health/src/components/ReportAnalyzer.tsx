import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { TbUpload, TbFile, TbLoader2, TbBrain, TbCheck, TbX, TbActivityHeartbeat, TbLungs, TbDroplet, TbBowlSpoon } from "react-icons/tb";
import { useStore } from "@/store/useStore";
import { ORGAN_META } from "./OrganCard";

export default function ReportAnalyzer() {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { analyzeReport, analyzing, reportAnalysisData, analyzerError, analyzerStatus } = useStore();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        alert("Please upload a valid PDF file.");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        alert("Please upload a valid PDF file.");
      }
    }
  };

  const onAnalyzeClick = () => {
    if (!selectedFile) return;
    
    let languageStr = "English";
    if (i18n.language === "hi") languageStr = "Hindi";
    if (i18n.language === "te") languageStr = "Telugu";
    
    analyzeReport(selectedFile, languageStr);
  };

  const getOrganIcon = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes("heart")) return <TbActivityHeartbeat />;
    if (k.includes("lung")) return <TbLungs />;
    if (k.includes("liver")) return <TbBowlSpoon />;
    if (k.includes("kidney")) return <TbDroplet />;
    if (k.includes("brain")) return <TbBrain />;
    return <TbActivityHeartbeat />;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-8">
      {/* Upload Section */}
      <div className="glass-card rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="flex flex-col items-center max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
             <TbBrain className="text-primary animate-pulse" /> {t("analyzer.title" as any, "Medical Intelligence Center")}
          </h2>
          <p className="text-muted-foreground mb-8 text-sm font-medium">
             Submit clinical records for biological cross-reference with your Digital Twin.
          </p>
          
          {/* Dropzone */}
          <div 
            className={`w-full border-2 border-dashed rounded-2xl p-10 transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden ${
              dragActive 
                ? "border-primary bg-primary/5" 
                : "border-border/60 hover:border-primary/50 hover:bg-secondary/20 shadow-inner"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !analyzing && fileInputRef.current?.click()}
          >
            {analyzing && (
               <motion.div 
                 initial={{ width: "0%" }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 15, ease: "linear" }}
                 className="absolute bottom-0 left-0 h-1 bg-primary/30"
               />
            )}

            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleChange}
            />
            
            {selectedFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className={`h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-3xl ${analyzing ? "animate-bounce" : ""}`}>
                  <TbFile />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{selectedFile.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase font-black tracking-widest">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • READY FOR EXTRACTION</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 group">
                <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center text-muted-foreground text-2xl group-hover:text-primary group-hover:bg-primary/10 transition-all">
                  <TbUpload />
                </div>
                <p className="font-bold text-sm mt-2">{t("analyzer.upload" as any, "Select Clinical PDF")}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">PDF ONLY • MAX 10MB</p>
              </div>
            )}
          </div>
          
          <div className="w-full flex flex-col items-center gap-4 mt-8">
            {analyzing && analyzerStatus && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="w-full p-4 rounded-xl bg-black/40 border border-primary/20 flex flex-col items-center gap-2"
               >
                  <div className="flex items-center gap-3">
                     <TbLoader2 className="animate-spin text-primary" />
                     <span className="text-xs font-black uppercase tracking-tighter text-primary">{analyzerStatus}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium italic animate-pulse">
                     Encryption secure • Reasoning engine active
                  </div>
               </motion.div>
            )}

            <button 
              disabled={!selectedFile || analyzing}
              onClick={onAnalyzeClick}
              className="w-full sm:w-auto min-w-[240px] h-12 px-8 bg-primary text-primary-foreground font-black rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-tighter"
            >
              {analyzing ? (
                <>{t("analyzer.analyzing" as any, "Computing...")}</>
              ) : (
                <><TbBrain className="text-xl" /> {t("analyzer.analyze" as any, "Initiate Biological Analysis")}</>
              )}
            </button>
          </div>
          
          {analyzerError && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 w-full bg-risk-high/10 border border-risk-high/30 rounded-xl text-risk-high text-xs font-bold flex items-center justify-center gap-3"
            >
              <TbX className="text-lg bg-risk-high/20 rounded-full p-0.5" /> 
              <span>SYSTEM ERROR: {analyzerError}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {reportAnalysisData && !analyzing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Summary & Findings */}
            <div className="flex flex-col gap-6">
              <div className="glass-card rounded-2xl p-6 shadow-sm">
                <h3 className="text-[11px] font-black uppercase tracking-widest mb-4 text-primary/80 flex items-center gap-2">
                  <TbBrain className="text-sm" /> {t("analyzer.summary" as any, "Analysis Summary")}
                </h3>
                <p className="text-sm leading-relaxed text-foreground font-medium">
                  {reportAnalysisData.summary}
                </p>
              </div>
              
              <div className="glass-card rounded-2xl p-6 shadow-sm border border-primary/5">
                 <h3 className="text-[11px] font-black uppercase tracking-widest mb-4 text-primary/80 flex items-center gap-2">
                    <TbActivityHeartbeat className="text-sm" /> {t("analyzer.findings" as any, "Key Findings")}
                 </h3>
                 <ul className="space-y-3">
                   {reportAnalysisData.key_findings.map((finding, idx) => (
                     <li key={idx} className="flex items-start gap-3">
                       <span className="h-5 w-5 shrink-0 rounded-full bg-secondary flex items-center justify-center text-primary mt-0.5">
                         <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                       </span>
                       <span className="text-[13px] text-muted-foreground leading-relaxed font-medium">
                         {finding}
                       </span>
                     </li>
                   ))}
                 </ul>
              </div>
            </div>

            {/* Organ Impacts & Recs */}
            <div className="flex flex-col gap-6">
               <div className="glass-card rounded-2xl p-6 shadow-sm">
                 <h3 className="text-[11px] font-black uppercase tracking-widest mb-4 text-primary/80 flex items-center gap-2">
                    <TbLungs className="text-sm" /> {t("analyzer.organ_impacts" as any, "Organ Impacts")}
                 </h3>
                 <div className="grid grid-cols-1 gap-3">
                   {Object.entries(reportAnalysisData.organ_impacts).map(([organ, impact], idx) => (
                     <div key={idx} className="p-4 rounded-xl bg-secondary/30 ring-1 ring-border/50 flex gap-4">
                       <div className="text-2xl text-primary mt-1">
                         {getOrganIcon(organ)}
                       </div>
                       <div>
                         <div className="text-sm font-bold capitalize text-foreground mb-1">{organ}</div>
                         <div className="text-xs text-muted-foreground font-medium leading-relaxed">{impact as React.ReactNode}</div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
               
               {reportAnalysisData.recommendations.length > 0 && (
                 <div className="glass-card rounded-2xl p-6 shadow-sm border border-risk-healthy/20">
                   <h3 className="text-[11px] font-black uppercase tracking-widest mb-4 text-risk-healthy flex items-center gap-2">
                      <TbCheck className="text-sm" /> {t("analyzer.recommendations" as any, "Action Plan")}
                   </h3>
                   <ul className="space-y-3">
                     {reportAnalysisData.recommendations.map((rec, idx) => (
                       <li key={idx} className="flex items-start gap-3">
                         <span className="h-5 w-5 shrink-0 rounded-full bg-risk-healthy/10 flex items-center justify-center text-risk-healthy mt-0.5">
                           <TbCheck className="text-xs" />
                         </span>
                         <span className="text-[13px] text-foreground leading-relaxed font-medium">
                           {rec}
                         </span>
                       </li>
                     ))}
                   </ul>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
