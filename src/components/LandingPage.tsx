import { motion } from "motion/react";
import { Download, Smartphone, Tv, Shield, Zap, Globe, ArrowRight, Star, Sparkles } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
  onInstall: () => void;
}

export function LandingPage({ onStart, onInstall }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-indigo-500/30">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-rose-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Floating particles */}
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full blur-sm"
          />
          <motion.div 
            animate={{ 
              y: [0, 20, 0],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{ duration: 7, repeat: Infinity, delay: 1 }}
            className="absolute top-1/2 right-1/3 w-3 h-3 bg-indigo-400 rounded-full blur-sm"
          />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex flex-col items-center mb-12"
          >
            {/* Animated Logo - Enhanced */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                boxShadow: [
                  "0 0 20px rgba(34, 211, 238, 0.3)",
                  "0 0 60px rgba(139, 92, 246, 0.5)",
                  "0 0 20px rgba(34, 211, 238, 0.3)"
                ]
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center mb-8 shadow-2xl relative group overflow-hidden border border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-12 h-12 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              </motion.div>
              
              {/* Spinning Ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-white/20 rounded-[2rem] scale-90"
              />
            </motion.div>

            <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md shadow-xl">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0a0a0c] bg-gradient-to-br from-indigo-500 to-rose-500" />
                ))}
              </div>
              <span className="text-sm font-bold text-white/80 tracking-[0.3em] uppercase">المطور: ai power</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
          >
            مرحباً بك في عالم الذكاء
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-12 font-medium leading-tight"
          >
            أنا رفيقك الذكي، رفيقي في كل خطوة. أتحدث معك، أسمعك، وأساعدك في كل ما تحتاجه بصوت هادئ وجميل.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-6"
          >
            <button
              onClick={onInstall}
              className="w-full sm:w-auto px-12 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl font-bold text-2xl hover:scale-105 transition-all flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)]"
            >
              <Download className="mr-4 w-8 h-8" />
              تحميل ملف APK (تثبيت مباشر)
            </button>

            <button
              onClick={onStart}
              className="group flex items-center gap-3 text-white/40 hover:text-white transition-all text-lg font-bold"
            >
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span>أو الدخول مباشرة للتطبيق</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-indigo-400" />}
              title="سرعة خارقة"
              description="استجابة فورية كالبرق في المحادثات النصية والصوتية بدون أي تأخير."
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8 text-rose-400" />}
              title="اللهجة"
              description="يتكلم جميع اللغات واللهجات"
            />
            <FeatureCard
              icon={<Smartphone className="w-8 h-8 text-emerald-400" />}
              title="متعدد المنصات"
              description="يعمل بكفاءة عالية على الهواتف الذكية، الحواسيب، وحتى أجهزة التلفاز."
            />
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-500/5 via-white/[0.02] to-rose-500/5 border border-white/10 rounded-[4rem] p-10 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full" />
            
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 tracking-tight">كيفية التحميل (ملف APK)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
              <div className="space-y-8">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-xl">
                    <Smartphone className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold">على الأندرويد (APK)</h3>
                </div>
                <ul className="space-y-6 text-white/60 list-none">
                  <li className="flex items-start">
                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold mr-4 shrink-0 border border-white/10">1</span>
                    <p className="text-lg">اضغط على زر "تحميل ملف APK" في الأعلى.</p>
                  </li>
                  <li className="flex items-start">
                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold mr-4 shrink-0 border border-white/10">2</span>
                    <p className="text-lg">وافق على تحميل الملف من المتصفح.</p>
                  </li>
                  <li className="flex items-start">
                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold mr-4 shrink-0 border border-white/10">3</span>
                    <p className="text-lg">افتح الملف وقم بتثبيته مباشرة على هاتفك.</p>
                  </li>
                </ul>
              </div>

              <div className="space-y-8">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-xl">
                    <Tv className="w-8 h-8 text-rose-400" />
                  </div>
                  <h3 className="text-2xl font-bold">على التلفاز (Android TV)</h3>
                </div>
                <ul className="space-y-6 text-white/60 list-none">
                  <li className="flex items-start">
                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold mr-4 shrink-0 border border-white/10">1</span>
                    <p className="text-lg">افتح متصفح الويب على تلفازك.</p>
                  </li>
                  <li className="flex items-start">
                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold mr-4 shrink-0 border border-white/10">2</span>
                    <p className="text-lg">ادخل رابط الموقع: ais-chat-power.run</p>
                  </li>
                  <li className="flex items-start">
                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold mr-4 shrink-0 border border-white/10">3</span>
                    <p className="text-lg">اختر "إضافة إلى الشاشة الرئيسية" من إعدادات المتصفح.</p>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-20 p-8 bg-white/5 rounded-3xl border border-white/10 text-center backdrop-blur-md">
              <p className="text-white/70 text-lg">
                <Shield className="inline-block w-6 h-6 mr-3 text-emerald-400" />
                تطبيقنا آمن تماماً ولا يحتاج إلى صلاحيات مشبوهة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black/50 backdrop-blur-3xl">
        <div className="container mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500" />
            <span className="text-2xl font-black tracking-tighter">Super Chat AI</span>
          </div>
          <p className="text-white/30 text-sm mb-4">© 2026 Ai Chat Power - Developed by ai power</p>
          <div className="flex space-x-6 text-white/20 text-xs uppercase tracking-widest font-bold">
            <a href="https://github.com/rayanrami8884/AI-CHAT-POWER" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all group relative overflow-hidden"
    >
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all" />
      <div className="mb-8 p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-2xl font-bold mb-4 tracking-tight">{title}</h3>
      <p className="text-white/50 leading-relaxed text-lg">{description}</p>
    </motion.div>
  );
}
