import React, { useState, useRef, useEffect } from 'react';
import Icon from './AppIcon';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m EchoWatch Assistant. Choose a category below:',
      data: { type: 'categories' },
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Organized FAQ by category with 5-6 questions each
  const categoryQuestions = {
    general: {
      name: '📚 General & Overview',
      questions: [
        { q: 'What is EchoWatch?', a: 'EchoWatch is an integrated environmental monitoring platform designed for Rajasthan to continuously track and report on critical environmental parameters in real-time. It collects data from a network of IoT sensors measuring air quality (AQI, PM2.5, PM10, pollutants), temperature, noise pollution levels, and water quality metrics across all major cities and regions. The platform helps government agencies, environmental organizations, researchers, and communities make informed decisions about environmental health, compliance, and remediation efforts.' },
        { q: 'How does EchoWatch work?', a: 'EchoWatch operates through a four-step process: (1) Data Collection - IoT sensors deployed across Rajasthan continuously measure environmental parameters 24/7. (2) Real-Time Processing - Data is processed immediately and pushed to the platform dashboard. (3) Alert Generation - When values exceed configured thresholds, automated alerts are triggered with severity levels. (4) Analytics & Reporting - Historical data is analyzed to show trends, patterns, and generate compliance reports. Users can access all this through a web-based dashboard with filters, comparisons, and export capabilities.' },
        { q: 'What are the main features?', a: 'EchoWatch includes 8 major features: 1) Environmental Dashboard - Real-time overview of all parameters across Rajasthan with sensor maps. 2) Alert Center - Centralized management of environmental alerts with filtering and status tracking. 3) Air Quality Monitor - Detailed AQI tracking with pollutant breakdown (PM2.5, PM10, O3, NO2, SO2, CO). 4) Temperature Analytics - Thermal trend analysis across locations. 5) Noise Level Tracking - Acoustic pollution monitoring with decibel measurements. 6) Water Quality Monitoring - Tracking water safety parameters. 7) Comparative Analysis - Compare metrics across cities and time periods. 8) Historical Reports - Generate compliance reports with historical data.' },
        { q: 'Getting started - First steps?', a: 'Getting started with EchoWatch is simple: Step 1 - Create/Login to your account with role-based access. Step 2 - Visit the Environmental Dashboard to see real-time data overview for your location. Step 3 - Explore the Air Quality Monitor to understand current pollution levels and trends. Step 4 - Set up your notification preferences in Notification Settings based on alert types and severity levels you care about. Step 5 - Use Comparative Analysis to compare your city with others. Step 6 - Download reports from Historical Reports section as needed. Start with the dashboard and explore features based on your needs.' },
        { q: 'Who can use EchoWatch?', a: 'EchoWatch is designed for multiple user types: Government Officials - For compliance monitoring and policy making. Environmental Agencies - For managing environmental health and standards. Researchers & Scientists - For conducting environmental studies and analysis. Data Analysts - For analyzing trends and generating insights. Community Leaders - For tracking local environmental issues. NGOs & CSOs - For advocacy and environmental campaigns. Industry Monitors - For emissions compliance and environmental impact tracking. General Public/Citizens - For understanding air quality and environmental health in their area. Each role has customized access and features.' },
        { q: 'How is data updated?', a: 'EchoWatch uses continuous real-time data streaming from IoT sensors deployed across Rajasthan. Environmental parameters are measured and updated every 5-15 minutes depending on the parameter type. Air quality data (AQI, pollutants) updates most frequently, while water quality may have longer intervals. All data is time-stamped and quality-checked before display. You can see the latest update time for each parameter on the dashboard. Historical data is preserved for trend analysis and report generation. If a sensor goes offline, the system notifies administrators and indicates missing data in the interface.' }
      ]
    },
    features: {
      name: '🎯 Features & Monitoring',
      questions: [
        { q: 'What is the Dashboard?', a: 'The Environmental Dashboard is your central command center for environmental monitoring. It provides: 1) Real-time Overview - All key metrics (AQI, temperature, noise, water quality) at a glance. 2) Geographic Heatmap - Visual representation of pollution levels across Rajasthan using color-coding (green=good, yellow=moderate, orange=unhealthy, red=hazardous). 3) Quick Stats Cards - Total sensors active, critical alerts, cities monitored, average AQI. 4) Sensor Details - Click any location to see detailed readings from that sensor. 5) Time Range Filter - View current data or historical snapshots. 6) Export Function - Download dashboard data as reports. The dashboard auto-refreshes every 5 minutes with latest sensor readings.' },
        { q: 'What is Alert Center?', a: 'Alert Center is your command hub for managing all environmental alerts. It provides: 1) Alert List View - All alerts with severity color codes (red=critical, orange=high, yellow=medium, blue=low). 2) Advanced Filtering - Filter by severity, status (active/resolved), alert type, location, date range. 3) Alert Details - Click any alert to see readings, historical context, and recommendations. 4) Quick Actions - Acknowledge alerts (mark as seen), Resolve alerts (issue addressed), Delete alerts. 5) Export Alerts - Generate CSV reports of alerts for compliance documentation. 6) Search Function - Find specific alerts by location or parameter. 7) Statistics Dashboard - View alert trends, most common issues, affected areas. Perfect for environmental managers tracking issues.' },
        { q: 'Air Quality Monitoring', a: 'Air Quality Monitor provides comprehensive air pollution tracking across Rajasthan: 1) AQI Overview - Real-time Air Quality Index from 0-500+ with color-coded health impact (0-50: Good, 51-100: Moderate, 101-150: Unhealthy for Sensitive Groups, 151+: Unhealthy/Hazardous). 2) Pollutant Breakdown - Individual levels for PM2.5 (fine particles), PM10 (coarse particles), Ozone (O3), Nitrogen Dioxide (NO2), Sulfur Dioxide (SO2), Carbon Monoxide (CO) with WHO guidelines comparison. 3) Location Comparison - Compare AQI across different cities to see relative air quality. 4) Trend Charts - 7-day, 30-day, and yearly trends showing seasonal patterns. 5) Health Recommendations - Automatic health guidance based on current AQI (e.g., "Sensitive groups should avoid outdoor activities"). 6) Sensor Details - View individual sensor readings and data quality.' },
        { q: 'Temperature Analytics explained', a: 'Temperature Analytics helps understand thermal patterns and trends: 1) Real-time Temperature - Current temperature across Rajasthan locations displayed on map. 2) Heatmap Visualization - See temperature variations with color intensity. 3) Trend Analysis - Track temperature changes over days, weeks, months, and years. 4) Anomaly Detection - System automatically flags unusual temperature spikes (heat waves) or drops. 5) City Comparisons - Compare temperatures across different regions (coastal vs desert areas). 6) Seasonal Patterns - Understand typical temperature patterns by season. 7) Health Warnings - Automatic heat wave or cold wave alerts when dangerous thresholds are reached. 8) Forecast Integration - View historical patterns to predict future weather impacts on environment.' },
        { q: 'What is Noise Monitoring?', a: 'Noise Level Tracking monitors acoustic pollution across Rajasthan: 1) Real-time Decibel Levels - Current noise measurements for each location (measured in dB). 2) Reference Scale - Understanding: ~30dB (quiet library), 60dB (normal conversation), 80dB (traffic), 100dB (drill), 120dB (alarm/dangerous). 3) Area-wise Standards - Residential areas must be <55dB daytime/45dB night; Commercial <65dB/55dB; Industrial <75dB/70dB. 4) Compliance Tracking - See which areas meet standards and which violate limits. 5) Source Identification - See noise patterns by time (traffic peaks during rush hours, construction during day). 6) Trend Graphs - Track noise pollution changes over time. 7) Health Impact - Excessive noise linked to sleep disruption, stress, hearing loss. 8) Alerts - Get notifications when noise exceeds safe levels.' },
        { q: 'Comparative Analysis feature', a: 'Comparative Analysis lets you analyze environmental metrics across cities and time periods: 1) City Comparison - Select 2-5 cities and compare their AQI, temperature, noise, water quality side-by-side. 2) Performance Ranking - See which cities have best/worst air quality or noise levels. 3) Time Period Selection - Compare same cities at different times (same month last year vs this year). 4) Trend Analysis - Understand if Jaipur air quality is improving while Jodhpur is declining. 5) Export Reports - Generate comparison reports for presentations or policy meetings. 6) Visual Charts - Bar charts, line graphs, and tables for easy analysis. 7) Statistical Metrics - Average, min, max, trend direction for each metric. 8) Insight Generation - Automatic insights like "Jodhpur AQI improved 15% compared to last month".' }
      ]
    },
    alerts: {
      name: '🔔 Alerts & Notifications',
      questions: [
        { q: 'How do alerts work?', a: 'Alerts are automated notifications when environmental parameters exceed safe thresholds: 1) Threshold Setting - Admin configures safe limits for each parameter (e.g., AQI >200 = critical). 2) Continuous Monitoring - System checks sensor readings every 5-15 minutes. 3) Trigger Condition - When a reading exceeds threshold, an alert is instantly generated with timestamp and location. 4) Severity Assignment - System automatically assigns severity (Critical, High, Medium, Low) based on how much the threshold is exceeded. 5) Notification Delivery - Alert is sent to Alert Center and to user inboxes/phones based on notification settings. 6) Duration Tracking - Alert stays active until manually resolved or parameter returns to normal. 7) Historical Record - All alerts are logged for compliance and trend analysis. 8) Escalation - Critical alerts escalate to higher-level authorities if not acknowledged within timeframe.' },
        { q: 'What are severity levels?', a: 'Alerts have 4 severity levels based on environmental impact and required action timing: 🔴 CRITICAL - Severe health hazard, immediate action required within 1 hour (e.g., AQI >500, NOx >2000 µg/m³). Sent to all authorities, triggers escalation. 🟠 HIGH - Significant health impact, urgent action needed within 4 hours (e.g., AQI 300-500). Sent to environmental managers. 🟡 MEDIUM - Moderate concern, attention needed within 1 day (e.g., AQI 150-300). Standard notification. 🔵 LOW - Informational only, awareness needed (e.g., AQI 100-150). No immediate action required. Users can filter by severity in Alert Center to focus on what matters most. Configure which severity levels you want to receive notifications for.' },
        { q: 'How to manage alerts?', a: 'Alert Center provides complete alert management: 1) View All Alerts - See all environmental alerts with timestamp, location, severity, parameter affected. 2) Filter Alerts - Use multiple filters: Severity (Critical/High/Medium/Low), Status (Active/Resolved), Type (Air Quality/Temperature/Noise/Water), Location (any city), Date Range. 3) Search Function - Search alerts by location name or parameter. 4) Acknowledge Alert - Click "Acknowledge" to mark alert as seen/recognized. Status changes to "Acknowledged" but alert remains active. 5) Resolve Alert - Click "Resolve" when the issue is fixed (e.g., construction noise ended, AQI returned to normal). Alert moves to "Resolved" status. 6) Delete Alert - Remove old/irrelevant alerts. 7) Export Data - Download alerts as CSV for reporting. 8) Sort Options - Sort by date, severity, location. 9) Detailed View - Click alert to see full details, recommendations, and historical readings.' },
        { q: 'What is a critical alert?', a: 'A CRITICAL alert indicates a severe environmental emergency requiring immediate intervention: Characteristics: (1) Alert threshold significantly exceeded - AQI >500 (hazardous level), Noise >90dB sustained, Temperature >50°C heat wave. (2) Immediate health threat - Respiratory emergencies likely, vulnerable populations at extreme risk. (3) Public safety action required - Schools/offices may need closure, traffic rerouting, emergency medical response. (4) Rapid escalation - System automatically notifies multiple authorities (district admin, pollution board, emergency services). (5) No resolution without action - Alert persists until acknowledged AND parameter returns to safe levels. (6) Compliance documentation - Automatically logged for government records and audits. (7) Recommended actions - System suggests interventions (halt construction, activate traffic management, issue health advisory). Example: Jaipur AQI jumps to 550 on Diwali → Critical alert → All authorities notified → Emergency response activated.' },
        { q: 'How to acknowledge an alert?', a: 'Acknowledging an alert means you are aware of the issue. Here\'s how: 1) In Alert Center, find the alert you want to acknowledge. 2) Click the "Acknowledge" button on the alert card. 3) Alert status changes from "Active" to "Acknowledged" with timestamp. 4) Alert remains visible in the list for reference. 5) Acknowledgment is logged for accountability - shows who acknowledged and when. 6) You can still resolve later when issue is fixed. Why acknowledge? - Shows you\'re monitoring the situation, prevents duplicate notifications to multiple teams, tracks response times, provides audit trail for compliance. When to acknowledge - As soon as you see a critical alert, even if you haven\'t fixed it yet. Example: AQI alert triggers at 10:00 AM, you acknowledge at 10:05 AM, work on pollution source, resolve at 11:30 AM when AQI returns to normal.' },
        { q: 'Can I customize notifications?', a: 'Yes! Notification Settings are fully customizable: 1) Alert Types - Choose which types of alerts you want: Air Quality, Temperature, Noise, Water Quality. 2) Severity Levels - Select which severity levels to receive: Critical, High, Medium, Low. 3) Location Filters - Choose specific cities/regions or "All of Rajasthan". 4) Delivery Method - Email, In-app notifications, SMS (if configured). 5) Time Preferences - Set quiet hours (e.g., don\'t notify between 11 PM-6 AM for non-critical). 6) Threshold Customization - Adjust sensitivity for your specific needs (e.g., more sensitive to AQI if near school). 7) Notification Frequency - Daily digest vs instant alerts vs weekly summary. 8) Emergency Contacts - Add multiple email addresses for critical alerts. Access via: User Profile → Notification Settings → Customize and Save. Example: Receive only Critical air quality alerts for Jaipur via email between 9 AM-5 PM.' }
      ]
    },
    data: {
      name: '📊 Environmental Data',
      questions: [
        { q: 'What is AQI?', a: 'AQI (Air Quality Index) is a standardized scale measuring air pollution impact on human health (0-500+): ✅ 0-50 (Green) = GOOD - Air quality is satisfactory, pollution poses no health risk. Ideal for all outdoor activities. ✅ 51-100 (Yellow) = MODERATE - Air quality is acceptable. Generally safe, but sensitive groups should limit outdoor activities. ⚠️ 101-150 (Orange) = UNHEALTHY FOR SENSITIVE GROUPS - Air quality is harmful to sensitive populations (children, elderly, people with respiratory/heart disease). General public unaffected. Limit outdoor activities for sensitive groups. ⚠️ 151-200 (Red) = UNHEALTHY - Health effects on general population. Everyone should reduce prolonged outdoor activities. 🔴 201-300 (Purple) = VERY UNHEALTHY - Health alert. Reduce outdoor activities significantly. 🔴 301-500+ (Maroon) = HAZARDOUS - Health emergency. Avoid outdoor activities, stay indoors with air filtration. AQI is calculated from: PM2.5, PM10, Ozone (O3), Nitrogen Dioxide (NO2), Sulfur Dioxide (SO2), Carbon Monoxide (CO). EchoWatch displays AQI for your location and shows health recommendations.' },
        { q: 'What is PM2.5?', a: 'PM2.5 are fine particulate matter (particles ≤2.5 micrometers diameter) suspended in air: What are they? - Dust, soot, smoke, pollen, vehicle exhaust, industrial emissions form PM2.5. Invisible to naked eye but very harmful. Source - Vehicle exhaust (40%), industrial emissions (30%), burning (20%), natural sources (10%). Health Impact - Penetrates deep into lungs and bloodstream causing: Respiratory diseases (asthma, bronchitis, lung cancer), Cardiovascular problems (heart attack, stroke), Reduced life expectancy (exposed children have 20% higher mortality). WHO Guideline - Safe limit is 15 µg/m³ annual average, 35 µg/m³ 24-hour average. Rajasthan often exceeds this. Effects - Each 10 µg/m³ increase in PM2.5 reduces life expectancy by ~6 months. During winter/festival season, PM2.5 can spike 10-15x above safe levels. Protection - Use N95/N99 masks when AQI >150, use air purifiers, reduce outdoor activities. EchoWatch tracks PM2.5 continuously and alerts when unsafe.' },
        { q: 'What is PM10?', a: 'PM10 are coarse particulate matter (particles ≤10 micrometers diameter) suspended in air: What are they? - Larger particles than PM2.5 including dust, sand, pollen, soil particles, textile fibers. Visible under sunlight as haze/dust. Sources - Road dust (30%), construction sites (25%), agricultural activities (25%), vehicle emissions (20%). Health Impact - Deposits in upper respiratory tract (nose, throat) causing: Coughing, wheezing, shortness of breath, Reduced lung function in children, Worsening of asthma and COPD, Less serious than PM2.5 but still harmful. WHO Guideline - Safe limit is 50 µg/m³ 24-hour average, 15 µg/m³ annual average. Performance - Higher during: Windy days (dust storms), Dry season, Construction activities, Agricultural harvesting. EchoWatch tracks PM10 separately to give complete air quality picture. PM10 levels rising? - Usually indicates dust/construction activity. Need mitigation like dust suppression, traffic control.' },
        { q: 'Air pollutants tracked', a: 'EchoWatch monitors 6 major air pollutants (plus PM2.5 and PM10): 🌫️ PM2.5 - Fine particulate matter (details above). 🌫️ PM10 - Coarse particulate matter (details above). 🔵 O3 (Ozone) - Ground-level ozone (not to be confused with upper atmosphere ozone). Formed when NOx and VOCs react with sunlight. Very harmful to respiratory system and plants. Normal: <70 ppb, Unhealthy: >100 ppb. 🟤 NO2 (Nitrogen Dioxide) - Toxic gas from vehicle engines, power plants, boilers. Causes inflammation of airways, reduces lung function. Normal: <40 ppb, Unhealthy: >100 ppb. 🟡 SO2 (Sulfur Dioxide) - Pungent gas from coal burning, industrial processes. Reacts with moisture to form acid rain. Normal: <20 ppb, Unhealthy: >100 ppb. ⚫ CO (Carbon Monoxide) - Colorless, odorless toxic gas from incomplete combustion. Reduces oxygen in blood, affects cognition. Normal: <1000 ppb, Unhealthy: >10000 ppb. EchoWatch displays all 6 pollutants with health guidelines and trends. Combined they determine AQI.' },
        { q: 'How is temperature tracked?', a: 'Temperature monitoring helps predict heat/cold waves and environmental impacts: Measurement - Sensors record temperature every 5-15 minutes in Celsius. Display - Shows real-time, hourly, daily, and monthly temperature trends. Visualization - Color-coded map (blue=cold, green=moderate, orange=warm, red=extreme heat). Heat Wave Alerts - Triggered when: Temperatures >45°C sustained for 2+ days. Automatic alerts to health authorities, schools, offices. Recommendations - Increase water supply, activate cooling centers, health advisories. Cold Wave Alerts - Triggered when: Temperatures <5°C sustained for 2+ days. Impact on agriculture, health risks to vulnerable populations. Trend Analysis - Compare current temps with historical averages (this April vs last April). Seasonal Patterns - Understand expected temperatures by month/season in each location. Impact Assessment - Temperature extremes affect: Air quality (temperature inversions trap pollution), Water quality (algal blooms at high temps), Disease prevalence (dengue in heat, flu in cold). EchoWatch correlates temperature with other parameters for holistic understanding.' },
        { q: 'What is noise measured in?', a: 'Noise pollution is measured in decibels (dB), a logarithmic scale of sound intensity: Reference Scale: 0 dB = Threshold of hearing (inaudible). 10 dB = Ticking clock. 20-30 dB = Whisper, quiet bedroom. 40 dB = Quiet office, normal library. 50 dB = Quiet street. 60 dB = Normal conversation, busy office. 70 dB = Busy traffic, vacuum cleaner. 80 dB = Loud alarm clock, heavy traffic. 90 dB = Lawnmower, power tools. 100 dB = Chain saw, rock concert. 110 dB = Car horn, thunder. 120+ dB = Jet engine, firecracker (immediate hearing damage). Health Impact: 50-60 dB = Minimal impact. 60-70 dB = Sleep disruption, increased stress. 70-85 dB = Hearing damage with prolonged exposure. 85+ dB = Rapid hearing damage risk. Legal Standards (India): Residential: 55 dB day, 45 dB night. Commercial: 65 dB day, 55 dB night. Industrial: 75 dB day, 70 dB night. Silence Zone: 50 dB day, 40 dB night. EchoWatch tracks noise 24/7 and alerts when limits are exceeded. A 10dB increase = perceived doubling of loudness.' }
      ]
    },
    account: {
      name: '👤 Account & User Management',
      questions: [
        { q: 'How to reset password?', a: 'If you forgot your password, follow these steps: 1) Go to the Login page and click "Forgot Password" link. 2) Enter the email address associated with your account. 3) Check your email inbox for a password reset link (check spam folder if not found). 4) Click the reset link - it opens a page to create new password. 5) Enter a strong password: Mix of uppercase, lowercase, numbers, special characters. Minimum 8 characters. Not your previous password. 6) Confirm the new password. 7) Click "Reset Password" button. 8) Return to login page and sign in with new password. ⚠️ If you don\'t receive email: - Wait 5 minutes (email can be slow). - Check spam/junk folder. - Verify email address spelling. - Request new link again. For security, reset links expire after 24 hours. If link expired, request new one. Contact support if issues persist: support@ecowatch.com' },
        { q: 'What are user roles?', a: 'EchoWatch has 6 role types with different permission levels: 👑 Administrator - Full system access including user management, alert configuration, system settings, data export. Can manage all features, add/remove users, configure thresholds. Best for: IT/system managers. 🏛️ Government Official - Access to dashboard, alerts, reports, comparisons. Can acknowledge/resolve alerts, view compliance reports. Cannot modify system settings. Best for: District officials, pollution board. 👨‍🔬 Researcher/Analyst - Access to historical data, trend analysis, report generation, comparative analysis. Can export data for research. Limited real-time alert access. Best for: Environmental scientists, data analysts. 🔍 Data Analyst - Full data analysis access, report generation, dashboards, comparisons. Cannot manage users or alerts. Best for: Environmental consultants. 👥 Community Leader - Access to local area dashboard, basic alerts, export reports. Limited to assigned region. Best for: NGOs, local environmental groups. 👁️ Viewer - Read-only access to dashboard and reports. Cannot acknowledge alerts or export data. Best for: Students, public information. Contact admin to request role change.' },
        { q: 'How to access my profile?', a: 'Access your user profile to view and manage your account: 1) Click your name/avatar in top-right corner of dashboard. 2) Select "My Profile" from dropdown menu. 3) Profile page shows: - Name, email, phone number registered. - Current role and permissions. - Account creation date. - Last login timestamp. 4) Edit Your Information - Click "Edit Profile" to update: Name, phone number, organization. Password changes go through separate reset process. 5) Preferences - Set your default location/city when you login. 6) Notification Settings - Customize alert preferences (see notification customization question). 7) Export Data - Option to export all your activity history. 8) Account Activity - View login history and last active time. 9) Logout - Sign out from "Logout" button (or click "Logout All Devices" to sign out everywhere). ⚠️ Never share your login credentials with others. For account security issues, contact support@ecowatch.com' },
        { q: 'How to change password?', a: 'To change your password while logged in (proactive password change): 1) Go to User Profile (click name in top-right). 2) Click "Change Password" button. 3) Enter Current Password - For security verification. 4) Enter New Password - Create strong password: Minimum 8 characters, Mix uppercase/lowercase/numbers/special chars (@#$%), Different from previous passwords (system prevents reuse of last 3 passwords), Don\'t include username or personal info. 5) Confirm New Password - Type new password again to confirm. 6) Click "Update Password" button. 7) System confirms "Password changed successfully". 8) You remain logged in, no need to login again. ✅ Best Practices: - Change password every 3 months. - Use unique passwords (don\'t reuse across sites). - Never share password via email or phone. - If you suspect compromise, change immediately. - After changing password, review account activity. Difference: Change password = proactive while logged in. Reset password = forgot password, need email verification.' },
        { q: 'Can I export data?', a: 'Yes! EchoWatch allows comprehensive data export for analysis and compliance: 📊 What You Can Export: 1) Alerts - All alerts with severity, status, timestamp, location, readings. Useful for: Compliance reporting, trend analysis, government documentation. 2) Dashboard Data - Real-time readings for all parameters across locations. 3) Historical Reports - Full historical data with trends (daily/weekly/monthly summaries). 4) Comparative Analysis - City comparison reports with charts and statistics. 5) Sensor Readings - Raw sensor data with timestamps and quality metrics. 💾 Export Formats: CSV (spreadsheet compatible), PDF (formatted reports), JSON (data integration). 📥 How to Export: From any page with data table, look for "Export" button (usually top-right). Select date range (if applicable). Choose format (CSV/PDF/JSON). Click "Download" - file downloads to your device. 📋 Common Use Cases: Government agencies - Quarterly compliance reports. Researchers - Data analysis and study. Media/NGOs - Environmental impact stories. Industries - Emissions tracking for permits. 🔒 Data Privacy - Exported data includes only data you have permission to access. Files are not stored on server, immediate download. Consider data security when sharing exported files.' },
        { q: 'What if I have login issues?', a: 'Having trouble logging in? Try these solutions: ❌ "Invalid username or password" Error: 1) Double-check email spelling (typos are common). 2) Verify caps lock is off (password is case-sensitive). 3) Try common passwords you use elsewhere. 4) Reset password using "Forgot Password" link (see password reset question). 5) Browser auto-fill might insert wrong credentials - clear and type manually. ❌ Account Locked: - After 5 failed login attempts, account locks for 30 minutes for security. - Wait 30 minutes and try again with correct password. - Or reset password to unlock immediately. ❌ "Email not recognized": - Verify you\'re using the correct email address your account is registered under. - Check if account exists - click "Forgot Password" and enter email. If not found, you may need new account. - Email might be registered differently (with extra space, typo). ❌ Two-Factor Authentication Issues: - If 2FA enabled and you lost access device, contact support immediately with account details. - Support can temporarily disable 2FA. ❌ "Session Expired": - Login session expired (happens after 2 hours of inactivity). - Simply login again. 📞 Still Not Working? Contact Support: - Email: support@ecowatch.com - Provide: Account email, error message, when issue started. - Include screenshot if possible. Support responds within 24 hours.' }
      ]
    },
    locations: {
      name: '🗺️ Locations & Support',
      questions: [
        { q: 'Which cities are monitored?', a: 'EchoWatch monitors environmental quality across Rajasthan with focus on major cities and regions: 🏙️ MAJOR CITIES (Full Coverage): 1) Jaipur - State capital, largest city, 36+ sensors across districts, comprehensive air/noise/water monitoring. 2) Jodhpur - Major city in western Rajasthan, 20+ sensors, tracks desert dust pollution patterns. 3) Udaipur - City of lakes in south, 15+ sensors, water quality priority monitoring. 4) Bikaner - Northern city, 12+ sensors, agricultural impact tracking. 5) Ajmer - Central region, 10+ sensors, tourist area monitoring. 🏘️ SECONDARY CITIES (Partial Coverage): Kota, Sikar, Pali, Alwar, Bhilwara, Churu, Dausa, Hanumangarh, Jhalawar, Nagaur, and more. 🌍 COVERAGE: Total 150+ sensors deployed across 23+ cities and regions. Covers ~85% of Rajasthan population. Expanding monthly to new locations. 📍 LOCATIONS MAP: View all monitored locations on the Dashboard - click any location to see detailed readings. Add your city to monitoring: Submit request to support@ecowatch.com with location details.' },
        { q: 'Tell me about Jaipur', a: 'Jaipur - State Capital with Comprehensive Environmental Monitoring: 📍 About Jaipur - Population: ~3.2 million (city), ~8 million (metro). Capital of Rajasthan. Pink City, known for culture, tourism, industry. Challenges: High vehicular traffic (2+ million vehicles), industrial zones, seasonal dust storms, festivals with fireworks. Environmental Sensors: 36+ deployed across city with geographic spread. Coverage: East (Mansarovar, Malviya Nagar), South (Sanganer, Mansarovar), Central (Civil Lines, Bani Park), West (Kota Road, Sodala), North (Raja Park). Air Quality: AQI ranges 100-350 depending on season. Worst during: October-November (Diwali), December-January (winter inversion). Best during: July-August (monsoon). Key Concerns: PM2.5 often 2x WHO limits, vehicle emissions, industrial pollution. Seasonal Patterns: - Winter (Dec-Feb): AQI 250-350, pollution traps due to temperature inversion. - Summer (Mar-May): AQI 150-250, dust storms. - Monsoon (Jun-Sep): AQI 50-150, rain clears air. Health Impact: ~100,000 people with respiratory issues, linked to air quality. EchoWatch Alerts: Regular high/critical alerts during pollution episodes. Traffic Management: Odd-even vehicle scheme implemented during high pollution. Industrial Control: Cement plants, refineries monitored for emissions.' },
        { q: 'Tell me about Jodhpur', a: 'Jodhpur - Gateway to Thar Desert with Unique Environmental Challenges: 📍 About Jodhpur - Population: ~1.1 million (city). Major trading hub in western Rajasthan. Known as "Sun City" - receives 320+ sunny days/year. Geographic Challenge: Edge of Thar Desert with hot, dry climate. Unique Pollution: Not vehicle-heavy like Jaipur, but suffers from: Desert dust storms (frequent), Construction activities, Stone/marble processing industries. Environmental Sensors: 20+ deployed across city including suburbs. Coverage includes: Main city center, industrial zones, residential areas. Air Quality Characteristics: AQI ranges 80-250. Worst during: April-May (pre-monsoon dust storms), October-November. Best during: August-September (post-monsoon). Dust Analysis: Fine sand particles increase dramatically during dust storms, PM10 levels can spike to 500+. Particulate Sources: Thar Desert winds (~60%), local activities (20%), vehicles (20%). Temperature Profile: Extremely hot (often >45°C in May-June). Heat waves pose health risks. Water Scarcity: Limited water resources, water quality monitoring critical for groundwater safety. Industrial Activity: Stone cutting/marble processing (dust generators), cement plants. Tourism Impact: Hotels, restaurants add to pollution during peak seasons. EchoWatch Strategy: Real-time dust storm prediction, seasonal alerts, water resource monitoring.' },
        { q: 'Troubleshooting - No data showing', a: 'If you\'re not seeing data on your dashboard, try these solutions: 1️⃣ CHECK YOUR LOCATION SETTINGS: - Go to User Profile → Location Preferences. - Verify your default city is set correctly. - Change to specific city and refresh. - If showing "No Data" for a location, that area may lack sensors. 2️⃣ REFRESH THE PAGE: - Press Ctrl+F5 (hard refresh) to clear browser cache. - Close tab and reopen dashboard. - Try different browser (Chrome, Firefox, Safari). - Clear browser cookies for ecowatch domain. 3️⃣ CHECK SENSOR STATUS: - Some sensors go offline temporarily (maintenance, technical issues). - Visit Alert Center - look for "Sensor Offline" alerts. - Affected locations show "No Data Available" temporarily. - System notifies admins immediately when sensors fail. 4️⃣ VERIFY INTERNET CONNECTION: - Check your wifi/internet is working. - Try accessing other websites to confirm. - Network firewall might block EchoWatch (corporate networks). - Try different network (mobile hotspot) to test. 5️⃣ CHECK DATE RANGE FILTER: - If viewing historical data, ensure date range has data. - Try "Last 30 Days" or "This Month". - Very old historical data (>2 years) may not be available. 6️⃣ BROWSER COMPATIBILITY: - Use latest version of Chrome, Firefox, Safari, or Edge. - Older browsers may have rendering issues. - Disable browser extensions (ad blockers, VPNs) that might interfere. 7️⃣ CONTACT SUPPORT: If still no data after above steps: - Email: support@ecowatch.com - Describe: Your location, what date range, which features, error messages. - Provide: Browser type/version, device info. - Attach: Screenshot of issue.' },
        { q: 'Connection issues - How to fix?', a: 'Experiencing connection problems with EchoWatch? Follow these troubleshooting steps: 🌐 CHECK INTERNET CONNECTION: 1) Test connectivity: Open Google.com or any website to confirm internet works. 2) Speed test: Visit speedtest.net - should have >5 Mbps for EchoWatch. 3) WiFi signal: Make sure you have good signal strength (3+ bars). 4) Mobile data: If using mobile data, check you have active plan with data allowance. 5) Switch networks: Try different WiFi or mobile network to isolate issue. 🔧 BROWSER-LEVEL FIXES: 1) Clear Cache - Browser → Settings → Clear Browsing Data → All Time → Cache/Cookies → Clear. 2) Disable Extensions - Extensions (VPNs, ad blockers) can block EchoWatch. Try incognito mode (no extensions). 3) Update Browser - Ensure Chrome/Firefox/Safari is latest version. 4) Try Different Browser - Open EchoWatch in different browser to identify browser issue. 5) Check Cache Buster - Try adding ?timestamp=current_time to URL. 🔒 NETWORK/FIREWALL ISSUES: 1) Corporate Firewall - Many offices block certain websites. Contact IT to whitelist ecowatch domain. 2) VPN Issues - Disconnect VPN, as location-based systems sometimes conflict. 3) Proxy Settings - Check proxy settings in browser, disable if problematic. 4) ISP Throttling - Some ISPs throttle certain traffic. Contact ISP if persistent. ⚠️ API/SERVER ISSUES: 1) Check Status - Visit status.ecowatch.com (if available) to check server status. 2) Wait & Retry - Server down temporarily? Wait 5-10 minutes and retry. 3) Try Different Time - If issue at specific time, might be scheduled maintenance. 4) Check Notifications - Look for EchoWatch updates/maintenance announcements. 📞 STILL NOT WORKING? Contact Support: Email support@ecowatch.com with: Screenshot of error, Error message (exact text), Time issue occurred, Your location/device info, Browser/OS version, Steps you already tried. Response: Usually within 4 hours for critical issues, 24 hours for others.' },
        { q: 'Privacy & Security', a: 'Your Privacy and Data Security are Our Top Priority: 🔐 DATA PROTECTION: 1) Encryption - All data transmitted using HTTPS/TLS encryption (bank-grade security). 2) Database Security - EchoWatch servers secured in certified data centers with multiple backup systems. 3) Access Control - Only authorized personnel can access user data, role-based restrictions. 4) Data Retention - Personal data kept for minimum time necessary (complies with regulations). 5) Regular Audits - Security audits conducted quarterly by third-party vendors. 👤 PRIVACY POLICY: 1) Data Collection - We collect: Account info (name, email, phone), Usage data (features accessed, search history), Environmental readings (non-personal sensor data). 2) Data Usage - Your data is used for: Service improvement, Personalized alerts, Research (anonymized only). 3) NO DATA SELLING - We DO NOT sell personal data to third parties. 4) Compliance - Complies with Indian laws and international privacy standards. 🛡️ SECURITY MEASURES: 1) Password Security - Passwords hashed using strong algorithms, never stored in plain text. 2) Two-Factor Authentication - Optional 2FA available for extra security. 3) Session Management - Sessions expire after 2 hours inactivity for security. 4) Activity Logging - All account activities logged for fraud detection. 5) Intrusion Detection - Real-time monitoring for suspicious activities. 6) Incident Response - Security team responds to breaches within 1 hour. 📋 YOUR RIGHTS: 1) Access Your Data - Request copy of all personal data we hold. 2) Correct Data - Update inaccurate personal information. 3) Delete Data - Request deletion (subject to legal holds). 4) Opt-Out - Unsubscribe from communications anytime. 5) Report Issues - Contact privacy@ecowatch.com for privacy concerns. ⚠️ SAFE PRACTICES: 1) Never share password, enable 2FA, use strong unique password. 2) Logout after session, especially on shared computers. 3) Don\'t click suspicious email links claiming to be from EchoWatch. 4) Report phishing attempts to security@ecowatch.com. EchoWatch takes your privacy seriously. Questions? Contact privacy@ecowatch.com' }
      ]
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCategoryClick = (categoryKey) => {
    const category = categoryQuestions[categoryKey];
    setCurrentCategory(categoryKey);
    
    const botResponse = {
      id: messages.length + 1,
      type: 'bot',
      text: `${category.name} - Choose a question:`,
      data: { type: 'questions', categoryKey },
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botResponse]);
  };

  const handleQuestionClick = (question, answer) => {
    // Add user's question
    const userMsg = {
      id: messages.length + 1,
      type: 'user',
      text: question,
      timestamp: new Date()
    };
    
    // Add bot's answer
    const botMsg = {
      id: messages.length + 2,
      type: 'bot',
      text: answer,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg, botMsg]);
  };

  const handleBackClick = () => {
    setCurrentCategory(null);
    const botMsg = {
      id: messages.length + 1,
      type: 'bot',
      text: 'Choose a category:',
      data: { type: 'categories' },
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMsg]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    setTimeout(() => {
      // Try to find if it matches any question
      let found = false;
      for (const [catKey, catData] of Object.entries(categoryQuestions)) {
        const matchedQ = catData.questions.find(item => 
          item.q.toLowerCase().includes(inputValue.toLowerCase()) || 
          inputValue.toLowerCase().includes(item.q.toLowerCase())
        );
        if (matchedQ) {
          const botMsg = {
            id: messages.length + 2,
            type: 'bot',
            text: matchedQ.a,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMsg]);
          found = true;
          break;
        }
      }
      
      if (!found) {
        const botMsg = {
          id: messages.length + 2,
          type: 'bot',
          text: 'I didn\'t find a matching answer. Please choose from a category.',
          data: { type: 'categories' },
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      }
      
      setIsLoading(false);
    }, 500);
  };

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-card border border-border rounded-lg shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Icon name="MessageCircle" size={20} className="text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">EchoWatch Assistant</h3>
                <p className="text-xs text-muted-foreground">Always available</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'user' ? (
                  <div className="max-w-xs px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground">
                    <p>{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ) : msg.data?.type === 'categories' ? (
                  <div className="max-w-sm w-full space-y-2">
                    <div className="bg-muted px-4 py-2 rounded-lg text-sm">
                      <p className="text-foreground font-medium">{msg.text}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(categoryQuestions).map(([key, cat]) => (
                        <button
                          key={key}
                          onClick={() => handleCategoryClick(key)}
                          className="text-xs px-3 py-2 bg-muted hover:bg-muted/80 rounded text-left transition-colors border border-border/50 hover:border-primary/50"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/30 px-3 py-2 rounded text-xs border border-blue-200 dark:border-blue-800">
                      <p className="font-medium text-foreground mb-1">📧 For detailed assistance:</p>
                      <a
                        href="mailto:support@ecowatch.com"
                        className="text-primary hover:underline font-medium"
                      >
                        support@ecowatch.com
                      </a>
                    </div>
                  </div>
                ) : msg.data?.type === 'questions' ? (
                  <div className="max-w-sm w-full space-y-2">
                    <div className="bg-muted px-4 py-2 rounded-lg text-sm">
                      <p className="text-foreground font-medium">{msg.text}</p>
                    </div>
                    <div className="space-y-2">
                      {categoryQuestions[msg.data.categoryKey].questions.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuestionClick(item.q, item.a)}
                          className="text-xs px-3 py-2 w-full bg-primary/10 hover:bg-primary/20 rounded text-left transition-colors text-primary border border-primary/30 hover:border-primary/60"
                        >
                          {item.q}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleBackClick}
                      className="text-xs px-3 py-2 w-full bg-muted hover:bg-muted/80 rounded transition-colors mt-2"
                    >
                      ← Back to Categories
                    </button>
                  </div>
                ) : (
                  <div className="max-w-xs px-4 py-2 rounded-lg text-sm bg-muted text-foreground">
                    <p>{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-foreground rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-100" />
                    <span className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="p-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Icon name="Send" size={18} />
            </button>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all z-50 ${
          isOpen
            ? 'opacity-0 pointer-events-none'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-xl'
        }`}
      >
        <Icon name="MessageCircle" size={24} />
      </button>
    </>
  );
};

export default Chatbot;
