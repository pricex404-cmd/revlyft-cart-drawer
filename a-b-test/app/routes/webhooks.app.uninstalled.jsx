import { authenticate } from "../shopify.server";
import db from "../db.server";
import fs from 'fs';
import path from 'path';

const FIREBASE_DB_URL = "https://abtest-6b299-default-rtdb.firebaseio.com";

// Helper function to sanitize shop domain for Firebase
const sanitizeShopDomain = (domain) => {
  if (!domain) return '';
  return domain.replace(/\./g, '_');
};

// Helper function to write logs to a file
const logToFile = (message) => {
  const logDir = path.resolve(process.cwd(), 'logs');
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, 'webhook-logs.txt');
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  fs.appendFileSync(logFile, logMessage);
  console.log(message); // Also log to console
};

export const action = async ({ request }) => {
  logToFile("========= UNINSTALLED WEBHOOK TRIGGERED =========");
  logToFile(`Received webhook request at: ${new Date().toISOString()}`);
  logToFile(`Request method: ${request.method}`);
  logToFile(`Headers: ${JSON.stringify(Object.fromEntries(request.headers.entries()))}`);

  try {
    // This will verify HMAC and throw an error if verification fails
    const { shop, session, topic, payload } = await authenticate.webhook(request);
    logToFile(`HMAC verification passed - Authenticated webhook: ${topic} for shop: ${shop}`);
    logToFile(`Session info: ${session ? `Present (ID: ${session.id})` : 'No session'}`);

    // Update all test statuses to 'pending' in Firebase
    const sanitizedDomain = sanitizeShopDomain(shop);
    const firebaseUrl = `${FIREBASE_DB_URL}/abTests/${sanitizedDomain}.json`;

    logToFile(`==========================================`);
    logToFile(`Trying to update tests for shop: ${shop}`);
    logToFile(`Sanitized domain: ${sanitizedDomain}`);
    logToFile(`Fetching tests from Firebase URL: ${firebaseUrl}`);

    try {
      // First, fetch all tests for this shop
      const response = await fetch(firebaseUrl);

      if (!response.ok) {
        logToFile(`Failed to fetch from Firebase: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch from Firebase: ${response.statusText}`);
      }

      const testsData = await response.json();

      if (testsData) {
      }

      if (testsData && typeof testsData === 'object' && Object.keys(testsData).length > 0) {
        // First, handle product-details tests
        for (const [testId, test] of Object.entries(testsData)) {
          if (test?.basicInfo?.type === 'productDetails') {
            try {
              logToFile(`Processing product-details test for deletion: ${testId}`);

              // Make API call to delete product duplicates
              const deleteResponse = await fetch(`${process.env.SHOPIFY_APP_URL}/api/delete-product-duplicates?testId=${testId}&shop=${shop}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Access-Token': session.accessToken,
                  'X-Shopify-Shop-Domain': shop
                }
              });

              if (!deleteResponse.ok) {
                const errorText = await deleteResponse.text();
                logToFile(`Failed to delete product duplicates: ${errorText}`);
                // Continue with uninstallation even if deletion fails
              } else {
                const deleteResult = await deleteResponse.json();
                logToFile(`Successfully deleted product duplicates: ${JSON.stringify(deleteResult)}`);
              }
            } catch (deleteError) {
              logToFile(`Error during product deletion: ${deleteError}`);
              // Continue with uninstallation even if deletion fails
            }
          }
        }

        // Update each test's status to 'pending'
        const updatedTests = Object.entries(testsData).reduce((acc, [testId, test]) => {

          // Make sure we have a valid test object with basicInfo
          if (!test || !test.basicInfo) {
            acc[testId] = test; // Keep it unchanged
            return acc;
          }

          // Create a new test object without discountID
          const { discountId, ...restBasicInfo } = test.basicInfo;

          acc[testId] = {
            ...test,
            basicInfo: {
              ...restBasicInfo,
              status: 'pending',
              updatedAt: new Date().toISOString()
            }
          };
          return acc;
        }, {});

        // Update Firebase with all tests set to pending
        try {
          const updateResponse = await fetch(firebaseUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTests)
          });

          logToFile(`Firebase update response status: ${updateResponse.status}`);

          if (!updateResponse.ok) {
            logToFile(`Firebase update failed: ${updateResponse.status} ${updateResponse.statusText}`);
            const errorText = await updateResponse.text();
            logToFile(`Error details: ${errorText}`);
            throw new Error(`Failed to update Firebase: ${updateResponse.statusText}`);
          }

          // Verify the update was successful
          logToFile(`Verifying Firebase update...`);
          const verifyResponse = await fetch(firebaseUrl);
          logToFile(`Verification response status: ${verifyResponse.status}`);

          if (verifyResponse.ok) {
            const verifiedData = await verifyResponse.json();
            logToFile(`Verification successful`);

            // Check if statuses were actually updated
            let allUpdatedToPending = true;
            if (verifiedData && typeof verifiedData === 'object') {
              Object.entries(verifiedData).forEach(([testId, test]) => {
                if (test?.basicInfo?.status !== 'pending') {
                  allUpdatedToPending = false;
                }
              });
            }

            if (allUpdatedToPending) {
              logToFile(`All tests successfully updated to pending status!`);
            } else {
              logToFile(`Some tests were not updated to pending status!`);
            }
          } else {
            logToFile(`Verification failed: ${verifyResponse.status}`);
          }
        } catch (updateError) {
          logToFile(`Error during Firebase update: ${updateError}`);
          // Continue with uninstallation even if Firebase update fails
        }

        logToFile(`Successfully processed tests for shop: ${shop}`);
      } else {
        logToFile(`No tests found for shop: ${shop} or invalid data structure`);
      }
    } catch (firebaseError) {
      logToFile(`Error with Firebase operations: ${firebaseError}`);
      // Continue with uninstallation even if Firebase operations fail
    }

    // Delete session if it exists
    if (session) {
      try {
        await db.session.deleteMany({ where: { shop } });
        logToFile(`Successfully deleted session for shop: ${shop}`);
      } catch (dbError) {
        logToFile(`Error deleting session: ${dbError}`);
      }
    }

    logToFile(`===== UNINSTALLED WEBHOOK PROCESSING COMPLETE =====`);

    // Make API call to notify about uninstallation
    // try {
    //   const webhookData = {
    //     platform: "shopify",
    //     plugin_status: 'Uninstalled',
    //     shop_name: shop.split('.')[0], // Extract shop name from domain
    //     date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    //     plugin_script_url: `${process.env.SHOPIFY_APP_URL}/assets/addCartAttribute.js`,
    //     store_username: payload.shop_owner || "",
    //     store_email: payload.customer_email || "",
    //     store_phone: payload.phone || "",
    //     store_url: `https://${shop}`
    //   };
    //   logToFile(`Webhook data: ${shop}`);
    //   logToFile(`Making API call to notify about uninstallation with data: ${JSON.stringify(webhookData)}`);

    //   const apiResponse = await fetch('https://us-central1-revlyf-21.cloudfunctions.net/ShopifyPluginWebHook/', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(webhookData)
    //   });

    //   if (!apiResponse.ok) {
    //     logToFile(`API call failed with status: ${apiResponse.status}`);
    //     const errorText = await apiResponse.text();
    //     logToFile(`Error details: ${errorText}`);
    //   } else {
    //     logToFile(`Successfully notified about uninstallation`);
    //   }
    // } catch (apiError) {
    //   logToFile(`Error making API call: ${apiError}`);
    //   // Continue with uninstallation even if API call fails
    // }
  } catch (error) {
    logToFile(`Error in uninstall webhook: ${error}`);
    // If HMAC verification fails, return 401
    if (error.message && error.message.includes('HMAC')) {
      return new Response("HMAC verification failed", { status: 401 });
    }
    // Return success anyway to acknowledge receipt of the webhook
    logToFile(`Returning success response despite error to acknowledge webhook receipt`);
  }

  // Always return 200 to acknowledge receipt of the webhook
  return new Response("Webhook processed", { status: 200 });
};
