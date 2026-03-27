import React, { useState, useRef, useEffect } from 'react'
import { apiBaseURL } from '../axiosInstance';
import { FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Queue({ roomId, sessionId, userName, socket }) {
    const [rotation, setRotation] = useState({ x: 0, y: -15 });
    const [searchResults, setSearchResults] = useState([]);
    const [queue, setQueue] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const cardRef = useRef(null);

    let debounceTimer;

    const fetchSearchResults = async (query) => {
        try {
            const response = await apiBaseURL.get(`/search?query=${query}`);
            setSearchResults(response.data);
            setIsSearching(false);
        } catch (error) {
            console.error('Error fetching search results:', error);
            setIsSearching(false);
        }
    };

    const handleSearchInput = (e) => {
        const query = e.target.value;
        clearTimeout(debounceTimer);

        if (query.length > 2) {
            setIsSearching(true);
        } else {
            setIsSearching(false);
            setSearchResults([]);
        }

        debounceTimer = setTimeout(() => {
            if (query.length > 2) {
                fetchSearchResults(query);
            }
        }, 500);
    };

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const rotateY = -((mouseX / width) + 0.4) * 15;
        const rotateX = ((mouseY / height) - 0.5) * 15;

        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: -15 });
    };

    useEffect(() => {
        socket.emit('get-queue', roomId);

        socket.on('queue-results', (data) => {
            setQueue(data);
        })

        return () => {
            socket.off('queue-results');
        }
    }, [roomId])

    const handleSearchClick = (videoId) => {
        socket.emit('cue-song', roomId, videoId);
        socket.emit('get-queue', roomId);
    }

    return (
        <>
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    transition: 'transform 0.5s ease-out',
                    transformStyle: 'preserve-3d'
                }}
                className='flex flex-col w-80 h-120 p-5 bg-white/3 rounded-xl border border-white/10 shadow-2xl bg-white/5 backdrop-blur-md border border-white/20'>
                <div className='relative w-full h-full'>
                    <div className='flex flex-row w-full items-center relative'>
                        <input
                            type="text"
                            placeholder='Search song to play'
                            className='w-full p-2 my-1 text-sm rounded-xl border border-white/10 pr-10 bg-transparent outline-none focus:border-white/30 text-white'
                            onChange={handleSearchInput}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        />
                        <FaSearch className='text-white/70 absolute right-3 pointer-events-none' />
                    </div>

                    {isFocused && (isSearching || searchResults.length > 0) && (
                        <div className='absolute top-12 left-0 w-full flex flex-col mt-2 bg-slate-900 border border-white/10 backdrop-blur-3xl p-2 px-3 rounded-xl z-50'>
                            {isSearching ? (
                                <div className="flex flex-col gap-2 p-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex flex-row items-center p-1 animate-pulse">
                                            <div className="w-10 h-10 bg-white/10 rounded-md mr-3"></div>
                                            <div className="flex-1">
                                                <div className="h-3 bg-white/10 rounded w-3/4 mb-2"></div>
                                                <div className="h-2 bg-white/10 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : searchResults.map((song, index) => {
                                if (index > 5) return null;
                                return (
                                    <div key={index} className='flex flex-row w-full items-center mb-1 p-1 hover:bg-white/10 rounded-lg hover:cursor-pointer transition duration-300' onMouseDown={() => handleSearchClick(song.videoId)}>
                                        <img src={`https://i.ytimg.com/vi/${song.videoId}/mqdefault.jpg`} alt="" className="w-10 h-10 object-cover rounded-md flex-shrink-0 mr-3" />
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-sm truncate whitespace-nowrap'>{song.name}</p>
                                            <p className='text-xs truncate whitespace-nowrap text-white/70'>{song.artist.name}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    <div className='flex flex-col w-full h-full p-2'>
                        <p className='text-sm truncate whitespace-nowrap uppercase mt-2 text-gray-400'>Up next</p>
                        <div className='flex flex-col w-full h-[80%] mt-2 rounded-xl border border-white/5 overflow-y-auto scrollbar snap-y'>
                            {
                                queue.length === 0 ? (
                                    <div className='flex flex-col gap-2 items-center justify-center h-full'>
                                        <p className='text-3xl font-medium'>:(</p>
                                        <div className='flex flex-col items-center'>
                                            <p className='text-sm text-white/70'>Queue Empty</p>
                                            <p className='text-xs text-white/50'>Add Songs to Queue</p>
                                        </div>
                                    </div>
                                ) : queue.map((song, index) => {
                                    return (
                                        <div key={index} className={`flex flex-row w-full items-center mb-1 p-1 hover:bg-slate-800 rounded-lg hover:cursor-pointer transition duration-300 ${index === 0 ? 'bg-slate-900' : ''}`}>
                                            <div className="relative w-10 h-10 flex-shrink-0 mr-3">
                                                <img src={`https://i.ytimg.com/vi/${song.videoId}/mqdefault.jpg`} alt="" className="w-10 h-10 object-cover rounded-md" />
                                                {index === 0 && (
                                                    <div className="absolute inset-0 bg-black/40 rounded-md flex items-center justify-center gap-[2px]">
                                                        <motion.div
                                                            animate={{ height: ["4px", "12px", "4px"] }}
                                                            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                                                            className="w-[3px] bg-purple-400 rounded-sm"
                                                        />
                                                        <motion.div
                                                            animate={{ height: ["4px", "16px", "4px"] }}
                                                            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.2 }}
                                                            className="w-[3px] bg-purple-400 rounded-sm"
                                                        />
                                                        <motion.div
                                                            animate={{ height: ["4px", "8px", "4px"] }}
                                                            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.4 }}
                                                            className="w-[3px] bg-purple-400 rounded-sm"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className='flex-1 min-w-0 pr-2'>
                                                <p className={`text-sm ${index === 0 ? 'text-purple-300 font-medium' : ''} truncate whitespace-nowrap`}>{song.name}</p>
                                                <p className='text-xs truncate whitespace-nowrap text-white/70'>{song.artist.name}</p>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}