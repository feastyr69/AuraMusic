const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
neonConfig.webSocketConstructor = ws;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE,
                password VARCHAR(255),
                google_id VARCHAR(255) UNIQUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
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
        console.log("Database tables initialized.");
    } catch (err) {
        console.error("Error initializing database tables:", err);
    }
};

module.exports = {
    query: (text, params) => pool.query(text, params),
    initDb,
};
