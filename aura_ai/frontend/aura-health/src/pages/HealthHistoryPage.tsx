import { useState } from "react";
import { useStore } from "@/store/useStore";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import {
  TbHistory,
  TbCalendar,
  TbRotateClockwise,
  TbFileReport,
  TbPlus,
  TbBuildingHospital,
  TbUserCheck
} from "react-icons/tb";

export default function HealthHistoryPage() {
  const { medicalRecords, clinicalAssessmentState } = useStore();
  const organInsights = clinicalAssessmentState?.organ_insights;

  // Transform real uploaded patient medical records into historical timeline entries (chronologically sorted by visitDate)
  const historyData = medicalRecords.map((record) => ({
    id: record.id,
    date: record.visitDate,
    label: record.primaryDiagnosis,
    hospital: record.hospitalName,
    doctor: record.doctorName,
    heart: Math.round(organInsights?.heart?.numerical_score || 0),
    lungs: Math.round(organInsights?.lungs?.numerical_score || 0),
    liver: Math.round(organInsights?.liver?.numerical_score || 0),
    kidneys: Math.round(organInsights?.kidneys?.numerical_score || 0),
    brain: Math.round(organInsights?.brain?.numerical_score || 0),
    summary: record.aiSummary || record.doctorAdvice || "Clinical record entry."
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const [selectedHistory, setSelectedHistory] = useState(historyData[historyData.length - 1] || null);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm shadow-xs">
              <TbHistory />
            </div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Historical Audit</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Patient Health Timeline & History
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Chronological audit of real uploaded clinical reports and organ score trajectory
          </p>
        </div>

        {historyData.length === 0 ? (
          /* Clean Empty State */
          <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 dark:bg-slate-800 flex items-center justify-center text-3xl mx-auto shadow-xs">
              <TbFileReport />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                No Historical Reports Recorded
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                No medical history found for this patient. Upload a doctor prescription or lab report in the repository to populate your physiological trend timeline.
              </p>
            </div>

            <Link
              to="/reports"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all inline-flex items-center gap-2"
            >
              <TbPlus className="text-base" />
              <span>Go to Repository & Upload Report</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Trend Chart Box */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Historical Organ Stress Trends</h3>
                <span className="text-xs text-slate-400 font-semibold">Real Patient Visit Trajectory</span>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                    />
                    <Line type="monotone" dataKey="heart" name="Heart" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="lungs" name="Lungs" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="liver" name="Liver" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="kidneys" name="Kidneys" stroke="#a855f7" strokeWidth={2} />
                    <Line type="monotone" dataKey="brain" name="Brain" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Timeline Cards Grid */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Real Patient Clinical Audit Records</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {historyData.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedHistory(item)}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 ${
                      selectedHistory?.id === item.id
                        ? "bg-blue-50/70 border-blue-500 dark:bg-slate-800 dark:border-blue-500 shadow-md"
                        : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <TbCalendar className="text-sm text-blue-600" />
                        Visit: {item.date}
                      </span>
                      {selectedHistory?.id === item.id && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white">
                          Active
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{item.label}</h4>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                        <span><TbBuildingHospital className="inline" /> {item.hospital}</span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2">
                        {item.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
