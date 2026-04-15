import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Settings2, ArrowLeft, Info, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLiveAPI } from "../lib/useLiveAPI";
import { cn } from "../lib/utils";
import { WeatherWidget } from "./WeatherWidget";

const MOODS = [
  { id: "Zephyr", label: "Voice Alpha" },
  { id: "Puck", label: "Voice Beta" },
  { id: "Charon", label: "Voice Gamma" },
  { id: "Kore", label: "Voice Delta" },
];

interface VoiceInterfaceProps {
  onBack: () => void;
  deviceType?: "mobile" | "tv" | "desktop";
  liveAPI: any;
}

export function VoiceInterface({ onBack, deviceType = "desktop", liveAPI }: VoiceInterfaceProps) {
  const { 
    isConnected, isSpeaking, volume, connect, disconnect, toggleMute, isMuted, voice, error, 
    weatherData, setWeatherData, gestureType, setGestureType, handStyle, setHandStyle 
  } = liveAPI;
  const [showSettings, setShowSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("Zephyr");
  const [avatarState, setAvatarState] = useState<"face" | "circle">("face");
  const startButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Avatar is always face now, removed circle alternation
    setAvatarState("face");
  }, [isConnected]);

  useEffect(() => {
    if (isSpeaking) {
      // Determine gesture type and hand style based on volume and randomness
      const timer = setInterval(() => {
        const rand = Math.random();
        
        // Cycle hand styles
        if (rand > 0.8) setHandStyle(prev => prev === "robotic" ? "holographic" : prev === "holographic" ? "plasma" : "robotic");

        // Determine gesture
        if (volume > 0.7) setGestureType("singing");
        else if (rand > 0.9) setGestureType("heart");
        else if (rand > 0.8) setGestureType("star");
        else if (rand > 0.7) setGestureType("square");
        else if (rand > 0.6) setGestureType("circle");
        else if (rand > 0.4) setGestureType("explaining");
        else setGestureType("talking");
      }, 2500);
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
    // Cleanup on unmount: turn off mic and avatar
    return () => {
      disconnect();
    };
  }, [disconnect]);

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
            connect(selectedVoice);
            if (recognitionRef.current) recognitionRef.current.stop();
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
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      
      const playTone = (freq: number, start: number, duration: number) => {
        try {
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
        } catch (e) {
          console.error("Error playing tone:", e);
        }
      };

      // Beautiful "magical" chime
      playTone(440, 0, 0.6);
      playTone(659.25, 0.1, 0.6);
      playTone(880, 0.2, 0.6);

      // Close context after playing
      setTimeout(() => {
        if (audioCtx.state !== 'closed') {
          audioCtx.close().catch(() => {});
        }
      }, 1000);
    } catch (e) {
      console.error("Error in playStartSound:", e);
    }
  };

  const toggleConnection = () => {
    if (isConnected) {
      disconnect();
    } else {
      if (isNight) return; // Prevent connection during sleep
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

      {/* Back Button and Controls - Standardized at top */}
      <div className="absolute top-4 left-4 right-4 z-[100] flex items-center justify-between">
        <button
          onClick={() => {
            disconnect();
            onBack();
          }}
          className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xl text-white/50 hover:text-white hover:bg-white/20 transition-all border border-white/20 shadow-xl"
          title="العودة للرئيسية"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            disabled={isConnected}
            className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xl text-white/50 hover:text-white hover:bg-white/20 transition-all border border-white/20 shadow-xl disabled:opacity-0"
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
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
              y: isSpeaking ? [0, -15, 5, -10, 0] : [0, -10, 0],
              rotate: isSpeaking ? [-1, 1, -0.5, 1.5, 0] : [0, 0, 0],
              scale: isSpeaking ? [1, 1.04, 1] : 1,
            }}
            transition={{ 
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
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
                ) : (
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
                          scaleY: { duration: 0.2, repeat: isSpeaking ? Infinity : 0, repeatDelay: 3 + Math.random() * 2 },
                          backgroundColor: { duration: 0.3 }
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
                          scaleY: { duration: 0.2, repeat: isSpeaking ? Infinity : 0, repeatDelay: 3.2 + Math.random() * 2 },
                          backgroundColor: { duration: 0.3 }
                        }}
                        className={cn(
                          "rounded-full will-change-transform",
                          deviceType === "tv" ? "w-12 h-12" : "w-7 h-7"
                        )} 
                      />
                    </div>
                    
                    {/* Mouth - Highly synchronized with volume and smoother transitions */}
                    <motion.div 
                      animate={{ 
                        width: isConnected 
                          ? (isSpeaking 
                              ? (deviceType === "tv" ? 120 + volume * 80 : 60 + volume * 40) 
                              : (deviceType === "tv" ? 120 : 60)) 
                          : 30,
                        height: isConnected 
                          ? (isSpeaking 
                              ? (deviceType === "tv" ? 14 + volume * 60 : 10 + volume * 35) 
                              : (deviceType === "tv" ? 14 : 10)) 
                          : 2,
                        borderRadius: isSpeaking ? "35%" : "50%",
                        opacity: isConnected ? 0.9 + volume * 0.1 : 0.3,
                        backgroundColor: isConnected ? "#00d2ff" : "#004488",
                        boxShadow: isConnected 
                          ? `0 0 ${25 + volume * 50}px #00d2ff` 
                          : "0 0 10px #004488"
                      }}
                      transition={{ 
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        mass: 0.4
                      }}
                      className="will-change-[width,height,transform,box-shadow,border-radius]"
                    />
                  </motion.div>
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
                      {error === "API_KEY_MISSING" 
                        ? "مفتاح API مفقود. يرجى التأكد من إعداد المفتاح بشكل صحيح." 
                        : error === "MICROPHONE_NOT_SUPPORTED"
                        ? "الميكروفون غير مدعوم في هذا المتصفح أو الجهاز."
                        : error === "LIVE_API_NOT_AVAILABLE"
                        ? "خدمة المحادثة المباشرة غير متوفرة حالياً."
                        : error.toLowerCase().includes("quota") 
                        ? "لقد تجاوزت حد الاستخدام المجاني المسموح به حالياً. يرجى المحاولة مرة أخرى بعد قليل." 
                        : "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-center w-full pb-12 relative z-10">
        <AnimatePresence>
          {isConnected && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={toggleMute}
              className={cn(
                "p-3 rounded-full transition-all border shadow-lg flex items-center justify-center",
                isMuted 
                  ? "bg-rose-500 text-white border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]" 
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              )}
              title={isMuted ? "إلغاء الكتم" : "كتم الميكروفون"}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
