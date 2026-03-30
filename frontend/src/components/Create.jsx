import React from 'react'
import { IoMdAdd } from "react-icons/io";
import Navbar from './Navbar'
import { apiBaseURL } from '../axiosInstance';
import { useNavigate } from 'react-router-dom';

const Create = () => {
    const navigate = useNavigate();
    const createRoom = async () => {
        const response = await apiBaseURL.get("/create");
        const roomData = response.data;
        navigate(`/jam/${roomData.roomId}`);
    }
    return (
        <>
            <Navbar />
            <div className="flex items-center justify-center w-full mt-2 px-4 pb-16">
                <div className="w-full max-w-5xl">
                    <div className="text-center pt-8 md:pt-12">
                        <p className="font-display text-xs uppercase tracking-[0.35em] text-aura-400/90 mb-3">aura.</p>
                        <h1 className="font-display text-3xl md:text-4xl font-semibold text-zinc-100 tracking-tight">Start a room</h1>
                        <p className="mt-2 text-zinc-500 text-sm md:text-base max-w-md mx-auto">
                            Choose how you want to listen. Public rooms are ready now; private rooms are on the way.
                        </p>
                    </div>
                    <div className="w-full min-h-[calc(70vh-8rem)] md:min-h-[420px] flex md:flex-row flex-col items-stretch gap-4 md:gap-0 mt-10 m-auto rounded-3xl overflow-hidden bg-white/[0.03] border border-white/[0.08] shadow-[0_12px_48px_rgba(0,0,0,0.35)]">
                        <div className="flex flex-col justify-center items-center flex-1 py-12 md:py-16 px-8 border-b md:border-b-0 md:border-r border-white/[0.08] bg-linear-to-b md:bg-linear-to-r from-aura-400/[0.06] to-transparent">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-aura-400/90 mb-2">Available</span>
                            <h2 className="font-display text-2xl md:text-3xl font-semibold text-zinc-100 text-center">Public room</h2>
                            <p className="text-zinc-400 text-sm text-center max-w-xs mt-3 leading-relaxed">
                                Anyone with the room link can join. Perfect for open listening sessions with friends.
                            </p>
                            <button
                                type="button"
                                className="mt-8 p-4 rounded-full bg-aura-400/15 border border-aura-400/35 text-aura-300 hover:bg-aura-400/25 hover:border-aura-400/50 hover:scale-105 shadow-[0_0_28px_rgba(212,165,116,0.1)] transition duration-300 cursor-pointer"
                                onClick={createRoom}
                                aria-label="Create public room"
                            >
                                <IoMdAdd className="size-12 md:size-14" />
                            </button>
                        </div>
                        <div className="flex flex-col justify-center items-center flex-1 py-12 md:py-16 px-8 opacity-70">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Soon</span>
                            <h2 className="font-display text-2xl md:text-3xl font-semibold text-zinc-300 text-center">Private room</h2>
                            <p className="text-zinc-500 text-sm text-center max-w-xs mt-3 leading-relaxed">
                                Invite-only listening with stricter controls. Coming in a future update.
                            </p>
                            <button
                                type="button"
                                disabled
                                className="mt-8 p-4 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-500 cursor-not-allowed"
                                aria-disabled="true"
                            >
                                <IoMdAdd className="size-12 md:size-14 opacity-50" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Create
