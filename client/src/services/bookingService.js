import api from './api';

export const createBooking = async (data) => {
  const response = await api.post('/bookings', data);
  return response;
};

export const getMyBookings = async (params) => {
  const response = await api.get('/bookings/me', { params });
  return response;
};

export const cancelBooking = async (id, reason) => {
  const response = await api.patch(`/bookings/${id}/cancel`, { reason });
  return response;
};

// Admin only
export const getAllBookings = async (params) => {
  const response = await api.get('/bookings', { params });
  return response;
};

export const approveBooking = async (id) => {
  const response = await api.patch(`/bookings/${id}/approve`);
  return response;
};

export const rejectBooking = async (id, reason) => {
  const response = await api.patch(`/bookings/${id}/reject`, { reason });
  return response;
};
