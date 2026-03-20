import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TopicDetail from './pages/TopicDetail';
import CodingArena from './pages/CodingArena';
import Lesson from './pages/Lesson';
import Progress from './pages/Progress';
import Review from './pages/Review';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Admin from './pages/Admin';
import Curriculum from './pages/Curriculum';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('jlearn_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="topics" element={<Navigate to="/dashboard" replace />} />
          <Route path="topic/:topicId" element={<TopicDetail />} />
          <Route path="lesson/:lessonId" element={<Lesson />} />
          <Route path="curriculum" element={<Curriculum />} />
          <Route path="progress" element={<Progress />} />
          <Route path="review" element={<Review />} />
        </Route>
        {/* Coding Arena has a full-screen layout */}
        <Route
          path="/solve/:questionId"
          element={
            <ProtectedRoute>
              <CodingArena />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
