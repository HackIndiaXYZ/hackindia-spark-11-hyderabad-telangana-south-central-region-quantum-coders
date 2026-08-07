import { motion } from "framer-motion";
import type { OrganScores, RiskLevel } from "@/store/useStore";
import {
  TbHeartbeat,
  TbLungs,
  TbBrain,
  TbDroplet,
  TbBowlSpoon,
} from "react-icons/tb";
import { useTranslation } from "react-i18next";

const RISK_CLASS: Record<string, string> = {
  low: "text-risk-healthy",
  healthy: "text-risk-healthy",
  moderate: "text-risk-moderate",
  high: "text-risk-high",
  critical: "text-risk-high font-bold",
};

const RISK_BG: Record<string, string> = {
  low: "bg-risk-healthy/10 ring-risk-healthy/30",
  healthy: "bg-risk-healthy/10 ring-risk-healthy/30",
  moderate: "bg-risk-moderate/10 ring-risk-moderate/30",
  high: "bg-risk-high/10 ring-risk-high/30",
  critical: "bg-risk-high/20 ring-risk-high/50 shadow-[0_0_15px_hsl(var(--risk-high)/0.2)]",
};

export const ORGAN_META: Record<
  keyof OrganScores,
  { nameKey: string; icon: React.ReactNode; iconColor: string; descKey: string }
> = {
  brain: {
    nameKey: "organ.brain",
    icon: <TbBrain />,
    iconColor: "text-organ-brain",
    descKey: "organ.desc.brain",
  },
  heart: {
    nameKey: "organ.heart",
    icon: <TbHeartbeat />,
    iconColor: "text-organ-heart",
    descKey: "organ.desc.heart",
  },
  lungs: {
    nameKey: "organ.lungs",
    icon: <TbLungs />,
    iconColor: "text-organ-lungs",
    descKey: "organ.desc.lungs",
  },
  liver: {
    nameKey: "organ.liver",
    icon: <TbBowlSpoon />,
    iconColor: "text-organ-liver",
    descKey: "organ.desc.liver",
  },
  kidneys: {
    nameKey: "organ.kidneys",
    icon: <TbDroplet />,
    iconColor: "text-organ-kidneys",
    descKey: "organ.desc.kidneys",
  },
};

interface Props {
  organKey: keyof OrganScores;
  score: number;
  level: RiskLevel;
  index?: number;
  compact?: boolean;
}

const getHealthGrade = (risk: number) => {
  const vitality = 100 - risk;
  if (vitality >= 90) return { grade: "A+", color: "text-emerald-400" };
  if (vitality >= 80) return { grade: "A", color: "text-emerald-400" };
  if (vitality >= 70) return { grade: "B", color: "text-blue-400" };
  if (vitality >= 50) return { grade: "C", color: "text-yellow-400" };
  if (vitality >= 30) return { grade: "D", color: "text-orange-400" };
  return { grade: "F", color: "text-red-400" };
};

export default function OrganCard({ organKey, score, level, index = 0, compact }: Props) {
  const { t } = useTranslation();
  const meta = ORGAN_META[organKey];
  const { grade, color } = getHealthGrade(score);
  
  const riskLabels: Record<string, string> = {
    low: "Healthy Baseline",
    healthy: "Healthy Baseline",
    moderate: "Moderate Risk",
    high: "High Risk",
    critical: "Critical Concern",
  };

  const organFormulas: Record<string, string> = {
    heart: "AHA PREVENT™ Model",
    kidneys: "CKD-EPI 2021 (KDIGO)",
    liver: "FIB-4 Index / MELD-Na",
    lungs: "GOLD 2026 Spirometry",
    brain: "CHA₂DS₂-VASc Risk",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`glass-card rounded-xl p-5 ring-1 ${RISK_BG[level]} hover:scale-[1.01] transition-all hover:shadow-lg`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className={`text-3xl ${meta.iconColor} mt-0.5`}>
            {meta.icon}
          </div>
          <div className="min-w-0 space-y-1">
            <div className="font-black text-foreground tracking-tight uppercase text-xs">{t(meta.nameKey)}</div>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${RISK_BG[level]} ${RISK_CLASS[level]} ring-1 ring-current/20`}>
                {riskLabels[level]}
              </span>
              <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
                {organFormulas[organKey] || "Clinical Guideline"}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
           <div className={`text-2xl font-black tabular-nums tracking-tighter ${color}`}>
             {grade}
           </div>
           <div className="text-[7px] font-bold text-muted-foreground uppercase">Integrity</div>
        </div>
      </div>
      {!compact && (
        <p className="text-[12px] text-muted-foreground/80 mt-4 leading-relaxed font-medium max-w-[95%]">
          {t(meta.descKey)}
        </p>
      )}
    </motion.div>
  );
}
