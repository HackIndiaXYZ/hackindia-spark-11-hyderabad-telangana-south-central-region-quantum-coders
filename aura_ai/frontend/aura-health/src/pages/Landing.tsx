import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  TbActivityHeartbeat, 
  TbBrain, 
  TbShieldCheck, 
  TbWorld, 
  TbArrowRight,
  TbArrowUpRight
} from "react-icons/tb";
import { useTranslation } from "react-i18next";

export default function Landing() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card !rounded-none border-b border-white/5 px-6 py-4 flex items-center justify-between backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/15 ring-1 ring-primary/40 flex items-center justify-center text-primary text-xl shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
            <TbActivityHeartbeat />
          </div>
          <span className="text-lg font-bold tracking-tight">
            digitaltwin <span className="neon-text">health</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t("landing.features")}</a>
          <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t("landing.tech")}</a>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/40 ring-1 ring-white/5">
            <TbWorld className="text-primary text-sm" />
            <select 
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="bg-transparent text-xs font-bold uppercase focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold hover:text-primary transition-colors">
            {t("nav.login")}
          </Link>
          <Link to="/register" className="h-10 px-5 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            {t("nav.register")} <TbArrowRight />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-44 pb-32 px-6 flex flex-col items-center text-center">
        {/* Abstract Background Decoration */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 ring-1 ring-primary/40 text-primary text-xs font-black uppercase tracking-widest mb-8"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          {t("landing.hero_badge")}
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tight max-w-4xl leading-[1.1] mb-8"
        >
          Your <span className="neon-text">Digital Twin</span> Health AI.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl leading-relaxed mb-12"
        >
          {t("landing.hero_desc")}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link to="/register" className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black text-base flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30">
            {t("landing.hero_cta_primary")} <TbArrowRight className="text-xl" />
          </Link>
          <Link to="/login" className="h-14 px-8 rounded-2xl bg-secondary/60 ring-1 ring-white/10 text-foreground font-bold text-base flex items-center gap-3 hover:bg-secondary transition-all">
            {t("landing.hero_cta_secondary")}
          </Link>
        </motion.div>

        {/* Floating Metrics Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-24 relative max-w-5xl w-full"
        >
          <div className="glass-card rounded-3xl p-1 overflow-hidden shadow-2xl shadow-primary/10 border border-white/5">
            <div className="bg-secondary/40 rounded-[22px] aspect-[16/9] flex items-center justify-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-organ-lungs/10" />
               <TbBrain className="text-9xl text-primary/20 drop-shadow-[0_0_50px_rgba(var(--primary-rgb),0.5)] group-hover:scale-110 transition-transform duration-700" />
               
               {/* Decorative Dashboard Elements */}
               <div className="absolute top-10 left-10 h-32 w-48 glass-card border-white/10 flex flex-col p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-2 w-12 bg-primary/40 rounded-full" />
                    <div className="h-2 w-2 bg-primary rounded-full animate-ping" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-1.5 w-full bg-white/5 rounded-full" />
                    <div className="h-1.5 w-3/4 bg-white/5 rounded-full" />
                    <div className="h-1.5 w-1/2 bg-primary/20 rounded-full" />
                  </div>
               </div>

               <div className="absolute bottom-10 right-10 h-40 w-56 glass-card border-white/10 flex flex-col p-4">
                  <div className="h-3 w-20 bg-muted-foreground/20 rounded-full mb-6" />
                  <div className="flex items-end gap-1 flex-1">
                    {[40, 70, 45, 90, 65, 80].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/30 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">{t("landing.science_title")}</h2>
          <p className="text-muted-foreground text-lg">{t("landing.science_desc")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <TbActivityHeartbeat />,
              title: t("landing.feat1_title"),
              desc: t("landing.feat1_desc"),
              color: "text-primary"
            },
            {
              icon: <TbBrain />,
              title: t("landing.feat2_title"),
              desc: t("landing.feat2_desc"),
              color: "text-organ-lungs"
            },
            {
              icon: <TbShieldCheck />,
              title: t("landing.feat3_title"),
              desc: t("landing.feat3_desc"),
              color: "text-risk-healthy"
            }
          ].map((f, i) => (
            <div key={i} className="glass-card rounded-3xl p-8 hover:bg-white/[0.02] transition-colors border border-white/5 group">
              <div className={`text-4xl ${f.color} mb-6 drop-shadow-md`}>{f.icon}</div>
              <h3 className="text-xl font-bold mb-4">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Persistence CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto glass-card rounded-[40px] p-12 md:p-20 relative overflow-hidden text-center border border-white/5">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-organ-lungs/10 blur-[100px] -z-10" />
           
           <h2 className="text-3xl md:text-6xl font-black mb-8 leading-tight">{t("landing.cta_title")}</h2>
           <Link to="/register" className="h-16 px-10 rounded-2xl bg-primary text-primary-foreground font-black text-lg inline-flex items-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-primary/40">
              {t("landing.cta_button")} <TbArrowUpRight className="text-2xl" />
           </Link>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-muted-foreground text-sm">
        <p>{t("landing.footer")}</p>
      </footer>
    </div>
  );
}
