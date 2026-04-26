import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { MessageSquare, Mic, Sparkles, Download, X, Zap, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLiveAPI } from "./lib/useLiveAPI";
import { cn } from "./lib/utils";

// Lazy load components for lightning-fast initial mount
const ChatInterface = lazy(() => import("./components/ChatInterface").then(m => ({ default: m.ChatInterface })));
const VoiceInterface = lazy(() => import("./components/VoiceInterface").then(m => ({ default: m.VoiceInterface })));
const LandingPage = lazy(() => import("./components/LandingPage").then(m => ({ default: m.LandingPage })));

const APP_VERSION = "2.6.0"; // Increment for optimization update

function LoadingFallback() {
  return (
    <div className="fixed inset-0 bg-[#0d0d12] flex items-center justify-center z-[1000]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-4">
          <motion.div 
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.2, 0.4, 0.2] 
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-12 bg-cyan-500/20 blur-[60px] rounded-full"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10"
          >
            <img src="https://img.icons8.com/nolan/512/bot.png" alt="Bot Logo" className="w-24 h-24 drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]" />
          </motion.div>
        </div>
        <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.5em] mt-2 mb-6">Ai Chat Power</p>
        <div className="flex gap-2 align-center">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    className="w-1 h-1 rounded-full bg-cyan-400"
                />
            ))}
        </div>
      </motion.div>
    </div>
  );
}

function AppContent() {
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [deviceType, setDeviceType] = useState<"mobile" | "tv" | "desktop">("desktop");
  const [showLanding, setShowLanding] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("hasVisited");
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const navigate = useNavigate();
  const liveAPI = useLiveAPI();
  const { isConnected } = liveAPI;

  useEffect(() => {
    // Detect device once for performance
    const detectDevice = () => {
      const ua = navigator.userAgent || "";
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;
      
      const isTV = /SmartTV|GoogleTV|AppleTV|HbbTV|LG|Samsung|Tizen|Viera|Sony|Vizio|AFTB|AFTN|FireTV|WebOS|Roku|LargeScreen/i.test(ua) ||
                   ( /Android/i.test(ua) && /TV/i.test(ua) ) || 
                   ( width >= 1920 && width / height > 1.7 && /Android/i.test(ua) );

      if (isTV) {
        setDeviceType("tv");
      } else if (width < 768 || /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        setDeviceType("mobile");
      } else {
        setDeviceType("desktop");
      }
    };

    detectDevice();
    
    // Throttled resize listener
    let resizeTimer: any;
    const handleResize = () => {
       if (!resizeTimer) {
          resizeTimer = setTimeout(() => {
             detectDevice();
             resizeTimer = null;
          }, 200);
       }
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // API KEY Auto-Sync (URL Params are fast)
    const params = new URLSearchParams(window.location.search);
    const syncKey = params.get('sync_key');
    if (syncKey) {
      localStorage.setItem("personal_gemini_key", syncKey);
      window.history.replaceState({}, document.title, window.location.pathname);
      setShowUpdateToast(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  if (showLanding) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LandingPage onStart={() => {
          localStorage.setItem("hasVisited", "true");
          setShowLanding(false);
        }} onInstall={handleInstall} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#0a0a0f] flex items-center justify-center overflow-x-hidden relative selection:bg-cyan-500/30">
      <div className="w-full h-full max-w-md sm:h-[90vh] sm:max-h-[850px] sm:rounded-[2.5rem] sm:border sm:border-white/5 bg-[#0c0c14] relative overflow-hidden shadow-2xl flex flex-col">
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="/app" element={
            <div className="flex flex-col flex-1 text-white overflow-hidden font-sans relative">
              {/* Optimized Background Static Gradients */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/[0.05] blur-[120px] will-change-transform" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-600/[0.05] blur-[120px] will-change-transform" />
              </div>

              <main className="flex-1 relative w-full h-full overflow-hidden z-10">
                <Suspense fallback={<LoadingFallback />}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={mode}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      {mode === "text" ? (
                        <ChatInterface 
                          onSwitchToVoice={() => setMode("voice")} 
                          onBack={() => setMode("voice")} 
                          liveAPI={liveAPI}
                        />
                      ) : (
                        <VoiceInterface 
                          onBack={() => setMode("text")} 
                          deviceType={deviceType} 
                          liveAPI={liveAPI}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Suspense>
              </main>
            </div>
          } />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
