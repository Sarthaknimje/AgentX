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
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShowChart,
  Link as LinkIcon,
  Twitter,
  People,
  Assessment,
  ContentCopy
} from '@mui/icons-material';

const StatCard = ({ title, value, delta, prefix = '' }) => (
  <Paper 
    elevation={2}
    sx={{ 
      p: 2,
      height: '100%',
      minHeight: 100,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 3
      }
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {title}
    </Typography>
    <Box>
      <Typography variant="h5" sx={{ mt: 1, fontWeight: 500 }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
      </Typography>
      {delta !== undefined && (
        <Chip
          size="small"
          icon={delta > 0 ? <TrendingUp sx={{ fontSize: 16 }}/> : <TrendingDown sx={{ fontSize: 16 }}/>}
          label={`${delta > 0 ? '+' : ''}${delta.toFixed(2)}%`}
          color={delta > 0 ? 'success' : 'error'}
          sx={{ mt: 1, height: 24 }}
        />
      )}
    </Box>
  </Paper>
);

const AgentDetails = ({ agent }) => (
  <Box sx={{ width: '100%' }}>
    {/* Agent Name Header */}
    <Paper 
      sx={{ 
        p: 2, 
        mb: 3, 
        bgcolor: 'primary.main', 
        color: 'white',
        borderRadius: 1
      }}
    >
      <Typography variant="h5">{agent.agentName}</Typography>
    </Paper>

    {/* Basic Stats */}
    <Typography variant="h6" gutterBottom sx={{ ml: 1 }}>Basic Stats</Typography>
    <Grid container spacing={2} sx={{ mb: 3 }}>
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

    {/* Trading Stats */}
    <Typography variant="h6" gutterBottom sx={{ ml: 1 }}>Trading Stats</Typography>
    <Grid container spacing={2} sx={{ mb: 3 }}>
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

    {/* Social Stats */}
    <Typography variant="h6" gutterBottom sx={{ ml: 1 }}>Social Stats</Typography>
    <Grid container spacing={2} sx={{ mb: 3 }}>
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

    {/* Contracts */}
    <Typography variant="h6" gutterBottom sx={{ ml: 1 }}>Contracts</Typography>
    <Paper sx={{ p: 2, mb: 3 }}>
      <Stack spacing={2}>
        {agent.contracts.map((contract, index) => (
          <Box 
            key={index} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              bgcolor: 'grey.50',
              p: 2,
              borderRadius: 1
            }}
          >
            <Typography variant="body2" sx={{ mr: 2, minWidth: 100 }}>
              {contract.chain === -2 ? 'Solana' : `Chain ${contract.chain}`}:
            </Typography>
            <Typography 
              sx={{ 
                fontFamily: 'monospace',
                flex: 1,
                fontSize: '0.875rem'
              }}
            >
              {contract.contractAddress}
            </Typography>
            <IconButton 
              size="small"
              onClick={() => navigator.clipboard.writeText(contract.contractAddress)}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Stack>
    </Paper>

    {/* Top Tweets */}
    <Typography variant="h6" gutterBottom sx={{ ml: 1 }}>Top Tweets</Typography>
    <Grid container spacing={2}>
      {agent.topTweets.map((tweet, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                src={tweet.tweetAuthorProfileImageUrl} 
                sx={{ width: 32, height: 32, mr: 1 }}
              />
              <Typography variant="subtitle2">
                {tweet.tweetAuthorDisplayName}
              </Typography>
              <IconButton 
                size="small" 
                sx={{ ml: 'auto' }}
                href={tweet.tweetUrl}
                target="_blank"
              >
                <Twitter fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Assessment sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  Impressions: {tweet.impressionsCount.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  Smart Engagement: {tweet.smartEngagementPoints}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default AgentDetails;