import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiBaseURL } from '../axiosInstance';
import Navbar from './Navbar';
import { FcGoogle } from 'react-icons/fc';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiBaseURL.post("/auth/register", formData);
      const data = response.data;

      if (data.status) {
        navigate('/login');
      }
      else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-3 text-zinc-100 bg-white/[0.04] border border-white/[0.1] focus:outline-none focus:border-aura-400/45 focus:ring-1 focus:ring-aura-400/25 rounded-xl transition-all duration-300 placeholder:text-zinc-500 shadow-inner";
  const labelClasses = "text-zinc-400 text-sm font-medium ml-1 mb-1 tracking-wide block";
  const btnClasses =
    "w-full h-12 px-6 rounded-xl font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center tracking-wide bg-aura-400 text-zinc-950 hover:bg-aura-300 border border-aura-400/30 shadow-[0_0_28px_rgba(212,165,116,0.12)]";

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-10 px-5 relative z-10 w-full">
        <div className="w-full max-w-sm flex flex-col gap-6 p-8 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_48px_rgba(0,0,0,0.35)] mx-auto">
          <div className="text-center">
            <p className="font-display text-xs uppercase tracking-[0.35em] text-aura-400/90 mb-2">aura.</p>
            <h2 className="text-2xl font-display font-semibold text-zinc-100 mb-2 tracking-tight">Create account</h2>
            <p className="text-zinc-500 text-sm font-medium tracking-wide">Join Aura to save your sessions</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm text-center backdrop-blur-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="w-full">
              <label className={labelClasses}>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                className={inputClasses}
                required
              />
            </div>

            <div className="w-full">
              <label className={labelClasses}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                className={inputClasses}
                required
              />
            </div>

            <button type="submit" disabled={isLoading} className={`${btnClasses} mt-2 disabled:opacity-50 disabled:cursor-not-allowed`}>
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-2">
            <div className="h-px bg-white/[0.08] flex-1"></div>
            <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Or</span>
            <div className="h-px bg-white/[0.08] flex-1"></div>
          </div>

          <a href="https://aura-backend-ebam.onrender.com:8000/api/auth/google" className="w-full h-12 px-6 rounded-xl font-medium transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 tracking-wide bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15]">
            <FcGoogle className="text-xl" />
            Continue with Google
          </a>

          <p className="text-center text-zinc-500 text-sm mt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-aura-400 hover:text-aura-300 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
