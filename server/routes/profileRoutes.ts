const express = require('express');
const jwt = require('jsonwebtoken');
const { getProfile, updateProfile } = require('../controller/profileController');
const router = express.Router();

const optionalAuth = (req: any, _res: any, next: any) => {
    const token = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null;
    if (token) {
        try {
            req.userId = jwt.verify(token, process.env.JWT_SECRET || 'secret').id;
        } catch (_error) {
            // Public profile reads remain available when a visitor has no valid token.
        }
    }
    next();
};

const requireAuth = (req: any, res: any, next: any) => {
    optionalAuth(req, res, () => {
        if (!req.userId) return res.status(401).json({ message: 'Sign in to update your profile' });
        next();
    });
};

router.get('/:username', optionalAuth, getProfile);
router.patch('/me', requireAuth, updateProfile);

module.exports = router;
