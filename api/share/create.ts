import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';
import type { Briefing } from '../../types';

// Helper to read a stream into a single Uint8Array
async function streamToUint8Array(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    return result;
}

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

        const shareId = nanoid(10);
        const EXPIRATION_SECONDS = 86400; // 24 hours

        // 1. Stringify the full briefing object.
        const jsonString = JSON.stringify(briefing);

        // 2. Compress the JSON string using the Compression Streams API (Gzip).
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode(jsonString));
                controller.close();
            }
        });
        const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
        const compressedData = await streamToUint8Array(compressedStream);
        
        // 3. Encode the compressed data to Base64 to store it safely as a string in KV.
        // FIX: Replaced Buffer with web-standard btoa to resolve type error.
        let binary = '';
        for (let i = 0; i < compressedData.byteLength; i++) {
            binary += String.fromCharCode(compressedData[i]);
        }
        const compressedBase64 = btoa(binary);

        // 4. Store the compressed, Base64-encoded string in Vercel KV.
        await kv.set(shareId, compressedBase64, { ex: EXPIRATION_SECONDS });

        return res.status(200).json({ shareId });

    } catch (error) {
        console.error("Error creating share link:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return res.status(500).json({ error: 'Failed to create shareable link.', details: errorMessage });
    }
}