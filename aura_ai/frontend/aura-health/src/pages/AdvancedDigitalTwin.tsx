import { useState } from "react";
import { useStore } from "@/store/useStore";
import DashboardLayout from "@/components/DashboardLayout";
import ControlPanel from "@/components/ControlPanel";
import ChartPanel from "@/components/ChartPanel";
import { motion } from "framer-motion";
import {
  TbCpu,
  TbMathFunction,
  TbChartBar,
  TbAdjustmentsHorizontal,
  TbRefresh,
  TbBulb,
  TbSparkles
} from "react-icons/tb";

export default function AdvancedDigitalTwin() {
  const { report, loading, runSimulation } = useStore();
  const [activeTab, setActiveTab] = useState<"simulation" | "formula" | "charts">("simulation");

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Advanced Digital Twin Engine
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Physiological parametric simulation and mathematical modeling
            </p>
          </div>

          <button
            onClick={() => runSimulation()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <TbRefresh className={`text-base ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Calculating..." : "Run Clinical Assessment"}</span>
          </button>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("simulation")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "simulation"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <TbAdjustmentsHorizontal className="text-base" />
            <span>Parametric Control Panel</span>
          </button>

          <button
            onClick={() => setActiveTab("charts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "charts"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <TbChartBar className="text-base" />
            <span>Organ Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab("formula")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "formula"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <TbMathFunction className="text-base" />
            <span>Mathematical Formulations</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "simulation" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ControlPanel />
            </div>

            <div className="space-y-6">
              {/* Simulation Result Box */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                    <TbCpu />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Biological Output</h3>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">System Status</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">
                    {report ? `${report.risk_level} Risk Level` : "Awaiting Input"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {report?.summary || "Adjust lifestyle parameters on the left to recalculate biological Twin responses."}
                  </p>
                </div>
              </div>

              {/* What If Insight */}
              {report?.what_if_insight && (
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-md space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
                    <TbBulb className="text-base" />
                    <span>What-If Insight</span>
                  </div>
                  <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                    {report.what_if_insight}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "charts" && (
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <ChartPanel />
          </div>
        )}

        {activeTab === "formula" && (
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TbMathFunction className="text-blue-600 text-xl" />
                <span>Deterministic Biological Equations</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Mathematical modeling formulas used to compute baseline biological stress scores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <h4 className="text-xs font-bold text-blue-600 uppercase">Cardiovascular Score Formula</h4>
                <code className="block p-3 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono">
                  Heart Risk = 40 + (BMI - 22) * 1.5 + (Smoker ? 20 : 0) - (Sleep - 7) * 2
                </code>
                <p className="text-xs text-slate-500 font-medium">
                  Models arterial load, blood pressure variance, and tobacco stress factors.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <h4 className="text-xs font-bold text-blue-600 uppercase">Pulmonary Risk Index</h4>
                <code className="block p-3 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono">
                  Lung Risk = 30 + (Smoker ? 35 : 0) - (Activity * 4) + (Age * 0.25)
                </code>
                <p className="text-xs text-slate-500 font-medium">
                  Models oxygen saturation capacity and physical activity compensation factors.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
