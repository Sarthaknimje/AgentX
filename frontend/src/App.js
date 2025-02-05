import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Button, 
  Typography, 
  Alert, 
  Paper,
  Stack,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Search as SearchIcon, Mic as MicIcon } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [agentData, setAgentData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;

  useEffect(() => {
    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
      
      if (transcript.toLowerCase().includes('hey agent')) {
        processCommand(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError('Speech recognition failed');
    };

    // Cleanup
    return () => {
      recognition.stop();
    };
  }, []);

  const processCommand = async (command) => {
    if (command.toLowerCase().includes('get agent info for')) {
      const username = command.split('get agent info for @')[1]?.trim();
      if (username) {
        await fetchAgentData(username);
      }
    }
  };

  const fetchAgentData = async (query) => {
    setLoading(true);
    setError(null);
    try {
      // Remove @ symbol if present
      const username = query.replace('@', '');
      
      const response = await axios.get(`${API_URL}/agents/${username}`);
      
      if (response.data.ok) {
        setAgentData(response.data.ok);
        speakResponse(`Found data for ${username}. Current mindshare is ${response.data.ok.mindshare.toFixed(2)}`);
      } else {
        setError('No data found for this agent');
      }
    } catch (err) {
      setError(err.response?.data?.error?.errorMessage || 'Failed to fetch agent data');
      if (err.response?.status === 429) {
        setError('Rate limit exceeded. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const speakResponse = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(speech);
  };

  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsListening(!isListening);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      fetchAgentData(searchQuery);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 4 }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            CookieAI Assistant
          </Typography>

          {/* Search Form */}
          <Paper component="form" onSubmit={handleSearch} sx={{ p: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter Twitter username (e.g. cookiedotfun)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">@</InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" edge="end">
                      <SearchIcon />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      onClick={toggleListening}
                      color={isListening ? 'error' : 'default'}
                    >
                      <MicIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Paper>

          {loading && (
            <Alert severity="info">Loading...</Alert>
          )}

          {error && (
            <Alert severity="error">{error}</Alert>
          )}

          {transcript && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Voice Input:</Typography>
              <Typography>{transcript}</Typography>
            </Paper>
          )}

          {agentData && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Agent Data</Typography>
              <Stack spacing={1}>
                <Typography>
                  <strong>Mindshare:</strong> {agentData.mindshare.toFixed(2)}
                  {agentData.mindshareDeltaPercent && (
                    <Typography component="span" color={agentData.mindshareDeltaPercent > 0 ? 'success.main' : 'error.main'}>
                      {' '}({agentData.mindshareDeltaPercent > 0 ? '+' : ''}{agentData.mindshareDeltaPercent.toFixed(2)}%)
                    </Typography>
                  )}
                </Typography>
                <Typography>
                  <strong>Market Cap:</strong> ${agentData.marketCap.toLocaleString()}
                </Typography>
                <Typography>
                  <strong>Price:</strong> ${agentData.price.toFixed(4)}
                </Typography>
                <Typography>
                  <strong>Holders:</strong> {agentData.holdersCount.toLocaleString()}
                </Typography>
                <Typography>
                  <strong>24h Volume:</strong> ${agentData.volume24Hours.toLocaleString()}
                </Typography>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

export default App;