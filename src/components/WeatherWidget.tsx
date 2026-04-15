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
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <Sun className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
        </motion.div>
      );
      case "cloudy": return (
        <motion.div
          animate={{ x: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Cloud className="w-12 h-12 text-gray-400 drop-shadow-[0_0_10px_rgba(156,163,175,0.4)]" />
        </motion.div>
      );
      case "rainy": return (
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <CloudRain className="w-12 h-12 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
        </motion.div>
      );
      case "stormy": return (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <CloudLightning className="w-12 h-12 text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.6)]" />
        </motion.div>
      );
      default: return <Sun className="w-12 h-12 text-yellow-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ type: "spring", damping: 15, stiffness: 100 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-6 flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/10"
    >
      <div className="p-4 bg-white/5 rounded-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {getIcon()}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-rose-400 animate-pulse" />
          <span className="text-3xl font-black text-white tracking-tight">{temp}°C</span>
        </div>
        <p className="text-white/50 text-xs font-bold tracking-widest uppercase mt-1">
          {city ? `${city}, ${country}` : country || "حالة الطقس الآن"}
        </p>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-cyan-400 text-[10px] font-black mt-1 tracking-wider uppercase"
        >
          {condition === "sunny" ? "صافٍ ومشرق" : condition === "rainy" ? "أجواء ممطرة" : "غائم جزئياً"}
        </motion.p>
      </div>
    </motion.div>
  );
}
