import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllBookings } from '../../services/bookingService';
import { getSpaces } from '../../services/spaceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Building2, Calendar, Clock, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { data: spacesData, isLoading: spacesLoading } = useQuery({
    queryKey: ['spaces', 'stats'],
    queryFn: () => getSpaces({ limit: 1, includeInactive: true }), // just to get total count
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', 'stats'],
    queryFn: () => getAllBookings({ limit: 1 }), 
  });
  
  const { data: pendingBookingsData, isLoading: pendingLoading } = useQuery({
    queryKey: ['bookings', 'pending'],
    queryFn: () => getAllBookings({ limit: 50, status: 'pending' }), 
  });

  if (spacesLoading || bookingsLoading || pendingLoading) return <LoadingSpinner />;

  const totalSpaces = spacesData?.data?.pagination?.total || 0;
  const totalBookings = bookingsData?.data?.pagination?.total || 0;
  const pendingRequests = pendingBookingsData?.data?.pagination?.total || 0;

  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="bg-blue-50 p-4 rounded-2xl">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Spaces</p>
            <p className="text-4xl font-black text-gray-900">{totalSpaces}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="bg-primary-50 p-4 rounded-2xl">
            <Calendar className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Bookings</p>
            <p className="text-4xl font-black text-gray-900">{totalBookings}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="bg-amber-50 p-4 rounded-2xl">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pending Requests</p>
            <p className="text-4xl font-black text-gray-900">{pendingRequests}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
           <h2 className="text-lg font-bold text-gray-900">Action Required: Pending Bookings</h2>
        </div>
        <div className="p-6">
          {pendingRequests === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-primary-300 mx-auto mb-4" />
              <p className="text-primary-800 font-extrabold text-xl mb-1">All caught up!</p>
              <p className="text-gray-500 font-medium">No pending booking requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
               {pendingBookingsData?.data?.bookings.map(booking => (
                 <div key={booking._id} className="flex flex-col sm:flex-row justify-between sm:items-center p-5 bg-white border border-gray-100 shadow-sm rounded-2xl gap-4 hover:border-primary-200 transition">
                    <div>
                      <p className="font-extrabold text-gray-900 text-lg">{booking.space?.name}</p>
                      <p className="text-sm text-gray-500 font-medium">By <span className="font-bold text-gray-700">{booking.user?.name}</span> on {new Date(booking.bookingDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500 font-bold mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded-md">{booking.startTime} - {booking.endTime}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="px-4 py-2 bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider rounded-xl">Pending</span>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
