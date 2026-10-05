const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../database/db');
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'client_secret',
    callbackURL: "/api/auth/google/callback",
    proxy: true
},
    async function (accessToken, refreshToken, profile, cb) {

        try {
            const avatarUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
            let googleName = profile.displayName;
            if (!googleName && profile.name) {
                googleName = `${profile.name.givenName || ''} ${profile.name.familyName || ''}`.trim() || null;
            }

            // Find user by google_id
            const userRes = await db.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);
            if (userRes.rows.length > 0) {
                // Update avatar_url if provided
                if ((avatarUrl && userRes.rows[0].avatar_url !== avatarUrl) || (googleName && userRes.rows[0].google_name !== googleName)) {
                    const updatedUser = await db.query(
                        'UPDATE users SET avatar_url = COALESCE($1, avatar_url), google_name = COALESCE($2, google_name) WHERE id = $3 RETURNING *',
                        [avatarUrl, googleName, userRes.rows[0].id]
                    );
                    return cb(null, updatedUser.rows[0]);
                }
                return cb(null, userRes.rows[0]);
            }

            // If not found, look up by email as username to link account or create new
            const email = profile.emails?.[0]?.value?.trim().toLowerCase();
            if (!email) return cb(new Error('Google did not provide an email address'), null);

            // Preserve existing account linking while keeping email separate from username.
            const existingUser = await db.query(
                'SELECT * FROM users WHERE lower(email) = $1 OR lower(username) = $1 LIMIT 2',
                [email]
            );
            if (existingUser.rows.length > 1) {
                return cb(new Error('Multiple accounts match this Google email'), null);
            }
            if (existingUser.rows.length === 1) {
                // Update existing user with google_id
                const updatedUser = await db.query(
                    'UPDATE users SET google_id = $1, email = COALESCE(email, $2), avatar_url = COALESCE(avatar_url, $3), google_name = COALESCE(google_name, $4) WHERE id = $5 RETURNING *',
                    [profile.id, email, avatarUrl, googleName, existingUser.rows[0].id]
                );
                return cb(null, updatedUser.rows[0]);
            }

            // Create new user
            const insertRes = await db.query(
                'INSERT INTO users (email, google_id, avatar_url, google_name) VALUES ($1, $2, $3, $4) RETURNING *',
                [email, profile.id, avatarUrl, googleName]
            );
            return cb(null, insertRes.rows[0]);
        } catch (err) {
            return cb(err, null);
        }
    }
));

passport.serializeUser((user, done) => {

    done(null, user.id); // Storing just the ID in the cookie session
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, user.rows[0]);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
