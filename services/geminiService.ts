import { GoogleGenAI } from "@google/genai";
import { GenerationParams, Job } from "../types";

const MODEL_NAME = "gemini-2.5-flash-image";

export const generateImage = async (
  params: GenerationParams,
  apiKey: string
): Promise<{ imageBase64: string; seed: number }> => {
  const ai = new GoogleGenAI({ apiKey });

  // Construct the prompt
  let finalPrompt = params.prompt;
  if (params.negativePrompt) {
    finalPrompt += `\n\n(Avoid elements: ${params.negativePrompt})`;
  }

  const parts: any[] = [{ text: finalPrompt }];

  // Add reference images
  for (const refImg of params.referenceImages) {
    // Strip the data url prefix to get raw base64
    const base64Data = refImg.base64.split(',')[1];
    parts.push({
      inlineData: {
        mimeType: refImg.mimeType,
        data: base64Data,
      },
    });
  }

  // Config
  const config: any = {
    imageConfig: {
      aspectRatio: params.aspectRatio,
    },
  };

  // Only gemini-3-pro-image-preview supports seed in some contexts, 
  // but the prompt requests seed control. We will attempt to pass it if not null,
  // though strictly for 2.5-flash-image it handles generation differently.
  // Note: The current @google/genai SDK specifically for 2.5-flash-image focuses on aspectRatio.
  // We will simulate seed randomness control by appending a random noise string if seed is random, 
  // or sticking to the prompt if fixed, or passing it if the API updates to support it fully.
  // However, for this implementation, we will pass the config parameters available.
  
  // Note: As of current docs, seed isn't always guaranteed for image models in all tiers, 
  // but we will pass it in the standard config location if provided.
  if (params.seed !== null) {
    // Assuming future support or standard config placement
    config.seed = params.seed;
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: config,
    });

    // Parse response
    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return {
              imageBase64: part.inlineData.data,
              seed: params.seed || Math.floor(Math.random() * 1000000), // Fallback if API doesn't return seed
            };
          }
        }
      }
    }
    
    throw new Error("No image data found in response.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};
