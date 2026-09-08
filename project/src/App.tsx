import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import CaseOverview from '@/pages/CaseOverview';
import FirDetail from '@/pages/FirDetail';
import Entities from '@/pages/Entities';
import KnowledgeGraph from '@/pages/KnowledgeGraph';
import Analytics from '@/pages/Analytics';
import Evidence from '@/pages/Evidence';
import AuditTrail from '@/pages/AuditTrail';
import Report from '@/pages/Report';

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
      <Route path="/cases" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/cases/:caseId" element={<ProtectedRoute><CaseOverview /></ProtectedRoute>} />
      <Route path="/cases/:caseId/fir" element={<ProtectedRoute><FirDetail /></ProtectedRoute>} />
      <Route path="/cases/:caseId/graph" element={<ProtectedRoute><KnowledgeGraph /></ProtectedRoute>} />
      <Route path="/cases/:caseId/evidence" element={<ProtectedRoute><Evidence /></ProtectedRoute>} />
      <Route path="/cases/:caseId/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/cases/:caseId/audit" element={<ProtectedRoute><AuditTrail /></ProtectedRoute>} />
      <Route path="/cases/:caseId/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
      <Route path="/cases/:caseId/entities" element={<ProtectedRoute><Entities /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
