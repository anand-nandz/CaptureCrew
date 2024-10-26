import Box from '@mui/material/Box';import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';



const ListedVendors = () => {
  // Sample vendor data - replace with your actual data
  const vendors = Array.from(Array(6)).map((_, index) => ({
    id: index + 1,
    name: "Vendor Name",
    description: "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all continents except Antarctica",
    image: "/images/cate1.jpg"
  }));

  return (
    <Container sx={{ py: 2 }}>
        <div>
        <h2 className="text-4xl font-light tracking-[0.3em] text-[#B8860B] py-5 md:py-20 uppercase text-center">
          Popular Vendors
        </h2>
        </div>
      <Box sx={{ flexGrow: 1 }}>
        <Grid 
          container 
          spacing={{ xs: 2, md: 3 }} 
          columns={{ xs: 4, sm: 8, md: 12 }}
          sx={{ padding: { xs: 2, sm: 3, md: 4 } }}
        >
          {vendors.map((vendor) => (
            <Grid item xs={4} sm={4} md={4} key={vendor.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}
              >
                <CardMedia
                  sx={{ height: 300 }}
                  image={vendor.image}
                  title={vendor.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {vendor.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {vendor.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">View Details</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default ListedVendors;