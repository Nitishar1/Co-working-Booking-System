import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { ROLES } from '../constants';

// Lazy loading pages
const HomePage = lazy(() => import('../pages/HomePage'));
const SpaceListPage = lazy(() => import('../pages/SpaceListPage'));
const SpaceDetailPage = lazy(() => import('../pages/SpaceDetailPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const Error404 = lazy(() => import('../pages/Error404'));
const Error403 = lazy(() => import('../pages/Error403'));

// Member Pages
const MemberDashboard = lazy(() => import('../pages/member/MemberDashboard'));
const MyBookingsPage = lazy(() => import('../pages/member/MyBookingsPage'));
const ProfilePage = lazy(() => import('../pages/member/ProfilePage'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminSpacesPage = lazy(() => import('../pages/admin/AdminSpacesPage'));
const AdminBookingsPage = lazy(() => import('../pages/admin/AdminBookingsPage'));
const MaintenancePage = lazy(() => import('../pages/admin/MaintenancePage'));

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public Routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/spaces" element={<SpaceListPage />} />
          <Route path="/spaces/:id" element={<SpaceDetailPage />} />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/403" element={<Error403 />} />
          <Route path="/404" element={<Error404 />} />
        </Route>

        {/* Private Routes with DashboardLayout */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            
            {/* Member Routes open to Member, Admin has access to their own subset but we can allow admin to browse member dashboard too if they want */}
            <Route element={<RoleRoute roles={[ROLES.MEMBER, ROLES.ADMIN]} />}>
              <Route path="/dashboard" element={<MemberDashboard />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Admin Only Routes */}
            <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/spaces" element={<AdminSpacesPage />} />
              <Route path="/admin/bookings" element={<AdminBookingsPage />} />
              <Route path="/admin/maintenance" element={<MaintenancePage />} />
            </Route>
            
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
