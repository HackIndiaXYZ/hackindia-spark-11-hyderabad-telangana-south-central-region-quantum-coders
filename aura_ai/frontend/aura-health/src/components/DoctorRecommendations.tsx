import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { TbStethoscope, TbMapPin, TbStar, TbExternalLink, TbLoader2, TbAlertCircle, TbPhone, TbActivity } from "react-icons/tb";
import { useStore } from "@/store/useStore";

const CITIES = ["Hyderabad", "Mumbai", "Chennai", "Bangalore", "Delhi"];

export default function DoctorRecommendations() {
  const { t } = useTranslation();
  const { 
    recommendedDoctors, 
    fetchingDoctors, 
    doctorError, 
    userCity, 
    setCity, 
    fetchDoctors,
    report,
    reportAnalysisData
  } = useStore();

  const getActiveContext = () => {
    let specialist = "general physician";
    let risk = "moderate";

    const assessmentState = useStore.getState().clinicalAssessmentState;
    const organInsights = assessmentState?.organ_insights || report?.organ_insights;

    if (organInsights) {
      let highestOrgan = "heart";
      let maxRisk = 0;
      Object.entries(organInsights).forEach(([organ, data]) => {
        const score = (data as any)?.numerical_score || 0;
        if (score > maxRisk) {
          maxRisk = score;
          highestOrgan = organ;
        }
      });
      const specialistMap: Record<string, string> = {
        "heart": "cardiologist", "lungs": "pulmonologist", "liver": "gastroenterologist", "kidneys": "nephrologist", "brain": "neurologist"
      };
      specialist = specialistMap[highestOrgan] || "general physician";
      risk = (report?.risk_level as string) || "moderate";
      return { specialist, risk };
    } else if (reportAnalysisData && reportAnalysisData.primary_specialist_needed) {
      specialist = reportAnalysisData.primary_specialist_needed;
      risk = reportAnalysisData.risk_level || "moderate";
      return { specialist, risk };
    }
    // Always fallback to general physician so real-time recommendations display immediately
    return { specialist: "general physician", risk: "moderate" };
  };

  useEffect(() => {
    const context = getActiveContext();
    if (context && !fetchingDoctors) {
      fetchDoctors(context.specialist, userCity, context.risk);
    }
  }, [userCity, report, reportAnalysisData]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    setCity(newCity);
    const context = getActiveContext();
    if (context) {
      fetchDoctors(context.specialist, newCity, context.risk);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-8">
      <div className="glass-card rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="flex flex-col items-center max-w-2xl mx-auto text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl mb-4">
            <TbStethoscope />
          </div>
          <h2 className="text-2xl font-black mb-2">Real-Time Care Recommendations</h2>
          <p className="text-muted-foreground mb-6">
            Based on your most recent digital twin simulation, we've identified localized specialists to help you proactively manage your highest risk areas.
          </p>
          
          <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-xl ring-1 ring-border/50">
            <span className="text-sm font-bold pl-3">Location:</span>
            <select 
              value={userCity} 
              onChange={handleCityChange}
              className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {fetchingDoctors ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-muted-foreground"
            >
              <TbLoader2 className="animate-spin text-4xl mb-4 text-primary" />
              <p className="font-medium">Finding the best specialists in {userCity}...</p>
            </motion.div>
          ) : doctorError ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-risk-high/10 border border-risk-high/20 rounded-xl text-risk-high flex flex-col items-center text-center gap-2"
            >
              <TbAlertCircle className="text-3xl mb-1" />
              <p className="font-bold">Nearby hospitals available on Maps</p>
              <p className="text-sm opacity-80">{doctorError}</p>
            </motion.div>
          ) : recommendedDoctors.length > 0 ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {recommendedDoctors.map((doc, idx) => {
                const isTier1 = doc.tier === "Tier 1";
                return (
                  <div key={idx} className={`glass-card rounded-xl p-5 border transition-all flex flex-col justify-between h-full ${
                    isTier1 ? "border-primary/40 bg-primary/5 shadow-md shadow-primary/5" : "border-border/50 bg-secondary/10"
                  }`}>
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                          isTier1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                           <TbActivity/> {doc.tier}
                        </div>
                        {doc.rating > 0 && (
                          <div className="flex items-center gap-1 text-yellow-500 text-xs font-black shrink-0">
                            <TbStar className="fill-yellow-500" /> {doc.rating} <span className="text-muted-foreground font-medium text-[10px]">({doc.userRatingCount})</span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-foreground text-lg leading-tight mb-1">{doc.hospital_name}</h3>
                      <p className="text-sm font-semibold text-primary/80 mb-4">{doc.doctor_type}</p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <TbMapPin className="text-primary mt-0.5 shrink-0" />
                          <span className="leading-relaxed text-xs">{doc.address}</span>
                        </div>
                        {doc.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TbPhone className="text-primary shrink-0" />
                            <span className="leading-relaxed font-mono text-xs">{doc.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <a 
                      href={doc.maps_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`w-full h-10 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                        isTier1 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary ring-1 ring-border hover:ring-primary/40 text-primary"
                      }`}
                    >
                      View on Maps <TbExternalLink />
                    </a>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 border-2 border-dashed border-border/60 rounded-xl bg-secondary/10"
            >
              <p className="text-muted-foreground font-medium">Run a simulation or analyze a report to view personalized care recommendations.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
