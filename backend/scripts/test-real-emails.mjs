import '../src/loadEnv.mjs';
import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

console.log('🧪 Finding Real User Emails from Supabase\n');

// Get users with alert preferences enabled
const { data: prefs, error: prefsError } = await supabaseAdmin
  .from('user_alert_preferences')
  .select('user_id, email_alerts')
  .eq('email_alerts', true)
  .limit(3);

if (prefsError) {
  console.error('❌ Error fetching preferences:', prefsError.message);
  process.exit(1);
}

if (!prefs || prefs.length === 0) {
  console.error('❌ No users with email_alerts=true found');
  process.exit(1);
}

console.log(`✅ Found ${prefs.length} users with email alerts enabled\n`);

// Get their email addresses from auth.users
for (const pref of prefs) {
  try {
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.getUserById(pref.user_id);
    if (authError) throw authError;
    
    const email = user?.email;
    console.log(`\n📧 Testing email to: ${email}`);
    
    if (!email) {
      console.warn(`   ⚠️  No email found for user ${pref.user_id}`);
      continue;
    }

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: '🚨 EcoWatch Test Alert - Verify Your Email',
      html: `
        <h2>EcoWatch Alert Test</h2>
        <p>This is a test email from the EcoWatch alert system.</p>
        <p><strong>If you received this, email alerts are working!</strong></p>
        <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
      `,
    };

    const response = await sgMail.send(msg);
    console.log(`   ✅ Accepted by SendGrid (Status: ${response[0].statusCode})`);
    console.log(`   📊 Message ID: ${response[0].headers['x-message-id']}`);
    
  } catch (e) {
    console.error(`   ❌ Error: ${e?.message || String(e)}`);
    if (e?.response?.body?.errors) {
      e.response.body.errors.forEach(err => {
        console.error(`      - ${err.message}`);
      });
    }
  }
}

console.log('\n✅ Test complete. Check your email inboxes and SendGrid dashboard.');
