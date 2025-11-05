import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import type { Briefing } from '../../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).end('Method Not Allowed');
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Share ID is required.' });
    }

    try {
        const briefing = await kv.get<Briefing>(id);

        if (!briefing) {
            return res.status(404).json({ error: 'Shared briefing not found or has expired.' });
        }

        return res.status(200).json(briefing);

    } catch (error) {
        console.error(`Error fetching shared briefing for ID ${id}:`, error);
        return res.status(500).json({ error: 'Failed to retrieve shared briefing.' });
    }
}
