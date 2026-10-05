import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiBaseURL } from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';

const inputClass = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-zinc-100 outline-none transition focus:border-aura-400/45 focus:ring-1 focus:ring-aura-400/25';

export default function UsernameSetup() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const response = await apiBaseURL.patch('/auth/username', { username });
      if (response.data.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken);
      await login(response.data.token);
      navigate('/', { replace: true });
    } catch (saveError: any) {
      setError(saveError.response?.data?.message || 'Could not save username.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12 text-zinc-100">
      <section className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
        <p className="text-center font-display text-xs uppercase tracking-[0.35em] text-aura-400/90">aura.</p>
        <h1 className="mt-3 text-center font-display text-2xl font-semibold">Choose your username</h1>
        <p className="mt-3 text-center text-sm leading-6 text-zinc-500">Your username identifies your public profile. You can change it later.</p>
        {error && <p role="alert" className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-center text-sm text-rose-300">{error}</p>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-zinc-300" htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength={3}
            maxLength={20}
            pattern="[A-Za-z0-9_]{3,20}"
            autoComplete="username"
            placeholder="your_username"
            className={inputClass}
            required
          />
          <p className="text-xs text-zinc-600">Use 3–20 letters, numbers, or underscores.</p>
          <button disabled={saving} className="w-full rounded-xl bg-aura-400 px-6 py-3 font-semibold text-zinc-950 transition hover:bg-aura-300 disabled:opacity-60">
            {saving ? 'Saving…' : 'Continue'}
          </button>
        </form>
      </section>
    </main>
  );
}
