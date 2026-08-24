"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveMessage = exports.getRoomHistory = void 0;
const { redisClient } = require("../config/redis");
const getRoomHistory = async (roomId) => {
    const roomKey = `room:${roomId}:messages`;
    try {
        const rawMessages = await redisClient.lRange(roomKey, 0, -1);
        return rawMessages.map((msg) => JSON.parse(msg));
    }
    catch (err) {
        console.error("Error getting room history:", err);
        return [];
    }
};
exports.getRoomHistory = getRoomHistory;
const saveMessage = async (roomId, msgObj) => {
    const roomKey = `room:${roomId}:messages`;
    const timestamp = Date.now();
    try {
        await redisClient.rPush(roomKey, JSON.stringify({ ...msgObj, timestamp }));
        await redisClient.expire(roomKey, 60 * 60);
    }
    catch (err) {
        console.error("Error saving message:", err);
    }
};
exports.saveMessage = saveMessage;
