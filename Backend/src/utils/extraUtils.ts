// generateBookingId.ts
import { v4 as uuidv4 } from 'uuid';

const generateUniqueId = (prefix: string): string => {
    const uniqueId = uuidv4().replace(/-/g, '').substring(0, 10);
    return `${prefix}${uniqueId.toUpperCase()}`;
};

export default generateUniqueId;
