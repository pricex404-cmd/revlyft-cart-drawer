import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function loader({ request }) {
    try {
        
        
        

        // Read the JavaScript file from the public directory
        const filePath = join(process.cwd(), 'public', 'price-modifier.js');
        
        

        const content = await readFile(filePath, 'utf-8');
        

        // Return the JavaScript content with proper headers
        const response = new Response(content, {
            headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'public, max-age=3600',
                'Access-Control-Allow-Origin': '*',
                'X-Content-Type-Options': 'nosniff'
            },
        });

    
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