
import { GoogleGenAI, Type } from "@google/genai";
import { MovieChallenge, GameMode } from "../types";

// Initialize the Google GenAI Client
// The API Key is automatically injected from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper for delays to prevent rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const checkApiKey = (): boolean => {
  // In this environment, we assume process.env.API_KEY is available.
  return true;
};

/**
 * Generates the movie metadata (Title, Hints, Prompts)
 */
export const generateMovieChallenge = async (era: string, mode: GameMode): Promise<MovieChallenge> => {
  // 1. Pick a specific random year to ensure variety
  let targetYear = "";
  if (era.includes("All Eras") || era === "All Time") {
    const minYear = 1990;
    const maxYear = 2024;
    const randYear = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
    targetYear = randYear.toString();
  } else {
    if (era.includes("Classics")) targetYear = (Math.floor(Math.random() * (1999 - 1980 + 1)) + 1980).toString();
    else if (era.includes("2000 - 2010")) targetYear = (Math.floor(Math.random() * (2010 - 2000 + 1)) + 2000).toString();
    else if (era.includes("2010 - 2020")) targetYear = (Math.floor(Math.random() * (2020 - 2010 + 1)) + 2010).toString();
    else if (era.includes("Latest")) targetYear = (Math.floor(Math.random() * (2024 - 2021 + 1)) + 2021).toString();
    else targetYear = "2015";
  }

  // 2. Define required fields based on mode
  const requiredFields = ["title", "language", "year"];
  if (mode === GameMode.VISUAL) {
    requiredFields.push("visualPrompts");
  }

  // 3. Define the Schema
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      language: { type: Type.STRING },
      year: { type: Type.STRING },
      difficulty: { type: Type.STRING },
      visualPrompts: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "3 simple, abstract visual concepts representing scenes"
      },
      emojiSequence: { 
        type: Type.STRING,
        description: "A string of 5-8 emojis if Emoji mode"
      },
      lyricSnippet: { type: Type.STRING, description: "Lyrics with blanks for Lyrics mode" },
      fullLyrics: { type: Type.STRING, description: "Full lyrics for reveal" },
      songName: { type: Type.STRING },
      
      hint: { type: Type.STRING },
      hero: { type: Type.STRING, description: "Name of the main male lead actor" },
      heroine: { type: Type.STRING, description: "Name of the main female lead actress" },
      cast: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "2-3 other notable actors/comedians/villains (excluding hero/heroine)"
      },
      director: { type: Type.STRING }
    },
    required: requiredFields
  };

  // 4. Construct Prompt
  let basePrompt = `You are a Tollywood movie trivia host.
    Selection Criteria:
    1. Language: Telugu (Strictly).
    2. Release Year: EXACTLY ${targetYear}.
    3. Popularity: Can be a Blockbuster, a Cult Classic, or a decently known Hit.
    4. VARIETY: Do NOT select Baahubali, RRR, or Pushpa unless specifically asked. Try to pick different movies every time.
    `;
  
  let specificInstruction = "";

  if (mode === GameMode.EMOJI) {
      specificInstruction = `
      Task: Create a sequence of 5 to 8 EMOJIS that represent the movie's title or its main plot summary.
      Do NOT use letters or numbers, ONLY emojis.
      Fill 'emojiSequence' field. 'visualPrompts' can be empty.
      Fill 'title', 'year', 'hero', 'heroine', 'director', 'cast'.
      `;
  } else if (mode === GameMode.VISUAL) {
      specificInstruction = `
      Task: Create 3 very brief, simple visual concepts representing the movie.
      Example: "A red scarf flying in air", "A warrior holding a sword", "A train station at night".
      Keep descriptions short (under 10 words) to speed up generation.
      Fill 'visualPrompts' field with 3 strings. 'emojiSequence' can be empty.
      Fill 'title', 'year', 'hero', 'heroine', 'director', 'cast'.
      `;
  } else if (mode === GameMode.HANGMAN) {
      specificInstruction = `
      Task: Select a movie title that is suitable for Hangman. 
      Avoid extremely long titles with subtitles. Prefer titles between 4 and 15 characters.
      Ensure 'title' is the exact Telugu movie name in English script.
      Fill 'visualPrompts' with empty array. 'emojiSequence' can be empty.
      Fill 'title', 'year', 'hero', 'heroine', 'director', 'cast'.
      `;
  } else if (mode === GameMode.LYRICS) {
      specificInstruction = `
      Task: Select a popular Telugu movie song from this movie.
      1. Pick a random 4-line snippet from the song (could be Pallavi or Charanam, try to vary it).
      2. Replace 2 to 3 distinct, recognizable words in these lines with "________".
      3. Fill 'lyricSnippet' with this text containing blanks.
      4. Fill 'fullLyrics' with the original text (no blanks).
      5. Fill 'songName' with the name of the song.
      6. Fill 'title' with the Movie Name.
      7. 'visualPrompts' and 'emojiSequence' can be empty.
      Fill 'year', 'hero', 'heroine', 'director', 'cast'.
      `;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: basePrompt + specificInstruction,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.9,
        // Add safety settings to prevent blocking innocuous content
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");
    
    const challenge = JSON.parse(text) as MovieChallenge;

    // FALLBACK: If visualPrompts is missing/empty in Visual Mode, populate it manually
    if (mode === GameMode.VISUAL && (!challenge.visualPrompts || challenge.visualPrompts.length === 0)) {
        console.warn("Visual Prompts missing from API response. Using fallbacks.");
        challenge.visualPrompts = [
            `A minimalist poster representing ${challenge.title}`,
            `An key object or symbol from the movie ${challenge.title}`,
            `A scene setting from ${challenge.title}`
        ];
    }

    return challenge;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Extract specific error message from API response
    let errorMessage = "Failed to generate movie challenge.";
    
    if (error?.message) {
      // Check for common API errors
      if (error.message.includes("API key expired") || error.message.includes("expired")) {
        errorMessage = "API key expired. Please renew your Gemini API key in .env.local file.";
      } else if (error.message.includes("API key not valid") || error.message.includes("invalid")) {
        errorMessage = "Invalid API key. Please check your GEMINI_API_KEY in .env.local file.";
      } else if (error.message.includes("quota") || error.message.includes("429")) {
        errorMessage = "API quota exceeded. Please try again later or upgrade your API plan.";
      } else if (error.message.includes("network") || error.message.includes("ENOTFOUND")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else {
        // Use the actual error message if available
        errorMessage = `API Error: ${error.message}`;
      }
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Generates an image based on the prompt using the Gemini Image Model.
 */
export const generateSceneImage = async (prompt: string, attempt: number = 1): Promise<string> => {
  // Simple fallback geometric pattern if API fails
  const getFallbackSVG = (color: string) => `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#1e293b"/><circle cx="400" cy="300" r="150" fill="${color}" opacity="0.5"/><text x="50%" y="50%" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="24">Image Unavailable</text></svg>`)}`;

  try {
    // Using gemini-2.5-flash-image (Nano Banana) for image generation
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // responseMimeType is not supported for gemini-2.5-flash-image
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
        for (const part of candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                const mimeType = part.inlineData.mimeType || 'image/png';
                return `data:${mimeType};base64,${part.inlineData.data}`;
            }
        }
    }

    console.warn("No image data found in response");
    return getFallbackSVG("#f43f5e");

  } catch (error: any) {
    console.error("Image generation failed:", error);
    
    // Check for Quota Exceeded (429)
    if (error.status === 429 || (error.message && error.message.includes("429"))) {
      console.warn("Quota exceeded, using fallback image.");
      return getFallbackSVG("#8b5cf6"); // Return purple placeholder immediately
    }

    if (attempt <= 2) {
      await delay(1000 * Math.pow(2, attempt)); 
      return generateSceneImage(prompt, attempt + 1);
    }
    return getFallbackSVG("#64748b");
  }
};