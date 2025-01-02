import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ArticleIcon from '@mui/icons-material/Article';
import { useEffect, useState } from 'react';
import { axiosInstanceAdmin } from '@/config/api/axiosInstance';
import { CurrencyRupeeIcon } from '@heroicons/react/24/solid';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface DashboardCard {
  title: string;
  count: string;
  icon: React.ReactNode;
  description: string;
  trend?: string;
}
const DashboardDetails = () => {
  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>([])
  const [donutChartData, setDonutChartData] = useState<{
    series: number[];
    options: ApexOptions;
  }>({
    series: [],
    options: {
      labels: [],
      chart: {
        type: 'donut',
      },
      legend: {
        position: 'bottom',
      },
      colors: ['#1976d2', '#2e7d32', '#ed6c02', '#f57c00'],
    },
  });


  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axiosInstanceAdmin.get('/dashboard');
        const stats = response.data.data;

        // Prepare data for cards
        const cardData: DashboardCard[] = [
          {
            title: 'Total Vendors',
            count: stats.totalVendors.count.toString(),
            icon: <StorefrontIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
            description: 'Active vendors',
          },
          {
            title: 'Total Users',
            count: stats.totalUsers.count.toString(),
            icon: <PeopleIcon sx={{ fontSize: 40, color: '#2e7d32' }} />,
            description: 'Registered users',
          },
          {
            title: 'Total Posts',
            count: stats.totalPosts.count.toString(),
            icon: <ArticleIcon sx={{ fontSize: 40, color: '#ed6c02' }} />,
            description: 'Published content',
          },
          {
            title: 'Revenue',
            count: stats.revenue.count.toString(),
            icon: <CurrencyRupeeIcon style={{ height: 40, width: 40, color: '#f57c00' }} />,
            description: 'Total Revenue',
          },
        ];

        // Prepare data for the donut chart
        const donutSeries = [
          stats.totalVendors.count,
          stats.totalUsers.count,
          stats.totalPosts.count,
        ];
        
        const donutLabels = ['Vendors', 'Users', 'Posts'];

        setDashboardCards(cardData);
        setDonutChartData({
          series: donutSeries,
          options: {
            ...donutChartData.options,
            labels: donutLabels,
          },
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3}>
        {dashboardCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              '&:hover': {
                boxShadow: 6,
              }
            }}>
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                  {card.icon}
                  <Typography variant="h6" component="div">
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ mb: 2 }}>
                  {card.count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
                <Typography variant="body2" sx={{ color: 'success.main', mt: 1 }}>
                  {card.trend}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={4}>
        <Card className='md:w-full md:h-1/2'>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Distribution Overview
            </Typography>
            <ReactApexChart
              options={donutChartData.options}
              series={donutChartData.series}
              type="donut"
              height={350}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardDetails;