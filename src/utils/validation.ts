export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateSignup = (name: string, email: string, password?: string) => {
  const errors: Record<string, string> = {};

  if (!name || name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (name.trim().length > 100) {
    errors.name = 'Name cannot exceed 100 characters.';
  }

  if (!email || !isValidEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (password !== undefined) {
    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (password.length > 32) {
      errors.password = 'Password cannot exceed 32 characters.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateHotel = (data: {
  hotelName: string;
  cityName: string;
  contactInfo?: {
    address?: string;
    phoneNumber?: string;
    email?: string;
  };
}) => {
  const errors: Record<string, string> = {};

  if (!data.hotelName || !data.hotelName.trim()) {
    errors.hotelName = 'Hotel name is required.';
  }

  if (!data.cityName || !data.cityName.trim()) {
    errors.cityName = 'City name is required.';
  }

  if (!data.contactInfo?.address || !data.contactInfo.address.trim()) {
    errors.address = 'Street address is required.';
  }

  if (!data.contactInfo?.phoneNumber || !data.contactInfo.phoneNumber.trim()) {
    errors.phoneNumber = 'Phone number is required.';
  } else {
    const digits = data.contactInfo.phoneNumber.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      errors.phoneNumber = 'Phone number must contain 10 to 15 digits (e.g. +18005550199).';
    }
  }

  if (!data.contactInfo?.email || !isValidEmail(data.contactInfo.email)) {
    errors.email = 'Valid contact email is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRoom = (data: {
  roomType: string;
  basePrice: number;
  totalCount: number;
  capacity: number;
  floor?: number;
}) => {
  const errors: Record<string, string> = {};

  if (!data.roomType) {
    errors.roomType = 'Room type is required.';
  }

  if (data.basePrice === undefined || isNaN(data.basePrice) || data.basePrice < 0) {
    errors.basePrice = 'Base price must be 0 or higher.';
  }

  if (!data.totalCount || data.totalCount < 1) {
    errors.totalCount = 'Total count must be at least 1.';
  }

  if (!data.capacity || data.capacity < 1 || data.capacity > 20) {
    errors.capacity = 'Capacity must be between 1 and 20 guests.';
  }

  if (data.floor !== undefined && (data.floor < 0 || data.floor > 50)) {
    errors.floor = 'Floor must be between 0 and 50.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
