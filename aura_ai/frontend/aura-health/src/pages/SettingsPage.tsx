import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  TbSettings,
  TbBell,
  TbShieldLock,
  TbDatabase,
  TbCircleCheck,
  TbMoon,
  TbSun
} from "react-icons/tb";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [telemetry, setTelemetry] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm shadow-xs">
              <TbSettings />
            </div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Configuration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Application Settings
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage system preferences, notifications, and security protocols
          </p>
        </div>

        {/* Settings Card Grid */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-8">
          {/* Section 1: Appearance & Theme */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Appearance</h3>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                {darkMode ? <TbMoon className="text-blue-500 text-xl" /> : <TbSun className="text-amber-500 text-xl" />}
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Dark Theme Mode</p>
                  <p className="text-xs text-slate-500 font-medium">Switch between light healthcare & dark clinical theme</p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                  darkMode ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    darkMode ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 2: Notifications & Alerts */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Notifications</h3>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <TbBell className="text-blue-600 text-xl" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Clinical Risk Alerts</p>
                  <p className="text-xs text-slate-500 font-medium">Receive real-time notifications when organ stress exceeds threshold</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                  notifications ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 3: System Status Badges */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">System Integration Status</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                <TbCircleCheck className="text-emerald-600 text-xl flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">FastAPI Gateway</p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Active on :8000</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                <TbDatabase className="text-emerald-600 text-xl flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">MongoDB Database</p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Connected (digital_twin_health)</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
                <TbShieldLock className="text-blue-600 text-xl flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-300">Vercel Serverless Ready</p>
                  <p className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold">Build Target Configured</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
