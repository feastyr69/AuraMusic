"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const { createRoom, getRoomInfo, getActiveRoomsList } = require("../services/roomService");
const { searchSong } = require("../services/ytMusic");
const axios = require("axios");
router.post("/create", createRoom);
router.get("/active", getActiveRoomsList);
router.get("/search", searchSong);
router.get("/room/:roomId", getRoomInfo);
// Image proxy to bypass CORS for WebGL textures
router.get("/proxy-image", async (req, res) => {
    try {
        if (!req.query.url)
            return res.status(400).send("No URL provided");
        const response = await axios.get(req.query.url, { responseType: 'stream' });
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    }
    catch (error) {
        console.error("Image proxy error:", error.message);
        res.status(500).send("Error proxying image");
    }
});
module.exports = router;
