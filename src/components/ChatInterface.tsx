import { useState, useRef, useEffect } from "react";
import { Send, Mic, MessageSquare, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { sendChatMessage } from "../lib/gemini";
import { cn } from "../lib/utils";
import { WeatherWidget } from "./WeatherWidget";

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, 10); // Fast typing
    return () => clearInterval(interval);
  }, [text]);

  return <Markdown>{isComplete ? text : displayedText}</Markdown>;
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

export function ChatInterface({ onSwitchToVoice, onBack, liveAPI }: ChatInterfaceProps) {
  const { weatherData, setWeatherData } = liveAPI;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await sendChatMessage(userMessage.text, history);
      
      const modelMessage: Message = { id: (Date.now() + 1).toString(), role: "model", text: responseText };
      setMessages((prev) => [...prev, modelMessage]);

      // Detect weather
      const lowerText = responseText.toLowerCase();
      if (lowerText.includes("طقس") || lowerText.includes("حرارة") || lowerText.includes("جو")) {
        setWeatherData({
          condition: lowerText.includes("مطر") ? "rainy" : lowerText.includes("غائم") ? "cloudy" : "sunny"
        });
        setTimeout(() => setWeatherData(null), 10000);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "model", 
        text: "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى." 
      };
      setMessages((prev) => [...prev, errorMessage]);
      // Keep the input so the user can retry easily
      setInput(userMessage.text);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto relative overflow-hidden overscroll-none">
      {/* Corner Glows */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* Back Button - Standardized */}
      <div className="absolute top-4 left-4 z-[100]">
        <button
          onClick={onBack}
          className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xl text-white/50 hover:text-white hover:bg-white/20 transition-all border border-white/20 shadow-xl"
          title="العودة للرئيسية"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pt-20 pb-32 scrollbar-hide px-4 relative z-10 overscroll-contain">
        <AnimatePresence>
          {weatherData && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="sticky top-4 z-50 flex justify-center mb-6"
            >
              <WeatherWidget 
                city={weatherData.city} 
                country={weatherData.country} 
                condition={weatherData.condition} 
              />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false} mode="popLayout">
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 1.1 }}
              className="h-full flex flex-col items-center justify-center text-center px-4"
            >
              <p className="text-white/30 text-xl font-light tracking-wide">كيف يمكنني مساعدتك اليوم؟</p>
            </motion.div>
          )}
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.9, rotateX: -10 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              transition={{ 
                type: "spring",
                damping: 20,
                stiffness: 100,
                delay: index === messages.length - 1 ? 0 : index * 0.05
              }}
              className={cn(
                "flex w-full mb-4",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <motion.div
                whileHover={{ scale: 1.01, y: -2 }}
                animate={{ 
                  y: [0, -4, 0],
                }}
                transition={{ 
                  y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2
                  }
                }}
                className={cn(
                  "max-w-[85%] md:max-w-[70%] rounded-[1.5rem] px-7 py-5 text-lg font-light leading-relaxed shadow-2xl transition-all border relative group",
                  msg.role === "user"
                    ? "bg-white/10 text-white border-white/20"
                    : "bg-indigo-600/20 text-white/90 border-indigo-500/30 backdrop-blur-3xl"
                )}
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] pointer-events-none" />
                {msg.role === "model" ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="markdown-body prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/20 prose-pre:border prose-pre:border-white/5 text-lg"
                  >
                    <TypewriterText text={msg.text} />
                  </motion.div>
                ) : (
                  <p dir="auto" className="text-lg">{msg.text}</p>
                )}
              </motion.div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex justify-start mb-4"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-indigo-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-purple-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-rose-400 rounded-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area - Pinned to absolute bottom of viewport */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-[#050507] via-[#050507] to-transparent pt-12 z-[100]">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <motion.div 
            initial={false}
            animate={{ 
              boxShadow: input.trim() ? "0 0 30px rgba(99, 102, 241, 0.2)" : "0 0 0px rgba(99, 102, 241, 0)"
            }}
            className="relative flex items-center flex-1 bg-white/10 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl focus-within:border-indigo-500/50 transition-all group"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="اكتب رسالتك هنا..."
              dir="auto"
              className="w-full bg-transparent text-white placeholder-white/30 pl-8 pr-16 py-6 outline-none transition-all text-lg font-light"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 p-3.5 bg-white text-black rounded-full hover:bg-white/90 transition-all disabled:opacity-20 shadow-xl active:scale-90"
            >
              <Send className="w-5 h-5" />
            </button>
          </motion.div>
          
          <button
            onClick={onSwitchToVoice}
            className="p-5 rounded-[2.5rem] bg-white/10 backdrop-blur-3xl text-white hover:bg-white/20 transition-all duration-500 shadow-2xl border border-white/20 flex items-center justify-center group relative overflow-hidden outline-none"
            title="تحدث مع المساعد الصوتي"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center">
              <Mic className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

