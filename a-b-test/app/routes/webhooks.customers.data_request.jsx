import { authenticate } from "../shopify.server";
import path from 'path';
import fs from 'fs';

const FIREBASE_URL = "https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app/";

const logToFile = (message) => {

    const logDir = path.resolve(process.cwd(), 'logs');
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, 'customer-data-request-logs.txt');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    fs.appendFileSync(logFile, logMessage);
     // Also log to console
};

export const action = async ({ request }) => {
    const { payload, topic, shop } = await authenticate.webhook(request);

    logToFile(`Received ${topic} webhook for ${shop}`);

    try {
        // Store the data request in Firebase
        const storeName = shop.replace(/\./g, '_');
        const dataRequest = {
            customer_id: payload.customer.id,
            shop_domain: shop,
            requested_at: new Date().toISOString(),
            status: 'pending'
        };

        const response = await fetch(`${FIREBASE_URL}abTests/${storeName}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataRequest)
        });

        if (!response.ok) {
            throw new Error(`Firebase request failed: ${response.statusText}`);
        }

        return new Response(null, { status: 200 });
    } catch (error) {
        logToFile(`Error processing data request: ${error.message}`);
        return new Response(null, { status: 500 });
    }
}; 