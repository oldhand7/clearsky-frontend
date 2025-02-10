import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import routes from './routes';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(Boolean(localStorage.getItem('user')));

  // Sync login state when localStorage changes
  const syncAuthState = useCallback(() => {
    setIsLoggedIn(Boolean(localStorage.getItem('user')));
  }, []);

  useEffect(() => {
    window.addEventListener('storage', syncAuthState);
    return () => {
      window.removeEventListener('storage', syncAuthState);
    };
  }, [syncAuthState]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        {routes.public.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {routes.private.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} />} />
      </Routes>
    </Router>
  );
};

export default App;
