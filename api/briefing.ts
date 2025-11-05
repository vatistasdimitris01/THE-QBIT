import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, FunctionDeclaration, Type, Part } from "@google/genai";

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
interface Story {
  category: string;
  title: string;
  summary: string;
  importance: number;
  annotations?: Annotation[];
}
interface BriefingContent {
  greeting: string;
  intro: string;
  timestamp: string;
  stories: Story[];
  outro: string;
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
    description: 'Searches the web for recent news articles based on a query.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: {
                type: Type.STRING,
                description: 'The search query to find news articles.'
            },
        },
        required: ['query']
    },
};

const getBriefingPrompt = (date: Date, country?: string | null, lat?: string, lon?: string): string => {
    const formattedDate = new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date); // YYYY-MM-DD
    const localTime = new Intl.DateTimeFormat('el-GR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Athens' }).format(new Date());
    const categories = "['Πολιτική', 'Οικονομία', 'Κόσμος', 'Κοινωνία', 'Αθλητισμός', 'Τεχνολογία', 'Lifestyle']";

    let locationInstructions = '';
    if (lat && lon) {
        locationInstructions = `
        **Οδηγίες Τοποθεσίας**: Ο χρήστης βρίσκεται στο latitude ${lat} και longitude ${lon}. Χρησιμοποίησε αυτή την πληροφορία για να συμπληρώσεις τα πεδία 'weather' και 'localTime'.
        `;
    }

    return `
    Λειτούργησε ως παγκόσμιας κλάσης αρχισυντάκτης για ένα μινιμαλιστικό, ειδησεογραφικό brief με επίκεντρο το κείμενο, που ονομάζεται THE QBIT.
    Ο στόχος σου είναι να εντοπίσεις τις 7-10 πιο σημαντικές και επιδραστικές ${country ? `ειδήσεις από την ${country}` : 'παγκόσμιες ειδήσεις'} για την ακριβή ημερομηνία: ${formattedDate}.
    
    **Σημαντικό**: Πρέπει **οπωσδήποτε** να χρησιμοποιήσεις το εργαλείο 'searchWeb' για να βρεις σχετικά ειδησεογραφικά άρθρα. Διατύπωσε ένα κατάλληλο ερώτημα αναζήτησης (query) για να βρεις τις κορυφαίες ειδήσεις της ημέρας (π.χ., "κορυφαίες ειδήσεις ${country || 'κόσμος'} ${formattedDate}"). Βάσισε ολόκληρη την απάντησή σου **αποκλειστικά** στα αποτελέσματα της αναζήτησης. Μην κάνεις εικασίες ή προβλέψεις για μελλοντικές ημερομηνίες. Αν η ημερομηνία είναι στο μέλλον, αναζήτησε προγραμματισμένα γεγονότα ή ανακοινώσεις για εκείνη την ημέρα.
    ${locationInstructions}
    Αφού λάβεις τα αποτελέσματα της αναζήτησης, δημιούργησε μια συλλογή από τις κορυφαίες ειδήσεις.
    Η τελική σου απάντηση πρέπει να είναι ένα αντικείμενο JSON με τα εξής κλειδιά: 'greeting', 'intro', 'timestamp', 'stories', 'outro' ${lat && lon ? ", 'weather', 'localTime'" : ""}.

    1.  'greeting': Ένας φιλικός, δημιουργικός και κατάλληλος για την ώρα της ημέρας χαιρετισμός (η τρέχουσα ώρα Αθήνας είναι ${localTime}).
    2.  'intro': Μια σύντομη εισαγωγική πρόταση, π.χ., "Το μόνο που χρειάζεσαι να διαβάσεις σήμερα.".
    3.  'timestamp': Μια συμβολοσειρά με την πλήρη ημερομηνία και την τρέχουσα ώρα Αθήνας. Παράδειγμα: "Τρίτη, 16 Ιουλίου 2024, ${localTime}".
    4.  'stories': Ένας πίνακας (array) που περιέχει 7-10 αντικείμενα ειδήσεων. Κάθε αντικείμενο πρέπει να έχει τις εξής ιδιότητες:
        *   'category': Μία από τις εξής κατηγορίες: ${categories}. Επίλεξε την πιο σχετική.
        *   'title': Ένας σαφής και ελκυστικός τίτλος για την είδηση.
        *   'summary': Μια ουδέτερη και περιεκτική περίληψη 2-4 παραγράφων. Χρησιμοποίησε '\\n' για να διαχωρίσεις τις παραγράφους.
        *   'importance': Ένας ακέραιος αριθμός από 1 (λιγότερο σημαντικό) έως 3 (πολύ σημαντικό) που αντικατοπτρίζει τη σπουδαιότητα της είδησης.
        *   'annotations': Ένας πίνακας με 2-4 αντικείμενα για βασικούς όρους μέσα στην περίληψη ('summary') αυτής της συγκεκριμένης είδησης. Κάθε αντικείμενο πρέπει να έχει 'term', 'importance' (1-3), και προαιρετικά 'explanation' για τους πιο σύνθετους όρους.
    5.  'outro': Μια σύντομη, έξυπνη ή στοχαστική πρόταση κλεισίματος.
    6.  'weather' (αν υπάρχει τοποθεσία): Ένα αντικείμενο με 'description' και 'temperature'.
    7.  'localTime' (αν υπάρχει τοποθεσία): Μια συμβολοσειρά με την τοπική ώρα HH:MM.

    Η τελική έξοδος πρέπει να είναι ένα ενιαίο, minified αντικείμενο JSON. Μην συμπεριλάβεις τίποτα άλλο στην τελική σου απάντηση.
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

    const { date: dateString, country: countryString, lat, lon } = req.query;

    if (!dateString || typeof dateString !== 'string') {
        return res.status(400).json({ error: 'Date parameter is required.' });
    }

    const date = new Date(dateString);
    const country = typeof countryString === 'string' ? countryString : null;
    
    let rawResponseText: string | undefined = "";
    const allSources: StorySource[] = [];

    try {
        const tools: any[] = [{ functionDeclarations: [searchTool] }];
        const config: any = {
            temperature: 0.5,
            tools: tools,
        };

        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            config: config,
        });

        const prompt = getBriefingPrompt(date, country, lat as string, lon as string);
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
        
        // Deduplicate sources
        const uniqueSources = Array.from(new Map<string, StorySource>(
            finalBriefing.sources.filter(s => s.uri).map(source => [source.uri, source])
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