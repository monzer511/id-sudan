import { GoogleGenAI, Type } from "@google/genai";
import { UserData, VerificationResult } from "../types";

// Convert file to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const verifyIdentityWithGemini = async (
  userData: UserData,
  passportBase64: string,
  selfieBase64: string
): Promise<VerificationResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const fullName = `${userData.firstName} ${userData.secondName} ${userData.thirdName} ${userData.fourthName}`.trim();

    const prompt = `
      You are a STRICT Identity Verification Officer for the Sudanese Digital ID system.
      
      Task:
      1. Analyze the provided "Passport Image" and "User Selfie".
      2. Verify if the person in the selfie matches the photo in the passport image (Face Comparison).
      3. Verify if the text visible in the passport matches the provided User Data (Name, National ID).
      
      User Data Provided:
      - Name: ${fullName}
      - National ID: ${userData.nationalId}
      - Birth Date: ${userData.birthDate}
      
      STRICT RULES:
      1. National ID: Must match EXACTLY. Any difference in digits is a REJECTION.
      2. Name: Must match. If the name in the passport is completely different, REJECT it. Only very minor transliteration differences (Arabic <-> English) are allowed.
      3. Photo: Must be the same person.
      
      Output strictly in JSON format.
      If there is ANY data mismatch (even simple), set verified to false.
      
      Response Schema:
      verified: boolean (true only if EVERYTHING matches)
      confidence: number (0-100)
      reason: string (Explanation in Arabic. If rejected, explain exactly what data didn't match)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: passportBase64
            }
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: selfieBase64
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verified: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER, description: "Score between 0 and 100" },
            reason: { type: Type.STRING, description: "Explanation of the verification result in Arabic" }
          },
          required: ["verified", "confidence", "reason"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");

    return JSON.parse(resultText) as VerificationResult;

  } catch (error) {
    console.error("Gemini Verification Error:", error);
    // Fallback for demo purposes if API fails or key is missing
    return {
      verified: false,
      confidence: 0,
      reason: "حدث خطأ في الاتصال بالنظام. يرجى التحقق من مفتاح API."
    };
  }
};