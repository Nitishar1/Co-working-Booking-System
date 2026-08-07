import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getSpaces, createSpace, updateSpace, deleteSpace } from '../../services/spaceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

const AdminSpacesPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['spaces', 'admin'],
    queryFn: () => getSpaces({ limit: 100, includeInactive: true }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => createSpace(data),
    onSuccess: () => {
      toast.success('Space created successfully!');
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      closeModal();
    },
    onError: (err) => toast.error(err.message || 'Creation failed')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSpace(id, data),
    onSuccess: () => {
      toast.success('Space updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      closeModal();
    },
    onError: (err) => toast.error(err.message || 'Update failed')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSpace(id),
    onSuccess: () => {
      toast.success('Space successfully deactivated');
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
    onError: (err) => toast.error(err.message || 'Deletion failed')
  });

  const openModal = (space = null) => {
    setEditingSpace(space);
    if (space) {
      setValue('name', space.name);
      setValue('description', space.description);
      setValue('type', space.type);
      setValue('capacity', space.capacity);
      setValue('pricePerHour', space.pricePerHour);
      setValue('isActive', space.isActive);
      setValue('amenities', space.amenities.join(', '));
      setValue('images', space.images.join(', '));
    } else {
      reset({ isActive: true, amenities: '', images: '', type: 'desk', pricePerHour: 0, capacity: 1 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSpace(null);
    reset();
  };

  const onSubmit = (formData) => {
    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
      pricePerHour: Number(formData.pricePerHour),
      amenities: formData.amenities ? formData.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
      images: formData.images ? formData.images.split(',').map(s => s.trim()).filter(Boolean) : [],
    };

    if (editingSpace) {
      updateMutation.mutate({ id: editingSpace._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Spaces Management</h1>
        <button 
          onClick={() => openModal()}
          className="flex items-center px-4 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-md transition active:scale-95"
        >
          <Plus className="w-5 h-5 mr-1.5" /> Add New Space
        </button>
      </div>

      {isLoading ? <LoadingSpinner /> : (
         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto min-h-[400px]">
               <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-black text-gray-400 tracking-wider inline-table w-full">
                     <tr className="flex w-full">
                       <th className="px-6 py-4 flex-1">Space Info</th>
                       <th className="px-6 py-4 w-32">Type</th>
                       <th className="px-6 py-4 w-32">Capacity</th>
                       <th className="px-6 py-4 w-32">Price</th>
                       <th className="px-6 py-4 w-24">Status</th>
                       <th className="px-6 py-4 w-32 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 flex flex-col overflow-y-scroll max-h-[600px] w-full custom-scrollbar">
                     {data?.data?.spaces?.map(space => (
                       <tr key={space._id} className="hover:bg-gray-50/50 transition flex w-full">
                         <td className="px-6 py-4 whitespace-nowrap flex-1 overflow-hidden">
                           <p className="font-extrabold text-gray-900 text-base mb-0.5">{space.name}</p>
                           <p className="text-xs text-gray-400 truncate w-full pr-4">{space.description}</p>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap capitalize font-bold text-gray-700 w-32">
                           {space.type.replace('_', ' ')}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700 w-32">
                           {space.capacity} {space.capacity === 1 ? 'Person' : 'People'}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700 w-32">
                           ${space.pricePerHour}/hr
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap w-24">
                           <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider block text-center ${space.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                             {space.isActive ? 'Active' : 'Inactive'}
                           </span>
                         </td>
                         <td className="px-6 py-4 flex items-center justify-end gap-2 whitespace-nowrap w-32">
                           <button 
                             onClick={() => openModal(space)}
                             className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                           >
                              <Edit2 className="w-4 h-4" />
                           </button>
                           {space.isActive && (
                             <button
                               onClick={() => {
                                 if (window.confirm(`Are you sure you want to deactivate ${space.name}?`)) {
                                   deleteMutation.mutate(space._id);
                                 }
                               }}
                               className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                           )}
                         </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingSpace ? 'Edit Space' : 'Create New Space'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1.5">Space Name</label>
               <input 
                 {...register('name', { required: 'Required' })}
                 className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-medium" 
                 placeholder="e.g. Zen Desk"
               />
               {errors.name && <p className="text-red-500 text-xs font-bold mt-1">{errors.name.message}</p>}
             </div>
             
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1.5">Space Type</label>
               <select 
                 {...register('type', { required: 'Required' })}
                 className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-bold cursor-pointer"
               >
                 <option value="desk">Desk</option>
                 <option value="meeting_room">Meeting Room</option>
               </select>
             </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
             <textarea 
               {...register('description', { required: 'Required' })}
               className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-medium min-h-[80px]" 
               placeholder="Detailed description of the space..."
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1.5">Capacity (People)</label>
               <input 
                 type="number"
                 min="1"
                 {...register('capacity', { required: 'Required' })}
                 className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-medium" 
               />
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1.5">Price Per Hour ($)</label>
               <input 
                 type="number"
                 step="0.01"
                 min="0"
                 {...register('pricePerHour', { required: 'Required' })}
                 className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-medium" 
               />
             </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-1.5">Amenities (Comma separated)</label>
             <input 
               {...register('amenities')}
               className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-medium" 
               placeholder="WiFi, Whiteboard, Projector..."
             />
          </div>
          
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-1.5">Image URLs (Comma separated)</label>
             <div className="flex relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <ImageIcon className="h-5 w-5 text-gray-400" />
               </div>
               <input 
                 {...register('images')}
                 className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-medium" 
                 placeholder="https://image1.jpg, https://image2.jpg"
               />
             </div>
          </div>

          <div className="flex items-center gap-2 pt-2 pb-4">
             <input type="checkbox" id="isActive" {...register('isActive')} className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 cursor-pointer" />
             <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">Space is Active (Available for booking)</label>
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
               className="px-5 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition disabled:opacity-75"
             >
               {editingSpace ? 'Save Changes' : 'Create Space'}
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default AdminSpacesPage;
