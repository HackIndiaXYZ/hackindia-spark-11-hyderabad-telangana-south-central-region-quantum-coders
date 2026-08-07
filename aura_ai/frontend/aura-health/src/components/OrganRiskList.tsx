import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { ORGAN_META } from "./OrganCard";
import type { OrganScores, RiskLevel } from "@/store/useStore";

const LEVEL_LABEL: Record<string, string> = {
  low: "Low",
  healthy: "Healthy",
  moderate: "Moderate",
  high: "High",
  critical: "Critical",
};

const getHealthGrade = (risk: number) => {
  const vitality = 100 - risk;
  if (vitality >= 90) return { grade: "A+", color: "text-emerald-400" };
  if (vitality >= 80) return { grade: "A", color: "text-emerald-400" };
  if (vitality >= 70) return { grade: "B", color: "text-blue-400" };
  if (vitality >= 50) return { grade: "C", color: "text-yellow-400" };
  if (vitality >= 30) return { grade: "D", color: "text-orange-400" };
  return { grade: "F", color: "text-red-400" };
};

export default function OrganRiskList() {
  const clinicalAssessmentState = useStore((s) => s.clinicalAssessmentState);
  const report = useStore((s) => s.report);
  const insights = clinicalAssessmentState?.organ_insights || report?.organ_insights;
  
  if (!insights) return (
    <div className="glass-card rounded-2xl p-5 h-full opacity-50 flex items-center justify-center text-sm">
      Analysis pending simulation...
    </div>
  );

  return (
    <div className="glass-card rounded-2xl p-5 h-full overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
          Organ Diagnostic Status
        </h3>
        <span className="text-muted-foreground/30 text-lg leading-none cursor-help">···</span>
      </div>
      <div className="space-y-4">
        {Object.entries(insights).map(([key, data], i) => {
          const meta = ORGAN_META[key as keyof typeof ORGAN_META] || ORGAN_META.heart;
          const score = typeof data.numerical_score === 'number' ? data.numerical_score : 50;
          const vitality = 100 - score;
          const { grade, color } = getHealthGrade(score);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl bg-secondary/20 ring-1 ring-border/30 p-4 hover:ring-primary/20 transition-all shadow-inner"
            >
              <div className="flex items-start gap-4">
                <div className={`text-2xl ${meta.iconColor} mt-1`}>
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <div className="font-black text-[13px] text-foreground capitalize tracking-tight">{key}</div>
                      <div className={`text-[9px] font-black uppercase tracking-wider opacity-80`}>
                        {LEVEL_LABEL[data.risk_label] || data.risk_label} RISK
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="text-right">
                          <div className={`text-xl font-black leading-none ${color}`}>{grade}</div>
                          <div className="text-[8px] font-bold text-muted-foreground uppercase">Vitality</div>
                       </div>
                    </div>
                  </div>

                  {/* Health Capacity Bar */}
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-2 mb-3">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${vitality}%` }}
                      className={`h-full ${color.replace('text', 'bg')} shadow-[0_0_8px_currentColor]`}
                    />
                  </div>

                  <p className="text-[11px] text-muted-foreground/90 leading-relaxed font-medium">
                    {data.explanation}
                  </p>
                  
                  {data.recommendation && (
                    <div className="mt-3 pt-3 border-t border-white/5 text-[10px] font-bold text-primary flex items-center gap-2">
                       <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_5px_currentColor]" />
                       {data.recommendation}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
