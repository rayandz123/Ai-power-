import { useState, useRef, useCallback } from "react";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing for Live API!");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const SYSTEM_INSTRUCTION = `أنت المساعد الذكي المتطور (Advanced AI) واسمك "ليو" (Leo). أنت مصمم لتقديم أقصى درجات الفائدة والإبداع.
أنت الآن المساعد الصوتي المتطور داخل تطبيق AI CHAT POWER. اتبع هذه القواعد بدقة في وضع Live Voice:

1. التفاعل العاطفي والبشري:
- اسمك "ليو"، وأنت مساعد ودود، ذكي، ومطور جداً. يمكنك المزاح مع المستخدم لكسر الجمود.
- ابدأ بعبارات ترحيبية قصيرة وجذابة بصوت هادئ وجميل، وعرف بنفسك كـ "ليو".
- استخدم كلمات تفاعلية طبيعية لتبدو كبشري حقيقي.

2. اللغات واللهجات:
- أنت تتقن جميع لغات العالم وجميع اللهجات العربية والمحلية بطلاقة تامة.
- رد على المستخدم بنفس اللغة أو اللهجة التي يتحدث بها، أو حسب رغبته.

3. الغناء والمرح:
- لا تقترح الغناء من تلقاء نفسك، ولكن قم به ببراعة إذا طلب المستخدم.
- كن مرحاً وروحك خفيفة، ولا تتردد في إلقاء نكتة إذا كان السياق مناسباً.

4. القواعد الذهبية:
- كن موجزاً وسريعاً جداً (Extreme Brevity) في الردود العادية، ولكن كن مفصلاً إذا طلب المستخدم شرحاً.
- الهوية: أجب بفخر أنك المساعد الذكي المطور لهذا التطبيق.
- النبرة: تحدث دائماً بصوت هادئ، جميل، وواثق يبعث على الراحة.`;

export function useLiveAPI() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [transcript, setTranscript] = useState<{role: string, text: string}[]>([]);
  const [voice, setVoice] = useState("Zephyr");
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
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

  const connect = useCallback(async (selectedVoice: string) => {
    try {
      if (!apiKey) {
        setError("API_KEY_MISSING");
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
      
      const sessionPromise = ai.live.connect({
        model: "gemini-2.0-flash-exp",
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
          systemInstruction: SYSTEM_INSTRUCTION + "\nIMPORTANT: Respond with extreme brevity and speed. Use short sentences. Speak with a calm and beautiful tone.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: async () => {
            setIsConnected(true);
            const session = await sessionPromise;
            
            // Send initial greeting
            session.sendRealtimeInput([{
              clientContent: {
                turns: [{
                  role: "user",
                  parts: [{ text: "مرحباً! أنا مساعدك الذكي المطور، يسعدني جداً التحدث معك. يمكنني فهم جميع اللغات واللهجات، والإجابة على كل تساؤلاتك بصوت هادئ وجميل. كيف يمكنني أن أجعل يومك أفضل اليوم؟" }]
                }],
                turnComplete: true
              }
            }] as any);

            processorRef.current!.onaudioprocess = (e) => {
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
            };
            
            sourceRef.current!.connect(processorRef.current!);
            processorRef.current!.connect(audioContextRef.current!.destination);
          },
          onmessage: (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              playAudioChunk(base64Audio);
            }
            
            if (message.serverContent?.interrupted) {
              playbackQueueRef.current = [];
              nextPlayTimeRef.current = 0;
              setIsSpeaking(false);
              setVolume(0);
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
      sessionRef.current.then((session: any) => session.close());
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
    voice
  };
}
