import { useState } from "react";
import { motion } from "framer-motion";
import { useStore, type DietType } from "@/store/useStore";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TbCalendarStats,
  TbScale,
  TbMoon,
  TbActivity,
  TbSmoking,
  TbGlassFull,
  TbSalad,
  TbPlayerPlay,
  TbDeviceFloppy,
  TbLoader2,
  TbLock,
} from "react-icons/tb";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "sonner";

import { API_BASE } from "@/services/api";

interface ControlRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}
function ControlHeader({ icon, label, value }: ControlRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="text-primary">{icon}</span>
        <span>{label}</span>
      </div>
      <span className="font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export default function ControlPanel() {
  const { t } = useTranslation();
  const data = useStore((s) => s.lifestyleData);
  const set = useStore((s) => s.setLifestyle);
  const run = useStore((s) => s.runSimulation);
  const loading = useStore((s) => s.loading);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("twin_token");
      await axios.put(`${API_BASE}/v1/auth/profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Profile synchronized with MongoDB");
    } catch (err) {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className="glass-card rounded-2xl p-5 flex flex-col gap-5 h-full overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          {t("control.title")}
        </h2>
        <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
      </div>

      <div className="sticky top-0 z-10 -mx-1 -mt-1 pt-1 bg-background/5 rounded-t-xl backdrop-blur-md">
        <motion.div whileTap={{ scale: 0.97 }} className="pb-4">
          <Button
            onClick={() => run()}
            disabled={loading}
            className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base tracking-wide shadow-lg shadow-primary/20 animate-pulse-glow"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <TbLoader2 className="animate-spin text-xl" />
                {t("control.simulating")}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <TbPlayerPlay className="text-xl" /> {t("control.run")}
              </span>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Locked Fixed Patient Parameters Note */}
      <div className="p-3 bg-blue-50/50 dark:bg-slate-800/50 border border-blue-200/50 dark:border-slate-700 rounded-xl text-[11px] text-slate-500 font-medium flex items-center gap-2">
        <TbLock className="text-blue-600 flex-shrink-0 text-sm" />
        <span>Registered patient demographics are locked. Only <strong>Sleep</strong> & <strong>Activity</strong> sliders adjust live simulation.</span>
      </div>

      <div className="space-y-2 opacity-60">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
          <div className="flex items-center gap-2">
            <span className="text-primary"><TbCalendarStats /></span>
            <span>Gender & {t("profile.age")}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><TbLock /> Locked</span>
        </div>
        <div className="flex gap-2 mb-2">
          {["male", "female"].map((s) => (
            <button
              key={s}
              disabled
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold capitalize border opacity-80 cursor-not-allowed ${
                data.sex === s 
                  ? "bg-primary/20 border-primary text-primary" 
                  : "bg-secondary/40 border-border text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <ControlHeader icon={<div />} label={t("profile.age")} value={`${data.age}`} />
        <Slider
          value={[data.age]}
          min={18}
          max={90}
          step={1}
          disabled
          className="cursor-not-allowed"
        />
      </div>

      <div className="space-y-2 opacity-60">
        <div className="flex items-center justify-between">
          <ControlHeader icon={<TbScale />} label={t("profile.bmi")} value={`${data.bmi}`} />
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><TbLock /> Locked</span>
        </div>
        <Slider
          value={[data.bmi]}
          min={15}
          max={45}
          step={1}
          disabled
          className="cursor-not-allowed"
        />
      </div>

      {/* EDITABLE SIMULATION PARAMETER 1: SLEEP */}
      <div className="space-y-2 p-3 bg-blue-50/40 dark:bg-slate-800/40 border border-blue-200/60 dark:border-blue-900/50 rounded-2xl">
        <div className="flex items-center justify-between">
          <ControlHeader icon={<TbMoon className="text-blue-600" />} label={t("profile.sleep" as any, "Sleep (Editable)")} value={`${data.sleep.toFixed(1)}h`} />
          <span className="text-[10px] font-extrabold text-blue-600 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full uppercase">Live Slider</span>
        </div>
        <Slider
          value={[data.sleep]}
          min={3}
          max={10}
          step={0.5}
          onValueChange={(v) => set("sleep", v[0])}
        />
      </div>

      {/* EDITABLE SIMULATION PARAMETER 2: ACTIVITY */}
      <div className="space-y-2 p-3 bg-blue-50/40 dark:bg-slate-800/40 border border-blue-200/60 dark:border-blue-900/50 rounded-2xl">
        <div className="flex items-center justify-between">
          <ControlHeader icon={<TbActivity className="text-blue-600" />} label={t("profile.activity" as any, "Activity (Editable)")} value={`${data.activity}/5`} />
          <span className="text-[10px] font-extrabold text-blue-600 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full uppercase">Live Slider</span>
        </div>
        <Slider
          value={[data.activity]}
          min={0}
          max={5}
          step={1}
          onValueChange={(v) => set("activity", v[0])}
        />
      </div>

      <div className="space-y-2 opacity-60">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-primary"><TbSalad /></span>
            <span>{t("profile.diet" as any, "Diet")}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><TbLock /> Locked</span>
        </div>
        <Select value={data.diet} disabled>
          <SelectTrigger className="bg-secondary/60 border-border cursor-not-allowed">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="balanced">{t("profile.diet.balanced" as any, "Balanced")}</SelectItem>
            <SelectItem value="average">{t("profile.diet.average" as any, "Average")}</SelectItem>
            <SelectItem value="poor">{t("profile.diet.poor" as any, "Poor")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between text-sm opacity-60">
        <div className="flex items-center gap-2 text-muted-foreground">
          <TbSmoking className="text-primary" />
          {t("profile.smoking")}
        </div>
        <Switch checked={data.smoking} disabled />
      </div>

      <div className="flex items-center justify-between text-sm opacity-60">
        <div className="flex items-center gap-2 text-muted-foreground">
          <TbGlassFull className="text-primary" />
          {t("profile.alcohol")}
        </div>
        <Switch checked={data.alcohol} disabled />
      </div>

      <div className="pt-4 border-t border-border/40 mt-auto">
        <button 
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full h-12 rounded-xl bg-secondary hover:bg-secondary/80 border border-border flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95"
        >
          {saving ? <TbLoader2 className="animate-spin text-lg" /> : <TbDeviceFloppy className="text-lg text-primary" />}
          {t("profile.save" as any, "Save Profile")}
        </button>
      </div>
    </aside>
  );
}
