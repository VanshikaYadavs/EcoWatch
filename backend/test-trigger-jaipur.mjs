import axios from 'axios';

const API_URL = 'http://localhost:8080';

async function triggerJaipurIngestion() {
  try {
    console.log('🚀 Triggering data ingestion for Jaipur...');
    
    // Jaipur coordinates
    const lat = 26.9124;
    const lon = 75.7873;
    
    const response = await axios.get(`${API_URL}/api/ingest/now`, {
      params: {
        lat,
        lon,
        name: 'Jaipur',
        demo: '1' // Use demo mode
      }
    });
    
    console.log('✅ Ingestion successful:', response.data);
  } catch (error) {
    console.error('❌ Ingestion failed:', error.response?.data || error.message);
  }
}

triggerJaipurIngestion();
