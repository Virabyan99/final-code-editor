import { GoogleGenerativeAI  } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCWhK3KVEs8LudBVG_84IFFY_2XbU74mI8-93chGYdVFkc");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = "Explain how AI works";

const result = await model.generateContent(prompt);
console.log(result.response.text());