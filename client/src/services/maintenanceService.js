import api from './api';

export const getMaintenanceWindows = async (params) => {
  const response = await api.get('/maintenance', { params });
  return response;
};

export const createMaintenance = async (data) => {
  const response = await api.post('/maintenance', data);
  return response;
};

export const updateMaintenance = async (id, data) => {
  const response = await api.put(`/maintenance/${id}`, data);
  return response;
};

export const deleteMaintenance = async (id) => {
  const response = await api.delete(`/maintenance/${id}`);
  return response;
};
