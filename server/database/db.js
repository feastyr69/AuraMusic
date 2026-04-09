const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
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