import React, { useState, useRef } from 'react';
import YouTube from 'react-youtube';
import { IoPlay, IoPause, IoPlaySkipBack, IoPlaySkipForward, IoVolumeHigh, IoShuffle, IoRepeat } from 'react-icons/io5';

export default function Player({ roomId, sessionId, userName, socket }) {
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const cardRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(30);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const rotateY = -((mouseX / width) - 0.5) * 5;
        const rotateX = ((mouseY / height) - 0.5) * 5;

        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
    };

    return (
        <>
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    transition: rotation.x === 0 && rotation.y === 0 ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out',
                    transformStyle: 'preserve-3d'
                }}
                className='flex flex-col w-full h-120 p-6 bg-white/3 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md justify-between'
            >
                {/* Hidden YouTube Player */}
                <div className="absolute opacity-0 pointer-events-none">
                    <YouTube videoId="dQw4w9WgXcQ" opts={{
                        height: '1',
                        width: '1',
                        playerVars: {
                            playsinline: 1,
                            controls: 0,
                            disablekb: 1
                        }
                    }}
                        onReady={(event) => {
                            //event.target.playVideo();
                        }}
                    />
                </div>

                {/* Header */}
                <div className="flex justify-center items-center w-full mb-4">
                    <p className="text-xs uppercase tracking-widest text-white/50 font-semibold">Now Playing</p>
                    {/* <div className="flex gap-4 text-white/50">
                        <IoShuffle className="hover:text-white cursor-pointer transition" size={20} />
                        <IoRepeat className="hover:text-white cursor-pointer transition" size={20} />
                    </div> */}
                </div>

                {/* Album Art Container */}
                <div className="w-full flex-1 relative rounded-2xl overflow-hidden shadow-2xl mb-6 group border border-white/5 max-h-64 mx-auto max-w-72 bg-slate-900/50">
                    <img
                        src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop"
                        alt="Album Art"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                </div>

                {/* Song Info */}
                <div className="flex flex-col items-center mb-4 text-center w-full px-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight truncate w-full shadow-black">Never Gonna Give You Up</h2>
                    <p className="text-purple-300 font-medium text-sm mt-1 truncate w-full hover:underline cursor-pointer">Rick Astley</p>
                </div>

                {/* Playback Controls Area */}
                <div className="flex flex-col w-full mt-auto">
                    {/* Scrubber */}
                    <div className="w-full mb-4 px-2">
                        <div className="w-full h-[6px] bg-white/10 rounded-full cursor-pointer relative overflow-hidden group">
                            <div
                                className="absolute h-full bg-purple-500 rounded-full group-hover:bg-purple-400 transition-colors"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between w-full mt-2 text-[10px] text-white/40 font-medium tracking-wider">
                            <span>1:12</span>
                            <span>3:32</span>
                        </div>
                    </div>

                    {/* Main Controls */}
                    <div className="flex w-full items-center justify-between px-2 pt-1">
                        <button className="text-white/50 hover:text-white transition group w-8">
                            <IoVolumeHigh size={24} className="group-hover:scale-110 transition-transform" />
                        </button>

                        <div className="flex items-center gap-6">
                            <button className="text-white hover:text-purple-400 transition hover:scale-110 drop-shadow-lg">
                                <IoPlaySkipBack size={32} />
                            </button>

                            <button
                                className="w-16 h-16 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 hover:bg-purple-50 transition shadow-[0_0_30px_rgba(168,85,247,0.25)]"
                                onClick={() => setIsPlaying(!isPlaying)}
                            >
                                {isPlaying ? <IoPause size={30} className="text-slate-900" /> : <IoPlay size={32} className="ml-1 text-slate-900" />}
                            </button>

                            <button className="text-white hover:text-purple-400 transition hover:scale-110 drop-shadow-lg">
                                <IoPlaySkipForward size={32} />
                            </button>
                        </div>

                        <div className="w-8" /> {/* Spacer to balance volume icon */}
                    </div>
                </div>
            </div>
        </>
    )
}