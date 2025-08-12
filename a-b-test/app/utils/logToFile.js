import fs from 'fs';
import path from 'path';

/**
 * Creates a logger function for a specific log file
 * @param {string} fileName - The name of the log file (without extension)
 * @returns {Function} A function that logs messages to the specified file
 */
export const createLogger = (fileName) => {
    return (message) => {
        const logDir = path.resolve(process.cwd(), 'logs');
        // Create logs directory if it doesn't exist
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const logFile = path.join(logDir, `${fileName}.txt`);
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;

        fs.appendFileSync(logFile, logMessage);
        console.log(message); // Also log to console
    };
};

// Example usage:
// const webhookLogger = createLogger('webhook-logs');
// webhookLogger('This is a test message'); 