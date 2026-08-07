import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { TbBrain, TbHeartbeat, TbLungs, TbCalendar, TbAlertTriangle, TbAlertOctagon } from "react-icons/tb";
import { useTranslation } from "react-i18next";

interface MetricProps {
  icon: React.ReactNode;
  iconColor: string;
  name: string;
  score: number;
  level: string;
  subValue: string;
  subLabel: string;
  delay?: number;
}

function MetricCard({ icon, iconColor, name, score, level, subValue, subLabel, delay = 0 }: MetricProps) {
  const { t } = useTranslation();
  
  const RISK_TONE: Record<string, any> = {
    low: { ring: "ring-risk-healthy/30", text: "text-risk-healthy", chip: "bg-risk-healthy/15", icon: <TbCalendar /> , label: t("metric.stable") },
    healthy: { ring: "ring-risk-healthy/30", text: "text-risk-healthy", chip: "bg-risk-healthy/15", icon: <TbCalendar /> , label: t("metric.stable") },
    moderate: { ring: "ring-risk-moderate/30", text: "text-risk-moderate", chip: "bg-risk-moderate/15", icon: <TbAlertTriangle />, label: t("metric.moderate") },
    high: { ring: "ring-risk-high/30", text: "text-risk-high", chip: "bg-risk-high/15", icon: <TbAlertOctagon />, label: t("metric.danger") },
    critical: { ring: "ring-risk-high/50", text: "text-risk-high", chip: "bg-risk-high/30", icon: <TbAlertOctagon />, label: t("metric.critical") },
  };

  const tone = RISK_TONE[level] || RISK_TONE.moderate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl bg-secondary/40 ring-1 ring-border/60 p-4 hover:ring-primary/30 transition-shadow shadow-sm hover:shadow-md h-full flex flex-col justify-between"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <span className={`text-xl ${iconColor} drop-shadow-[0_0_8px_currentColor]`}>{icon}</span>
          <span className="font-semibold tracking-tight">{name}</span>
        </div>
        <span className="text-3xl font-bold tabular-nums text-foreground tracking-tighter">
          {typeof score === 'number' ? score.toFixed(1) : score}
        </span>
      </div>
      
      <div className="flex flex-col gap-3 mt-4">
        <div className="flex items-center">
          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tone.chip} ${tone.text} ring-1 ${tone.ring}`}>
            <span className="text-[10px]">{tone.icon}</span>
            {tone.label}
          </div>
        </div>
        
        <div className="text-xs flex items-baseline gap-1.5">
          <span className={`text-sm font-bold tabular-nums ${tone.text}`}>{subValue}</span>
          <span className="text-muted-foreground font-medium">{subLabel}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function HealthDataCard() {
  const { t } = useTranslation();
  const clinicalAssessmentState = useStore((s) => s.clinicalAssessmentState);
  const report = useStore((s) => s.report);
  const insights = clinicalAssessmentState?.organ_insights || report?.organ_insights;

  if (!insights) return (
    <div className="glass-card rounded-2xl p-5 opacity-50 flex items-center justify-center text-sm font-medium h-[200px]">
      {t("metric.load_data")}
    </div>
  );

  return (
    <div className="glass-card rounded-2xl p-5 shadow-inner">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/80">
          {t("dashboard.health_data")}
        </h3>
        <span className="text-muted-foreground/30 text-lg leading-none cursor-help">···</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={<TbBrain />}
          iconColor="text-organ-brain"
          name={t("metric.brain")}
          score={insights?.brain?.numerical_score ?? 0}
          level={insights?.brain?.risk_label ?? "moderate"}
          subValue={`${Math.round((insights?.brain?.numerical_score ?? 0) * 0.5)}`}
          subLabel={t("metric.cognitive")}
          delay={0}
        />
        <MetricCard
          icon={<TbHeartbeat />}
          iconColor="text-organ-heart"
          name={t("metric.heart")}
          score={insights?.heart?.numerical_score ?? 0}
          level={insights?.heart?.risk_label ?? "moderate"}
          subValue={`${Math.round(insights?.heart?.numerical_score ?? 0)}`}
          subLabel={t("metric.bpm")}
          delay={0.05}
        />
        <MetricCard
          icon={<TbLungs />}
          iconColor="text-organ-lungs"
          name={t("metric.lungs")}
          score={insights?.lungs?.numerical_score ?? 0}
          level={insights?.lungs?.risk_label ?? "moderate"}
          subValue={`${Math.round(insights?.lungs?.numerical_score ?? 0)}`}
          subLabel={t("metric.capacity")}
          delay={0.1}
        />
      </div>
    </div>
  );
}
