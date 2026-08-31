import React from 'react';
import { BookingStatus, RoomStatus } from '../types/api';
import { getBookingStatusConfig, getRoomStatusConfig } from '../utils/formatters';

interface StatusBadgeProps {
  status?: BookingStatus | RoomStatus | string;
  type?: 'booking' | 'room';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'booking', className = '' }) => {
  if (!status) return null;

  if (type === 'booking') {
    const config = getBookingStatusConfig(status);
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  }

  const config = getRoomStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${className}`}
    >
      {config.label}
    </span>
  );
};
