import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, ArrowLeft, Info, Wind, Sparkles, Zap, Flame, Activity, X, Monitor, Tv, Share2, Download } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import QRCode from "react-qr-code";
import { useLiveAPI } from "../lib/useLiveAPI";
import { cn } from "../lib/utils";
import { WeatherWidget } from "./WeatherWidget";

const MOODS = [
  { id: "Zephyr", label: "Alpha", type: "هادئ", icon: Wind, color: "from-cyan-400 to-blue-600", accent: "#06b6d4" },
  { id: "Puck", label: "Beta", type: "حيوي", icon: Sparkles, color: "from-emerald-400 to-teal-600", accent: "#10b981" },
  { id: "Charon", label: "Gamma", type: "قوي", icon: Zap, color: "from-purple-400 to-indigo-600", accent: "#a855f7" },
  { id: "Kore", label: "Delta", type: "ناعم", icon: Flame, color: "from-rose-400 to-orange-600", accent: "#f43f5e" },
];

interface VoiceInterfaceProps {
  onBack: () => void;
  deviceType?: "mobile" | "tv" | "desktop";
  liveAPI: ReturnType<typeof useLiveAPI>;
}

export function VoiceInterface({ onBack, deviceType = "desktop", liveAPI }: VoiceInterfaceProps) {
  const { 
    isConnected, isSpeaking, volume, userVolume, connect, disconnect, toggleMute, isMuted, voice, error, 
    weatherData, setWeatherData, gestureType, setGestureType, handStyle, setHandStyle, transcript, audioContextRef
  } = liveAPI;
  const [isConnectingLocal, setIsConnectingLocal] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(() => localStorage.getItem("selected_voice") || "");
  const [showVoiceSelection, setShowVoiceSelection] = useState(!localStorage.getItem("selected_voice"));
  const [showTvModal, setShowTvModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const x = useMotionValue(0);

  // PIP Logic
  const togglePIP = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        const stream = canvasRef.current.captureStream(30);
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.error("PIP failed", e);
    }
  };

  // Canvas Drawing for PIP
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let animReq: number;
    const draw = () => {
      const v = volume.get();
      const uv = userVolume.get();
      const accent = MOODS.find(m => m.id === selectedVoice)?.accent || "#00d2ff";
      
      ctx.fillStyle = '#050507';
      ctx.fillRect(0, 0, 300, 300);
      
      // Draw User Aura (Spectrum)
      if (uv > 0.05) {
        ctx.beginPath();
        const userGrd = ctx.createRadialGradient(150, 150, 50, 150, 150, 150 * (0.5 + uv * 1.5));
        userGrd.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        userGrd.addColorStop(0.5, 'rgba(0, 210, 255, 0.1)');
        userGrd.addColorStop(1, 'transparent');
        ctx.fillStyle = userGrd;
        ctx.arc(150, 150, 150, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Aura
      ctx.beginPath();
      const auraGrd = ctx.createRadialGradient(150, 150, 20, 150, 150, 150 * (1 + v * 0.5));
      auraGrd.addColorStop(0, accent + '88');
      auraGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = auraGrd;
      ctx.arc(150, 150, 150, 0, Math.PI * 2);
      ctx.fill();

      // Draw Core
      ctx.beginPath();
      ctx.fillStyle = accent;
      if (deviceType === "desktop") {
        ctx.shadowBlur = 20 + v * 30;
        ctx.shadowColor = accent;
      }
      ctx.arc(150, 150, 40 + v * 20, 0, Math.PI * 2);
      ctx.fill();
      
      // Additional simple glow for non-desktop
      if (deviceType !== "desktop") {
        ctx.beginPath();
        const coreGlow = ctx.createRadialGradient(150, 150, 40 + v * 20, 150, 150, 60 + v * 40);
        coreGlow.addColorStop(0, accent + '44');
        coreGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGlow;
        ctx.arc(150, 150, 80, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw Text
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.font = 'bold 9px sans-serif';
      ctx.letterSpacing = '4px';
      ctx.textAlign = 'center';
      ctx.fillText(isSpeaking ? "FLOWING" : "READY", 150, 280);

      animReq = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animReq);
  }, [selectedVoice, isSpeaking, volume, userVolume]);

  // Optimized Visuals using MotionValues
  const auraScale = useTransform(volume, [0, 1], [1, 1.6]);
  const auraOpacity = useTransform(volume, [0, 1], [0.2, 0.6]);
  
  // User Spectrum Transforms (for the outer pulse)
  const userGlowScale = useTransform(userVolume, [0, 1], [0.9, 1.8]);
  const userGlowOpacity = useTransform(userVolume, [0, 0.1, 1], [0, 0.3, 0.6]);

  const coreRotate = useTransform(volume, [0, 1], [0, 45]);
  const liquidScale = useTransform(volume, [0, 1], [1, 1.25]);

  const handleVoiceSelect = (vId: string) => {
    if (typeof navigator.vibrate === 'function') navigator.vibrate(15);
    setSelectedVoice(vId);
    localStorage.setItem("selected_voice", vId);
    setShowVoiceSelection(false);
    setIsConnectingLocal(true);
    // Auto-connect after voice selection
    setTimeout(() => connect(vId), 500);
  };

  useEffect(() => {
    // Auto-connect once a voice is selected and component is mounted
    if (!isConnected && !showVoiceSelection && selectedVoice && !isConnectingLocal) {
      const vId = selectedVoice || "Zephyr";
      setIsConnectingLocal(true);
      connect(vId);
    }
  }, [isConnected, showVoiceSelection, selectedVoice, connect, isConnectingLocal]);

  useEffect(() => {
    if (isConnected) {
      setIsConnectingLocal(false);
    }
  }, [isConnected]);

  const toggleConnection = () => {
    if (isConnected) {
      disconnect();
      setIsConnectingLocal(false);
    } else {
      const vId = selectedVoice || "Zephyr";
      setIsConnectingLocal(true);
      connect(vId);
    }
  };

  const isNight = new Date().getHours() >= 23 || new Date().getHours() <= 9;

  // Sleeping Logic: 11:30 PM to 10:12 AM.
  const checkSleepTime = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    
    // Sleeps if it is past 23:30, OR before 10 AM, OR exactly 10 AM but before 10:12
    if ((h === 23 && m >= 30) || (h >= 0 && h < 10) || (h === 10 && m < 12)) {
      return true;
    }
    return false;
  };
  const [isSleepingTime, setIsSleepingTime] = useState(checkSleepTime());
  const [hasAnnouncedSleep, setHasAnnouncedSleep] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      // At exactly 23:30 (and 0 seconds ideally, but within the minute), tell him to sleep
      if (now.getHours() === 23 && now.getMinutes() === 30 && !hasAnnouncedSleep) {
         setHasAnnouncedSleep(true);
         if (isConnected && liveAPI.sendMessage) {
            liveAPI.sendMessage("[Internal System]: إنها الساعة 23:30 الآن. أخبر المستخدم فوراً وبشكل مختصر جداً 'أنا أريد النوم' ثم توقف عن الكلام ليتم إغلاق المحادثة.");
            // Give him 8 seconds to say it, then show sleep UI & disconnect
            setTimeout(() => {
               setIsSleepingTime(true);
               disconnect();
            }, 8000);
            return; // Skip normal check to allow transition
         }
      }

      const sleeping = checkSleepTime();
      if (sleeping !== isSleepingTime) {
         setIsSleepingTime(sleeping);
         if (sleeping && isConnected) {
             disconnect(); // Force disconnect
         }
      }
    }, 5000); // Check more frequently (every 5 seconds) to catch precise time
    return () => clearInterval(interval);
  }, [isConnected, isSleepingTime, disconnect, hasAnnouncedSleep, liveAPI.sendMessage]);

  return (
    <div className="flex flex-col h-full bg-[#050507] overflow-hidden relative">
      {/* Dynamic Background - Hyper Optimized for Mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-40 bg-gradient-to-br from-indigo-900/10 via-black to-blue-900/10"
        />
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-cyan-900/30 rounded-full will-change-[transform,opacity]"
        />
      </div>

      <motion.div
        animate={{
          opacity: isSpeaking ? 1 : 0,
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="fixed inset-0 pointer-events-none z-0 bg-cyan-500/10"
      />

      {/* Header Bar */}
      <div className="absolute top-8 left-8 z-[100] flex gap-3">
        <motion.button
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-4 rounded-[2rem] bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all shadow-2xl flex items-center justify-center group"
          title="العودة للمحادثة الكتابية"
        >
          <ArrowLeft className="w-6 h-6 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowTvModal(true)}
          className="p-4 rounded-[2rem] bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all shadow-2xl flex items-center justify-center group"
          title="توصيل بالشاشة الكبيرة / تلفاز"
        >
          <Tv className="w-6 h-6 group-hover:text-cyan-400 transition-colors" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePIP}
          className="p-4 rounded-[2rem] bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all shadow-2xl flex items-center justify-center group"
          title="تشغيل الوضع العائم (PIP)"
        >
          <Monitor className="w-6 h-6 group-hover:text-cyan-400 transition-colors" />
        </motion.button>

        {deferredPrompt && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleInstallApp}
            className="px-6 rounded-[2rem] bg-cyan-500 text-white font-black text-[10px] tracking-[0.2em] shadow-[0_0_30px_rgba(34,211,238,0.3)] border border-white/20 flex items-center gap-3 transition-all"
          >
            <Download className="w-4 h-4" />
            INSTALL APP ON TV
          </motion.button>
        )}
      </div>
      
      <div className="absolute top-10 right-10 z-[100] flex flex-col items-end pointer-events-none">
        <span className="text-[8px] text-white/20 font-bold tracking-[0.4em]">AI CHAT POWER</span>
      </div>

      <AnimatePresence>
        {showTvModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[500] flex items-center justify-center p-6"
            onClick={() => setShowTvModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f0f15] border border-cyan-500/20 rounded-[2.5rem] p-8 max-w-sm w-full shadow-[0_0_50px_rgba(34,211,238,0.1)] flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500" />
              
              <button 
                onClick={() => setShowTvModal(false)}
                className="absolute top-4 right-4 p-2 text-white/30 hover:text-white bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 mt-4">
                <Tv className="w-8 h-8 text-cyan-400" />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">توصيل بالتلفاز</h2>
              <p className="text-sm text-white/50 leading-relaxed mb-6">
                امسح رمز QR بكاميرا هاتفك أو شارك الرابط المباشر للاتصال والاستمتاع بتجربة Ai Chat Power الصوتية على شاشة التلفاز.
              </p>

              <div className="bg-white p-4 rounded-3xl mb-6 shadow-xl">
                <QRCode 
                  value={'https://ais-pre-fn6er6b45ikcmrsvt53dv2-706059595104.europe-west2.run.app'} 
                  size={150}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>

              <button
                onClick={() => {
                  const shareUrl = 'https://ais-pre-fn6er6b45ikcmrsvt53dv2-706059595104.europe-west2.run.app';
                  if (navigator.share) {
                    navigator.share({
                      title: 'Ai Chat Power - التلفاز',
                      text: 'افتح حساب Ai Chat Power الخاص بي على التلفاز!',
                      url: shareUrl,
                    }).catch(console.error);
                  } else {
                    navigator.clipboard.writeText(shareUrl);
                    alert("تم نسخ الرابط! أرسله للتلفاز.");
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 text-white py-3 px-6 rounded-xl font-bold transition-all"
              >
                <Share2 className="w-5 h-5" />
                مشاركة الرابط
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} width={300} height={300} className="hidden" />
      <video ref={videoRef} className="hidden" muted playsInline />

      {isSleepingTime ? (
         <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 text-center px-4">
            <div className="relative w-40 h-40 flex justify-center items-center mb-4">
              {/* Sleeping Core Base */}
              <motion.div
                animate={{
                  scale: [0.9, 0.95, 0.9],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 bg-indigo-900 rounded-full shadow-[0_0_30px_rgba(49,46,129,0.5)] border-4 border-indigo-500/20 mix-blend-screen"
              />
              
              {/* Floating Zzz Animation */}
              {[...Array(3)].map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 0, x: 10 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    y: [-10, -60],
                    x: [10, i % 2 === 0 ? 30 : -10],
                    scale: [0.8, 1.3, 0.8]
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    delay: i * 1.2,
                    ease: "easeOut"
                  }}
                  className="absolute top-1/3 right-1/4 text-[#00d2ff] font-bold font-mono text-xl mix-blend-screen pointer-events-none"
                >
                  Z
                </motion.span>
              ))}
            </div>

            <h2 className="text-sm font-medium text-white/30 tracking-[0.2em] mb-2">وضع السكون</h2>
         </div>
      ) : (
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
        <AnimatePresence>
          {showVoiceSelection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0 z-[150] bg-[#050507] flex flex-col items-center justify-center p-6 text-center overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full animate-pulse will-change-[transform,opacity]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full animate-pulse will-change-[transform,opacity]" style={{ animationDelay: '2s' }} />
              </div>

              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative z-10 mb-8 sm:mb-16"
              >
                <h2 className="text-3xl sm:text-5xl text-white font-black mb-3 sm:mb-4 tracking-[0.1em] sm:tracking-[0.2em] uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-white/20">
                  Select Visual Mood
                </h2>
              </motion.div>
              
              <div className="w-full relative py-4 sm:py-8 overflow-visible">
                <motion.div 
                   className="flex gap-6 sm:gap-12 px-[40vw] sm:px-[25vw] cursor-grab active:cursor-grabbing w-fit"
                   drag="x"
                   dragConstraints={{ left: -1200, right: 0 }}
                   dragElastic={0.05}
                   style={{ x }}
                >
                  {MOODS.map((mood) => (
                    <motion.div
                      key={mood.id}
                      onClick={() => handleVoiceSelect(mood.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-shrink-0 w-64 sm:w-72 h-[22rem] sm:h-[26rem] rounded-[2.5rem] sm:rounded-[3.5rem] bg-[#0a0a0f] border border-white/5 p-8 sm:p-10 flex flex-col items-center justify-between group transition-all relative overflow-hidden shadow-2xl"
                    >
                      <div className={cn(
                        "w-24 h-24 rounded-[2rem] bg-gradient-to-br flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500",
                        mood.color
                      )}>
                        <mood.icon className="text-white w-12 h-12" strokeWidth={1} />
                      </div>
                      <div className="text-center relative z-10">
                        <span className="block text-white font-bold text-3xl tracking-tighter mb-1 uppercase italic group-hover:tracking-widest transition-all duration-700">{mood.label}</span>
                        <div className="px-5 py-1.5 rounded-full bg-white/5 border border-white/10 inline-block">
                           <span className="text-white/60 text-[11px] uppercase tracking-[0.4em] font-medium">{mood.type}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {weatherData && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 z-[40] w-full max-w-xs"
            >
              <WeatherWidget 
                city={weatherData.city} 
                country={weatherData.country} 
                condition={weatherData.condition} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Visualizer - Majestic Liquid Core */}
        <div className={cn(
          "relative flex items-center justify-center transition-all duration-700 w-full h-[50dvh] min-h-[400px]",
          deviceType === "tv" && "h-[60vh]"
        )}>
          {/* Advanced Liquid Filter for truly fluid motion */}
          <svg className="fixed w-0 h-0 invisible">
            <defs>
              <filter id="liquid-aura">
                <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -12" />
              </filter>
            </defs>
          </svg>

          <motion.div 
            animate={{
              y: isSpeaking ? [0, -6, 6, -6, 0] : [0, -3, 0],
              scale: isConnected ? 1 : 0.95
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 flex items-center justify-center w-full h-full"
            onClick={() => {
              if (liveAPI.audioContextRef?.current?.state === 'suspended') {
                liveAPI.audioContextRef.current.resume().catch(() => {});
              }
            }}
          >
            {/* User Speech Feedback - Neural Atmosphere */}
            <motion.div
              style={{
                scale: userGlowScale,
                opacity: userGlowOpacity,
              }}
              className="absolute w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] pointer-events-none z-0"
            >
               <motion.div 
                 animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                 transition={{ rotate: { duration: 10, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity } }}
                 className="w-full h-full rounded-full opacity-20 blur-[80px]"
                 style={{
                   background: `conic-gradient(from 0deg, #ff0080, #7928ca, #00d2ff, #7928ca, #ff0080)`
                 }}
               />
            </motion.div>

            {/* Core Immersive Aura */}
            <motion.div
              style={{
                scale: isConnected ? auraScale : (isConnectingLocal ? 1.3 : 0.75),
                opacity: isConnected ? auraOpacity : (isConnectingLocal ? 0.4 : 0.05),
                background: isConnected || isConnectingLocal 
                  ? `radial-gradient(circle, ${MOODS.find(m => m.id === selectedVoice)?.accent || "#06b6d4"} 0%, transparent 70%)`
                  : "radial-gradient(circle, #1e293b 0%, transparent 70%)"
              }}
              className="absolute w-[350px] h-[350px] sm:w-[550px] sm:h-[550px] pointer-events-none rounded-full blur-[40px] mix-blend-screen"
            />

            {/* Dynamic Avatar Core: 3D Free Flowing Entity */}
            <div className="relative flex items-center justify-center w-full h-full perspective-[1200px]">
              
              <motion.div
                animate={{
                  scale: isConnected ? (isSpeaking ? [1, 1.1, 1] : [1, 1.02, 1]) : 0.8,
                  rotateZ: coreRotate as any,
                }}
                transition={{ 
                  scale: { duration: 0.3 },
                }}
                style={{ filter: 'url(#liquid-aura)' }}
                className={cn(
                  "relative flex items-center justify-center transform-style-3d",
                  deviceType === "tv" ? "w-72 h-72" : "w-64 h-64"
                )}
              >
                  <div className="absolute top-[-70px] left-1/2 -translate-x-1/2 flex gap-4 opacity-20">
                    <Monitor className="w-5 h-5 text-white" />
                    <Tv className="w-5 h-5 text-white" />
                  </div>
                 {/* The Plasma Body - Medium Glowing Circle */}
                 <motion.div 
                   animate={{
                     scale: isSpeaking ? [1, 1.15, 1] : 1
                   }}
                   className="absolute w-32 h-32 rounded-full bg-white shadow-[0_0_60px_rgba(255,255,255,0.4)]"
                   style={{
                     boxShadow: `0 0 40px ${MOODS.find(m => m.id === selectedVoice)?.accent || "#06b6d4"}99`
                   }}
                 />

                 {/* Internal Neural Pulse */}
                 <AnimatePresence>
                   {isSpeaking && (
                     <motion.div
                       initial={{ scale: 0.2, opacity: 0 }}
                       animate={{ scale: 1.5, opacity: 0 }}
                       transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                       className="absolute w-full h-full rounded-full border-2 border-white/30"
                     />
                   )}
                 </AnimatePresence>
                 
              </motion.div>

              {/* Expressive Eyes Overlay (Top Layer) */}
              {isConnected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-20 pointer-events-none" style={{ transform: "translateZ(100px)" }}>
                    <div className="flex gap-12">
                      <motion.div 
                        animate={{ 
                          scaleY: isSpeaking ? [1, 0.2, 1.2, 1] : [1, 0.1, 1],
                          height: isSpeaking ? [48, 12, 60, 48] : 48
                        }}
                        transition={{ duration: isSpeaking ? 0.3 : 4, repeat: Infinity, repeatDelay: isSpeaking ? 0 : 2 }}
                        className="w-4 bg-white/90 rounded-full shadow-[0_0_15px_white]"
                      />
                      <motion.div 
                        animate={{ 
                          scaleY: isSpeaking ? [1, 0.2, 1.2, 1] : [1, 0.1, 1],
                          height: isSpeaking ? [48, 12, 60, 48] : 48
                        }}
                        transition={{ duration: isSpeaking ? 0.3 : 4, repeat: Infinity, repeatDelay: isSpeaking ? 0 : 2.1 }}
                        className="w-4 bg-white/90 rounded-full shadow-[0_0_15px_white]"
                      />
                    </div>
                    {/* Mouth Line */}
                    <motion.div 
                       animate={{ 
                         width: isSpeaking ? [20, 60, 40] : 16,
                         height: isSpeaking ? [4, 12, 4] : 4,
                       }}
                       transition={{ duration: 0.2, repeat: Infinity }}
                       className="bg-white/80 rounded-full shadow-[0_0_10px_white]"
                    />
                </div>
              )}

               {/* Spatial Particles */}
               {isConnected && (
                 <div className="absolute inset-0 pointer-events-none">
                    {[0, 1, 2, 3].map(i => (
                      <motion.div
                        key={i}
                        animate={{
                          x: [Math.sin(i) * 100, Math.cos(i) * 200, Math.sin(i) * 100],
                          y: [Math.cos(i) * 100, Math.sin(i) * 200, Math.cos(i) * 100],
                          opacity: [0, 0.6, 0],
                          scale: [0.5, 1.2, 0.5]
                        }}
                        transition={{ duration: 5 + i, repeat: Infinity, ease: "linear" }}
                        className="absolute w-2 h-2 rounded-full bg-white blur-[1px]"
                      />
                    ))}
                 </div>
               )}
            </div>

            {/* Kinetic Outer Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                <motion.div
                   animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                   transition={{ rotate: { duration: 30, repeat: Infinity, ease: "linear" }, scale: { duration: 5, repeat: Infinity } }}
                   className={cn(
                     "border border-white/40 rounded-full absolute",
                     deviceType === "tv" ? "w-[500px] h-[500px]" : "w-[380px] h-[380px] md:w-[450px] md:h-[450px]"
                   )}
                />
            </div>
          </motion.div>
        </div>

        <div className="text-center mb-12 h-32 px-4 relative">
          <AnimatePresence mode="wait">
            {isConnected && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto"
              >
                  <div className="flex flex-col items-center gap-4">
                     <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                        <motion.div 
                          animate={{ scale: [1, 1.4, 1] }} 
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-cyan-400" 
                        />
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">HD Live Core Active</span>
                     </div>
                     
                     <div className="h-12 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                          {isSpeaking && transcript.length > 0 && (
                            <motion.p 
                              key={transcript.length}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-white/30 text-[10px] font-medium leading-relaxed line-clamp-2 max-w-xs"
                            >
                              {transcript[transcript.length-1].text}
                            </motion.p>
                          )}
                          {!isSpeaking && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-white/20 text-[11px] uppercase font-bold tracking-[0.4em]"
                            >
                              Listening Smoothly...
                            </motion.p>
                          )}
                        </AnimatePresence>
                     </div>
                  </div>
              </motion.div>
            )}

            {!isConnected && isConnectingLocal && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="flex gap-1 mb-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                    />
                  ))}
                </div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.3em] animate-pulse">Launching System...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      )}

      <div className="w-full pb-12" />
    </div>
  );
}
