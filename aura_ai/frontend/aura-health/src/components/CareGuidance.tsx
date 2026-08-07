import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { 
  TbStethoscope, 
  TbAlertCircle, 
  TbCheck, 
  TbX, 
  TbShieldCheck,
  TbLoader2,
  TbMessageCircle,
  TbSend
} from "react-icons/tb";
import { useState } from "react";
import { useStore } from "@/store/useStore";

export default function CareGuidance() {
  const { 
    careGuidanceData, 
    fetchingGuidance, 
    guidanceError, 
    fetchGuidance,
    report,
    reportAnalysisData,
    careChatData,
    sendingChat,
    chatError,
    sendCareChatMessage,
    resetCareChat
  } = useStore();

  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendingChat) return;
    sendCareChatMessage(input.trim());
  };

  const activeData = careChatData || careGuidanceData;
  const isLoading = fetchingGuidance || sendingChat;
  const errorObj = guidanceError || chatError;

  useEffect(() => {
    if (!careGuidanceData && !fetchingGuidance && !guidanceError) {
      if (report || reportAnalysisData) {
        fetchGuidance();
      }
    }
  }, [report, reportAnalysisData, careGuidanceData, fetchingGuidance, guidanceError, fetchGuidance]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-8">
      <div className="glass-card rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="flex flex-col items-center max-w-2xl mx-auto text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-secondary/60 flex items-center justify-center text-primary text-3xl mb-4 relative ring-1 ring-primary/20">
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-risk-high rounded-full animate-pulse shadow-[0_0_10px_hsl(var(--risk-high))]"></span>
            <TbShieldCheck />
          </div>
          <h2 className="text-2xl font-black mb-2">Temporary Care Guidance</h2>
          <p className="text-muted-foreground mb-6">
            Immediate steps to take while you coordinate with a healthcare provider. Use your latest digital twin simulation, or describe a custom emergency below.
          </p>
          
          <form onSubmit={handleSubmit} className="w-full relative mt-4 mb-4">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sendingChat}
              placeholder='Try: "I am suffering from a stomach ache and the hospital is 15km away..."'
              className="w-full bg-secondary/30 ring-1 ring-border/50 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none min-h-[90px] text-foreground disabled:opacity-50 text-sm"
            />
            <button 
              type="submit"
              disabled={!input.trim() || sendingChat}
              className="absolute bottom-3 right-3 h-9 px-4 bg-primary text-primary-foreground rounded-lg font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {sendingChat ? <TbLoader2 className="animate-spin" /> : <TbSend />}
              <span>Get Custom Guidance</span>
            </button>
          </form>

          {!careGuidanceData && !fetchingGuidance && !careChatData && (
            <button 
              onClick={() => fetchGuidance()}
              className="mt-2 px-6 py-2 bg-secondary text-primary border border-border rounded-lg font-bold shadow-sm hover:bg-secondary/80 transition-colors text-sm"
            >
              Load Simulation-Based Guidance
            </button>
          )}
          
          {careChatData && (
             <div className="flex justify-end w-full mt-2">
                <button 
                  onClick={() => { resetCareChat(); setInput(''); }}
                  className="text-xs text-muted-foreground hover:text-primary font-bold underline"
                >
                  Clear Custom Query
                </button>
             </div>
          )}

        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-muted-foreground"
            >
              <TbLoader2 className="animate-spin text-4xl mb-4 text-primary" />
              <p className="font-medium">Analyzing situation for immediate care steps...</p>
            </motion.div>
          ) : errorObj ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-risk-high/10 border border-risk-high/20 rounded-xl text-risk-high flex flex-col items-center text-center gap-2"
            >
              <TbAlertCircle className="text-3xl mb-1" />
              <p className="font-bold">Unable to process guidance</p>
              <p className="text-sm opacity-80">{errorObj}</p>
            </motion.div>
          ) : activeData ? (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {/* Immediate Steps */}
              <div className="glass-card rounded-xl p-6 border border-border/50 bg-secondary/10 md:col-span-2">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-primary">
                  <TbStethoscope className="text-xl"/> Immediate Care Steps
                </h3>
                <ul className="space-y-3">
                  {activeData.immediate_care_steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-foreground/90 font-medium">
                      <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold ring-1 ring-primary/40">
                        {idx + 1}
                      </div>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Do's and Don'ts */}
              <div className="glass-card rounded-xl p-6 border border-border/50 bg-secondary/10 flex flex-col gap-4">
                <h3 className="font-bold text-lg text-foreground">Do's & Don'ts</h3>
                <ul className="space-y-3">
                  {activeData.dos_and_donts.map((item, idx) => {
                    const isDo = item.toLowerCase().startsWith("do:") || !item.toLowerCase().includes("not");
                    return (
                      <li key={idx} className="flex gap-2 text-sm text-muted-foreground/90">
                        {isDo ? (
                          <TbCheck className="text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <TbX className="text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Warning Signs */}
              <div className="glass-card rounded-xl p-6 border border-risk-high/30 bg-risk-high/5 flex flex-col gap-4">
                <h3 className="font-bold text-lg text-risk-high flex items-center gap-2">
                  <TbAlertCircle /> Warning Signs
                </h3>
                <p className="text-xs text-risk-high/80 leading-relaxed font-medium mb-1">
                  Seek immediate medical attention if you experience:
                </p>
                <ul className="space-y-2">
                  {activeData.warning_signs.map((sign, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-foreground font-semibold">
                      <div className="h-1.5 w-1.5 rounded-full bg-risk-high shrink-0 shadow-[0_0_5px_hsl(var(--risk-high))]" />
                      {sign}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Note and Disclaimer */}
              <div className="md:col-span-2 text-center mt-2 flex flex-col items-center gap-4">
                <p className="text-sm font-medium text-primary/90 italic bg-primary/5 px-6 py-3 rounded-xl ring-1 ring-primary/20 max-w-xl">
                  {activeData.supportive_note}
                </p>
                <div className="text-xs text-muted-foreground/60 max-w-3xl px-4 flex gap-2 items-start text-left mt-2 border-t border-border/50 pt-6">
                  <TbAlertCircle className="text-xl shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium uppercase tracking-tight">
                    {activeData.safety_disclaimer}
                  </p>
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 border-2 border-dashed border-border/60 rounded-xl bg-secondary/10"
            >
              <p className="text-muted-foreground font-medium">Run a simulation first to receive targeted, individualized guidance.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
