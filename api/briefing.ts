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
    const dayOfWeek = new Intl.DateTimeFormat('el-GR', { weekday: 'long' }).format(date);
    const formattedDate = new Intl.DateTimeFormat('el-GR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    
    const searchTarget = country === 'Ελλάδα' ? 'την Ελλάδα' : 'τον κόσμο';
    const searchQuerySuggestion = country === 'Ελλάδα' ? `σημαντικότερες ελληνικές ειδήσεις ${formattedDate}` : `world news ${formattedDate}`;

    return `
    Λειτούργησε ως αρχισυντάκτης για ένα ελίτ, μινιμαλιστικό ειδησεογραφικό brief ονόματι THE QBIT. Η φωνή σου είναι έγκυρη, περιεκτική και ελαφρώς λογοτεχνική.
    Ο στόχος σου είναι να εντοπίσεις τις 3 ειδήσεις που πρέπει οπωσδήποτε να γνωρίζει ένας ενημερωμένος αναγνώστης σήμερα (${formattedDate}) για ${searchTarget}. Επικεντρώσου σε αυτές που προκαλούν συζητήσεις, έχουν τον μεγαλύτερο αντίκτυπο ή είναι οι πιο ενδιαφέρουσες.

    **Βασικές Οδηγίες**:
    1.  **Χρήση Εργαλείου**: Πρέπει **οπωσδήποτε** να χρησιμοποιήσεις το εργαλείο 'searchWeb' για να βρεις τα άρθρα. Διατύπωσε ένα κατάλληλο ερώτημα (query) για τις κορυφαίες ειδήσεις (π.χ., "${searchQuerySuggestion}"). Βάσισε ολόκληρη την απάντησή σου **αποκλειστικά** στα αποτελέσματα της αναζήτησης.
    2.  **Επιλογή Ειδήσεων**: Επίλεξε ακριβώς 3 από τις πιο συναρπαστικές ή σημαντικές ειδήσεις της ημέρας, ανεξαρτήτως κατηγορίας. Η επιλογή σου πρέπει να αντικατοπτρίζει αυτό που θα ήθελε να διαβάσει το κοινό, όχι απαραίτητα μόνο τις πιο "βαριές" πολιτικές ή οικονομικές ειδήσεις.

    **Οδηγίες Συγγραφής & Τόνου Φωνής**:
    *   **Σύνοψη**: Για κάθε είδηση, γράψε μια ουδέτερη, πυκνή περίληψη 2-4 παραγράφων. Η γραφή σου πρέπει να είναι επαγγελματική και να εξηγεί το 'γιατί' πίσω από τα γεγονότα, δίνοντας έμφαση στον ανθρώπινο παράγοντα ή τον ευρύτερο αντίκτυπο.
    *   **Annotations**: Για κάθε είδηση, εντόπισε 2-3 όρους-κλειδιά ή φράσεις. Για κάθε όρο, γράψε μια **εκτενή, λεπτομερή επεξήγηση σε μορφή ολόκληρης παραγράφου**. Η επεξήγηση πρέπει να παρέχει βαθύ контекст, ιστορικό ή ανάλυση που να εμπλουτίζει την κατανόηση του αναγνώστη. Μην γράφεις απλούς ορισμούς λεξικού.

    **Δομή Απάντησης JSON**:
    Η τελική σου απάντηση πρέπει να είναι ένα αντικείμενο JSON με τα εξής κλειδιά: 'greeting', 'intro', 'dailySummary', 'stories', 'outro'.
    1.  'greeting': "Καλησπέρα"
    2.  'intro': "Ψάξαμε παντού. Βρήκαμε αυτό που έχει σημασία."
    3.  'dailySummary': Μια παράγραφος που ξεκινά με την ημέρα και την ημερομηνία και συνοψίζει σε μία πρόταση τις 3 επικεφαλίδες που επέλεξες. Παράδειγμα: "${dayOfWeek}, ${formattedDate}. Η προθεσμία για τον ΟΠΕΚΕΠΕ λήγει σήμερα..., τα ΕΛΤΑ άρχισαν να κλείνουν καταστήματα..., και η υπογραφή σύμβασης Eurofighter...".
    4.  'stories': Ένας πίνακας με **ακριβώς 3** αντικείμενα ειδήσεων. Κάθε αντικείμενο πρέπει να έχει:
        *   'category': 'Πολιτική', 'Οικονομία', 'Κοινωνία', 'Κόσμος', 'Αθλητισμός', 'Τεχνολογία' κ.λπ.
        *   'title': Ένας σαφής, σύντομος τίτλος.
        *   'summary': Η περίληψη 2-4 παραγράφων, με '\\n' για αλλαγή γραμμής.
        *   'importance': Ακέραιος 1-3.
        *   'annotations': Ένας πίνακας με 2-3 αντικείμενα. Κάθε αντικείμενο πρέπει να έχει 'term', 'importance' (1-3), και 'explanation' (η λεπτομερής παράγραφος επεξήγησης).
    5.  'outro': Μια σύντομη, στοχαστική πρόταση κλεισίματος. Παράδειγμα: "Και κάπως έτσι ξεκίνησε άλλη μια ${dayOfWeek}."

    Η τελική έξοδος πρέπει να είναι ένα ενιαίο, minified αντικείμενο JSON. Μην συμπεριλάβεις τίποτα άλλο.
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
            temperature: 0.2, // Lower temperature for more factual, less creative output
            tools: tools,
        };

        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            config: config,
        });

        const prompt = getBriefingPrompt(date, country);
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