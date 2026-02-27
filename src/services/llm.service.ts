import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const feedbackSchema = z.object({
  category: z.string(),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  sentiment: z.enum(["Positive", "Neutral", "Negative"]),
  team: z.string(),
});

export const analyzeFeedbackText = async (text: string) => {
  const prompt = `
You are an expert product manager.

Analyze the user feedback and return ONLY valid JSON in this exact format:

{
  "category": "Bug | Feature Request | UI/UX | Billing | Other",
  "priority": "Low | Medium | High | Critical",
  "sentiment": "Positive | Neutral | Negative",
  "team": "Frontend | Backend | Support | Billing | Product"
}

User feedback:
"${text}"

Return ONLY JSON. No explanation.
`;

  const apiResponse = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await apiResponse.json();

  const rawText =
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

  console.log( "rawText", rawText);

  // Parse JSON safely
  const cleanedText = rawText
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

// Parse safely
const parsed = JSON.parse(cleanedText);

return feedbackSchema.parse(parsed);
};




// import { z } from "zod";
// import dotenv from "dotenv";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// dotenv.config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// const feedbackSchema = z.object({
//   category: z.string(),
//   priority: z.enum(["Low", "Medium", "High", "Critical"]),
//   sentiment: z.enum(["Positive", "Neutral", "Negative"]),
//   team: z.string(),
// });

// export const analyzeFeedbackText = async (text: string) => {
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//   const response = await model.generateContent(`
// You are an expert product manager.
// Analyze the feedback below and return ONLY valid JSON.

// Feedback:
// ${text}

// Return format:
// {
//   "category": "",
//   "priority": "",
//   "sentiment": "",
//   "team": ""
// }
// `);

//   const rawText = response.response.text() || "";

//   const parsed = JSON.parse(rawText);

//   return feedbackSchema.parse(parsed);
// };