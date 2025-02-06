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
  Tooltip
} from '@mui/material';
import { TrendingUp, TrendingDown, Link as LinkIcon } from '@mui/icons-material';
import axios from 'axios';

const AgentsList = ({ interval }) => {
  const [agents, setAgents] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
      const response = await axios.get(
        `${API_URL}/agents/agentsPaged`,
        {
          params: {
            interval,
            page,
            pageSize
          }
        }
      );
      
      if (response.data.ok) {
        setAgents(response.data.ok.data);
        setTotalPages(response.data.ok.totalPages);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      // Add user-friendly error handling here
      if (error.code === 'ERR_NETWORK') {
        console.error('Backend server is not running or not accessible');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [interval, page, pageSize]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1); // Reset to first page when changing page size
  };

  const formatDelta = (value) => {
    if (!value) return '0%';
    return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Top Agents by Mindshare
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small">
          <InputLabel>Rows per page</InputLabel>
          <Select
            value={pageSize}
            label="Rows per page"
            onChange={handlePageSizeChange}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Agent Name</TableCell>
              <TableCell align="right">Mindshare</TableCell>
              <TableCell align="right">Market Cap</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">24h Volume</TableCell>
              <TableCell align="right">Holders</TableCell>
              <TableCell>Contracts</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.agentName} hover>
                <TableCell>{agent.agentName}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                    {agent.mindshare.toFixed(2)}
                    <Chip
                      size="small"
                      label={formatDelta(agent.mindshareDeltaPercent)}
                      color={agent.mindshareDeltaPercent > 0 ? 'success' : 'error'}
                      icon={agent.mindshareDeltaPercent > 0 ? <TrendingUp /> : <TrendingDown />}
                    />
                  </Stack>
                </TableCell>
                <TableCell align="right">${agent.marketCap.toLocaleString()}</TableCell>
                <TableCell align="right">${agent.price.toFixed(4)}</TableCell>
                <TableCell align="right">${agent.volume24Hours.toLocaleString()}</TableCell>
                <TableCell align="right">{agent.holdersCount.toLocaleString()}</TableCell>
                <TableCell>
                  {agent.contracts.map((contract, idx) => (
                    <Tooltip 
                      key={idx}
                      title={`${contract.chain === -2 ? 'Solana' : `Chain ${contract.chain}`}: ${contract.contractAddress}`}
                    >
                      <IconButton size="small">
                        <LinkIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default AgentsList;