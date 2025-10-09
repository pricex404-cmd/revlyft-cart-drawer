import { authenticate } from "../shopify.server";
import path from 'path';
import fs from 'fs';

const FIREBASE_URL = "https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app/abTests/";

const logToFile = (message) => {
    const logDir = path.resolve(process.cwd(), 'logs');
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, 'shop-redact-logs.txt');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    fs.appendFileSync(logFile, logMessage);
     // Also log to console
};

export const action = async ({ request }) => {
    const { payload, topic, shop } = await authenticate.webhook(request);

    logToFile(`Received ${topic} webhook for ${shop}`);
    // const storeName = shop.split('.myshopify.com')[0];
    const storeName = shop.replace(/\./g, '_');
    try {


        // Delete store info (admin user info)
        const storeInfoResponse = await fetch(`${FIREBASE_URL}${storeName}.json`, {
            method: 'DELETE'
        });

        if (!storeInfoResponse.ok) {
            throw new Error(`Failed to delete store info: ${storeInfoResponse.statusText}`);
        }

        // Delete store-specific data
        const storeDataResponse = await fetch(`${FIREBASE_URL}${storeName}.json`, {
            method: 'DELETE'
        });

        if (!storeDataResponse.ok) {
            throw new Error(`Failed to delete store data: ${storeDataResponse.statusText}`);
        }
        logToFile(`Shop redaction completed for ${shop} ${JSON.stringify(storeDataResponse)}`);
        return new Response(null, { status: 200 });
    } catch (error) {
        logToFile(`Error processing shop redaction: ${error.message}`);
        return new Response(null, { status: 500 });
    }
}; 