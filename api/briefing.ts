import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// Define interfaces locally to avoid module resolution issues in serverless env
interface StorySource {
  title: string;
  uri: string;
}
interface Annotation {
  term: string;
  explanation?: string;
  importance: number;
}
interface BriefingContent {
  greeting: string;
  intro: string;
  timestamp: string;
  body: string;
  outro: string;
  annotations?: Annotation[];
  weather?: {
    description: string;
    temperature: string;
  };
  localTime?: string;
}
interface Briefing {
  content: BriefingContent;
  sources: StorySource[];
}

// Check for environment variables
if (!process.env.API_KEY) {
    console.error("Missing required environment variable for API communication: API_KEY");
}

const GEMINI_API_KEY = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const getBriefingPrompt = (date: Date, country?: string | null, lat?: string, lon?: string): string => {
    const formattedDate = new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date); // YYYY-MM-DD
    const localTime = new Intl.DateTimeFormat('el-GR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Athens' }).format(new Date());

    let locationInstructions = '';
    if (lat && lon) {
        locationInstructions = `
        **Location Context**: The user is at latitude ${lat} and longitude ${lon}. Use this information to populate the 'weather' and 'localTime' fields.
        `;
    }

    return `
    You are a world-class editor-in-chief for a minimalist, text-centric news brief called THE QBIT.
    Your goal is to identify the 7-10 most important and impactful ${country ? `news stories from ${country}` : 'global news stories'} for the given date: ${formattedDate}.
    
    **Crucial**: You MUST use your built-in search tools to find relevant, recent news articles.
    ${locationInstructions}
    After getting search results, create a single, cohesive article.
    Your final response MUST be a JSON object with the following keys: 'greeting', 'intro', 'timestamp', 'body', 'outro', 'annotations' ${lat && lon ? ", 'weather', 'localTime'" : ""}.

    1.  'greeting': A friendly, creative, time-of-day appropriate greeting (current Athens time is ${localTime}).
    2.  'intro': A short introductory sentence, e.g., "All you need to read today.".
    3.  'timestamp': A string with the full date and current Athens time. Example: "Tuesday, July 16, 2024, ${localTime}".
    4.  'body': The main article body. Weave the 7-10 news stories into a single narrative. For each story, create a section with a markdown headline (e.g., "### Headline here"). The text should be neutral, insightful, and flow naturally. Use '\\n\\n' to separate paragraphs.
    5.  'outro': A short, witty, or thoughtful closing sentence. Feel free to be original and avoid repetitive phrases.
    6.  'annotations': An array of 15-25 objects. For each, identify key terms, phrases, names, or concepts from the 'body' text. Each object must have a 'term' (the exact text from the body) and an 'importance' (a number from 1 to 3, with 3 being most important). For the 3-5 most complex terms, also provide a short 'explanation'. For all other terms, the 'explanation' property must be omitted.
    7.  'weather' (if location provided): An object with two keys: 'description' (a short weather description, e.g., "Clear") and 'temperature' (the temperature as a string, e.g., "25°C").
    8.  'localTime' (if location provided): A string with the user's current local time in HH:MM format.

    The final output must be a single, minified JSON object. Do not wrap it in markdown backticks.
    `;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "Server-side API key is not configured." });
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).end('Method Not Allowed');
    }

    const { date: dateString, country: countryString, lat, lon } = req.query;

    if (!dateString || typeof dateString !== 'string') {
        return res.status(400).json({ error: 'Date parameter is required.' });
    }

    const date = new Date(dateString);
    const country = typeof countryString === 'string' ? countryString : null;
    
    let rawResponseText: string | undefined = "";

    try {
        const tools: any[] = [{ googleSearch: {} }];
        const config: any = {
            temperature: 0.5,
            tools: tools,
        };

        if (lat && lon && typeof lat === 'string' && typeof lon === 'string') {
            tools.push({ googleMaps: {} });
            config.toolConfig = {
                retrievalConfig: {
                    latLng: {
                        latitude: parseFloat(lat),
                        longitude: parseFloat(lon),
                    }
                }
            };
        }

        const prompt = getBriefingPrompt(date, country, lat as string, lon as string);
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: config,
        });

        rawResponseText = response.text;
        
        if (!rawResponseText) {
            console.error("AI response was empty or blocked. Full response:", JSON.stringify(response, null, 2));
            return res.status(500).json({ error: "Η AI δεν παρείχε απάντηση. Η απάντηση μπορεί να αποκλείστηκε λόγω πολιτικών ασφαλείας." });
        }

        let jsonText = rawResponseText.trim().replace(/^```json|```$/g, '');
        const parsedJson = JSON.parse(jsonText);
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: StorySource[] = groundingChunks
            .filter((chunk: any) => chunk.web && chunk.web.uri)
            .map((chunk: any) => ({
                title: chunk.web.title || new URL(chunk.web.uri).hostname,
                uri: chunk.web.uri,
            }));

        const finalBriefing: Briefing = {
            content: parsedJson,
            sources: sources,
        };
        
        // Deduplicate sources
        const uniqueSources = Array.from(new Map<string, StorySource>(
            finalBriefing.sources.map(source => [source.uri, source])
        ).values());
        finalBriefing.sources = uniqueSources;

        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300'); // Cache for 1 min, stale for 5 mins
        return res.status(200).json(finalBriefing);

    } catch (error) {
        console.error("Σφάλμα κατά την ανάκτηση ή την ανάλυση των ειδήσεων:", error);
        if (rawResponseText) console.error("Προβληματικό κείμενο απάντησης AI:", rawResponseText);
        return res.status(500).json({ error: "Δεν ήταν δυνατή η ανάκτηση των κορυφαίων ειδήσεων από την AI." });
    }
}