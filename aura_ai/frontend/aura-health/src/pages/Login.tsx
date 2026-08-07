import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  TbActivityHeartbeat, 
  TbMail, 
  TbLock, 
  TbArrowRight,
  TbLoader2,
  TbWorld,
  TbBrandGoogle
} from "react-icons/tb";
import { useStore } from "@/store/useStore";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "sonner";
import { API_BASE } from "@/services/api";
import { loginWithGoogle } from "@/services/firebaseAuth";

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Google Authentication Handler
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const googleResult = await loginWithGoogle();
      
      // Query backend to verify if Google user already exists in DB
      const resp = await axios.post(`${API_BASE}/v1/auth/google`, {
        email: googleResult.email,
        full_name: googleResult.displayName || "Google User",
        uid: googleResult.uid,
        photo_url: googleResult.photoURL || ""
      });

      if (resp.data.is_existing) {
        // EXISTING USER -> DIRECT DASHBOARD REDIRECT!
        const { access_token, user } = resp.data;
        localStorage.setItem("twin_token", access_token);
        useStore.getState().setUser(user);
        useStore.getState().setLifestyleBatch(user.lifestyle_data);
        toast.success(`Welcome back ${user.full_name}!`);
        navigate("/dashboard");
      } else {
        // NEW USER -> Quick 30-Second Setup with pre-filled Google Profile
        toast.info("Google Verified! Completing quick intake...");
        navigate("/register", {
          state: {
            googleProfile: resp.data.google_profile
          }
        });
      }
    } catch (err: any) {
      console.error("Firebase Google Auth Error:", err);
      toast.error(err.response?.data?.detail || err.message || "Google Authentication failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("username", form.email);
      params.append("password", form.password);

      const resp = await axios.post(`${API_BASE}/v1/auth/login`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      
      const { access_token } = resp.data;
      localStorage.setItem("twin_token", access_token);
      
      const userResp = await axios.get(`${API_BASE}/v1/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      useStore.getState().setUser(userResp.data);
      useStore.getState().setLifestyleBatch(userResp.data.lifestyle_data);
      
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="absolute top-8 left-8 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-primary/15 ring-1 ring-primary/40 flex items-center justify-center text-primary text-2xl shadow-[0_0_20px_hsl(var(--primary)/0.4)] group-hover:scale-110 transition-transform">
            <TbActivityHeartbeat />
          </div>
          <span className="text-xl font-bold tracking-tight">digitaltwin <span className="neon-text">health</span></span>
        </Link>
        
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/40 ring-1 ring-white/5">
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

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-[32px] p-8 md:p-10 border border-white/5 shadow-2xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Log in to consult your digital twin.</p>
          </div>

          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full h-13 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {googleLoading ? (
              <TbLoader2 className="animate-spin text-lg" />
            ) : (
              <>
                <TbBrandGoogle className="text-xl text-rose-500" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-background px-3 text-[10px] uppercase font-black tracking-widest text-muted-foreground absolute">
              OR
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
              <div className="relative group">
                <TbMail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="john@example.com"
                  className="w-full h-14 bg-secondary/30 ring-1 ring-white/5 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:ring-primary/40 transition-all hover:bg-secondary/40"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</label>
                <a href="#" className="text-[10px] font-bold text-primary hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <TbLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full h-14 bg-secondary/30 ring-1 ring-white/5 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:ring-primary/40 transition-all hover:bg-secondary/40"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full h-14 bg-primary text-primary-foreground font-black text-base rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? <TbLoader2 className="animate-spin text-xl" /> : <>Sign In <TbArrowRight className="text-xl" /></>}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-muted-foreground font-medium">
            New to digitaltwin health? <Link to="/register" className="text-primary hover:underline ml-1">Create Account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
