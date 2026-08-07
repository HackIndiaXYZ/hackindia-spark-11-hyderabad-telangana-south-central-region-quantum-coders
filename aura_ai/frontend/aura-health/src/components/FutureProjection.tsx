import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TbTrendingUp, TbAlertCircle, TbLoader2 } from "react-icons/tb";
import { useStore } from "@/store/useStore";

export default function FutureProjection() {
  const {
    report,
    clinicalAssessmentState,
    projectionData,
    fetchingProjection,
    projectionError,
    fetchHealthProjection
  } = useStore();

  const insights = clinicalAssessmentState?.organ_insights || report?.organ_insights;

  // Auto-fetch when organ insights exist and we have no projection yet.
  useEffect(() => {
    if (insights && !projectionData && !fetchingProjection) {
      fetchHealthProjection();
    }
  }, [insights, projectionData, fetchingProjection, fetchHealthProjection]);

  // Map backend JSON vectors to Recharts friendly format
  const chartData = useMemo(() => {
    if (!projectionData) return [];
    
    const intervals = ["Now", "6 Months", "1 Year", "2 Years"];
    const p = projectionData.projection;
    
    return intervals.map((timeLabel, index) => ({
      time: timeLabel,
      Heart: p.heart?.[index] || null,
      Lungs: p.lungs?.[index] || null,
      Liver: p.liver?.[index] || null,
      Kidneys: p.kidneys?.[index] || null,
      Brain: p.brain?.[index] || null
    }));
  }, [projectionData]);

  const colors = {
    Heart: "#ec4899", // pink
    Lungs: "#3b82f6", // blue
    Liver: "#eab308", // yellow
    Kidneys: "#8b5cf6", // purple
    Brain: "#f97316" // orange
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/50 bg-card/60 backdrop-blur-xl relative overflow-hidden shadow-2xl mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="mb-6 z-10 relative">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-xl mb-4 border border-primary/20">
            <TbTrendingUp className="text-xl" />
          </div>
          <h2 className="text-2xl font-black mb-2">Future Health Projection</h2>
          <p className="text-muted-foreground w-full md:w-2/3 leading-relaxed">
            Based on your current lifestyle metrics (BMI, sleep, diet, smoking, and alcohol limits), this analytical engine estimates how your organ risks might evolve over the next two years.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {fetchingProjection ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-muted-foreground"
            >
              <TbLoader2 className="animate-spin text-5xl mb-4 text-primary" />
              <p className="font-medium text-lg">AI is running time-series projection algorithms...</p>
            </motion.div>
          ) : projectionError ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-risk-high/10 border border-risk-high/20 rounded-xl text-risk-high flex flex-col items-center text-center gap-3"
            >
              <TbAlertCircle className="text-4xl mb-1" />
              <p className="font-bold text-lg">Unable to generate projection</p>
              <p className="text-sm opacity-80">{projectionError}</p>
              {report?.organ_insights ? (
                <button
                  type="button"
                  onClick={() => fetchHealthProjection()}
                  className="mt-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
                >
                  Retry
                </button>
              ) : null}
            </motion.div>
          ) : projectionData ? (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col"
            >
              <div className="glass-card mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5 text-primary text-sm font-semibold flex items-center justify-center text-center leading-relaxed">
                <TbTrendingUp className="text-xl mr-2 shrink-0" />
                {projectionData.note}
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickMargin={10} 
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.75rem',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                        fontWeight: '600'
                      }} 
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: "20px" }}
                      iconType="circle"
                    />
                    <Line type="monotone" dataKey="Heart" stroke={colors.Heart} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Lungs" stroke={colors.Lungs} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Liver" stroke={colors.Liver} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Kidneys" stroke={colors.Kidneys} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Brain" stroke={colors.Brain} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 pt-6 border-t border-border/50 mx-auto max-w-2xl text-center">
                 <div className="inline-flex items-start gap-3 bg-card p-4 rounded-xl shadow-inner ring-1 ring-border text-left">
                   <TbAlertCircle className="text-muted-foreground text-3xl shrink-0 mt-0.5" />
                   <p className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wider leading-relaxed">
                     This projection is an estimate and not a medical diagnosis. It relies on generalized health impact trends associated with sustained lifestyle choices over long periods of time.
                   </p>
                 </div>
              </div>

            </motion.div>
          ) : !report?.organ_insights ? (
            <div className="w-full flex flex-col items-center justify-center py-12 px-4 text-center text-muted-foreground gap-3">
              <p className="text-sm font-medium max-w-md">
                Run a health simulation from the <span className="text-foreground font-semibold">Insights</span> tab first. Organ risk scores are required to build this chart.
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-10 gap-3">
               <button 
                type="button"
                onClick={() => fetchHealthProjection()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
               >
                 Calculate Future Projection
               </button>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
