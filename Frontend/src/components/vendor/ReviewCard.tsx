import { StyledCard, StyledLinearProgress, theme } from '@/utils/utils';
import { ReviewStatsCardProps } from '@/utils/interfaces';
import { 
  CardContent, 
  Typography, 
  Box, 
  Rating, 
  Chip, 
  ThemeProvider,
} from '@mui/material';

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

