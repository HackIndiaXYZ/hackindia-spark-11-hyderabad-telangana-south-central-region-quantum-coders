import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { 
  TbArrowLeft, 
  TbActivity, 
  TbAdjustmentsHorizontal, 
  TbBolt,
  TbLoader2,
  TbPalette,
  TbBone,
  TbSparkles,
  TbRotateClockwise,
  TbBrain,
  TbHeart,
  TbLungs,
  TbStethoscope
} from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { useStore, OrganInsights } from "@/store/useStore";
import HumanAnatomy, { AnatomyMode } from "@/components/BodySimulator/HumanAnatomy";

export default function BodySimulation() {
  const navigate = useNavigate();
  const { 
    lifestyleData, 
    setLifestyle, 
    runSimulation, 
    loading, 
    report, 
    clinicalAssessmentState,
    simulationTimeframe, 
    setSimulationTimeframe,
    fetchHealthProjection,
    fetchingProjection,
    hoveredOrgan,
    setHoveredOrgan
  } = useStore();

  const [anatomyMode, setAnatomyMode] = useState<AnatomyMode>("fullcolor");
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const timeLabels = ["Now", "6 Months", "1 Year", "2 Years"];
  const masterInsights = clinicalAssessmentState?.organ_insights || report?.organ_insights;

  const organIcons: Record<string, React.ReactNode> = {
    heart: <TbHeart className="text-red-400" />,
    brain: <TbBrain className="text-pink-400" />,
    lungs: <TbLungs className="text-cyan-400" />,
    liver: <TbActivity className="text-lime-400" />,
    kidneys: <TbStethoscope className="text-amber-400" />,
  };

  return (
    <div className="fixed inset-0 bg-[#020617] text-slate-50 flex overflow-hidden font-sans">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_100%)]" />
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <button 
          onClick={() => navigate("/dashboard")}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-white text-xs font-extrabold rounded-2xl border border-white/10 shadow-lg backdrop-blur-xl transition-all"
        >
          <TbArrowLeft className="text-base" /> Back to Dashboard
        </button>

        {/* 3D Render Mode Toolbar */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl">
          <button
            onClick={() => setAnatomyMode("fullcolor")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              anatomyMode === "fullcolor"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <TbPalette className="text-sm" /> Full Color 3D
          </button>

          <button
            onClick={() => setAnatomyMode("xray")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              anatomyMode === "xray"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <TbBone className="text-sm" /> X-Ray View
          </button>

          <button
            onClick={() => setAnatomyMode("hologram")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              anatomyMode === "hologram"
                ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/25"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <TbSparkles className="text-sm" /> Cyber Hologram
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle 3D Rotation"
            className={`p-1.5 rounded-xl text-xs font-extrabold transition-all ${
              autoRotate ? "bg-primary/20 text-primary border border-primary/30" : "text-slate-400 hover:text-white"
            }`}
          >
            <TbRotateClockwise className={`text-base ${autoRotate ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* Left Sidebar - Live Twin Controls */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="relative z-40 w-96 h-full p-8 pt-28 bg-[#020617]/50 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between overflow-y-auto"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <TbAdjustmentsHorizontal className="text-2xl" />
             </div>
             <div>
                <h1 className="text-sm font-black uppercase tracking-wider text-slate-100">Live Twin Controls</h1>
                <p className="text-[10px] font-bold text-slate-400">Biometric Parametric Simulation</p>
             </div>
          </div>

          <div className="space-y-4">
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                   <span>Body Mass Index (BMI)</span>
                   <span className="text-blue-400 font-black">{lifestyleData.bmi}</span>
                </div>
                <input 
                  type="range" min="15" max="45" value={lifestyleData.bmi} 
                  onChange={(e) => setLifestyle("bmi", Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                />
             </div>

             <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                   <span>Daily Sleep Duration</span>
                   <span className="text-blue-400 font-black">{lifestyleData.sleep} Hours</span>
                </div>
                <input 
                  type="range" min="3" max="12" value={lifestyleData.sleep} 
                  onChange={(e) => setLifestyle("sleep", Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                />
             </div>

             <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                   <span>Physical Activity</span>
                   <span className="text-blue-400 font-black">{lifestyleData.activity} Min/Wk</span>
                </div>
                <input 
                  type="range" min="0" max="420" step="30" value={lifestyleData.activity} 
                  onChange={(e) => setLifestyle("activity", Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                />
             </div>

             <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-xs font-bold">Tobacco Usage</span>
                <button onClick={() => setLifestyle("smoking", !lifestyleData.smoking)} className={`w-11 h-6 rounded-full transition-colors relative ${lifestyleData.smoking ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${lifestyleData.smoking ? 'left-6' : 'left-1'}`} />
                </button>
             </div>
          </div>
        </div>

        <button 
          onClick={() => runSimulation()}
          disabled={loading}
          className="w-full py-4 mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-tight text-xs"
        >
          {loading ? <TbLoader2 className="animate-spin text-lg" /> : <TbBolt className="text-lg" />}
          Run Clinical Assessment
        </button>
      </motion.aside>

      {/* Main 3D Canvas Area */}
      <main className="flex-1 relative">
        <Suspense fallback={
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50 animate-pulse">
            <TbLoader2 className="text-6xl text-blue-500 animate-spin mb-4" />
            <p className="font-black text-blue-400 tracking-widest uppercase text-xs">Loading 3D Anatomy Model...</p>
          </div>
        }>
          <Canvas 
            className="w-full h-full"
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.8 }}
          >
            <PerspectiveCamera makeDefault position={[0, 0, 4.2]} fov={45} />
            <OrbitControls 
              enablePan={true} 
              minDistance={1.2} 
              maxDistance={10} 
              autoRotate={autoRotate}
              autoRotateSpeed={0.8}
              makeDefault 
            />
            
            <Environment preset="studio" />
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 8, 5]} intensity={3.5} color="#ffffff" castShadow />
            <directionalLight position={[-5, 3, -5]} intensity={2.8} color="#818cf8" />
            <directionalLight position={[0, -5, 5]} intensity={2.0} color="#22d3ee" />
            <spotLight position={[0, 10, 0]} intensity={3} angle={0.6} penumbra={1} color="#f472b6" />
            
            <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
              <HumanAnatomy 
                mode={anatomyMode}
                selectedOrgan={hoveredOrgan}
                onSelectOrgan={(organ) => setHoveredOrgan(organ)}
              />
            </Float>
            
            <ContactShadows position={[0, -1.8, 0]} opacity={0.5} scale={8} blur={20} far={4} color="#000000" />
          </Canvas>
        </Suspense>

        {/* Bottom Timeframe Simulation Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4">
           <div className="bg-slate-900/80 p-5 rounded-3xl backdrop-blur-3xl border border-white/10 shadow-2xl">
              <div className="flex justify-between mb-3">
                 {timeLabels.map((label, idx) => (
                    <button 
                      key={label} 
                      onClick={() => { setSimulationTimeframe(idx); if (idx > 0) fetchHealthProjection(); }} 
                      className={`text-[10px] font-black uppercase tracking-widest transition-all ${simulationTimeframe === idx ? "text-blue-400 scale-110 font-bold" : "text-slate-500 hover:text-white"}`}
                    >
                      {label}
                    </button>
                 ))}
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                 <motion.div 
                   animate={{ left: `${(simulationTimeframe / 3) * 100}%` }} 
                   className="absolute top-0 w-1/4 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] transition-all" 
                 />
              </div>
           </div>
        </div>
      </main>

      {/* Right Sidebar - Organ Diagnostic Panel */}
      <motion.aside 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="relative z-40 w-96 h-full p-8 pt-28 bg-[#020617]/50 backdrop-blur-2xl border-l border-white/10 overflow-y-auto"
      >
        <h2 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-6 flex items-center gap-2">
          <TbActivity /> Organ Diagnostics & Scores
        </h2>

        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {!masterInsights ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center text-slate-500 italic text-sm">
                No clinical assessment active. Click on an organ node or run simulation to inspect insights.
              </motion.div>
            ) : (
              <motion.div key="summary" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                {report?.summary && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                    <p className="text-xs leading-relaxed text-slate-300">{report.summary}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(masterInsights).map(([name, data]) => {
                    const score = data.numerical_score;
                    const isSelected = hoveredOrgan === name;

                    return (
                      <div 
                        key={name}
                        onClick={() => setHoveredOrgan(name as keyof OrganInsights)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-500/10 scale-[1.02]" 
                            : "bg-white/5 border-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            {organIcons[name] || <TbActivity className="text-blue-400" />}
                            <span className="text-xs font-black uppercase tracking-wider text-white">{name}</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            score === null
                              ? "bg-slate-800 text-slate-400"
                              : score >= 80 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                : score >= 50 
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}>
                            {score === null ? "Waiting" : `${score}% (${data.risk_label || "Score"})`}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-400 mt-1">{data.explanation}</p>
                      </div>
                    );
                  })}
                </div>

                {report?.causal_narrative && (
                  <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                     <h4 className="text-[10px] font-black uppercase text-blue-400 mb-1.5">Causal Narrative</h4>
                     <p className="text-xs italic text-blue-200/80 leading-relaxed font-medium">{report.causal_narrative}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </div>
  );
}
