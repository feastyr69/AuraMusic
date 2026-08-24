"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const { redisClient } = require("../config/redis");
const searchSong = async (req, res) => {
    try {
        const songName = req.query.query;
        const cachedData = await redisClient.get(`search:${songName}`);
        if (cachedData) {
            return res.status(200).json(JSON.parse(cachedData));
        }
        const { default: YTMusic } = await Promise.resolve().then(() => __importStar(require("ytmusic-api")));
        const ytmusic = new YTMusic();
        await ytmusic.initialize();
        const data = await ytmusic.searchSongs(songName);
        const searchKey = `search:${songName}`;
        await redisClient.set(searchKey, JSON.stringify(data));
        await redisClient.expire(searchKey, 60 * 60);
        return res.status(200).json(data);
    }
    catch (err) {
        return res.status(500).json([]);
    }
};
const cueSong = async (roomId, songObj) => {
    try {
        const cueKey = `room:${roomId}:cue`;
        await redisClient.rPush(cueKey, JSON.stringify(songObj));
        await redisClient.expire(cueKey, 60 * 60);
        return songObj;
    }
    catch (err) {
        console.error("Error searching song:", err);
        return [];
    }
};
const getQueue = async (roomId) => {
    try {
        const cueKey = `room:${roomId}:cue`;
        const data = await redisClient.lRange(cueKey, 0, -1);
        return data.map((item) => JSON.parse(item));
    }
    catch (err) {
        console.error("Error cueing song:", err);
        return [];
    }
};
const nextSong = async (roomId) => {
    try {
        const cueKey = `room:${roomId}:cue`;
        await redisClient.lPop(cueKey);
        const data = await getQueue(roomId);
        return data;
    }
    catch (err) {
        console.error("Error moving to next song:", err);
        return [];
    }
};
const removeSong = async (roomId, index) => {
    try {
        const cueKey = `room:${roomId}:cue`;
        await redisClient.lSet(cueKey, index, "TO_DELETE");
        await redisClient.lRem(cueKey, 0, "TO_DELETE");
        const data = await getQueue(roomId);
        return data;
    }
    catch (err) {
        console.error("Error removing song:", err);
        return [];
    }
};
module.exports = { searchSong, cueSong, getQueue, nextSong, removeSong };
