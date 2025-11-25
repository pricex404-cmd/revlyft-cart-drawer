import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

// Create transporter using Brevo (formerly Sendinblue)
const createBrevoTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com', 
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_LOGIN, // Your Brevo SMTP login (generated ID)
      pass: process.env.BREVO_API_KEY // Your Brevo SMTP key
    },
    debug: true, // Add debug for troubleshooting
    logger: true
  });
};

export const sendInstallationNotification = async (shopData) => {
  // Check if Brevo credentials are configured
  if (!process.env.BREVO_SMTP_LOGIN || !process.env.BREVO_SENDER_EMAIL || !process.env.BREVO_API_KEY) {
    console.log('📧 Brevo email configuration missing - skipping installation notification');
    return { success: false, reason: 'brevo_not_configured' };
  }

  try {
    const transporter = createBrevoTransporter();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .shop-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 New Shopify App Installation!</h1>
                <p>Someone just installed your RevLyft app</p>
            </div>
            
            <div class="content">
                <div class="shop-details">
                    <h3>📊 Shop Information</h3>
                    <p><strong>🏪 Shop Domain:</strong> ${shopData.shop}</p>
                    <p><strong>🏢 Store Name:</strong> ${shopData.storeName || 'Not provided'}</p>
                    <p><strong>📧 Store Email:</strong> ${shopData.email || 'Not provided'}</p>
                    <p><strong>🌍 Country:</strong> ${shopData.country || 'Not provided'}</p>
                    <p><strong>💼 Shopify Plan:</strong> ${shopData.plan || 'Not provided'}</p>
                    <p><strong>⏰ Installed At:</strong> ${new Date(shopData.installedAt).toLocaleString()}</p>
                    <p><strong>👤 Owner:</strong> ${shopData.ownerName || 'Not provided'}</p>
                </div>

                <div style="text-align: center;">
                    <a href="https://${shopData.shop}/admin" class="button">
                        Visit Store Admin 🔗
                    </a>
                    <a href="https://partners.shopify.com/" class="button" style="background: #28a745;">
                        Partner Dashboard 📊
                    </a>
                </div>

                <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <h4>🎯 Quick Actions:</h4>
                    <ul>
                        <li>Check if they need onboarding help</li>
                        <li>Monitor their first test creation</li>
                        <li>Send welcome email if needed</li>
                    </ul>
                </div>
            </div>

            <div class="footer">
                <p>This notification was sent automatically from your Shopify RevLyft App</p>
                <p>📍 Installation ID: ${shopData.installationId || 'N/A'}</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: `"${shopData.storeName || 'RevLyft'}" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: process.env.NOTIFICATION_EMAIL,
      subject: `🎉 New Installation: ${shopData.shop} - ${shopData.storeName}`,
      html: htmlContent,
      text: `New Shopify App Installation!
      
Shop: ${shopData.shop}
Store: ${shopData.storeName}
Email: ${shopData.email}
Country: ${shopData.country}
Plan: ${shopData.plan}
Installed: ${new Date(shopData.installedAt).toLocaleString()}

Visit: https://${shopData.shop}/admin`
    };

    // Add installation log file as attachment (if it exists)
    const logFile = path.resolve(process.cwd(), 'logs', 'installation-logs.txt');
    if (fs.existsSync(logFile)) {
      mailOptions.attachments = [{
        filename: 'installation-logs.txt',
        path: logFile
      }];
    }

    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };

  } catch (error) {
    console.error('❌ Email send failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test function to verify Brevo setup
export const testEmailSetup = async () => {
  const testData = {
    shop: 'test-store.myshopify.com',
    storeName: 'Test Store',
    email: 'test@example.com',
    country: 'United States',
    plan: 'Basic Shopify',
    ownerName: 'John Doe',
    installedAt: new Date().toISOString(),
    installationId: 'test-12345'
  };

  console.log('🧪 Testing Brevo email setup...');
  const result = await sendInstallationNotification(testData);
  
  if (result.success) {
    console.log('✅ Test email sent successfully!', result.messageId);
  } else {
    console.log('❌ Test email failed:', result.error);
  }
  
  return result;
};

// Welcome email function for shop owners
export const sendWelcomeEmail = async (shopData) => {
  // Check if Brevo credentials are configured
  if (!process.env.BREVO_SMTP_LOGIN || !process.env.BREVO_SENDER_EMAIL || !process.env.BREVO_API_KEY) {
    console.log('📧 Brevo email configuration missing - skipping welcome email');
    return { success: false, reason: 'brevo_not_configured' };
  }

  // Check if shop email is available
  if (!shopData.email) {
    console.log('⚠️ Shop email not available - skipping welcome email');
    return { success: false, reason: 'no_shop_email' };
  }

  try {
    const transporter = createBrevoTransporter();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 40px 30px; }
            .welcome-box { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea; }
            .feature-box { background: white; padding: 20px; border-radius: 6px; margin: 15px 0; border: 1px solid #e1e8ed; }
            .feature-icon { font-size: 24px; margin-right: 10px; }
            .button { display: inline-block; padding: 14px 32px; background: #667eea; color: white !important; text-decoration: none; border-radius: 6px; margin: 25px 0; font-weight: 600; }
            .button:hover { background: #5568d3; }
            .steps { background: #e8f5e8; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .steps ol { margin: 10px 0; padding-left: 20px; }
            .steps li { margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
            .support-box { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to RevLyft!</h1>
                <p style="font-size: 18px; margin-top: 10px;">Start optimizing your store today</p>
            </div>
            
            <div class="content">
                <div class="welcome-box">
                    <h2>Hello ${shopData.ownerName || 'there'}! 👋</h2>
                    <p style="font-size: 16px; margin: 15px 0;">
                        Thank you for choosing RevLyft for <strong>${shopData.storeName || shopData.shop}</strong>! 
                        We're thrilled to have you on board and excited to help you grow your business.
                    </p>
                    <p style="font-size: 16px; margin: 15px 0;">
                        Your success is our priority, and we're here to support you every step of the way.
                    </p>
                </div>

                <div style="background: #e8f5e8; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
                    <h3 style="color: #28a745; margin-top: 0;">🎯 We're Here for You</h3>
                    <p style="font-size: 16px; margin: 15px 0;">
                        Our team will be reaching out to you soon to ensure you get the most out of RevLyft. 
                        In the meantime, feel free to explore the app and all the features we've built for you.
                    </p>
                </div>

                <div style="text-align: center; margin: 35px 0;">
                    <a href="https://${shopData.shop}/admin/apps" class="button">
                        Get Started 🚀
                    </a>
                </div>

                <div class="support-box">
                    <h4 style="margin-top: 0;">💬 Questions or Need Assistance?</h4>
                    <p style="margin-bottom: 10px;">
                        Don't hesitate to reach out! Our dedicated support team is always ready to help you succeed.
                    </p>
                    <p style="margin-bottom: 0; font-weight: 600;">
                        We value your partnership and look forward to helping you achieve your goals.
                    </p>
                </div>

                <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 6px; text-align: center;">
                    <p style="font-size: 16px; color: #667eea; font-weight: 600; margin: 0;">
                        ✨ Welcome to the RevLyft family! ✨
                    </p>
                </div>
            </div>

            <div class="footer">
                <p><strong>Happy Testing! 🎉</strong></p>
                <p>The RevLyft Team</p>
                <p style="font-size: 12px; color: #999; margin-top: 15px;">
                    You received this email because you installed RevLyft on your Shopify store.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: `"RevLyft" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: shopData.email,
      subject: `🎉 Welcome to RevLyft - Let's Optimize ${shopData.storeName || 'Your Store'}!`,
      html: htmlContent,
      text: `Welcome to RevLyft!

Hello ${shopData.ownerName || 'there'},

Thank you for choosing RevLyft for ${shopData.storeName || shopData.shop}! We're thrilled to have you on board and excited to help you grow your business.

Your success is our priority, and we're here to support you every step of the way.

WE'RE HERE FOR YOU
Our team will be reaching out to you soon to ensure you get the most out of RevLyft. In the meantime, feel free to explore the app and all the features we've built for you.

Get started: https://${shopData.shop}/admin/apps

QUESTIONS OR NEED ASSISTANCE?
Don't hesitate to reach out! Our dedicated support team is always ready to help you succeed. We value your partnership and look forward to helping you achieve your goals.

Welcome to the RevLyft family!

The RevLyft Team`
    };

    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId,
      response: result.response,
      recipient: shopData.email
    };

  } catch (error) {
    console.error('❌ Welcome email send failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Simple error notification function
export const sendErrorNotification = async (errorData) => {
  if (!process.env.BREVO_SMTP_LOGIN || !process.env.BREVO_SENDER_EMAIL || !process.env.BREVO_API_KEY) {
    console.log('📧 Brevo not configured - skipping error notification');
    return { success: false, reason: 'brevo_not_configured' };
  }

  try {
    const transporter = createBrevoTransporter();

    const mailOptions = {
      from: `"RevLyft Alerts" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: process.env.NOTIFICATION_EMAIL,
      subject: `🚨 App Error: ${errorData.shop || 'Unknown Shop'}`,
      html: `
        <h2>🚨 Application Error</h2>
        <p><strong>Shop:</strong> ${errorData.shop || 'Unknown'}</p>
        <p><strong>Error:</strong> ${errorData.error}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <pre>${errorData.stack || 'No stack trace available'}</pre>
      `,
      text: `Application Error - Shop: ${errorData.shop}, Error: ${errorData.error}, Time: ${new Date().toLocaleString()}`
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error notification failed:', error);
    return { success: false, error: error.message };
  }
};