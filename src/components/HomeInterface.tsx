import { motion } from "motion/react";
import { MessageSquare, Mic, User, Settings, Sparkles, Shield, Zap } from "lucide-react";
import { cn } from "../lib/utils";

interface HomeInterfaceProps {
  onSelectMode: (mode: "text" | "voice") => void;
  deviceType: "mobile" | "tv" | "desktop";
}

export function HomeInterface({ onSelectMode, deviceType }: HomeInterfaceProps) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 relative z-10"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="inline-block mb-4"
        >
          <Sparkles className="w-12 h-12 text-cyan-400" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
          مرحباً بك في عالم الذكاء
        </h1>
        <p className="text-white/40 text-lg font-light max-w-md mx-auto leading-relaxed">
          اختر الطريقة التي تفضلها للتواصل مع Ai Chat Power، رفيقك الذكي المطور.
        </p>
      </motion.div>

      {/* Mode Selection Cards */}
      <div className={cn(
        "grid gap-6 w-full max-w-4xl relative z-10",
        deviceType === "mobile" ? "grid-cols-1" : "grid-cols-2"
      )}>
        {/* Text Chat Card */}
        <motion.button
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectMode("text")}
          className="group relative p-8 rounded-[2.5rem] bg-white/5 border border-white/10 overflow-hidden text-right flex flex-col items-end transition-all hover:bg-white/10 hover:border-white/20"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 border border-cyan-500/30 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-white">المحادثة الكتابية</h3>
          <p className="text-white/40 text-sm leading-relaxed">
            تواصل عبر الرسائل النصية، اسأل عن أي شيء، واحصل على إجابات دقيقة وسريعة.
          </p>
          <div className="mt-6 flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
            <span>ابدأ الآن</span>
            <Zap className="w-3 h-3 fill-current" />
          </div>
        </motion.button>

        {/* Voice AI Card */}
        <motion.button
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectMode("voice")}
          className="group relative p-8 rounded-[2.5rem] bg-white/5 border border-white/10 overflow-hidden text-right flex flex-col items-end transition-all hover:bg-white/10 hover:border-white/20"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30 group-hover:scale-110 transition-transform">
            <Mic className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-white">المحادثة الصوتية</h3>
          <p className="text-white/40 text-sm leading-relaxed">
            تحدث مع Ai Chat Power بصوتك، استمع لردوده الهادئة، واستمتع بتجربة تفاعلية حقيقية.
          </p>
          <div className="mt-6 flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
            <span>تحدث الآن</span>
            <Zap className="w-3 h-3 fill-current" />
          </div>
        </motion.button>
      </div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 flex items-center gap-8 text-white/20 relative z-10"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">آمن ومشفر</span>
        </div>
        <div className="w-1 h-1 bg-white/10 rounded-full" />
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">سرعة فائقة</span>
        </div>
        <div className="w-1 h-1 bg-white/10 rounded-full" />
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">تجربة مخصصة</span>
        </div>
      </motion.div>

      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}
