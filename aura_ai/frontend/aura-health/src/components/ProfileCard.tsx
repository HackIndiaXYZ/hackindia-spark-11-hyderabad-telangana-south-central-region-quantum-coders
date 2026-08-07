import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { TbBulb, TbLungs } from "react-icons/tb";
import { ORGAN_META } from "./OrganCard";
import { useTranslation } from "react-i18next";

export default function ProfileCard() {
  const { t } = useTranslation();
  const data = useStore((s) => s.lifestyleData);
  const clinicalAssessmentState = useStore((s) => s.clinicalAssessmentState);
  const report = useStore((s) => s.report);
  const user = useStore((s) => s.user);

  const highestRisk = useMemo(() => {
    const organInsights = clinicalAssessmentState?.organ_insights || report?.organ_insights;
    if (!organInsights) return null;
    return Object.entries(organInsights).sort(
      (a, b) => ((b[1] as any).numerical_score || 0) - ((a[1] as any).numerical_score || 0)
    )[0];
  }, [clinicalAssessmentState, report]);

  const nextStep = report?.priority_actions?.[0] || t("priority.general");
  
  const userInitials = user?.full_name
    ? user.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : "??";

  return (
    <div className="flex flex-col gap-4">
      {/* Profile */}
      <div className="glass-card rounded-2xl p-5 flex flex-col items-center text-center">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/40 to-organ-lungs/40 flex items-center justify-center text-2xl font-bold text-foreground ring-2 ring-primary/30 shadow-[0_0_24px_hsl(var(--primary)/0.4)]">
            {userInitials}
          </div>
          <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-risk-healthy ring-2 ring-card" />
        </div>
        <h3 className="mt-3 text-lg font-semibold text-foreground">{user?.full_name || t("profile.guest")}</h3>

        <div className="w-full mt-4 space-y-2 text-sm">
          {[
            [t("profile.age"), `${data.age} ${t("common.years")}`],
            [t("profile.bmi"), `${data.bmi}`],
            [t("profile.smoking"), data.smoking ? t("common.yes") : t("common.no")],
            [t("profile.alcohol"), data.alcohol ? t("common.yes") : t("common.no")],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs uppercase tracking-wide">{k}</span>
              <span className="font-medium text-foreground">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized recommendations preview */}
      <div className="glass-card rounded-2xl p-5 shadow-sm border border-primary/10">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/90">
            {t("organ.recs")}
          </h3>
        </div>
        
        <div className="space-y-4">
          {highestRisk ? (
            <div className="rounded-xl bg-secondary/30 ring-1 ring-border/50 p-4 transition-colors hover:bg-secondary/40">
              <div className="flex items-start gap-4">
                <div className={`text-2xl ${ORGAN_META[highestRisk[0] as keyof typeof ORGAN_META]?.iconColor || "text-primary"} drop-shadow-[0_0_8px_currentColor] mt-1`}>
                  {ORGAN_META[highestRisk[0] as keyof typeof ORGAN_META]?.icon || <TbLungs />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-sm tracking-tight text-foreground capitalize">
                      {highestRisk[0]} {t("organ.health_label")}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-risk-high px-1.5 py-0.5 rounded bg-risk-high/10 ring-1 ring-risk-high/30">
                      {(highestRisk[1] as any).risk_label}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {(highestRisk[1] as any).recommendation}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic p-4 bg-secondary/20 rounded-xl border border-dashed border-border">
              {t("dashboard.recs_fallback", "Run simulation to generate health insights...")}
            </div>
          )}

          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <TbBulb className="text-primary text-sm" />
              <div className="text-xs font-bold uppercase tracking-wide">{t("profile.next_step")}</div>
            </div>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed font-medium">
              {nextStep}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
