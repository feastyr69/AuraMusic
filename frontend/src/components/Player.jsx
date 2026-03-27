import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { IoPlay, IoPause, IoPlaySkipBack, IoPlaySkipForward, IoVolumeHigh, IoShuffle, IoRepeat } from 'react-icons/io5';
import { PiVinylRecordLight } from 'react-icons/pi';

export default function Player({ roomId, sessionId, userName, socket }) {


    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const cardRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

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

    const playerRef = useRef(null);
    const progressInterval = useRef(null);
    const onReady = (event) => {
        playerRef.current = event.target;
        console.log(playerRef.current);
        playerRef.current.setPlaybackQuality('small');
        setIsPlayerReady(true);
    }

    const handlePlay = () => {
        playerRef.current.playVideo();
        setIsPlaying(true);
    }

    const handlePause = () => {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
    }

    const handleSeek = (sec) => {
        const newProgress = parseFloat(sec.target.value);
        playerRef.current.seekTo(newProgress);
        setProgress(newProgress);
    }

    const handlePlayPause = () => {
        const data = {
            videoId: currentSong.videoId,
            isPlaying: !isPlaying,
            time: progress
        }
        if (isPlaying) {
            clearInterval(progressInterval.current);
            handlePause();
        } else {
            progressInterval.current = setInterval(() => {
                setProgress(playerRef.current.getCurrentTime());
                if (playerRef.current.getCurrentTime() >= currentSong.duration - 1) {
                    clearInterval(progressInterval.current);
                    socket.emit('next-song', roomId);
                }
            }, 1000);
            handlePlay();
        }
        // socket.emit('play-pause', data);
    }

    const handleKeyControls = (e) => {
        if (e.key === ' ') {
            handlePlayPause();
        }
    }

    useEffect(() => {
        socket.on('current-song', (data) => {
            console.log(data);
            setCurrentSong(data);
            setProgress(0);
        })
        socket.on('receive-sync-song', (data) => {
            console.log(data);
            const { videoId, isPlaying, time } = data;
            setCurrentSong(videoId);
            clearInterval(progressInterval.current);
            const newProgress = parseFloat(time);
            playerRef.current.seekTo(newProgress);
            setProgress(newProgress);
            setIsPlaying(isPlaying);
            if (isPlaying) {
                handlePlay();
                progressInterval.current = setInterval(() => {
                    setProgress(playerRef.current.getCurrentTime());
                    if (playerRef.current.getCurrentTime() >= currentSong.duration - 1) {
                        clearInterval(progressInterval.current);
                        socket.emit('next-song', roomId);
                    }
                }, 1000);
            } else {
                handlePause();
            }
        })
        return () => {
            socket.off('current-song');
            socket.off('receive-sync-song');
        }
    }, [roomId])

    return (
        <>
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onKeyDown={handleKeyControls}
                tabIndex={0}
                style={{
                    transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    transition: rotation.x === 0 && rotation.y === 0 ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out',
                    transformStyle: 'preserve-3d'
                }}
                className='flex flex-col w-full h-120 p-6 bg-white/3 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md justify-between'
            >
                {/* Hidden YouTube Player */}
                <div className="absolute opacity-100 pointer-events-none">
                    {currentSong && <YouTube videoId={currentSong.videoId} opts={{
                        height: '100',
                        width: '100',
                        playerVars: {
                            autoplay: 1,
                            playsinline: 1,
                            controls: 0,
                            disablekb: 1,
                        }
                    }}
                        onReady={onReady}
                    />}
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
                    {currentSong && <img
                        src={`https://i.ytimg.com/vi/${currentSong.videoId}/mqdefault.jpg`}
                        alt="Album Art"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                    />}
                    <div className="absolute flex items-center justify-center inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none">
                        {!currentSong && <PiVinylRecordLight className="text-white/50" size={120} />}
                    </div>
                </div>

                {/* Song Info */}
                <div className="flex flex-col items-center mb-4 text-center w-full px-2">
                    {currentSong ? (
                        <>
                            <h2 className="text-2xl font-bold text-white tracking-tight truncate w-full shadow-black">{currentSong.name}</h2>
                            <p className="text-purple-300 font-medium text-sm mt-1 truncate w-full">{currentSong.artist.name}</p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-white tracking-tight truncate w-full shadow-black">No song playing</h2>
                            <p className="text-purple-300 font-medium text-sm mt-1 truncate w-full">No artist</p>
                        </>
                    )}
                </div>

                {/* Playback Controls Area */}
                <div className="flex flex-col w-full mt-auto">
                    {/* Scrubber */}
                    <div className="w-full mb-4 px-2">
                        <div className="w-full h-[6px] bg-white/10 rounded-full relative overflow-hidden group">
                            <input
                                type="range"
                                min="0"
                                max={currentSong ? currentSong.duration : 0}
                                value={progress}
                                onChange={handleSeek}
                                className="absolute h-full w-full bg-purple-500 rounded-full group-hover:bg-purple-400 transition-colors cursor-pointer"
                            />
                        </div>
                        <div className="flex justify-between w-full mt-2 text-[10px] text-white/40 font-medium tracking-wider">
                            {currentSong ? <span>
                                {Math.floor(progress / 60)}:
                                {Math.floor(progress % 60).toString().padStart(2, '0')}
                            </span> : <span>- : -</span>}
                            {currentSong ? <span>
                                {Math.floor(currentSong.duration / 60)}:
                                {Math.floor(currentSong.duration % 60).toString().padStart(2, '0')}
                            </span> : <span>- : -</span>}
                        </div>
                    </div>

                    {/* Main Controls */}
                    <div className="flex w-full items-center justify-between px-2 pt-1">
                        <button className="text-white/50 hover:text-white transition group w-8 flex-1">
                            <IoVolumeHigh size={24} className="group-hover:scale-110 transition-transform" />
                        </button>

                        <div className="flex items-center gap-6">
                            <button className="text-white hover:text-purple-400 transition hover:scale-110 drop-shadow-lg">
                                <IoPlaySkipBack size={32} />
                            </button>

                            <button
                                className="w-16 h-16 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 hover:bg-purple-50 transition shadow-[0_0_30px_rgba(168,85,247,0.25)]"
                                onClick={handlePlayPause}
                            >
                                {isPlaying ? <IoPause size={30} className="text-slate-900" /> : <IoPlay size={32} className="ml-1 text-slate-900" />}
                            </button>

                            <button className="text-white hover:text-purple-400 transition hover:scale-110 drop-shadow-lg">
                                <IoPlaySkipForward size={32} />
                            </button>
                        </div>
                        <div className="flex justify-end flex-1"> {/* Spacer to balance volume icon */}
                            <button onClick={() => socket.emit('sync-song', roomId, { videoId: currentSong.videoId, isPlaying, progress })} className="text-white/50 hover:text-white transition group">SYNC</button>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}