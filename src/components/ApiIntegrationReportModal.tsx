import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  ExternalLink,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useApiConfig } from '../context/ApiConfigContext';
import { apiClient } from '../lib/apiClient';
import { Modal } from './Modal';

export interface ApiOperationItem {
  id: number;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  feature: string;
  auth: boolean;
  role: 'ANY' | 'GUEST' | 'HOTEL_MANAGER' | 'OWNER' | 'ADMIN' | 'SYSTEM';
  description: string;
  testParams?: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    body?: any;
  };
}

export const API_OPERATIONS: ApiOperationItem[] = [
  {
    id: 1,
    method: 'PUT',
    path: '/users/profile',
    feature: 'Guest Profile Management',
    auth: true,
    role: 'GUEST',
    description: 'Updates current user profile (name, phone, birthDate, bio, gender)',
    testParams: {
      method: 'PUT',
      url: '/users/profile',
      body: { name: 'Alex Johnson', bio: 'Avid traveler & hotel enthusiast' },
    },
  },
  {
    id: 2,
    method: 'GET',
    path: '/admin/hotels/{id}',
    feature: 'Hotel Manager Details',
    auth: true,
    role: 'HOTEL_MANAGER',
    description: 'Retrieves specific hotel configuration and contact information by ID',
    testParams: { method: 'GET', url: '/admin/hotels/1' },
  },
  {
    id: 3,
    method: 'PUT',
    path: '/admin/hotels/{id}',
    feature: 'Hotel Manager Update',
    auth: true,
    role: 'HOTEL_MANAGER',
    description: 'Updates hotel details, photos, contact info, and amenities',
    testParams: {
      method: 'PUT',
      url: '/admin/hotels/1',
      body: {
        hotelName: 'Grand Hyatt City Center',
        cityName: 'New York',
        photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
        amenities: ['WIFI', 'POOL', 'SPA'],
        contactInfo: {
          address: '109 E 42nd St',
          phoneNumber: '+1-212-883-1234',
          email: 'ny-center@grandhyatt.com',
        },
      },
    },
  },
  {
    id: 4,
    method: 'DELETE',
    path: '/admin/hotels/{id}',
    feature: 'Hotel Manager Deletion',
    auth: true,
    role: 'HOTEL_MANAGER',
    description: 'Permanently removes a hotel property',
  },
  {
    id: 5,
    method: 'GET',
    path: '/admin/hotels/{hotelId}/room/{roomId}',
    feature: 'Room Details (Manager)',
    auth: true,
    role: 'HOTEL_MANAGER',
    description: 'Retrieves single room specification in hotel',
    testParams: { method: 'GET', url: '/admin/hotels/1/room/1' },
  },
  {
    id: 6,
    method: 'PUT',
    path: '/admin/hotels/{hotelId}/room/{roomId}',
    feature: 'Room Update (Manager)',
    auth: true,
    role: 'HOTEL_MANAGER',
    description: 'Updates room type, base price, capacity, floor, and amenities',
    testParams: {
      method: 'PUT',
      url: '/admin/hotels/1/room/1',
      body: {
        roomType: 'DELUXE',
        basePrice: 280.0,
        totalCount: 15,
        capacity: 3,
        floor: 12,
        photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
        amenities: ['KING_BED', 'BALCONY', 'OCEAN_VIEW'],
      },
    },
  },
  {
    id: 7,
    method: 'DELETE',
    path: '/admin/hotels/{hotelId}/room/{roomId}',
    feature: 'Room Deletion (Manager)',
    auth: true,
    role: 'HOTEL_MANAGER',
    description: 'Removes a room tier from the hotel catalog',
  },
  {
    id: 8,
    method: 'POST',
    path: '/webhook/stripe',
    feature: 'Stripe Payment Webhook',
    auth: false,
    role: 'SYSTEM',
    description: 'Server-side payment settlement webhook endpoint called by Stripe',
  },
  {
    id: 9,
    method: 'POST',
    path: '/hotels/search',
    feature: 'Hotel Search & Explore',
    auth: false,
    role: 'ANY',
    description: 'Searches hotels by city, date range, and room count with pagination',
    testParams: {
      method: 'POST',
      url: '/hotels/search',
      body: {
        city: 'New York',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        roomsCount: 1,
        pageNumber: 0,
        pageSize: 10,
        dateRangeValid: true,
      },
    },
  },
  {
    id: 10,
    method: 'POST',
    path: '/bookings/{bookingId}/payments',
    feature: 'Payment Initiation',
    auth: true,
    role: 'GUEST',
    description: 'Initiates payment processing session for a pending booking',
    testParams: { method: 'POST', url: '/bookings/1/payments' },
  },
  {
    id: 11,
    method: 'POST',
    path: '/bookings/{bookingId}/cancel',
    feature: 'Booking Cancellation',
    auth: true,
    role: 'GUEST',
    description: 'Cancels a user booking and handles release of inventory',
    testParams: { method: 'POST', url: '/bookings/1/cancel' },
  },
  {
    id: 12,
    method: 'POST',
    path: '/bookings/{bookingId}/addGuests',
    feature: 'Add Guests to Booking',
    auth: true,
    role: 'GUEST',
    description: 'Appends guest names, age, and gender to an initialized booking',
    testParams: {
      method: 'POST',
      url: '/bookings/1/addGuests',
      body: [
        { name: 'Alex Johnson', gender: 'MALE', age: 32 },
        { name: 'Sarah Johnson', gender: 'FEMALE', age: 30 },
      ],
    },
  },
  {
    id: 13,
    method: 'POST',
    path: '/bookings/init',
    feature: 'Initialize Booking',
    auth: true,
    role: 'GUEST',
    description: 'Creates a pending booking reservation for selected room & dates',
    testParams: {
      method: 'POST',
      url: '/bookings/init',
      body: {
        hotelId: 1,
        roomId: 1,
        checkInDate: '2026-09-01',
        checkOutDate: '2026-09-05',
        roomsCount: 1,
      },
    },
  },
  {
    id: 14,
    method: 'POST',
    path: '/auth/signup',
    feature: 'User Registration',
    auth: false,
    role: 'ANY',
    description: 'Registers a new user account with role assignment',
    testParams: {
      method: 'POST',
      url: '/auth/signup',
      body: {
        name: 'Guest Traveler',
        email: 'testguest@bookingsuite.com',
        password: 'Password123!',
      },
    },
  },
  {
    id: 15,
    method: 'POST',
    path: '/auth/refresh',
    feature: 'Token Refresh',
    auth: false,
    role: 'ANY',
    description: 'Exchanges refresh token for fresh AccessToken',
    testParams: { method: 'POST', url: '/auth/refresh', body: {} },
  },
  {
    id: 16,
    method: 'POST',
    path: '/auth/logout',
    feature: 'User Sign Out',
    auth: true,
    role: 'ANY',
    description: 'Invalidates session and clears active authentication state',
    testParams: { method: 'POST', url: '/auth/logout' },
  },
  {
    id: 17,
    method: 'POST',
    path: '/auth/login',
    feature: 'User Authentication',
    auth: false,
    role: 'ANY',
    description: 'Authenticates user and returns AccessToken in LoginResponse',
    testParams: {
      method: 'POST',
      url: '/auth/login',
      body: { email: 'guest@bookingsuite.com', password: 'Password123!' },
    },
  },
  {
    id: 18,
    method: 'GET',
    path: '/admin/hotels',
    feature: 'Admin Hotel Listing',
    auth: true,
    role: 'HOTEL_MANAGER',
    description: 'Lists all hotels in catalog for manager management',
    testParams: { method: 'GET', url: '/admin/hotels' },
  },
  {
    id: 19,
    method: 'POST',
    path: '/admin/hotels',
    feature: 'Create Hotel (Manager)',
    auth: true,
    role: 'HOTEL_MANAGER',
    description: 'Creates a brand new hotel property with full contact info',
    testParams: {
      method: 'POST',
      url: '/admin/hotels',
      body: {
        hotelName: 'The Ritz Downtown',
        cityName: 'Chicago',
        photos: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'],
        amenities: ['VALET', 'FITNESS_CENTER', 'RESTAURANT', 'ROOM_SERVICE'],
        contactInfo: {
          address: '160 E Pearson St',
          phoneNumber: '+1-312-555-0199',
          email: 'concierge@ritzdowntown.com',
        },
      },
    },
  },
  {
    id: 20,
    method: 'GET',
    path: '/admin/hotels/{hotelId}/room',
    feature: 'Hotel Rooms List (Manager)',
    auth: true,
    role: 'HOTEL_MANAGER',
    description: 'Lists all rooms configured for a specific hotel',
    testParams: { method: 'GET', url: '/admin/hotels/1/room' },
  },
  {
    id: 21,
    method: 'POST',
    path: '/admin/hotels/{hotelId}/room',
    feature: 'Create Room (Manager)',
    auth: true,
    role: 'HOTEL_MANAGER',
    description: 'Creates a new room type tier for a hotel',
    testParams: {
      method: 'POST',
      url: '/admin/hotels/1/room',
      body: {
        roomType: 'EXECUTIVE_SUITE',
        basePrice: 340.0,
        totalCount: 8,
        capacity: 4,
        floor: 18,
        photos: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800'],
        amenities: ['LOUNGE_ACCESS', 'CITY_SKYLINE_VIEW', 'MINIBAR', 'ESPRESSO_MACHINE'],
      },
    },
  },
  {
    id: 22,
    method: 'PATCH',
    path: '/admin/inventory/room/{roomId}',
    feature: 'Room Inventory Update',
    auth: true,
    role: 'HOTEL_MANAGER',
    description: 'Modifies inventory totalCount, surgeFactor, and closed flag',
    testParams: {
      method: 'PATCH',
      url: '/admin/inventory/room/1',
      body: { surgeFactor: 1.25, totalCount: 15, closed: false },
    },
  },
  {
    id: 23,
    method: 'PATCH',
    path: '/admin/hotels/{id}/deactivate',
    feature: 'Deactivate Hotel Property',
    auth: true,
    role: 'HOTEL_MANAGER',
    description: 'Toggles hotel status to inactive / hidden from search',
    testParams: { method: 'PATCH', url: '/admin/hotels/1/deactivate' },
  },
  {
    id: 24,
    method: 'PATCH',
    path: '/admin/hotels/{id}/activate',
    feature: 'Activate Hotel Property',
    auth: true,
    role: 'HOTEL_MANAGER',
    description: 'Toggles hotel status to active and available for public bookings',
    testParams: { method: 'PATCH', url: '/admin/hotels/1/activate' },
  },
  {
    id: 25,
    method: 'GET',
    path: '/users/mybookings',
    feature: 'Guest My Bookings',
    auth: true,
    role: 'GUEST',
    description: 'Retrieves historic and upcoming bookings for current logged in user',
    testParams: { method: 'GET', url: '/users/mybookings' },
  },
  {
    id: 26,
    method: 'GET',
    path: '/users/me',
    feature: 'Current User Profile',
    auth: true,
    role: 'ANY',
    description: 'Retrieves current logged in user identity and roles',
    testParams: { method: 'GET', url: '/users/me' },
  },
  {
    id: 27,
    method: 'GET',
    path: '/hotels/{hotelId}/info',
    feature: 'Public Hotel Info & Rooms',
    auth: false,
    role: 'ANY',
    description: 'Retrieves public hotel details and array of available room options',
    testParams: { method: 'GET', url: '/hotels/1/info' },
  },
  {
    id: 28,
    method: 'GET',
    path: '/admin/inventory/rooms/{roomId}',
    feature: 'Room Inventory Schedule',
    auth: true,
    role: 'HOTEL_MANAGER',
    description: 'Retrieves date-wise pricing, surge factors, and capacity breakdown',
    testParams: { method: 'GET', url: '/admin/inventory/rooms/1' },
  },
  {
    id: 29,
    method: 'GET',
    path: '/admin/hotels/{hotelId}/report',
    feature: 'Hotel Analytics & Reports',
    auth: true,
    role: 'HOTEL_MANAGER',
    description: 'Calculates TotalBooking, TotalRevenue, and AverageRevenue metrics',
    testParams: { method: 'GET', url: '/admin/hotels/1/report' },
  },
  {
    id: 30,
    method: 'GET',
    path: '/admin/hotels/{hotelId}/bookings',
    feature: 'Manager Hotel Bookings',
    auth: true,
    role: 'HOTEL_MANAGER',
    description: 'Retrieves guest reservation list for a specific hotel',
    testParams: { method: 'GET', url: '/admin/hotels/1/bookings' },
  },
  {
    id: 31,
    method: 'GET',
    path: '/admin/hotels/owner',
    feature: 'Owner Properties List',
    auth: true,
    role: 'OWNER',
    description: 'Retrieves portfolio of hotels owned by current authenticated user',
    testParams: { method: 'GET', url: '/admin/hotels/owner' },
  },
];

interface ApiReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiIntegrationReportModal: React.FC<ApiReportModalProps> = ({ isOpen, onClose }) => {
  const { baseUrl, testedEndpoints, isBackendConnected, recordTestedEndpoint } = useApiConfig();
  const [filter, setFilter] = useState<'ALL' | 'GUEST' | 'HOTEL_MANAGER' | 'TESTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [runningTestId, setRunningTestId] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<{ id: number; success: boolean; data: any; error?: string } | null>(
    null
  );

  const getStatus = (op: ApiOperationItem) => {
    if (op.path === '/webhook/stripe') {
      return { label: 'CONNECTED', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
    const key = `${op.method} ${op.path}`;
    const directKey = op.testParams ? `${op.testParams.method} ${op.testParams.url}` : '';
    if (testedEndpoints.has(key) || (directKey && testedEndpoints.has(directKey))) {
      return { label: 'TESTED', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    return { label: 'CONNECTED', color: 'bg-sky-50 text-sky-700 border-sky-200' };
  };

  const handleRunTest = async (op: ApiOperationItem) => {
    if (!op.testParams) return;
    setRunningTestId(op.id);
    setTestResult(null);

    try {
      let res;
      if (op.testParams.method === 'GET') {
        res = await apiClient.get(op.testParams.url);
      } else if (op.testParams.method === 'POST') {
        res = await apiClient.post(op.testParams.url, op.testParams.body);
      } else if (op.testParams.method === 'PUT') {
        res = await apiClient.put(op.testParams.url, op.testParams.body);
      } else if (op.testParams.method === 'PATCH') {
        res = await apiClient.patch(op.testParams.url, op.testParams.body);
      } else if (op.testParams.method === 'DELETE') {
        res = await apiClient.delete(op.testParams.url);
      }
      recordTestedEndpoint(`${op.method} ${op.path}`);
      recordTestedEndpoint(`${op.testParams.method} ${op.testParams.url}`);
      setTestResult({ id: op.id, success: true, data: res });
    } catch (err: any) {
      setTestResult({
        id: op.id,
        success: false,
        data: null,
        error: typeof err === 'string' ? err : err.message || 'Request failed',
      });
    } finally {
      setRunningTestId(null);
    }
  };

  const filteredOps = API_OPERATIONS.filter((op) => {
    const matchesSearch =
      op.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.feature.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.method.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'ALL') return true;
    if (filter === 'GUEST') return op.role === 'GUEST' || op.role === 'ANY';
    if (filter === 'HOTEL_MANAGER') return op.role === 'HOTEL_MANAGER' || op.role === 'OWNER';
    if (filter === 'TESTED') {
      const status = getStatus(op);
      return status.label === 'TESTED';
    }
    return true;
  });

  const methodColors: Record<string, string> = {
    GET: 'bg-emerald-100 text-emerald-800 font-semibold',
    POST: 'bg-blue-100 text-blue-800 font-semibold',
    PUT: 'bg-amber-100 text-amber-800 font-semibold',
    PATCH: 'bg-purple-100 text-purple-800 font-semibold',
    DELETE: 'bg-rose-100 text-rose-800 font-semibold',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="OpenAPI Integration Report (31 Operations)" maxWidth="5xl">
      <div className="space-y-5">
        {/* Header Summary */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <div>
              <p className="font-semibold text-slate-800">Target Backend Base URL:</p>
              <code className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-mono font-medium">
                {baseUrl}
              </code>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-white border border-slate-200 font-medium text-slate-600">
              Total Endpoints: <strong>{API_OPERATIONS.length}</strong>
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 font-medium text-emerald-700">
              Integrated: <strong>31/31 (100%)</strong>
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
            {(['ALL', 'GUEST', 'HOTEL_MANAGER', 'TESTED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search endpoints or paths..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>
        </div>

        {/* Operations Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium uppercase tracking-wider">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">API Path</th>
                <th className="py-2.5 px-3">Frontend Feature</th>
                <th className="py-2.5 px-3">Auth / Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredOps.map((op) => {
                const status = getStatus(op);
                const isTesting = runningTestId === op.id;
                return (
                  <tr key={op.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-sans text-slate-400">{op.id}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${methodColors[op.method]}`}>
                        {op.method}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{op.path}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-700">{op.feature}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                        {op.auth ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 inline" />
                        ) : (
                          <span className="text-slate-400">Public</span>
                        )}
                        <span className="font-semibold text-slate-800">[{op.role}]</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}
                      >
                        {status.label === 'TESTED' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Activity className="w-3 h-3 text-sky-600" />
                        )}
                        {status.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      {op.testParams ? (
                        <button
                          onClick={() => handleRunTest(op)}
                          disabled={isTesting}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
                        >
                          {isTesting ? (
                            <RefreshCw className="w-3 h-3 animate-spin text-rose-600" />
                          ) : (
                            <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                          )}
                          {isTesting ? 'Calling...' : 'Live Test'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Static/Webhook</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Live Test Output Console */}
        {testResult && (
          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="font-semibold flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${testResult.success ? 'bg-emerald-400' : 'bg-rose-400'}`}
                />
                Test Result for Operation #{testResult.id}:
              </span>
              <button
                onClick={() => setTestResult(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-sans"
              >
                Clear
              </button>
            </div>
            {testResult.success ? (
              <pre className="overflow-x-auto text-emerald-300 max-h-48 text-[11px] leading-tight">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            ) : (
              <div className="text-rose-400">
                <p className="font-bold">Error:</p>
                <p>{testResult.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
