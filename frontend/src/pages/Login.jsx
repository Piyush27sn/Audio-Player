import { GoogleLogin } from '@react-oauth/google';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await axiosInstance.post('/auth/google', {
        token: credentialResponse.credential,
      });
      console.log('User authenticated:', response.data);

      localStorage.setItem('authToken', response.data.token);
      window.dispatchEvent(new Event('auth:changed'));
      navigate('/dashboard');
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const handleError = () => {
    console.error('Login Failed');
  };

  return (
    <div className="page-shell">
      <section className="glass-panel login-panel">
        <p className="eyebrow">Welcome back</p>
        <h1 className="page-title">Login to Audio Player</h1>
        <p className="page-copy">
          Continue to your library with Google sign-in. Your dashboard, uploads, and playback controls stay beautifully synced across the app.
        </p>
        <div className="login-provider">
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleError}
          />
        </div>
      </section>
    </div>
  );
};