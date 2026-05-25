import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';

import { AudioPlayer } from './components/AudioPlayer';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Home } from './pages/Home';
import { Login } from './pages/Login';

function AppContent() {
  const location = useLocation();
  const [currentUpload, setCurrentUpload] = useState(null);

  useEffect(() => {
    const handleAuthChange = () => {
      const hasToken = Boolean(localStorage.getItem('authToken'));

      if (!hasToken) {
        setCurrentUpload(null);
      }
    };

    handleAuthChange();
    window.addEventListener('auth:changed', handleAuthChange);

    return () => {
      window.removeEventListener('auth:changed', handleAuthChange);
    };
  }, []);

  const shouldShowPlayer = location.pathname !== '/login';

  return (
    <div className="app-shell" style={{ paddingBottom: shouldShowPlayer ? '110px' : 0 }}>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              activeUploadId={currentUpload?._id || null}
              onSelectUpload={setCurrentUpload}
            />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {shouldShowPlayer && (
        <AudioPlayer currentUpload={currentUpload} />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
