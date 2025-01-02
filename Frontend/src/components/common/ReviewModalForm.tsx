'use client'
import React, { FC, useEffect, useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react'
import { Star } from 'lucide-react'
import { useSelector } from 'react-redux';
import UserRootState from '@/redux/rootstate/UserState';
import { showToastMessage } from '@/validations/common/toast';
import { axiosInstance } from '@/config/api/axiosInstance';
import { AxiosError } from 'axios';
import { Review, ReviewModelProps } from '@/utils/interfaces';


export const ReviewFormModal: FC<ReviewModelProps> = ({
  isOpen,
  onOpenChange,
  onReviewUpdate,
  bookingDetails
}) => {
  const [rating, setRating] = useState<number>(0)
  const [review, setReview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useSelector((state: UserRootState) => state.user.userData)
  useEffect(() => {
    if (isOpen) {
      setRating(bookingDetails.existingReview?.rating || 0);
      setReview(bookingDetails.existingReview?.content || '');
    } else {
      setRating(0);
      setReview('');
    }
  }, [bookingDetails.existingReview, isOpen]);
  // useEffect(() => {
  //   if (!isOpen) {
  //     setRating(0);
  //     setReview('');
  //   }
  // }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) return;

    if (!user) {
      showToastMessage('Error Occured', 'error')
    }
    // if (!review || !review.trim()) {
    //   showToastMessage('Please enter Review', 'error')
    // }
    if (rating === 0) {
      showToastMessage('Add rating', 'error')
    }

    const trimmedReview = review.trim();
    if (!trimmedReview) {
      showToastMessage('Please enter a review', 'error');
      return;
    }
    try {
      setIsSubmitting(true);

      const endpoint = bookingDetails.existingReview
        ? `/updateReview/${bookingDetails.existingReview._id}`
        : '/addReview';

      const payload = bookingDetails.existingReview
        ? { rating, content: trimmedReview }
        : {
          vendorId: bookingDetails.vendorId,
          bookingId: bookingDetails.bookingId,
          userId: user?._id,
          rating,
          content: trimmedReview
        };
        

      const response = await axiosInstance.post<{ message: string; review: Review }>(endpoint, payload, {
        withCredentials: true
      });
      
      const updatedReview: Review = {
        _id: bookingDetails.existingReview?._id || response.data.review._id,
        rating,
        content: trimmedReview,
        userId: user?._id || '',
        vendorId: bookingDetails.vendorId,
        bookingId: bookingDetails.bookingId,
        createdAt: response.data.review.createdAt,
        updatedAt: response.data.review.updatedAt
      };
      

      onReviewUpdate(bookingDetails.bookingId, updatedReview);

      showToastMessage(response.data.message, 'success')
      onOpenChange(false)
      // setRating(0)
      // setReview('')
    } catch (error) {
      console.error('Error in adding Review:', error)
      if (error instanceof AxiosError) {
        showToastMessage(error.message, 'error')
      }
    }  finally {
      setIsSubmitting(false);
    }


  }

  const StarRating = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`
              ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}
              hover:text-yellow-600 focus:outline-none
            `}
          >
            <Star
              fill={rating >= star ? 'currentColor' : 'none'}
              size={24}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: "easeOut"
              }
            },
            exit: {
              y: -20,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn"
              }
            }
          }
        }}

      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                {bookingDetails.existingReview
                  ? `Edit Your Review #${bookingDetails.bookingNumber}`
                  : `Leave a Review for Booking #${bookingDetails.bookingNumber}`}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="rating" className="block text-sm font-medium mb-2">
                      Rating
                    </label>
                    <StarRating />
                    <p className="text-sm text-gray-500 mt-1">
                      {rating > 0 ? `${rating} out of 5 stars` : 'Click to rate'}
                    </p>
                  </div>
                  <div>
                    <label htmlFor="review" className="block text-sm font-medium mb-2">
                      Review
                    </label>
                    <textarea
                      id="review"
                      placeholder="Write your review here..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      rows={4}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="default" type="submit">
                  {bookingDetails.existingReview ? 'Update Review' : 'Submit Review'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}