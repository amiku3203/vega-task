import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import AllBlogs from './pages/Allblogs';
import BlogViewer from './pages/BlogView';
import Footer from './Components/Footer';

function AppWrapper() {
  const location = useLocation();
  const hideFooterOnPaths = ['/auth'];

  const shouldHideFooter = hideFooterOnPaths.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blogs"
          element={
            <ProtectedRoute>
              <AllBlogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blogs/:id"
          element={
            <ProtectedRoute>
              <BlogViewer />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!shouldHideFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
