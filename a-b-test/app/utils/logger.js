import fs from "fs";
import path from "path";

class Logger {
    constructor() {
        this.logDir = path.join(process.cwd(), 'logs');
        this.productDuplicateLogFile = path.join(this.logDir, 'product-duplicates.log');

        // Create logs directory if it doesn't exist
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        let logMessage = `[${timestamp}] [${level}] ${message}`;
        if (data) {
            logMessage += `\nData: ${JSON.stringify(data, null, 2)}`;
        }
        return logMessage + '\n';
    }

    async log(level, message, data = null) {
        const formattedMessage = this.formatMessage(level, message, data);

        try {
            await fs.promises.appendFile(this.productDuplicateLogFile, formattedMessage);
            // Also log to console for development
            console.log(formattedMessage);
        } catch (error) {
            console.error('Error writing to log file:', error);
        }
    }

    async info(message, data = null) {
        await this.log('INFO', message, data);
    }

    async error(message, data = null) {
        await this.log('ERROR', message, data);
    }

    async warn(message, data = null) {
        await this.log('WARN', message, data);
    }

    async debug(message, data = null) {
        await this.log('DEBUG', message, data);
    }
}

const logger = new Logger();
export default logger; 