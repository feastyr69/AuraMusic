const {redisClient} = require("../config/redis");

const joinUser = async (roomId, userId, userName, avatarUrl) =>{
    const roomKey = `room:${roomId}:users`;
    try{
        await redisClient.rPush(roomKey, JSON.stringify({userId, userName, avatarUrl}));
    }catch(err){
        console.error("Error joining user:", err);
    }
}

const getUsersInRoom = async (roomId) =>{
    const roomKey = `room:${roomId}:users`;
    try{
        const rawUsers = await redisClient.lRange(roomKey, 0, -1);
        return rawUsers.map(user => JSON.parse(user));
    }catch(err){
        console.error("Error getting users in room:", err);
        return [];
    }
}

const removeUser = async (roomId, userId, userName, avatarUrl) =>{
    const roomKey = `room:${roomId}:users`;
    try{
        await redisClient.lRem(roomKey, 1, JSON.stringify({userId, userName, avatarUrl}));

    }catch(err){
        console.error("Error removing user:", err);
    }
}

module.exports = {joinUser, getUsersInRoom, removeUser};