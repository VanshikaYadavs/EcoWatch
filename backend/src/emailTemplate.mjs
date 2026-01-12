/**
 * Beautiful Email Template Generator for EcoWatch Alerts
 * Creates attractive, responsive HTML emails with suggestions
 */

export function generateAlertEmail({ type, value, location, threshold }) {
  const alertConfig = getAlertConfig(type, value, threshold);
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EcoWatch Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${alertConfig.gradient}); padding: 30px 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">${alertConfig.icon}</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">EcoWatch Alert</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">${alertConfig.title}</p>
            </td>
          </tr>
          
          <!-- Alert Details -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Value Display -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="text-align: center; background-color: ${alertConfig.bgColor}; border-radius: 8px; padding: 24px;">
                    <div style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Current Level</div>
                    <div style="font-size: 48px; font-weight: 700; color: ${alertConfig.color}; line-height: 1; margin-bottom: 8px;">${value}</div>
                    <div style="font-size: 16px; color: #64748b;">${alertConfig.unit}</div>
                  </td>
                </tr>
              </table>

              <!-- Location & Threshold -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td width="50%" style="padding-right: 10px;">
                    <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; border-left: 3px solid #3b82f6;">
                      <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">📍 Location</div>
                      <div style="font-size: 16px; color: #1e293b; font-weight: 600;">${location}</div>
                    </div>
                  </td>
                  <td width="50%" style="padding-left: 10px;">
                    <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; border-left: 3px solid #f59e0b;">
                      <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">⚠️ Your Threshold</div>
                      <div style="font-size: 16px; color: #1e293b; font-weight: 600;">${threshold} ${alertConfig.unit}</div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Health Impact -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px; font-weight: 600;">⚠️ Health Impact</h3>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">${alertConfig.healthImpact}</p>
              </div>

              <!-- Suggestions -->
              <div style="background: linear-gradient(to bottom right, #f0fdf4, #dcfce7); border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 16px 0; color: #166534; font-size: 18px; font-weight: 600;">💡 Recommended Actions</h3>
                <ul style="margin: 0; padding-left: 20px; color: #166534;">
                  ${alertConfig.suggestions.map(s => `<li style="margin-bottom: 10px; font-size: 14px; line-height: 1.6;">${s}</li>`).join('')}
                </ul>
              </div>

              <!-- Additional Tips -->
              <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px;">
                <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; font-weight: 600;">📋 Quick Tips</h4>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
                  ${alertConfig.quickTips.map(t => `<li style="margin-bottom: 8px; font-size: 13px;">${t}</li>`).join('')}
                </ul>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;">
                Received at ${new Date().toLocaleString('en-IN', { 
                  timeZone: 'Asia/Kolkata',
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </p>
              <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 12px;">
                You're receiving this because you've set alert thresholds in EcoWatch
              </p>
              <a href="https://ecowatch.local/settings" style="display: inline-block; color: #3b82f6; text-decoration: none; font-size: 13px; font-weight: 500;">Manage Alert Settings</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const plainText = `
🚨 EcoWatch Alert: ${alertConfig.title}

📊 Current Level: ${value} ${alertConfig.unit}
📍 Location: ${location}
⚠️  Your Threshold: ${threshold} ${alertConfig.unit}

⚠️ Health Impact:
${alertConfig.healthImpact}

💡 Recommended Actions:
${alertConfig.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

📋 Quick Tips:
${alertConfig.quickTips.map((t, i) => `• ${t}`).join('\n')}

---
Received at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Manage your alert settings: https://ecowatch.local/settings
`;

  return { html, plainText, subject: `🚨 ${alertConfig.title} in ${location}` };
}

function getAlertConfig(type, value, threshold) {
  switch (type) {
    case 'AQI':
      return {
        icon: '🌫️',
        title: 'High Air Quality Index',
        color: '#dc2626',
        bgColor: '#fee2e2',
        gradient: '#ef4444, #dc2626',
        unit: 'AQI',
        healthImpact: value >= 200 
          ? 'Very unhealthy air quality. Everyone may experience serious health effects. Outdoor activities should be avoided.'
          : value >= 150
          ? 'Unhealthy air quality. Everyone may begin to experience health effects. Sensitive groups may experience more serious effects.'
          : 'Moderate to unhealthy air quality for sensitive groups. People with respiratory conditions should limit prolonged outdoor exertion.',
        suggestions: [
          '🏠 <strong>Stay Indoors:</strong> Keep windows and doors closed to prevent outdoor air from entering your home',
          '😷 <strong>Wear Protection:</strong> Use N95 or N99 masks if you must go outside for essential activities',
          '🌱 <strong>Air Purification:</strong> Run air purifiers with HEPA filters in your home, especially in bedrooms',
          '🚫 <strong>Limit Physical Activity:</strong> Postpone outdoor exercise, jogging, and strenuous activities until air quality improves',
          '💊 <strong>Health Monitoring:</strong> Keep asthma inhalers and prescribed medications easily accessible'
        ],
        quickTips: [
          'Check real-time AQI updates before planning any outdoor activities',
          'Create a clean room at home with sealed windows and air purifiers',
          'Stay well-hydrated - water helps flush toxins from your body',
          'Consider working from home to minimize commute exposure'
        ]
      };

    case 'HEAT':
    case 'TEMPERATURE':
      return {
        icon: '🌡️',
        title: 'High Temperature Alert',
        color: '#ea580c',
        bgColor: '#ffedd5',
        gradient: '#f97316, #ea580c',
        unit: '°C',
        healthImpact: value >= 40
          ? 'Extreme heat conditions. High risk of heat stroke and heat exhaustion. Outdoor activities are dangerous.'
          : value >= 35
          ? 'Dangerous heat levels. Risk of heat-related illnesses increases significantly.'
          : 'High temperatures detected. Extended exposure may cause discomfort and health issues.',
        suggestions: [
          '💧 <strong>Hydrate Frequently:</strong> Drink water every 15-20 minutes, even if you don\'t feel thirsty (aim for 3-4 liters daily)',
          '❄️ <strong>Seek Cool Spaces:</strong> Stay in air-conditioned rooms or visit public cooling centers like malls, libraries',
          '⏰ <strong>Time Your Activities:</strong> Avoid sun exposure between 11 AM - 4 PM when temperatures peak',
          '👕 <strong>Dress Appropriately:</strong> Wear light-colored, loose cotton clothing and a wide-brimmed hat outdoors',
          '🚿 <strong>Cool Down Regularly:</strong> Take cool showers or use damp towels on your neck and wrists to lower body temperature'
        ],
        quickTips: [
          'Recognize heat exhaustion signs: heavy sweating, weakness, dizziness, nausea',
          'Never leave children, elderly, or pets in parked vehicles',
          'Eat light meals - heavy foods increase metabolic heat',
          'Apply SPF 30+ sunscreen 30 minutes before going outdoors'
        ]
      };

    case 'NOISE':
      return {
        icon: '🔊',
        title: 'High Noise Level',
        color: '#7c3aed',
        bgColor: '#f3e8ff',
        gradient: '#8b5cf6, #7c3aed',
        unit: 'dB',
        healthImpact: value >= 85
          ? 'Prolonged exposure to noise levels above 85 dB can cause permanent hearing damage. Immediate protection is recommended.'
          : 'Elevated noise levels detected. Extended exposure may cause hearing damage and increased stress levels.',
        suggestions: [
          '🎧 <strong>Use Ear Protection:</strong> Wear noise-canceling headphones or foam earplugs (reduces noise by 15-30 dB)',
          '🚪 <strong>Create Sound Barriers:</strong> Close all windows and doors, use heavy curtains or acoustic panels to block external noise',
          '🏃 <strong>Relocate if Possible:</strong> Move to a quieter room away from the noise source or consider temporary relocation',
          '⏸️ <strong>Take Sound Breaks:</strong> Give your ears rest every hour by spending 10-15 minutes in complete silence',
          '🌳 <strong>Escape to Nature:</strong> Visit nearby parks or green spaces which typically have 20-30 dB lower noise levels'
        ],
        quickTips: [
          'Safe noise exposure: 85 dB for max 8 hours, 88 dB for 4 hours, 91 dB for 2 hours',
          'Use the 60/60 rule for headphones: 60% volume for maximum 60 minutes',
          'Chronic noise exposure increases stress hormones and blood pressure',
          'Consider white noise machines to mask disturbing sounds while sleeping'
        ]
      };

    case 'HUMIDITY':
      return {
        icon: '💧',
        title: 'High Humidity Alert',
        color: '#0891b2',
        bgColor: '#cffafe',
        gradient: '#06b6d4, #0891b2',
        unit: '%',
        healthImpact: value >= 80
          ? 'Very high humidity levels. Increased discomfort, difficulty in body temperature regulation, and potential for mold growth.'
          : 'High humidity detected. May cause discomfort and affect those with respiratory conditions.',
        suggestions: [
          '❄️ Use air conditioning or dehumidifiers to reduce indoor humidity',
          '🪟 Improve ventilation - open windows when outdoor humidity is lower',
          '🧹 Check for and prevent mold growth in damp areas',
          '🌬️ Use exhaust fans in bathrooms and kitchens',
          '💧 Avoid overwatering indoor plants',
          '👕 Wear breathable, moisture-wicking fabrics'
        ],
        quickTips: [
          'Ideal indoor humidity is 30-50% for comfort and health',
          'Use calcium chloride or silica gel for natural dehumidification',
          'Monitor for condensation on windows - sign of high humidity'
        ]
      };

    default:
      return {
        icon: '⚠️',
        title: 'Environmental Alert',
        color: '#dc2626',
        bgColor: '#fee2e2',
        gradient: '#ef4444, #dc2626',
        unit: '',
        healthImpact: 'Environmental parameters have exceeded your configured thresholds.',
        suggestions: [
          'Stay informed about current environmental conditions',
          'Follow local health authority guidelines',
          'Take appropriate precautions based on the alert type'
        ],
        quickTips: [
          'Monitor environmental conditions regularly',
          'Adjust your activities based on current conditions'
        ]
      };
  }
}

export default { generateAlertEmail };
