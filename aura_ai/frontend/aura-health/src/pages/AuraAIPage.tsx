import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import CareGuidance from "@/components/CareGuidance";
import { useStore } from "@/store/useStore";
import {
  TbSparkles,
  TbMessageDots,
  TbShieldHeart,
  TbSend,
  TbLoader2,
  TbRobot,
  TbBulb
} from "react-icons/tb";

export default function AuraAIPage() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { report, clinicalAssessmentState } = useStore();
  
  const [activeTab, setActiveTab] = useState<"chat" | "guidance">(
    tabParam === "guidance" ? "guidance" : "chat"
  );

  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string;
    role: "user" | "assistant";
    text: string;
    steps?: string[];
    dos_donts?: string[];
    warnings?: string[];
    timestamp: string;
  }>>([
    {
      id: "1",
      role: "assistant",
      text: "Welcome to Aura AI Clinical Console powered by Aura Companion. Ask any question about your digital twin organ metrics, medical reports, or emergency guidance protocols.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  useEffect(() => {
    if (tabParam === "guidance") {
      setActiveTab("guidance");
    } else {
      setActiveTab("chat");
    }
  }, [tabParam]);

  const handleSend = async (customQuery?: string) => {
    const query = customQuery || inputQuery;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user" as const,
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    if (!customQuery) setInputQuery("");
    setLoading(true);

    try {
      const axios = (await import("axios")).default;
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
      const organScores = clinicalAssessmentState?.organ_insights || report?.organ_insights || null;
      
      const res = await axios.post(`${API_BASE}/v1/care-chat`, {
        query: query,
        organ_scores: organScores
      });

      const data = res.data;
      setChatHistory((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: data.response_text || data.message || "Aura Companion processed your clinical query.",
          steps: data.immediate_care_steps || [],
          dos_donts: data.dos_and_donts || [],
          warnings: data.warning_signs || [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err) {
      console.error("Llama 80B Chat error:", err);
      setChatHistory((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: "I am tracking your biometrics. Please consult your physician for clinical advice.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm shadow-xs">
                <TbSparkles />
              </div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Medical AI Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Aura AI Clinical Assistant
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Interactive clinical chat console & emergency care guidance powered by Aura Companion
            </p>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "chat"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <TbMessageDots className="text-base" />
            <span>Aura Companion Clinical Chat Console</span>
          </button>

          <button
            onClick={() => setActiveTab("guidance")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "guidance"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <TbShieldHeart className="text-base" />
            <span>Emergency Recommendation Protocols</span>
          </button>
        </div>

        {/* Tab Workspace */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          {activeTab === "chat" ? (
            <div className="flex flex-col h-[520px] justify-between">
              {/* Chat Stream */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      {msg.role === "assistant" ? (
                        <>
                          <TbRobot className="text-blue-600 text-sm" />
                          <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider">
                            Aura Companion
                          </span>
                        </>
                      ) : (
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                          You
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 ml-1">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-xs ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white font-medium rounded-tr-none"
                          : "bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60"
                      }`}
                    >
                      <p>{msg.text}</p>

                      {msg.steps && msg.steps.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                          <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Immediate Care Steps:</p>
                          <ul className="list-disc list-inside text-xs space-y-1 text-slate-700 dark:text-slate-300">
                            {msg.steps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-bold p-3 animate-pulse">
                    <TbLoader2 className="animate-spin text-lg" />
                    <span>Aura Companion is generating response...</span>
                  </div>
                )}
              </div>

              {/* Prompt Suggestions */}
              <div className="pt-3 pb-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                <button
                  onClick={() => handleSend("What is my organ health status?")}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 transition-all"
                >
                  🩺 Organ Risk Analysis
                </button>
                <button
                  onClick={() => handleSend("Suggest emergency recommendations")}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 transition-all"
                >
                  🚨 Emergency Care Steps
                </button>
                <button
                  onClick={() => handleSend("Give me preventative lifestyle tips")}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 transition-all"
                >
                  🌿 Lifestyle Guidance
                </button>
              </div>

              {/* Input Control Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="relative flex items-center pt-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Type any medical question or ask about your Digital Twin..."
                  disabled={loading}
                  className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs md:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || loading}
                  className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-blue-500/20"
                >
                  <TbSend className="text-base" />
                </button>
              </form>
            </div>
          ) : (
            <CareGuidance />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
