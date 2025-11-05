import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, FunctionDeclaration, Type, Part } from "@google/genai";

// Define interfaces locally to avoid module resolution issues in serverless env
interface StorySource {
  title: string;
  uri: string;
}
interface Annotation {
  term: string;
  explanation: string;
}
interface BriefingContent {
  greeting: string;
  intro: string;
  timestamp: string;
  body: string;
  outro: string;
  annotations?: Annotation[];
}
interface Briefing {
  content: BriefingContent;
  sources: StorySource[];
}

// Check for environment variables
if (!process.env.API_KEY || !process.env.CSE_API_KEY || !process.env.CSE_ID) {
    console.error("Missing required environment variables for API communication.");
    // Don't throw here, as it would crash the deployment. Instead, let the handler fail.
}

const GEMINI_API_KEY = process.env.API_KEY;
const CSE_API_KEY = process.env.CSE_API_KEY;
const CSE_ID = process.env.CSE_ID;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function searchWeb(query: string): Promise<{ searchResultsString: string, sources: StorySource[] }> {
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
            return { searchResultsString: "No results found.", sources: [] };
        }

        const sources: StorySource[] = data.items.map((item: any) => ({
            title: item.title,
            uri: item.link,
        }));

        const searchResultsString = data.items.map((item: any) => 
            `Title: ${item.title}\nURL: ${item.link}\nSnippet: ${item.snippet}`
        ).join('\n\n');

        return { searchResultsString, sources };

    } catch (error) {
        console.error("Error calling Google Custom Search API:", error);
        return { searchResultsString: "Error performing search.", sources: [] };
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

const getBriefingPrompt = (date: Date, country?: string | null): string => {
    const formattedDate = new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date); // YYYY-MM-DD
    const localTime = new Intl.DateTimeFormat('el-GR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Athens' }).format(new Date());

    return `
    Λειτούργησε ως παγκόσμιας κλάσης αρχισυντάκτης για ένα μινιμαλιστικό, ειδησεογραφικό brief με επίκεντρο το κείμενο, που ονομάζεται THE QBIT.
    Ο στόχος σου είναι να εντοπίσεις τις 7-10 πιο σημαντικές και επιδραστικές ${country ? `ειδήσεις από την ${country}` : 'παγκόσμιες ειδήσεις'} για τη συγκεκριμένη ημερομηνία: ${formattedDate}.
    
    **Σημαντικό**: Πρέπει **οπωσδήποτε** να χρησιμοποιήσεις το εργαλείο 'searchWeb' για να βρεις σχετικά ειδησεογραφικά άρθρα. Διατύπωσε ένα κατάλληλο ερώτημα αναζήτησης (query) για να βρεις τις κορυφαίες ειδήσεις.

    Αφού λάβεις τα αποτελέσματα της αναζήτησης, δημιούργησε ένα ενιαίο, συνεκτικό άρθρο.
    Η τελική σου απάντηση πρέπει να είναι ένα αντικείμενο JSON με τα εξής κλειδιά: 'greeting', 'intro', 'timestamp', 'body', 'outro', και 'annotations'.

    1.  'greeting': Ένας φιλικός, δημιουργικός και κατάλληλος για την ώρα της ημέρας χαιρετισμός (η τρέχουσα ώρα είναι ${localTime}). Μπορείς να χρησιμοποιήσεις κάτι κλασικό όπως 'Καλημέρα' ή να σκεφτείς κάτι πιο πρωτότυπο.
    2.  'intro': Μια σύντομη εισαγωγική πρόταση, π.χ., "Το μόνο που χρειάζεσαι να διαβάσεις σήμερα.".
    3.  'timestamp': Μια συμβολοσειρά με την πλήρη ημερομηνία και την τρέχουσα ώρα. Παράδειγμα: "Τρίτη, 16 Ιουλίου 2024, ${localTime}".
    4.  'body': Το κυρίως σώμα του άρθρου. Ενσωμάτωσε τις 7-10 ειδήσεις σε ένα ενιαίο κείμενο. Για κάθε είδηση, δημιούργησε μια ενότητα με έναν τίτλο σε μορφή markdown (π.χ., "### Ο τίτλος της είδησης εδώ"). Το κείμενο πρέπει να είναι ουδέτερο, διεισδυτικό και να ρέει φυσικά από τη μια είδηση στην άλλη. Χρησιμοποίησε '\\n\\n' για να διαχωρίσεις τις παραγράφους.
    5.  'outro': Μια σύντομη, έξυπνη ή στοχαστική πρόταση κλεισίματος. Μπορείς εναλλακτικά να χρησιμοποιήσεις ένα σχετικό απόφθεγμα από μια διάσημη προσωπικότητα. Νιώσε ελεύθερος να πρωτοτυπήσεις και να αποφύγεις τις επαναλαμβανόμενες φράσεις.
    6.  'annotations': Ένας πίνακας (array) με 3-5 αντικείμενα. Κάθε αντικείμενα πρέπει να έχει ένα κλειδί 'term' (ένας όρος, ακρωνύμιο ή έννοια από το 'body' που χρήζει εξήγησης) και ένα κλειδί 'explanation' (μια σύντομη, σαφής εξήγηση του όρου). Επίλεξε όρους που είναι σημαντικοί για την κατανόηση των ειδήσεων.

    Η τελική έξοδος πρέπει να είναι ένα ενιαίο, minified αντικείμενο JSON. Μην συμπεριλάβεις τίποτα άλλο στην τελική σου απάντηση.
    `;
}

export default async function handler(req: VerrcelRequest, res: VercelResponse) {
    if (!GEMINI_API_KEY || !CSE_API_KEY || !CSE_ID) {
        return res.status(500).json({ error: "Server-side API keys are not configured." });
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).end('Method Not Allowed');
    }

    const { date: dateString, country: countryString } = req.query;

    if (!dateString || typeof dateString !== 'string') {
        return res.status(400).json({ error: 'Date parameter is required.' });
    }

    const date = new Date(dateString);
    const country = typeof countryString === 'string' ? countryString : null;
    
    let rawResponseText: string | undefined = "";
    const allSources: StorySource[] = [];

    try {
        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            config: {
                temperature: 0.5,
                tools: [{ functionDeclarations: [searchTool] }],
            },
        });

        const prompt = getBriefingPrompt(date, country);
        // FIX: Argument of type 'string' is not assignable to parameter of type 'SendMessageParameters'. The `sendMessage` method expects an object with a `message` property.
        let result = await chat.sendMessage({ message: prompt });
        
        while (true) {
            const functionCalls = result.functionCalls;
            if (!functionCalls || functionCalls.length === 0) { break; }
            
            const functionResponseParts: Part[] = [];
            for (const call of functionCalls) {
                if (call.name === 'searchWeb') {
                    const query = call.args?.query;
                    if (typeof query === 'string') {
                        const { searchResultsString, sources } = await searchWeb(query);
                        allSources.push(...sources);
                        functionResponseParts.push({
                            functionResponse: {
                                name: 'searchWeb',
                                response: { content: searchResultsString },
                            }
                        });
                    }
                }
            }
            
            // FIX: Argument of type 'Part[]' is not assignable to parameter of type 'SendMessageParameters'. The `sendMessage` method expects an object with a `message` property.
            result = await chat.sendMessage({ message: functionResponseParts });
        }

        const finishReason = result.candidates?.[0]?.finishReason;
        if (finishReason === 'UNEXPECTED_TOOL_CALL') {
            console.error("AI stopped due to an unexpected tool call. Full response:", JSON.stringify(result, null, 2));
            return res.status(500).json({ error: "Η AI αντιμετώπισε ένα σφάλμα κατά την αναζήτηση ειδήσεων. Παρακαλώ, δοκιμάστε ξανά." });
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

        return res.status(200).json(finalBriefing);

    } catch (error) {
        console.error("Σφάλμα κατά την ανάκτηση ή την ανάλυση των ειδήσεων:", error);
        if (rawResponseText) console.error("Προβληματικό κείμενο απάντησης AI:", rawResponseText);
        return res.status(500).json({ error: "Δεν ήταν δυνατή η ανάκτηση των κορυφαίων ειδήσεων από την AI." });
    }
}