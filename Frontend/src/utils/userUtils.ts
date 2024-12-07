export const formatDate = (dateInput?: string | Date): string => {
    if (!dateInput) {
      return 'Invalid date'; // Or any placeholder text you'd like
    }
  
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return 'Invalid date'; // Handle invalid date strings
    }
  
    return date.toLocaleDateString('en-GB');
  };
  