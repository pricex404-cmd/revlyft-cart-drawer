import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function loader({ request }) {
    try {
        console.log('Received request for price-modifier.js');
        console.log('Request URL:', request.url);
        console.log('Request headers:', Object.fromEntries(request.headers.entries()));

        // Read the JavaScript file from the public directory
        const filePath = join(process.cwd(), 'public', 'price-modifier.js');
        console.log('Reading file from:', filePath);
        console.log('File exists:', existsSync(filePath));
        console.log('Current working directory:', process.cwd());

        const content = await readFile(filePath, 'utf-8');
        console.log('File content length:', content.length);

        // Return the JavaScript content with proper headers
        const response = new Response(content, {
            headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'public, max-age=3600',
                'Access-Control-Allow-Origin': '*',
                'X-Content-Type-Options': 'nosniff'
            },
        });

        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        return response;
    } catch (error) {
        console.error('Error serving price-modifier.js:', error);
        console.error('Error stack:', error.stack);
        return new Response('Error loading script', {
            status: 500,
            headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'no-cache'
            }
        });
    }
} 