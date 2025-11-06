import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
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
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).end('Method Not Allowed');
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Share ID is required.' });
    }

    try {
        const storedData = await kv.get<string>(id);

        if (!storedData || typeof storedData !== 'string') {
            return res.status(404).json({ error: 'Shared briefing not found or has expired.' });
        }

        // 1. Decode the Base64 string back to a Uint8Array.
        // FIX: Replaced Buffer with web-standard atob to resolve type error.
        const binaryString = atob(storedData);
        const compressedData = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            compressedData[i] = binaryString.charCodeAt(i);
        }

        // 2. Decompress the data using the Decompression Streams API.
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(compressedData);
                controller.close();
            }
        });
        const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
        const decompressedUint8Array = await streamToUint8Array(decompressedStream);

        // 3. Decode the Uint8Array back to a JSON string.
        const jsonString = new TextDecoder().decode(decompressedUint8Array);

        // 4. Parse the JSON to get the original briefing object.
        const briefing: Briefing = JSON.parse(jsonString);

        return res.status(200).json(briefing);

    } catch (error) {
        console.error(`Error fetching shared briefing for ID ${id}:`, error);
        return res.status(500).json({ error: 'Failed to retrieve shared briefing.' });
    }
}