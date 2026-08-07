import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getMaintenanceWindows, createMaintenance, updateMaintenance, deleteMaintenance } from '../../services/maintenanceService';
import { getSpaces } from '../../services/spaceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, Calendar, AlertTriangle } from 'lucide-react';

const MaintenancePage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => getMaintenanceWindows({ limit: 100 }),
  });

  const { data: spacesData } = useQuery({
    queryKey: ['spaces', 'dropdown'],
    queryFn: () => getSpaces({ limit: 100, includeInactive: true }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => createMaintenance(data),
    onSuccess: () => {
      toast.success('Maintenance window scheduled!');
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      closeModal();
    },
    onError: (err) => toast.error(err.message || 'Failed to create')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateMaintenance(id, data),
    onSuccess: () => {
      toast.success('Maintenance window updated!');
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      closeModal();
    },
    onError: (err) => toast.error(err.message || 'Update failed')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteMaintenance(id),
    onSuccess: () => {
      toast.success('Maintenance window deleted');
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
    onError: (err) => toast.error(err.message || 'Deletion failed')
  });

  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setValue('space', item.space._id);
      setValue('startDateTime', new Date(item.startDateTime).toISOString().slice(0, 16));
      setValue('endDateTime', new Date(item.endDateTime).toISOString().slice(0, 16));
      setValue('reason', item.reason);
    } else {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      const end = new Date(now.getTime() + 60 * 60 * 1000); // 1 hr later
      reset({ 
        space: '', 
        reason: '', 
        startDateTime: now.toISOString().slice(0, 16),
        endDateTime: end.toISOString().slice(0, 16)
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    reset();
  };

  const onSubmit = (formData) => {
    const payload = {
      ...formData,
      startDateTime: new Date(formData.startDateTime).toISOString(),
      endDateTime: new Date(formData.endDateTime).toISOString()
    };
    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Maintenance Schedule</h1>
        <button 
          onClick={() => openModal()}
          className="flex items-center px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md transition active:scale-95"
        >
          <AlertTriangle className="w-5 h-5 mr-1.5" /> Schedule Maintenance
        </button>
      </div>

      {isLoading ? <LoadingSpinner /> : (
         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto min-h-[400px]">
               <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-black text-gray-400 tracking-wider inline-table w-full">
                     <tr className="flex w-full">
                       <th className="px-6 py-4 flex-1">Space</th>
                       <th className="px-6 py-4 w-32">Status</th>
                       <th className="px-6 py-4 w-64">Schedule</th>
                       <th className="px-6 py-4 flex-1">Reason</th>
                       <th className="px-6 py-4 w-32 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 flex flex-col overflow-y-scroll max-h-[600px] w-full custom-scrollbar">
                     {data?.data?.maintenance?.map(item => {
                       const start = new Date(item.startDateTime);
                       const end = new Date(item.endDateTime);
                       const now = new Date();
                       const isActive = now >= start && now <= end;
                       const isPast = now > end;

                       return (
                         <tr key={item._id} className="hover:bg-gray-50/50 transition flex w-full">
                           <td className="px-6 py-4 whitespace-nowrap flex-1">
                             <p className="font-bold text-gray-900">{item.space?.name}</p>
                             <p className="text-xs text-gray-400 capitalize">{item.space?.type}</p>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap w-32">
                             <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider block text-center ${isActive ? 'bg-red-100 text-red-800' : isPast ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-800'}`}>
                               {isActive ? 'In Progress' : isPast ? 'Completed' : 'Upcoming'}
                             </span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap w-64">
                              <div className="flex flex-col text-xs text-gray-500 font-bold">
                                <span className="mb-0.5"><span className="text-gray-400 font-medium">From:</span> {start.toLocaleString()}</span>
                                <span><span className="text-gray-400 font-medium">To:</span> {end.toLocaleString()}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap flex-1 truncate" title={item.reason}>
                             {item.reason}
                           </td>
                           <td className="px-6 py-4 flex items-center justify-end gap-2 whitespace-nowrap w-32">
                             <button 
                               onClick={() => openModal(item)}
                               className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                             >
                                <Edit2 className="w-4 h-4" />
                             </button>
                             <button
                               onClick={() => {
                                 if (window.confirm('Delete this maintenance window?')) {
                                   deleteMutation.mutate(item._id);
                                 }
                               }}
                               className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                           </td>
                         </tr>
                       );
                     })}
                     {data?.data?.maintenance?.length === 0 && (
                        <tr className="flex w-full">
                           <td className="px-6 py-10 w-full text-center text-gray-500 font-bold border-none">No maintenance windows scheduled.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Maintenance' : 'Schedule Maintenance'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
           <div>
             <label className="block text-sm font-bold text-gray-700 mb-1.5">Space</label>
             <select 
               {...register('space', { required: 'Required' })}
               className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-bold cursor-pointer"
             >
               <option value="">Select Space...</option>
               {spacesData?.data?.spaces?.map(space => (
                 <option key={space._id} value={space._id}>{space.name} ({space.type})</option>
               ))}
             </select>
             {errors.space && <p className="text-red-500 text-xs font-bold mt-1">{errors.space.message}</p>}
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Start Date & Time</label>
                <input 
                  type="datetime-local"
                  min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                  {...register('startDateTime', { required: 'Required' })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-medium" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">End Date & Time</label>
                <input 
                  type="datetime-local"
                  min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                  {...register('endDateTime', { required: 'Required' })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-medium" 
                />
              </div>
           </div>

           <div>
             <label className="block text-sm font-bold text-gray-700 mb-1.5">Reason / Notes</label>
             <textarea 
               {...register('reason', { required: 'Required' })}
               className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-medium min-h-[100px]" 
               placeholder="e.g. Broken AC repair..."
             />
             {errors.reason && <p className="text-red-500 text-xs font-bold mt-1">{errors.reason.message}</p>}
           </div>

           <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
             <button 
               type="button"
               onClick={closeModal}
               className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
             >
               Cancel
             </button>
             <button 
               type="submit"
               disabled={createMutation.isPending || updateMutation.isPending}
               className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-75"
             >
               {editingItem ? 'Update Schedule' : 'Schedule Window'}
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default MaintenancePage;
