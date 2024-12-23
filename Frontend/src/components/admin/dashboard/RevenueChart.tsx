import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  TextField,
  Box,
  Stack,
  styled
} from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { axiosInstanceAdmin, axiosInstanceVendor } from '@/config/api/axiosInstance';
import { showToastMessage } from '@/validations/common/toast';
import { ApexOptions } from 'apexcharts';
import { DateRange, RevenueChartProps } from '@/utils/interfaces';
import { getCategories, getMaxDate, getMaxEndDate, validateDateRange } from '@/validations/admin/adminValidations';
import SidebarVendor from '@/layout/vendor/SidebarProfileVendor';
import { Role } from '@/utils/enums';

const StyledCardAdmin = styled(Card)(({ theme }) => ({
  width: '100%',
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius
}));

const DateTextField = styled(TextField)(({ theme }) => ({
  width: '160px',
  '& .Mui-disabled': {
    backgroundColor: theme.palette.grey[100],
    cursor: 'not-allowed'
  }
}));


const RevenueChart: React.FC<RevenueChartProps> = ({role}) => {
  const [dateType, setDateType] = useState<string>("week");
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: '',
    endDate: ''
  });
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [chartOptions, setChartOptions] = useState<ApexOptions>({
    chart: {
      background: "#fff",
      foreColor: "#000",
      toolbar: {
        show: true
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: [],
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => `₹${value.toFixed(0)}`
      }
    },
    tooltip: {
      y: {
        formatter: (value) => `₹${value.toFixed(2)}`
      }
    },
    colors: ["#000"]
  });

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setCustomRange(prev => ({
      ...prev,
      startDate: newStartDate,
      endDate: prev.endDate ? prev.endDate : ''
    }));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setCustomRange(prev => ({
      ...prev,
      endDate: newEndDate
    }));
  };
  const axiosInstance = role === Role.Admin ? axiosInstanceAdmin : axiosInstanceVendor;


  const fetchRevenueData = async () => {
    try {
      let url = `/revenue?date=${dateType}`;
      if (dateType === 'custom') {
        const params = new URLSearchParams({
            date: dateType,
            startDate: customRange.startDate,
            endDate: customRange.endDate
          });
          url = `/revenue?${params.toString()}`;
      }

      const response = await axiosInstance.get(url);

      const data = response.data.revenue;

      if (Array.isArray(data)) {
        setRevenueData(data);
        setChartOptions(prev => ({
          ...prev,
          xaxis: {
            ...prev.xaxis,
            categories: getCategories(dateType, customRange)
          }
        }));
      } else {
        showToastMessage('Invalid data format', 'error');
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      showToastMessage('Failed to fetch revenue data', 'error');
    }
  };

  useEffect(() => {
    if (dateType !== 'custom') {
      fetchRevenueData();
    }
  }, [dateType]);

  const handleCustomDateFilter = () => {
    if (validateDateRange(customRange)) {
      setDateType('custom');
      fetchRevenueData();
    }
  };

  return (
    <div className='flex'>
      <div>
      {role === Role.Vendor && <SidebarVendor />}
      </div>
    <StyledCardAdmin>
      <CardContent>
        <Box sx={{ display: 'flex', marginTop: '20px', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" fontWeight="500">
            Total Revenue
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <ButtonGroup variant="outlined" size="small" 
             sx={{
              '& .MuiButton-outlined': {
                borderColor: 'black', 
                color: 'black',     
              },
              '& .MuiButton-outlined:hover': {
                borderColor: 'black', 
                backgroundColor: 'rgba(0, 0, 0, 0.1)', 
              },
            }}>
              {['week', 'month', 'year'].map((period) => (
                <Button
                  key={period}
                  onClick={() => setDateType(period)}
                  className={`px-3 py-1 text-sm rounded ${dateType === period
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}

                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </ButtonGroup>

            <Stack direction="row" spacing={1} alignItems="center">
              <DateTextField
                type="date"
                size="small"
                value={customRange.startDate}
                onChange={handleStartDateChange}
                InputLabelProps={{ shrink: true }}
                label="Start Date"
                inputProps={{
                  max: getMaxDate(),
                }}
              />
              <Typography variant="body2">to</Typography>
              <DateTextField
                type="date"
                size="small"
                value={customRange.endDate}
                onChange={handleEndDateChange}
                InputLabelProps={{ shrink: true }}
                label="End Date"
                inputProps={{
                  min: customRange.startDate,
                  max: getMaxEndDate(customRange.startDate),
                }}
                disabled={!customRange.startDate}
              />
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderColor: 'black', 
                  color: 'black',     
                  '&:hover': {
                    borderColor: 'black',  
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  },
                }}
                onClick={handleCustomDateFilter}
              >
                Apply
              </Button>
            </Stack>
          </Stack>
        </Box>

        <ReactApexChart
          options={chartOptions}
          series={[{
            name: 'Revenue',
            data: revenueData
          }]}
          type="area"
          height={350}
        />
      </CardContent>
    </StyledCardAdmin>
    </div>
  );
};

export default RevenueChart;