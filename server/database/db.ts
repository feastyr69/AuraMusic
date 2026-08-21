const { Pool } = require('@neondatabase/serverless');

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