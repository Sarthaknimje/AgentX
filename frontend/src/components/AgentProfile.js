import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Avatar,
  Chip,
  Link,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

const StatCard = ({ title, value, change }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography color="text.secondary" variant="body2">
        {title}
      </Typography>
      <Typography variant="h6" sx={{ mt: 1 }}>
        {value}
      </Typography>
      {change !== undefined && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: change >= 0 ? 'success.main' : 'error.main',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          {change >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
          {change > 0 ? '+' : ''}{change}%
        </Typography>
      )}
    </CardContent>
  </Card>
);

const ContractAddress = ({ chain, address }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="body2" color="text.secondary">
      Chain {chain}:
    </Typography>
    <Paper sx={{ p: 1, mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" sx={{ fontFamily: 'monospace', flex: 1 }}>
        {address}
      </Typography>
      <IconButton size="small" onClick={() => navigator.clipboard.writeText(address)}>
        <CopyIcon fontSize="small" />
      </IconButton>
    </Paper>
  </Box>
);

const TweetCard = ({ author, impressions, engagement }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Avatar src={author.avatar} sx={{ width: 24, height: 24 }} />
        <Typography variant="body2">{author.name}</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Impressions: {impressions.toLocaleString()}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Smart Engagement: {engagement}
      </Typography>
    </CardContent>
  </Card>
);

const AgentProfile = ({ data }) => {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {data.agentName}
        </Typography>
        
        <TextField
          label="Alert Price"
          type="number"
          size="small"
          sx={{ mt: 2 }}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Paper>

      <Typography variant="h6" gutterBottom>Basic Stats</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Mindshare" 
            value={data.mindshare.toFixed(2)}
            change={data.mindshareDeltaPercent}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Market Cap" 
            value={`$${data.marketCap.toLocaleString()}`}
            change={data.marketCapDeltaPercent}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Price" 
            value={`$${data.price.toFixed(4)}`}
            change={data.priceDeltaPercent}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Liquidity" 
            value={`$${data.liquidity.toLocaleString()}`}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>Trading Stats</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <StatCard 
            title="24h Volume" 
            value={`$${data.volume24Hours.toLocaleString()}`}
            change={data.volume24HoursDeltaPercent}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard 
            title="Holders" 
            value={data.holdersCount.toLocaleString()}
            change={data.holdersCountDeltaPercent}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>Social Stats</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Followers" 
            value={data.followersCount.toLocaleString()}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Smart Followers" 
            value={data.smartFollowersCount.toLocaleString()}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Avg. Impressions" 
            value={data.averageImpressionsCount.toFixed(2)}
            change={data.averageImpressionsCountDeltaPercent}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Avg. Engagements" 
            value={data.averageEngagementsCount.toFixed(2)}
            change={data.averageEngagementsCountDeltaPercent}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>Contracts</Typography>
      <Paper sx={{ p: 2, mb: 4 }}>
        {data.contracts.map((contract, index) => (
          <ContractAddress 
            key={index}
            chain={contract.chain}
            address={contract.contractAddress}
          />
        ))}
      </Paper>

      <Typography variant="h6" gutterBottom>Top Tweets</Typography>
      <Grid container spacing={2}>
        {data.topTweets.map((tweet, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <TweetCard
              author={{
                name: tweet.tweetAuthorDisplayName,
                avatar: tweet.tweetAuthorProfileImageUrl
              }}
              impressions={tweet.impressionsCount}
              engagement={tweet.smartEngagementPoints}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AgentProfile;