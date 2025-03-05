import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  useTheme,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { axiosInstance } from '@/config/api/axiosInstance';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { VendorReview } from '@/types/extraTypes';
import { VendorReviewsProps } from '@/utils/interfaces';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  position: 'relative',
  transition: 'all 0.3s ease-in-out',
  animation: `${fadeIn} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
  borderRadius: 16,
  maxWidth: '300px',  // Set maximum width
  width: '100%',      // Full width within container
  minHeight: '200px', // Reduced min height for horizontal layout
  margin: '0 auto',   // Center cards
  overflow: 'hidden',
}));

const QuoteIcon = styled(FormatQuoteIcon)(({ theme }) => ({
  position: 'absolute',
  top: -20,
  left: 20,
  fontSize: 60,
  color: theme.palette.grey[200],
  transform: 'rotate(180deg)',
  zIndex: 0,
}));

export const VendorReviews: React.FC<VendorReviewsProps> = ({ vendorId, reviews: initialReviews }) => {
  const [reviews, setReviews] = useState<VendorReview[]>(initialReviews || []);
  const [loading, setLoading] = useState(!initialReviews || initialReviews.length === 0);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {

    const fetchVendorReviews = async () => {
      try {
        const response = await axiosInstance.get(`/getReviews/${vendorId}`, {
          withCredentials: true
        });
        console.log(response.data.reviews);

        setReviews(response.data.reviews);
      } catch (err) {
        console.error('Error fetching vendor reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

      fetchVendorReviews();
    
  }, [vendorId]);


  const settings = {
    dots: true,
    infinite: true,
    speed: 1500,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">Loading reviews...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, color: 'error.main' }}>
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  if (reviews.length === 0) {
    return (
      <Box sx={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom className='py-4'>
            What our Clients say!
          </Typography>
          <Typography variant="h5" gutterBottom>No reviews yet</Typography>
          <Typography variant="body1" color="text.secondary">
            This vendor has no reviews at the moment.
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '50vh',
        backgroundColor: '#f5f5f5',
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <Container>
        <Box
          sx={{
            textAlign: 'center',
            mb: 6
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom>
            What our Clients say!
          </Typography>
          <Box
            sx={{
              width: '12rem',
              height: '2px',
              backgroundColor: 'primary.main',
              borderRadius: '9999px',
              margin: '0 auto'
            }}
          />
        </Box>

        <Box sx={{ 
          '.slick-track': { 
            display: 'flex', 
            '& .slick-slide': {
              height: 'inherit',
              '& > div': {
                height: '100%'
              }
            }
          },
          '.slick-slide': {
            padding: '0 10px'
          }
        }}>
          <Slider {...settings}>
            {reviews.map((review, index) => (
              <Box key={`${review._id}-${index}`} sx={{ height: '100%' }}>
                <StyledCard>
                  <QuoteIcon />
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      mb: 2
                    }}>
                      <Avatar
                        src={review.userId?.imageUrl || '/default-avatar.svg'}
                        sx={{
                          width: 60,
                          height: 60,
                          mb: 1,
                          border: `2px solid ${theme.palette.background.paper}`,
                          boxShadow: theme.shadows[2],
                        }}
                      />
                      <Typography variant="subtitle1" gutterBottom>
                        {review.userId?.name || 'Anonymous'}
                      </Typography>
                      <Rating
                        value={review.rating}
                        readOnly
                        precision={0.5}
                        sx={{ mb: 1 }}
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.5,
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      "{review.content}"
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        mt: 1,
                        textAlign: 'center',
                      }}
                    >
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </StyledCard>
              </Box>
            ))}
          </Slider>
        </Box>
      </Container>
    </Box>
  );
};

export default VendorReviews;