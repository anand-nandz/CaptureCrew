import { DateRange } from '@/utils/interfaces';
import { showToastMessage } from '@/validations/common/toast';

export const validateDateRange = (customRange: DateRange): boolean => {
  if (!customRange.startDate || !customRange.endDate) {
    showToastMessage('Please select both start and end dates', 'error');
    return false;
  }

  const start = new Date(customRange.startDate);
  const end = new Date(customRange.endDate);
  const today = new Date();
  const daysDifference = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (start > end) {
    showToastMessage('Start date cannot be after end date', 'error');
    return false;
  }

  if (start > today || end > today) {
    showToastMessage('You can only view today\'s or previous day\'s data', 'error');
    return false;
  }

  if (daysDifference > 20) {
    showToastMessage('Date range cannot exceed 20 days', 'error');
    return false;
  }

  return true;
};

export const getMaxDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getMaxEndDate = (startDate: string): string => {
  if (startDate) {
    const start = new Date(startDate);
    const maxDate = new Date(start);
    maxDate.setDate(start.getDate() + 20);
    const today = new Date();
    return maxDate > today ? today.toISOString().split('T')[0] : maxDate.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
};

export const getCategories = (type: string, customRange: DateRange) => {
    switch (type) {
      case "month": {
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      }
      case "week": {
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      }
      case "year": {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => `${currentYear - 4 + i}`);
      }
      case "custom": {
        if (customRange.startDate && customRange.endDate) {
          const start = new Date(customRange.startDate);
          const end = new Date(customRange.endDate);
          const dates: string[] = [];
          while (start <= end) {
            dates.push(start.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric'
            }));
            start.setDate(start.getDate() + 1);
          }
          return dates;
        }
        return [];
      }
      default:
        return [];
    }
  };