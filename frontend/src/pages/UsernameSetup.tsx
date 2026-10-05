import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiBaseURL } from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { MUSIC_TASTE_TAGS } from '../utils/musicTasteTags';

const inputClass = 'w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-aura-400/45 focus:ring-1 focus:ring-aura-400/25';

export default function UsernameSetup() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [musicTastes, setMusicTastes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleTaste = (taste: string) => {
    setMusicTastes((selected) => selected.includes(taste)
      ? selected.filter((item) => item !== taste)
      : selected.length < 3 ? [...selected, taste] : selected);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const response = await apiBaseURL.patch('/auth/username', { username, musicTastes });
      if (response.data.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken);
      await login(response.data.token);
      navigate('/', { replace: true });
    } catch (saveError: any) {
      setError(saveError.response?.data?.message || 'Could not finish setting up your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-screen items-center overflow-hidden px-5 py-10 text-zinc-100 sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-36 top-[-10rem] h-[32rem] w-[32rem] rounded-full bg-aura-400/10 blur-[110px]" />
        <div className="absolute -right-40 bottom-[-12rem] h-[34rem] w-[34rem] rounded-full bg-fuchsia-500/[0.08] blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.035),transparent_55%)]" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <section className="mx-auto w-full max-w-lg lg:mx-0">
          <p className="font-display text-2xl font-semibold tracking-tight">aura<span className="text-aura-400">.</span></p>
          <div className="mt-12 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-aura-300">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-aura-300/25 bg-aura-300/10">01</span>
            Your listening identity
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Make yourself at home<span className="text-aura-300">.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-zinc-400">
            Choose a username for your profile, then share a little of what you love to listen to.
          </p>
          <div className="mt-9 hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 sm:block">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Your profile, your vibe</p>
            <p className="mt-3 font-display text-lg text-zinc-200">Find your people through the music you love.</p>
            <div className="mt-5 flex flex-wrap gap-2" aria-hidden="true">
              {['Indie', 'R&B', 'Electronic'].map((taste) => (
                <span key={taste} className="rounded-full border border-aura-300/20 bg-aura-300/[0.08] px-3 py-1.5 text-xs text-aura-200">{taste}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/[0.09] bg-zinc-950/65 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-9">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aura-300">First, the essentials</p>
            <h2 className="mt-3 font-display text-2xl font-semibold">Set up your profile</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">Your username gives friends a way to find you on Aura.</p>
          </div>

          {error && <p role="alert" className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}

          <form onSubmit={submit} className="mt-7 space-y-7">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="username">Username</label>
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
              <p className="mt-2 text-xs text-zinc-600">3–20 letters, numbers, or underscores. You can change it later.</p>
            </div>

            <fieldset>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <legend className="text-sm font-medium text-zinc-300">What do you listen to?</legend>
                  <p className="mt-1 text-xs text-zinc-600">Pick three to add a little flavor to your profile.</p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-zinc-500">{musicTastes.length}/3</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {MUSIC_TASTE_TAGS.map((taste) => {
                  const selected = musicTastes.includes(taste);
                  const disabled = !selected && musicTastes.length === 3;
                  return (
                    <button
                      key={taste}
                      type="button"
                      aria-pressed={selected}
                      disabled={disabled}
                      onClick={() => toggleTaste(taste)}
                      className={`rounded-xl border px-3 py-2.5 text-sm transition ${selected
                        ? 'border-aura-300/50 bg-aura-300/10 text-aura-200'
                        : 'border-white/[0.08] bg-white/[0.025] text-zinc-400 hover:border-white/20 hover:text-zinc-200'} disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      {taste}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-zinc-600">Totally optional. Skip it, or pick exactly three.</p>
            </fieldset>

            <button type="submit" disabled={saving || (musicTastes.length > 0 && musicTastes.length < 3)} className="w-full rounded-xl bg-aura-400 px-6 py-3.5 font-semibold text-zinc-950 transition hover:bg-aura-300 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Setting things up…' : 'Let’s go'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
