import { useState, useRef, useEffect } from "react";
import { Send, Mic, MessageSquare, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { sendChatMessage } from "../lib/gemini";
import { cn } from "../lib/utils";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

interface ChatInterfaceProps {
  onSwitchToVoice: () => void;
  onBack: () => void;
}

export function ChatInterface({ onSwitchToVoice, onBack }: ChatInterfaceProps) {
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

      {/* Corner Glows */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="flex-1 overflow-y-auto space-y-6 pt-20 pb-32 scrollbar-hide px-4 relative z-10 overscroll-contain">
        <AnimatePresence initial={false} mode="popLayout">
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center px-4"
            >
              <p className="text-white/30 text-xl font-light tracking-wide">كيف يمكنني مساعدتك اليوم؟</p>
            </motion.div>
          )}
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.23, 1, 0.32, 1] 
              }}
              className={cn(
                "flex w-full mb-2",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] md:max-w-[70%] rounded-[2.5rem] px-7 py-5 text-lg font-light leading-relaxed shadow-xl transition-all border",
                  msg.role === "user"
                    ? "bg-gradient-to-br from-indigo-600/30 to-purple-600/30 text-white border-white/20 rounded-tr-none"
                    : "bg-white/[0.05] text-white/90 border-white/10 backdrop-blur-2xl rounded-tl-none"
                )}
              >
                {msg.role === "model" ? (
                  <div className="markdown-body prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/20 prose-pre:border prose-pre:border-white/5 text-lg">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                ) : (
                  <p dir="auto" className="text-lg">{msg.text}</p>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-transparent px-6 py-2 flex items-center">
                <motion.div
                  className="h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent w-24 rounded-full"
                  animate={{ 
                    x: [-20, 20, -20],
                    opacity: [0.2, 0.6, 0.2]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
          <div className="relative flex items-center flex-1 bg-white/10 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl focus-within:border-indigo-500/50 transition-all group">
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
          </div>
          
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

