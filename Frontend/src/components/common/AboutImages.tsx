import React from 'react';
import { Grid, Box } from '@mui/material';
import { styled } from '@mui/system';

const ImageWrapper = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    transition: 'transform 0.3s ease-in-out',
  },
  '&:hover img': {
    transform: 'scale(1.1)',
  },
}));

const images = [
  '/images/caro1.jpg',
  '/images/caro2.jpg',
  '/images/caro3.jpg',
  '/images/cate1.jpg',
  '/images/cate2.jpg',
  '/images/event1.jpg',
  '/images/event2.jpg',
  '/images/event3.jpg',
];

const AboutImages: React.FC = () => {
  return (
    <Grid container spacing={2}>
      {images.map((src, index) => (
        <Grid item xs={3} key={index}>
          <ImageWrapper>
            <img src={src} alt={`Event image ${index + 1}`} />
          </ImageWrapper>
        </Grid>
      ))}
    </Grid>
  );
};

export default AboutImages;

