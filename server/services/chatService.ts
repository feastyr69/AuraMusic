import { Message } from '../types';
const { redisClient } = require("../config/redis");

export const getRoomHistory = async (roomId: string): Promise<Message[]> => {
    const roomKey = `room:${roomId}:messages`;
    try {
        const rawMessages = await redisClient.lRange(roomKey, 0, -1);
        return rawMessages.map((msg: string) => JSON.parse(msg));
    } catch(err) {
        console.error("Error getting room history:", err);
        return [];
    }
}

export const saveMessage = async (roomId: string, msgObj: Message) => {
    const roomKey = `room:${roomId}:messages`;
    const timestamp = Date.now();
    try {
        await redisClient.rPush(roomKey, JSON.stringify({ ...msgObj, timestamp }));
        await redisClient.expire(roomKey, 60 * 60);
    } catch (err) {
        console.error("Error saving message:", err);
    }
}