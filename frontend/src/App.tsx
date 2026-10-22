import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Student pages
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import OpportunitiesPage from './pages/OpportunitiesPage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import CompetitionsPage from './pages/CompetitionsPage';
import StudentPerformancePage from './pages/StudentPerformancePage';

// Coach pages
import CoachDashboard from './pages/CoachDashboard';
import CoachProfilePage from './pages/CoachProfilePage';
import CoachTrainingPage from './pages/CoachTrainingPage';
import AttendancePage from './pages/AttendancePage';
import PerformanceManagementPage from './pages/PerformanceManagementPage';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import StudentsManagementPage from './pages/StudentsManagementPage';
import CoachesManagementPage from './pages/CoachesManagementPage';
import OpportunitiesManagementPage from './pages/OpportunitiesManagementPage';
import CompetitionsManagementPage from './pages/CompetitionsManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ExcelManagementPage from './pages/ExcelManagementPage';
import PlayerCsvPage from './pages/PlayerCsvPage';
import CompetitionCsvPage from './pages/CompetitionCsvPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Shared public opportunity/competition browse (for logged in students) */}
          <Route path="/opportunities" element={
            <ProtectedRoute roles={['STUDENT', 'COACH', 'ADMIN']}>
              <OpportunitiesPage />
            </ProtectedRoute>
          } />
          <Route path="/opportunities/:id" element={
            <ProtectedRoute roles={['STUDENT', 'COACH', 'ADMIN']}>
              <OpportunityDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/competitions" element={
            <ProtectedRoute roles={['STUDENT', 'COACH', 'ADMIN']}>
              <CompetitionsPage />
            </ProtectedRoute>
          } />

          {/* Student routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute roles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute roles={['STUDENT']}>
              <StudentProfile />
            </ProtectedRoute>
          } />
          <Route path="/student/registrations" element={
            <ProtectedRoute roles={['STUDENT']}>
              <MyRegistrationsPage />
            </ProtectedRoute>
          } />
          <Route path="/student/performance" element={
            <ProtectedRoute roles={['STUDENT']}>
              <StudentPerformancePage />
            </ProtectedRoute>
          } />

          {/* Coach routes */}
          <Route path="/coach/dashboard" element={
            <ProtectedRoute roles={['COACH']}>
              <CoachDashboard />
            </ProtectedRoute>
          } />
          <Route path="/coach/profile" element={
            <ProtectedRoute roles={['COACH']}>
              <CoachProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/coach/training" element={
            <ProtectedRoute roles={['COACH', 'ADMIN']}>
              <CoachTrainingPage />
            </ProtectedRoute>
          } />
          <Route path="/coach/attendance" element={
            <ProtectedRoute roles={['COACH', 'ADMIN']}>
              <AttendancePage />
            </ProtectedRoute>
          } />
          <Route path="/coach/performance" element={
            <ProtectedRoute roles={['COACH', 'ADMIN']}>
              <PerformanceManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/coach/students" element={
            <ProtectedRoute roles={['COACH', 'ADMIN']}>
              <StudentsManagementPage />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute roles={['ADMIN']}>
              <StudentsManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/coaches" element={
            <ProtectedRoute roles={['ADMIN']}>
              <CoachesManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/opportunities" element={
            <ProtectedRoute roles={['ADMIN']}>
              <OpportunitiesManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/competitions" element={
            <ProtectedRoute roles={['ADMIN']}>
              <CompetitionsManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/excel" element={
            <ProtectedRoute roles={['ADMIN']}>
              <ExcelManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/players-csv" element={
            <ProtectedRoute roles={['ADMIN']}>
              <PlayerCsvPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/competitions-csv" element={
            <ProtectedRoute roles={['ADMIN']}>
              <CompetitionCsvPage />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
