import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Card,
  CardContent,
  Divider,
  Link
} from '@mui/material';
import { Search as SearchIcon, Twitter } from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:5002';

const TweetSearch = () => {
  const [query, setQuery] = useState('');
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set default dates (last 1 year)
  const today = new Date();
  const lastYear = new Date();
  lastYear.setFullYear(today.getFullYear() - 1);

  const [fromDate, setFromDate] = useState(lastYear.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/api/search/${encodeURIComponent(query)}`, {
        params: {
          from: fromDate,
          to: toDate
        }
      });

      if (response.data.ok) {
        setTweets(response.data.ok);
      } else {
        setError('No tweets found matching your search.');
      }
    } catch (err) {
      setError('Failed to fetch tweets. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Search Tweets
      </Typography>

      <Paper component="form" onSubmit={handleSearch} sx={{ p: 3, mb: 4 }}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Search Query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter search terms..."
            required
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              type="date"
              label="From Date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              type="date"
              label="To Date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
          >
            {loading ? 'Searching...' : 'Search Tweets'}
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {tweets.length > 0 && (
        <Stack spacing={2}>
          {tweets.map((tweet, index) => (
            <Card key={index} sx={{ '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Link
                    href={`https://twitter.com/${tweet.authorUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    color="primary"
                  >
                    @{tweet.authorUsername}
                  </Link>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(tweet.createdAt).toLocaleDateString()}
                  </Typography>
                  <IconButton
                    size="small"
                    href={`https://twitter.com/${tweet.authorUsername}/status/${tweet.id}`}
                    target="_blank"
                    sx={{ ml: 'auto' }}
                  >
                    <Twitter />
                  </IconButton>
                </Stack>
                
                <Typography variant="body1" paragraph>
                  {tweet.text}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <Stack direction="row" spacing={2} color="text.secondary">
                  <Typography variant="body2">❤️ {tweet.likesCount}</Typography>
                  <Typography variant="body2">🔄 {tweet.retweetsCount}</Typography>
                  <Typography variant="body2">💬 {tweet.repliesCount}</Typography>
                  <Typography variant="body2">👥 {tweet.impressionsCount}</Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default TweetSearch;