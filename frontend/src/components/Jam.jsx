import React, { useState, useRef } from 'react'
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
    const [showPlayer, setShowPlayer] = useState(false);

    return (
        <>
            <Navbar />
            <div className="relative w-full flex justify-center overflow-hidden">
                {!showPlayer ? <button onClick={() => setShowPlayer(true)} className='group relative flex flex-col w-full max-w-md mt-10 min-h-88 p-8 bg-white/4 hover:bg-white/3 rounded-2xl border border-white/12 shadow-[0_12px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl justify-between text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 hover:cursor-pointer'>
                    <div className='absolute inset-0 rounded-2xl bg-linear-to-br from-white/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />

                    <div className='relative flex flex-col gap-4'>
                        <span className='inline-flex w-fit items-center rounded-full border border-white/20 bg-white/4 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/70'>
                            ROOM ID: {roomId}
                        </span>
                        <h1 className='text-3xl font-display font-bold uppercase tracking-tight text-white/90 group-hover:text-white transition-colors duration-300'>
                            Enter Room
                        </h1>
                        <p className='max-w-sm text-sm md:text-base text-white/65 leading-relaxed'>
                            Join the room to chat, queue songs, and keep the music flowing together.
                        </p>
                    </div>

                    <div className='relative flex items-center justify-between pt-8 border-t border-white/10'>
                        <span className='text-sm font-semibold uppercase tracking-[0.08em] text-white/80 group-hover:text-white transition-colors duration-300'>
                            Join now
                        </span>
                        <span className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/6 text-white/90 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white/12 group-hover:text-white'>
                            <IoChevronForward size={18} />
                        </span>
                    </div>
                </button>
                    :

                    <div
                        className="flex flex-row w-full items-center justify-start xl:justify-center mt-8 lg:m-8 p-10 overflow-x-auto overflow-y-clip snap-x snap-mandatory gap-4 no-scrollbar "
                    >
                        <>
                            <div className="snap-center shrink-0">
                                <Chat roomId={roomId} sessionId={sessionId} userName={userName} socket={socket} />
                            </div>

                            <div className='snap-center shrink-1 w-[90%] md:w-full max-w-120 min-w-80'>


                                <Player roomId={roomId} sessionId={sessionId} userName={userName} socket={socket} />

                            </div>

                            <div className="snap-center shrink-0">
                                <Queue roomId={roomId} sessionId={sessionId} userName={userName} socket={socket} />
                            </div>
                        </>

                    </div>
                }
            </div>
        </>
    )
}