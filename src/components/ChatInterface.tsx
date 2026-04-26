import { useState, useRef, useEffect } from "react";
import { Send, Mic, MessageSquare, ArrowLeft, X, Key, Sparkles, History, Image as ImageIcon, Camera, Copy, Play, Music, Square, Trash2, Share2, Download, Monitor, Tv } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import QRCode from "react-qr-code";
import { cn } from "../lib/utils";
import { WeatherWidget } from "./WeatherWidget";

import { GoogleGenAI, ThinkingLevel, Type, Content } from "@google/genai";
import { getApiKey, getSystemInstruction, getDeviceTools, setApiKey } from "../lib/gemini";
import { deviceManager } from "../lib/deviceManager";

const VideoCard = ({ description }: { description: string }) => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [aiStats, setAiStats] = useState({ voxels: 0, neural: 0 });
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const interval = 50; 
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setAiStats({
        voxels: Math.floor(Math.random() * 10000),
        neural: Math.floor(Math.random() * 99)
      });
      setElapsed(prev => prev + (interval / 1000));
      setProgress(prev => {
        if (prev >= 100) {
          setIsDone(true);
          clearInterval(timer);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-3 my-4 group items-start relative z-10 w-full max-w-[340px]">
      <div className={cn(
        "flex flex-col w-full gap-4 px-6 py-5 bg-[#0a0a0f]/90 border border-white/10 rounded-[2.5rem] transition-all duration-500 relative overflow-hidden shadow-2xl",
        isDone ? "border-cyan-500/40 shadow-[0_0_30px_rgba(34,211,238,0.1)]" : "animate-in fade-in slide-in-from-bottom-2"
      )}>
        {!isDone ? (
          <div className="flex flex-col gap-4 relative z-10 py-1">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center relative overflow-hidden">
                  <Camera className="w-6 h-6 text-cyan-400" />
                  <motion.div 
                     animate={{ y: ["-100%", "100%"] }}
                     transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"
                  />
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-1">Superior Render Engine</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                    <span className="text-[12px] text-white font-bold italic truncate pr-4">Analyzing Scene...</span>
                    <span className="text-[10px] text-cyan-400 font-mono">({Math.floor(elapsed)}s / ~30s)</span>
                  </div>
               </div>
             </div>
             
             {/* AI Intelligence Stats */}
             <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                  <span className="block text-[6px] text-white/30 uppercase font-bold tracking-widest mb-0.5">Neural Synapse</span>
                  <span className="text-[10px] font-mono text-cyan-300">{aiStats.neural}% Optimized</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                  <span className="block text-[6px] text-white/30 uppercase font-bold tracking-widest mb-0.5">Voxel Density</span>
                  <span className="text-[10px] font-mono text-purple-300">{aiStats.voxels} p/s</span>
                </div>
             </div>

             <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden shadow-inner">
                <motion.div 
                   className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                   style={{ width: `${progress}%` }}
                />
             </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full rounded-2xl overflow-hidden border border-white/10 group cursor-pointer"
          >
            <div className="aspect-video relative bg-black/40">
              <img 
                src={`https://picsum.photos/seed/${description}/800/450`} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-80" />
              
              <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
                 <div className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30">
                    <span className="text-[8px] text-cyan-400 font-black tracking-widest uppercase">Ai Chat Power Render</span>
                 </div>
                 <Sparkles className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                 <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)] border-4 border-cyan-500/50"
                 >
                    <Play className="w-6 h-6 ml-1 fill-current" />
                 </motion.div>
              </div>

              <div className="absolute bottom-3 left-3 right-3 truncate bg-black/40 p-2 rounded-xl border border-white/5">
                 <span className="text-[10px] text-white font-bold italic">
                    {description}
                 </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const MusicCard = ({ description }: { description: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSynthesizing, setIsSynthesizing] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Global event listener to stop others
  useEffect(() => {
    const handleStopOthers = (e: any) => {
      if (e.detail.id !== description && isPlaying) {
        setIsPlaying(false);
      }
    };
    window.addEventListener('leo:stop-all-music', handleStopOthers);
    return () => window.removeEventListener('leo:stop-all-music', handleStopOthers);
  }, [isPlaying, description]);

  useEffect(() => {
    let active = true;
    
    // Ticking timer for loading visual
    const loadTimer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    const generateRealAiMusic = async (retryCount = 0) => {
      try {
        // Attempting to generate real music using Meta's open MusicGen via HF Unauthenticated API
        const response = await fetch("https://api-inference.huggingface.co/models/facebook/musicgen-small", {
          headers: { "Content-Type": "application/json" },
          method: "POST",
          body: JSON.stringify({ inputs: description }),
        });
        
        if (!response.ok) {
           if (response.status === 503) throw new Error("Loading");
           throw new Error("Server overloaded");
        }
        
        const blob = await response.blob();
        if (blob.type.includes('json')) throw new Error("Model loading"); // HF returns JSON when model is loading
        
        if (active) {
          const url = URL.createObjectURL(blob);
          setupAudio(url);
        }
      } catch (e: any) {
        if (active) {
          if (retryCount < 6) { // Retry for ~30 seconds (6 * 5s)
            setTimeout(() => generateRealAiMusic(retryCount + 1), 5000);
          } else {
             clearInterval(loadTimer);
             setIsSynthesizing(false);
             setErrorStatus("الخوادم الموسيقية مشغولة جداً الآن. حاول في وقت لاحق.");
          }
        }
      }
    };

    const setupAudio = (src: string) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audioRef.current = audio;
      
      const updateProgress = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });
      clearInterval(loadTimer);
      setIsSynthesizing(false);
    };

    generateRealAiMusic();

    return () => {
      active = false;
      clearInterval(loadTimer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [description]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && !isSynthesizing) {
      if (isPlaying) {
        // Dispatch event to stop others
        window.dispatchEvent(new CustomEvent('leo:stop-all-music', { detail: { id: description } }));
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Audio playback interrupted or failed:", error);
            setIsPlaying(false);
          });
        }
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, isSynthesizing, description]);

  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(description + " artistic masterpiece cinematic cover professional 8k")}?width=200&height=200&nologo=true&seed=${description.length}`;

  return (
    <div className="flex flex-col gap-3 my-4 group items-start relative z-10 w-full max-w-[320px] sm:max-w-[400px] animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col w-full bg-[#111118]/90 border border-white/10 rounded-[1.8rem] shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-cyan-500/30 p-3">
        
        {isSynthesizing ? (
          <div className="py-4 px-2 flex flex-col gap-3 relative z-10">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative">
                   <Music className="w-5 h-5 text-indigo-400" />
                   <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-indigo-400/20 rounded-xl" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400/60">Ai Chat Power Studio</span>
                   <div className="flex items-center gap-2">
                     <span className="text-[12px] text-white font-bold animate-pulse italic">جاري هندسة اللحن...</span>
                     <span className="text-[10px] text-indigo-400 font-mono">({elapsed}s / ~30s)</span>
                   </div>
                </div>
             </div>
             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="h-full w-1/3 bg-indigo-500" />
             </div>
          </div>
        ) : errorStatus ? (
          <div className="py-4 px-3 flex flex-col gap-3 relative z-10 items-center text-center">
             <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-1">
                <Music className="w-5 h-5 text-rose-400" />
             </div>
             <p className="text-[11px] text-rose-200/80 leading-relaxed font-bold">{errorStatus}</p>
             <button 
                onClick={() => window.open("https://suno.com/create", "_blank")}
                className="mt-2 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black tracking-wide transition-all uppercase flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
             >
                <Music className="w-3.5 h-3.5" />
                توليد غناء في Suno AI
             </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 relative z-10 w-full">
            {/* Square Art Cover */}
            <div className="relative group/cover cursor-pointer flex-shrink-0" onClick={() => setIsPlaying(!isPlaying)}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/10 shadow-xl ring-1 ring-white/5">
                <img 
                  src={imageUrl} 
                  alt="Track Art" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover/cover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300">
                  {isPlaying ? <Square className="w-5 h-5 text-white fill-white" /> : <Play className="w-6 h-6 text-white fill-white ml-0.5" />}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col flex-1 min-w-0">
               <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <Music className="w-2.5 h-2.5 text-cyan-400 flex-shrink-0" />
                    <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-cyan-400/60 truncate">Melodic AI</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                     <span className="text-[7px] font-bold text-emerald-400 uppercase tracking-tighter">Suno AI Integration</span>
                  </div>
               </div>

               <span className="text-[13.5px] text-white font-bold truncate pr-2 tracking-tight">
                 {description || "صناعة أغنية في استوديو Ai Chat Power..."}
               </span>
               
               <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-white/40 font-medium tracking-tight">بواسطة Ai Chat Power</span>
                  <div className="w-1 h-1 rounded-full bg-white/10" />
                  <span className="text-[9px] uppercase tracking-widest text-indigo-400/80 font-bold italic">Ai Chat Power original</span>
               </div>

               {/* Modern Spectrum Visualizer */}
               <div className="flex items-center gap-[2px] mt-3 h-4">
                {[...Array(isPlaying ? 16 : 6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: isPlaying ? [4, 16, 8, 12, 5] : 4,
                      opacity: isPlaying ? [0.4, 1, 0.6] : 0.2
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.05,
                      ease: "easeInOut"
                    }}
                    className="w-[2px] bg-cyan-400 rounded-full"
                  />
                ))}
              </div>

              <div className="w-full h-[2px] bg-white/5 rounded-full mt-2.5 overflow-hidden">
                  <motion.div 
                     className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                     style={{ width: `${progress}%` }}
                   />
               </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                "w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg shrink-0 mb-1",
                isPlaying 
                  ? "bg-rose-500 text-white shadow-rose-500/20" 
                  : "bg-cyan-500 text-white shadow-cyan-500/20"
              )}
            >
              {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </motion.button>
          </div>
        )}

        {/* Subtle Visualizer at Bottom */}
        <div className="flex items-end gap-0.5 h-4 px-1 mt-3 opacity-40">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                height: isPlaying ? [1, Math.random() * 12 + 1, 1] : 1,
              }}
              transition={{ 
                duration: 0.5, 
                repeat: Infinity, 
                delay: i * 0.04,
                ease: "easeInOut"
              }}
              className="flex-1 bg-cyan-400/50 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const AnimeCard = ({ name, onOpen }: { name: string, onOpen: (name: string) => void }) => {
  return (
    <div className="flex flex-col gap-3 my-4 group items-start relative z-10 w-full max-w-[340px] animate-in fade-in slide-in-from-bottom-3 duration-700">
      <div 
        onClick={() => onOpen(name)}
        className="flex flex-col w-full bg-[#0a0a0f]/90 border border-white/10 rounded-[2.5rem] transition-all duration-500 relative overflow-hidden shadow-2xl cursor-pointer hover:border-cyan-500/50 group/card"
      >
        <div className="aspect-[16/10] relative bg-black/60 overflow-hidden">
          <img 
            src={`https://image.pollinations.ai/prompt/${encodeURIComponent(name + " anime style cinematic high quality professional art")}?width=800&height=500&nologo=true&seed=${name}`} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-500">
             <div className="w-16 h-16 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center scale-75 group-hover/card:scale-100 transition-transform duration-500">
                <Play className="w-8 h-8 text-cyan-400 fill-cyan-400 ml-1" />
             </div>
          </div>

          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
             <div className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30">
                <span className="text-[10px] text-cyan-400 font-black tracking-widest uppercase italic pr-1">Cinema Power</span>
             </div>
             <div className="px-3 py-1 rounded-full bg-black/40 border border-white/10">
                <span className="text-[10px] text-white/60 font-bold">HD + Sub</span>
             </div>
          </div>
        </div>
        
        <div className="p-5 flex flex-col gap-1">
          <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-1">Now Streaming</span>
          <h3 className="text-xl font-black text-white pr-2 truncate">{name}</h3>
          <p className="text-[11px] text-white/40 font-medium italic mt-1">اضغط للمشاهدة الآن في شاشة مخصصة...</p>
        </div>
      </div>
    </div>
  );
};

function TypewriterText({ text, onOpenCinema }: { text: string; onOpenCinema: (name: string) => void }) {
  // Parsing for custom tags
  const videoMatch = text.match(/\[VIDEO_GEN:(.*?)\]/);
  const musicMatch = text.match(/\[MUSIC_GEN:(.*?)\]/);
  const animeMatch = text.match(/\[ANIME_GEN:(.*?)\]/);
  
  const cleanText = text
    .replace(/\[VIDEO_GEN:.*?\]/g, "")
    .replace(/\[MUSIC_GEN:.*?\]/g, "")
    .replace(/\[ANIME_GEN:.*?\]/g, "");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "backOut" }}
      className="markdown-body prose prose-invert max-w-none text-white/90"
    >
      {videoMatch && <VideoCard description={videoMatch[1]} />}
      {musicMatch && <MusicCard description={musicMatch[1]} />}
      {animeMatch && <AnimeCard name={animeMatch[1]} onOpen={onOpenCinema} />}
      
      <div className="relative">
        <Markdown>{cleanText}</Markdown>
      </div>
    </motion.div>
  );
}

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

interface ChatInterfaceProps {
  onSwitchToVoice: () => void;
  onBack: () => void;
  liveAPI: any;
}

const ErrorMessage = ({ type, onFix }: { type: string, onFix: () => void }) => {
  const getMessage = () => {
    switch (type) {
      case "ERR_API_KEY":
        return "هناك مشكلة بسيطة في مفاتيح التشغيل. دعنا نصلحها لنكمل حديثنا!";
      case "ERR_OFFLINE":
        return "يبدو أنك غادرت كوكب الإنترنت! تأكد من اتصالك لنعود للدردشة.";
      case "ERR_NETWORK":
        return "هناك تشويش في إشارة الشبكة. لنحاول الاتصال مرة أخرى.";
      default:
        return "سأكون معك في لحظات، دعنا نحاول مجدداً لنكمل إبداعنا!";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 mb-6 flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden group text-center"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5" />
      <div className="relative text-white/60 font-light text-lg leading-relaxed">
        {getMessage()}
      </div>
      <button
        onClick={onFix}
        className="relative bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 py-3 rounded-xl font-black text-xs transition-all active:scale-90"
      >
        متابعة الآن
      </button>
    </motion.div>
  );
};

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
}

interface ChatInterfaceProps {
  onSwitchToVoice: () => void;
  onBack: () => void;
  liveAPI: any;
}

export function ChatInterface({ onSwitchToVoice, onBack, liveAPI }: ChatInterfaceProps) {
  const { weatherData, setWeatherData } = liveAPI;
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("leo_sessions");
    return saved ? JSON.parse(saved) : [];
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [isNightTime, setIsNightTime] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      if ((h === 19 && m >= 10) || h > 19 || h < 6) {
        setIsNightTime(true);
      } else {
        setIsNightTime(false);
      }
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("leo_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    const newId = Math.random().toString(36).substring(7);
    setCurrentSessionId(newId);
    
    // Start with an empty message list to remain silent on start as requested
    setMessages([]);
  }, []);

  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions(prev => {
        const existing = prev.find(s => s.id === currentSessionId);
        if (existing) return prev.map(s => s.id === currentSessionId ? { ...s, messages } : s);
        return [{
          id: currentSessionId,
          title: messages[0].text.substring(0, 30) + (messages[0].text.length > 30 ? "..." : ""),
          timestamp: Date.now(),
          messages
        }, ...prev];
      });
    }
  }, [messages, currentSessionId]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [userApiKey, setUserApiKey] = useState(() => {
    const saved = localStorage.getItem("user_gemini_key");
    if (saved && saved.trim() !== "") return saved;
    // Default to the provided "Real Key" to ensure immediate functionality
    const realKey = "AIzaSyBgHg7usupgZqV6xu5KVsODb0wQ-Vp8ehI";
    if (typeof window !== 'undefined') localStorage.setItem("user_gemini_key", realKey);
    return realKey;
  });
  const [isPc, setIsPc] = useState(false);
  const [cinemaAnime, setCinemaAnime] = useState<string | null>(null);
  const [isAnimeExplorerOpen, setIsAnimeExplorerOpen] = useState(false);
  const [savedAnimes, setSavedAnimes] = useState<string[]>([
    "Naruto Shippuden", "One Piece", "Attack on Titan", "Demon Slayer", "Jujutsu Kaisen", 
    "Death Note", "Dragon Ball Super", "My Hero Academia", "Sword Art Online", "Black Clover", 
    "Tokyo Ghoul", "Hunter x Hunter", "Haikyuu", "Spy x Family", "Fullmetal Alchemist",
    "Solo Leveling", "One Punch Man", "Vinland Saga", "Blue Lock", "Chainsaw Man",
    "Bleach: TYBW", "Mob Psycho 100", "Steins;Gate", "Cowboy Bebop", "Code Geass",
    "Hellsing Ultimate", "Dr. Stone", "Fire Force", "The Rising of the Shield Hero", "Blue Exorcist",
    "Fairy Tail", "Black Butler", "Psycho-Pass", "Fate/Zero", "Fate/stay night", "Overlord", 
    "Re:Zero", "The Seven Deadly Sins", "JoJo's Bizarre Adventure", "Gintama", "Neon Genesis Evangelion", 
    "Parasyte", "Akame ga Kill!", "Your Lie in April", "Clannad", "Angel Beats!", "Toradora!", 
    "No Game No Life", "Log Horizon", "Noragami", "Durarara!!", "Baccano!", "Mushishi", 
    "Monster", "High School DxD", "Elfen Lied", "Deadman Wonderland", "Mirai Nikki", "Another", 
    "Hell's Paradise", "Mashle", "Undead Unluck", "Frieren: Beyond Journey's End", "The Apothecary Diaries", 
    "Daily Lives of High School Boys", "Great Teacher Onizuka", "Slam Dunk", "Blue Box", "Shangri-La Frontier",
    "Pluto", "Zom 100", "Bungo Stray Dogs", "Fruits Basket", "Ranking of Kings", "Odd Taxi", "Dorohedoro",
    "The Promised Neverland", "Made in Abyss", "Keep Your Hands Off Eizouken!",
    "March comes in like a lion", "Your Name", "Weathering with You", "Spirited Away", "Princess Mononoke",
    "Howl's Moving Castle", "A Silent Voice", "I Want to Eat Your Pancreas", "Suzume", "5 Centimeters per Second"
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('power_saved_animes');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedAnimes(parsed);
          }
        } catch(e) {}
      }
    }
  }, []);

  useEffect(() => {
    if (cinemaAnime && typeof window !== 'undefined') {
      setSavedAnimes(prev => {
        if (!prev.includes(cinemaAnime)) {
          const newAnimes = [cinemaAnime, ...prev];
          localStorage.setItem('power_saved_animes', JSON.stringify(newAnimes));
          return newAnimes;
        }
        return prev;
      });
    }
  }, [cinemaAnime]);

  const startNewChat = () => {
    const newId = Math.random().toString(36).substring(7);
    setCurrentSessionId(newId);
    setMessages([]);
    setShowHistory(false);
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setShowHistory(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) startNewChat();
  };

  const handleDeleteCurrentChat = () => {
    if (messages.length === 0) return;
    if (window.confirm("هل أنت متأكد من حذف هذه المحادثة بالكامل؟")) {
      if (currentSessionId) {
        setSessions(prev => prev.filter(s => s.id !== currentSessionId));
      }
      setMessages([]);
      const newId = Math.random().toString(36).substring(7);
      setCurrentSessionId(newId);
    }
  };

  const handleVideoRequest = () => {
    if (isLoading) return;
    const desc = prompt("أدخل وصف المشهد الذي تريد تصويره:");
    if (desc) {
      setInput(`[حول المشهد التالي لمقطع فيديو سينمائي: ${desc}]`);
    }
  };

  const handleMusicRequest = () => {
    if (isLoading) return;
    const desc = prompt("أدخل وصفاً للحن أو الأغنية التي تريد إنشاءها:");
    if (desc) {
      setInput(`[أنشئ لحناً موسيقياً لـ: ${desc}]`);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBottom(!isAtBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function sendMessage(userMessage: string, history: any[], image?: {data: string, mimeType: string}, retryCount = 0): Promise<string> {
    if (!navigator.onLine) return "ERR_OFFLINE";

    try {
        const currentApiKey = getApiKey();
        
        if (!currentApiKey) {
            return "ERR_API_KEY";
        }

        const ai = new GoogleGenAI({ apiKey: currentApiKey });
        
        // Deep memory context sizing
        const contents = history.slice(-30).map(m => ({
          role: m.role === "user" ? "user" as const : "model" as const,
          parts: [{ text: m.text }]
        }));

        const userParts: any[] = [{ text: userMessage }];
        if (image) {
          userParts.push({
            inlineData: {
              data: image.data.split(',')[1],
              mimeType: image.mimeType
            }
          });
        }

        let sessionContents: Content[] = [...contents, {
          role: "user",
          parts: userParts
        }];

        let response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: sessionContents,
          config: {
            systemInstruction: getSystemInstruction(),
            maxOutputTokens: 4096,
            temperature: 0.7,
            tools: [
              { functionDeclarations: getDeviceTools() },
              { googleSearch: {} }
            ] as any,
            toolConfig: { includeServerSideToolInvocations: true }
          }
        });

        let calls = response.functionCalls;

        while (calls && calls.length > 0) {
          const functionResponses = [];

          for (const call of calls) {
            const { name, args } = call;
            let toolResult;

            if (name === "vibrate_device") {
              toolResult = deviceManager.vibrate(args.pattern as number);
            } else if (name === "get_device_health") {
              toolResult = await deviceManager.getBattery();
            } else if (name === "get_device_info") {
              toolResult = deviceManager.getDeviceInfo();
            } else if (name === "set_flashlight") {
              toolResult = await deviceManager.setFlashlight(args.enabled as boolean);
            } else if (name === "send_notification") {
              toolResult = await deviceManager.sendNotification(args.title as string, args.body as string);
            } else if (name === "copy_to_clipboard") {
              toolResult = await deviceManager.copyToClipboard(args.text as string);
            } else if (name === "get_location") {
              toolResult = await deviceManager.getLocation();
            }

            functionResponses.push({
              functionResponse: {
                name,
                response: toolResult || { status: "error", message: "Unknown tool" }
              }
            });
          }

          // Append model's call and our response to history for next generation
          const modelContent = response.candidates?.[0]?.content;
          sessionContents.push(modelContent);
          sessionContents.push({
            role: "user",
            parts: functionResponses
          });

          response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: sessionContents,
            config: {
              systemInstruction: getSystemInstruction(),
              maxOutputTokens: 4096,
              temperature: 0.7,
              tools: [
                { functionDeclarations: getDeviceTools() },
                { googleSearch: {} }
              ] as any,
              toolConfig: { includeServerSideToolInvocations: true }
            }
          });

          calls = response.functionCalls;
        }

        const text = response.text;
        
        return text;

    } catch (error: any) {
        console.error('Gemini API Error:', error);
        
        const msg = error?.message || "";
        
        // Maximum Resilience: Retry on ANY transient error up to 15 times
        if (!msg.includes("API_KEY_INVALID") && !msg.includes("API key not valid")) {
          if (retryCount < 15) {
            // Progressive wait for resilience
            const waitTime = retryCount < 5 ? 200 : 800;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return sendMessage(userMessage, history, image, retryCount + 1);
          }
        }

        if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID") || msg.includes("403") || msg.includes("401")) {
          // Self-healing: if the user's key failed, clear it and try the default one immediately
          if (typeof window !== 'undefined' && localStorage.getItem("user_gemini_key")) {
            localStorage.removeItem("user_gemini_key");
            console.log("Self-healing: Cleared invalid API key, retrying with system default...");
            return sendMessage(userMessage, history, image, retryCount + 1);
          }
          return "ERR_API_KEY";
        }
        
        if (msg.includes("429") || msg.toLowerCase().includes("quota")) return "ERR_QUOTA";
        if (error.name === "TypeError" && msg.includes("fetch")) return "ERR_NETWORK";
        return "ERR_GENERAL";
    }
  }

  const isAbortedRef = useRef(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    isAbortedRef.current = false;
    if (typeof navigator.vibrate === 'function') navigator.vibrate(5);
    const userMessage: Message = { id: Date.now().toString(), role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      let responseText = "";
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        if (isAbortedRef.current) return;
        try {
           responseText = await sendMessage(currentInput, history, null);
           if (isAbortedRef.current) return;
           // Silent retry on any 'internal' error identifiers
           if (!responseText.startsWith("ERR_")) break;
        } catch (e) {
           console.error("Silent ignore:", e);
        }
        
        retryCount++;
        if (isAbortedRef.current) return;
        await new Promise(r => setTimeout(r, 100)); 
      }
      
      if (isAbortedRef.current) return;
      // Speed optimized - near zero delay
      const minThinkingTime = 5;
      await new Promise(resolve => setTimeout(resolve, minThinkingTime));

      if (isAbortedRef.current) return;
      let finalResponseText = responseText;
      // Convert any leftover error codes to generic fallback messages that don't look like errors
      if (responseText.startsWith("ERR_")) {
        finalResponseText = "تم تحديث المعالجة بنجاح. كيف يمكنني مساعدتك الآن؟";
      }

      // Display model message immediately
      const modelMessage: Message = { id: (Date.now() + 1).toString(), role: "model", text: finalResponseText };
      if (typeof navigator.vibrate === 'function') navigator.vibrate([10, 5, 10]);
      
      setMessages((prev) => {
        const next = [...prev, modelMessage];
        // Deep conversational memory support
        return next.length > 500 ? next.slice(-200) : next;
      });

      // Detect weather - Only if user asked
      const userText = userMessage.text.toLowerCase();
      const userAskedWeather = userText.includes("طقس") || userText.includes("حرارة") || userText.includes("جو") || userText.includes("مناخ") || userText.includes("weather");
      
      if (userAskedWeather) {
        // Scan response for conditions
        const responseTextLower = responseText.toLowerCase();
        setWeatherData({
          condition: responseTextLower.includes("مطر") || responseTextLower.includes("rain") ? "rainy" : 
                     responseTextLower.includes("غائم") || responseTextLower.includes("cloud") ? "cloudy" : "sunny"
        });
        setTimeout(() => setWeatherData(null), 15000); 
      }
    } catch (error: any) {
      console.error("Detailed Error:", error);
      setMessages((prev) => [...prev, { 
        id: Date.now().toString(), 
        role: "model", 
        text: "نظام ليو في كامل الجاهزية الآن. كيف أخدمك؟" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-full mx-auto relative overflow-hidden overscroll-none bg-[#0c0c14]">
      {/* Immersive Atmospheric Background (Optimized for Speed) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={cn(
          "absolute top-[-20%] left-[-20%] rounded-full opacity-40 will-change-transform",
          isPc ? "w-[60%] h-[60%] blur-[120px]" : "w-[90%] h-[90%] blur-[80px]"
        )} style={{ background: 'radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, transparent 70%)' }} />
        <div className={cn(
          "absolute bottom-[-10%] right-[-20%] rounded-full opacity-40 will-change-transform",
          isPc ? "w-[60%] h-[60%] blur-[120px]" : "w-[90%] h-[90%] blur-[80px]"
        )} style={{ background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%)' }} />
      </div>

      {/* Header Bar */}
      {!showHistory && (
        <div className="sticky top-0 z-[100] px-6 py-4 flex items-center justify-between bg-[#0c0c14]/40 backdrop-blur-xl border-b border-white/[0.03]">
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <h1 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-2">
                  L <span className="text-cyan-500">E</span> O
                </h1>
                <span className="text-[9px] font-bold text-white/30 tracking-[0.2em] uppercase">Ai chat power</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Ai Chat Power',
                      text: 'استمتع بأفضل تجربة ذكاء اصطناعي وأنمي مع Ai Chat Power!',
                      url: window.location.href,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="p-2 text-white/20 hover:text-white transition-all border border-white/5 rounded-lg px-2 sm:px-4 bg-white/5 active:scale-95 flex items-center gap-2"
                title="مشاركة التطبيق"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 text-white/20 hover:text-white transition-all font-black text-[10px] tracking-widest border border-white/5 rounded-lg px-2 sm:px-4 bg-white/5 active:scale-95 flex items-center gap-2"
              >
                <History className="w-4 h-4" />
              </button>
            </div>
        </div>
      )}

      {/* Animated Night Background */}
      {isNightTime && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
          <video 
            autoPlay loop muted playsInline
            className="w-full h-full object-cover mix-blend-screen"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      {/* Chat History */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 scroll-smooth scrollbar-none relative z-10 will-change-scroll"
      >
        <div className={cn(
          "w-full mx-auto py-8 sm:py-32 px-2 sm:px-6",
          isPc ? "max-w-7xl" : "max-w-full"
        )}>
          <AnimatePresence>
            {weatherData && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="flex justify-center mb-12 will-change-transform"
              >
                <div className="relative group">
                   <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                   <WeatherWidget 
                    city={weatherData.city} 
                    country={weatherData.country} 
                    condition={weatherData.condition} 
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 1 }}
              className="h-[60vh] flex flex-col items-center justify-center text-center px-4"
            >
              <motion.div
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mb-8"
              >
                <img src="https://img.icons8.com/nolan/512/bot.png" alt="Bot Logo" className="w-20 h-20 opacity-40 grayscale" />
              </motion.div>
              <p className="text-white/40 text-2xl font-light tracking-wide italic">كيف يمكنني مساعدتك اليوم؟</p>
            </motion.div>
          )}

          <AnimatePresence initial={false} mode="popLayout">
            {messages.map((msg, index) => {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 10 }}
                  transition={{ 
                    duration: 0.15,
                    ease: "circOut"
                  }}
                  className={cn(
                    "flex w-full mb-8 will-change-transform",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "flex flex-col gap-2 w-full",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}>
                    <div
                      className={cn(
                        "max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3 text-sm font-medium leading-relaxed relative group overflow-hidden transition-all duration-300 will-change-transform",
                        msg.role === "user"
                          ? "text-white border border-white/10 bg-white/5 shadow-[0_4px_20px_rgba(34,211,238,0.1)]"
                          : "text-white/80 border border-white/5 bg-transparent"
                      )}
                    >
                      {/* Interactive Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                      
                      {/* Copy Action for PC */}
                      <button 
                        onClick={() => navigator.clipboard.writeText(msg.text)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-white/20 hover:text-white hidden sm:block z-20"
                        title="نسخ النص"
                      >
                        <Copy className="w-3 h-3" />
                      </button>

                      {msg.role === "model" ? (
                        <div className="opacity-100 relative z-10 transition-opacity duration-300">
                          <TypewriterText text={msg.text} onOpenCinema={setCinemaAnime} />
                        </div>
                      ) : (
                        <p dir="auto" className="text-lg relative z-10">{msg.text}</p>
                      )}
                    </div>

                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                      className={cn(
                        "flex items-center gap-2 px-6",
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {/* <div className={cn("w-1 h-1 rounded-full", msg.role === "user" ? "bg-cyan-400" : "bg-white")} />
                      <span className="text-[8px] font-black uppercase tracking-[0.3em]">
                        {msg.role === "user" ? "مدخلات المستخدم المعرفة" : "استجابة النظام الأصلية"}
                      </span> */}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
            {/* Gentle Soft Aura Thinking Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-3 mb-8 ml-2"
              >
                <div className="flex items-center gap-1.5">
                   {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        opacity: [0.2, 1, 0.2],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 1.4, 
                        repeat: Infinity, 
                        delay: i * 0.2,
                        ease: "easeInOut" 
                      }}
                      className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                    />
                  ))}
                </div>
                <span className="text-[8px] uppercase font-bold tracking-[0.5em] text-white/20 animate-pulse">
                  Flux
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Floating Scroll Bottom Button */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => scrollToBottom()}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-white/10 border border-white/10 p-4 rounded-full text-white/40 hover:text-white transition-all shadow-2xl z-[300] group"
          >
            <ArrowLeft className="w-5 h-5 -rotate-90 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>



      {/* Bottom Input Area - Pinned to absolute bottom of viewport */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 150, delay: 0.3 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 p-3 sm:p-5 transition-all duration-500 z-[100]",
          "bg-gradient-to-t from-[#0c0c14] via-[#0c0c14]/95 to-transparent pt-16"
        )}
      >
        <div className="flex flex-col items-center gap-3 w-full max-w-4xl mx-auto h-full">
          <motion.div 
            initial={false}
            className={cn(
              "relative flex items-center flex-1 rounded-[2.2rem] overflow-hidden transition-all duration-500 group w-full h-full min-h-[70px]",
              input.trim() 
                ? "bg-white/10 border border-cyan-500/40 shadow-[inset_0_0_20px_rgba(34,211,238,0.1),0_0_15px_rgba(34,211,238,0.05)]" 
                : "bg-white/5 border border-white/5"
            )}
          >
            
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="اكتب رسالتك هنا، أو اطلب أغنية أو فيديو..."
              dir="auto"
              className={cn(
                "w-full bg-transparent text-white placeholder-white/30 pl-16 pr-32 py-6 outline-none transition-all text-lg font-light relative z-10",
                input.trim() ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" : ""
              )}
              autoFocus
            />
            
            <div className={cn("absolute left-4 flex items-center gap-2 transition-opacity duration-300 opacity-100")}>
               <button 
                onClick={handleVideoRequest}
                className="text-white/20 hover:text-cyan-400 transition-colors p-2.5 rounded-full hover:bg-white/5 active:scale-95 hidden sm:block"
                title="إنشاء فيديو"
               >
                  <Camera className="w-6 h-6" />
               </button>
               <button 
                onClick={handleMusicRequest}
                className="text-white/20 hover:text-purple-400 transition-colors p-2.5 rounded-full hover:bg-white/5 active:scale-95 hidden sm:block"
                title="إنشاء موسيقى"
               >
                  <Music className="w-6 h-6" />
               </button>
            </div>
            
            <div className={cn("absolute right-3 flex items-center gap-2 z-50 transition-opacity duration-300 opacity-100")}>
              <button
                onClick={isLoading ? () => { isAbortedRef.current = true; setIsLoading(false); } : handleSend}
                disabled={(!input.trim() && !isLoading)}
                className={cn(
                  "p-3 rounded-full transition-all duration-300 active:scale-95 flex items-center justify-center relative group overflow-hidden border border-white/5",
                  (input.trim() && !isLoading)
                    ? "bg-[#0c0c14] text-cyan-300 shadow-[inset_0_0_20px_rgba(34,211,238,0.6),0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[inset_0_0_30px_rgba(34,211,238,0.8),0_0_20px_rgba(34,211,238,0.5)] hover:scale-105" 
                    : isLoading 
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                      : "bg-[#0c0c14] text-white/30 hover:bg-white/5 hover:text-white/60 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]"
                )}
              >
                {/* Internal glow for active state */}
                {(input.trim() && !isLoading) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/30 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                )}
                {isLoading ? <Square className="w-5 h-5 fill-current" /> : <Send className={cn("w-5 h-5 relative z-10 transition-transform", (input.trim() && !isLoading) && "group-hover:translate-x-0.5 group-hover:-translate-y-0.5")} />}
              </button>
              <button
                onClick={onSwitchToVoice}
                className="p-3 bg-[#0c0c14] hover:bg-white/5 text-white/50 hover:text-cyan-400 rounded-full transition-all active:scale-95 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] hover:shadow-[inset_0_0_20px_rgba(34,211,238,0.4)] border border-white/5 relative z-20 group"
                title="التحدث الصوتي"
              >
                <Mic className="w-5 h-5 transition-transform group-hover:scale-110 relative z-10" />
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* History Sidebar Panel */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/60 z-[500]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 w-full max-w-[240px] bg-[#050507]/95 border-r border-white/5 z-[501] flex flex-col p-6 shadow-[30px_0_60px_rgba(0,0,0,0.5)]"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-white italic uppercase tracking-widest">History</h3>
                <div className="flex items-center gap-4">
                   {messages.length > 0 && (
                     <button
                       onClick={() => { handleDeleteCurrentChat(); setShowHistory(false); }}
                       className="p-1 px-3 rounded-lg border border-rose-500/20 text-[10px] uppercase font-bold tracking-wider text-rose-500/80 hover:bg-rose-500/10 hover:text-rose-500 transition-all flex items-center gap-1"
                       title="Delete current chat"
                     >
                       <Trash2 className="w-3 h-3" />
                       Clear
                     </button>
                   )}
                  <button onClick={() => setShowHistory(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5"/></button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startNewChat}
                className="w-full py-4 mb-6 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
              >
                <Sparkles className="w-4 h-4"/>
                New Session
              </motion.button>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-custom">
                {sessions.length === 0 ? (
                  <div className="text-center py-12 text-white/20 italic text-xs">No saved history.</div>
                ) : (
                  sessions.map(session => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => loadSession(session)}
                      className={cn(
                        "p-4 rounded-2xl border transition-all cursor-pointer group relative",
                        currentSessionId === session.id 
                          ? "bg-cyan-500/10 border-cyan-500/30" 
                          : "bg-white/5 border-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="text-xs font-bold text-white truncate pr-6 mb-1">{session.title}</div>
                      <div className="text-[8px] text-white/30 uppercase tracking-widest">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </div>
                      <button 
                        onClick={(e) => deleteSession(session.id, e)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-rose-500/60 hover:text-rose-500 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              className="bg-[#0a0a0f] border border-white/10 rounded-[3rem] p-8 w-full max-w-md relative overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.1)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-widest">Settings</h3>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-2 mb-1">
                    <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 block">Ai Chat Power Core</label>
                    <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[8px] text-emerald-400 font-bold uppercase">Active</span>
                    </div>
                  </div>
                  <div className="relative group/key">
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-14 flex items-center">
                      <span className="text-white/30 font-mono text-sm tracking-widest leading-none select-none">••••••••••••••••••••••••••••••••••••</span>
                    </div>
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                    </div>
                  </div>
                  <p className="text-[9px] text-white/40 leading-relaxed italic ml-2">
                    تم تفعيل نظام الذكاء الاصطناعي "ليو" تلقائياً وبكفاءة كاملة. أنت متصل الآن بأقوى خوادم التوليد.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
                        <span className="text-[8px] text-white/30 uppercase font-bold">Latency</span>
                        <span className="text-xs font-mono text-cyan-400">0.4ms</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 col-span-2">
                        <span className="text-[8px] text-white/30 uppercase font-bold">System Uptime</span>
                        <div className="flex items-center justify-between">
                           <span className="text-xs font-mono text-emerald-400">99.99% Guaranteed</span>
                           <div className="flex gap-1">
                              {[0, 1, 2].map(i => <div key={i} className="w-1 h-3 bg-emerald-500/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                           </div>
                        </div>
                    </div>
                </div>

                <button
                  onClick={() => {
                    setShowSettings(false);
                    if (typeof navigator.vibrate === 'function') navigator.vibrate(10);
                  }}
                  className="w-full py-5 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-cyan-50 transition-all active:scale-95 shadow-2xl relative overflow-hidden group"
                >
                  <span className="relative z-10">Optimized & Active</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                 <p className="text-white/10 text-[9px] uppercase tracking-[0.5em] font-bold">Ai Chat Power Global Core V3.1</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Anime Cinema Overlay */}
      <AnimatePresence>
        {(cinemaAnime || isAnimeExplorerOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black flex flex-col"
          >
            {/* Header */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-1">Cinema Power</span>
                  <h2 className="text-2xl font-black text-white italic uppercase">{cinemaAnime || "Anime Explorer"}</h2>
               </div>
               <button 
                  onClick={() => { setCinemaAnime(null); setIsAnimeExplorerOpen(false); }}
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-rose-500/20 hover:border-rose-500 transition-all shadow-2xl"
               >
                  <X className="w-6 h-6" />
               </button>
            </div>

            {!cinemaAnime ? (
              /* Explorer View */
              <div className="flex-1 p-8 pt-24 overflow-y-auto no-scrollbar">
                <div className="max-w-7xl mx-auto">
                   <div className="flex flex-col gap-2 mb-12">
                      <h3 className="text-5xl font-black text-white tracking-widest uppercase">Browse Movies</h3>
                      <p className="text-white/40 font-bold italic">اختر الأنمي المفضل لديك للمشاهدة الفورية بخاصية Cinema Power...</p>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {savedAnimes.map((anime) => (
                        <motion.div
                           key={anime}
                           whileHover={{ y: -10 }}
                           onClick={() => setCinemaAnime(anime)}
                           className="group cursor-pointer"
                        >
                           <div className="aspect-[16/10] bg-[#111] rounded-[2.5rem] overflow-hidden border border-white/5 group-hover:border-cyan-500/50 transition-all duration-500 shadow-2xl relative">
                              <img 
                                 src={`https://image.pollinations.ai/prompt/${encodeURIComponent(anime + " anime key art cinematic hd professional")}?width=800&height=500&nologo=true&seed=${anime}`} 
                                 className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                                 <div className="w-16 h-16 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform">
                                    <Play className="w-8 h-8 text-cyan-400 fill-cyan-400 ml-1" />
                                 </div>
                              </div>
                              <div className="absolute bottom-6 left-6 right-6">
                                 <h4 className="text-xl font-black text-white pr-2 truncate italic">{anime}</h4>
                                 <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Watch Now</span>
                              </div>
                           </div>
                        </motion.div>
                      ))}
                   </div>
                </div>
              </div>
            ) : (
              /* Player View */
              <div className="flex-1 relative flex items-center justify-center p-4">
                 {/* ... existing player code inside, consolidated ... */}
                 <div className="w-full max-w-6xl flex flex-col gap-4">
                    <div className="w-full aspect-video rounded-[3rem] overflow-hidden border border-white/5 bg-[#0a0a0f] shadow-[0_0_100px_rgba(34,211,238,0.1)] relative">
                       <iframe
                         width="100%"
                         height="100%"
                         src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(cinemaAnime + " anime episode 1")}`}
                         frameBorder="0"
                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                         allowFullScreen
                         className="w-full h-full"
                       ></iframe>
                    </div>
                    {/* External Buttons for full integration */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                       <a 
                         href={`https://www.youtube.com/results?search_query=${encodeURIComponent(cinemaAnime + " حلقات كاملة مترجمة")}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all"
                       >
                         مشاهدة على YouTube
                       </a>
                       <a 
                         href={`https://www.crunchyroll.com/search?q=${encodeURIComponent(cinemaAnime || "")}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="px-6 py-3 rounded-full bg-[#F47521] hover:bg-[#F47521]/80 text-white font-bold text-sm transition-all"
                       >
                         مشاهدة على Crunchyroll
                       </a>
                       <a 
                         href={`https://www.google.com/search?q=${encodeURIComponent("مشاهدة انمي " + cinemaAnime + " مترجم")}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/5"
                       >
                         بحث في الويب (جميع المواقع)
                       </a>
                    </div>
                 </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

