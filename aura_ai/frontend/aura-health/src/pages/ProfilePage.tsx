import { useState } from "react";
import { useStore, getEmergencyQRPayload } from "@/store/useStore";
import DashboardLayout from "@/components/DashboardLayout";
import ControlPanel from "@/components/ControlPanel";
import { QRCodeSVG } from "qrcode.react";
import {
  TbUser,
  TbMail,
  TbShieldCheck,
  TbAdjustmentsHorizontal,
  TbPhone,
  TbHeart,
  TbQrcode,
  TbDownload,
  TbPrinter,
  TbMapPin,
  TbId,
  TbStethoscope,
  TbActivityHeartbeat
} from "react-icons/tb";

export default function ProfilePage() {
  const { user, lifestyleData, clinicalAssessmentState } = useStore();
  const [activeTab, setActiveTab] = useState<"qr" | "lifestyle" | "medical" | "account">("qr");
  const [showJSONPreview, setShowJSONPreview] = useState(false);
  const [qrMode, setQrMode] = useState<"json" | "url">("json");

  const patientId = `AURA-${user?.id || "6a71b42f3e54221099a23f11"}`;

  const qrPayloadObj = getEmergencyQRPayload(user, lifestyleData, clinicalAssessmentState);

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8080";
  const passportWebUrl = `${origin}/passport?id=${encodeURIComponent(patientId)}&name=${encodeURIComponent(qrPayloadObj.patient_name)}`;

  const richQRPayload = JSON.stringify(qrPayloadObj, null, 2);
  const activeQRPayload = qrMode === "url" ? passportWebUrl : richQRPayload;

  // Download QR Action
  const handleDownloadQR = () => {
    const svgElement = document.getElementById("profile-patient-qr");
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
        downloadLink.download = `${patientId}-QR.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* Page Header Banner */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-500/20 flex-shrink-0">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "P"}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {user?.full_name || "Registered Patient"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-extrabold uppercase">
                Clinical Profile
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1"><TbMail className="text-blue-600" /> {user?.email || "patient@aura.health"}</span>
              <span className="flex items-center gap-1"><TbShieldCheck className="text-emerald-500" /> Digital Twin ID: {patientId}</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("qr")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "qr"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <TbQrcode className="text-base" />
            <span>Registration & Patient QR</span>
          </button>

          <button
            onClick={() => setActiveTab("lifestyle")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "lifestyle"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <TbAdjustmentsHorizontal className="text-base" />
            <span>Simulation Parameters</span>
          </button>

          <button
            onClick={() => setActiveTab("medical")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "medical"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <TbHeart className="text-base" />
            <span>Medical History</span>
          </button>

          <button
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "account"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <TbUser className="text-base" />
            <span>Emergency Contacts</span>
          </button>
        </div>

        {/* TAB 1: REGISTRATION DETAILS & PATIENT QR CODE */}
        {activeTab === "qr" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* MedRouter Patient QR Card (1 Col) */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border border-blue-200">
                  MedRouter Patient QR
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-3">
                  Digital Twin Access Card
                </h3>
                {/* QR Mode Switcher */}
                <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-xs mx-auto text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setQrMode("url")}
                    className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                      qrMode === "url"
                        ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Scannable Link QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrMode("json")}
                    className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                      qrMode === "json"
                        ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Raw JSON QR
                  </button>
                </div>
              </div>

              {/* QR Graphic Container */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-3xl border border-slate-200/60 dark:border-slate-700 inline-block mx-auto shadow-inner space-y-3">
                <div className="p-3 bg-white rounded-2xl flex items-center justify-center border border-slate-100">
                  <QRCodeSVG
                    id="profile-patient-qr"
                    value={activeQRPayload}
                    size={240}
                    level="L"
                    includeMargin={true}
                  />
                </div>
                <p className="text-[11px] font-mono font-black text-blue-600 dark:text-blue-400">
                  {patientId}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {qrMode === "url" ? "🌐 Direct Web Passport Link" : "📄 Raw Encoded JSON Payload"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <TbDownload className="text-base" />
                  <span>Download Patient QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowJSONPreview(!showJSONPreview)}
                  className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <TbQrcode className="text-base" />
                  <span>{showJSONPreview ? "Hide Scanned JSON Payload" : "View Encoded JSON Payload"}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintCard}
                  className="w-full py-2.5 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-400 rounded-2xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <TbPrinter className="text-base" />
                  <span>Print ID Card</span>
                </button>

                {showJSONPreview && (
                  <div className="mt-3 p-3 bg-slate-900 text-slate-100 rounded-2xl text-[10px] text-left font-mono overflow-x-auto max-h-48 scrollbar-thin border border-slate-700">
                    <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5 pb-1 border-b border-slate-800 flex justify-between items-center">
                      <span>Exact QR Encoded JSON</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(qrPayloadObj, null, 2))}
                        className="text-blue-400 hover:underline cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(qrPayloadObj, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Details Card (2 Cols) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Clinical Intake & Patient Demographics
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Verified registration parameters saved in MongoDB clinical cloud
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Legal Name */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Full Legal Name</span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{user?.full_name || "Registered Patient"}</p>
                </div>

                {/* Email Address */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Email Address</span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{user?.email || "patient@aura.health"}</p>
                </div>

                {/* Phone Number */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Registered Phone</span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{user?.phone || user?.phone_number || "Not Provided"}</p>
                </div>

                {/* Aadhaar Number */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Aadhaar Number</span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {user?.aadhaar ? `XXXX-XXXX-${user.aadhaar.slice(-4)}` : "Not Provided"}
                  </p>
                </div>

                {/* Biological Parameters */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Age & Biological Sex</span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">{user?.age || lifestyleData.age} Years • {user?.gender || lifestyleData.sex}</p>
                </div>

                {/* BMI */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Biological BMI</span>
                  <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{lifestyleData.bmi ? lifestyleData.bmi.toFixed(1) : "23.5"} kg/m²</p>
                </div>

                {/* Current Location */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
                    <TbMapPin className="text-blue-600" /> Current Address / Verified Location
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {user?.current_address || user?.permanent_address || "Not Provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SIMULATION PARAMETERS */}
        {activeTab === "lifestyle" && (
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <ControlPanel />
          </div>
        )}

        {/* TAB 3: MEDICAL HISTORY */}
        {activeTab === "medical" && (
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Clinical History & Patient Intake Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Pre-existing Conditions / Primary Disease</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.primary_disease || "None Reported"}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Surgeries & Medical History</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.surgeries || user?.major_surgeries || user?.minor_surgeries || "No major surgeries reported"}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Family Medical Details</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.family_details || "No significant family history reported"}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Known Allergies / Past Prescriptions</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.past_prescriptions || user?.allergies || "No drug allergies reported"}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EMERGENCY CONTACTS */}
        {activeTab === "account" && (
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Emergency Contacts</h3>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center gap-3">
                <TbPhone className="text-blue-600 text-lg" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.emergency_name || "Primary Emergency Contact"}</p>
                  <p className="text-xs text-slate-500 font-medium">{user?.emergency_phone || "Not Provided"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
