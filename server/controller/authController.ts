const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const isValidUsername = (value) => /^[a-z0-9_]{3,20}$/.test(value);
const isValidEmail = (value) => value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const getAccessClaims = (user) => ({
    id: user.id,
    username: user.username,
    avatar_url: user.avatar_url,
    google_name: user.google_name,
});
const publicUserQuery = `SELECT id, username, google_id, created_at, avatar_url, google_name, display_name
                         FROM users WHERE id = $1`;

const generateTokens = (userPayload) => {
    const accessToken = jwt.sign(
        userPayload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        userPayload,
        process.env.JWT_REFRESH_SECRET || 'refresh_secret',
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
};

const getCookieConfig = () => {
    // RENDER env var is automatically set by Render.com — use it as the most reliable prod signal.
    // CLIENT_URL in the committed .env still points to localhost, so don't rely on it alone.
    const isProd = !!process.env.RENDER
        || process.env.NODE_ENV === 'production'
        || (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost'));
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
    };
};

const register = async (req, res) => {
    const username = typeof req.body.username === 'string' ? req.body.username.trim().toLowerCase() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const { password } = req.body;
    if (!isValidUsername(username)) {
        return res.status(400).json({ status: false, message: 'Username must use 3–20 letters, numbers, or underscores' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ status: false, message: 'Enter a valid email address' });
    }
    if (typeof password !== 'string' || password.length === 0) {
        return res.status(400).json({ status: false, message: 'Password is required' });
    }
    try {
        const existingUser = await db.query(
            'SELECT id FROM users WHERE lower(username) IN ($1, $2) OR lower(email) IN ($1, $2) OR lower(trim(legacy_username)) IN ($1, $2) LIMIT 1',
            [username, email]
        );
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ status: false, message: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username',
            [username, email, hashedPassword]
        );

        res.json({ status: true, message: "User created successfully", user: newUser.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ status: false, message: 'Username or email already exists' });
        }
        console.error("Register Error:", error);
        res.status(500).json({ status: false, message: "Server error" });
    }
};

const login = async (req, res) => {
    const rawIdentifier = typeof req.body.identifier === 'string'
        ? req.body.identifier
        : typeof req.body.username === 'string' ? req.body.username : '';
    const identifier = rawIdentifier.trim().toLowerCase();
    const { password } = req.body;
    if (!identifier || typeof password !== 'string' || !password) {
        return res.status(400).json({ status: false, message: 'Username or email and password are required' });
    }
    try {
        // Collision cleanup keeps each original handle private for exact legacy login.
        // Users are sent to username setup after login, where the alias is discarded.
        let user = await db.query(
            'SELECT * FROM users WHERE legacy_username = $1 LIMIT 1',
            [rawIdentifier]
        );
        if (user.rows.length === 0) {
            user = await db.query(
                'SELECT * FROM users WHERE lower(username) = $1 OR lower(email) = $1 LIMIT 2',
                [identifier]
            );
        }
        if (user.rows.length === 0) {
            return res.status(200).json({ status: false, message: "Invalid credentials" });
        }
        if (user.rows.length > 1) {
            return res.status(200).json({ status: false, message: "Invalid credentials" });
        }

        if (!user.rows[0].password) {
            return res.status(200).json({ status: false, message: "This account uses Google Login" });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(200).json({ status: false, message: "Invalid credentials" });
        }

        const { accessToken, refreshToken } = generateTokens(getAccessClaims(user.rows[0]));

        res.cookie('refreshToken', refreshToken, getCookieConfig());

        res.json({ status: true, token: accessToken, refreshToken, username: user.rows[0].username });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ status: false, message: "Server error" });
    }
};

const googleCallback = (req, res) => {
    if (!req.user) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=Authentication%20failed`);
    }

    const { accessToken, refreshToken } = generateTokens({ id: req.user.id, username: req.user.username, avatar_url: req.user.avatar_url, google_name: req.user.google_name });

    res.cookie('refreshToken', refreshToken, getCookieConfig());

    // Also pass refresh token in the URL so the frontend can store it in localStorage —
    // required for cross-domain deployments (Vercel + Render) where browsers block third-party cookies.
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${accessToken}&refresh=${refreshToken}`);
};

const refresh = async (req, res) => {
    // Prefer httpOnly cookie; fall back to body token for cross-domain setups
    // where browsers block third-party cookies (Vercel + Render, Safari ITP, etc.)
    const refreshToken = req.cookies.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ success: false, message: "No refresh token provided" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
        const userRes = await db.query(publicUserQuery, [decoded.id]);

        if (userRes.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid user" });
        }

        const { accessToken } = generateTokens(getAccessClaims(userRes.rows[0]));

        res.json({
            success: true,
            accessToken,
            user: userRes.rows[0]
        });
    } catch (err) {
        res.clearCookie('refreshToken', getCookieConfig());
        return res.status(403).json({ success: false, message: "Invalid refresh token" });
    }
};

const logout = (req, res) => {
    res.clearCookie('refreshToken', getCookieConfig());
    res.json({ success: true, message: "Logged out successfully" });
};

const checkStatus = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            const userRes = await db.query(publicUserQuery, [decoded.id]);
            if (userRes.rows.length > 0) {
                return res.json({
                    success: true,
                    user: userRes.rows[0]
                });
            }
        } catch (err) {
            console.error("JWT Verification failed in /status:", err.message);
        }
    }

    if (req.isAuthenticated() && req.user?.id) {
        const userRes = await db.query(publicUserQuery, [req.user.id]);
        if (userRes.rows.length) return res.json({ success: true, user: userRes.rows[0] });
    }
    return res.json({ success: false, user: null });
}

const setUsername = async (req, res) => {
    const token = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null;
    let claims;
    try {
        if (!token) throw new Error('Missing access token');
        claims = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (_error) {
        return res.status(401).json({ status: false, message: 'Sign in to set a username' });
    }

    const username = typeof req.body.username === 'string' ? req.body.username.trim().toLowerCase() : '';
    if (!isValidUsername(username)) {
        return res.status(400).json({ status: false, message: 'Username must use 3–20 letters, numbers, or underscores' });
    }

    try {
        const conflictingLegacy = await db.query(
            'SELECT id FROM users WHERE id <> $1 AND lower(trim(legacy_username)) = $2 LIMIT 1',
            [claims.id, username]
        );
        if (conflictingLegacy.rows.length) {
            return res.status(409).json({ status: false, message: 'Username already exists' });
        }
        const updated = await db.query(
            'UPDATE users SET username = $1, legacy_username = NULL WHERE id = $2 RETURNING id, username, google_id, created_at, avatar_url, google_name, display_name',
            [username, claims.id]
        );
        if (!updated.rows.length) return res.status(404).json({ status: false, message: 'Account not found' });

        const { accessToken, refreshToken } = generateTokens(getAccessClaims(updated.rows[0]));
        res.cookie('refreshToken', refreshToken, getCookieConfig());
        return res.json({ status: true, token: accessToken, refreshToken, user: updated.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ status: false, message: 'Username already exists' });
        }
        console.error('Set username error:', error);
        return res.status(500).json({ status: false, message: 'Could not set username' });
    }
};

module.exports = {
    register,
    login,
    googleCallback,
    checkStatus,
    refresh,
    logout,
    setUsername
};
