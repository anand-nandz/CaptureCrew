import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Rating, 
  Chip, 
  LinearProgress,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { styled } from '@mui/system';

interface ReviewStatsCardProps {
  totalReviews: number;
  averageRating: number;
  ratingsBreakdown: { [key: number]: number }; 
}

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 5,
  [`&.MuiLinearProgress-colorPrimary`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 700],
  },
  [`& .MuiLinearProgress-bar`]: {
    borderRadius: 5,
  },
}));

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default function ReviewStatsCard({ totalReviews, averageRating, ratingsBreakdown }: ReviewStatsCardProps) {
  const totalRatings = Object.values(ratingsBreakdown).reduce((a, b) => a + b, 0);

  return (
    <ThemeProvider theme={theme}>
      <StyledCard>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom align="center" fontWeight="bold">
            Reviews Overview
          </Typography>
          
          <Box display="flex" justifyContent="space-around" mb={3}>
            <Box textAlign="center">
              <Typography variant="subtitle1" fontWeight="medium">
                Total Reviews
              </Typography>
              <Typography variant="h4" color="primary">
                {totalReviews}
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="subtitle1" fontWeight="medium">
                Average Rating
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Rating value={averageRating} precision={0.1} readOnly size="large" />
                <Typography variant="h6" ml={1}>
                  {averageRating.toFixed(1)}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom align="center">
            Rating Breakdown
          </Typography>
          {[5, 4, 3, 2, 1].map((star) => (
            <Box key={star} mb={1.5}>
              <Box display="flex" alignItems="center" mb={0.5}>
                <Typography variant="body2" minWidth={50}>
                  {star} Star
                </Typography>
                <Box flexGrow={1} mx={2}>
                  <StyledLinearProgress 
                    variant="determinate" 
                    value={(ratingsBreakdown[star] || 0) / totalRatings * 100} 
                    color="primary"
                  />
                </Box>
                <Chip 
                  label={`${ratingsBreakdown[star] || 0}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
            </Box>
          ))}
        </CardContent>
      </StyledCard>
    </ThemeProvider>
  );
}

