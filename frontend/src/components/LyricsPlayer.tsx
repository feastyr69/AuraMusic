import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchLyrics, LyricLine } from '../utils/lyricsService';

interface LyricsPlayerProps {
    songTitle?: string | null;
}

const LyricsPlayer: React.FC<LyricsPlayerProps> = ({ songTitle }) => {
    const [lyrics, setLyrics] = useState<LyricLine[]>([]);
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [yOffset, setYOffset] = useState<number>(0);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const lineRefs = useRef<Array<HTMLDivElement | null>>([]);

    useEffect(() => {
        let isMounted = true;
        const loadLyrics = async () => {
            if (!songTitle) {
                setLyrics([]);
                setActiveIndex(-1);
                setError(false);
                return;
            }
            setIsLoading(true);
            setError(false);
            setLyrics([]);
            try {
                const fetched = await fetchLyrics(songTitle);
                if (isMounted) {
                    if (fetched && fetched.length > 0) {
                        setLyrics(fetched);
                    } else {
                        setError(true);
                    }
                }
            } catch (err) {
                if (isMounted) setError(true);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadLyrics();
        return () => { isMounted = false; };
    }, [songTitle]);

    useEffect(() => {
        const handleTimeUpdate = (e: any) => {
            const timeMs = e.detail.timeMs;
            
            if (lyrics.length > 0) {
                let newIndex = -1;
                for (let i = 0; i < lyrics.length; i++) {
                    if (lyrics[i].timeMs <= timeMs) {
                        newIndex = i;
                    } else {
                        break;
                    }
                }
                if (newIndex !== activeIndex) {
                    setActiveIndex(newIndex);
                }
            }
        };

        window.addEventListener('player-time-update', handleTimeUpdate);
        return () => window.removeEventListener('player-time-update', handleTimeUpdate);
    }, [lyrics, activeIndex]);

    // Calculate exact Y offset to center the active line
    useEffect(() => {
        if (activeIndex >= 0 && lineRefs.current[activeIndex] && containerRef.current) {
            const activeEl = lineRefs.current[activeIndex];
            const containerHeight = containerRef.current.clientHeight;
            
            // To perfectly center the element:
            // The distance to translate is the middle of the container MINUS the middle of the element
            const activeElCenter = activeEl.offsetTop + (activeEl.clientHeight / 2);
            const targetY = (containerHeight / 2) - activeElCenter;
            
            setYOffset(targetY);
        } else if (activeIndex === -1 && containerRef.current) {
            // Default position if no lyrics are active yet (before song starts)
            setYOffset(containerRef.current.clientHeight / 3);
        }
    }, [activeIndex, lyrics]);

    if (!songTitle) return null;

    if (isLoading) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center items-center my-4">
                <p className="text-zinc-500 font-medium text-sm animate-pulse">Finding lyrics...</p>
            </motion.div>
        );
    }

    if (error || lyrics.length === 0) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center items-center my-4">
                <p className="text-zinc-500/70 font-medium text-xs tracking-wider uppercase">Lyrics not available</p>
            </motion.div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full flex justify-center -mt-2 mb-4 h-28 relative pointer-events-none z-0"
        >
            <div 
                ref={containerRef}
                className="w-full h-full overflow-hidden"
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'
                }}
            >
                <motion.div 
                    className="w-full flex flex-col items-center"
                    animate={{ y: yOffset }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    {lyrics.map((line, index) => {
                        const isActive = index === activeIndex;
                        const distance = Math.abs(index - activeIndex);
                        
                        let opacity = 0.05;
                        let scale = 0.9;
                        
                        if (isActive) {
                            opacity = 1;
                            scale = 1.05;
                        } else if (distance === 1) {
                            opacity = 0.5;
                            scale = 0.95;
                        }

                        return (
                            <motion.div
                                key={index}
                                ref={(el) => (lineRefs.current[index] = el)}
                                initial={false}
                                animate={{ opacity, scale }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className={`text-center py-0.5 w-full max-w-2xl origin-center flex items-center justify-center min-h-[32px]`}
                            >
                                <p 
                                    className={`font-display tracking-tight transition-colors duration-500 ${
                                        isActive 
                                        ? 'text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]' 
                                        : 'text-base sm:text-lg md:text-xl font-medium text-zinc-400'
                                    }`}
                                >
                                    {line.text || "♪"}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default LyricsPlayer;
