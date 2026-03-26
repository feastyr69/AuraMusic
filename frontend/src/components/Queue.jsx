import React, { useState, useRef } from 'react'
import { apiBaseURL } from '../axiosInstance';
import { FaSearch } from 'react-icons/fa';

export default function Queue({ roomId, sessionId, userName }) {
    const [rotation, setRotation] = useState({ x: 0, y: -15 });
    const [searchResults, setSearchResults] = useState([]);
    const [isFocused, setIsFocused] = useState(false);

    const cardRef = useRef(null);

    let debounceTimer;

    const fetchSearchResults = async (query) => {
        try {
            const response = await apiBaseURL.get(`/search?query=${query}`);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    const handleSearchInput = (e) => {
        const query = e.target.value;
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
            if (query.length > 2) {
                fetchSearchResults(query);
            }
            else {
                setSearchResults([]);
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

        const rotateY = -((mouseX / width) + 0.4) * 20;
        const rotateX = ((mouseY / height) - 0.5) * 20;

        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: -15 });
    };
    return (
        <>
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    transition: rotation.x === 0 && rotation.y === 15 ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out',
                    transformStyle: 'preserve-3d'
                }}
                className='flex flex-col w-full max-w-80 h-120 p-5 m-2 bg-white/3 rounded-xl border border-white/10 shadow-2xl bg-white/5 backdrop-blur-md border border-white/20'>
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

                    {isFocused && searchResults.length > 0 && (
                        <div className='absolute top-12 left-0 w-full flex flex-col mt-2 bg-slate-900 border border-white/10 backdrop-blur-3xl p-2 px-3 rounded-xl z-50'>
                            {searchResults.map((song, index) => {
                                if (index > 5) return null;
                                return (
                                    <div key={song.videoId} className='flex flex-row w-full items-center mb-1 p-1 hover:bg-white/10 rounded-lg hover:cursor-pointer transition duration-300' onClick={() => handleSongClick(song.videoId)}>
                                        <img src={song.thumbnails[0].url} alt="" className="w-10 h-10 object-cover rounded-md flex-shrink-0 mr-3" />
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
                        <p className='text-sm truncate whitespace-nowrap uppercase mt-2 text-gray-400'>Queue</p>
                        <div className='flex flex-col w-full h-[80%] mt-2 rounded-2xl border border-white/5'>

                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}