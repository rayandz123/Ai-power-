import React from "react";
import { Sun, Cloud, CloudRain, CloudLightning, Thermometer } from "lucide-react";
import { motion } from "motion/react";

interface WeatherWidgetProps {
  city?: string;
  country?: string;
  temp?: number;
  condition?: "sunny" | "cloudy" | "rainy" | "stormy";
}

export function WeatherWidget({ city, country, temp = 25, condition = "sunny" }: WeatherWidgetProps) {
  const getIcon = () => {
    switch (condition) {
      case "sunny": return (
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <Sun className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,1)]" />
        </motion.div>
      );
      case "cloudy": return (
        <motion.div
          animate={{ x: [-10, 10, -10], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Cloud className="w-16 h-16 text-gray-300 drop-shadow-[0_0_15px_rgba(156,163,175,0.8)]" />
        </motion.div>
      );
      case "rainy": return (
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <CloudRain className="w-16 h-16 text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
        </motion.div>
      );
      case "stormy": return (
        <motion.div
          animate={{ scale: [1, 1.3, 1], filter: ["brightness(1)", "brightness(2)", "brightness(1)"] }}
          transition={{ duration: 0.2, repeat: Infinity }}
        >
          <CloudLightning className="w-16 h-16 text-indigo-400 drop-shadow-[0_0_25px_rgba(129,140,248,1)]" />
        </motion.div>
      );
      default: return <Sun className="w-16 h-16 text-yellow-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: 100 }}
      transition={{ type: "spring", damping: 12, stiffness: 120 }}
      className="relative group p-[2px] rounded-[3rem] overflow-hidden shadow-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/50 via-purple-500/50 to-rose-500/50 opacity-100 group-hover:animate-spin-slow transition-all" />
      <div className="relative bg-[#0a0a0f]/95 rounded-[2.9rem] p-8 flex flex-col items-center justify-center gap-6 min-w-[280px]">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Thermometer className="w-12 h-12 text-white" />
        </div>
        
        <div className="relative">
           <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full" />
           {getIcon()}
        </div>

        <div className="text-center">
            <h3 className="text-4xl font-black text-white tracking-tighter mb-1 flex items-center justify-center gap-2">
                {temp}
                <span className="text-xl text-white/40">°C</span>
            </h3>
            <p className="text-white animate-pulse text-sm font-bold uppercase tracking-[0.5em] mb-4">
                {condition}
            </p>
            <div className="h-[1px] w-12 bg-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-loose">
                {city ? `${city} – ${country}` : country || "الموقع المكتشف"}
            </p>
        </div>

        <div className="absolute -bottom-1 -left-1 -right-1 h-2 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
      </div>
    </motion.div>
  );
}
