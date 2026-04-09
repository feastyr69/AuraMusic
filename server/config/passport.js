const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../database/db');
const dotenv = require('dotenv');
dotenv.config({ path: "../.env" });

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'client_secret',
    callbackURL: "/api/auth/google/callback"
},
    async function (accessToken, refreshToken, profile, cb) {
        try {
            const avatarUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

            // Find user by google_id
            const userRes = await db.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);
            if (userRes.rows.length > 0) {
                // Update avatar_url if provided
                if (avatarUrl && userRes.rows[0].avatar_url !== avatarUrl) {
                    const updatedUser = await db.query(
                        'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING *',
                        [avatarUrl, userRes.rows[0].id]
                    );
                    return cb(null, updatedUser.rows[0]);
                }
                return cb(null, userRes.rows[0]);
            }

            // If not found, look up by email as username to link account or create new
            const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : `user_${profile.id}`;

            // Check if an account already exists with this email/username
            const existingUser = await db.query('SELECT * FROM users WHERE username = $1', [email]);
            if (existingUser.rows.length > 0) {
                // Update existing user with google_id
                const updatedUser = await db.query(
                    'UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE id = $3 RETURNING *',
                    [profile.id, avatarUrl, existingUser.rows[0].id]
                );
                return cb(null, updatedUser.rows[0]);
            }

            // Create new user
            const insertRes = await db.query(
                'INSERT INTO users (username, google_id, avatar_url) VALUES ($1, $2, $3) RETURNING *',
                [email, profile.id, avatarUrl]
            );
            return cb(null, insertRes.rows[0]);
        } catch (err) {
            return cb(err, null);
        }
    }
));

passport.serializeUser((user, done) => {
    console.log("SERIALIZING USER:", user.id);
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
