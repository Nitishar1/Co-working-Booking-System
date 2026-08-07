import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getSpaces, getSpaceById, getSpaceAvailability } from '../../services/spaceService';
import { createBooking, getMyBookings } from '../../services/bookingService';
import SpaceCard from '../../components/SpaceCard';
import BookingCard from '../../components/BookingCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { toast } from 'react-toastify';
import { Calendar, Clock, Loader2, AlertTriangle, Info } from 'lucide-react';

const MemberDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const preSelectedSpaceId = searchParams.get('space');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  
  const selectedDate = watch('bookingDate');

  const todayLocal = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const currentHour = new Date().getHours().toString().padStart(2, '0');
  const currentMinute = new Date().getMinutes().toString().padStart(2, '0');
  const currentTimeString = `${currentHour}:${currentMinute}`;

  // Load user spaces for quick booking selection if no space passed
  const { data: spacesData, isLoading: loadingSpaces } = useQuery({
    queryKey: ['spaces', 'quick-list'],
    queryFn: () => getSpaces({ limit: 6 }),
  });

  // Load upcoming bookings for quick view
  const { data: bookingsData, isLoading: loadingBookings } = useQuery({
    queryKey: ['my-bookings', 'dashboard'],
    queryFn: () => getMyBookings({ status: 'approved', limit: 3 }),
  });

  const { data: availabilityData } = useQuery({
    queryKey: ['space-availability', selectedSpace?._id],
    queryFn: () => getSpaceAvailability(selectedSpace._id, { startDate: new Date().toISOString() }),
    enabled: !!selectedSpace?._id && isBookingModalOpen
  });

  // Handle URL pre-selection
  useEffect(() => {
    if (preSelectedSpaceId) {
      getSpaceById(preSelectedSpaceId).then(res => {
        setSelectedSpace(res.data?.space || res.data || res);
        setIsBookingModalOpen(true);
      }).catch(() => {
        toast.error('Failed to load selected space');
        setSearchParams({});
      })
    }
  }, [preSelectedSpaceId, setSearchParams]);

  const bookingMutation = useMutation({
    mutationFn: (data) => createBooking(data),
    onSuccess: () => {
      toast.success('Booking requested successfully!');
      setIsBookingModalOpen(false);
      reset();
      setSearchParams({});
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create booking');
    }
  });

  const onBookSubmit = (data) => {
    if (!selectedSpace) return;
    bookingMutation.mutate({
      ...data,
      space: selectedSpace._id
    });
  };

  const handleOpenBooking = (space) => {
    setSelectedSpace(space);
    setIsBookingModalOpen(true);
  };

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const overlapsWithExisting = (start, end) => {
    if (!start || !end || !selectedDate || !availabilityData?.data) return true;
    
    const selectedStart = timeToMinutes(start);
    const selectedEnd = timeToMinutes(end);
    
    if (selectedStart >= selectedEnd) return 'End time must be after start time';

    if (availabilityData.data.maintenance) {
      const parts = selectedDate.split('-');
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      
      const selectedStartDt = new Date(parts[0], parts[1] - 1, parts[2], sh, sm);
      const selectedEndDt = new Date(parts[0], parts[1] - 1, parts[2], eh, em);

      for (const m of availabilityData.data.maintenance) {
        const mStart = new Date(m.startDateTime);
        const mEnd = new Date(m.endDateTime);
        
        if (selectedStartDt < mEnd && selectedEndDt > mStart) {
          return 'Space is under maintenance during this time';
        }
      }
    }

    if (availabilityData.data.bookings) {
      const dayBookings = availabilityData.data.bookings.filter(b => b.bookingDate.split('T')[0] === selectedDate);
      
      for (const b of dayBookings) {
        const existingStart = timeToMinutes(b.startTime);
        const existingEnd = timeToMinutes(b.endTime);
        
        if (selectedStart < existingEnd && selectedEnd > existingStart) {
          return `This slot overlaps with an existing booking (${b.startTime} - ${b.endTime})`;
        }
      }
    }
    
    return true;
  };

  const activeBookings = bookingsData?.data?.bookings || [];
  const quickSpaces = spacesData?.data?.spaces || [];

  return (
    <div className="animate-in fade-in duration-300 space-y-12 pb-12">
      
      {/* Intro */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Welcome to your workspace</h1>
        <p className="text-gray-500 font-medium text-lg">Manage your bookings or secure a new spot instantly.</p>
      </div>

      {/* Active Bookings Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your approved bookings</h2>
          <button 
            onClick={() => navigate('/my-bookings')}
            className="text-primary-600 font-bold hover:text-primary-700 hover:underline"
          >
            View all
          </button>
        </div>
        
        {loadingBookings ? <LoadingSpinner /> : activeBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
             <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
             <h3 className="text-xl font-extrabold text-gray-900 mb-2">You don't have any upcoming bookings.</h3>
             <p className="text-gray-500 font-medium mb-8">Ready to get to work? Book a desk or a meeting room.</p>
             <button
               onClick={() => document.getElementById('featured-spaces')?.scrollIntoView({ behavior: 'smooth' })}
               className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition active:scale-[0.98]"
             >
               Find a Space
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {activeBookings.map(b => (
               <BookingCard key={b._id} booking={b} />
             ))}
          </div>
        )}
      </section>

      {/* Quick Booking Section */}
      <section id="featured-spaces">
        <div className="mb-6 flex justify-between items-end">
          <h2 className="text-xl font-bold text-gray-900">Featured Spaces</h2>
          <button onClick={() => navigate('/spaces')} className="text-primary-600 font-bold hover:underline">
            Browse all spaces
          </button>
        </div>
        
        {loadingSpaces ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {quickSpaces.map(space => (
              <div key={space._id} className="relative group rounded-2xl">
                <SpaceCard space={space} />
                {/* Overlay quick book button */}
                <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-[1rem] flex items-center justify-center pointer-events-none">
                   <button 
                     className="px-6 py-3 bg-white text-gray-900 font-extrabold rounded-xl shadow-2xl pointer-events-auto transform hover:scale-105 transition-all"
                     onClick={(e) => {
                       e.preventDefault();
                       handleOpenBooking(space);
                     }}
                   >
                     Quick Book
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Booking Form Modal */}
      <Modal 
        isOpen={isBookingModalOpen} 
        onClose={() => {
          setIsBookingModalOpen(false);
          setSearchParams({});
          reset();
        }}
        title={`Book ${selectedSpace?.name}`}
      >
         {availabilityData?.data?.maintenance?.length > 0 && (
           <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm font-semibold mb-5 border border-amber-200">
              <p className="font-bold mb-1 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4"/> Maintenance Scheduled</p>
              {availabilityData.data.maintenance.map((m, i) => (
                <div key={i} className="mb-1 last:mb-0">
                  • {new Date(m.startDateTime).toLocaleString()} to {new Date(m.endDateTime).toLocaleString()}
                  {m.reason && <span className="text-amber-600 block pl-3.5 text-xs">- {m.reason}</span>}
                </div>
              ))}
           </div>
         )}
         
         {selectedDate && availabilityData?.data?.bookings && (
           <div className="bg-blue-50/50 p-4 rounded-xl mb-5 space-y-2">
             <p className="font-bold text-blue-900 flex items-center gap-1.5 text-sm">
               <Info className="w-4 h-4"/> Existing Bookings on {new Date(selectedDate).toLocaleDateString()}
             </p>
             <div className="flex flex-wrap gap-2 text-xs font-bold text-gray-600">
               {availabilityData.data.bookings
                 .filter(b => b.bookingDate.split('T')[0] === selectedDate)
                 .map((b, i) => (
                    <span key={i} className="bg-white border border-blue-100 px-2.5 py-1 rounded-md text-blue-800">
                      Taken: {b.startTime} - {b.endTime}
                    </span>
                 ))}
               {availabilityData.data.bookings.filter(b => b.bookingDate.split('T')[0] === selectedDate).length === 0 && (
                 <span className="text-blue-600 font-semibold px-1">All slots currently open</span>
               )}
             </div>
           </div>
         )}

         <form onSubmit={handleSubmit(onBookSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Date</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Calendar className="h-5 w-5 text-gray-400" />
                 </div>
                 <input 
                   type="date"
                   min={todayLocal}
                   {...register('bookingDate', { required: 'Date is required' })}
                   className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white transition-colors text-gray-900 font-semibold"
                 />
              </div>
              {errors.bookingDate && <p className="mt-1 text-sm text-red-500 font-bold">{errors.bookingDate.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Clock className="h-5 w-5 text-gray-400" />
                     </div>
                     <input 
                       type="time"
                       min={selectedDate === todayLocal ? currentTimeString : undefined}
                       {...register('startTime', { 
                         required: 'Required',
                         validate: (value) => overlapsWithExisting(value, watch('endTime'))
                       })}
                       className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white transition-colors text-gray-900 font-semibold"
                     />
                  </div>
                  {errors.startTime && <p className="mt-1 text-sm text-red-500 font-bold">{errors.startTime.message}</p>}
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Clock className="h-5 w-5 text-gray-400" />
                     </div>
                     <input 
                       type="time"
                       min={selectedDate === todayLocal ? (watch('startTime') || currentTimeString) : watch('startTime')}
                       {...register('endTime', { 
                         required: 'Required',
                         validate: (value) => overlapsWithExisting(watch('startTime'), value)
                       })}
                       className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white transition-colors text-gray-900 font-semibold"
                     />
                  </div>
                  {errors.endTime && <p className="mt-1 text-sm text-red-500 font-bold">{errors.endTime.message}</p>}
               </div>
            </div>

            <div className="pt-2">
               <label className="block text-sm font-bold text-gray-700 mb-2">Additional Notes (Optional)</label>
               <textarea 
                 {...register('notes')}
                 placeholder="Any special requirements..."
                 className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white transition-colors min-h-[100px] resize-none text-gray-900 font-medium"
               />
            </div>

            <button
               type="submit"
               disabled={bookingMutation.isPending}
               className="w-full py-4 mt-2 bg-primary-600 text-white font-extrabold text-lg rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition active:scale-[0.98] disabled:opacity-75 disabled:active:scale-100 flex items-center justify-center"
            >
               {bookingMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm Booking Request'}
            </button>
         </form>
      </Modal>
    </div>
  );
};

export default MemberDashboard;
