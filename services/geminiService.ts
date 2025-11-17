import { GoogleGenAI, Type } from "@google/genai";
import { Location } from "../types";

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this example, we'll throw an error if the key is missing.
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeImageForFoodItem = async (imageFile: File, location: Location) => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          imagePart,
          {
            text: `You are an expert food inventory assistant. Your task is to analyze an image of a grocery item and determine its name and expiry date. The item will be stored in the following location: ${location}.

1.  **Identify the Item**: First, identify the primary food item in the image.
2.  **Find Expiry Date (OCR)**: Scrutinize the packaging for an expiry date. It can be in various formats (e.g., 'EXP 01/10/25', 'Best By 2025-10-01'). If you find a date, convert it to YYYY-MM-DD format.
3.  **Estimate Expiry Date**: If and ONLY IF you cannot find a printed expiry date, estimate a reasonable shelf life for the identified item based on it being stored in the '${location}'. Calculate the estimated expiry date from today's date and return it in YYYY-MM-DD format.
4.  **Respond with JSON**: Return ONLY a JSON object that matches the provided schema. The \`dateSource\` field should be 'ocr' if you read the date, 'estimated' if you estimated it, and 'none' if you couldn't determine a date. If you cannot identify the item, return null for itemName.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemName: {
              type: Type.STRING,
              description: "The name of the food item. Returns null if not identifiable.",
            },
            expiryDate: {
              type: Type.STRING,
              description: "The expiry date in YYYY-MM-DD format. Returns null if not determinable.",
            },
            dateSource: {
                type: Type.STRING,
                description: "Source of the date: 'ocr', 'estimated', or 'none'.",
            }
          },
          required: ['itemName', 'expiryDate', 'dateSource'],
        },
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    return {
        name: result.itemName || '',
        expiryDate: result.expiryDate || '',
        dateSource: result.dateSource || 'none',
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image with AI.");
  }
};

export const parseTextForFoodItem = async (text: string) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `你是一個智慧廚房助理。你的任務是從用戶的語音輸入中解析出食材資訊。
            今天的日期是 ${today}。
            請分析以下文字：「${text}」，並以 JSON 格式回傳。

            1.  **食材名稱 (itemName)**：辨識食材的名稱。
            2.  **存放位置 (location)**：辨識存放位置，並將其對應到以下枚舉值：
                - '冰箱' -> 'Fridge'
                - '冷凍庫' -> 'Freezer'
                - '儲藏室' 或 '櫃子' -> 'Pantry'
                如果未提及，則回傳 'Fridge' 作為預設值。
            3.  **有效日期 (expiryDate)**：辨識有效日期。它可以是相對日期（例如「明天」、「後天」、「三天後」）或具體日期。請將其轉換為 YYYY-MM-DD 格式。如果無法確定，請回傳 null。
            
            回傳的 JSON 必須符合指定的 schema。`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        itemName: { type: Type.STRING },
                        expiryDate: { type: Type.STRING },
                        location: { type: Type.STRING },
                    },
                    required: ['itemName', 'expiryDate', 'location'],
                },
            }
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        return {
            name: result.itemName || '',
            expiryDate: result.expiryDate || '',
            location: (result.location as Location) || Location.Fridge,
        };

    } catch (error) {
        console.error("Error parsing text:", error);
        throw new Error("Failed to parse text with AI.");
    }
};


export const getRecipeSuggestion = async (itemName: string) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a creative chef. Suggest a simple recipe that uses ${itemName}. The recipe should be easy to follow for a home cook. Provide the ingredients and step-by-step instructions in Markdown format. Start with a title for the recipe like "### Easy Cheesy Chicken".`,
            config: {
                temperature: 0.7,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error getting recipe suggestion:", error);
        throw new Error("Failed to get a recipe suggestion.");
    }
};