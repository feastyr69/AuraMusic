const express = require('express');
const router = express.Router();
const passport = require('../config/passport');

const { register, login, googleCallback, checkStatus, refresh, logout, setUsername } = require('../controller/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.patch('/username', setUsername);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL + '/login?error=true', session: false }),
    googleCallback
);

router.get('/status', checkStatus)


module.exports = router;
