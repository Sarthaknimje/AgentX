const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Debug log to check if API key is loaded
console.log('API Key loaded:', process.env.COOKIE_API_KEY ? 'Yes' : 'No');

// Proxy endpoint for Cookie API
app.get('/api/agents/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log(`Fetching data for username: ${username}`); // Debug log
    console.log('Using API key:', process.env.COOKIE_API_KEY); // Debug log (will be masked in production)

    const response = await axios.get(
      `https://api.cookie.fun/v2/agents/twitterUsername/${username}?interval=_7Days`,
      {
        headers: {
          'x-api-key': process.env.COOKIE_API_KEY
        }
      }
    );
    
    console.log('API response received'); // Debug log
    res.json(response.data);
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || 'Internal server error'
    });
  }
});

// Add after the username endpoint
app.get('/api/agents/contractAddress/:contractAddress', async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const { interval = '_7Days' } = req.query;
    
    console.log(`Fetching data for contract address: ${contractAddress}`);
    
    const response = await axios.get(
      `https://api.cookie.fun/v2/agents/contractAddress/${contractAddress}?interval=${interval}`,
      {
        headers: {
          'x-api-key': process.env.COOKIE_API_KEY
        }
      }
    );
    
    console.log('API response received');
    res.json(response.data);
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || 'Internal server error'
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});