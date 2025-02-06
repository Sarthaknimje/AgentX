import React, { useEffect, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Mic, MicOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VoiceRecognition = ({ 
  agentData, 
  onCompare, 
  onShowTrends, 
  onSetAlert, 
  onExportData 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const navigate = useNavigate();
  const [compareData, setCompareData] = useState(null);
  const [showTrends, setShowTrends] = useState(false);
  const [priceAlert, setPriceAlert] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      
      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        console.log('Transcript:', transcript);
        
        if (transcript.toLowerCase().includes('cookie')) {
          const command = transcript.toLowerCase();
          
          if (command.includes('check this agent')) {
            handleCommand();
          }
          else if (command.includes('compare with')) {
            const username = command.split('compare with @')[1]?.trim();
            if (username) handleCompare(username);
          }
          else if (command.includes('show trends')) {
            handleShowTrends();
          }
          else if (command.includes('set price alert')) {
            const priceMatch = command.match(/alert (?:for|at) (\d+(?:\.\d+)?)/);
            if (priceMatch) handleSetAlert(parseFloat(priceMatch[1]));
          }
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const handleCommand = async () => {
    try {
      // Extract username from current URL
      const url = window.location.href;
      const username = extractTwitterUsername(url);
      
      if (username) {
        speakResponse(`Looking up agent ${username}`);
        
        // Fetch agent data
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/agents/${username}`);
        
        if (response.data.ok) {
          // Navigate to agent details page
          navigate(`/agent/${username}`);
          speakResponse(`Found data for ${username}. Mindshare is ${response.data.ok.mindshare.toFixed(2)}`);
        } else {
          speakResponse('Sorry, I could not find data for this agent');
        }
      } else {
        speakResponse('Sorry, I could not find a Twitter profile on this page');
      }
    } catch (error) {
      console.error('Error:', error);
      speakResponse('Sorry, there was an error processing your request');
    }
  };

  const handleCompare = async (username) => {
    speakResponse(`Comparing with ${username}`);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/agents/${username}`);
      if (response.data.ok) {
        onCompare(response.data.ok);
        speakResponse(`Comparison data loaded for ${username}`);
      }
    } catch (error) {
      speakResponse('Sorry, could not fetch comparison data');
    }
  };

  const handleShowTrends = () => {
    if (agentData) {
      setShowTrends(true);
      speakResponse('Showing market trends');
    } else {
      speakResponse('Please search for an agent first');
    }
  };

  const handleSetAlert = (price) => {
    onSetAlert(price);
    speakResponse(`Alert set for $${price}`);
  };

  const extractTwitterUsername = (url) => {
    const match = url.match(/(?:twitter|x)\.com\/([^/?]+)/i);
    return match ? match[1] : null;
  };

  const speakResponse = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(speech);
  };

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
    setIsListening(!isListening);
  };

  return (
    <Tooltip title={isListening ? 'Stop listening' : 'Start voice commands'}>
      <IconButton 
        onClick={toggleListening}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          backgroundColor: isListening ? '#ef5350' : '#2196f3',
          color: 'white',
          '&:hover': {
            backgroundColor: isListening ? '#d32f2f' : '#1976d2',
          },
          zIndex: 9999,
          width: 56,
          height: 56,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          '&:active': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }
        }}
      >
        {isListening ? <MicOff /> : <Mic />}
      </IconButton>
    </Tooltip>
  );
};

export default VoiceRecognition;