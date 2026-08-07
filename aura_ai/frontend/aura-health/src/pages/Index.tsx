import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ControlPanel from "@/components/ControlPanel";
import HealthDataCard from "@/components/HealthDataCard";
import ChartPanel from "@/components/ChartPanel";
import OrganRiskList from "@/components/OrganRiskList";
import ProfileCard from "@/components/ProfileCard";
import ReportAnalyzer from "@/components/ReportAnalyzer";
import DoctorRecommendations from "@/components/DoctorRecommendations";
import CareGuidance from "@/components/CareGuidance";
import FutureProjection from "@/components/FutureProjection";
import VoiceInteraction from "@/components/VoiceInteraction";
import { useStore } from "@/store/useStore";
import {
  TbActivityHeartbeat,
  TbBell,
  TbDownload,
  TbDeviceFloppy,
  TbChevronDown,
  TbSparkles,
  TbWorld,
  TbBoxModel,
  TbMicrophone,
} from "react-icons/tb";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"organ" | "trends">("organ");
  const [mainTab, setMainTab] = useState<
    "insights" | "analyzer" | "doctors" | "guidance" | "projection" | "voice"
  >("insights");
  const report = useStore((s) => s.report);
  const clinicalAssessmentState = useStore((s) => s.clinicalAssessmentState);
  const loading = useStore((s) => s.loading);
  const logout = useStore((s) => s.logout);
  const user = useStore((s) => s.user);

  const summary = report?.summary || t("dashboard.summary_fallback", "Initial baseline projection. Run a simulation to generate a personalized health forecast.");
  const causalNarrative = report?.causal_narrative || t("dashboard.causal_fallback", "Run a simulation to see the clinical reasoning behind your scores.");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userInitials = user?.full_name
    ? user.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : "??";

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Topbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/15 ring-1 ring-primary/40 flex items-center justify-center text-primary text-xl shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
            <TbActivityHeartbeat />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">
             {t("app.title")}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 ring-1 ring-border text-xs mr-2">
            <TbWorld className="text-primary" />
            <select 
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              value={i18n.language}
              className="bg-transparent font-bold uppercase focus:outline-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="te">TE</option>
            </select>
          </div>
          <button className="h-9 px-4 rounded-full bg-secondary/60 ring-1 ring-border hover:ring-primary/40 text-xs font-bold transition-colors" onClick={handleLogout}>
            {t("nav.logout")}
          </button>
          <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-secondary/60 ring-1 ring-border">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/40 to-organ-lungs/40 flex items-center justify-center text-[10px] font-black uppercase shadow-lg shadow-primary/20">
              {userInitials}
            </div>
            <span className="text-sm font-medium">{user?.full_name || "Guest User"}</span>
            <TbChevronDown className="text-muted-foreground" />
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-4 p-4 lg:p-6 min-h-0">
        {/* LEFT */}
        <ControlPanel />

        {/* CENTER */}
        <section className="flex flex-col gap-4 min-w-0">
          {/* Section header & Tab Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2 p-1 bg-secondary/40 rounded-xl ring-1 ring-border/50 w-fit">
              <button 
                onClick={() => setMainTab("insights")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  mainTab === "insights" 
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Health Dashboard
              </button>
              <button 
                onClick={() => setMainTab("analyzer")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  mainTab === "analyzer" 
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("nav.analyzer" as any, "Report Analyzer")}
              </button>
              <button 
                onClick={() => setMainTab("projection")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  mainTab === "projection" 
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Future Projection
              </button>
              <button 
                onClick={() => setMainTab("doctors")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  mainTab === "doctors" 
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Doctors
              </button>
              <button 
                onClick={() => setMainTab("guidance")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  mainTab === "guidance" 
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Care Assistant
              </button>
              <button 
                onClick={() => setMainTab("voice")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all inline-flex items-center gap-1.5 ${
                  mainTab === "voice" 
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TbMicrophone className="text-base shrink-0" aria-hidden />
                {t("voice.tab")}
              </button>
            </div>
            
            {mainTab === "insights" && (
              <div className="flex items-center gap-2">
                <button className="h-9 px-3 rounded-lg bg-secondary/60 ring-1 ring-border hover:ring-primary/40 text-sm flex items-center gap-1.5 text-muted-foreground transition-colors">
                  <TbDownload /> Export <TbChevronDown className="text-muted-foreground" />
                </button>
                <button className="h-9 px-3 rounded-lg bg-secondary/60 ring-1 ring-border hover:ring-primary/40 text-sm flex items-center gap-1.5 text-muted-foreground transition-colors">
                  <TbDeviceFloppy /> Save
                </button>
                <button 
                  onClick={() => navigate("/body-simulation")}
                  className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-black flex items-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all ml-2"
                >
                  <TbBoxModel className="text-lg" /> 3D IMMERSIVE MODE
                </button>
              </div>
            )}
          </div>

          {mainTab === "analyzer" ? (
            <ReportAnalyzer />
          ) : mainTab === "doctors" ? (
            <DoctorRecommendations />
          ) : mainTab === "guidance" ? (
            <CareGuidance />
          ) : mainTab === "projection" ? (
            <FutureProjection />
          ) : mainTab === "voice" ? (
            <VoiceInteraction />
          ) : (
            <>
              {/* Top: Health Data + Organ Risk Levels */}

          <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">
            <div className="flex flex-col gap-6">
              <HealthDataCard />
              {/* Charts with tabs */}
              <div className="glass-card rounded-2xl p-6 flex flex-col min-h-[380px] shadow-sm">
                <div className="flex-1 min-h-0">
                  <ChartPanel />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4">
                  <div className="flex items-center gap-2">
                    {(["organ", "trends"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                          tab === t
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "text-muted-foreground hover:text-foreground bg-secondary/40"
                        }`}
                      >
                        {t === "organ" ? "Organ Risks" : "Health Trends"}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter italic">Live Digital Twin Stream</span>
                </div>
              </div>
            </div>

            <OrganRiskList />
          </div>

          {/* Bottom: secondary chart + analysis */}
          <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6 pb-6">
            <div className="glass-card rounded-2xl p-6 flex flex-col min-h-[300px] shadow-sm">
              <div className="flex-1 min-h-0">
                <ChartPanel
                  title="Risks Over Time"
                  subtitle="Simulation Snapshot"
                  showLegend={false}
                  organs={["heart", "liver", "lungs"]}
                />
              </div>
              <div className="mt-5 border-t border-border/40 pt-5">
                <h4 className="text-[11px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 text-primary/80">
                   <TbSparkles className="text-sm" /> Simulation Summary
                </h4>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={summary}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[13px] text-muted-foreground leading-relaxed font-medium"
                  >
                    {loading ? t("dashboard.generating") : summary}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 shadow-sm border border-primary/5">
              <h4 className="text-[11px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-primary/80">
                <TbSparkles className="text-sm" /> {t("dashboard.causal_title")}
              </h4>
              <div className="rounded-xl bg-secondary/30 ring-1 ring-border/40 p-5 transition-all hover:bg-secondary/40">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-0.5">{t("dashboard.status_title")}</div>
                    <div className="text-sm font-bold tracking-tight text-foreground">{report?.risk_level || t("dashboard.ready")}</div>
                  </div>
                  <div className="text-3xl font-black tabular-nums tracking-tighter text-primary">
                    {(clinicalAssessmentState?.organ_insights?.heart?.numerical_score || report?.organ_insights?.heart?.numerical_score)?.toFixed(1) ?? "--"}
                  </div>
                </div>
                <p className="text-[12px] text-muted-foreground/80 leading-relaxed font-medium italic border-l-2 border-primary/20 pl-3">
                  {loading ? t("dashboard.decrypting") : causalNarrative}
                </p>
              </div>
              {report?.priority_actions && report.priority_actions.length > 0 && (
                <div className="mt-5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3 ml-1">{t("dashboard.trajectory_title")}</div>
                  <ul className="space-y-2">
                    {report.priority_actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[12px] text-muted-foreground font-semibold">
                         <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shadow-[0_0_5px_hsl(var(--primary))]" />
                         {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          </>
          )}
        </section>

        {/* RIGHT */}
        <ProfileCard />
      </main>
    </div>
  );
};

export default Index;
