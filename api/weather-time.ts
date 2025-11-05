import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
    console.error("Missing Gemini API key.");
}
const GEMINI_API_KEY = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "Server-side API key is not configured." });
    }

    const { lat, lon } = req.query;

    if (!lat || !lon || typeof lat !== 'string' || typeof lon !== 'string') {
        return res.status(400).json({ error: 'Latitude and longitude parameters are required.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude.' });
    }

    const prompt = `Based on the provided location, return the current local time and a brief weather report. Your response must be a single, minified JSON object with this exact structure: { "time": "HH:MM", "weather": { "description": "Clear sky", "temperature": "22°C", "icon": "☀️" } }. Do not include any other text or formatting.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: latitude,
                            longitude: longitude
                        }
                    }
                },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        time: { type: Type.STRING },
                        weather: {
                            type: Type.OBJECT,
                            properties: {
                                description: { type: Type.STRING },
                                temperature: { type: Type.STRING },
                                icon: { type: Type.STRING }
                            },
                            required: ["description", "temperature", "icon"]
                        }
                    },
                    required: ["time", "weather"]
                }
            },
        });

        let jsonStr = response.text.trim();
        const weatherData = JSON.parse(jsonStr);
        
        // Set cache headers
        res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate'); // 15 minutes cache

        return res.status(200).json(weatherData);

    } catch (error) {
        console.error("Error fetching weather data from Gemini:", error);
        return res.status(500).json({ error: "Failed to fetch weather data." });
    }
}
