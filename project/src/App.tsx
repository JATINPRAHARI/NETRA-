import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import CaseOverview from '@/pages/CaseOverview';
import FirDetail from '@/pages/FirDetail';
import Entities from '@/pages/Entities';
import Analytics from '@/pages/Analytics';
import Evidence from '@/pages/Evidence';
import AuditTrail from '@/pages/AuditTrail';
import Report from '@/pages/Report';
import FirRegistration from '@/pages/FirRegistration';
import Upload from '@/pages/Upload';
import CaseManagement from '@/pages/CaseManagement';
import EntityResolution from '@/pages/EntityResolution';
import CommunityDetection from '@/pages/CommunityDetection';
import FullGraph from '@/pages/FullGraph';
import AskAI from '@/pages/AskAI';
import AdminRoles from '@/pages/AdminRoles';
import InvestigationReports from '@/pages/InvestigationReports';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/cases" element={<ProtectedRoute><CaseManagement /></ProtectedRoute>} />
      <Route path="/cases/:caseId" element={<ProtectedRoute><CaseOverview /></ProtectedRoute>} />
      <Route path="/cases/:caseId/fir" element={<ProtectedRoute><FirDetail /></ProtectedRoute>} />
      <Route path="/cases/:caseId/fir/register" element={<ProtectedRoute><FirRegistration /></ProtectedRoute>} />
      <Route path="/cases/:caseId/full-graph" element={<ProtectedRoute><FullGraph /></ProtectedRoute>} />
      <Route path="/cases/:caseId/evidence" element={<ProtectedRoute><Evidence /></ProtectedRoute>} />
      <Route path="/cases/:caseId/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/cases/:caseId/audit" element={<ProtectedRoute><AuditTrail /></ProtectedRoute>} />
      <Route path="/cases/:caseId/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
      <Route path="/cases/:caseId/entities" element={<ProtectedRoute><Entities /></ProtectedRoute>} />
      <Route path="/cases/:caseId/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/cases/:caseId/resolution" element={<ProtectedRoute><EntityResolution /></ProtectedRoute>} />
      <Route path="/cases/:caseId/communities" element={<ProtectedRoute><CommunityDetection /></ProtectedRoute>} />
      <Route path="/cases/:caseId/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/cases/:caseId/ai" element={<ProtectedRoute><AskAI /></ProtectedRoute>} />
      <Route path="/cases/:caseId/admin" element={<ProtectedRoute><AdminRoles /></ProtectedRoute>} />
      <Route path="/cases/:caseId/reports" element={<ProtectedRoute><InvestigationReports /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
