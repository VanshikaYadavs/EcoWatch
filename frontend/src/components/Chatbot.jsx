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
        { q: 'What is EchoWatch?', a: '<b>Real-time environmental monitoring for Rajasthan</b>\n\n📊 Tracks:\n• Air quality (AQI, PM2.5, PM10, pollutants)\n• Temperature & heat waves\n• Noise pollution\n• Water quality\n\n🎯 For:\nGovernment • Researchers • Communities • Industries\n\n✓ Instant alerts when levels exceed safe limits\n✓ Historical trends & compliance reports' },
        { q: 'How does EchoWatch work?', a: '<b>4-Step Process</b>\n\n1️⃣ <b>Data Collection</b>\nIoT sensors measure 24/7\n\n2️⃣ <b>Real-Time Processing</b>\nInstant dashboard updates\n\n3️⃣ <b>Alert Generation</b>\nAutomated alerts on threshold breach\n\n4️⃣ <b>Analytics</b>\nTrends, patterns, compliance reports\n\nAccess via web dashboard with filters & exports' },
        { q: 'What are the main features?', a: '<b>8 Core Features</b>\n\n📈 Environmental Dashboard - Real-time overview\n🔔 Alert Center - Manage environmental alerts\n💨 Air Quality Monitor - AQI & pollutant tracking\n🌡️ Temperature Analytics - Thermal trends\n📢 Noise Tracking - Acoustic pollution\n💧 Water Quality - Safety monitoring\n📊 Comparative Analysis - Compare cities\n📋 Historical Reports - Compliance data' },
        { q: 'Getting started - First steps?', a: '<b>Quick Start in 6 Steps</b>\n\n1️⃣ Create account & login\n2️⃣ Visit Environmental Dashboard\n3️⃣ Check Air Quality Monitor\n4️⃣ Configure Notification Settings\n5️⃣ Use Comparative Analysis\n6️⃣ Download reports as needed\n\n💡 Start with dashboard, explore based on needs' },
        { q: 'Who can use EchoWatch?', a: '<b>Multiple User Types</b>\n\n👑 Government Officials\n🏛️ Environmental Agencies\n👨‍🔬 Researchers & Scientists\n📊 Data Analysts\n👥 Community Leaders\n🤝 NGOs & CSOs\n🏭 Industry Monitors\n👁️ General Public\n\n✓ Role-based access & custom features' },
        { q: 'How is data updated?', a: '<b>Live Data Streaming</b>\n\n⏱️ Update Frequency:\n• Air quality: Every 5-10 minutes\n• Temperature: Every 15 minutes\n• Noise/Water: Every 15-30 minutes\n\n✓ Time-stamped & quality-checked\n✓ Real-time update indicator on dashboard\n✓ Offline sensors flagged immediately\n✓ 24/7 monitoring across Rajasthan' }
      ]
    },
    features: {
      name: '🎯 Features & Monitoring',
      questions: [
        { q: 'What is the Dashboard?', a: '<b>Your Environmental Command Center</b>\n\n📊 Real-time Overview:\n• All key metrics at a glance\n• Geographic heatmap (color-coded by pollution)\n• Quick stats cards\n• Sensor details by location\n\n⚙️ Controls:\n• Time range filter\n• Export dashboard data\n• Auto-refresh every 5 minutes\n\n✓ Green=Good • Yellow=Moderate • Orange=Unhealthy • Red=Hazardous' },
        { q: 'What is Alert Center?', a: '<b>Alert Management Hub</b>\n\n📋 Features:\n• Alert list with severity colors\n• Advanced filtering\n• Quick actions: Acknowledge • Resolve • Delete\n• Search & export\n• Alert statistics\n\n⚡ Actions:\n1️⃣ Click alert for details\n2️⃣ Acknowledge (mark as seen)\n3️⃣ Resolve (issue fixed)\n4️⃣ Export for compliance\n\n🎨 Severity codes: 🔴 Critical • 🟠 High • 🟡 Medium • 🔵 Low' },
        { q: 'Air Quality Monitoring', a: '<b>Comprehensive AQI & Pollutant Tracking</b>\n\n🔢 AQI Scale (0-500+):\n• 0-50: Good ✓\n• 51-100: Moderate ⚠️\n• 101-150: Sensitive groups at risk\n• 151+: Unhealthy/Hazardous 🔴\n\n📊 Pollutants Tracked:\n• PM2.5 & PM10 (particulate matter)\n• O3 (Ozone)\n• NO2 (Nitrogen Dioxide)\n• SO2 (Sulfur Dioxide)\n• CO (Carbon Monoxide)\n\n✓ Location comparisons • 7/30-day trends • Health recommendations' },
        { q: 'Temperature Analytics explained', a: '<b>Thermal Patterns & Trends</b>\n\n📈 Visualization:\n• Real-time temperature map\n• Color-coded heatmap\n• Daily/weekly/monthly trends\n• Seasonal patterns\n\n⚠️ Alerts:\n• Heat waves (>45°C for 2+ days)\n• Cold waves (<5°C for 2+ days)\n• Automatic health warnings\n\n✓ Anomaly detection\n✓ City comparisons\n✓ Health impact assessment' },
        { q: 'What is Noise Monitoring?', a: '<b>Acoustic Pollution Tracking</b>\n\n📢 Reference Scale:\n• ~30dB: Quiet library\n• ~60dB: Normal conversation\n• ~80dB: Heavy traffic\n• ~100dB: Drill/machinery\n• 120+dB: Dangerous ⚠️\n\n✓ Legal Compliance Tracking:\n• Residential: 55dB day, 45dB night\n• Commercial: 65dB day, 55dB night\n• Industrial: 75dB day, 70dB night\n\n✓ Trend graphs • Source identification • Health alerts' },
        { q: 'Comparative Analysis feature', a: '<b>Compare Cities & Time Periods</b>\n\n🔀 Compare:\n• 2-5 cities simultaneously\n• AQI, Temperature, Noise, Water quality\n• Same period last year vs this year\n• Performance rankings\n\n📊 Outputs:\n• Bar charts & line graphs\n• Statistical metrics (avg, min, max)\n• Trend direction (improving/declining)\n• Export reports\n\n💡 Auto-insights: "Jodhpur improved 15% vs last month"' }
      ]
    },
    alerts: {
      name: '🔔 Alerts & Notifications',
      questions: [
        { q: 'How do alerts work?', a: '<b>Automated Alert System</b>\n\n🔄 Process:\n1️⃣ Admin sets safe limits\n2️⃣ Sensors checked every 5-15 min\n3️⃣ Threshold exceeded → Instant alert\n4️⃣ Severity auto-assigned\n5️⃣ Notification delivered\n6️⃣ Alert remains until resolved\n\n📊 Features:\n✓ Time-stamped & logged\n✓ Critical alerts escalate\n✓ Compliance record kept' },
        { q: 'What are severity levels?', a: '<b>4 Severity Levels</b>\n\n🔴 <b>CRITICAL</b>\nAction needed: Within 1 hour\nExample: AQI >500\nAlert: All authorities\n\n🟠 <b>HIGH</b>\nAction needed: Within 4 hours\nExample: AQI 300-500\nAlert: Environmental managers\n\n🟡 <b>MEDIUM</b>\nAction needed: Within 1 day\nExample: AQI 150-300\n\n🔵 <b>LOW</b>\nInformational only\nExample: AQI 100-150\n\n✓ Filter alerts by severity level' },
        { q: 'How to manage alerts?', a: '<b>Alert Center Actions</b>\n\n📋 View & Filter:\n• All alerts with severity codes\n• Filter by: Severity, Status, Type, Location, Date\n• Search by location/parameter\n• Sort by date or severity\n\n⚡ Actions:\n✓ <b>Acknowledge</b> - Mark as seen\n✓ <b>Resolve</b> - Issue fixed\n✓ <b>Delete</b> - Remove alert\n✓ <b>Export</b> - CSV reports\n\n📊 View:\n• Detailed readings\n• Historical context\n• Recommendations' },
        { q: 'What is a critical alert?', a: '<b>Critical Alert = Emergency</b>\n\n⚠️ Triggers:\n• AQI >500 (hazardous)\n• Noise >90dB sustained\n• Temperature >50°C (heat wave)\n\n🚨 Consequences:\n• Immediate health threat\n• Schools/offices may close\n• Traffic rerouting\n• Emergency medical response\n\n📢 Actions:\n✓ All authorities notified\n✓ Auto-logged for compliance\n✓ Persists until parameter normalizes\n\nExample: Diwali pollution spike → AQI 550 → Critical alert' },
        { q: 'How to acknowledge an alert?', a: '<b>Acknowledging an Alert</b>\n\n5 Simple Steps:\n1️⃣ Find alert in Alert Center\n2️⃣ Click "Acknowledge" button\n3️⃣ Status changes to "Acknowledged"\n4️⃣ Timestamp recorded\n5️⃣ Alert visible for reference\n\n✓ Shows you\'re monitoring\n✓ Prevents duplicate notifications\n✓ Creates audit trail\n✓ Tracks response times\n\n💡 Acknowledge immediately when you see critical alert, resolve later when fixed' },
        { q: 'Can I customize notifications?', a: '<b>Fully Customizable Settings</b>\n\n⚙️ Configure:\n• <b>Alert Types:</b> Air Quality, Temperature, Noise, Water\n• <b>Severity:</b> Critical, High, Medium, Low\n• <b>Locations:</b> Specific cities or all Rajasthan\n• <b>Delivery:</b> Email, In-app, SMS\n• <b>Time:</b> Quiet hours (11PM-6AM)\n• <b>Thresholds:</b> Custom sensitivity\n• <b>Frequency:</b> Instant, daily digest, weekly\n• <b>Contacts:</b> Multiple emails for critical\n\n📍 Access: Profile → Notification Settings' }
      ]
    },
    data: {
      name: '📊 Environmental Data',
      questions: [
        { q: 'What is AQI?', a: '<b>Air Quality Index (0-500+)</b>\n\n✅ <b>0-50: GOOD</b>\nNo health risk\n\n✅ <b>51-100: MODERATE</b>\nSensitive groups should limit outdoor activity\n\n⚠️ <b>101-150: UNHEALTHY FOR SENSITIVE GROUPS</b>\nChildren, elderly, respiratory patients affected\n\n⚠️ <b>151-200: UNHEALTHY</b>\nGeneral population affected\n\n🔴 <b>201-500+: HAZARDOUS</b>\nHealth emergency - stay indoors\n\n📊 <b>Calculated from:</b>\nPM2.5 • PM10 • Ozone • NO2 • SO2 • CO' },
        { q: 'What is PM2.5?', a: '<b>Fine Particulate Matter (≤2.5 micrometers)</b>\n\n🚫 Sources:\n• Vehicle exhaust (40%)\n• Industrial emissions (30%)\n• Burning & dust (30%)\n\n⚠️ Health Impact:\n• Deep lung penetration\n• Respiratory diseases\n• Heart problems\n• Reduced life expectancy\n\n📏 <b>Safe Limit:</b> 15 µg/m³ (WHO)\n\n💡 <b>Each 10 µg/m³ increase</b> = 6 months shorter life\n\n✓ Protection: N95 mask when AQI >150' },
        { q: 'What is PM10?', a: '<b>Coarse Particulate Matter (≤10 micrometers)</b>\n\n🌬️ Sources:\n• Road dust (30%)\n• Construction (25%)\n• Agriculture (25%)\n• Vehicles (20%)\n\n⚠️ Health Impact:\n• Coughing, wheezing\n• Reduced lung function\n• Asthma worsening\n• Upper respiratory issues\n\n📏 <b>Safe Limit:</b> 50 µg/m³ (WHO)\n\n📈 Higher During:\n• Windy days\n• Dry season\n• Construction\n• Agricultural harvest' },
        { q: 'Air pollutants tracked', a: '<b>6 Major Pollutants Monitored</b>\n\n🌫️ <b>PM2.5 & PM10</b> - Particulate matter\n\n🔵 <b>O3 (Ozone)</b>\nHealthy: <70 ppb • Unhealthy: >100 ppb\n\n🟤 <b>NO2 (Nitrogen Dioxide)</b>\nFrom vehicles & power plants\nHealthy: <40 ppb • Unhealthy: >100 ppb\n\n🟡 <b>SO2 (Sulfur Dioxide)</b>\nFrom coal burning, industrial\nHealthy: <20 ppb • Unhealthy: >100 ppb\n\n⚫ <b>CO (Carbon Monoxide)</b>\nFrom combustion\nHealthy: <1000 ppb • Unhealthy: >10000 ppb\n\n✓ Combined they determine AQI' },
        { q: 'How is temperature tracked?', a: '<b>Thermal Monitoring & Alerts</b>\n\n📡 <b>Measurement:</b>\nEvery 5-15 minutes in °Celsius\n\n📊 <b>Visualization:</b>\n• Real-time temperature map\n• Color-coded (blue→red)\n• Daily/monthly trends\n• Seasonal patterns\n\n🔥 <b>Heat Wave Alert:</b>\n• Trigger: >45°C for 2+ days\n• Action: Health authorities, schools\n• Response: Water supply, cooling centers\n\n❄️ <b>Cold Wave Alert:</b>\n• Trigger: <5°C for 2+ days\n• Impact: Agriculture, health risks\n\n✓ Correlates with air quality & disease' },
        { q: 'What is noise measured in?', a: '<b>Decibels (dB) - Logarithmic Scale</b>\n\n📏 <b>Reference Points:</b>\n• 30dB: Quiet library\n• 60dB: Normal conversation\n• 80dB: Heavy traffic\n• 100dB: Drill/machinery\n• 120+dB: Hearing damage ⚠️\n\n⚠️ <b>Health Impact by Level:</b>\n• 50-60dB: Minimal\n• 60-70dB: Sleep disruption\n• 70-85dB: Hearing damage\n• 85+dB: Rapid damage\n\n✅ <b>Legal Standards (India):</b>\nResidential: 55dB day • 45dB night\nCommercial: 65dB day • 55dB night\nIndustrial: 75dB day • 70dB night' }
      ]
    },
    account: {
      name: '👤 Account & User Management',
      questions: [
        { q: 'How to reset password?', a: '<b>Forgot Password? Reset in 8 Steps</b>\n\n1️⃣ Login page → Click "Forgot Password"\n2️⃣ Enter email address\n3️⃣ Check inbox for reset link (check spam)\n4️⃣ Click link (expires in 24 hours)\n5️⃣ Create strong password:\n   • 8+ characters\n   • Mix: UPPERCASE + lowercase + 123 + @#$%\n   • Different from previous\n6️⃣ Confirm password\n7️⃣ Click "Reset Password"\n8️⃣ Login with new password\n\n⏱️ <b>Didn\'t receive email?</b>\nWait 5 min • Check spam • Try again\n\n📧 <b>Need help?</b> info@echowatch.in' },
        { q: 'What are user roles?', a: '<b>6 User Roles</b>\n\n👑 <b>Administrator</b>\nFull system access, user management, settings\n\n🏛️ <b>Government Official</b>\nDashboard, alerts, reports, compliance\n\n👨‍🔬 <b>Researcher/Analyst</b>\nHistorical data, trends, reports\n\n🔍 <b>Data Analyst</b>\nData analysis, exports, dashboards\n\n👥 <b>Community Leader</b>\nLocal area dashboard, alerts\n\n👁️ <b>Viewer</b>\nRead-only access\n\n📞 Request role change → Contact admin' },
        { q: 'How to access my profile?', a: '<b>Manage Your Profile</b>\n\n⚙️ Steps:\n1️⃣ Click name/avatar (top-right)\n2️⃣ Select "My Profile"\n\n📋 <b>View:</b>\nName • Email • Phone • Role • Join date • Last login\n\n✏️ <b>Edit:</b>\nName • Phone • Organization\n\n⚙️ <b>Settings:</b>\n• Default location\n• Notification preferences\n• Data export\n• Activity log\n• Logout option\n\n🔒 <b>Security:</b>\n✓ Change password (separate process)\n✓ Never share credentials\n✓ Review activity regularly\n\n📞 Issues? info@echowatch.in' },
        { q: 'How to change password?', a: '<b>Change Password While Logged In</b>\n\n5 Steps:\n1️⃣ Go to User Profile\n2️⃣ Click "Change Password"\n3️⃣ Enter current password (verification)\n4️⃣ Create new password:\n   • 8+ characters\n   • UPPERCASE + lowercase + 123 + symbols\n   • Different from last 3 passwords\n5️⃣ Confirm & click "Update Password"\n\n✓ Status: "Changed successfully"\n✓ Remain logged in\n✓ No re-login needed\n\n✅ <b>Best Practices:</b>\n• Change every 3 months\n• Use unique password\n• Don\'t share via email/phone\n• Review account activity after' },
        { q: 'Can I export data?', a: '<b>Export Your Data</b>\n\n📊 <b>What You Can Export:</b>\n• Alerts (all with severity, status, timestamp)\n• Dashboard data (real-time readings)\n• Historical reports (trends & summaries)\n• Comparisons (city analysis)\n• Sensor readings (raw data)\n\n📥 <b>Formats:</b>\nCSV • PDF • JSON\n\n⬇️ <b>How to Export:</b>\n1️⃣ Find data table\n2️⃣ Click "Export" button\n3️⃣ Select date range\n4️⃣ Choose format (CSV/PDF/JSON)\n5️⃣ Click "Download"\n\n✓ Immediate download\n✓ Not stored on server\n✓ Only your accessible data included\n\n💡 <b>Uses:</b> Reports • Analysis • Sharing • Compliance' },
        { q: 'What if I have login issues?', a: '<b>Login Troubleshooting</b>\n\n❌ <b>"Invalid username/password":</b>\n✓ Check email spelling\n✓ Turn off Caps Lock\n✓ Use "Forgot Password"\n✓ Clear browser auto-fill\n\n❌ <b>Account Locked:</b>\n5 failed attempts = 30-min lock\n✓ Wait 30 minutes OR reset password\n\n❌ <b>"Email not recognized":</b>\n✓ Check correct email address\n✓ Try "Forgot Password" to verify\n\n❌ <b>Session Expired:</b>\n✓ Simply login again (2-hour inactivity limit)\n\n❌ <b>2FA Issues:</b>\n✓ Contact support immediately\n\n📞 <b>Still Having Issues?</b>\nEmail: info@echowatch.in\nInclude: Email • Error message • Screenshot\nResponse: Within 24 hours' }
      ]
    },
    locations: {
      name: '🗺️ Locations & Support',
      questions: [
        { q: 'Which cities are monitored?', a: '<b>150+ Sensors Across 23+ Cities</b>\n\n🏙️ <b>MAJOR CITIES:</b>\n• Jaipur (36+ sensors) - Full coverage\n• Jodhpur (20+ sensors) - Desert dust tracking\n• Udaipur (15+ sensors) - Water quality focus\n• Bikaner (12+ sensors) - Agricultural impact\n• Ajmer (10+ sensors) - Tourist area\n\n🏘️ <b>SECONDARY CITIES:</b>\nKota • Sikar • Pali • Alwar • Bhilwara • Churu\nDausa • Hanumangarh • Jhalawar • Nagaur\n\n📊 <b>Coverage:</b>\n✓ 85% of Rajasthan population\n✓ All major cities\n✓ Expanding monthly\n\n📍 View locations on Dashboard map\n✉️ Add your city: info@echowatch.in' },
        { q: 'Tell me about Jaipur', a: '<b>Jaipur - Pink City with Challenges</b>\n\n📍 <b>Facts:</b>\n• Capital of Rajasthan\n• 3.2M population (8M metro area)\n• Known for culture, tourism, industry\n\n🚗 <b>Challenges:</b>\n• 2M+ vehicles\n• Industrial zones\n• Seasonal dust storms\n• Festival fireworks\n\n📊 <b>Environmental Data:</b>\n36+ sensors deployed across all districts\n\n❄️ <b>Winter (Dec-Feb):</b>\nAQI 250-350 • Temperature inversion\n\n☀️ <b>Summer (Mar-May):</b>\nAQI 150-250 • Dust storms\n\n🌧️ <b>Monsoon (Jun-Sep):</b>\nAQI 50-150 • Rain clears air\n\n⚠️ <b>Key Concerns:</b>\nPM2.5 often 2x WHO limits\nVehicle emissions • Industrial pollution' },
        { q: 'Tell me about Jodhpur', a: '<b>Jodhpur - Sun City of Rajasthan</b>\n\n📍 <b>Facts:</b>\n• Population: 1.1M\n• Western Rajasthan\n• 320+ sunny days/year\n• Gateway to Thar Desert\n\n🌬️ <b>Unique Pollution:</b>\nDesert dust storms (frequent)\nStone/marble processing\nLess vehicle-heavy than Jaipur\n\n📊 <b>Environmental Data:</b>\n20+ sensors in city & suburbs\n\n⚠️ <b>AQI Profile:</b>\n• Ranges: 80-250\n• Worst: April-May (dust storms)\n• Best: August-September (post-monsoon)\n• PM10 spikes to 500+ during storms\n\n🌡️ <b>Temperature:</b>\nExtremely hot (>45°C May-June)\nHeat waves pose health risks\n\n💧 <b>Water:</b>\nScarcity issues\nQuality monitoring critical' },
        { q: 'Troubleshooting - No data showing', a: '<b>No Data on Dashboard? Follow These Steps</b>\n\n1️⃣ <b>Check Location Settings:</b>\n✓ Profile → Location Preferences\n✓ Verify default city set correctly\n✓ Try different city\n✓ Refresh page\n\n2️⃣ <b>Hard Refresh Browser:</b>\n✓ Ctrl+F5 (or Cmd+Shift+R Mac)\n✓ Close & reopen tab\n✓ Try different browser\n✓ Clear browser cookies\n\n3️⃣ <b>Check Sensor Status:</b>\n✓ Some sensors offline temporarily\n✓ Check Alert Center for offline alerts\n✓ System notifies admins\n\n4️⃣ <b>Verify Internet:</b>\n✓ Test other websites\n✓ Check signal strength\n\n5️⃣ <b>Check Date Range:</b>\n✓ Viewing historical data?\n✓ Try "Last 30 Days"\n\n6️⃣ <b>Browser Compatibility:</b>\n✓ Use latest Chrome, Firefox, Safari, Edge\n✓ Disable blocking extensions\n\n📞 <b>Still no data?</b>\nEmail info@echowatch.in with:\nLocation • Date range • Screenshots' },
        { q: 'Connection issues - How to fix?', a: '<b>Connection Problems? Try These</b>\n\n🌐 <b>Check Internet:</b>\n✓ Open Google → confirm working\n✓ speedtest.net → should have >5 Mbps\n✓ Check WiFi signal strength\n✓ Try mobile data if on WiFi\n✓ Try different network\n\n🔧 <b>Browser Fixes:</b>\n✓ Clear cache & cookies\n✓ Disable extensions (VPN, ad-blockers)\n✓ Try incognito/private mode\n✓ Update browser version\n✓ Try different browser\n\n🔒 <b>Firewall Issues:</b>\n✓ Corporate firewall blocking? Contact IT\n✓ Whitelist ecowatch domain\n✓ Try disabling VPN\n✓ Check proxy settings\n\n⚠️ <b>Server Issues:</b>\n✓ Check status.ecowatch.com\n✓ Wait 5-10 minutes\n✓ Try later (maintenance?)\n✓ Check notifications\n\n📞 <b>Still not working?</b>\ninfo@echowatch.in\n• Include screenshot\n• Your location & device\n• Browser/OS version' },
        { q: 'Privacy & Security', a: '<b>Your Privacy is Protected</b>\n\n🔐 <b>Data Protection:</b>\n✓ HTTPS/TLS encryption (bank-grade)\n✓ Certified data centers\n✓ Role-based access\n✓ Quarterly security audits\n✓ Multiple backups\n\n👤 <b>What We Collect:</b>\nAccount info • Usage data • Sensor readings (anonymized)\n\n🛡️ <b>Security Measures:</b>\n✓ Hashed passwords\n✓ Optional 2FA\n✓ 2-hour session timeout\n✓ Activity logging\n✓ Intrusion detection\n✓ 1-hour incident response\n\n✅ <b>Your Rights:</b>\n✓ Access your data\n✓ Correct information\n✓ Delete data (legal holds apply)\n✓ Opt-out communications\n\n⚠️ <b>Safe Practices:</b>\n✓ Never share password\n✓ Enable 2FA\n✓ Logout on shared computers\n✓ Don\'t click suspicious emails\n\n📧 Privacy concerns? privacy@ecowatch.com' }
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
                        href="mailto:info@echowatch.in"
                        className="text-primary hover:underline font-medium"
                      >
                        info@echowatch.in
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
                    <div className="whitespace-pre-wrap break-words">
                      {msg.text.split('\n').map((line, idx) => (
                        <div key={idx} dangerouslySetInnerHTML={{ __html: line }} />
                      ))}
                    </div>
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
