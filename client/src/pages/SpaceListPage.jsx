import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSpaces } from '../services/spaceService';
import SpaceCard from '../components/SpaceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, SlidersHorizontal, AlertCircle } from 'lucide-react';

const SpaceListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = useState('');
  
  // Basic debounce implementation
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['spaces', debouncedSearch, type],
    queryFn: () => getSpaces({ search: debouncedSearch, type }),
  });

  return (
    <div className="flex flex-col max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Find your space</h1>
        <p className="text-lg text-gray-500 max-w-2xl">Browse our top-quality workspaces, suited to individuals and large teams alike.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-10 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
             <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
            placeholder="Search spaces by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative md:w-64 shrink-0">
           <select 
             className="w-full pl-4 pr-10 py-3 appearance-none bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-gray-700 cursor-pointer"
             value={type}
             onChange={(e) => setType(e.target.value)}
           >
             <option value="">All Space Types</option>
             <option value="desk">Desks</option>
             <option value="meeting_room">Meeting Rooms</option>
           </select>
           <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
             <SlidersHorizontal className="h-5 w-5 text-gray-400" />
           </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-xl flex items-center gap-3 border border-red-100 shadow-sm">
           <AlertCircle className="w-6 h-6 shrink-0" />
           <p className="font-bold">Failed to load spaces. Please try again later.</p>
        </div>
      ) : data?.data?.spaces?.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <Search className="w-10 h-10 text-gray-300" />
           </div>
           <h3 className="text-2xl font-bold text-gray-900 mb-2">No spaces found</h3>
           <p className="text-gray-500 font-medium">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {data?.data?.spaces?.map(space => (
            <SpaceCard key={space._id} space={space} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SpaceListPage;
