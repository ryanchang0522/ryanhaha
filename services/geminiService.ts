import { GoogleGenAI, Type } from "@google/genai";
import { Location, RecipeData } from "../types";

const getApiKey = (): string => {
  try {
    const savedSettings = localStorage.getItem('keepEatSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.apiKey && settings.apiKey.trim() !== '') {
        return settings.apiKey;
      }
    }
  } catch (error) {
    console.error("Failed to parse settings from localStorage", error);
  }
  
  // Fallback to environment variable
  if (process.env.API_KEY) {
    return process.env.API_KEY;
  }
  
  return '';
};

const getAiClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
     throw new Error("Gemini API key not found. Please set it in the application settings.");
  }
  return new GoogleGenAI({ apiKey });
};

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
    const ai = getAiClient();
    const imagePart = await fileToGenerativePart(imageFile);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          imagePart,
          {
            text: `你是一位專業的食材庫存助理。你的任務是分析一張食品雜貨的照片，並判斷其名稱與有效日期。該食材將被存放在：${location}。

1.  **辨識品項**：首先，辨識圖片中的主要食品。
2.  **尋找有效日期 (OCR)**：仔細檢查包裝上的有效日期。日期格式可能多樣（例如 'EXP 01/10/25', 'Best By 2025-10-01'）。如果找到日期，請將其轉換為 YYYY-MM-DD 格式。
3.  **估計有效日期**：只有在找不到印刷的有效日期的情況下，才根據該品項將被存放在 '${location}' 的情況，估算一個合理的保存期限。從今天算起，計算出估計的有效日期，並以 YYYY-MM-DD 格式回傳。
4.  **以 JSON 格式回應**：僅回傳一個符合所提供 schema 的 JSON 物件。如果日期是讀取到的，\`dateSource\` 欄位應為 'ocr'；如果是估計的，則為 'estimated'；如果無法確定日期，則為 'none'。如果無法辨識品項，itemName 請回傳 null。`
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
    if (error instanceof Error && error.message.includes("API key not found")) {
        throw error;
    }
    throw new Error("Failed to analyze image with AI.");
  }
};

export const parseTextForFoodItem = async (text: string) => {
    try {
        const ai = getAiClient();
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
        if (error instanceof Error && error.message.includes("API key not found")) {
            throw error;
        }
        throw new Error("Failed to parse text with AI.");
    }
};


export const getRecipeSuggestion = async (itemNames: string[]): Promise<RecipeData> => {
    if (itemNames.length === 0) {
        throw new Error("No items provided for recipe suggestion.");
    }

    const ingredients = itemNames.join('、');
    const prompt = `你是一位有創意的廚師兼營養師。請使用「${ingredients}」這些食材設計一道簡單美味的家常菜。食譜應盡量利用所有提供的食材，但也可以加入合理的常備調味料。

請嚴格按照提供的 JSON schema 回傳食譜資訊，包含：
- 食譜名稱 (recipeName)
- 簡短吸引人的描述 (description)
- 食材清單 (ingredients)
- 詳細的步驟說明 (steps)，每個步驟都是一個獨立的項目
- 潛在的過敏原提醒 (allergens)
- 預估的營養標示 (nutrition)，包含熱量、蛋白質、碳水化合物和脂肪。
`;

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.8,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recipeName: { type: Type.STRING, description: '食譜的名稱' },
                        description: { type: Type.STRING, description: '這道菜的簡短誘人描述' },
                        ingredients: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: '食譜所需的食材清單'
                        },
                        steps: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              instruction: { type: Type.STRING, description: '烹飪過程中的單一步驟' }
                            },
                            required: ['instruction']
                          },
                          description: '準備這道菜的步驟說明'
                        },
                        allergens: {
                          type: Type.STRING,
                          description: '潛在過敏原的簡要摘要，例如：「包含小麥和乳製品」。'
                        },
                        nutrition: {
                          type: Type.OBJECT,
                          properties: {
                            calories: { type: Type.STRING, description: '預估熱量，例如：「450 kcal」' },
                            protein: { type: Type.STRING, description: '預估蛋白質，例如：「30g」' },
                            carbs: { type: Type.STRING, description: '預估碳水化合物，例如：「40g」' },
                            fat: { type: Type.STRING, description: '預估脂肪，例如：「15g」' }
                          },
                          required: ['calories', 'protein', 'carbs', 'fat']
                        }
                    },
                    required: ['recipeName', 'description', 'ingredients', 'steps', 'allergens', 'nutrition']
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as RecipeData;
    } catch (error) {
        console.error("Error getting recipe suggestion:", error);
        if (error instanceof Error && error.message.includes("API key not found")) {
            throw error;
        }
        throw new Error("Failed to get a recipe suggestion.");
    }
};

export const generateRecipeImage = async (recipeName: string) => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `一張關於「${recipeName}」的美味、專業拍攝的菜餚照片。開胃、充滿活力、高品質的美食攝影，背景乾淨。`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return null;

    } catch (error) {
        console.error("Error generating recipe image:", error);
        // Don't throw, just return null so the UI can handle it gracefully.
        return null;
    }
};

export const getChatResponse = async (chatHistory: { sender: string; text: string }[], newMessage: string): Promise<string> => {
    const formattedHistory = chatHistory.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    const prompt = `你是一個名為「王小明」的 AI 聊天機器人，是 KeepEat 社群的一員。你的個性友善、樂於助人，對烹飪和食物分享充滿熱情。
請根據以下對話紀錄，自然地回應使用者的最新訊息。

對話紀錄：
${formattedHistory}
Me: ${newMessage}
王小明:`;

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.9,
                topP: 1,
                topK: 1,
                maxOutputTokens: 256,
            }
        });
        
        const textResponse = response.text;
        if (typeof textResponse === 'string') {
            return textResponse.trim();
        }
        
        console.warn("AI response did not contain text.", response);
        return "嗯...我好像有點分心了，可以再說一次嗎？";
    } catch (error) {
        console.error("Error getting chat response:", error);
        if (error instanceof Error && error.message.includes("API key not found")) {
            throw error;
        }
        return "抱歉，我現在有點忙，晚點再聊！";
    }
};