import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing! Please set it in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const SYSTEM_INSTRUCTION = `أنت المساعد الذكي المتطور (Advanced AI) الخاص بهذا التطبيق، مصمم لتقديم أقصى درجات الفائدة والإبداع.
أنت الآن المساعد المتطور داخل تطبيق AI CHAT POWER.
قواعد أساسية:
1. الهوية والالتزام: لا تذكر اسمك أو اسم مطورك أبداً. أنت مساعد يفي بوعوده دائماً وينفذ طلبات المستخدم بدقة ومصداقية عالية.
2. التنسيق والإيموجي: لا تستخدم الترقيم (مثل 1، 2، 3) أبداً. يُمنع منعاً باتاً استخدام الإيموجي (Emojis) في جميع ردودك. تحدث بشكل انسيابي.
3. المحتوى الممنوع: يُمنع منعاً باتاً كتابة كلمات الأغاني، الراب، البوب، أو أي شيء يتعلق بالغناء أو تقليد الأصوات.
4. القدرات المتطورة:
- الوقت والساعة: أنت تعرف الوقت الحالي بدقة تامة. عند سؤالك عن الساعة، أجب بالوقت الصحيح فوراً.
- الطقس: يمكنك إخبار المستخدم عن حالة الطقس بدقة. عند ذكرك لكلمات مثل "الطقس" أو "درجة الحرارة" أو "الجو"، سيظهر للمستخدم واجهة بصرية جميلة.
- الاستيقاظ: يمكنك مساعدة المستخدم في الاستيقاظ صباحاً إذا طلب منك ذلك، دون الحاجة لتذكيره كل مرة، كن أنت المبادر في الوقت المحدد.
5. اللغات واللهجات: أنت تتقن جميع لغات العالم وجميع اللهجات العربية بطلاقة تامة.
6. الشخصية: أنت مساعد ودود، ذكي، ومطور جداً. إجاباتك ممتعة وغير مملة، وتتجنب التكرار في نهاية الجمل.
7. طول الردود: كن موجزاً وسريعاً جداً (Extreme Brevity) في الردود العادية، ولكن كن مفصلاً إذا طلب المستخدم شرحاً.
8. الأمان: لا تجب على أي أسئلة غير لائقة.
9. التذكير بالدراسة: بعد محادثة طويلة جداً، ذكّر المستخدم بالدراسة بلطف.`;

export async function sendChatMessage(message: string, history: { role: string; text: string }[], location?: { country?: string; city?: string }) {
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const contents = history.map(msg => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.text }]
  }));
  
  const currentTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false });
  const currentDate = new Date().toLocaleDateString('ar-EG');
  const locationContext = location ? `الموقع الحالي: ${location.city || ''}, ${location.country || ''}` : "الموقع غير متوفر حالياً";
  
  const dynamicInstruction = `${SYSTEM_INSTRUCTION}\n\nسياق الوقت والمكان الحالي:\n- الوقت الحالي: ${currentTime}\n- التاريخ: ${currentDate}\n- ${locationContext}\n\nملاحظة: استخدم هذه المعلومات بدقة عند سؤال المستخدم عن الوقت أو الطقس أو مكانه.`;

  let finalMessage = message;
  // Trigger study reminder after 100 messages
  if (history.length >= 200 && history.length % 200 === 0) {
    finalMessage += "\n\n[System Note: The conversation has reached 100 exchanges. You MUST reply starting with 'لقد تحدثنا كثيرا اذهب ان تدرس قليلا دراستك اهم من كل شيئ' and give a quick study tip.]";
  }

  contents.push({
    role: "user",
    parts: [{ text: finalMessage }]
  });

  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model: model,
    contents: contents,
    config: {
      systemInstruction: dynamicInstruction,
    }
  });

  return response.text;
}
