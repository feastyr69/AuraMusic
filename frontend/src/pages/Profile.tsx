import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiBaseURL } from '../axiosInstance';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

type ProfileData = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  musicTastes: string[];
  createdAt: string;
  isOwner: boolean;
  statsPublic: boolean;
  stats?: {
    listenedMinutes: number;
    roomSessions: number;
    topArtists: { artist: string; listenedMinutes: number }[];
    topTracks: { videoId: string; title: string; artist: string; listenedMinutes: number }[];
  };
};

const cardClass = 'rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl';
const inputClass = 'w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-aura-400/50';

export default function Profile() {
  const { username = '' } = useParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const prefersReducedMotion = useReducedMotion();
  const transitionDuration = prefersReducedMotion ? 0 : 0.38;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileUsername, setProfileUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [musicTastes, setMusicTastes] = useState<string[]>([]);
  const [statsPublic, setStatsPublic] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarRotation, setAvatarRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setError('');
    try {
      const response = await apiBaseURL.get(`/profiles/${encodeURIComponent(username)}`);
      setProfile(response.data);
      setProfileUsername(response.data.username);
      setDisplayName(response.data.displayName);
      setBio(response.data.bio);
      setMusicTastes(response.data.musicTastes || []);
      setStatsPublic(response.data.statsPublic);
    } catch (loadError: any) {
      setError(loadError.response?.status === 404 ? 'Profile not found.' : 'Could not load this profile.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiBaseURL.patch('/profiles/me', { displayName, bio, statsPublic, musicTastes });
      setProfile((current) => current ? { ...current, displayName, bio, statsPublic, musicTastes } : current);
      setEditing(false);
      setAvatarRotation((degrees) => degrees + 360);
      await loadProfile();
    } catch (saveError: any) {
      setError(saveError.response?.data?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const beginEditing = () => {
    if (!profile) return;
    setProfileUsername(profile.username);
    setDisplayName(profile.displayName);
    setBio(profile.bio);
    setMusicTastes(profile.musicTastes || []);
    setStatsPublic(profile.statsPublic);
    setError('');
    setAvatarRotation((degrees) => degrees + 360);
    setEditing(true);
  };

  const cancelEditing = () => {
    if (profile) {
      setProfileUsername(profile.username);
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setMusicTastes(profile.musicTastes || []);
      setStatsPublic(profile.statsPublic);
    }
    setError('');
    setAvatarRotation((degrees) => degrees + 360);
    setEditing(false);
  };

  const saveUsername = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await apiBaseURL.patch('/auth/username', { username: profileUsername });
      if (response.data.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken);
      await login(response.data.token);
      setProfile((current) => current ? { ...current, username: response.data.user.username } : current);
      setEditing(false);
      setAvatarRotation((degrees) => degrees + 360);
      navigate(`/profile/${encodeURIComponent(response.data.user.username)}`, { replace: true });
    } catch (saveError: any) {
      setError(saveError.response?.data?.message || 'Could not update username.');
    } finally {
      setSaving(false);
    }
  };

  const avatar = profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.displayName || username)}&background=25202b&color=e4e4e7`;

  return (
    <div className="min-h-screen text-zinc-100">
      <Navbar />
      <main className="mx-auto min-h-[70vh] w-full max-w-5xl px-5 pb-20 pt-8 md:px-8 lg:mt-10">
        {loading ? (
          <div className="py-24 text-center text-sm text-zinc-500">Loading profile...</div>
        ) : error && !profile ? (
          <div className={`${cardClass} mx-auto max-w-xl px-8 py-16 text-center`}>
            <h1 className="font-display text-2xl font-semibold">{error}</h1>
            <Link to="/" className="mt-5 inline-block text-sm text-aura-300 hover:text-aura-200">Back home</Link>
          </div>
        ) : profile && (
          <div className="relative grid items-stretch gap-6 lg:grid-cols-[minmax(16rem,0.9fr)_minmax(0,1.6fr)]">
            <section
              data-testid="profile-card"
              className={`relative z-10 col-span-full row-start-1 w-full overflow-hidden rounded-3xl lg:min-h-0 ${editing && profile.isOwner ? 'z-20' : ''}`}
            >
              <div
                aria-hidden="true"
                className={`${cardClass} pointer-events-none absolute inset-y-0 left-0 z-0 w-full rounded-3xl transition-[width,border-color,background-color] duration-500 ease-out motion-reduce:transition-none lg:w-[calc(36%_-_0.54rem)] ${editing && profile.isOwner ? 'border-aura-300/15 bg-gradient-to-br from-aura-300/[0.08] via-zinc-950/90 to-fuchsia-400/[0.05] lg:w-full' : ''}`}
              />
              <div aria-hidden="true" className="pointer-events-none absolute left-[10%] top-0 z-0 h-64 w-64 rounded-full bg-aura-400/10 blur-3xl" />
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute left-0 top-0 z-0 h-28 w-full bg-gradient-to-b from-aura-300/[0.06] to-transparent lg:w-[calc(36%_-_0.54rem)] ${editing && profile.isOwner ? 'lg:w-full' : ''}`}
              />
              <div className="relative z-10 grid grid-cols-1 items-start gap-5 p-6 md:p-7 lg:h-full lg:grid-cols-[minmax(16rem,0.9fr)_minmax(0,1.6fr)] lg:items-stretch">
                <div data-testid="profile-details" className="min-w-0 flex flex-col items-center text-center lg:items-start lg:text-left">
                  <div className="rounded-full bg-gradient-to-br from-aura-300/40 to-fuchsia-400/20 p-[2px]">
                    <motion.img
                      animate={{ rotate: prefersReducedMotion ? 0 : avatarRotation }}
                      transition={{ rotate: { duration: prefersReducedMotion ? 0 : 0.65, ease: 'easeInOut' } }}
                      src={avatar}
                      alt={`${profile.displayName} avatar`}
                      className="h-28 w-28 rounded-full border-4 border-zinc-950 object-cover shadow-xl"
                    />
                  </div>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-aura-300">Aura profile</p>
                  <h1 className="mt-2 max-w-full break-words font-display text-3xl font-semibold md:text-4xl">{editing ? displayName : profile.displayName}</h1>
                  <p className="mt-1 text-sm text-zinc-500">@{editing ? profileUsername : profile.username}</p>
                  <p className="mt-5 w-full whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">{(editing ? bio : profile.bio) || 'Listening together on Aura.'}</p>
                  {profile.musicTastes?.length > 0 && (
                    <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start" aria-label="Music tastes">
                      {profile.musicTastes.map((taste) => <span key={taste} className="rounded-full border border-aura-300/20 bg-aura-300/[0.08] px-3 py-1.5 text-xs text-aura-200">{taste}</span>)}
                    </div>
                  )}
                  <p className="mt-6 border-t border-white/[0.08] pt-4 text-xs text-zinc-500">Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                  {profile.isOwner && (
                    <button type="button" onClick={editing ? cancelEditing : beginEditing} className="mt-6 w-[90%] rounded-xl border border-aura-300/25 bg-aura-300/[0.07] px-5 py-3 text-sm font-medium text-aura-200 transition hover:border-aura-300/45 hover:bg-aura-300/[0.12]">
                      {editing ? 'Cancel editing' : 'Edit profile'}
                    </button>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {editing && profile.isOwner && (
                    <motion.aside
                      key="profile-fields"
                      data-testid="profile-editor"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: transitionDuration, ease: 'easeOut' }}
                      className="no-scrollbar min-w-0 space-y-3 overflow-y-auto border-t border-white/[0.08] pt-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"
                    >
                      <header className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aura-300">Profile settings</p>
                          <h2 className="mt-0.5 font-display text-lg font-semibold">Make it yours</h2>
                        </div>
                        {error && <p role="alert" className="text-right text-sm text-rose-300">{error}</p>}
                      </header>

                      <form onSubmit={saveUsername} className="space-y-1.5">
                        <label className="block text-xs text-zinc-400" htmlFor="profile-username">Username</label>
                        <div className="flex gap-2">
                          <input id="profile-username" aria-label="Username" minLength={3} maxLength={20} pattern="[A-Za-z0-9_]{3,20}" required value={profileUsername} onChange={(event) => setProfileUsername(event.target.value)} className={`${inputClass} min-w-0 flex-1`} />
                          <button disabled={saving || profileUsername.toLowerCase() === profile.username} className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-aura-400/40 hover:text-aura-200 disabled:opacity-50">Change username</button>
                        </div>
                        <p className="text-[11px] text-zinc-600">Use 3–20 letters, numbers, or underscores.</p>
                      </form>

                      <form onSubmit={saveProfile} className="space-y-3 border-t border-white/[0.08] pt-3">
                        <div className="grid gap-3 lg:grid-cols-2">
                          <label className="block text-xs text-zinc-400">Display name
                            <input aria-label="Display name" maxLength={80} required value={displayName} onChange={(event) => setDisplayName(event.target.value)} className={`${inputClass} mt-1.5`} />
                          </label>
                          <label className="block text-xs text-zinc-400">Bio
                            <textarea aria-label="Bio" maxLength={280} rows={2} value={bio} onChange={(event) => setBio(event.target.value)} className={`${inputClass} mt-1.5 resize-y`} />
                            <span className="mt-0.5 block text-right text-[11px] text-zinc-600">{bio.length}/280</span>
                          </label>
                        </div>
                        <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-300">
                          <input type="checkbox" checked={statsPublic} onChange={(event) => setStatsPublic(event.target.checked)} className="h-4 w-4 accent-aura-400" />
                          Make listening statistics public
                        </label>
                        <div className="flex flex-wrap justify-end gap-2 border-t border-white/[0.08] pt-2">
                          <button type="button" onClick={cancelEditing} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-white/25 hover:text-white">Discard</button>
                          <button disabled={saving} className="rounded-lg bg-aura-400 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-aura-300 disabled:opacity-60">{saving ? 'Saving…' : 'Save profile'}</button>
                        </div>
                      </form>
                    </motion.aside>
                  )}
                </AnimatePresence>
              </div>
            </section>

            <motion.div
              data-testid="profile-stats"
              animate={{ opacity: editing ? 0 : 1 }}
              transition={{ duration: transitionDuration, ease: 'easeOut' }}
              aria-hidden={editing}
              className={`min-w-0 space-y-6 lg:col-start-2 lg:row-start-1 ${editing ? 'pointer-events-none hidden lg:block' : ''}`}
            >
                  {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
                  {profile.stats ? (
                    <section aria-label="Listening statistics" className="flex h-full flex-col gap-5 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6 md:p-7">
                      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-aura-300">Your listening</p>
                          <h2 className="mt-2 font-display text-2xl font-semibold">Listening statistics</h2>
                        </div>
                        <span className="text-xs text-zinc-600">A little history, one track at a time</span>
                      </header>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className={`${cardClass} p-6`}><p className="text-sm text-zinc-500">Time listened</p><p className="mt-2 font-display text-3xl font-semibold">{profile.stats.listenedMinutes.toLocaleString()} <span className="text-base font-medium text-zinc-500">min</span></p></div>
                        <div className={`${cardClass} p-6`}><p className="text-sm text-zinc-500">Room sessions</p><p className="mt-2 font-display text-3xl font-semibold">{profile.stats.roomSessions.toLocaleString()}</p></div>
                      </div>
                      <div className="grid flex-1 content-start gap-4 xl:grid-cols-2">
                        <div className={`${cardClass} p-6`}>
                          <h3 className="font-display text-lg font-semibold">Top artists</h3>
                          {profile.stats.topArtists.length ? <ol className="mt-4 space-y-3">{profile.stats.topArtists.map((artist, index) => <li key={artist.artist} className="flex items-center justify-between gap-3 text-sm"><span className="truncate text-zinc-300"><span className="mr-3 text-zinc-600">{String(index + 1).padStart(2, '0')}</span>{artist.artist}</span><span className="shrink-0 text-xs text-zinc-500">{artist.listenedMinutes} min</span></li>)}</ol> : <p className="mt-4 text-sm text-zinc-500">Your listening history will appear here.</p>}
                        </div>
                        <div className={`${cardClass} p-6`}>
                          <h3 className="font-display text-lg font-semibold">Top tracks</h3>
                          {profile.stats.topTracks.length ? <ol className="mt-4 space-y-3">{profile.stats.topTracks.map((track, index) => <li key={track.videoId} className="flex items-center justify-between gap-3 text-sm"><span className="min-w-0"><span className="mr-3 text-zinc-600">{String(index + 1).padStart(2, '0')}</span><span className="block truncate text-zinc-300 sm:inline">{track.title}</span><span className="block truncate text-xs text-zinc-600 sm:ml-2 sm:inline">{track.artist}</span></span><span className="shrink-0 text-xs text-zinc-500">{track.listenedMinutes} min</span></li>)}</ol> : <p className="mt-4 text-sm text-zinc-500">Your listening history will appear here.</p>}
                        </div>
                      </div>
                    </section>
                  ) : (
                    <section aria-label="Listening statistics" className={`${cardClass} flex h-full min-h-56 flex-col justify-center p-8 text-center`}>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-aura-300">Listening statistics</p>
                      <h2 className="mt-3 font-display text-xl font-semibold">{profile.isOwner ? 'Your listening is private' : 'Statistics are private'}</h2>
                      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">{profile.isOwner ? 'You can make your listening history visible from profile settings.' : 'This listener keeps their listening history private.'}</p>
                    </section>
                  )}
            </motion.div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
