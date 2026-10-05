import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiBaseURL } from '../axiosInstance';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

type ProfileData = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
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
const inputClass = 'w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-aura-400/50';

export default function Profile() {
  const { username = '' } = useParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileUsername, setProfileUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [statsPublic, setStatsPublic] = useState(true);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiBaseURL.get(`/profiles/${encodeURIComponent(username)}`);
      setProfile(response.data);
      setProfileUsername(response.data.username);
      setDisplayName(response.data.displayName);
      setBio(response.data.bio);
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
      await apiBaseURL.patch('/profiles/me', { displayName, bio, statsPublic });
      setEditing(false);
      await loadProfile();
    } catch (saveError: any) {
      setError(saveError.response?.data?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const saveUsername = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await apiBaseURL.patch('/auth/username', { username: profileUsername });
      if (response.data.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken);
      await login(response.data.token);
      setEditing(false);
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
      <main className="mx-auto min-h-[70vh] w-full max-w-5xl px-5 pb-20 pt-8 md:px-8">
        {loading ? (
          <div className="py-24 text-center text-sm text-zinc-500">Loading profile...</div>
        ) : error && !profile ? (
          <div className={`${cardClass} mx-auto max-w-xl px-8 py-16 text-center`}>
            <h1 className="font-display text-2xl font-semibold">{error}</h1>
            <Link to="/" className="mt-5 inline-block text-sm text-aura-300 hover:text-aura-200">Back home</Link>
          </div>
        ) : profile && (
          <div className="space-y-6">
            <section className={`${cardClass} relative overflow-hidden p-6 md:p-10`}>
              <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-aura-400/10 blur-3xl" />
              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                <img src={avatar} alt={`${profile.displayName} avatar`} className="h-24 w-24 rounded-full border border-white/10 object-cover shadow-xl" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-aura-300">Aura profile</p>
                  <h1 className="mt-2 truncate font-display text-3xl font-semibold md:text-4xl">{profile.displayName}</h1>
                  <p className="mt-1 text-sm text-zinc-500">@{profile.username}</p>
                  <p className="mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-zinc-300">{profile.bio || 'Listening together on Aura.'}</p>
                  <p className="mt-4 text-xs text-zinc-500">Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                </div>
                {profile.isOwner && <button type="button" onClick={() => { setEditing(!editing); setError(''); }} className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-aura-400/40 hover:text-aura-200">{editing ? 'Cancel edit' : 'Edit profile'}</button>}
              </div>
            </section>

            {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}

            {editing && profile.isOwner && (
              <div className={`${cardClass} space-y-7 p-6 md:p-8`}>
                <h2 className="font-display text-xl font-semibold">Profile settings</h2>
                <form onSubmit={saveUsername} className="space-y-3">
                  <label className="block text-sm text-zinc-400" htmlFor="profile-username">Username</label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input id="profile-username" aria-label="Username" minLength={3} maxLength={20} pattern="[A-Za-z0-9_]{3,20}" required value={profileUsername} onChange={(event) => setProfileUsername(event.target.value)} className={`${inputClass} flex-1`} />
                    <button disabled={saving || profileUsername.toLowerCase() === profile.username} className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:border-aura-400/40 hover:text-aura-200 disabled:opacity-50">Change username</button>
                  </div>
                  <p className="text-xs text-zinc-600">Use 3–20 letters, numbers, or underscores.</p>
                </form>
                <form onSubmit={saveProfile} className="space-y-5 border-t border-white/[0.08] pt-6">
                  <label className="block text-sm text-zinc-400">Display name
                    <input aria-label="Display name" maxLength={80} required value={displayName} onChange={(event) => setDisplayName(event.target.value)} className={`${inputClass} mt-2`} />
                  </label>
                  <label className="block text-sm text-zinc-400">Bio
                    <textarea aria-label="Bio" maxLength={280} rows={3} value={bio} onChange={(event) => setBio(event.target.value)} className={`${inputClass} mt-2 resize-y`} />
                    <span className="mt-1 block text-right text-xs text-zinc-600">{bio.length}/280</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
                    <input type="checkbox" checked={statsPublic} onChange={(event) => setStatsPublic(event.target.checked)} className="h-4 w-4 accent-aura-400" />
                    Show my listening statistics on my public profile
                  </label>
                  <button disabled={saving} className="rounded-full bg-aura-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-aura-300 disabled:opacity-60">{saving ? 'Saving...' : 'Save profile'}</button>
                </form>
              </div>
            )}

            {profile.stats ? (
              <section aria-label="Listening statistics" className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-aura-300">Your listening</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold">Listening statistics</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={`${cardClass} p-6`}><p className="text-sm text-zinc-500">Time listened</p><p className="mt-2 font-display text-3xl font-semibold">{profile.stats.listenedMinutes.toLocaleString()} <span className="text-base font-medium text-zinc-500">min</span></p></div>
                  <div className={`${cardClass} p-6`}><p className="text-sm text-zinc-500">Room sessions</p><p className="mt-2 font-display text-3xl font-semibold">{profile.stats.roomSessions.toLocaleString()}</p></div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={`${cardClass} p-6`}>
                    <h3 className="font-display text-lg font-semibold">Top artists</h3>
                    {profile.stats.topArtists.length ? <ol className="mt-4 space-y-3">{profile.stats.topArtists.map((artist, index) => <li key={artist.artist} className="flex items-center justify-between gap-3 text-sm"><span className="truncate text-zinc-300"><span className="mr-3 text-zinc-600">{index + 1}</span>{artist.artist}</span><span className="shrink-0 text-xs text-zinc-500">{artist.listenedMinutes} min</span></li>)}</ol> : <p className="mt-4 text-sm text-zinc-500">Your listening history will appear here.</p>}
                  </div>
                  <div className={`${cardClass} p-6`}>
                    <h3 className="font-display text-lg font-semibold">Top tracks</h3>
                    {profile.stats.topTracks.length ? <ol className="mt-4 space-y-3">{profile.stats.topTracks.map((track, index) => <li key={track.videoId} className="flex items-center justify-between gap-3 text-sm"><span className="min-w-0"><span className="mr-3 text-zinc-600">{index + 1}</span><span className="block truncate text-zinc-300 sm:inline">{track.title}</span><span className="block truncate text-xs text-zinc-600 sm:ml-2 sm:inline">{track.artist}</span></span><span className="shrink-0 text-xs text-zinc-500">{track.listenedMinutes} min</span></li>)}</ol> : <p className="mt-4 text-sm text-zinc-500">Your listening history will appear here.</p>}
                  </div>
                </div>
              </section>
            ) : (
              <section className={`${cardClass} p-6 text-sm text-zinc-400`}>{profile.isOwner ? 'Listening statistics are hidden on your public profile.' : 'This user keeps their listening statistics private.'}</section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
