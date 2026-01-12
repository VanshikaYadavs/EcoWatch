import '../src/loadEnv.mjs';
import sgMail from '@sendgrid/mail';

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

console.log('🧪 SendGrid Direct Test\n');
console.log(`📌 API Key: ${SENDGRID_KEY ? SENDGRID_KEY.substring(0, 20) + '...' : 'NOT SET'}`);
console.log(`📌 From Email: ${FROM_EMAIL || 'NOT SET'}\n`);

if (!SENDGRID_KEY) {
  console.error('❌ SENDGRID_API_KEY not set in .env');
  process.exit(1);
}

sgMail.setApiKey(SENDGRID_KEY);

const msg = {
  to: 'test@example.com',
  from: FROM_EMAIL || 'noreply@ecowatch.local',
  subject: 'EcoWatch Test Email',
  text: 'If you see this, SendGrid is working!',
  html: '<h1>EcoWatch Test</h1><p>If you see this, SendGrid is working!</p>',
};

console.log('📧 Attempting to send test email...\n');

try {
  const response = await sgMail.send(msg);
  console.log('✅ Email sent successfully!');
  console.log(`📊 Response Status: ${response[0].statusCode}`);
  console.log(`📊 Message ID: ${response[0].headers['x-message-id']}`);
} catch (error) {
  console.error('❌ SendGrid Error:\n');
  console.error(`  Error Type: ${error.code || error.name}`);
  console.error(`  Message: ${error.message}`);
  
  if (error.response?.body?.errors) {
    console.error(`  Details:`);
    error.response.body.errors.forEach((err, i) => {
      console.error(`    ${i + 1}. ${err.message}`);
      if (err.field) console.error(`       Field: ${err.field}`);
      if (err.help) console.error(`       Help: ${err.help}`);
    });
  }
  
  console.log('\n💡 Common Issues:');
  console.log('   1. Sender email NOT verified in SendGrid account');
  console.log('   2. API key invalid or revoked');
  console.log('   3. Account in trial mode (can only send to verified addresses)');
  console.log('\n🔧 Fix: Go to SendGrid → Settings → Sender Authentication');
  console.log('   Verify the sender email or use a verified domain');
}
