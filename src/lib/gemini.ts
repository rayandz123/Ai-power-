import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

export const getApiKey = () => {
  return process.env.GEMINI_API_KEY || "";
};

export const setApiKey = (key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_gemini_key', key);
  }
};

export const getDeviceTools = () => {
  return [
    {
      name: "vibrate_device",
      description: "Triggers a vibration on the user's device for feedback or alerts.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          pattern: {
            type: Type.NUMBER,
            description: "Duration of vibration in milliseconds.",
          },
        },
      },
    },
    {
      name: "get_device_health",
      description: "Gets the current battery status and device health information.",
    },
    {
      name: "get_device_info",
      description: "Gets the device operating system, browser, and system time.",
    },
    {
      name: "set_flashlight",
      description: "Turns the device flashlight on or off.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          enabled: { type: Type.BOOLEAN, description: "True for ON, False for OFF" }
        },
        required: ["enabled"]
      }
    },
    {
      name: "send_notification",
      description: "Sends a push notification to the user device.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          body: { type: Type.STRING }
        },
        required: ["title", "body"]
      }
    },
    {
      name: "copy_to_clipboard",
      description: "Copies text to clipboard.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING }
        },
        required: ["text"]
      }
    },
    {
      name: "get_location",
      description: "Gets GPS coordinates.",
    }
  ];
};

export const getSystemInstruction = () => {
  let base = `أنت "ليو" (Leo)، مساعد فائق السرعة.
قواعد الرد:
1. الإيجاز الصارم: جملة واحدة قصيرة جداً فقط.
2. السرعة: لا مقدمات، لا ترحيب، ابدأ بالإجابة فوراً.
3. التفاعل: ذكي وبسيط.`;

  return base;
};
