import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Fade, CircularProgress, Button } from '@mui/material';
import { AutoGraph as AutoGraphIcon, TrendingUp, TrendingDown } from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { getAIAnalysis } from '../utils/geminiAI';

const AIAnalysis = ({ data, type, visible = true }) => {
  const [expanded, setExpanded] = useState(true); // Auto-expanded
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  let prompt = '';

  useEffect(() => {
    if (data) {
      fetchAnalysis();
      prepareChartData();
    }
  }, [data]);

  const prepareChartData = () => {
    // Transform data for charts
    if (data.priceHistory) {
      const formattedData = data.priceHistory.map(point => ({
        timestamp: new Date(point.timestamp).toLocaleDateString(),
        price: point.price,
        marketCap: point.marketCap,
        volume: point.volume
      }));
      setChartData(formattedData);
    }
  };

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      let prompt = '';
      
      switch (type) {
        case 'agent':
          prompt = `Analyze this trading agent data and provide insights about performance, market position, and potential risks/opportunities: ${JSON.stringify(data)}`;
          break;
        case 'topAgents':
          prompt = `Analyze these top trading agents and provide insights about market trends, leading performers, and sector analysis: ${JSON.stringify(data)}`;
          break;
        case 'comparison':
          prompt = `Compare these two trading agents and highlight key differences, strengths, and weaknesses: ${JSON.stringify(data)}`;
          break;
        default:
          prompt = `Analyze this trading data and provide key insights: ${JSON.stringify(data)}`;
      }
      
      const result = await getAIAnalysis(prompt);
      setAnalysis(result);
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      setAnalysis('Error generating analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper 
        elevation={4}
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(145deg, #1a237e, #0d47a1)',
          color: '#fff',
          borderRadius: 2,
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ 
            color: '#fff',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <AutoGraphIcon sx={{ color: '#4facfe' }} />
            AI Market Analysis
          </Typography>
          
          <Button
            variant="contained"
            onClick={() => setExpanded(!expanded)}
            sx={{
              background: 'linear-gradient(90deg, #00f2fe, #4facfe)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(90deg, #4facfe, #00f2fe)',
              }
            }}
          >
            {expanded ? 'Hide Analysis' : 'View Analysis'}
          </Button>
        </Box>

        {expanded && (
          <Box sx={{ mt: 3 }}>
            {loading ? (
              <Box display="flex" flexDirection="column" alignItems="center" gap={2} my={4}>
                <CircularProgress color="info" size={40} />
                <Typography variant="h6" sx={{ color: '#4facfe' }}>
                  Analyzing Market Data...
                </Typography>
              </Box>
            ) : (
              <>
                {/* Charts Section */}
                <Box sx={{ mb: 4, height: 300 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#4facfe' }}>
                    Market Performance
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4facfe" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4facfe" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="timestamp" stroke="#fff" />
                      <YAxis stroke="#fff" />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#1a237e',
                          border: '1px solid #4facfe',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#4facfe" 
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>

                {/* Analysis Text */}
                <Typography 
                  component="div"
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    lineHeight: 2,
                    '& .highlight': {
                      color: '#4facfe',
                      fontWeight: 600
                    },
                    '& .section-title': {
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      color: '#fff',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: analysis
                      .replace(/📊|📈|💡|🎯/g, '<span style="font-size: 1.5rem; margin-right: 0.5rem;">$&</span>')
                      .replace(/•/g, '<span style="color: #4facfe; margin-right: 0.5rem;">•</span>')
                      .replace(/\[POSITIVE\]/g, '<span style="color: #22C55E; font-weight: 600;">POSITIVE</span>')
                      .replace(/\[NEGATIVE\]/g, '<span style="color: #EF4444; font-weight: 600;">NEGATIVE</span>')
                      .replace(/\[NEUTRAL\]/g, '<span style="color: #FCD34D; font-weight: 600;">NEUTRAL</span>')
                  }}
                />
              </>
            )}
          </Box>
        )}
      </Paper>
    </motion.div>
  );
};

export default AIAnalysis;