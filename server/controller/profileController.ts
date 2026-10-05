const db = require('../database/db');

export const getProfile = async (req: any, res: any) => {
    try {
        const result = await db.query(
            `SELECT id, username, display_name, google_name, avatar_url, bio, stats_public, created_at
             FROM users WHERE lower(username) = lower($1)`,
            [req.params.username]
        );
        if (!result.rows.length) return res.status(404).json({ message: 'Profile not found' });

        const user = result.rows[0];
        const isOwner = req.userId === user.id;
        const profile: any = {
            username: user.username,
            displayName: user.display_name || user.google_name || user.username,
            avatarUrl: user.avatar_url,
            bio: user.bio || '',
            createdAt: user.created_at,
            isOwner,
            statsPublic: user.stats_public,
        };

        if (user.stats_public || isOwner) {
            const [totals, tracks, artists] = await Promise.all([
                db.query('SELECT listened_seconds, room_sessions FROM listening_stats WHERE user_id = $1', [user.id]),
                db.query(
                    `SELECT video_id AS "videoId", title, artist, listened_seconds AS "listenedSeconds"
                     FROM listening_tracks WHERE user_id = $1
                     ORDER BY listened_seconds DESC LIMIT 5`,
                    [user.id]
                ),
                db.query(
                    `SELECT artist, SUM(listened_seconds) AS "listenedSeconds"
                     FROM listening_tracks WHERE user_id = $1
                     GROUP BY artist ORDER BY SUM(listened_seconds) DESC LIMIT 5`,
                    [user.id]
                ),
            ]);
            const stats = totals.rows[0] || { listened_seconds: 0, room_sessions: 0 };
            profile.stats = {
                listenedMinutes: Math.floor(Number(stats.listened_seconds) / 60),
                roomSessions: Number(stats.room_sessions),
                topArtists: artists.rows.map((artist: any) => ({
                    ...artist,
                    listenedMinutes: Math.floor(Number(artist.listenedSeconds) / 60),
                })),
                topTracks: tracks.rows.map((track: any) => ({
                    ...track,
                    listenedMinutes: Math.floor(Number(track.listenedSeconds) / 60),
                })),
            };
        }
        return res.json(profile);
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ message: 'Could not load profile' });
    }
};

export const updateProfile = async (req: any, res: any) => {
    const displayName = typeof req.body.displayName === 'string' ? req.body.displayName.trim() : '';
    const bio = typeof req.body.bio === 'string' ? req.body.bio.trim() : '';
    const statsPublic = req.body.statsPublic;
    if (displayName.length < 1 || displayName.length > 80 || bio.length > 280 || typeof statsPublic !== 'boolean') {
        return res.status(400).json({ message: 'Display name, bio, or statistics visibility is invalid' });
    }

    try {
        await db.query(
            'UPDATE users SET display_name = $1, bio = $2, stats_public = $3 WHERE id = $4',
            [displayName, bio, statsPublic, req.userId]
        );
        return res.json({ success: true });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ message: 'Could not update profile' });
    }
};
