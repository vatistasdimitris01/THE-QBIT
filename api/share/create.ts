import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';
import type { Briefing } from '../../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const briefing: Briefing = req.body;

        if (!briefing || !briefing.content || !briefing.content.stories) {
            return res.status(400).json({ error: 'Invalid briefing data provided.' });
        }

        const shareId = nanoid(10); // Generate a 10-character unique ID
        const EXPIRATION_SECONDS = 86400; // 24 hours

        await kv.set(shareId, briefing, { ex: EXPIRATION_SECONDS });

        return res.status(200).json({ shareId });

    } catch (error) {
        console.error("Error creating share link:", error);
        return res.status(500).json({ error: 'Failed to create shareable link.' });
    }
}
