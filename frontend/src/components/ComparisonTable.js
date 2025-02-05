import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Fade,
  Chip,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown,
  ShowChart,
  PieChart,
  Timeline,
  Compare
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const ComparisonTable = ({ agent1, agent2 }) => {
  const [view, setView] = useState('table');
  const [selectedMetric, setSelectedMetric] = useState('mindshare');

  const formatDelta = (value) => {
    if (!value) return '';
    return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  };

  const metrics = [
    { 
      label: 'Mindshare', 
      key: 'mindshare', 
      format: (v) => v.toFixed(2),
      color: '#2196f3'
    },
    { 
      label: 'Market Cap', 
      key: 'marketCap', 
      format: (v) => `$${v.toLocaleString()}`,
      color: '#4caf50'
    },
    { 
      label: 'Price', 
      key: 'price', 
      format: (v) => `$${v.toFixed(4)}`,
      color: '#ff9800'
    },
    { 
      label: 'Volume 24h', 
      key: 'volume24Hours', 
      format: (v) => `$${v.toLocaleString()}`,
      color: '#9c27b0'
    },
    { 
      label: 'Holders', 
      key: 'holdersCount', 
      format: (v) => v.toLocaleString(),
      color: '#f44336'
    },
    { 
      label: 'Liquidity', 
      key: 'liquidity', 
      format: (v) => `$${v.toLocaleString()}`,
      color: '#795548'
    }
  ];

  const renderDeltaChip = (value) => (
    <Chip
      icon={value > 0 ? <TrendingUp /> : <TrendingDown />}
      label={formatDelta(value)}
      color={value > 0 ? 'success' : 'error'}
      size="small"
      sx={{ animation: 'pulse 2s infinite' }}
    />
  );

  const renderTableView = () => (
    <Fade in={view === 'table'}>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white' }}>Metric</TableCell>
              <TableCell align="right" sx={{ color: 'white' }}>{agent1.agentName}</TableCell>
              <TableCell align="right" sx={{ color: 'white' }}>Δ%</TableCell>
              <TableCell align="right" sx={{ color: 'white' }}>{agent2.agentName}</TableCell>
              <TableCell align="right" sx={{ color: 'white' }}>Δ%</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow 
                key={metric.key}
                hover
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background-color 0.3s'
                }}
                onClick={() => setSelectedMetric(metric.key)}
              >
                <TableCell>{metric.label}</TableCell>
                <TableCell align="right">
                  {metric.format(agent1[metric.key])}
                </TableCell>
                <TableCell align="right">
                  {renderDeltaChip(agent1[`${metric.key}DeltaPercent`])}
                </TableCell>
                <TableCell align="right">
                  {metric.format(agent2[metric.key])}
                </TableCell>
                <TableCell align="right">
                  {renderDeltaChip(agent2[`${metric.key}DeltaPercent`])}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Fade>
  );

  const renderChartView = () => {
    const selectedMetricObj = metrics.find(m => m.key === selectedMetric);
    const data = [
      { name: agent1.agentName, value: agent1[selectedMetric] },
      { name: agent2.agentName, value: agent2[selectedMetric] }
    ];

    return (
      <Fade in={view === 'chart'}>
        <Box sx={{ height: 400, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            {selectedMetricObj.label} Comparison
          </Typography>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={selectedMetricObj.color}
                strokeWidth={2}
                dot={{ r: 6 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Fade>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={view} 
          onChange={(e, newValue) => setView(newValue)}
          centered
        >
          <Tab 
            icon={<Compare />} 
            label="Table View" 
            value="table" 
          />
          <Tab 
            icon={<ShowChart />} 
            label="Chart View" 
            value="chart" 
          />
        </Tabs>
      </Box>

      {view === 'table' ? renderTableView() : renderChartView()}

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Social Stats Comparison
            </Typography>
            {/* Add social stats comparison */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Technical Indicators
            </Typography>
            {/* Add technical indicators comparison */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComparisonTable;