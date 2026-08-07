import api from './api';

export const getSpaces = async (params) => {
  const response = await api.get('/spaces', { params });
  return response;
};

export const getSpaceById = async (id) => {
  const response = await api.get(`/spaces/${id}`);
  return response;
};

export const getSpaceAvailability = async (id, params) => {
  const response = await api.get(`/spaces/${id}/availability`, { params });
  return response;
};

// Admin only
export const createSpace = async (data) => {
  const response = await api.post('/spaces', data);
  return response;
};

export const updateSpace = async (id, data) => {
  const response = await api.put(`/spaces/${id}`, data);
  return response;
};

export const deleteSpace = async (id) => {
  const response = await api.delete(`/spaces/${id}`);
  return response;
};
