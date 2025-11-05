import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

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

    // FIX: Switched from a JSON prompt to a more reliable line-based text format
    // to avoid JSON parsing errors, which are common when using grounding tools.
    const prompt = `Based on the provided location, return the current local time and a brief weather report.
Format the response *exactly* as follows, with each item on a new line:
Time: [the time in HH:MM format]
Temperature: [the temperature in °C]
Description: [a brief weather description]
Icon: [a single emoji for the weather]

Do not include any other text, explanations, or formatting.`;

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
                }
            },
        });

        const rawText = response.text;
        if (!rawText) {
             throw new Error("Received an empty response from the AI.");
        }

        // FIX: Replaced unreliable JSON.parse with a robust parser for the new text format.
        const lines = rawText.trim().split('\n');
        const weatherData: {
            time: string;
            weather: { description: string; temperature: string; icon: string; };
        } = {
            time: '',
            weather: {
                description: '',
                temperature: '',
                icon: '',
            }
        };

        lines.forEach(line => {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':').trim();
            if (value) {
                switch(key.trim()) {
                    case 'Time':
                        weatherData.time = value;
                        break;
                    case 'Temperature':
                        weatherData.weather.temperature = value;
                        break;
                    case 'Description':
                        weatherData.weather.description = value;
                        break;
                    case 'Icon':
                        weatherData.weather.icon = value;
                        break;
                }
            }
        });

        if (!weatherData.time || !weatherData.weather.temperature) {
            console.error("Failed to parse weather data from AI response. Raw text:", rawText);
            throw new Error('Failed to parse weather data from AI response.');
        }
        
        // Set cache headers
        res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate'); // 15 minutes cache

        return res.status(200).json(weatherData);

    } catch (error) {
        console.error("Error fetching weather data from Gemini:", error);
        return res.status(500).json({ error: "Failed to fetch weather data." });
    }
}