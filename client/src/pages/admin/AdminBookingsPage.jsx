import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllBookings, approveBooking, rejectBooking } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { classNames, getStatusColor } from '../../utils/helpers';
import Modal from '../../components/Modal';

const AdminBookingsPage = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', 'admin-list', filter],
    queryFn: () => getAllBookings({ limit: 100, status: filter }),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => approveBooking(id),
    onSuccess: () => {
      toast.success('Booking approved successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err) => toast.error(err.message || 'Approval failed')
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => rejectBooking(id, reason),
    onSuccess: () => {
      toast.info('Booking rejected');
      setIsRejectModalOpen(false);
      setRejectReason('');
      setSelectedBooking(null);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err) => toast.error(err.message || 'Rejection failed')
  });

  const handleApprove = (id) => {
    if(window.confirm('Approve this booking? Overlapping pending bookings will be auto-rejected.')) {
      approveMutation.mutate(id);
    }
  };

  const openReject = (booking) => {
    setSelectedBooking(booking);
    setIsRejectModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Booking Management</h1>
        
        <select 
          className="px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 font-bold text-gray-700 outline-none shadow-sm cursor-pointer"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[400px]">
             <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-black text-gray-400 tracking-wider inline-table w-full">
                   <tr className="flex w-full">
                     <th className="px-6 py-4 flex-1">User</th>
                     <th className="px-6 py-4 flex-1">Space</th>
                     <th className="px-6 py-4 w-48">Date & Time</th>
                     <th className="px-6 py-4 w-32">Req. Date</th>
                     <th className="px-6 py-4 w-32">Status</th>
                     <th className="px-6 py-4 w-40 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 flex flex-col items-center justify-between overflow-y-scroll max-h-[600px] w-full custom-scrollbar">
                   {data?.data?.bookings?.map(b => (
                     <tr key={b._id} className="hover:bg-gray-50/50 transition flex w-full">
                       <td className="px-6 py-4 flex-1 whitespace-nowrap">
                         <p className="font-extrabold text-gray-900">{b.user?.name}</p>
                         <p className="text-xs text-gray-400 font-semibold">{b.user?.email}</p>
                       </td>
                       <td className="px-6 py-4 flex-1 whitespace-nowrap">
                         <p className="font-extrabold text-gray-900">{b.space?.name}</p>
                         <p className="text-xs text-gray-400 font-semibold capitalize">{b.space?.type}</p>
                       </td>
                       <td className="px-6 py-4 w-48 whitespace-nowrap">
                         <p className="font-bold text-gray-700">{new Date(b.bookingDate).toLocaleDateString()}</p>
                         <p className="text-xs font-bold text-gray-500 bg-gray-100 inline-block px-1.5 py-0.5 rounded mt-1">{b.startTime} - {b.endTime}</p>
                       </td>
                       <td className="px-6 py-4 w-32 whitespace-nowrap font-semibold">
                         {new Date(b.createdAt).toLocaleDateString()}
                       </td>
                       <td className="px-6 py-4 w-32 whitespace-nowrap">
                         <span className={classNames('px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider', getStatusColor(b.status))}>
                           {b.status}
                         </span>
                       </td>
                       <td className="px-6 py-4 w-40 whitespace-nowrap text-right">
                         {b.status === 'pending' && (
                           <div className="flex items-center justify-end gap-2">
                             <button
                               onClick={() => handleApprove(b._id)}
                               className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border border-green-200 rounded-lg text-xs font-black transition active:scale-95"
                             >
                               Approve
                             </button>
                             <button
                               onClick={() => openReject(b)}
                               className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border border-red-200 rounded-lg text-xs font-black transition active:scale-95"
                             >
                               Reject
                             </button>
                           </div>
                         )}
                       </td>
                     </tr>
                   ))}
                   {data?.data?.bookings?.length === 0 && (
                     <tr className="flex w-full">
                       <td className="px-6 py-10 w-full text-center text-gray-500 font-bold">
                         No bookings found matching the criteria.
                       </td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>
        </div>
      )}

      <Modal 
        isOpen={isRejectModalOpen} 
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Booking Request"
      >
         <div className="space-y-4">
            <p className="text-gray-600 font-medium">Please provide a reason for rejecting this booking. This will be sent to the user.</p>
            <textarea
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-gray-50 font-semibold min-h-[100px] resize-none"
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end pt-2">
               <button 
                 onClick={() => setIsRejectModalOpen(false)}
                 className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition"
               >
                 Cancel
               </button>
               <button 
                 onClick={() => rejectMutation.mutate({ id: selectedBooking?._id, reason: rejectReason })}
                 disabled={rejectMutation.isPending}
                 className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-70 active:scale-95 shadow-lg shadow-red-500/20"
               >
                 Confirm Rejection
               </button>
            </div>
         </div>
      </Modal>
    </div>
  );
};
export default AdminBookingsPage;
