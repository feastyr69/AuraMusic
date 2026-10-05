const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
neonConfig.webSocketConstructor = ws;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

const initDb = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE,
                password VARCHAR(255),
                google_id VARCHAR(255) UNIQUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS legacy_username VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS google_name VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(80);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(280) NOT NULL DEFAULT '';
            ALTER TABLE users ADD COLUMN IF NOT EXISTS stats_public BOOLEAN NOT NULL DEFAULT TRUE;
            CREATE TABLE IF NOT EXISTS listening_stats (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                listened_seconds BIGINT NOT NULL DEFAULT 0,
                room_sessions BIGINT NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS listening_tracks (
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                video_id VARCHAR(32) NOT NULL,
                title VARCHAR(255) NOT NULL,
                artist VARCHAR(255) NOT NULL,
                listened_seconds BIGINT NOT NULL DEFAULT 0,
                PRIMARY KEY (user_id, video_id)
            );
        `);

        // Google accounts used email as username before usernames became configurable.
        await client.query(`
            UPDATE users
            SET email = lower(trim(username))
            WHERE google_id IS NOT NULL AND email IS NULL AND username IS NOT NULL;
        `);

        const emailCollisions = await client.query(`
            SELECT array_agg(id ORDER BY id) AS user_ids
            FROM users WHERE email IS NOT NULL
            GROUP BY lower(email) HAVING COUNT(*) > 1;
        `);
        if (emailCollisions.rows.length) {
            throw new Error(`Email case collisions need resolution: ${JSON.stringify(emailCollisions.rows)}`);
        }

        const identifierCollisions = await client.query(`
            SELECT u.id AS username_user_id, e.id AS email_user_id
            FROM users u JOIN users e ON lower(trim(u.username)) = lower(trim(e.email)) AND u.id <> e.id
            WHERE u.username IS NOT NULL
              AND NOT (u.google_id IS NOT NULL AND u.password IS NULL)
            LIMIT 10;
        `);
        if (identifierCollisions.rows.length) {
            throw new Error(`Username/email identifier collisions need resolution: ${JSON.stringify(identifierCollisions.rows)}`);
        }

        await client.query(`
            UPDATE users SET username = NULL
            WHERE google_id IS NOT NULL AND password IS NULL AND email IS NOT NULL;
            WITH collision_groups AS (
                SELECT lower(trim(username)) AS normalized_username
                FROM users
                WHERE username IS NOT NULL
                GROUP BY lower(trim(username))
                HAVING COUNT(*) > 1
            )
            UPDATE users AS u
            SET legacy_username = u.username, username = NULL
            FROM collision_groups AS c
            WHERE lower(trim(u.username)) = c.normalized_username;
            UPDATE users SET username = lower(trim(username)) WHERE username IS NOT NULL;
            CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_unique
                ON users (lower(username)) WHERE username IS NOT NULL;
            CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
                ON users (lower(email)) WHERE email IS NOT NULL;
            CREATE UNIQUE INDEX IF NOT EXISTS users_legacy_username_unique
                ON users (legacy_username) WHERE legacy_username IS NOT NULL;
        `);
        console.log("Database tables initialized.");
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error initializing database tables:", err);
        throw err;
    } finally {
        client.release();
    }
};

module.exports = {
    query: (text, params) => pool.query(text, params),
    initDb,
};
