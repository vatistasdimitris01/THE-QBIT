import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';
import type { GenerationParams } from '../../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const params: GenerationParams = req.body;

        if (!params || !params.date) {
            return res.status(400).json({ error: 'Invalid generation parameters provided.' });
        }

        const shareId = nanoid(10);
        const EXPIRATION_SECONDS = 86400; // 24 hours

        await kv.set(shareId, params, { ex: EXPIRATION_SECONDS });

        return res.status(200).json({ shareId });

    } catch (error) {
        console.error("Error creating share link:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return res.status(500).json({ error: 'Failed to create shareable link.', details: errorMessage });
    }
}
