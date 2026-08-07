import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyBookings, cancelBooking } from '../../services/bookingService';
import BookingCard from '../../components/BookingCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { classNames } from '../../utils/helpers';
import { Calendar } from 'lucide-react';

const MyBookingsPage = () => {
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => getMyBookings({ limit: 50 }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelBooking(id, 'User requested cancellation'),
    onSuccess: () => {
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries(['my-bookings']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to cancel booking');
    }
  });

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelMutation.mutate(id);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  
  if (error) return (
    <div className="text-red-500 bg-red-50 p-6 rounded-2xl font-bold border border-red-100">
      Failed to load bookings.
    </div>
  );

  const bookings = data?.data?.bookings || [];

  const filteredBookings = bookings.filter(b => {
    const [sh, sm] = b.startTime ? b.startTime.split(':').map(Number) : [0,0];
    const bookingTime = b.bookingDate ? new Date(b.bookingDate) : new Date();
    bookingTime.setHours(sh, sm, 0, 0);
    const isPast = bookingTime < new Date();
    const isCompleted = isPast && ['pending', 'approved'].includes(b.status);

    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['pending', 'approved'].includes(b.status) && !isPast;
    if (filter === 'past') return ['cancelled', 'rejected'].includes(b.status) || isCompleted;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Bookings</h1>
        
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setFilter('all')}
            className={classNames(
              'px-6 py-2.5 rounded-lg font-bold text-sm transition-all',
              filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={classNames(
              'px-6 py-2.5 rounded-lg font-bold text-sm transition-all',
              filter === 'upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={classNames(
              'px-6 py-2.5 rounded-lg font-bold text-sm transition-all',
              filter === 'past' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            Past & Cancelled
          </button>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
           <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
             <Calendar className="w-12 h-12 text-gray-300" />
           </div>
           <h3 className="text-2xl font-extrabold text-gray-900 mb-2">No bookings found</h3>
           <p className="text-gray-500 font-medium">You don't have any {filter !== 'all' ? filter : ''} bookings at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {filteredBookings.map(booking => (
            <BookingCard key={booking._id} booking={booking} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
