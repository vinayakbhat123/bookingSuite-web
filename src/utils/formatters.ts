import { BookingStatus, Role, RoomStatus, RoomType } from '../types/api';

export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getRoomTypeLabel = (type: RoomType | string | undefined): string => {
  switch (type) {
    case 'SINGLE':
      return 'Single Room';
    case 'DOUBLE':
      return 'Double Room';
    case 'STANDARD_QUEEN':
      return 'Standard Queen Suite';
    case 'DELUXE':
      return 'Deluxe Ocean/City View';
    case 'EXECUTIVE_SUITE':
      return 'Executive Luxury Suite';
    case 'FAMILY_TWIN':
      return 'Family Twin Suite';
    case 'PRESIDENTIAL_PENTHOUSE':
      return 'Presidential Penthouse';
    default:
      return type ? String(type).replace(/_/g, ' ') : 'Standard Room';
  }
};

export const getBookingStatusConfig = (status: BookingStatus | string | undefined) => {
  switch (status) {
    case 'CONFIRMED':
      return {
        label: 'Confirmed',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'PAYMENTS_PENDING':
      return {
        label: 'Payment Pending',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'GUESTS_ADDED':
      return {
        label: 'Guests Added',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'RESERVED':
      return {
        label: 'Reserved',
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-500',
      };
    case 'IN_PROGRESS':
      return {
        label: 'In Progress (Active Stay)',
        bg: 'bg-teal-50 text-teal-700 border-teal-200',
        dot: 'bg-teal-500',
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-500',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'EXPIRED':
      return {
        label: 'Expired',
        bg: 'bg-gray-100 text-gray-600 border-gray-200',
        dot: 'bg-gray-400',
      };
    case 'NO_SHOW':
      return {
        label: 'No Show',
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-500',
      };
    default:
      return {
        label: status ? String(status).replace(/_/g, ' ') : 'Pending',
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
};

export const getRoomStatusConfig = (status: RoomStatus | string | undefined) => {
  switch (status) {
    case 'AVAILABLE':
      return {
        label: 'Available',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'OCCUPIED':
      return {
        label: 'Occupied',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    case 'UNAVAILABLE':
      return {
        label: 'Unavailable',
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
      };
    case 'MAINTENANCE':
      return {
        label: 'Under Maintenance',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    case 'OUT_OF_SERVICE':
      return {
        label: 'Out of Service',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    default:
      return {
        label: status ? String(status) : 'Unknown',
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
      };
  }
};

export const getRoleLabel = (role: Role | string | undefined): string => {
  switch (role) {
    case 'HOTEL_MANAGER':
      return 'Hotel Manager';
    case 'ADMIN':
      return 'Administrator';
    case 'OWNER':
      return 'Property Owner';
    case 'SUPPORT':
      return 'Support Specialist';
    case 'GUEST':
      return 'Guest Traveler';
    default:
      return role || 'Guest';
  }
};
