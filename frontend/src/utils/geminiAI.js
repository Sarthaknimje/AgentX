import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyDIzhv1mhwRqjpFvu6KKgqCbYwQ3V_ZNGA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const getAIAnalysis = async (data) => {
  try {
    const prompt = `Analyze this trading agent (${data.agentName}) and provide a concise analysis:

📈 MARKET TREND
• Overall: [POSITIVE/NEGATIVE/NEUTRAL]
• Market Cap: $${data.marketCap.toLocaleString()} (${data.marketCapDeltaPercent}%)
• 24h Volume: $${data.volume24Hours.toLocaleString()}

👥 ENGAGEMENT
• Followers: ${data.followers}
• Impressions: ${data.avgImpressions}
• Holder Growth: ${data.holdersCount} (${data.holdersDeltaPercent}%)

💡 KEY INSIGHTS
• Strengths: [One line summary]
• Risks: [One line summary]
• Opportunity: [One line summary]

🎯 RECOMMENDATION
[One clear actionable insight]`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};