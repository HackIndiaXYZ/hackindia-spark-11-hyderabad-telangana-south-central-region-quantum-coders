import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";
import { toast } from "sonner";
import { API_BASE } from "@/services/api";
import { useStore, getEmergencyQRPayload } from "@/store/useStore";
import { loginWithGoogle } from "@/services/firebaseAuth";
import {
  TbActivityHeartbeat,
  TbUser,
  TbMail,
  TbLock,
  TbPhone,
  TbId,
  TbMapPin,
  TbHome,
  TbUserHeart,
  TbPhoneCall,
  TbStethoscope,
  TbSparkles,
  TbArrowRight,
  TbArrowLeft,
  TbCheck,
  TbLoader2,
  TbDownload,
  TbPrinter,
  TbShieldCheck,
  TbChevronRight,
  TbCurrentLocation,
  TbBrandGoogle
} from "react-icons/tb";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const initializeAuth = useStore((s) => s.initializeAuth);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<{ userId: string; patientId: string } | null>(null);

  // Form State
  const [form, setForm] = useState({
    // Step 1: Identity & Access
    fullName: "",
    email: "",
    password: "",
    phone: "",
    aadhaar: "",
    firebaseUid: "",

    // Step 2: Patient Address
    currentAddress: "",
    permanentAddress: "",
    emergencyName: "",
    emergencyPhone: "",

    // Step 3: Medical Profile
    age: 32,
    gender: "male",
    height: 175, // cm
    weight: 72, // kg
    bloodGroup: "O+",
    primaryDisease: "",
    sectors: {
      cardio: false,
      brain: false,
      gastro: false,
      bp: false,
      sugar: false,
      thyroid: false
    },

    // Step 4: Lifestyle & Clinical History
    minorSurgeries: "",
    majorSurgeries: "",
    sleep: 7,
    activity: 3,
    smoking: false,
    alcohol: false,
    diet: "average",
    familyDetails: "",
    pastPrescriptions: ""
  });

  // Pre-fill Google Profile info if redirected from Google Auth
  useEffect(() => {
    if (location.state?.googleProfile) {
      const g = location.state.googleProfile;
      setForm((prev) => ({
        ...prev,
        fullName: g.fullName || prev.fullName,
        email: g.email || prev.email,
        firebaseUid: g.uid || prev.firebaseUid
      }));
      toast.info(`Pre-filled Step 1 credentials for ${g.displayName || g.email}`);
    }
  }, [location.state]);

  // Google Sign-In Handler inside Registration Wizard
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const gRes = await loginWithGoogle();
      setForm((prev) => ({
        ...prev,
        fullName: gRes.displayName || prev.fullName,
        email: gRes.email || prev.email,
        firebaseUid: gRes.uid || prev.firebaseUid
      }));
      toast.success(`Google Auth Verified! Pre-filled credentials for ${gRes.displayName || gRes.email}`);
    } catch (err: any) {
      console.error("Firebase Google Auth Error:", err);
      toast.error(err.message || "Google Authentication failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Live GPS Location Handler
  const handleFetchLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    toast.info("Acquiring Live GPS Location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const liveAddress = `Live GPS: Lat ${latitude.toFixed(4)}, Long ${longitude.toFixed(4)} (Verified Location)`;
        setForm((prev) => ({
          ...prev,
          currentAddress: liveAddress,
          permanentAddress: prev.permanentAddress || liveAddress
        }));
        toast.success("Live GPS Location Acquired!");
        setLocating(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        toast.error("Could not fetch GPS location. Please enter address manually.");
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Dynamic Live BMI Calculation
  const calculateBMI = (): number => {
    if (!form.height || !form.weight) return 23.5;
    const heightInMeters = form.height / 100;
    if (heightInMeters <= 0) return 23.5;
    const bmi = form.weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10;
  };

  const bmiValue = calculateBMI();

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200" };
    if (bmi < 25.0) return { label: "Normal Weight", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200" };
    if (bmi < 30.0) return { label: "Overweight", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200" };
    return { label: "Obese", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200" };
  };

  const bmiCat = getBMICategory(bmiValue);

  // Validation Logic per Step
  const validateStep1 = () => {
    if (!form.fullName.trim()) {
      toast.error("Please enter your Full Legal Name");
      return false;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      toast.error("Please enter a valid Email Address");
      return false;
    }
    if (!form.password || form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (!form.phone.trim() || form.phone.length < 8) {
      toast.error("Please enter a valid Phone Number");
      return false;
    }
    if (form.aadhaar.trim() && !/^\d{12}$/.test(form.aadhaar.trim())) {
      toast.error("Aadhaar Number must be exactly 12 numeric digits if provided");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.currentAddress.trim()) {
      toast.error("Please enter Current Address");
      return false;
    }
    if (!form.permanentAddress.trim()) {
      toast.error("Please enter Permanent Address");
      return false;
    }
    if (!form.emergencyName.trim()) {
      toast.error("Please enter Emergency Contact Name");
      return false;
    }
    if (!form.emergencyPhone.trim() || form.emergencyPhone.length < 8) {
      toast.error("Please enter valid Emergency Contact Phone");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (form.age < 1 || form.age > 120) {
      toast.error("Please enter a valid age (1-120)");
      return false;
    }
    if (form.height < 50 || form.height > 250) {
      toast.error("Please enter valid height in cm (50-250)");
      return false;
    }
    if (form.weight < 10 || form.weight > 300) {
      toast.error("Please enter valid weight in kg (10-300)");
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!form.diet) {
      toast.error("Please select your Diet Type");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step === 4 && !validateStep4()) return;
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit & Auto-Login Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep3() || !validateStep4()) {
      toast.error("Please complete all steps of the patient registration form");
      return;
    }

    setLoading(true);

    const payload = {
      email: form.email.trim(),
      password: form.password,
      full_name: form.fullName.trim(),
      firebase_uid: form.firebaseUid || undefined,
      lifestyle_data: {
        age: Number(form.age) || 32,
        sex: form.gender || "male",
        bmi: bmiValue,
        sleep: Number(form.sleep) || 7,
        activity: Number(form.activity) || 3,
        smoking: Boolean(form.smoking),
        alcohol: Boolean(form.alcohol),
        diet: form.diet || "average"
      }
    };

    try {
      // 1. Register User
      const res = await axios.post(`${API_BASE}/v1/auth/register`, payload);
      const returnedUserId = res.data.user_id || `ID-${Math.random().toString(36).substr(2, 9)}`;
      const patientId = `AURA-${returnedUserId}`;

      // Save complete patient profile locally and into Zustand store
      const fullPatientProfile = {
        id: returnedUserId,
        patient_id: patientId,
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        aadhaar: form.aadhaar.trim(),
        current_address: form.currentAddress.trim(),
        permanent_address: form.permanentAddress.trim(),
        emergency_name: form.emergencyName.trim(),
        emergency_phone: form.emergencyPhone.trim(),
        age: Number(form.age),
        gender: form.gender,
        height: Number(form.height),
        weight: Number(form.weight),
        blood_group: form.bloodGroup,
        primary_disease: form.primaryDisease.trim() || (Object.entries(form.sectors).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(", ") || "None Reported"),
        sectors: form.sectors,
        surgeries: [form.minorSurgeries, form.majorSurgeries].filter(Boolean).join("; ") || "No major surgeries reported",
        minor_surgeries: form.minorSurgeries.trim(),
        major_surgeries: form.majorSurgeries.trim(),
        family_details: form.familyDetails.trim() || "No significant family history reported",
        past_prescriptions: form.pastPrescriptions.trim() || "No past prescriptions reported",
        allergies: form.pastPrescriptions.trim() ? `Past Rx: ${form.pastPrescriptions.trim()}` : "No drug allergies reported",
        lifestyle_data: {
          age: Number(form.age) || 32,
          sex: form.gender === "female" ? "female" : "male",
          bmi: bmiValue,
          sleep: Number(form.sleep) || 7,
          activity: Number(form.activity) || 3,
          smoking: Boolean(form.smoking),
          alcohol: Boolean(form.alcohol),
          diet: form.diet || "average"
        }
      };

      localStorage.setItem("twin_user_profile", JSON.stringify(fullPatientProfile));
      useStore.getState().setUser(fullPatientProfile);
      useStore.getState().setLifestyleBatch({
        age: Number(form.age) || 32,
        sex: form.gender === "female" ? "female" : "male",
        bmi: bmiValue,
        sleep: Number(form.sleep) || 7,
        activity: Number(form.activity) || 3,
        smoking: Boolean(form.smoking),
        alcohol: Boolean(form.alcohol),
        diet: form.diet as any
      });

      // 2. Auto-Login Immediately
      try {
        const loginParams = new URLSearchParams();
        loginParams.append("username", form.email.trim());
        loginParams.append("password", form.password);

        const loginRes = await axios.post(`${API_BASE}/v1/auth/login`, loginParams, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        if (loginRes.data.access_token) {
          localStorage.setItem("twin_token", loginRes.data.access_token);
          await initializeAuth();
        }
      } catch (loginErr) {
        console.warn("Auto-login fallback error:", loginErr);
      }

      setRegisteredUser({
        userId: returnedUserId,
        patientId: patientId
      });

      toast.success("Registration Successful! Patient ID & QR Code Generated.");
    } catch (err: any) {
      console.error("Registration Error:", err);
      toast.error(err.response?.data?.detail || "Registration failed. Please check server.");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToDashboard = () => {
    navigate("/dashboard");
  };

  // Download QR Code Action
  const handleDownloadQR = () => {
    const svgElement = document.getElementById("patient-qr-code");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngFile;
        downloadLink.download = `${registeredUser?.patientId || "AURA-PATIENT"}-QR.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Print Patient Card Action
  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 md:p-8 font-sans antialiased">
      {/* Top Header Branding */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <TbActivityHeartbeat />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              AURA <span className="text-blue-600 font-extrabold">HEALTH</span>
            </span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Clinical Platform</p>
          </div>
        </Link>

        <Link
          to="/login"
          className="text-xs font-bold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          Already registered? <span className="text-blue-600 font-extrabold underline ml-1">Log In</span>
        </Link>
      </header>

      {/* Main Centered Intake Card */}
      <main className="max-w-4xl mx-auto w-full my-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8"
        >
          {!registeredUser ? (
            <>
              {/* Card Header & Step Progress Bar */}
              <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      Patient Registration
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
                      Clinical Digital Twin Intake Form
                    </h1>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
                      Step {step} of 4
                    </span>
                    <p className="text-xs text-slate-400 font-medium">
                      {step === 1 && "Identity & Access"}
                      {step === 2 && "Patient Address & Live GPS"}
                      {step === 3 && "Medical Profile"}
                      {step === 4 && "Lifestyle & History"}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                    initial={{ width: "25%" }}
                    animate={{ width: `${(step / 4) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Form Steps Container */}
              <form onSubmit={handleSubmit} className="space-y-8">
                <AnimatePresence mode="wait">
                  {/* STEP 1: IDENTITY & ACCESS */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <TbUser className="text-blue-600 text-lg" />
                          <span>Step 1: Identity & Access Credentials</span>
                        </h3>

                        {/* Continue with Google button in Step 1 */}
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={googleLoading}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
                        >
                          {googleLoading ? (
                            <TbLoader2 className="animate-spin text-sm" />
                          ) : (
                            <>
                              <TbBrandGoogle className="text-base text-rose-500" />
                              <span>Continue with Google</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Full Legal Name <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <TbUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                            <input
                              type="text"
                              required
                              placeholder="John Doe"
                              value={form.fullName}
                              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                              className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Email Address <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <TbMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                            <input
                              type="email"
                              required
                              placeholder="john@example.com"
                              value={form.email}
                              onChange={(e) => setForm({ ...form, email: e.target.value })}
                              className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Password (Min 6 Chars) <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <TbLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                            <input
                              type="password"
                              required
                              placeholder="••••••••"
                              value={form.password}
                              onChange={(e) => setForm({ ...form, password: e.target.value })}
                              className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Phone Number <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <TbPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                            <input
                              type="tel"
                              required
                              placeholder="+1 (555) 000-0000"
                              value={form.phone}
                              onChange={(e) => setForm({ ...form, phone: e.target.value })}
                              className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Aadhaar Number (12 Digits) <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <TbId className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                            <input
                              type="text"
                              maxLength={12}
                              required
                              placeholder="123456789012"
                              value={form.aadhaar}
                              onChange={(e) => setForm({ ...form, aadhaar: e.target.value.replace(/\D/g, "") })}
                              className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: PATIENT ADDRESS & LIVE GPS */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <TbMapPin className="text-blue-600 text-lg" />
                          <span>Step 2: Patient Address & Live GPS</span>
                        </h3>

                        {/* Live GPS Location Action Button */}
                        <button
                          type="button"
                          onClick={handleFetchLiveLocation}
                          disabled={locating}
                          className="px-4 py-2 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-2 self-start sm:self-auto"
                        >
                          {locating ? <TbLoader2 className="animate-spin text-sm" /> : <TbCurrentLocation className="text-base text-blue-600" />}
                          <span>Use Live GPS Location</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Current Address */}
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Current Address <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <TbMapPin className="absolute left-4 top-4 text-slate-400 text-lg" />
                            <textarea
                              rows={2}
                              required
                              placeholder="Street, City, State, ZIP or click 'Use Live GPS Location'"
                              value={form.currentAddress}
                              onChange={(e) => setForm({ ...form, currentAddress: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 pt-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                            />
                          </div>
                        </div>

                        {/* Permanent Address */}
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Permanent Address <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <TbHome className="absolute left-4 top-4 text-slate-400 text-lg" />
                            <textarea
                              rows={2}
                              required
                              placeholder="Permanent Residential Address"
                              value={form.permanentAddress}
                              onChange={(e) => setForm({ ...form, permanentAddress: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 pt-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                            />
                          </div>
                        </div>

                        {/* Emergency Contact Name */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Emergency Contact Name <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <TbUserHeart className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                            <input
                              type="text"
                              required
                              placeholder="Jane Doe (Spouse/Parent)"
                              value={form.emergencyName}
                              onChange={(e) => setForm({ ...form, emergencyName: e.target.value })}
                              className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                            />
                          </div>
                        </div>

                        {/* Emergency Contact Phone */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Emergency Contact Phone <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <TbPhoneCall className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                            <input
                              type="tel"
                              required
                              placeholder="+1 (555) 999-0000"
                              value={form.emergencyPhone}
                              onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                              className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: MEDICAL PROFILE & LIVE BMI */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <TbStethoscope className="text-blue-600 text-lg" />
                        <span>Step 3: Medical Profile & Physiological Parameters</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Age</label>
                          <input
                            type="number"
                            min={1}
                            max={120}
                            value={form.age}
                            onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || 32 })}
                            className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Biological Sex</label>
                          <select
                            value={form.gender}
                            onChange={(e) => setForm({ ...form, gender: e.target.value })}
                            className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Blood Group</label>
                          <select
                            value={form.bloodGroup}
                            onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                            className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
                          >
                            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Height (cm)</label>
                          <input
                            type="number"
                            min={50}
                            max={250}
                            value={form.height}
                            onChange={(e) => setForm({ ...form, height: parseFloat(e.target.value) || 175 })}
                            className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Weight (kg)</label>
                          <input
                            type="number"
                            min={10}
                            max={300}
                            value={form.weight}
                            onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) || 72 })}
                            className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          />
                        </div>

                        {/* Live Dynamic BMI Calculation Display */}
                        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-slate-800/60 border border-blue-200/60 dark:border-slate-700 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-extrabold uppercase text-slate-500">Live Calculated BMI</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{bmiValue}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${bmiCat.color}`}>
                            {bmiCat.label}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Primary Medical Disease / Concern</label>
                        <input
                          type="text"
                          placeholder="e.g. Hypertension, Asthma, Type 2 Diabetes"
                          value={form.primaryDisease}
                          onChange={(e) => setForm({ ...form, primaryDisease: e.target.value })}
                          className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Clinical Focus Sectors</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[
                            { key: "cardio", label: "Cardio" },
                            { key: "brain", label: "Brain" },
                            { key: "gastro", label: "Gastro" },
                            { key: "bp", label: "Blood Pressure" },
                            { key: "sugar", label: "Blood Sugar" },
                            { key: "thyroid", label: "Thyroid" }
                          ].map((sec) => {
                            const active = form.sectors[sec.key as keyof typeof form.sectors];
                            return (
                              <button
                                key={sec.key}
                                type="button"
                                onClick={() =>
                                  setForm({
                                    ...form,
                                    sectors: { ...form.sectors, [sec.key]: !active }
                                  })
                                }
                                className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between ${
                                  active
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300"
                                }`}
                              >
                                <span>{sec.label}</span>
                                {active && <TbCheck className="text-base" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: LIFESTYLE & HISTORY */}
                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <TbActivityHeartbeat className="text-blue-600 text-lg" />
                        <span>Step 4: Lifestyle & Surgical History</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-500 uppercase text-[10px]">Average Sleep Hours</span>
                            <span className="text-blue-600">{form.sleep} Hours</span>
                          </div>
                          <input
                            type="range"
                            min="3"
                            max="10"
                            step="0.5"
                            value={form.sleep}
                            onChange={(e) => setForm({ ...form, sleep: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-500 uppercase text-[10px]">Physical Activity Level</span>
                            <span className="text-blue-600">Level {form.activity} / 5</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="5"
                            step="1"
                            value={form.activity}
                            onChange={(e) => setForm({ ...form, activity: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Tobacco / Smoking</p>
                            <p className="text-[10px] text-slate-400 font-medium">Regular tobacco usage</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, smoking: !form.smoking })}
                            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                              form.smoking ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                form.smoking ? "translate-x-6" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Alcohol Consumption</p>
                            <p className="text-[10px] text-slate-400 font-medium">Weekly alcohol units</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, alcohol: !form.alcohol })}
                            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                              form.alcohol ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                form.alcohol ? "translate-x-6" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Dietary Pattern</label>
                          <select
                            value={form.diet}
                            onChange={(e) => setForm({ ...form, diet: e.target.value })}
                            className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
                          >
                            <option value="balanced">Balanced / High Nutrition</option>
                            <option value="average">Average Standard Diet</option>
                            <option value="poor">High Processed / Poor Diet</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Minor Surgeries</label>
                          <input
                            type="text"
                            placeholder="e.g. Appendectomy (2018)"
                            value={form.minorSurgeries}
                            onChange={(e) => setForm({ ...form, minorSurgeries: e.target.value })}
                            className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Major Surgeries</label>
                          <input
                            type="text"
                            placeholder="e.g. Coronary Stent (2022)"
                            value={form.majorSurgeries}
                            onChange={(e) => setForm({ ...form, majorSurgeries: e.target.value })}
                            className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Buttons */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs transition-colors flex items-center gap-2"
                    >
                      <TbArrowLeft className="text-base" />
                      <span>Previous</span>
                    </button>
                  ) : <div />}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                      <span>Next Step</span>
                      <TbChevronRight className="text-base" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                      {loading ? (
                        <TbLoader2 className="animate-spin text-base" />
                      ) : (
                        <>
                          <span>Activate Digital Twin</span>
                          <TbSparkles className="text-base" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </>
          ) : (
            /* POST-REGISTRATION MEDROUTER QR SUCCESS VIEW */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 py-4"
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 text-3xl shadow-lg shadow-emerald-500/20">
                <TbShieldCheck />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Registration & Auto-Login Successful!
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  You are now automatically logged in. Your Digital Twin model has been initialized and your MedRouter Patient QR Code is ready.
                </p>
              </div>

              {/* Patient Identifier Badge */}
              <div className="inline-block p-3 px-6 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-200/60 dark:border-slate-700">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">MedRouter Patient Identifier</p>
                <p className="text-lg font-mono font-black text-blue-600 dark:text-blue-400 mt-0.5">
                  {registeredUser.patientId}
                </p>
              </div>

              {/* Patient QR Code Graphic Card */}
              <div className="max-w-xs mx-auto p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg space-y-4">
                <div className="p-4 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
                  <QRCodeSVG
                    id="patient-qr-code"
                    value={JSON.stringify(
                      getEmergencyQRPayload(
                        registeredUser,
                        useStore.getState().lifestyleData,
                        useStore.getState().clinicalAssessmentState
                      ),
                      null,
                      2
                    )}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Contains Clinical Scores & MedRouter Passport Data
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="w-full sm:w-auto flex-1 py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <TbDownload className="text-base" />
                  <span>Download QR</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintCard}
                  className="w-full sm:w-auto flex-1 py-3 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <TbPrinter className="text-base" />
                  <span>Print ID Card</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleProceedToDashboard}
                  className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <span>Proceed to Dashboard</span>
                  <TbArrowRight className="text-base" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      <footer className="text-center py-4 text-xs text-slate-400 font-medium">
        &copy; {new Date().getFullYear()} AURA Health Clinical Systems. All rights reserved.
      </footer>
    </div>
  );
}
