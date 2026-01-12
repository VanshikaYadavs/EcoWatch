/**
 * Preview Beautiful Email Templates
 * Generates sample HTML emails for all alert types
 */
import { generateAlertEmail } from './src/emailTemplate.mjs';
import fs from 'fs';
import path from 'path';

const alerts = [
  {
    type: 'AQI',
    value: 152,
    location: 'Jaipur',
    threshold: 100,
    filename: 'aqi-alert-preview.html'
  },
  {
    type: 'HEAT',
    value: 38,
    location: 'Delhi',
    threshold: 35,
    filename: 'temperature-alert-preview.html'
  },
  {
    type: 'NOISE',
    value: 90,
    location: 'Mumbai',
    threshold: 85,
    filename: 'noise-alert-preview.html'
  },
  {
    type: 'HUMIDITY',
    value: 85,
    location: 'Kolkata',
    threshold: 80,
    filename: 'humidity-alert-preview.html'
  }
];

console.log('🎨 Generating Beautiful Email Previews...\n');

alerts.forEach(alert => {
  const emailContent = generateAlertEmail(alert);
  const outputPath = path.join(process.cwd(), alert.filename);
  
  fs.writeFileSync(outputPath, emailContent.html);
  console.log(`✅ ${alert.type} Alert: ${alert.filename}`);
  console.log(`   Subject: ${emailContent.subject}`);
  console.log(`   File: ${outputPath}\n`);
});

console.log('🎉 All email previews generated!');
console.log('📧 Open the HTML files in your browser to see the beautiful emails!\n');
