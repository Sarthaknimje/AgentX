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
 IconButton,
 Select,
 MenuItem,
 FormControl,
 InputLabel,
 Grid,
 Table,
 TableBody,
 TableCell,
 TableContainer,
 TableHead,
 TableRow,
 Checkbox,
 FormGroup,
 FormControlLabel,
 Radio,
 RadioGroup
} from '@mui/material';
import { Search as SearchIcon, Mic as MicIcon, Share as ShareIcon, Download as DownloadIcon } from '@mui/icons-material';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import ComparisonTable from './components/ComparisonTable.js';
import { calculateRSI, calculateMACD } from './utils/technicalAnalysis';
import AgentDetails from './components/AgentDetails';
import VoiceRecognition from './components/VoiceRecognition';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';


function App() {
 const [isListening, setIsListening] = useState(false);
 const [transcript, setTranscript] = useState('');
 const [searchQuery, setSearchQuery] = useState('');
 const [agentData, setAgentData] = useState(null);
 const [error, setError] = useState(null);
 const [loading, setLoading] = useState(false);
 const [interval, setInterval] = useState('_7Days');
 const [compareMode, setCompareMode] = useState(false);
 const [compareData, setCompareData] = useState(null);
 const [priceAlert, setPriceAlert] = useState(null);
 const [showTrends, setShowTrends] = useState(false);
 const [searchMode, setSearchMode] = useState('username');
 const [contractAddress, setContractAddress] = useState('');


 // Initialize speech recognition
 const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
 const recognition = new SpeechRecognition();


 recognition.continuous = true;
 recognition.interimResults = true;


 useEffect(() => {
   // Get search parameter from URL
   const urlParams = new URLSearchParams(window.location.search);
   const searchParam = urlParams.get('search');
   const contractSearch = urlParams.get('contractSearch');
  
   // If contract search parameter exists, switch to contract mode and search
   if (contractSearch) {
     setSearchMode('contract');
     setContractAddress(contractSearch);
     fetchAgentData(contractSearch, 'contract');
   }
   // Otherwise if username search parameter exists, trigger search
   else if (searchParam) {
     setSearchQuery(searchParam);
     fetchAgentData(searchParam);
   }
  
   // Rest of your useEffect code for speech recognition
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
   const cmd = command.toLowerCase();
  
   if (cmd.includes('get agent info for')) {
     const username = command.split('get agent info for @')[1]?.trim();
     if (username) {
       setSearchMode('username');
       await fetchAgentData(username, 'username');
     }
   }
  
   else if (cmd.includes('get agent by contract')) {
     const contractAddress = cmd.split('get agent by contract')[1]?.trim();
     if (contractAddress) {
       setSearchMode('contract');
       await fetchAgentData(contractAddress, 'contract');
     }
   }
  
   else if (cmd.includes('compare with')) {
     const username = cmd.split('compare with @')[1]?.trim();
     if (username) {
       setCompareMode(true);
       speakResponse(`Comparing with ${username}`);
       await handleCompare(username);
     }
   }
  
   else if (cmd.includes('show trends')) {
     if (agentData) {
       speakResponse("Showing market trends");
       setShowTrends(true);
     } else {
       speakResponse("Please search for an agent first");
     }
   }
  
   else if (cmd.includes('set price alert')) {
     const priceMatch = cmd.match(/alert (?:for|at) (\d+(?:\.\d+)?)/);
     if (priceMatch && priceMatch[1]) {
       const price = parseFloat(priceMatch[1]);
       setPriceAlertHandler(price);
       speakResponse(`Setting price alert for $${price}`);
     }
   }
  
   else if (cmd.includes('export data')) {
     if (agentData) {
       exportData();
       speakResponse("Exporting agent data to CSV");
     } else {
       speakResponse("Please search for an agent first");
     }
   }
 };


 const fetchAgentData = async (query, mode = searchMode) => {
   setLoading(true);
   setError(null);
   try {
     let endpoint;
     if (mode === 'username') {
       const cleanUsername = query.replace('@', '');
       endpoint = `${API_URL}/agents/${cleanUsername}?interval=${interval}`;
     } else {
       // Ensure contract address is properly formatted
       const cleanContract = query.trim();
       endpoint = `${API_URL}/agents/contractAddress/${cleanContract}?interval=${interval}`;
     }
    
     const response = await axios.get(endpoint);
    
     if (response.data.ok) {
       setAgentData(response.data.ok);
       speakResponse(`Found data for ${response.data.ok.agentName}. Current mindshare is ${response.data.ok.mindshare.toFixed(2)}`);
     } else {
       setError('No data found');
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


 const handleContractSearch = (e) => {
   e.preventDefault();
   if (contractAddress) {
     fetchAgentData(contractAddress, 'contract');
   }
 };


 const handleCompare = async (username) => {
   try {
     const response = await axios.get(`${API_URL}/agents/${username}?interval=${interval}`);
     setCompareData(response.data.ok);
   } catch (err) {
     setError('Failed to fetch comparison data');
   }
 };


 const handleShare = () => {
   const shareText = `Check out ${agentData.agentName}'s stats on CookieAI:\n` +
     `Mindshare: ${agentData.mindshare.toFixed(2)}\n` +
     `Market Cap: $${agentData.marketCap.toLocaleString()}\n` +
     `24h Volume: $${agentData.volume24Hours.toLocaleString()}`;
    
   if (navigator.share) {
     navigator.share({
       title: 'CookieAI Agent Stats',
       text: shareText,
       url: window.location.href
     });
   }
 };


 const exportData = () => {
   const csvContent = `
     Agent Name,${agentData.agentName}
     Mindshare,${agentData.mindshare}
     Market Cap,${agentData.marketCap}
     Price,${agentData.price}
     24h Volume,${agentData.volume24Hours}
     Holders,${agentData.holdersCount}
   `.trim();


   const blob = new Blob([csvContent], { type: 'text/csv' });
   const url = window.URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = `${agentData.agentName}_stats.csv`;
   a.click();
 };


 const setPriceAlertHandler = (price) => {
   setPriceAlert(price);
   alert(`Alert will be sent when price reaches $${price}`);
 };


 // Add chart component
 const MetricsChart = ({ data, metric, color }) => (
   <ResponsiveContainer width="100%" height={300}>
     <LineChart data={data}>
       <CartesianGrid strokeDasharray="3 3" />
       <XAxis dataKey="date" />
       <YAxis />
       <Tooltip />
       <Line type="monotone" dataKey={metric} stroke={color} />
     </LineChart>
   </ResponsiveContainer>
 );


 const MultiMetricChart = ({ data }) => {
   const [selectedMetrics, setSelectedMetrics] = useState(['price', 'mindshare']);
  
   return (
     <Box>
       <FormGroup row>
         <FormControlLabel
           control={<Checkbox checked={selectedMetrics.includes('price')}
           onChange={(e) => {
             if (e.target.checked) {
               setSelectedMetrics([...selectedMetrics, 'price']);
             } else {
               setSelectedMetrics(selectedMetrics.filter(m => m !== 'price'));
             }
           }}
           />}
           label="Price"
         />
         {/* Add more metric checkboxes */}
       </FormGroup>
       <ResponsiveContainer width="100%" height={400}>
         <LineChart data={data}>
           <CartesianGrid strokeDasharray="3 3" />
           <XAxis dataKey="date" />
           <YAxis yAxisId="left" />
           <YAxis yAxisId="right" orientation="right" />
           <Tooltip />
           <Legend />
           {selectedMetrics.includes('price') && (
             <Line yAxisId="left" type="monotone" dataKey="price" stroke="#8884d8" />
           )}
           {/* Add more conditional lines */}
         </LineChart>
       </ResponsiveContainer>
     </Box>
   );
 };


 return (
   <Router>
     <Container maxWidth="xl" sx={{ py: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
       <Routes>
         <Route path="/" element={
           <Stack spacing={3}>
             <Typography variant="h4" component="h1" align="center" gutterBottom>
               CookieAI Assistant
             </Typography>


             {/* Search Mode Selection */}
             <Paper sx={{ p: 2 }}>
               <RadioGroup
                 row
                 value={searchMode}
                 onChange={(e) => setSearchMode(e.target.value)}
               >
                 <FormControlLabel
                   value="username"
                   control={<Radio />}
                   label="Search by Username"
                 />
                 <FormControlLabel
                   value="contract"
                   control={<Radio id="contract-search-radio" />}
                   label="Search by Contract"
                 />
               </RadioGroup>
             </Paper>


             {/* Username Search Form */}
             {searchMode === 'username' && (
               <Paper component="form" onSubmit={handleSearch} sx={{ p: 2 }}>
                 <Stack spacing={2}>
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
                           <IconButton type="submit">
                             <SearchIcon />
                           </IconButton>
                         </InputAdornment>
                       )
                     }}
                   />
                 </Stack>
               </Paper>
             )}


             {/* Contract Address Search Form */}
             {searchMode === 'contract' && (
               <Paper component="form" onSubmit={handleContractSearch} sx={{ p: 2 }}>
                 <Stack spacing={2}>
                   <TextField
                     id="contract-search-input"
                     fullWidth
                     variant="outlined"
                     placeholder="Enter contract address (e.g. 0xc0041ef357...)"
                     value={contractAddress}
                     onChange={(e) => setContractAddress(e.target.value)}
                     InputProps={{
                       endAdornment: (
                         <InputAdornment position="end">
                           <IconButton type="submit">
                             <SearchIcon />
                           </IconButton>
                         </InputAdornment>
                       )
                     }}
                   />
                   <Typography variant="caption" color="text.secondary">
                     Supports EVM chains and Solana blockchain contracts
                   </Typography>
                 </Stack>
               </Paper>
             )}


             {/* Time Interval Selection */}
             <Paper sx={{ p: 2 }}>
               <FormControl fullWidth>
                 <InputLabel>Time Interval</InputLabel>
                 <Select
                   value={interval}
                   onChange={(e) => setInterval(e.target.value)}
                   label="Time Interval"
                 >
                   <MenuItem value="_3Days">3 Days</MenuItem>
                   <MenuItem value="_7Days">7 Days</MenuItem>
                 </Select>
               </FormControl>
             </Paper>


             <Button
               variant="outlined"
               onClick={() => setCompareMode(!compareMode)}
               sx={{ mb: 2 }}
             >
               {compareMode ? 'Exit Compare' : 'Compare Agents'}
             </Button>


             {compareMode && (
               <TextField
                 fullWidth
                 placeholder="Enter username to compare"
                 onKeyPress={(e) => {
                   if (e.key === 'Enter') {
                     handleCompare(e.target.value);
                   }
                 }}
               />
             )}


             <Button
               id="share-button"
               variant="contained"
               startIcon={<ShareIcon />}
               onClick={handleShare}
               sx={{ mt: 2 }}
             >
               Share Stats
             </Button>


             <Button
               id="export-button"
               variant="outlined"
               startIcon={<DownloadIcon />}
               onClick={exportData}
               sx={{ mt: 2 }}
             >
               Export Data
             </Button>


             <Box id="trends-section">
               {showTrends && (
                 <MultiMetricChart data={agentData.historicalData} />
               )}
             </Box>


             <Box>
               <TextField
                 id="price-alert-input"
                 type="number"
                 label="Set Price Alert"
                 variant="outlined"
                 size="small"
                 onKeyPress={(e) => {
                   if (e.key === 'Enter') {
                     setPriceAlertHandler(e.target.value);
                   }
                 }}
               />
             </Box>


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


             {compareMode && compareData && (
               <Grid container spacing={3}>
                 <Grid item xs={12} md={6}>
                   <AgentDetails agent={agentData} />
                 </Grid>
                 <Grid item xs={12} md={6}>
                   <AgentDetails agent={compareData} />
                 </Grid>
               </Grid>
             )}


             {!compareMode && agentData && (
               <AgentDetails agent={agentData} />
             )}
           </Stack>
         } />
         <Route path="/agent/:username" element={<AgentDetails />} />
       </Routes>
       <VoiceRecognition />
     </Container>
   </Router>
 );
}


export default App;

