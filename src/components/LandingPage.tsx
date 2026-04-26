import { motion, AnimatePresence } from "motion/react";
import { Download, Smartphone, Tv, Shield, Zap, Globe, ArrowRight, Star, Sparkles, Monitor, Link, Copy, Check, Chrome, MoreVertical, Share } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

interface LandingPageProps {
  onStart: () => void;
  onInstall: () => Promise<boolean>;
}

export function LandingPage({ onStart, onInstall }: LandingPageProps) {
  const [copied, setCopied] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showTVGuide, setShowTVGuide] = useState(false);
  const [showPCGuide, setShowPCGuide] = useState(false);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "ais-chat-power.run";
  const shortDomain = siteUrl.replace(/^https?:\/\//, '');
  const isWindows = typeof window !== "undefined" && navigator.userAgent.includes("Windows");
  const isMobile = typeof window !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handlePCInstall = async () => {
    if (isInstalling) return;
    setIsInstalling(true);
    
    try {
      const success = await onInstall(); 
      if (!success) {
         setShowPCGuide(true);
      }
    } catch (e) {
      setShowPCGuide(true);
    }
    setTimeout(() => setIsInstalling(false), 1500);
  };

  const handleMobileInstall = async () => {
    if (isInstalling) return;
    setIsInstalling(true);

    try {
      const success = await onInstall(); 
      if (!success) {
        setShowInstallGuide(true);
      }
    } catch (error) {
      console.error("Install logic failed", error);
    }
    setTimeout(() => setIsInstalling(false), 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <AnimatePresence>
        {showInstallGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80"
          >
            <div className="bg-[#111118] border border-white/10 rounded-[2rem] p-8 max-w-sm w-full text-center relative shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 whitespace-nowrap">إضافة للشاشة الرئيسية</h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                لتثبيت هذا النظام <strong className="text-white">(App)</strong> في هاتفك فوراً:
              </p>
              
              <div className="space-y-4 text-right bg-white/5 p-4 rounded-xl border border-white/10 mb-6" dir="rtl">
                <div className="flex items-start gap-4">
                  <MoreVertical className="w-6 h-6 text-indigo-400 shrink-0" />
                  <p className="text-sm">في <strong className="text-white">أندرويد</strong>: اضغط على خيارات المتصفح (⋮) ثم اختر <strong className="text-indigo-400">إضافة للشاشة الرئيسية</strong>.</p>
                </div>
                <div className="h-px bg-white/10 w-full" />
                <div className="flex items-start gap-4">
                  <Share className="w-6 h-6 text-emerald-400 shrink-0" />
                  <p className="text-sm">في <strong className="text-white">آيفون</strong>: اضغط على زر المشاركة تحت ثم اختر <strong className="text-emerald-400">Add to Home Screen</strong>.</p>
                </div>
              </div>

              <button
                onClick={() => setShowInstallGuide(false)}
                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                حسناً، فهمت
              </button>
            </div>
          </motion.div>
        )}

        {showPCGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80"
          >
            <div className="bg-[#111118] border border-white/10 rounded-[2rem] p-8 max-w-sm w-full text-center relative shadow-2xl">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                <Monitor className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 whitespace-nowrap">تثبيت البرنامج</h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                لتثبيت النظام كبرنامج مستقل على جهاز الكمبيوتر:
              </p>
              
              <div className="space-y-4 text-right bg-white/5 p-4 rounded-xl border border-white/10 mb-6" dir="rtl">
                <div className="flex items-start gap-4">
                  <Chrome className="w-6 h-6 text-blue-400 shrink-0" />
                  <p className="text-sm">
                    تأكد أنك تستخدم متصفح <strong className="text-white">Chrome</strong> أو <strong className="text-white">Edge</strong>، ثم انقر على أيقونة التثبيت الموجودة في شريط العنوان بالأعلى لتنزيله.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPCGuide(false)}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
              >
                تم
              </button>
            </div>
          </motion.div>
        )}

        {showTVGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90"
          >
            <div className="bg-[#0a0a0c] border border-white/10 rounded-[2rem] p-8 max-w-md w-full text-center relative shadow-2xl">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
                <Tv className="w-10 h-10 text-cyan-400" />
              </div>
              <h3 className="text-3xl font-black mb-4">للشاشات الذكية</h3>
              <p className="text-white/60 mb-6 text-sm leading-relaxed">
                لكي يعمل النظام كبرنامج أساسي وكامل الشاشة وبدون أخطاء على التلفاز (Android TV / Fire TV):
              </p>
              
              <div className="space-y-4 text-right bg-white/5 p-5 rounded-2xl border border-white/10 mb-8" dir="rtl">
                <p className="text-sm border-b border-white/5 pb-3">
                  <strong className="text-cyan-400 mr-2">1.</strong> قم بتحميل برنامج <strong>Downloader</strong> من متجر التلفاز الرسمي.
                </p>
                <div className="pt-2">
                  <p className="text-sm">
                    <strong className="text-cyan-400 mr-2">2.</strong> افتح البرنامج وأدخل رابط موقعنا في شريط البحث للبدء مباشرة.
                  </p>
                </div>
                <p className="text-sm border-t border-white/5 pt-3 mt-3 text-white/50">
                  <strong className="text-cyan-400 mr-2">3.</strong> اضغط على Go وتمتع بالتجربة!
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowTVGuide(false)}
                  className="flex-1 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0">
          <div className={cn(
            "absolute top-[-10%] left-[-10%] rounded-full bg-indigo-600/10 animate-pulse",
            isMobile ? "w-[80%] h-[80%]" : "w-[60%] h-[60%]"
          )} />
          <div className={cn(
            "absolute bottom-[-10%] right-[-10%] rounded-full bg-rose-600/10 animate-pulse",
            isMobile ? "w-[80%] h-[80%]" : "w-[60%] h-[60%]"
          )} style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex flex-col items-center mb-12"
          >
            <motion.div 
               whileHover={{ scale: 1.1, rotate: 180 }}
               transition={{ duration: 0.8, ease: "circOut" }}
               className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-8 shadow-2xl cursor-pointer"
            >
               <img src="https://img.icons8.com/nolan/512/bot.png" alt="Bot Logo" className="w-16 h-16 drop-shadow-lg" />
            </motion.div>

            <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full shadow-xl">
              <span className="text-sm font-bold text-white/50 tracking-[0.3em] uppercase">Ai Chat Power</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-8xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
          >
            المساعد الشخصي الذكي
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-12 font-medium leading-tight"
          >
            نظام ذكاء اصطناعي متطور، يراك، يسمعك، ويشاركك الإبداع. صمم ليكون رفيقك التقني الأكثر حكمة وبصيرة في العالم.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col items-center justify-center gap-6 w-full max-w-4xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              {!isMobile && (
                <button
                  onClick={handlePCInstall}
                  disabled={isInstalling}
                  className={cn(
                    "group relative flex-1 sm:max-w-max px-12 py-6 bg-white text-black rounded-[2rem] font-bold text-xl hover:scale-105 transition-all flex items-center justify-center shadow-2xl overflow-hidden active:scale-95",
                    isInstalling && "opacity-90 scale-95"
                  )}
                >
                  <span className="relative z-10">التحميل للكمبيوتر</span>
                </button>
              )}

              {isMobile && (
                <button
                  onClick={handleMobileInstall}
                  disabled={isInstalling}
                  className={cn(
                    "group relative flex-1 sm:max-w-max px-12 py-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-[2rem] font-bold text-xl hover:scale-105 transition-all flex items-center justify-center shadow-xl shadow-indigo-500/20 active:scale-95",
                    isInstalling && "opacity-90 scale-95"
                  )}
                >
                  <span className="relative z-10 font-bold">تحميل للجوال</span>
                </button>
              )}

              <button
                onClick={() => setShowTVGuide(true)}
                className="group relative flex-1 sm:max-w-max px-12 py-6 bg-gradient-to-br from-[#0a0a0c] to-indigo-900 border border-white/20 text-white rounded-[2rem] font-bold text-xl hover:scale-105 transition-all flex items-center justify-center shadow-xl hover:shadow-indigo-500/20 active:scale-95"
              >
                <Tv className="w-5 h-5 ml-3 relative z-10 text-cyan-400" />
                <span className="relative z-10 font-bold">التشغيل للتلفاز</span>
              </button>
            </div>

            <button
               onClick={onStart}
               className="group flex items-center gap-4 text-white/40 hover:text-white transition-all uppercase tracking-[0.5em] font-black text-[10px]"
            >
               <span>أو أكمل في المتصفح</span>
               <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">صناعة الفن</h3>
              <p className="text-white/50">توليد صور وفيديوهات سينمائية بلمحة بصر.</p>
            </div>
            <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10">
              <Globe className="w-8 h-8 text-rose-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">عقل خارق</h3>
              <p className="text-white/50">أفضل ذكاء في العالم لخدمتك في كل شيء.</p>
            </div>
            <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 group hover:border-cyan-500/30 transition-all">
              <Monitor className="w-8 h-8 text-cyan-400 mx-auto mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-4">الوضع العائم</h3>
              <p className="text-white/50 text-sm">استدعي Ai Chat Power فوق جميع تطبيقاتك (PIP) ليكون رفيقك الدائم في كل لحظة.</p>
            </div>
            <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10">
              <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">أمان عالمي</h3>
              <p className="text-white/50">تشفير تام لجميع محادثاتك وسجلاتك.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 bg-black/50">
        <div className="container mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500" />
            <span className="text-2xl font-black tracking-tighter uppercase">Ai Chat Power Engine</span>
          </div>
          <p className="text-white/30 text-sm mb-4">© 2026 Ai Chat Power</p>
        </div>
      </footer>
    </div>
  );
}
