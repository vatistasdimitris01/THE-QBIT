import type { Briefing } from '../types';

export async function getDailyBriefing(date: Date, country: string | null): Promise<{ briefing: Briefing, fromCache: boolean }> {
    const params = new URLSearchParams();
    params.append('date', date.toISOString());
    if (country) {
        params.append('country', country);
    }

    try {
        const response = await fetch(`/api/briefing?${params.toString()}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        const briefing: Briefing = await response.json();
        // The concept of 'fromCache' is no longer managed on the client, so we default to false.
        return { briefing, fromCache: false };

    } catch (error) {
        console.error("Σφάλμα κατά την ανάκτηση των ειδήσεων από το API:", error);
        if (error instanceof Error) {
            // Re-throw the specific error message from the backend.
            throw new Error(error.message);
        }
        throw new Error("Δεν ήταν δυνατή η ανάκτηση των κορυφαίων ειδήσεων.");
    }
}