/**
 * EcoWatch Alert Scheduler
 * Automatically fetches environmental data and sends alerts every hour
 * Runs independently - users don't need to be logged in
 */
import 'dotenv/config';
import { supabaseAdmin } from './src/index.mjs';
import { ingestMany } from './src/ingest.mjs';

// Default locations to monitor (Rajasthan cities)
const MONITORED_LOCATIONS = process.env.DEFAULT_LOCATIONS 
  ? JSON.parse(process.env.DEFAULT_LOCATIONS)
  : [
      { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
      { name: 'Udaipur', lat: 24.5854, lon: 73.7125 },
      { name: 'Jodhpur', lat: 26.2389, lon: 73.0243 },
      { name: 'Ajmer', lat: 26.4499, lon: 74.6399 },
      { name: 'Kota', lat: 25.2138, lon: 75.8648 }
    ];

// Check interval in milliseconds (default: 1 hour)
const CHECK_INTERVAL = parseInt(process.env.ALERT_CHECK_INTERVAL_MS) || 3600000; // 1 hour

console.log('🚀 EcoWatch Alert Scheduler Started');
console.log(`⏰ Checking every ${CHECK_INTERVAL / 60000} minutes`);
console.log(`📍 Monitoring ${MONITORED_LOCATIONS.length} locations\n`);

/**
 * Main scheduler function - runs every hour
 */
async function runAlertCheck() {
  const timestamp = new Date().toISOString();
  console.log(`\n⏱️  [${timestamp}] Running scheduled alert check...`);

  try {
    // Fetch environmental data for all monitored locations
    // This will automatically trigger alerts via evaluateAndRecordAlerts()
    console.log('📡 Fetching environmental data...');
    const results = await ingestMany(MONITORED_LOCATIONS);

    // Count successes and failures
    const successful = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok).length;

    console.log(`✅ Successfully ingested: ${successful}/${MONITORED_LOCATIONS.length}`);
    if (failed > 0) {
      console.log(`❌ Failed: ${failed}`);
    }

    // Get alert statistics
    const stats = await getAlertStats();
    console.log(`📱 Alerts sent in last hour: ${stats.recentAlerts}`);
    console.log(`👥 Active users with SMS enabled: ${stats.smsUsers}`);
    
  } catch (error) {
    console.error('❌ Scheduler error:', error.message);
  }
}

/**
 * Get alert statistics
 */
async function getAlertStats() {
  try {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    
    // Count recent alerts
    const { count: recentAlerts } = await supabaseAdmin
      .from('alert_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo);

    // Count users with SMS enabled
    const { count: smsUsers } = await supabaseAdmin
      .from('user_alert_preferences')
      .select('*', { count: 'exact', head: true })
      .eq('sms_alerts', true);

    return { recentAlerts: recentAlerts || 0, smsUsers: smsUsers || 0 };
  } catch (e) {
    return { recentAlerts: 0, smsUsers: 0 };
  }
}

/**
 * Start the scheduler
 */
async function startScheduler() {
  // Run immediately on startup
  await runAlertCheck();

  // Then run every hour
  setInterval(async () => {
    await runAlertCheck();
  }, CHECK_INTERVAL);

  console.log('\n✅ Scheduler is running. Press Ctrl+C to stop.\n');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down scheduler...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down scheduler...');
  process.exit(0);
});

// Start the scheduler
startScheduler().catch((error) => {
  console.error('Fatal error starting scheduler:', error);
  process.exit(1);
});
