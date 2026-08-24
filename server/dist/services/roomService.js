"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUser = exports.getUsersInRoom = exports.joinUser = exports.deleteRoom = exports.getActiveRoomsList = exports.getRoomInfo = exports.getRoomInfoData = exports.createRoom = void 0;
const { redisClient } = require("../config/redis");
const { nanoid } = require("nanoid");
const getRoomKey = (roomId, suffix) => `room:${roomId}:${suffix}`;
const createRoom = async (req, res) => {
    try {
        const { roomName, createdBy } = req.body || {};
        const roomId = nanoid(10);
        await redisClient.zAdd("rooms", { score: Date.now(), value: roomId });
        await redisClient.hSet(getRoomKey(roomId, 'info'), {
            roomId: roomId,
            createdAt: Date.now().toString(),
            type: "public",
            roomName: roomName || "Public Room",
            createdBy: createdBy || "Anonymous"
        });
        await redisClient.expire(getRoomKey(roomId, 'info'), 3 * 60 * 60);
        return res.status(200).json({ roomId });
    }
    catch (error) {
        console.error("Error creating room:", error);
        return res.status(500).json({ status: "failed", message: "Error creating room" });
    }
};
exports.createRoom = createRoom;
const getRoomInfoData = async (roomId) => {
    try {
        const roomData = await redisClient.hmGet(getRoomKey(roomId, 'info'), ["roomId", "createdAt", "type", "roomName", "createdBy"]);
        if (roomData[0]) {
            return {
                roomId: roomData[0],
                createdAt: parseInt(roomData[1]),
                type: roomData[2],
                roomName: roomData[3] || "Unnamed Room",
                createdBy: roomData[4] || "Unknown",
                success: true
            };
        }
        return { roomId: '', createdAt: 0, type: '', success: false };
    }
    catch (error) {
        console.error("Error getting room info:", error);
        return { roomId: '', createdAt: 0, type: '', success: false, error: "Error checking room" };
    }
};
exports.getRoomInfoData = getRoomInfoData;
const getRoomInfo = async (req, res) => {
    try {
        const { roomId } = req.params;
        const info = await (0, exports.getRoomInfoData)(roomId);
        if (info.success) {
            return res.status(200).json(info);
        }
        return res.status(200).json({ success: false });
    }
    catch (error) {
        console.error("Error checking room:", error);
        return res.status(500).json({ status: "failed", message: "Error checking room" });
    }
};
exports.getRoomInfo = getRoomInfo;
const getActiveRoomsList = async (req, res) => {
    try {
        const roomIds = await redisClient.zRange("rooms", 0, -1);
        const activeRooms = [];
        for (const id of roomIds) {
            const info = await (0, exports.getRoomInfoData)(id);
            if (info.success && info.type === "public") {
                const users = await redisClient.lRange(getRoomKey(id, 'users'), 0, -1);
                activeRooms.push({ ...info, userCount: users.length });
            }
            else if (!info.success) {
                await redisClient.zRem("rooms", id);
            }
        }
        return res.status(200).json(activeRooms.reverse());
    }
    catch (error) {
        console.error("Error fetching active rooms list:", error);
        return res.status(500).json({ status: "failed", message: "Error fetching active rooms" });
    }
};
exports.getActiveRoomsList = getActiveRoomsList;
const deleteRoom = async (roomId) => {
    try {
        await redisClient.zRem("rooms", roomId);
        await redisClient.del(getRoomKey(roomId, 'info'));
        await redisClient.del(getRoomKey(roomId, 'users'));
        await redisClient.del(getRoomKey(roomId, 'messages'));
        await redisClient.del(getRoomKey(roomId, 'cue'));
        console.log(`Room ${roomId} deleted successfully due to inactivity.`);
    }
    catch (error) {
        console.error("Error deleting room:", error);
    }
};
exports.deleteRoom = deleteRoom;
const joinUser = async (roomId, userId, userName, avatarUrl) => {
    try {
        const user = { userId, userName, avatarUrl };
        await redisClient.rPush(getRoomKey(roomId, 'users'), JSON.stringify(user));
    }
    catch (err) {
        console.error("Error joining user:", err);
    }
};
exports.joinUser = joinUser;
const getUsersInRoom = async (roomId) => {
    try {
        const rawUsers = await redisClient.lRange(getRoomKey(roomId, 'users'), 0, -1);
        return rawUsers.map((user) => JSON.parse(user));
    }
    catch (err) {
        console.error("Error getting users in room:", err);
        return [];
    }
};
exports.getUsersInRoom = getUsersInRoom;
const removeUser = async (roomId, userId, userName, avatarUrl) => {
    try {
        const user = { userId, userName, avatarUrl };
        await redisClient.lRem(getRoomKey(roomId, 'users'), 1, JSON.stringify(user));
    }
    catch (err) {
        console.error("Error removing user:", err);
    }
};
exports.removeUser = removeUser;
