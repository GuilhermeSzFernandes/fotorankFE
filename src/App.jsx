import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Upload from './pages/Upload';
import Teacher from './pages/Teacher';
import Ranking from './pages/Ranking';
import Admin from './pages/Admin';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <main>
            <Routes>
              <Route path="/"                  element={<Navigate to="/ranking" replace />} />
              <Route path="/login"             element={<Login />} />
              <Route path="/register"          element={<Register />} />
              <Route path="/forgot-password"   element={<ForgotPassword />} />
              <Route path="/reset-password"    element={<ResetPassword />} />
              <Route path="/ranking"           element={<Ranking />} />

              <Route path="/upload" element={
                <ProtectedRoute roles={['participant']}><Upload /></ProtectedRoute>
              } />
              <Route path="/teacher" element={
                <ProtectedRoute roles={['teacher']}><Teacher /></ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute roles={['participant', 'teacher', 'admin']}><Settings /></ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
