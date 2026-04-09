import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { AuthContext } from '../context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const processToken = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      
      if (token) {
        await login(token);
        navigate('/');
      } else {
        navigate('/login?error=Authentication%20failed');
      }
    };
    processToken();
  }, [location, navigate, login]);

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-10 px-5">
        <div className="text-zinc-400 font-medium tracking-wide animate-pulse">
          Completing sign in...
        </div>
      </div>
    </>
  );
}
