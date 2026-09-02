import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  IndianRupee,
  Download,
  Filter,
  Layers,
  PieChart as PieIcon,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { reportService } from '../../services/reportService';
import { HotelReport, HotelResponse } from '../../types/api';
import { formatDateForApi, getDaysAhead } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';

export interface HotelReportsPageProps {
  hotels?: HotelResponse[];
  selectedHotelId?: number | null;
}

export const HotelReportsPage: React.FC<HotelReportsPageProps> = ({
  hotels: propHotels,
  selectedHotelId: propSelectedHotelId,
}) => {
  const outletCtx = useOutletContext<{
    hotels?: HotelResponse[];
    selectedHotelId?: number | null;
  }>() || {};

  const hotels = propHotels ?? outletCtx.hotels ?? [];
  const outletHotelId = propSelectedHotelId ?? outletCtx.selectedHotelId ?? null;

  const [activeHotelId, setActiveHotelId] = useState<number | null>(outletHotelId || null);

  // Date Filters
  const [startDate, setStartDate] = useState<string>(
    formatDateForApi(new Date(Date.now() - 30 * 86400000))
  );
  const [endDate, setEndDate] = useState<string>(formatDateForApi(getDaysAhead(30)));

  const [report, setReport] = useState<HotelReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    if (outletHotelId) {
      setActiveHotelId(outletHotelId);
    } else if (hotels.length > 0 && !activeHotelId) {
      setActiveHotelId(hotels[0].id);
    }
  }, [hotels, outletHotelId]);

  const fetchReport = async () => {
    if (!activeHotelId) return;
    setIsLoading(true);
    try {
      const data = await reportService.getHotelReport(activeHotelId, startDate, endDate);
      setReport(data);
    } catch (err: any) {
      toastError(
        'Report Notice',
        typeof err === 'string' ? err : 'Unable to query /admin/hotels/{hotelId}/report'
      );
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeHotelId]);

  const activeHotel = hotels.find((h) => h.id === activeHotelId);

  const totalBookings = report?.totalBookings ?? report?.TotalBooking ?? report?.totalBooking ?? 0;
  const totalRevenue = report?.totalRevenue ?? report?.TotalRevenue ?? 0;
  const averageRevenue = report?.averageRevenue ?? report?.AverageRevenue ?? 0;

  // Prepare chart visual data strictly from real backend metrics
  const financialMetricsData = [
    {
      metric: 'Total Revenue',
      amount: totalRevenue,
      formatted: formatCurrency(totalRevenue),
      fill: '#e11d48',
    },
    {
      metric: 'Avg Revenue / Booking',
      amount: averageRevenue,
      formatted: formatCurrency(averageRevenue),
      fill: '#059669',
    },
  ];

  const bookingsVolumeData = [
    {
      metric: 'Total Bookings',
      count: totalBookings,
      fill: '#2563eb',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Reports & Performance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative financial analytics queried via GET /admin/hotels/{activeHotelId || '...'}/report
          </p>
        </div>

        <button
          onClick={fetchReport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Report</span>
        </button>
      </div>

      {/* Date Range & Hotel Filter Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchReport();
        }}
        className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-end text-xs"
      >
        <div className="sm:col-span-1">
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
            Hotel Property
          </label>
          <select
            value={activeHotelId || ''}
            onChange={(e) => setActiveHotelId(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.hotelName} ({h.cityName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
            Start Date Filter
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
            End Date Filter
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Querying...' : 'Filter Report'}
          </button>
        </div>
      </form>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Bookings</span>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900">
              {isLoading ? '...' : totalBookings}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">Confirmed guest stays</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Gross Revenue</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-emerald-600">
              {isLoading ? '...' : formatCurrency(totalRevenue)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">Gross collected via Stripe</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Average Revenue / Stay</span>
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900">
              {isLoading ? '...' : formatCurrency(averageRevenue)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">Average ticket yield</span>
          </div>
        </div>
      </div>

      {/* Analytics Visualizer Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Breakdown */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Financial Breakdown</h3>
              <p className="text-xs text-slate-500">Gross Revenue & Average Yield per Booking</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
              {activeHotel?.hotelName || 'Selected Property'}
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialMetricsData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val), 'Amount']}
                  contentStyle={{
                    borderRadius: '12px',
                    borderColor: '#e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {financialMetricsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real Data KPI Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Report Summary</h3>
            <p className="text-xs text-slate-500">Verified backend metrics</p>
          </div>

          <div className="space-y-4 py-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Bookings</span>
              <span className="text-2xl font-black text-slate-900">{totalBookings}</span>
              <p className="text-[11px] text-slate-400">Total stays recorded for property</p>
            </div>

            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 space-y-1">
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Total Revenue</span>
              <span className="text-2xl font-black text-rose-700">{formatCurrency(totalRevenue)}</span>
              <p className="text-[11px] text-rose-500/80">Gross earnings settled</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Average Revenue</span>
              <span className="text-2xl font-black text-emerald-700">{formatCurrency(averageRevenue)}</span>
              <p className="text-[11px] text-emerald-500/80">Average yield per booking</p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 flex items-center justify-between">
            <span>Data source:</span>
            <code className="font-mono text-slate-600">GET /admin/hotels/{'{id}'}/report</code>
          </div>
        </div>
      </div>
    </div>
  );
};
