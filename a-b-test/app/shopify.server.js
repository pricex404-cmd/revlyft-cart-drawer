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


      // Create script tag after app installation
      // try {
      //   await admin.graphql(
      //     CREATE_SCRIPT_TAG,
      //     {
      //       variables: {
      //         input: {
      //           src: `${process.env.SHOPIFY_APP_URL}/assets/abtest-script.js`,
      //           displayScope: "ONLINE_STORE",
      //           cache: true
      //         }
      //       }
      //     }
      //   );
      //   logToFile('Script tag was successfully created during installation');

      //   // Get shop details
      //   const shopResponse = await admin.graphql(GET_SHOP_DETAILS);
      //   const shopData = await shopResponse.json();
      //   const shopInfo = shopData.data.shop;

      //   // Make API call to notify about installation
      //   // const webhookData = {
      //   //   platform: "shopify",
      //   //   plugin_status: 'Installed',
      //   //   shop_name: session.shop.split('.')[0],
      //   //   date: new Date().toISOString().split('T')[0],
      //   //   plugin_script_url: `${process.env.SHOPIFY_APP_URL}/assets/addCartAttribute.js`,
      //   //   store_username: shopInfo.name || "",
      //   //   store_email: shopInfo.email || "",
      //   //   store_phone:  "",
      //   //   store_url: `https://${session.shop}`
      //   // };

      //   // logToFile(`Making API call to notify about installation with data: ${JSON.stringify(webhookData)}`);

      //   // const apiResponse = await fetch('https://us-central1-revlyft-21.cloudfunctions.net/ShopifyPluginWebHook/', {
      //   //   method: 'POST',
      //   //   headers: {
      //   //     'Content-Type': 'application/json',
      //   //   },
      //   //   body: JSON.stringify(webhookData)
      //   // });

      //   // if (!apiResponse.ok) {
      //   //   logToFile(`API call failed with status: ${apiResponse.status}`);
      //   //   const errorText = await apiResponse.text();
      //   //   logToFile(`Error details: ${errorText}`);
      //   // } else {
      //   //   logToFile(`Successfully notified about installation`);
      //   // }

      // } catch (error) {
      //   logToFile(`Error during installation process: ${error}`);
      // }

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
