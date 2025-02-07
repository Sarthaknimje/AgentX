import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShowChart,
  Link as LinkIcon,
  Twitter,
  People,
  Assessment,
  ContentCopy,
  Mic,
  MicOff,
  AutoGraph
} from '@mui/icons-material';

const globalStyles = {
  '@keyframes fadeIn': {
    '0%': { opacity: 0, transform: 'translateY(20px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' }
  },
  '@keyframes pulseGlow': {
    '0%': { boxShadow: '0 0 5px rgba(137,207,240,0.3)' },
    '50%': { boxShadow: '0 0 20px rgba(137,207,240,0.5)' },
    '100%': { boxShadow: '0 0 5px rgba(137,207,240,0.3)' }
  }
};

const StatCard = ({ title, value, delta, prefix = '' }) => (
  <Paper 
    elevation={3}
    sx={{ 
      p: 2.5,
      height: '100%',
      minHeight: 120,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: 'linear-gradient(135deg, #001B3D 0%, #0A4D94 100%)',
      color: '#fff',
      borderRadius: 2,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        background: 'linear-gradient(135deg, #002152 0%, #0A5BAE 100%)',
        boxShadow: '0 8px 25px rgba(10,77,148,0.3)',
      }
    }}
  >
    <Typography variant="body1" sx={{ 
      color: 'rgba(255,255,255,0.85)',
      fontWeight: 500,
      fontSize: '0.95rem'
    }}>
      {title}
    </Typography>
    <Box>
      <Typography variant="h5" sx={{ 
        fontWeight: 600,
        color: '#fff',
        fontSize: '1.5rem'
      }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
      </Typography>
      {delta !== undefined && (
        <Chip
          size="small"
          icon={delta > 0 ? <TrendingUp sx={{ fontSize: 16 }}/> : <TrendingDown sx={{ fontSize: 16 }}/>}
          label={`${delta > 0 ? '+' : ''}${delta.toFixed(2)}%`}
          color={delta > 0 ? 'success' : 'error'}
          sx={{ 
            mt: 1,
            height: 22,
            '& .MuiChip-label': {
              fontSize: '0.75rem',
              fontWeight: 600
            }
          }}
        />
      )}
    </Box>
  </Paper>
);

const AgentDetails = ({ agent }) => {
  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000C24 0%, #001433 100%)',
      p: 3,
    }}>
      {/* Agent Name Header */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4, 
          background: 'linear-gradient(135deg, #001B3D 0%, #0A4D94 100%)',
          color: '#fff',
          borderRadius: 2,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Typography variant="h4" sx={{ 
          fontWeight: 600,
          fontSize: '2rem',
          color: '#fff',
        }}>
          {agent.agentName}
        </Typography>
      </Paper>

      {/* Section Headers */}
      <Typography variant="h6" sx={{
        color: '#fff',
        fontSize: '1.1rem',
        fontWeight: 500,
        mb: 2,
        ml: 1
      }}>
        Basic Stats
      </Typography>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Mindshare"
            value={agent.mindshare.toFixed(2)}
            delta={agent.mindshareDeltaPercent}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Market Cap"
            value={agent.marketCap}
            delta={agent.marketCapDeltaPercent}
            prefix="$"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Price"
            value={agent.price.toFixed(4)}
            delta={agent.priceDeltaPercent}
            prefix="$"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Liquidity"
            value={agent.liquidity}
            prefix="$"
          />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{
        color: '#fff',
        fontSize: '1.1rem',
        fontWeight: 500,
        mb: 2,
        ml: 1
      }}>
        Trading Stats
      </Typography>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="24h Volume"
            value={agent.volume24Hours}
            delta={agent.volume24HoursDeltaPercent}
            prefix="$"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Holders"
            value={agent.holdersCount}
            delta={agent.holdersCountDeltaPercent}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{
        color: '#fff',
        fontSize: '1.1rem',
        fontWeight: 500,
        mb: 2,
        ml: 1
      }}>
        Social Stats
      </Typography>

      <Grid container spacing={2.5}>
        {[
          { title: 'Followers', value: agent.followersCount },
          { title: 'Smart Followers', value: agent.smartFollowersCount },
          { 
            title: 'Avg. Impressions', 
            value: agent.averageImpressionsCount.toFixed(2),
            delta: agent.averageImpressionsCountDeltaPercent 
          },
          { 
            title: 'Avg. Engagements', 
            value: agent.averageEngagementsCount.toFixed(2),
            delta: agent.averageEngagementsCountDeltaPercent 
          }
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{
        color: '#fff',
        fontSize: '1.1rem',
        fontWeight: 500,
        mb: 2,
        ml: 1
      }}>
        Contracts
      </Typography>

      <Paper sx={{ 
        p: 3, 
        my: 3,
        background: 'linear-gradient(135deg, #001B3D 0%, #0A4D94 100%)',
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <Stack spacing={2}>
          {agent.contracts.map((contract, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                background: 'rgba(0,27,61,0.5)',
                p: 2,
                borderRadius: 1,
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateX(8px)',
                  background: 'rgba(10,77,148,0.3)',
                }
              }}
            >
              <Typography sx={{ 
                color: '#fff',
                fontSize: '0.9rem'
              }}>
                {contract.chain === -2 ? 'Solana' : `Chain ${contract.chain}`}:
              </Typography>
              <Typography sx={{ 
                color: '#89CFF0',
                flex: 1,
                ml: 2,
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}>
                {contract.address}
              </Typography>
              <IconButton 
                size="small"
                onClick={() => navigator.clipboard.writeText(contract.address)}
                sx={{ 
                  color: '#89CFF0',
                  '&:hover': {
                    color: '#4facfe'
                  }
                }}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AgentDetails;