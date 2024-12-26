import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Rating,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
 
} from '@mui/material';
import { axiosInstanceVendor } from '@/config/api/axiosInstance';
import SidebarVendor from '@/layout/vendor/SidebarProfileVendor';
import { VendorReview } from '@/types/extraTypes';
import Loader from '@/components/common/Loader';
import ReviewStatsCard from '@/components/vendor/ReviewCard';
interface ReviewResponse {
    reviews: VendorReview[];
    count: number;
  }
  

export const VendorReviewList: React.FC = () => {
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);


  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Replace with your actual endpoint
        const response = await axiosInstanceVendor.get<ReviewResponse>('/clientreviews',  {
            params: {
              page: page + 1,  
              pageSize: rowsPerPage
            }
        });
        console.log(response.data.reviews);
        
        setReviews(response.data.reviews);
        setTotalCount(response.data.reviews.length);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch reviews', error);
      }
    };

    fetchReviews();
  }, [page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate review statistics
  const averageRating = reviews.length 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
    const ratingsBreakdown = [5, 4, 3, 2, 1].reduce((acc, star) => {
        acc[star] = reviews.filter((review) => Math.floor(review.rating) === star).length;
        return acc;
      }, {} as { [key: number]: number });
      

    if (loading) {
        return (
          <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Loader />
          </Container>
        );
      }

  return (
    <div className="flex ">
    <div>
        <SidebarVendor />
    </div>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Reviews Management
        </Typography>

        <div className="space-y-6">
      <ReviewStatsCard 
        totalReviews={totalCount}
        averageRating={averageRating}
        ratingsBreakdown={ratingsBreakdown}
      />
    </div>

        {/* Review List */}
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Review</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((review) => (
                  <TableRow key={review._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={review.userId?.imageUrl} 
                          sx={{ mr: 2, width: 40, height: 40 }} 
                        />
                        {review.userId?.name || 'Anonymous'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Rating value={review.rating} readOnly size="small" />
                    </TableCell>
                    <TableCell>{review.content}</TableCell>
                    <TableCell>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={reviews.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>
    </Container>
</div>
  
  );
};

export default VendorReviewList;