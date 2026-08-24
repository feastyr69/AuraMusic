import React, { useState, useEffect, useContext } from 'react'
import { IoMdAdd, IoMdLogIn, IoMdClose } from "react-icons/io";
import Navbar from '../components/common/Navbar'
import { apiBaseURL } from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import generateUserName from '../utils/nameGenerator';
import { AnimatePresence, motion } from 'motion/react';
import toast from 'react-hot-toast';

const Create = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [activeRooms, setActiveRooms] = useState<any[]>([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchActiveRooms = async () => {
            try {
                const response = await apiBaseURL.get("/active");
                setActiveRooms(response.data);
            } catch (error) {
                console.error("Error fetching active rooms:", error);
            }
        };
        fetchActiveRooms();
    }, []);

    const createRoom = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setIsModalOpen(false);
        const userName = user?.google_name || user?.username || localStorage.getItem("userName") || generateUserName();
        let sessionId = localStorage.getItem("sessionId");
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem("sessionId", sessionId);
        }

        try {
            const response = await apiBaseURL.post("/create", {
                roomName: roomName || "Public Room",
                createdBy: userName,
                sessionId: sessionId
            });
            const roomData = response.data;
            navigate(`/jam/${roomData.roomId}`);
        } catch (error: any) {
            if (error.response && error.response.status === 400) {
                toast.error(error.response.data.message, { duration: 5000 });
            } else {
                toast.error("Failed to create room. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }
    return (
        <>
            <Navbar />

            {/* Fullscreen Loading Overlay */}
            {loading && (
                <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-md'>
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-zinc-600 border-t-aura-400"></div>
                        <p className="text-zinc-400 text-sm text-center max-w-xs mt-3 leading-relaxed">
                            Creating room...<br></br> (This may take a minute to start the server)
                        </p>
                    </div>
                </div>
            )}

            {/* Create Room Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-md bg-zinc-900/90 border border-white/10 rounded-3xl p-8 shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-linear-to-br from-aura-400/5 to-transparent pointer-events-none" />
                            <div className="relative flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="font-display text-2xl font-semibold text-zinc-100 mb-1">CREATE ROOM</h2>
                                    <p className="text-zinc-400 text-sm leading-relaxed max-w-[280px]">
                                        Give your room a name so others know what kind of vibe you're setting up.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 -mt-1 -mr-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                >
                                    <IoMdClose size={20} />
                                </button>
                            </div>
                            <form onSubmit={createRoom} className="relative flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="roomName" className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                                        Room Name (Optional):
                                    </label>
                                    <input
                                        id="roomName"
                                        type="text"
                                        autoFocus
                                        placeholder="e.g. Late Night Vibes"
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-aura-400/50 focus:border-aura-400/50 transition-all placeholder:text-zinc-600"
                                    />
                                </div>
                                <div className="flex gap-3 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-300 font-semibold text-sm hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 rounded-xl bg-aura-400 hover:bg-aura-300 text-zinc-950 font-semibold text-sm shadow-[0_0_20px_rgba(212,165,116,0.2)] transition-colors"
                                    >
                                        Create Room
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="flex flex-col items-center justify-center w-full mt-2 px-4 pb-16">
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
                                onClick={() => setIsModalOpen(true)}
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
                                className="mt-8 p-4 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-500 cursor-not-allowed flex items-center gap-2"
                                aria-disabled="true"
                            >
                                <IoMdAdd className="size-8 opacity-50" />
                            </button>
                        </div>
                    </div>

                    {/* Active Rooms Section */}
                    <div className="w-full mt-16 pt-8 border-t border-white/10">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="font-display text-2xl font-semibold text-zinc-100 tracking-tight">Active Public Rooms</h2>
                            <span className="text-xs uppercase tracking-widest text-aura-400 font-semibold">{activeRooms.length} Room(s)</span>
                        </div>

                        {activeRooms.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeRooms.map((room) => (
                                    <div key={room.roomId} className="flex flex-col justify-between p-6 bg-white/[0.03] border border-white/[0.08] hover:border-aura-400/30 rounded-2xl transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-display text-xl font-semibold text-white/90 truncate pr-2">{room.roomName}</h3>
                                                <span className="shrink-0 flex h-6 items-center rounded-full bg-aura-400/10 px-2 text-[10px] font-medium text-aura-300 ring-1 ring-inset ring-aura-400/20">
                                                    {room.userCount || 0} users
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-400 mb-1 truncate">Created by: <span className="text-zinc-300 font-medium">{room.createdBy}</span></p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/jam/${room.roomId}`)}
                                            className="mt-6 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-aura-400/10 hover:text-aura-300 hover:border-aura-400/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider cursor-pointer"
                                        >
                                            <IoMdLogIn size={18} />
                                            Join Room
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl border border-white/[0.04] bg-white/[0.02]">
                                <p className="text-zinc-500 text-sm md:text-base text-center">
                                    No public rooms are active right now. <br className="hidden md:block" /> Be the first to start a room and invite others!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Create

