import React from 'react';

export const HotelCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
    <div className="w-full aspect-[4/3] bg-slate-200" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="h-5 bg-slate-200 rounded w-2/3" />
        <div className="h-4 bg-slate-200 rounded w-12" />
      </div>
      <div className="h-4 bg-slate-200 rounded w-1/3" />
      <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
        <div className="h-5 bg-slate-200 rounded w-24" />
        <div className="h-8 bg-slate-200 rounded-lg w-20" />
      </div>
    </div>
  </div>
);

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
      </td>
    ))}
  </tr>
);

export const LoadingSpinner: React.FC<{ text?: string; className?: string }> = ({
  text = 'Loading...',
  className = 'py-12',
}) => (
  <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
    <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
    {text && <p className="text-sm font-medium text-slate-500">{text}</p>}
  </div>
);
