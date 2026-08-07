import React from 'react';
import { getStatusColor } from '../utils/helpers';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const BookingCard = ({ booking, onCancel }) => {
  const [sh, sm] = booking.startTime ? booking.startTime.split(':').map(Number) : [0,0];
  const bookingTime = booking.bookingDate ? new Date(booking.bookingDate) : new Date();
  bookingTime.setHours(sh, sm, 0, 0);
  const isPast = bookingTime < new Date();
  
  const isFutureOrActive = ['pending', 'approved'].includes(booking.status) && !isPast;
  const displayedStatus = isPast && ['pending', 'approved'].includes(booking.status) ? 'completed' : booking.status;
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-5 md:p-6 flex flex-col h-full relative overflow-hidden group">
      <div className="flex justify-between items-start mb-5 gap-4">
        <div>
           <h3 className="text-lg font-extrabold text-gray-900 line-clamp-1 mb-1 group-hover:text-primary-600 transition-colors">{booking.space?.name || 'Unknown Space'}</h3>
           <p className="text-sm font-semibold text-gray-500 capitalize">{booking.space?.type?.replace('_', ' ')}</p>
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider whitespace-nowrap border ${getStatusColor(displayedStatus === 'completed' ? 'approved' : displayedStatus)}`}>
          {displayedStatus}
        </div>
      </div>
      
      <div className="space-y-3 mb-6 flex-1">
        <div className="flex items-center text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          <Calendar className="w-4 h-4 text-gray-400 mr-3 shrink-0" />
          <span className="font-bold text-sm text-gray-900">
             {booking.bookingDate ? format(new Date(booking.bookingDate), 'EEEE, MMM do, yyyy') : 'No Date'}
          </span>
        </div>
        <div className="flex items-center text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          <Clock className="w-4 h-4 text-gray-400 mr-3 shrink-0" />
          <span className="font-bold text-sm text-gray-900">
             {booking.startTime} - {booking.endTime}
          </span>
        </div>
      </div>
      
      {isFutureOrActive && onCancel && (
        <button
          onClick={() => onCancel(booking._id)}
          className="w-full py-3 px-4 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition shadow-sm active:scale-[0.98]"
        >
          Cancel Booking
        </button>
      )}
      
      {booking.reason && (
         <div className="mt-4 flex items-start gap-2 bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-100 font-semibold leading-relaxed">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{booking.reason}</p>
         </div>
      )}
    </div>
  );
};

export default BookingCard;
