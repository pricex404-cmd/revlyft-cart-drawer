import { readFile } from 'fs/promises';
import { join } from 'path';

export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const fileName = url.pathname.split('/assets/')[1];
    
    // Only serve specific revlyft files
    if (!fileName || !fileName.startsWith('revlyft-')) {
      return new Response('Not found', { status: 404 });
    }

    const filePath = join(process.cwd(), 'public', 'assets', fileName);
    const fileContent = await readFile(filePath, 'utf-8');

    return new Response(fileContent, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error serving asset:', error);
    return new Response('File not found', { status: 404 });
  }
}
