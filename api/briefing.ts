
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, FunctionDeclaration, Type, Part } from "@google/genai";

// Define interfaces locally to avoid module resolution issues in serverless env
interface StorySource {
  title: string;
  uri: string;
}
interface Media {
  type: 'image' | 'youtube';
  src?: string;
  videoId?: string;
  alt?: string;
}
interface Annotation {
  term: string;
  explanation?: string;
  importance: number;
  crossLinkStoryTitle?: string;
}
interface Story {
  category: string;
  title: string;
  summary: string;
  importance: number;
  annotations?: Annotation[];
  media?: Media;
}
interface BriefingContent {
  greeting: string;
  intro: string;
  dailySummary: string;
  stories: Story[];
  outro: string;
}
interface Briefing {
  content: BriefingContent;
  sources: StorySource[];
}

// Check for environment variables
if (!process.env.API_KEY || !process.env.CSE_API_KEY || !process.env.CSE_ID) {
    console.error("Missing required environment variables for API communication.");
}

const GEMINI_API_KEY = process.env.API_KEY;
const CSE_API_KEY = process.env.CSE_API_KEY;
const CSE_ID = process.env.CSE_ID;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function searchWeb(query: string): Promise<{ searchResults: any[], sources: StorySource[] }> {
    const url = `https://www.googleapis.com/customsearch/v1?key=${CSE_API_KEY}&cx=${CSE_ID}&q=${encodeURIComponent(query)}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Google Search API Error:", errorBody);
            throw new Error(`Google Search API request failed with status ${response.status}`);
        }
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            return { searchResults: [], sources: [] };
        }

        const sources: StorySource[] = data.items.map((item: any) => ({
            title: item.title,
            uri: item.link,
        }));

        const searchResults = data.items.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet
        }));

        return { searchResults, sources };

    } catch (error) {
        console.error("Error calling Google Custom Search API:", error);
        return { searchResults: [], sources: [] };
    }
}

const searchTool: FunctionDeclaration = {
    name: 'searchWeb',
    description: 'Searches the web for recent news articles, images, and videos based on a query.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: {
                type: Type.STRING,
                description: 'The search query to find news articles and related media.'
            },
        },
        required: ['query']
    },
};

const getBriefingPrompt = (date: Date, country?: string | null, category?: string | null): string => {
    const dayOfWeek = new Intl.DateTimeFormat('el-GR', { weekday: 'long' }).format(date);
    const formattedDate = new Intl.DateTimeFormat('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
    
    let selectionCriteria: string;
    let searchTarget: string;
    let storyCount = "3 έως 5";
    
    if (category) {
        searchTarget = `την κατηγορία "${category}"`;
        selectionCriteria = `Επίλεξε τις ${storyCount} **σημαντικότερες** και πιο ενδιαφέρουσες ειδήσεις από την κατηγορία **${category}**.`;
    } else {
        searchTarget = country === 'Ελλάδα' ? 'την Ελλάδα' : 'τον κόσμο';
        selectionCriteria = `Επίλεξε ${storyCount} από τις πιο **σημαντικές** ειδήσεις για ${searchTarget}. Η επιλογή σου **πρέπει** να εστιάζει αποκλειστικά στους εξής τομείς:
        - "Politics" (Πολιτική): Επικεντρώσου στα πολιτικά θέματα που **απασχολούν περισσότερο την κοινή γνώμη** και προκαλούν τις περισσότερες συζητήσεις αυτή τη στιγμή.
        - "Economy" (Οικονομία): Οι κυριότερες οικονομικές εξελίξεις.
        - "Foreign Policy" (Εξωτερική Πολιτική): Οι διεθνείς σχέσεις και η εξωτερική πολιτική της Ελλάδας.`;
    }

    return `
    Λειτούργησε ως ένας διορατικός αναλυτής ειδήσεων και αρχισυντάκτης για το THE QBIT. Η φωνή σου είναι αυτή ενός ειδικού σχολιαστή που συνδέει διαφορετικά γεγονότα, διαβάζει πίσω από τις γραμμές και εξηγεί τις βαθύτερες επιπτώσεις.
    Ο στόχος σου είναι να εντοπίσεις τις ${storyCount} ειδήσεις με το μεγαλύτερο ενδιαφέρον και αντίκτυπο για το κοινό σήμερα (${formattedDate}) σχετικά με ${searchTarget}.

    **Βασικές Οδηγίες**:
    1.  **Χρήση Εργαλείου**: Πρέπει **οπωσδήποτε** να χρησιμοποιήσεις το εργαλείο 'searchWeb' για να βρεις τα άρθρα. Βάσισε ολόκληρη την απάντησή σου **αποκλειστικά** στα αποτελέσματα της αναζήτησης. Κάνε διεξοδικές αναζητήσεις.
    2.  **Επιλογή Ειδήσεων**: ${selectionCriteria}
    3.  **Εύρεση Πολυμέσων (ΚΡΙΣΙΜΟ)**: Για κάθε είδηση, βρες ένα σχετικό οπτικό στοιχείο.
        *   **Εικόνες**: Το 'src' της εικόνας πρέπει να είναι ένα **πλήρες, λειτουργικό, δημόσια προσβάσιμο URL** που οδηγεί απευθείας στο αρχείο εικόνας (π.χ., https://i.kathimerini.gr/image/....jpg). **ΑΠΑΓΟΡΕΥΕΤΑΙ ΑΥΣΤΗΡΑ** η χρήση placeholder URLs (όπως 'example.com' ή 'placeholder.com'). Αν δεν μπορείς να βρεις μια πραγματική, έγκυρη εικόνα, όρισε ολόκληρο το αντικείμενο 'media' σε \`null\`.
        *   **Alt Text**: Για κάθε εικόνα, πρέπει να παρέχεις ένα σύντομο, περιγραφικό κείμενο στο πεδίο 'alt'.
        *   **Βίντεο**: Αν βρεις σχετικό βίντεο YouTube, χρησιμοποίησε το videoId.
    4.  **Σε Βάθος Ανάλυση**: Για κάθε είδηση, γράψε μια **αναλυτική και διορατική ανάλυση 3-5 παραγράφων**. Μην κάνεις απλή περίληψη. Εξήγησε το γιατί, το πώς, και τις πιθανές συνέπειες.
    5.  **Annotations (Πορτοκαλί Στοιχεία)**: Για κάθε είδηση, εντόπισε **τουλάχιστον 10 σημαντικούς όρους-κλειδιά**. Η 'explanation' πρέπει να είναι μια **πλήρης, αναλυτική παράγραφος** που παρέχει βαθύ контекст, ιστορικό υπόβαθρο ή επεξήγηση.
    6.  **Διαχείριση Σφαλμάτων**: Αν η αναζήτηση δεν επιστρέψει σχετικά αποτελέσματα, **ΠΡΕΠΕΙ** να επιστρέψεις ένα έγκυρο αντικείμενο JSON με έναν κενό πίνακα 'stories' και ένα 'dailySummary' που να εξηγεί ότι δεν βρέθηκαν ειδήσεις για τα δεδομένα κριτήρια.

    **Δομή Απάντησης JSON**:
    Η τελική σου απάντηση πρέπει να είναι ένα αντικείμενο JSON με τα εξής κλειδιά: 'greeting', 'intro', 'dailySummary', 'stories', 'outro'.
    1.  'greeting': "Καλησπέρα"
    2.  'intro': "Ψάξαμε παντού. Βρήκαμε αυτό που έχει σημασία."
    3.  'dailySummary': Μια παράγραφος που ξεκινά με την ημέρα, την ημερομηνία, και μια σταθερή ώρα (π.χ., 06:00), και συνοψίζει τις επικεφαλίδες.
    4.  'stories': Ένας πίνακας με **${storyCount}** αντικείμενα ειδήσεων. Κάθε αντικείμενο πρέπει να έχει:
        *   'category', 'title', 'summary' (με '\\n'), 'importance' (1-3).
        *   'media': Αντικείμενο με 'type' ('image'/'youtube'), 'src'/'videoId', και 'alt', ή null.
        *   'annotations': Ένας πίνακας με **τουλάχιστον 10** αντικείμενα, το καθένα με 'term', 'importance' (1-3), 'explanation'.
    5.  'outro': Μια σύντομη, στοχαστική πρόταση κλεισίματος. Παράδειγμα: "Και κάπως έτσι ξεκίνησε άλλη μια ${dayOfWeek}."

    Η τελική έξοδος πρέπει να είναι ένα ενιαίο, minified αντικείμενο JSON.
    `;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!GEMINI_API_KEY || !CSE_API_KEY || !CSE_ID) {
        return res.status(500).json({ error: "Server-side API keys are not configured." });
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).end('Method Not Allowed');
    }

    const { date: dateString, country: countryString, category: categoryString } = req.query;

    if (!dateString || typeof dateString !== 'string') {
        return res.status(400).json({ error: 'Date parameter is required.' });
    }

    const date = new Date(dateString);
    const country = typeof countryString === 'string' ? countryString : null;
    const category = typeof categoryString === 'string' ? categoryString : null;
    
    let rawResponseText: string | undefined = "";
    const allSources: StorySource[] = [];

    try {
        const tools: any[] = [{ functionDeclarations: [searchTool] }];
        const config: any = {
            temperature: 0.3, 
            tools: tools,
        };

        const chat = ai.chats.create({
            model: "gemini-2.5-pro",
            config: config,
        });

        const prompt = getBriefingPrompt(date, country, category);
        let result = await chat.sendMessage({ message: prompt });
        
        while (true) {
            const functionCalls = result.functionCalls;
            if (!functionCalls || functionCalls.length === 0) { break; }
            
            const functionResponseParts: Part[] = [];
            for (const call of functionCalls) {
                if (call.name === 'searchWeb') {
                    const query = call.args?.query;
                    if (typeof query === 'string') {
                        const { searchResults, sources } = await searchWeb(query);
                        allSources.push(...sources);
                        functionResponseParts.push({
                            functionResponse: {
                                name: 'searchWeb',
                                response: { results: searchResults },
                            }
                        });
                    }
                }
            }
            
            result = await chat.sendMessage({ message: functionResponseParts });
        }

        rawResponseText = result.text;
        
        if (!rawResponseText) {
            console.error("AI response was empty or blocked. Full response:", JSON.stringify(result, null, 2));
            return res.status(500).json({ error: "Η AI δεν παρείχε απάντηση. Η απάντηση μπορεί να αποκλείστηκε λόγω πολιτικών ασφαλείας." });
        }

        let jsonText = rawResponseText.trim().replace(/^```json|```$/g, '');
        const parsedJson = JSON.parse(jsonText);

        const finalBriefing: Briefing = {
            content: parsedJson,
            sources: allSources,
        };
        
        const uniqueSources = Array.from(new Map<string, StorySource>(
            finalBriefing.sources.filter(s => s.uri).map(source => [source.uri, source])
        ).values());
        finalBriefing.sources = uniqueSources;

        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
        return res.status(200).json(finalBriefing);

    } catch (error) {
        console.error("Σφάλμα κατά την ανάκτηση ή την ανάλυση των ειδήσεων:", error);
        if (rawResponseText) console.error("Προβληματικό κείμενο απάντησης AI:", rawResponseText);
        return res.status(500).json({ error: "Δεν ήταν δυνατή η ανάκτηση των κορυφαίων ειδήσεων από την AI." });
    }
}