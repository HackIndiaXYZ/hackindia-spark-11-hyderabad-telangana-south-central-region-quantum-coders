import React, { useEffect, useRef, useState, useCallback } from "react";
import { 
  TbMicrophone, 
  TbMicrophoneOff, 
  TbLoader2, 
  TbVolume, 
  TbVolumeOff,
  TbPlayerStop,
  TbHistory,
  TbTrash,
  TbSparkles
} from "react-icons/tb";
import { useStore } from "@/store/useStore";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

function ChatMessageItem({ msg }: { msg: { role: "user" | "ai"; content: string } }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = msg.role === "ai" && msg.content.length > 280;

  const displayContent = isLong && !expanded 
    ? msg.content.slice(0, 280) + "..." 
    : msg.content;

  return (
    <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-xs transition-all ${
          msg.role === "user"
            ? "bg-primary text-primary-foreground font-medium rounded-tr-none shadow-primary/10"
            : "bg-secondary/70 text-foreground ring-1 ring-border/50 rounded-tl-none backdrop-blur-md"
        }`}
      >
        <div className="whitespace-pre-wrap">{displayContent}</div>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs font-bold text-primary hover:underline focus:outline-none flex items-center gap-1"
          >
            {expanded ? "Show less ↑" : "Show more ↓"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function VoiceInteraction() {
  const { i18n, t } = useTranslation();
  const { 
    voiceMessages, 
    sendingVoice, 
    voiceError, 
    sendVoiceConsult, 
    resetVoiceChat 
  } = useStore();

  const [listening, setListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [speechOut, setSpeechOut] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const recRef = useRef<any>(null);

  const SR =
    typeof window !== "undefined"
      ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
      : undefined;

  const voiceLangMap: Record<string, string> = {
    en: "en-US",
    hi: "hi-IN",
    te: "te-IN",
  };

  const cleanupRec = useCallback(() => {
    try {
      recRef.current?.abort?.();
    } catch { /* ignore */ }
    recRef.current = null;
    setListening(false);
  }, []);

  useEffect(() => () => cleanupRec(), [cleanupRec]);

  // Smooth auto-scroll chat to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [voiceMessages, sendingVoice]);

  const startListen = () => {
    if (!SR) return;
    cleanupRec();

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = voiceLangMap[i18n.language] || "en-US";

    rec.onresult = (ev: any) => {
      let text = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        text += ev.results[i][0].transcript;
      }
      setInputText(text.trim());
    };

    rec.onerror = (ev: any) => {
      console.error("Speech Rec Error:", ev.error);
      cleanupRec();
    };

    rec.onend = () => {
      cleanupRec();
      // If voice recognition captured text, automatically submit as voice query
      if (inputText.trim()) {
        const textToSubmit = inputText.trim();
        setInputText("");
        sendVoiceConsult(textToSubmit, true);
      }
    };

    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      cleanupRec();
    }
  };

  const speak = useCallback(
    (text: string) => {
      if (!speechOut || !text.trim()) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = voiceLangMap[i18n.language] || "en-US";
        u.rate = 1.0;
        u.pitch = 1.0;
        window.speechSynthesis.speak(u);
      } catch { /* ignore */ }
    },
    [speechOut, i18n.language]
  );

  const handleSend = async (isVoiceInput: boolean = false) => {
    const msg = inputText.trim();
    if (!msg || sendingVoice) return;
    setInputText("");
    await sendVoiceConsult(msg, isVoiceInput);
  };

  // Speak AI responses automatically
  useEffect(() => {
    const lastMsg = voiceMessages[voiceMessages.length - 1];
    if (lastMsg && lastMsg.role === "ai" && !sendingVoice) {
      speak(lastMsg.content);
    }
  }, [voiceMessages, sendingVoice, speak]);

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[550px] max-h-[750px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-card flex-1 flex flex-col min-h-0 rounded-3xl overflow-hidden border border-primary/10 shadow-2xl relative bg-card/40">
        
        {/* Animated Background Aura */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              scale: listening ? [1, 1.2, 1] : 1,
              opacity: listening ? [0.05, 0.1, 0.05] : 0.03
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary rounded-full blur-[120px]"
          />
        </div>

        {/* Fixed Header */}
        <div className="flex-shrink-0 px-6 sm:px-8 py-5 border-b border-border/40 flex items-center justify-between z-20 bg-card/70 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                <TbMicrophone className={listening ? "animate-pulse" : ""} />
              </div>
              {listening && (
                <motion.div 
                  layoutId="pulse"
                  className="absolute -inset-1 rounded-2xl bg-primary/20 -z-10"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-foreground/90">Aura AI Consultant</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary/80 italic">
                Aura Companion & Gemini 2.0 Flash
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSpeechOut(!speechOut)}
              title={speechOut ? "Mute Speech" : "Unmute Speech"}
              className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all border ${
                speechOut ? "bg-primary/10 border-primary/20 text-primary" : "bg-secondary/40 border-border text-muted-foreground"
              }`}
            >
              {speechOut ? <TbVolume /> : <TbVolumeOff />}
            </button>
            <button
              onClick={resetVoiceChat}
              title="Clear Conversation"
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-secondary/40 border border-border text-muted-foreground hover:text-destructive transition-colors"
            >
              <TbTrash />
            </button>
          </div>
        </div>

        {/* Scrollable Message History (Isolated Scrolling) */}
        <div 
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 sm:px-8 py-6 space-y-5 scrollbar-thin scrollbar-thumb-primary/10 z-10"
        >
          {voiceMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-10">
              <div className="h-16 w-16 rounded-2xl bg-secondary/50 flex items-center justify-center text-3xl mb-3 shadow-inner">
                👋
              </div>
              <h3 className="text-base font-bold mb-1">{t("voice.welcome_title", "Hello, I'm Aura.")}</h3>
              <p className="text-xs max-w-[280px] leading-relaxed text-muted-foreground">
                {t("voice.welcome_desc", "Ask me anything about your organ scores, lifestyle habits, or medical reports.")}
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {voiceMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ChatMessageItem msg={msg} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {sendingVoice && (
            <div className="flex justify-start">
              <div className="bg-secondary/50 rounded-2xl rounded-tl-none px-5 py-3 flex items-center gap-3 border border-border/40">
                <TbLoader2 className="animate-spin text-primary" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Consulting Aura Companion...</span>
              </div>
            </div>
          )}
          {voiceError && (
             <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium text-center">
               {voiceError}
             </div>
          )}
        </div>

        {/* Fixed Input Bar at Bottom */}
        <div className="flex-shrink-0 px-6 sm:px-8 py-4 bg-card/90 backdrop-blur-md flex flex-col gap-3 border-t border-border/40 z-20">
          <div className="relative flex items-center gap-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={listening ? "Listening..." : "Type or speak your question..."}
              className="flex-1 bg-secondary/40 ring-1 ring-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none min-h-[48px] max-h-[120px] transition-all"
              rows={1}
            />
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={listening ? cleanupRec : startListen}
              className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl transition-all shadow-lg flex-shrink-0 ${
                listening 
                  ? "bg-destructive text-destructive-foreground shadow-destructive/20" 
                  : "bg-primary text-primary-foreground shadow-primary/20"
              }`}
            >
              {listening ? <TbPlayerStop /> : <TbMicrophone />}
            </motion.button>
          </div>

          <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/50">
            <span className="flex items-center gap-1.5">
              <TbHistory className="text-xs text-primary" /> Multi-turn Context
            </span>
            <span className="flex items-center gap-1.5">
              <TbSparkles className="text-xs text-primary" /> Sub-Second Latency
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
