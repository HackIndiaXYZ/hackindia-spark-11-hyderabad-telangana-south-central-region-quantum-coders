import { useStore } from "@/store/useStore";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const ORGAN_COLORS: Record<string, string> = {
  brain: "#00FFA3",
  heart: "#EF4444",
  liver: "#F97316",
  kidneys: "#A855F7",
  lungs: "#0EA5E9",
};

interface Props {
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
  height?: number | string;
  organs?: Array<keyof typeof ORGAN_COLORS>;
}

export default function ChartPanel({
  title = "Risks Over Time",
  subtitle = "Simulation Snapshot",
  showLegend = true,
  organs,
}: Props) {
  const report = useStore((s) => s.report);
  const insights = report?.organ_insights;

  // Create a single-point snapshot if we don't have historical trends yet
  const snapshotData = insights ? [{
    month: "Current",
    heart: insights.heart.numerical_score,
    lungs: insights.lungs.numerical_score,
    liver: insights.liver.numerical_score,
    kidneys: insights.kidneys.numerical_score,
    brain: insights.brain.numerical_score,
  }] : [];

  const keys = organs ?? (Object.keys(ORGAN_COLORS) as Array<keyof typeof ORGAN_COLORS>);

  return (
    <div className="flex flex-col h-full min-h-0 p-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">{subtitle}</span>
      </div>
      {showLegend && (
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          {keys.map((k) => (
            <span key={k} className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: ORGAN_COLORS[k], boxShadow: `0 0 8px ${ORGAN_COLORS[k]}` }}
              />
              {k}
            </span>
          ))}
        </div>
      )}
      <div className="flex-1 min-h-0 pl-1 pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={snapshotData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            />
            {keys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={ORGAN_COLORS[key]}
                strokeWidth={2}
                dot={{ r: 2.5, strokeWidth: 0, fill: ORGAN_COLORS[key] }}
                activeDot={{ r: 5 }}
                isAnimationActive
                animationDuration={900}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
