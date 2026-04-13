import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, Mic, Download, X, ArrowLeft, Smartphone, Tv, Monitor, Sparkles } from "lucide-react";
import { ChatInterface } from "./components/ChatInterface";
import { VoiceInterface } from "./components/VoiceInterface";
import { LandingPage } from "./components/LandingPage";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [isInitializing, setIsInitializing] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deviceType, setDeviceType] = useState<"mobile" | "tv" | "desktop">("desktop");

  useEffect(() => {
    // Splash screen timer
    const timer = setTimeout(() => setIsInitializing(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const detectDevice = () => {
      const ua = navigator.userAgent.toLowerCase();
      const isTV = ua.includes("tv") || ua.includes("tizen") || ua.includes("webos") || ua.includes("smart-tv") || ua.includes("googletv") || ua.includes("appletv");
      const isMobile = /iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua);

      if (isTV) setDeviceType("tv");
      else if (isMobile) setDeviceType("mobile");
      else setDeviceType("desktop");
    };

    detectDevice();
    window.addEventListener("resize", detectDevice);
    return () => window.removeEventListener("resize", detectDevice);
  }, []);

  useEffect(() => {
    // Check if app is running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    // Auto-redirect to app if installed and on landing page
    if (isStandalone && location.pathname === "/") {
      navigate("/app");
    }

    const handler = (e: any) => {
      if (!isStandalone) {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert("يرجى استخدام متصفح Chrome أو Safari لتثبيت التطبيق مباشرة.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-[#050507] flex items-center justify-center z-[1000]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ 
              rotate: [0, 90, 180, 270, 360],
              boxShadow: ["0 0 20px #22d3ee", "0 0 60px #8b5cf6", "0 0 20px #22d3ee"]
            }}
            transition={{ rotate: { duration: 12, repeat: Infinity, ease: "linear" }, boxShadow: { duration: 2, repeat: Infinity } }}
            className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center mb-6 border border-white/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 animate-pulse" />
            <Sparkles className="w-12 h-12 text-white relative z-10" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-black tracking-[0.4em] text-white uppercase"
          >
            AI CHAT POWER
          </motion.h2>
          <div className="mt-4 flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 bg-cyan-500 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage onStart={() => navigate("/app")} onInstall={handleInstall} />} />
      <Route path="/app" element={
        <div className="flex flex-col h-screen bg-[#050507] text-white overflow-hidden font-sans selection:bg-indigo-500/30">
          {/* Background Effects */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150" />
          </div>

          {/* PWA Install Banner */}
          <AnimatePresence>
            {showInstallBanner && !window.matchMedia('(display-mode: standalone)').matches && (
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="fixed top-6 left-6 right-6 z-[100] bg-white/10 backdrop-blur-3xl border border-white/20 p-6 rounded-[2rem] flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center space-x-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 flex items-center justify-center shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                    <Download className="w-7 h-7 text-white relative z-10" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg tracking-tight">ثبت التطبيق الآن</p>
                    <p className="text-white/50 text-sm">استمتع بتجربة كاملة وسريعة بدون متصفح</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleInstall}
                    className="bg-white text-black px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-xl active:scale-95"
                  >
                    تثبيت
                  </button>
                  <button
                    onClick={() => setShowInstallBanner(false)}
                    className="p-3 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <header className="w-full pt-4 pb-2 px-6 flex flex-col items-center justify-center relative z-10">
            {/* Device Indicator - Moved to top-left corner */}
            <div className="absolute left-6 top-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/30 backdrop-blur-md">
                {deviceType === "tv" && <Tv className="w-4 h-4 text-rose-500/50" />}
                {deviceType === "mobile" && <Smartphone className="w-4 h-4 text-cyan-500/50" />}
                {deviceType === "desktop" && <Monitor className="w-4 h-4 text-indigo-500/50" />}
                <span className="text-[8px] font-black uppercase tracking-widest hidden sm:block">{deviceType}</span>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="w-full max-w-[280px] bg-white/5 backdrop-blur-3xl p-1 rounded-[2rem] flex border border-white/10 relative z-20 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              <button 
                onClick={() => setMode("text")}
                className={`flex-1 flex items-center justify-center py-2.5 rounded-[1.5rem] transition-all duration-500 ${mode === "text" ? "bg-white/10 text-white shadow-lg font-bold" : "text-white/20 hover:text-white/40"}`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                <span className="text-[10px] tracking-[0.15em] uppercase">Text Chat</span>
              </button>
              <button 
                onClick={() => setMode("voice")}
                className={`flex-1 flex items-center justify-center py-2.5 rounded-[1.5rem] transition-all duration-500 ${mode === "voice" ? "bg-white/10 text-white shadow-lg font-bold" : "text-white/20 hover:text-white/40"}`}
              >
                <Mic className="w-4 h-4 mr-2" />
                <span className="text-[10px] tracking-[0.15em] uppercase">Voice AI</span>
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 relative w-full h-full overflow-hidden z-10">
            <AnimatePresence mode="wait">
              {mode === "text" ? (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <ChatInterface onSwitchToVoice={() => setMode("voice")} onBack={() => {}} />
                </motion.div>
              ) : (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <VoiceInterface onBack={() => setMode("text")} deviceType={deviceType} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
