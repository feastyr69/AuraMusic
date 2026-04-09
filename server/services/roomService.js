const {redisClient} = require("../config/redis");

const joinUser = async (roomId, userId, userName) =>{
    const roomKey = `room:${roomId}:users`;
    try{
        await redisClient.rPush(roomKey, JSON.stringify({userId, userName}));
    }catch(err){
        console.log(err);
    }
}

const getUsersInRoom = async (roomId) =>{
    const roomKey = `room:${roomId}:users`;
    try{
        const rawUsers = await redisClient.lRange(roomKey, 0, -1);
        return rawUsers.map(user => JSON.parse(user));
    }catch(err){
        console.log(err);
        return [];
    }
}

const removeUser = async (roomId, userId, userName) =>{
    const roomKey = `room:${roomId}:users`;
    try{
        await redisClient.lRem(roomKey, 1, JSON.stringify({userId, userName}));
        console.log("User removed:", userName);
    }catch(err){
        console.log(err);
    }
}

module.exports = {joinUser, getUsersInRoom, removeUser};