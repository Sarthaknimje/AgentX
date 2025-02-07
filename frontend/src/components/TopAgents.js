import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  alpha,
  Button
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  Link as LinkIcon, 
  ArrowDropUp, 
  ArrowDropDown,
  AutoGraph as AutoGraphIcon 
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import axios from 'axios';

// Animation keyframes
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const TopAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interval, setInterval] = useState('_7Days');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: 'mindshare',
    direction: 'desc'
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/v2/agents/agentsPaged`, {
        params: {
          interval,
          page,
          pageSize
        }
      });
      
      if (response.data.ok) {
        setAgents(response.data.ok.data);
        setTotalPages(response.data.ok.totalPages);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch agents data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [page, pageSize, interval]);

  const handleIntervalChange = (event) => {
    setInterval(event.target.value);
    setPage(1);
  };

  const formatDelta = (value) => {
    if (!value) return '0%';
    return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const sortedAgents = [...agents].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] - b[sortConfig.key];
    }
    return b[sortConfig.key] - a[sortConfig.key];
  });

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box p={3}>
      <Typography color="error">{error}</Typography>
    </Box>
  );

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      p: { xs: 2, md: 4 },
    }}>
      <Paper elevation={0} sx={{
        background: 'rgba(30, 41, 59, 0.98)',
        backdropFilter: 'blur(8px)',
        borderRadius: 2,
        border: '1px solid rgba(148, 163, 184, 0.1)',
        p: { xs: 2, md: 4 },
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      }}>
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{
            color: '#F8FAFC',
            textAlign: 'center',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            mb: 4,
            fontSize: { xs: '1.75rem', md: '2.25rem' }
          }}
        >
          Top Agents by Mindshare
        </Typography>

        <Box mb={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel sx={{ color: '#94A3B8' }}>Time Interval</InputLabel>
            <Select
              value={interval}
              label="Time Interval"
              onChange={handleIntervalChange}
              sx={{
                color: '#F8FAFC',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(148, 163, 184, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#38BDF8',
                },
              }}
            >
              <MenuItem value="_3Days">3 Days</MenuItem>
              <MenuItem value="_7Days">7 Days</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper} className="agents-list" sx={{ 
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: 2,
          border: '1px solid rgba(148, 163, 184, 0.1)',
          overflow: 'hidden',
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: 'rgba(51, 65, 85, 0.5)',
                '& th': { 
                  py: 2,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }
              }}>
                <TableCell width="8%" sx={{ color: '#94A3B8' }}>Rank</TableCell>
                <TableCell width="15%" sx={{ color: '#94A3B8' }}>Agent</TableCell>
                {[
                  { key: 'mindshare', label: 'Mindshare', width: '18%' },
                  { key: 'marketCap', label: 'Market Cap', width: '18%' },
                  { key: 'price', label: 'Price', width: '13%' },
                  { key: 'volume24Hours', label: '24h Volume', width: '15%' },
                  { key: 'holdersCount', label: 'Holders', width: '13%' }
                ].map(({ key, label, width }) => (
                  <TableCell 
                    key={key}
                    align="right" 
                    width={width}
                    onClick={() => handleSort(key)}
                    sx={{ 
                      color: '#94A3B8',
                      cursor: 'pointer',
                      userSelect: 'none',
                      '&:hover': {
                        color: '#38BDF8',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                      {label}
                      {sortConfig.key === key && (
                        sortConfig.direction === 'desc' ? 
                          <ArrowDropDown sx={{ color: '#38BDF8' }} /> : 
                          <ArrowDropUp sx={{ color: '#38BDF8' }} />
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAgents.map((agent, index) => (
                <TableRow 
                  key={agent.agentName}
                  sx={{
                    '&:hover': {
                      background: 'rgba(51, 65, 85, 0.3)',
                    },
                    '& td': {
                      py: 2.5,
                      fontSize: '0.95rem',
                      borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                    }
                  }}
                >
                  <TableCell sx={{ color: '#94A3B8', fontWeight: 500 }}>
                    {index + 1}
                  </TableCell>
                  <TableCell sx={{ color: '#F8FAFC', fontWeight: 500 }}>
                    {agent.agentName}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#F8FAFC' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      {agent.mindshare.toFixed(2)}
                      <Chip
                        size="small"
                        label={formatDelta(agent.mindshareDeltaPercent)}
                        sx={{
                          background: agent.mindshareDeltaPercent > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: agent.mindshareDeltaPercent > 0 ? '#22C55E' : '#EF4444',
                          border: `1px solid ${agent.mindshareDeltaPercent > 0 ? '#22C55E' : '#EF4444'}`,
                          height: '24px',
                          '& .MuiChip-label': { px: 1 }
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#F8FAFC' }}>${agent.marketCap.toLocaleString()}</TableCell>
                  <TableCell align="right" sx={{ color: '#F8FAFC' }}>${agent.price.toFixed(6)}</TableCell>
                  <TableCell align="right" sx={{ color: '#F8FAFC' }}>${agent.volume24Hours.toLocaleString()}</TableCell>
                  <TableCell align="right" sx={{ color: '#F8FAFC' }}>{agent.holdersCount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#94A3B8',
              },
              '& .Mui-selected': {
                backgroundColor: 'rgba(56, 189, 248, 0.2) !important',
              }
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default TopAgents;