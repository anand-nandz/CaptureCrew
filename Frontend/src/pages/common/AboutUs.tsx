import React, { useEffect, useState } from 'react';
import {
    Typography,
    Container,
    Grid,
    Box,
    //   useTheme,
    //   useMediaQuery
} from '@mui/material';
import { styled } from '@mui/system';
import UserNavbar from '@/layout/user/navbar';
import DynamicBackground from '@/components/common/DynamicBackground';
import Footer from '@/layout/user/footer';

const AboutImages = React.lazy(() => import('../../components/common/AboutImages'));

const StyledSection = styled(Box)(({ theme }) => ({
    padding: theme.spacing(12, 0),
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(8, 0),
    },
}));

const ImageBox = styled(Box)(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-8px)',
    },
}));

const About = () => {
    const [showAboutImages, setShowAboutImages] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        const timer = setTimeout(() => {
            setShowAboutImages(true);
        }, 4000);
        return () => clearTimeout(timer);
    }, []);

    return (

        <>
            <UserNavbar />
            <Box sx={{ bgcolor: '#faf7f5' }}>

                <Box
                    sx={{
                        height: '90vh',
                        backgroundImage: 'url("/images/aboutus1.jpg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.4))',
                        }
                    }}
                >
                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography
                            variant="h1"
                            color="white"
                            sx={{
                                fontFamily: 'Cormorant Garamond, serif',
                                fontWeight: 300,
                                fontSize: { xs: '3rem', md: '4.5rem' },
                                maxWidth: '800px',
                                lineHeight: 1.2,
                                mb: 2
                            }}
                        >
                            Capturing Life's Most Beautiful Moments
                        </Typography>
                        <Typography
                            variant="h4"
                            color="white"
                            sx={{
                                fontWeight: 300,
                                opacity: 0.9,
                                maxWidth: '600px',
                                fontSize: { xs: '1.2rem', md: '1.5rem' }
                            }}
                        >
                            Professional photography services for weddings, events, and special moments
                        </Typography>
                    </Container>
                </Box>

                {/* About Section */}
                <StyledSection>
                    <Container maxWidth="lg">
                        <Grid container spacing={8} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <Box sx={{ pr: { md: 6 } }}>
                                    <Typography
                                        component="span"
                                        sx={{
                                            color: 'primary.main',
                                            fontFamily: 'Cormorant Garamond, serif',
                                            fontSize: '1.25rem',
                                            mb: 2,
                                            display: 'block'
                                        }}
                                    >
                                        About Us
                                    </Typography>
                                    <Typography
                                        variant="h2"
                                        gutterBottom
                                        sx={{
                                            fontFamily: 'Cormorant Garamond, serif',
                                            fontWeight: 300,
                                            fontSize: { xs: '2.5rem', md: '3.5rem' },
                                            mb: 4,
                                            lineHeight: 1.2
                                        }}
                                    >
                                        Capture Crew
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontSize: '1.1rem',
                                            lineHeight: 1.8,
                                            color: 'text.secondary',
                                            mb: 3
                                        }}
                                    >
                                        Welcome to Capture Crew, where we transform fleeting moments into timeless memories. Our team of passionate photographers specializes in capturing the raw emotions, subtle details, and magical moments that make each event unique.
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontSize: '1.1rem',
                                            lineHeight: 1.8,
                                            color: 'text.secondary'
                                        }}
                                    >
                                        With years of experience and an eye for detail, we create stunning visual narratives that tell your story in the most beautiful way possible. From intimate weddings to grand celebrations, we're here to ensure every precious moment is preserved forever.
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                {showAboutImages ? (
                                    <AboutImages />
                                ) : (
                                    <Box sx={{
                                        width: '100%',
                                        height: 600,
                                        bgcolor: 'grey.100',
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }} />
                                )}
                            </Grid>
                        </Grid>
                    </Container>
                </StyledSection>

                <DynamicBackground
                    filepath="/images/aboutus3.jpg"
                    height="h-[500px]"
                    type="image"
                    className="w-full"
                />

                {/* Gallery Section */}
                <StyledSection sx={{ bgcolor: 'white' }}>
                    <Container maxWidth="lg">
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <ImageBox sx={{ height: { xs: '300px', md: '600px' } }}>
                                    <Box
                                        component="img"
                                        src="/images/aboutus.jpg"
                                        alt="Wedding photography"
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </ImageBox>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', pl: { md: 6 } }}>
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            fontFamily: 'Cormorant Garamond, serif',
                                            fontWeight: 300,
                                            mb: 4,
                                            fontSize: { xs: '2rem', md: '2.75rem' }
                                        }}
                                    >
                                        Our Approach
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontSize: '1.1rem',
                                            lineHeight: 1.8,
                                            color: 'text.secondary',
                                            mb: 3
                                        }}
                                    >
                                        We believe that every moment tells a story, and every story deserves to be told beautifully. Our approach combines technical expertise with artistic vision to create photographs that are both stunning and authentic.
                                    </Typography>
                                    <Box component="ul" sx={{
                                        listStyle: 'none',
                                        p: 0,
                                        m: 0,
                                        '& li': {
                                            position: 'relative',
                                            pl: 4,
                                            mb: 2,
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                left: 0,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                            }
                                        }
                                    }}>
                                        {[
                                            "Natural, candid moments",
                                            "Artistic composition",
                                            "Attention to detail",
                                            "Professional editing",
                                            "Quick turnaround"
                                        ].map((item, index) => (
                                            <li key={index}>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontSize: '1.1rem',
                                                        color: 'text.secondary'
                                                    }}
                                                >
                                                    {item}
                                                </Typography>
                                            </li>
                                        ))}
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Container>
                </StyledSection>

                {/* Final CTA Section */}
                <Box
                    sx={{
                        backgroundImage: 'url("/images/aboutus2.jpg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '80vh',
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3))',
                        }
                    }}
                >
                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                        <Box sx={{ maxWidth: 600 }}>
                            <Typography
                                variant="h2"
                                color="white"
                                sx={{
                                    fontFamily: 'Cormorant Garamond, serif',
                                    fontWeight: 300,
                                    mb: 3,
                                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                                }}
                            >
                                Let's Create Something Beautiful Together
                            </Typography>
                            <Typography
                                variant="body1"
                                color="white"
                                sx={{
                                    fontSize: '1.2rem',
                                    lineHeight: 1.8,
                                    mb: 4,
                                    opacity: 0.9
                                }}
                            >
                                Every moment is precious, and we're here to help you preserve them forever. Contact us to discuss your photography needs.
                            </Typography>
                        </Box>
                    </Container>
                </Box>
            </Box>
            <Footer/>
        </>
    );
};

export default About;

