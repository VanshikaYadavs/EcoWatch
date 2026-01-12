import cron from 'node-cron';
import { ingestOne } from './ingest.mjs';

// Default locations to monitor
const DEFAULT_LOCATIONS = process.env.DEFAULT_LOCATIONS 
  ? JSON.parse(process.env.DEFAULT_LOCATIONS)
  : [
      { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
      { name: 'Udaipur', lat: 24.5854, lon: 73.7125 },
      { name: 'Delhi', lat: 28.7041, lon: 77.1025 },
    ];

// Schedule interval (default: every hour at minute 0)
const CRON_SCHEDULE = process.env.INGEST_CRON_SCHEDULE || '0 * * * *';

let scheduledTask = null;

export function startScheduler() {
  console.log(`[scheduler] Starting automated data ingestion...`);
  console.log(`[scheduler] Schedule: ${CRON_SCHEDULE}`);
  console.log(`[scheduler] Monitoring ${DEFAULT_LOCATIONS.length} location(s):`);
  DEFAULT_LOCATIONS.forEach(loc => {
    console.log(`  - ${loc.name} (${loc.lat}, ${loc.lon})`);
  });

  scheduledTask = cron.schedule(CRON_SCHEDULE, async () => {
    console.log(`\n[scheduler] ⏰ Running scheduled ingestion at ${new Date().toISOString()}`);
    
    for (const location of DEFAULT_LOCATIONS) {
      try {
        const result = await ingestOne({
          name: location.name,
          lat: location.lat,
          lon: location.lon,
        });
        console.log(`[scheduler] ✅ ${location.name}: Reading ID ${result.reading_id}`);
      } catch (error) {
        console.error(`[scheduler] ❌ ${location.name}: ${error.message}`);
      }
    }
    
    console.log(`[scheduler] ✅ Ingestion cycle complete\n`);
  });

  return scheduledTask;
}

export function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop();
    console.log(`[scheduler] Stopped`);
  }
}

export default { startScheduler, stopScheduler };
