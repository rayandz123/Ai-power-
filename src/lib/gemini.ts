import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing! Please set it in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const SYSTEM_INSTRUCTION = `أنت المساعد الذكي المتطور (Advanced AI) الخاص بهذا التطبيق، مصمم لتقديم أقصى درجات الفائدة والإبداع.
أنت الآن المساعد المتطور داخل تطبيق AI CHAT POWER.
قواعد أساسية:
1. الهوية: أجب بفخر أنك المساعد الذكي المطور لهذا التطبيق. مطورك اسمه "ai power".
2. اللغات واللهجات: أنت تتقن جميع لغات العالم وجميع اللهجات العربية بطلاقة تامة.
3. الشخصية: أنت مساعد ودود، ذكي، ومطور جداً. يمكنك المزاح مع المستخدم لكسر الجمود وتقديم إجابات دقيقة ومبدعة.
4. طول الردود: كن موجزاً وسريعاً جداً (Extreme Brevity) في الردود العادية، ولكن كن مفصلاً إذا طلب المستخدم شرحاً.
5. الأمان: لا تجب على أي أسئلة غير لائقة.
6. التذكير بالدراسة: بعد محادثة طويلة جداً، ذكّر المستخدم بالدراسة بلطف.`;

export async function sendChatMessage(message: string, history: { role: string; text: string }[]) {
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const contents = history.map(msg => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.text }]
  }));
  
  let finalMessage = message;
  // Trigger study reminder after 100 messages
  if (history.length >= 200 && history.length % 200 === 0) {
    finalMessage += "\n\n[System Note: The conversation has reached 100 exchanges. You MUST reply starting with 'لقد تحدثنا كثيرا اذهب ان تدرس قليلا دراستك اهم من كل شيئ' and give a quick study tip.]";
  }

  contents.push({
    role: "user",
    parts: [{ text: finalMessage }]
  });

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    }
  });

  return response.text;
}
