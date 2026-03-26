import React from 'react'
import Navbar from './Navbar'
import Chat from './Chat'
import Player from './Player'
import Queue from './Queue'
import { useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid';
import generateUserName from '../utils/nameGenerator';
import { io } from 'socket.io-client'

let sessionId = localStorage.getItem("sessionId");
let userName = localStorage.getItem("userName");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("Connected to server");
});


if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("sessionId", sessionId);
}

if (!userName) {
    userName = generateUserName();
    localStorage.setItem("userName", userName);
}

export default function Jam() {
    const { roomId } = useParams();

    return (
        <>
            <Navbar />
            <div className="flex flex-row items-center justify-center m-10">

                <Chat roomId={roomId} sessionId={sessionId} userName={userName} socket={socket} />

                <div className='w-full max-w-150 m-3'>
                    <Player roomId={roomId} sessionId={sessionId} userName={userName} />
                </div>
                <Queue roomId={roomId} sessionId={sessionId} userName={userName} />
            </div>
        </>
    )
}