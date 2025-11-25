#!/usr/bin/env node

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Test script for email notifications
// Run with: node test-email.js

import { testEmailSetup, sendWelcomeEmail } from './app/utils/emailNotifications.js';

console.log('🧪 Testing Brevo email notification setup...');
console.log('📧 Make sure you have set up your Brevo environment variables:');
console.log('   - BREVO_SMTP_LOGIN (your Brevo SMTP login)');
console.log('   - BREVO_SENDER_EMAIL (your verified email with Brevo)');
console.log('   - BREVO_API_KEY (your Brevo SMTP API key)');
console.log('   - NOTIFICATION_EMAIL (where to send notifications)');
console.log('');

// Check if environment variables are set
const requiredVars = ['BREVO_SMTP_LOGIN', 'BREVO_SENDER_EMAIL', 'BREVO_API_KEY', 'NOTIFICATION_EMAIL'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('');
  console.log('📝 Please add these to your .env file.');
  console.log('🔗 Sign up at https://brevo.com for free (300 emails/day)');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`📤 Sending test emails from: ${process.env.BREVO_SENDER_EMAIL}`);
console.log(`📥 Installation notification will be sent to: ${process.env.NOTIFICATION_EMAIL}`);
console.log('');

// Test data for welcome email
const welcomeTestData = {
  shop: 'test-store.myshopify.com',
  storeName: 'Test Store',
  email: process.env.NOTIFICATION_EMAIL, // Send welcome email to same address for testing
  country: 'United States',
  plan: 'Basic Shopify',
  ownerName: 'John Doe',
  installedAt: new Date().toISOString(),
  installationId: 'test-12345'
};

console.log('📧 Testing email notifications...\n');

// Run the tests
console.log('1️⃣  Testing Installation Notification Email...');
testEmailSetup()
  .then(result => {
    if (result.success) {
      console.log('   ✅ Installation notification sent successfully');
      console.log(`   📬 Message ID: ${result.messageId}`);
    } else {
      console.log('   ❌ Installation notification failed');
      console.log(`   🐛 Error: ${result.error || result.reason}`);
    }
    console.log('');
    
    // Now test welcome email
    console.log('2️⃣  Testing Welcome Email to Shop Owner...');
    return sendWelcomeEmail(welcomeTestData);
  })
  .then(result => {
    if (result.success) {
      console.log('   ✅ Welcome email sent successfully');
      console.log(`   📬 Message ID: ${result.messageId}`);
      console.log(`   👤 Sent to: ${result.recipient}`);
      console.log('');
      console.log('🎉 SUCCESS! Both emails sent successfully');
      console.log('📧 Check your inbox to confirm both emails arrived');
    } else {
      console.log('   ❌ Welcome email failed');
      console.log(`   🐛 Error: ${result.error || result.reason}`);
      console.log('');
      console.log('💡 Common issues:');
      console.log('   - Check your Brevo SMTP API key is correct');
      console.log('   - Verify sender email is verified in your Brevo account');
      console.log('   - Ensure your Brevo account is active');
      console.log('   - Check your internet connection');
    }
  })
  .catch(error => {
    console.log('❌ CRITICAL ERROR!');
    console.log(`🐛 ${error.message}`);
    console.log('');
    console.log('💡 This usually means:');
    console.log('   - Missing environment variables');
    console.log('   - Network connectivity issues');
    console.log('   - Invalid email configuration');
  })
  .finally(() => {
    console.log('');
    console.log('🔧 Need help setting up Brevo?');
    console.log('   1. Sign up at https://brevo.com');
    console.log('   2. Verify your sending email address');
    console.log('   3. Go to SMTP & API → SMTP');
    console.log('   4. Generate SMTP API key');
    console.log('   5. Update your .env file with credentials');
    process.exit(0);
  });