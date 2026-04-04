import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateStoryTutorResponse(imageContent?: string, textContent?: string) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are a personal tutor for students. 
    Your goal is to explain complex concepts in the form of an engaging story.
    Always use simple language, as if explaining to a five-year-old (ELI5).
    Structure your response as follows:
    1. **The Story**: A short, engaging narrative that illustrates the concept.
    2. **Main Points**: 3-5 bullet points summarizing the key takeaways.
    3. **Key Terms**: Definitions of 3-5 important terms from the content.
    4. **Practice Problems**: 2 simple practice problems to test understanding.
    
    Be vibrant, encouraging, and creative!
  `;

  const parts: any[] = [];
  if (imageContent) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageContent.split(",")[1],
      },
    });
  }
  if (textContent) {
    parts.push({ text: textContent });
  } else {
    parts.push({ text: "Please explain the concepts in this image as a story." });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: { systemInstruction },
  });

  return response.text;
}

export async function generateStudyTasks(profile: any) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Based on the following student profile, generate a list of 5 personalized study tasks and 3 practice problems.
    Profile: ${JSON.stringify(profile)}
    
    Return the response in JSON format:
    {
      "tasks": [{ "title": string, "description": string, "type": "study" | "practice" }],
      "practiceProblems": [{ "question": string, "answer": string }]
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  return JSON.parse(response.text || "{}");
}
