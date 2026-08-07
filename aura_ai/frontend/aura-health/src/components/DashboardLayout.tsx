import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useTranslation } from "react-i18next";
import {
  TbLayoutDashboard,
  TbActivityHeartbeat,
  TbCpu,
  TbStethoscope,
  TbFileText,
  TbTrendingUp,
  TbUser,
  TbSettings,
  TbSparkles,
  TbBell,
  TbLogout,
  TbChevronRight,
  TbWorld,
  TbMenu2,
  TbX,
  TbCircleCheck,
  TbSend,
  TbLoader2,
  TbShieldCheck,
  TbRobot,
  TbBulb,
  TbUserHeart,
  TbBookmark,
  TbActivity
} from "react-icons/tb";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const {
    user,
    logout,
    report,
    clinicalAssessmentState,
    sendCareChatMessage,
    sendingChat,
    fetchGuidance,
    fetchingGuidance,
  } = useStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [auraPanelOpen, setAuraPanelOpen] = useState(false);
  
  // Local Llama 80B Chat Console State
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: "user" | "llama";
    text: string;
    steps?: string[];
    dos_donts?: string[];
    warnings?: string[];
    timestamp: string;
  }>>([
    {
      id: "init",
      role: "llama",
      text: "Hello! I am Aura Companion. Ask me anything about your digital twin organ metrics, health risks, or emergency guidance protocols.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  ]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || chatInput;
    if (!textToSend.trim() || sendingChat) return;

    const userMsgId = Date.now().toString();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append User Message
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", text: textToSend, timestamp: timeStr }
    ]);
    if (!queryText) setChatInput("");

    try {
      const axios = (await import("axios")).default;
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
      
      const organScores = clinicalAssessmentState?.organ_insights || report?.organ_insights || null;
      const res = await axios.post(`${API_BASE}/v1/care-chat`, {
        query: textToSend,
        organ_scores: organScores
      });

      const data = res.data;
      const responseText = data.response_text || data.message || "Aura Companion processed your query.";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "llama",
          text: responseText,
          steps: data.immediate_care_steps || [],
          dos_donts: data.dos_and_donts || [],
          warnings: data.warning_signs || [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
      ]);
    } catch (err: any) {
      console.error("Care Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "llama",
          text: "I am tracking your biometrics. Please consult your physician for tailored advice.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
      ]);
    }
  };

  const handleEmergencyRecommendations = async () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        text: "Generate Emergency Care Guidance & Protocols",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);

    try {
      const axios = (await import("axios")).default;
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
      
      const res = await axios.post(`${API_BASE}/v1/care-guidance`, {
        user_profile: user || {},
        organ_scores: clinicalAssessmentState?.organ_insights || report?.organ_insights || null,
      });

      const data = res.data;
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "llama",
          text: data.supportive_note || "Here are your emergency recommendations based on active organ parameters:",
          steps: data.immediate_care_steps || [],
          dos_donts: data.dos_and_donts || [],
          warnings: data.warning_signs || [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
      ]);
    } catch (err) {
      console.error("Emergency Guidance Error:", err);
    }
  };

  const primaryNav = [
    { label: "Overview", path: "/dashboard", icon: TbLayoutDashboard },
    { label: "My Health Twin", path: "/my-health", icon: TbActivityHeartbeat },
    { label: "3D Twin Simulator", path: "/3d-twin", icon: TbCpu },
    { label: "Clinical Engine", path: "/digital-twin", icon: TbStethoscope },
  ];

  const secondaryNav = [
    { label: "Medical Reports", path: "/medical-reports", icon: TbFileText },
    { label: "Realtime Doctors AI", path: "/doctors", icon: TbUserHeart },
    { label: "Aura AI Companion", path: "/aura-ai", icon: TbSparkles },
    { label: "Health History", path: "/health-history", icon: TbTrendingUp },
  ];


  const userNav = [
    { label: "Profile", path: "/profile", icon: TbUser },
    { label: "Settings", path: "/settings", icon: TbSettings },
  ];

  const resourceNav = [
    { label: "Clinical Methodology", path: "/clinical-methodology", icon: TbBookmark },
    { label: "Lifestyle Methodology", path: "/lifestyle-methodology", icon: TbActivity },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 h-16 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            {mobileOpen ? <TbX className="text-xl" /> : <TbMenu2 className="text-xl" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
              A
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                AURA<span className="text-blue-600">.AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                Digital Twin
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 ml-6 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <TbCircleCheck className="text-sm" />
            <span>Digital Twin Synced</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Aura Companion Button */}
          <button
            onClick={() => setAuraPanelOpen(!auraPanelOpen)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              auraPanelOpen
                ? "bg-blue-600 text-white shadow-blue-500/20"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700 border border-blue-200/60 dark:border-blue-900/40"
            }`}
          >
            <TbSparkles className="text-sm text-blue-500" />
            <span>Aura Companion</span>
            <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[9px] font-black">AI</span>
          </button>

          <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 relative transition-colors">
            <TbBell className="text-xl" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
          </button>

          {/* User Profile Header Chip */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-blue-500/20">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {user?.full_name || "Palaram Rohith"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {user?.email || "palaramrohith123@gmail.com"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar Component */}
        <aside
          className={`fixed lg:sticky top-16 bottom-0 left-0 z-50 lg:z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-4 overflow-y-auto scrollbar-thin space-y-6">
            <div>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                Primary
              </p>
              <nav className="space-y-1">
                {primaryNav.map((item) => {
                  const Icon = item.icon;
                  const active = currentPath === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="text-lg" />
                        <span>{item.label}</span>
                      </div>
                      {active && <TbChevronRight className="text-sm opacity-80" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                Intelligence
              </p>
              <nav className="space-y-1">
                {secondaryNav.map((item) => {
                  const Icon = item.icon;
                  const active = currentPath === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="text-lg" />
                        <span>{item.label}</span>
                      </div>
                      {active && <TbChevronRight className="text-sm opacity-80" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                Resources
              </p>
              <nav className="space-y-1">
                {resourceNav.map((item) => {
                  const Icon = item.icon;
                  const active = currentPath === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="text-lg" />
                        <span>{item.label}</span>
                      </div>
                      {active && <TbChevronRight className="text-sm opacity-80" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                Account
              </p>
              <nav className="space-y-1">
                {userNav.map((item) => {
                  const Icon = item.icon;
                  const active = currentPath === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="text-lg" />
                        <span>{item.label}</span>
                      </div>
                      {active && <TbChevronRight className="text-sm opacity-80" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
              <TbWorld className="text-slate-500 dark:text-slate-400 text-base" />
              <select
                value={i18n.language || "en"}
                onChange={handleLanguageChange}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none w-full cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="te">Telugu (తెలుగు)</option>
              </select>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <TbLogout className="text-base" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Right Aura Companion Llama 80B Interactive Chat Console Drawer */}
        <AnimatePresence>
          {auraPanelOpen && (
            <motion.aside
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 flex flex-col justify-between p-5 h-full z-40 shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-lg shadow-md shadow-blue-500/25">
                    <TbSparkles />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Aura Companion</h3>
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-[9px] uppercase tracking-wide">
                        Companion
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">Clinical Chat Console</p>
                  </div>
                </div>
                <button
                  onClick={() => setAuraPanelOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <TbX className="text-lg" />
                </button>
              </div>

              {/* Chat Console Messages Stream */}
              <div className="flex-1 my-4 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      {msg.role === "llama" ? (
                        <>
                          <TbRobot className="text-blue-500 text-xs" />
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Aura Companion</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">You</span>
                        </>
                      )}
                      <span className="text-[9px] text-slate-400 ml-1">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white font-medium rounded-tr-none"
                          : "bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50"
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* Display structured guidance steps if present */}
                      {msg.steps && msg.steps.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                          <p className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400">Immediate Care Steps:</p>
                          <ul className="list-disc list-inside text-[11px] space-y-0.5 text-slate-700 dark:text-slate-300">
                            {msg.steps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {msg.dos_donts && msg.dos_donts.length > 0 && (
                        <div className="mt-2 text-[10px] space-y-0.5 text-slate-600 dark:text-slate-400 italic">
                          {msg.dos_donts.map((dd, idx) => (
                            <div key={idx}>{dd}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {sendingChat && (
                  <div className="flex items-center gap-2 text-xs text-blue-500 font-semibold p-2">
                    <TbLoader2 className="animate-spin text-base" />
                    <span>Aura Companion is reasoning...</span>
                  </div>
                )}
              </div>

              {/* Quick Action Suggestion Buttons */}
              <div className="space-y-2 mb-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1">
                    <TbBulb className="text-amber-500" /> Prompts
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSendMessage("What is my organ health status?")}
                    className="text-[10px] font-bold px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-all text-left"
                  >
                    🩺 Organ Health Status
                  </button>
                  <button
                    onClick={() => handleSendMessage("Suggest lifestyle improvements")}
                    className="text-[10px] font-bold px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-all text-left"
                  >
                    🌿 Lifestyle Actions
                  </button>
                </div>
              </div>

              {/* Console Input Controls */}
              <div className="space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="relative flex items-center"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Aura Companion about your health..."
                    disabled={sendingChat}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || sendingChat}
                    className="absolute right-1.5 p-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg transition-all"
                  >
                    <TbSend className="text-sm" />
                  </button>
                </form>

                {/* Primary Emergency Protocols Action */}
                <button
                  onClick={handleEmergencyRecommendations}
                  disabled={sendingChat}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white rounded-xl font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all"
                >
                  <TbShieldCheck className="text-base" />
                  <span>Emergency Recommendations</span>
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
