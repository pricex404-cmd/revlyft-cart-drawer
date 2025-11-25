import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import fs from 'fs';
import path from 'path';
import { CREATE_SCRIPT_TAG, GET_SHOP_DETAILS } from "./utils/graphqlQueries";
import { sendInstallationNotification, sendWelcomeEmail, sendErrorNotification } from "./utils/emailNotifications";

// Helper function to write logs to a file
const logToFile = (message) => {
  const logDir = path.resolve(process.cwd(), 'logs');
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, 'installation-logs.txt');
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  fs.appendFileSync(logFile, logMessage);
   // Also log to console
};

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: "2025-04",
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  hooks: {
    afterAuth: async ({ session, admin }) => {
      logToFile("========= APP INSTALLATION TRIGGERED =========");
      logToFile(`Installation started at: ${new Date().toISOString()}`);
      logToFile(`Shop: ${session.shop}`);

      try {
        // Get shop details from Shopify
        const shopResponse = await admin.graphql(GET_SHOP_DETAILS);
        const shopData = await shopResponse.json();
        const shopInfo = shopData.data.shop;

        // Prepare installation data for email notification
        const installationData = {
          shop: session.shop,
          storeName: shopInfo.name || "",
          email: shopInfo.email || "",
          country: shopInfo.billingAddress?.country || "",
          plan: shopInfo.plan?.displayName || "",
          ownerName: shopInfo.shopOwner || "",
          installedAt: new Date().toISOString(),
          installationId: `install-${Date.now()}-${session.shop.replace('.myshopify.com', '')}`
        };

        logToFile(`Shop details collected: ${JSON.stringify(installationData)}`);

        // Send email notification (async - don't await to avoid blocking installation)
        sendInstallationNotification(installationData)
          .then(result => {
            if (result.success) {
              logToFile(`✅ Installation email sent successfully: ${result.messageId}`);
            } else {
              logToFile(`❌ Email notification failed: ${result.error}`);
              // Send error notification if main notification fails
              sendErrorNotification({
                shop: session.shop,
                error: `Installation email failed: ${result.error}`,
                type: 'email_notification_failure'
              }).catch(err => logToFile(`Error notification also failed: ${err.message}`));
            }
          })
          .catch(error => {
            logToFile(`❌ Email notification error: ${error.message}`);
          });

        // Send welcome email to shop owner (async - don't await to avoid blocking installation)
        sendWelcomeEmail(installationData)
          .then(result => {
            if (result.success) {
              logToFile(`✅ Welcome email sent successfully to ${result.recipient}: ${result.messageId}`);
            } else {
              logToFile(`❌ Welcome email failed: ${result.error || result.reason}`);
            }
          })
          .catch(error => {
            logToFile(`❌ Welcome email error: ${error.message}`);
          });

        logToFile(`Installation data prepared and email notifications initiated`);

      } catch (error) {
        logToFile(`Error during installation process: ${error.message}`);
        logToFile(`Error stack: ${error.stack}`);
        
        // Send error notification for installation failures
        sendErrorNotification({
          shop: session.shop,
          error: error.message,
          stack: error.stack,
          type: 'installation_error'
        }).catch(err => logToFile(`Error notification failed: ${err.message}`));
      }

      logToFile(`===== INSTALLATION PROCESS COMPLETE =====`);
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = "2025-04";
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
