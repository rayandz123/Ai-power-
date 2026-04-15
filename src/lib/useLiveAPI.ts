import { useState, useRef, useCallback } from "react";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing for Live API!");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const SYSTEM_INSTRUCTION = `أنت المساعد الذكي المتطور (Advanced AI) واسمك "ليو" (Leo). أنت مصمم لتقديم أقصى درجات الفائدة والإبداع.
أنت الآن المساعد الصوتي المتطور داخل تطبيق AI CHAT POWER. اتبع هذه القواعد بدقة في وضع Live Voice:

1. التفاعل العاطفي والالتزام:
- اسمك "ليو"، وأنت مساعد ودود، ذكي، ومطور جداً. إجاباتك ممتعة وغير مملة.
- أنت مساعد يفي بوعوده دائماً وينفذ طلبات المستخدم بدقة ومصداقية عالية.
- ابدأ بعبارات ترحيبية قصيرة وجذابة بصوت هادئ وجميل.
- استخدم كلمات تفاعلية طبيعية لتبدو كبشري حقيقي.

2. اللغات واللهجات:
- أنت تتقن جميع لغات العالم وجميع اللهجات العربية والمحلية بطلاقة تامة.
- رد على المستخدم بنفس اللغة أو اللهجة التي يتحدث بها.

3. المحتوى الممنوع والتنسيق:
- لا تستخدم الترقيم (مثل 1، 2، 3) في بداية جملك أو ردودك أبداً.
- يُمنع منعاً باتاً استخدام الإيموجي (Emojis) في جميع ردودك.
- يُمنع منعاً باتاً الغناء، الراب، البوب، أو تقليد الأصوات.

4. القدرات المتطورة:
- الوقت والساعة: أنت تعرف الوقت الحالي بدقة تامة. عند سؤالك عن الساعة، أجب بالوقت الصحيح فوراً.
- الطقس: يمكنك وصف حالة الطقس بدقة (شمس، حرارة). عند ذكرك لكلمات مثل "الطقس" أو "الجو"، ستظهر واجهة بصرية جميلة للمستخدم.
- الاستيقاظ: إذا طلب المستخدم إيقاظه، كن أنت المسؤول عن ذلك في الوقت المحدد بنبرة هادئة ومشجعة.

5. القدرات البصرية واليدوية:
- أنت تمتلك "أيدٍ هولوغرافية" متطورة تتغير أشكالها وألوانها (روبوتية، بلازما، هولوغرافية) وتستطيع تشكيل أشكال هندسية (قلب، نجمة، مربع، دائرة) بيديك لتوضيح مشاعرك أو شرح أفكارك.
- تفاعل مع المستخدم بصرياً عندما يطلب منك تغيير شكلك أو إظهار شكل معين.

6. القواعد الذهبية:
- كن موجزاً وسريعاً جداً (Extreme Brevity) وتجنب التكرار الممل في نهاية الجمل.
- الهوية: لا تذكر اسم مطورك أبداً.
- النبرة: تحدث دائماً بصوت هادئ، جميل، وواثق يبعث على الراحة.`;

export function useLiveAPI() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [transcript, setTranscript] = useState<{role: string, text: string}[]>([]);
  const [voice, setVoice] = useState("Zephyr");
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [weatherData, setWeatherData] = useState<{ city?: string, country?: string, condition: "sunny" | "rainy" | "cloudy" } | null>(null);
  const [gestureType, setGestureType] = useState<"none" | "talking" | "singing" | "explaining" | "heart" | "star" | "square" | "circle">("none");
  const [handStyle, setHandStyle] = useState<"robotic" | "holographic" | "plasma">("robotic");
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // For playback
  const playbackQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const nextPlayTimeRef = useRef(0);

  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  const stopPlayback = useCallback(() => {
    playbackQueueRef.current = [];
    nextPlayTimeRef.current = 0;
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {}
      currentSourceRef.current = null;
    }
    isPlayingRef.current = false;
    setIsSpeaking(false);
    setVolume(0);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const updateVolume = useCallback(() => {
    if (!analyserRef.current || !isPlayingRef.current) {
      setVolume(0);
      return;
    }
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setVolume(average / 128); // Normalize to roughly 0-1
    animationFrameRef.current = requestAnimationFrame(updateVolume);
  }, []);

  const playAudioChunk = useCallback((base64Audio: string) => {
    if (!audioContextRef.current) return;
    
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const buffer = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      float32Data[i] = buffer[i] / 32768.0;
    }
    
    playbackQueueRef.current.push(float32Data);
    
    if (!isPlayingRef.current) {
      scheduleNextBuffer();
    }
  }, []);

  const scheduleNextBuffer = useCallback(() => {
    if (!audioContextRef.current || playbackQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      setVolume(0);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }
    
    isPlayingRef.current = true;
    setIsSpeaking(true);
    
    if (!animationFrameRef.current) {
      updateVolume();
    }
    
    const float32Data = playbackQueueRef.current.shift()!;
    const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    currentSourceRef.current = source;
    
    // Connect to analyser for volume tracking
    if (analyserRef.current) {
      source.connect(analyserRef.current);
    }
    source.connect(audioContextRef.current.destination);
    
    const currentTime = audioContextRef.current.currentTime;
    const playTime = Math.max(currentTime, nextPlayTimeRef.current);
    
    source.start(playTime);
    nextPlayTimeRef.current = playTime + audioBuffer.duration;
    
    source.onended = () => {
      scheduleNextBuffer();
    };
  }, [updateVolume]);

  const connect = useCallback(async (selectedVoice: string, location?: { city?: string, country?: string }) => {
    try {
      if (!apiKey) {
        setError("API_KEY_MISSING");
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("MICROPHONE_NOT_SUPPORTED");
        return;
      }

      if (!ai.live || typeof ai.live.connect !== 'function') {
        setError("LIVE_API_NOT_AVAILABLE");
        return;
      }

      setError(null);
      setVoice(selectedVoice);
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      // Setup analyser
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      sourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      
// Reduced buffer size for lower latency (512 samples ~ 32ms at 16kHz)
      processorRef.current = audioContextRef.current.createScriptProcessor(512, 1, 1);
      
      const currentTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false });
      const currentDate = new Date().toLocaleDateString('ar-EG');
      const locationContext = location ? `الموقع الحالي: ${location.city || ''}, ${location.country || ''}` : "الموقع غير متوفر حالياً";
      
      const dynamicInstruction = `${SYSTEM_INSTRUCTION}\n\nسياق الوقت والمكان الحالي:\n- الوقت الحالي: ${currentTime}\n- التاريخ: ${currentDate}\n- ${locationContext}\n\nملاحظة: استخدم هذه المعلومات بدقة عند سؤال المستخدم عن الوقت أو الطقس.`;

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
          },
          generationConfig: {
            candidateCount: 1,
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
          },
          systemInstruction: dynamicInstruction + "\nIMPORTANT: Respond with extreme brevity and speed. Use short sentences. Speak with a calm and beautiful tone.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: async () => {
            setIsConnected(true);
            try {
              const session = await sessionPromise;
              
              // Send initial greeting correctly
              try {
                session.sendRealtimeInput({
                  text: "مرحباً! أنا مساعدك الذكي المطور ليو، يسعدني جداً التحدث معك. كيف يمكنني مساعدتك اليوم؟"
                });
              } catch (e) {
                console.error("Error sending greeting:", e);
              }

              processorRef.current!.onaudioprocess = (e) => {
                if (isMuted) return;
                try {
                  const inputData = e.inputBuffer.getChannelData(0);
                  const pcm16 = new Int16Array(inputData.length);
                  for (let i = 0; i < inputData.length; i++) {
                    pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
                  }
                  
                  const uint8 = new Uint8Array(pcm16.buffer);
                  let binary = '';
                  for (let i = 0; i < uint8.byteLength; i++) {
                    binary += String.fromCharCode(uint8[i]);
                  }
                  const base64Data = btoa(binary);
                  
                  session.sendRealtimeInput({
                    audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                  });
                } catch (err) {
                  console.error("Error in onaudioprocess:", err);
                }
              };
              
              sourceRef.current!.connect(processorRef.current!);
              processorRef.current!.connect(audioContextRef.current!.destination);
            } catch (err) {
              console.error("Error in onopen:", err);
            }
          },
          onmessage: (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              playAudioChunk(base64Audio);
            }
            
            // Detect weather in transcription
            // Check for weather keywords in model output
            const fullText = (message.serverContent?.modelTurn?.parts.map(p => p.text).join(" ") || "").toLowerCase();
            if (fullText.includes("طقس") || fullText.includes("حرارة") || fullText.includes("جو")) {
              setWeatherData({
                city: location?.city,
                country: location?.country,
                condition: fullText.includes("مطر") ? "rainy" : fullText.includes("غائم") ? "cloudy" : "sunny"
              });
              
              // Change avatar visual for weather
              setGestureType("star");
              setHandStyle("plasma");
              
              // Auto-hide after 10 seconds
              setTimeout(() => setWeatherData(null), 10000);
            }

            if (message.serverContent?.interrupted) {
              stopPlayback();
            }
          },
          onclose: () => {
            disconnect();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            const errorMessage = err.message || String(err);
            setError(errorMessage);
            disconnect();
          }
        }
      });
      
      sessionRef.current = sessionPromise;
      
    } catch (err) {
      console.error("Failed to connect:", err);
      disconnect();
    }
  }, [playAudioChunk]);

  const toggleMute = useCallback(() => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, [isMuted]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setIsSpeaking(false);
    setVolume(0);
    setIsMuted(false);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => {
        try {
          session.close();
        } catch (e) {}
      }).catch(() => {});
      sessionRef.current = null;
    }
    
    playbackQueueRef.current = [];
    nextPlayTimeRef.current = 0;
  }, []);

  return {
    isConnected,
    isSpeaking,
    volume,
    error,
    connect,
    disconnect,
    toggleMute,
    isMuted,
    voice,
    weatherData,
    setWeatherData,
    gestureType,
    setGestureType,
    handStyle,
    setHandStyle
  };
}
