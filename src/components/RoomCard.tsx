import React from 'react';
import { BedDouble, Check, Sparkles, User, Users } from 'lucide-react';
import { RoomResponse } from '../types/api';
import { formatCurrency, getRoomTypeLabel } from '../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface RoomCardProps {
  room: RoomResponse;
  onSelect: (room: RoomResponse) => void;
  selected?: boolean;
}

const DEFAULT_ROOM_PHOTOS: Record<string, string> = {
  SINGLE: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80',
  DOUBLE: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop&q=80',
  STANDARD_QUEEN: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
  DELUXE: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop&q=80',
  EXECUTIVE_SUITE: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop&q=80',
  FAMILY_TWIN: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&auto=format&fit=crop&q=80',
  PRESIDENTIAL_PENTHOUSE: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop&q=80',
};

export const RoomCard: React.FC<RoomCardProps> = ({ room, onSelect, selected = false }) => {
  const photoUrl =
    room.photos && room.photos.length > 0 && room.photos[0].startsWith('http')
      ? room.photos[0]
      : DEFAULT_ROOM_PHOTOS[room.roomType] || DEFAULT_ROOM_PHOTOS.STANDARD_QUEEN;

  const isAvailable = room.roomStatus === 'AVAILABLE';

  return (
    <div
      id={`room-card-${room.id}`}
      className={`flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden border transition-all duration-300 ${
        selected
          ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-lg'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Room Photo */}
      <div className="relative w-full md:w-72 aspect-[16/10] md:aspect-auto overflow-hidden bg-slate-100 shrink-0">
        <img
          src={photoUrl}
          alt={getRoomTypeLabel(room.roomType)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <StatusBadge status={room.roomStatus} type="room" />
        </div>
      </div>

      {/* Room Info */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h4 className="text-lg font-bold text-slate-900">{getRoomTypeLabel(room.roomType)}</h4>
            <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-slate-400" />
                Up to {room.capacity} guests
              </span>
              {room.floor !== undefined && (
                <span className="text-slate-400">• Floor {room.floor}</span>
              )}
            </div>
          </div>

          {/* Amenities tags */}
          {room.amenities && room.amenities.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 my-3">
              {room.amenities.map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/60"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  {item.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 my-2">High-speed Wi-Fi • En-suite Bathroom • Climate Control</p>
          )}
        </div>

        {/* Pricing & Selection CTA */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 mt-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{formatCurrency(room.basePrice)}</span>
              <span className="text-xs text-slate-500 font-normal">/ night (base)</span>
            </div>
            <p className="text-[11px] text-slate-400">Total units available: {room.totalCount}</p>
          </div>

          <button
            onClick={() => onSelect(room)}
            disabled={!isAvailable}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              selected
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : !isAvailable
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-700 text-white hover:scale-105 active:scale-95'
            }`}
          >
            {selected ? '✓ Selected for Booking' : !isAvailable ? 'Currently Unavailable' : 'Select Room'}
          </button>
        </div>
      </div>
    </div>
  );
};
