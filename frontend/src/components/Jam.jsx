import React, { useRef } from 'react'
import Navbar from './Navbar'
import Chat from './Chat'
import Player from './Player'
import Queue from './Queue'
import { useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid';
import generateUserName from '../utils/nameGenerator';
import { io } from 'socket.io-client'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { animate } from 'motion';

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
            <div className="relative w-full flex justify-center overflow-hidden">

                <div
                    className="flex flex-row w-full items-center justify-start xl:justify-center mt-8 lg:m-8 p-10 overflow-x-auto overflow-y-clip snap-x snap-mandatory gap-4"
                >
                    <div className="snap-center shrink-0">
                        <Chat roomId={roomId} sessionId={sessionId} userName={userName} socket={socket} />
                    </div>

                    <div className='snap-center shrink-1 w-[90%] md:w-full max-w-120 min-w-80'>
                        <Player roomId={roomId} sessionId={sessionId} userName={userName} socket={socket} />
                    </div>

                    <div className="snap-center shrink-0">
                        <Queue roomId={roomId} sessionId={sessionId} userName={userName} socket={socket} />
                    </div>
                </div>
            </div>
        </>
    )
}