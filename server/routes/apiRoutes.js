const express = require("express");
const router = express.Router();
const { createRoom, getRoomInfo } = require("../services/chatService");
const { searchSong } = require("../services/ytMusic");


router.get("/create", createRoom);
router.get("/search", searchSong);
router.get("/room/:roomId", getRoomInfo);
module.exports = router;