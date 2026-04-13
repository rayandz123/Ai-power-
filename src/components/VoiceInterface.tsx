import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Settings2, ArrowLeft, Info, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLiveAPI } from "../lib/useLiveAPI";
import { cn } from "../lib/utils";

const MOODS = [
  { id: "Zephyr", label: "Voice Alpha" },
  { id: "Puck", label: "Voice Beta" },
  { id: "Charon", label: "Voice Gamma" },
  { id: "Kore", label: "Voice Delta" },
];

interface VoiceInterfaceProps {
  onBack: () => void;
  deviceType?: "mobile" | "tv" | "desktop";
}

export function VoiceInterface({ onBack, deviceType = "desktop" }: VoiceInterfaceProps) {
  const { isConnected, isSpeaking, volume, connect, disconnect, toggleMute, isMuted, voice, error } = useLiveAPI();
  const [showSettings, setShowSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("Zephyr");
  const [gestureType, setGestureType] = useState<"none" | "talking" | "singing" | "explaining">("none");
  const [avatarState, setAvatarState] = useState<"face" | "circle">("face");
  const startButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Alternate between face and glowing circle every 10 seconds if connected
    if (isConnected) {
      const interval = setInterval(() => {
        setAvatarState(prev => prev === "face" ? "circle" : "face");
      }, 10000);
      return () => clearInterval(interval);
    } else {
      setAvatarState("face");
    }
  }, [isConnected]);

  useEffect(() => {
    if (isSpeaking) {
      // Determine gesture type based on volume and randomness
      const timer = setInterval(() => {
        const rand = Math.random();
        if (volume > 0.6) setGestureType("singing");
        else if (rand > 0.7) setGestureType("explaining");
        else setGestureType("talking");
      }, 2000);
      return () => clearInterval(timer);
    } else {
      setGestureType("none");
    }
  }, [isSpeaking, volume]);

  useEffect(() => {
    // Auto-focus the start button for TV remote support
    if (!isConnected && !showSettings) {
      startButtonRef.current?.focus();
    }
  }, [isConnected, showSettings]);

  useEffect(() => {
    // Removed first-time prompt logic as requested
  }, []);

  const [isNight, setIsNight] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Wake word detection setup
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !isConnected && !isNight) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ar-SA';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('')
          .toLowerCase();

        // Wake words: "ليو", "يا ليو", "leo"
        if (transcript.includes('ليو') || transcript.includes('leo')) {
          if (!isConnected) {
            playStartSound();
            connect(selectedVoice);
            recognitionRef.current.stop();
          }
        }
      };

      recognitionRef.current.onend = () => {
        if (!isConnected && !isNight && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
      };

      try {
        recognitionRef.current.start();
      } catch (e) {}
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [isConnected, isNight, selectedVoice]);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      // Sleep starts at 23:20 and ends at 10:00 AM
      const isSleeping = (hour > 23 || (hour === 23 && minute >= 20)) || (hour < 10);
      setIsNight(isSleeping);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const playStartSound = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + start + duration);
      
      gain.gain.setValueAtTime(0, audioCtx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + start + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(audioCtx.currentTime + start);
      osc.stop(audioCtx.currentTime + start + duration);
    };

    // Beautiful "magical" chime
    playTone(440, 0, 0.6);
    playTone(659.25, 0.1, 0.6);
    playTone(880, 0.2, 0.6);
  };

  const toggleConnection = () => {
    if (isConnected) {
      disconnect();
    } else {
      if (isNight) return; // Prevent connection during sleep
      playStartSound();
      connect(selectedVoice);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-4xl mx-auto p-6 relative">
      {/* Dynamic Background */}
      <motion.div
        animate={{
          backgroundColor: isSpeaking ? "rgba(6, 182, 212, 0.15)" : "rgba(0, 0, 0, 0)",
        }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Back Button - Standardized */}
      <div className="absolute top-4 left-4 z-[100]">
        <button
          onClick={() => {
            if (isConnected) disconnect();
            onBack();
          }}
          className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xl text-white/50 hover:text-white hover:bg-white/20 transition-all border border-white/20 shadow-xl"
          title="العودة للرئيسية"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <AnimatePresence>
          {showSettings && !isConnected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-0 top-0 z-[30] bg-black/90 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl flex flex-col items-center max-w-md mx-auto will-change-transform"
            >
              <h3 className="text-white/90 text-xl font-bold mb-6 text-center tracking-tight">Select Voice Tone</h3>
              
              <div className="flex flex-col gap-3 w-full">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedVoice(m.id);
                      setShowSettings(false);
                    }}
                    className={cn(
                      "py-4 px-6 rounded-xl text-base font-bold transition-all border flex items-center justify-between focus:outline-none will-change-transform",
                      selectedVoice === m.id
                        ? "bg-white text-black border-white shadow-lg"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                    )}
                  >
                    <span>{m.label}</span>
                    {selectedVoice === m.id && <div className="w-2 h-2 bg-black rounded-full" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Visualizer - Character Avatar */}
        <div className={cn(
          "relative flex items-center justify-center transition-all duration-700",
          deviceType === "tv" ? "w-[45rem] h-[45rem] mb-16" : "w-80 h-80 md:w-[35rem] md:h-[35rem] mb-12"
        )}>
          {/* Main Character Body/Head Container */}
          <motion.div 
            animate={{
              y: isSpeaking ? [0, -35, 5, -25, 0] : [0, -15, 0],
              rotate: isSpeaking ? [-2, 2, -1, 3, 0] : [0, 0, 0],
              scale: isSpeaking ? [1, 1.08, 1] : 1,
            }}
            transition={{ 
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative z-10 flex flex-col items-center justify-center"
          >
            {/* Core Energy Field (Amorphous Glow) */}
            <motion.div
              animate={{
                opacity: isConnected ? (isSpeaking ? [0.3, 0.5, 0.3] : 0.2) : 0.1,
                scale: isConnected ? (isSpeaking ? [1, 1.2, 1] : 1.05) : 0.9,
                rotate: [0, 360],
                backgroundColor: isConnected ? "#00d2ff" : "#003366"
              }}
              transition={{ 
                opacity: { duration: 3, repeat: Infinity },
                scale: { duration: 4, repeat: Infinity },
                rotate: { duration: 30, repeat: Infinity, ease: "linear" }
              }}
              className="absolute w-80 h-80 blur-[100px] pointer-events-none rounded-full will-change-[opacity,transform]"
            />
            {/* Hands - Left */}
            <AnimatePresence>
              {isSpeaking && gestureType !== "none" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, x: 0, rotate: 0 }}
                  animate={{
                    opacity: 1,
                    scale: gestureType === "singing" ? 1.2 : 1,
                    x: deviceType === "tv" ? -180 : -140,
                    y: gestureType === "singing" ? [0, -60, 20, -40, 0] : [0, -30, 10, -20, 0],
                    rotate: gestureType === "singing" ? [-40, -80, -20, -60, -40] : [-20, -45, -15, -35, -20],
                  }}
                  exit={{ opacity: 0, scale: 0.5, x: 0 }}
                  transition={{ 
                    opacity: { duration: 0.5 },
                    scale: { duration: 0.5 },
                    y: { duration: gestureType === "singing" ? 3 : 5, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: gestureType === "singing" ? 2.5 : 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className={cn(
                    "absolute bg-gradient-to-b from-cyan-400/60 to-cyan-600/10 border border-cyan-300/60 rounded-full blur-[0.5px] shadow-[0_0_40px_rgba(6,182,212,0.6)]",
                    deviceType === "tv" ? "w-16 h-28" : "w-12 h-20"
                  )}
                />
              )}
            </AnimatePresence>

            {/* Hands - Right */}
            <AnimatePresence>
              {isSpeaking && gestureType !== "none" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, x: 0, rotate: 0 }}
                  animate={{
                    opacity: 1,
                    scale: gestureType === "singing" ? 1.2 : 1,
                    x: deviceType === "tv" ? 180 : 140,
                    y: gestureType === "singing" ? [0, -50, 30, -30, 0] : [0, -25, 15, -15, 0],
                    rotate: gestureType === "singing" ? [40, 70, 10, 50, 40] : [20, 40, 10, 30, 20],
                  }}
                  exit={{ opacity: 0, scale: 0.5, x: 0 }}
                  transition={{ 
                    opacity: { duration: 0.5 },
                    scale: { duration: 0.5 },
                    y: { duration: gestureType === "singing" ? 3.2 : 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 },
                    rotate: { duration: gestureType === "singing" ? 2.8 : 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }
                  }}
                  className={cn(
                    "absolute bg-gradient-to-b from-cyan-400/60 to-cyan-600/10 border border-cyan-300/60 rounded-full blur-[0.5px] shadow-[0_0_40px_rgba(6,182,212,0.6)]",
                    deviceType === "tv" ? "w-16 h-28" : "w-12 h-20"
                  )}
                />
              )}
            </AnimatePresence>

            {/* Avatar Content: Alternates between Face and Glowing Circle */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {isNight && !isConnected ? (
                  <motion.div
                    key="night"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="flex gap-8">
                      <div className="w-6 h-1 bg-white/10 rounded-full" />
                      <div className="w-6 h-1 bg-white/10 rounded-full" />
                    </div>
                    <div className="text-[10px] text-white/20 font-black tracking-widest uppercase mt-4">Sleeping...</div>
                  </motion.div>
                ) : avatarState === "face" ? (
                  <motion.div
                    key="face"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className={cn("flex flex-col items-center", deviceType === "tv" ? "gap-14" : "gap-8")}
                  >
                    <div className={cn("flex", deviceType === "tv" ? "gap-28" : "gap-14")}>
                      {/* Left Eye */}
                      <motion.div 
                        animate={{ 
                          scaleY: isConnected ? (isSpeaking ? [1, 0.1, 1] : 1) : 0.05,
                          scaleX: isConnected ? 1 : 1.5,
                          backgroundColor: isConnected ? "#00d2ff" : "#004488",
                          boxShadow: isConnected ? "0 0 30px #00d2ff" : "0 0 10px #004488"
                        }}
                        transition={{ 
                          scaleY: { duration: 0.25, repeat: isSpeaking ? Infinity : 0, repeatDelay: 4 },
                          backgroundColor: { duration: 0.5 }
                        }}
                        className={cn(
                          "rounded-full will-change-transform",
                          deviceType === "tv" ? "w-12 h-12" : "w-7 h-7"
                        )} 
                      />
                      {/* Right Eye */}
                      <motion.div 
                        animate={{ 
                          scaleY: isConnected ? (isSpeaking ? [1, 0.1, 1] : 1) : 0.05,
                          scaleX: isConnected ? 1 : 1.5,
                          backgroundColor: isConnected ? "#00d2ff" : "#004488",
                          boxShadow: isConnected ? "0 0 30px #00d2ff" : "0 0 10px #004488"
                        }}
                        transition={{ 
                          scaleY: { duration: 0.25, repeat: isSpeaking ? Infinity : 0, repeatDelay: 4.2 },
                          backgroundColor: { duration: 0.5 }
                        }}
                        className={cn(
                          "rounded-full will-change-transform",
                          deviceType === "tv" ? "w-12 h-12" : "w-7 h-7"
                        )} 
                      />
                    </div>
                    
                    {/* Mouth */}
                    <motion.div 
                      animate={{ 
                        width: isConnected ? (isSpeaking ? (deviceType === "tv" ? [120, 160, 120] : [60, 80, 60]) : (deviceType === "tv" ? 120 : 60)) : 30,
                        height: isConnected ? (isSpeaking ? (deviceType === "tv" ? [14, 30, 14] : [10, 20, 10]) : (deviceType === "tv" ? 14 : 10)) : 2,
                        opacity: isConnected ? 0.8 : 0.3,
                        backgroundColor: isConnected ? "#00d2ff" : "#004488",
                        boxShadow: isConnected ? "0 0 30px #00d2ff" : "0 0 10px #004488"
                      }}
                      transition={{ duration: 0.2 }}
                      className="rounded-full will-change-[width,height,transform]"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="circle"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                      opacity: 1, 
                      scale: isSpeaking ? [1, 1.2, 1] : 1,
                      boxShadow: isSpeaking ? "0 0 60px #00d2ff" : "0 0 30px #00d2ff"
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className={cn(
                      "rounded-full border-4 border-[#00d2ff] bg-transparent",
                      deviceType === "tv" ? "w-48 h-48" : "w-32 h-32"
                    )}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Background Aura */}
          <motion.div
            animate={{
              scale: isSpeaking ? [1, 1.3, 1] : 1,
              opacity: isSpeaking ? [0.1, 0.2, 0.1] : 0.05
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none will-change-[opacity,transform]"
          />
        </div>

        <div className="text-center mb-12 h-24">
          <AnimatePresence mode="wait">
            {isConnected ? (
              <motion.div
                key="connected"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center space-y-2"
              >
                <p className="text-white/90 text-xl font-medium">
                  {isSpeaking ? "AI IS SPEAKING..." : "LISTENING..."}
                </p>
                <p className="text-white/50 text-sm">تحدث بحرية.. نحن نسمعك!</p>
              </motion.div>
            ) : (
              <motion.div
                key="disconnected"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center space-y-2"
              >
                <p className="text-white/70 text-lg">
                  {isNight ? "ليو نائم الآن" : "نادي 'يا ليو' للبدء"}
                </p>
                <p className="text-white/40 text-xs max-w-[280px]">
                  {isNight 
                    ? "سيعود ليو في الصباح (10:00 AM) للمحادثة الصوتية." 
                    : "استمتع بتجربة محادثة صوتية فورية بمجرد مناداة ليو باسمه."}
                </p>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs text-center max-w-[280px] backdrop-blur-md"
                  >
                    <p className="font-bold mb-1 flex items-center justify-center gap-2">
                      <Info className="w-3 h-3" />
                      عذراً، حدث خطأ في الاتصال
                    </p>
                    <p className="opacity-80 leading-relaxed">
                      {error.toLowerCase().includes("quota") 
                        ? "لقد تجاوزت حد الاستخدام المجاني المسموح به حالياً. يرجى المحاولة مرة أخرى بعد قليل أو التحقق من مفتاح API الخاص بك." 
                        : "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-12 w-full pb-12 relative z-10">
        <button
          onClick={toggleMute}
          disabled={!isConnected}
          className={cn(
            "p-6 rounded-full transition-all border disabled:opacity-0 disabled:pointer-events-none",
            isMuted 
              ? "bg-rose-500 text-white border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.5)]" 
              : "bg-white/10 text-white border-white/20 hover:bg-white/20"
          )}
          title={isMuted ? "إلغاء الكتم" : "كتم الميكروفون"}
        >
          {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>
      </div>
    </div>
  );
}
