import DashboardLayout from "@/components/DashboardLayout";
import DoctorRecommendations from "@/components/DoctorRecommendations";
import { TbUserHeart } from "react-icons/tb";

export default function DoctorsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm shadow-xs">
              <TbUserHeart />
            </div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Medical Network</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Specialist & Hospital Recommendations
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Automated clinical referral based on Digital Twin organ risk prioritization
          </p>
        </div>

        {/* Doctor Recommendations Component */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <DoctorRecommendations />
        </div>
      </div>
    </DashboardLayout>
  );
}
