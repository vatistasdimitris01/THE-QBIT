import type { Briefing, Story, GenerationParams } from '../types';

export async function getDailyBriefing(date: Date, country: string | null, location: { lat: number, lon: number } | null, category: string | null, signal: AbortSignal): Promise<{ briefing: Briefing, fromCache: boolean }> {
    const params = new URLSearchParams();
    params.append('date', date.toISOString());
    if (country) {
        params.append('country', country);
    }
    if (location) {
        params.append('lat', location.lat.toString());
        params.append('lon', location.lon.toString());
    }
    if (category) {
        params.append('category', category);
    }

    try {
        const response = await fetch(`/api/briefing?${params.toString()}`, { signal });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        // The API returns stories without an ID, so we add one here for client-side use.
        const rawBriefing = await response.json();
        const storiesWithIds: Story[] = rawBriefing.content.stories.map((story: Omit<Story, 'id'>, index: number) => ({
            ...story,
            id: `story-${index}`
        }));

        const briefing: Briefing = {
            ...rawBriefing,
            content: {
                ...rawBriefing.content,
                stories: storiesWithIds,
            }
        };

        return { briefing, fromCache: false };

    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.log('Fetch aborted by user.');
            throw error; // Re-throw to be caught by the calling component
        }
        console.error("Σφάλμα κατά την ανάκτηση των ειδήσεων από το API:", error);
        if (error instanceof Error) {
            // Re-throw the specific error message from the backend or the fetch error.
            throw new Error(error.message);
        }
        throw new Error("Δεν ήταν δυνατή η ανάκτηση των κορυφαίων ειδήσεων.");
    }
}
