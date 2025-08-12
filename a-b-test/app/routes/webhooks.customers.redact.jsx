import { authenticate } from "../shopify.server";
import path from 'path';
import fs from 'fs';

const FIREBASE_URL = "https://abtest-6b299-default-rtdb.firebaseio.com/";

const logToFile = (message) => {
    const logDir = path.resolve(process.cwd(), 'logs');
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, 'customer-redact-logs.txt');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    fs.appendFileSync(logFile, logMessage);
    console.log(message); // Also log to console
};

export const action = async ({ request }) => {
    const { payload, topic, shop } = await authenticate.webhook(request);

    logToFile(`Received ${topic} webhook for ${shop}`);

    try {
        const storeName = shop.replace(/\./g, '_');

        // Delete customer's survey responses
        const responsesResponse = await fetch(`${FIREBASE_URL}abTests/${storeName}.json`, {
            method: 'DELETE'
        });

        if (!responsesResponse.ok) {
            throw new Error(`Failed to delete customer responses: ${responsesResponse.statusText}`);
        }



        return new Response(null, { status: 200 });
    } catch (error) {
        logToFile(`Error processing customer redaction: ${error.message}`);
        return new Response(null, { status: 500 });
    }
}; 