import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import LoginPage           from '../features/auth/LoginPage';
import RegisterPage        from '../features/auth/RegisterPage';
import ForgotPasswordPage  from '../features/auth/ForgotPasswordPage';
import ResetPasswordPage   from '../features/auth/ResetPasswordPage';
import CourseListPage      from '../features/courses/CourseListPage';
import CourseDetailPage from '../features/courses/CourseDetailPage';
import EnrolmentPage    from '../features/enrolment/EnrolmentPage';
import PaymentPage      from '../features/payment/PaymentPage';
import ProfilePage      from '../features/profile/ProfilePage';
import AdminDashboard   from '../features/admin/AdminDashboard';

// Redirects unauthenticated users to /login
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Student-only paths
const StudentRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated)       return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
};

// Redirects non-admin users to /courses
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated)       return <Navigate to="/login"   replace />;
  if (user?.role !== 'admin') return <Navigate to="/courses" replace />;
  return children;
};

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <h1 className="text-6xl font-bold text-gray-200">404</h1>
    <p className="text-gray-500">Page not found.</p>
    <a href="/courses" className="btn-primary text-sm">Back to Courses</a>
  </div>
);

// Router
const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />

    <Route path="/login"           element={<LoginPage />} />
    <Route path="/register"        element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password"  element={<ResetPasswordPage />} />
    <Route path="/courses"         element={<CourseListPage />} />
    <Route path="/courses/:id" element={<CourseDetailPage />} />

    {/* Student-only (admins → /admin) */}
    <Route path="/profile" element={
      <StudentRoute><ProfilePage /></StudentRoute>
    } />
    <Route path="/my-enrolments" element={
      <StudentRoute><EnrolmentPage /></StudentRoute>
    } />
    <Route path="/payment/:courseId" element={
      <StudentRoute><PaymentPage /></StudentRoute>
    } />

    <Route path="/admin" element={
      <AdminRoute><AdminDashboard /></AdminRoute>
    } />
    <Route path="/admin/*" element={
      <AdminRoute><AdminDashboard /></AdminRoute>
    } />

    {/* Catch-all */}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRouter;


