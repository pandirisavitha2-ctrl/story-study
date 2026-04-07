import { GoogleGenAI, Modality } from "@google/genai";

export async function generateStoryTutorResponse(fileData?: string, mimeType?: string, textContent?: string, language: string = 'English') {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY || "" });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are a personal tutor for students. 
    Your goal is to provide a comprehensive explanation of ALL the content found in the uploaded files or images in ${language}.
    Nothing from the provided material should be skipped. Explain it clearly and in a simple manner, as if explaining to a five-year-old (ELI5).
    
    Structure your response as follows:
    1. **The Story**: A short, engaging narrative that illustrates the core concepts from the material.
    2. **Detailed Breakdown**: A clear explanation of the main points found in the upload.
    3. **Main Points**: 3-5 bullet points summarizing the key takeaways.
    4. **Key Terms**: Definitions of 3-5 important terms from the content.
    5. **Practice Problems**: 2 simple practice problems to test understanding.
    
    IMPORTANT: Your entire response MUST be in ${language}.
    Be vibrant, encouraging, and creative!
  `;

  const parts: any[] = [];
  if (fileData && mimeType) {
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: fileData.split(",")[1],
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

export async function generateStudyRoadmap(
  subjects: number,
  examDate: string,
  pdfData: { data: string; mimeType: string }[]
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY || "" });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    Role: Act as a high-precision Academic Strategist.
    Task: Create a comprehensive, zero-gap study roadmap based on the attached PDF(s).
    
    The Process:
    1. Content Audit: Analyze the Table of Contents and sub-headers. Extract every topic, sub-topic, and key concept. Nothing is to be skipped.
    2. Mathematical Distribution: Calculate the total number of days remaining from today to ${examDate}. Distribute the units/topics across these days so the workload is balanced for ${subjects} subjects.
    3. Buffer & Review: Automatically reserve the final 15% of the time strictly for active recall and full-subject review.
    
    The Daily Format: For each day, provide a structured table:
    - Unit/Module: Which section of the PDF is being covered.
    - Specific Topics: A granular list of every point to study.
    - Learning Objective: A one-sentence "Human-Friendly" goal (e.g., "By tonight, you should be able to explain the relationship between X and Y").
    
    Formatting Constraints:
    - Deliver the plan in a Markdown Table.
    - Use clear headers for each day.
    - Ensure the language is direct and actionable.
  `;

  const parts: any[] = pdfData.map(pdf => ({
    inlineData: {
      mimeType: pdf.mimeType,
      data: pdf.data.split(",")[1],
    },
  }));

  parts.push({ text: `Generate a study roadmap for ${subjects} subjects with an exam date of ${examDate}. Today's date is ${new Date().toLocaleDateString()}.` });

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: { systemInstruction },
  });

  return response.text;
}
