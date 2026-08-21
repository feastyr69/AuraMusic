import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchLyrics, LyricLine } from '../utils/lyricsService';

interface LyricsPlayerProps {
    songTitle?: string | null;
}

const LyricsPlayer: React.FC<LyricsPlayerProps> = ({ songTitle }) => {
    const [lyrics, setLyrics] = useState<LyricLine[]>([]);
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);

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
            setCurrentTime(timeMs);

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

    useEffect(() => {
        if (!isLoading && (error || (lyrics.length === 0 && songTitle))) {
            setShowError(true);
            const timer = setTimeout(() => {
                setShowError(false);
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setShowError(false);
        }
    }, [isLoading, error, lyrics.length, songTitle]);

    if (!songTitle) return null;

    const activeLine = activeIndex >= 0 && lyrics.length > 0 ? lyrics[activeIndex] : null;
    let words: string[] = [];
    let highlightedIndex = -1;

    if (activeLine) {
        const nextLine = lyrics[activeIndex + 1];
        // Calculate duration until next line, cap at 5 seconds so it doesn't drag slowly during instrumental breaks
        const durationMs = nextLine ? nextLine.timeMs - activeLine.timeMs : 4000;
        const highlightDuration = Math.min(durationMs, 5000);

        const progress = Math.min(Math.max((currentTime - activeLine.timeMs) / highlightDuration, 0), 1);
        words = activeLine.text.split(" ");
        highlightedIndex = Math.floor(progress * words.length);
    }

    const isHidden = !isLoading && (error || lyrics.length === 0) && !showError;

    return (
        <motion.div
            initial={false}
            animate={{
                height: isHidden ? 0 : 'auto',
                opacity: isHidden ? 0 : 1,
                marginTop: isHidden ? 0 : '-0.5rem',
                marginBottom: isHidden ? 0 : '1rem'
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full overflow-hidden"
        >
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full flex justify-center items-center my-4 h-12">
                        <p className="text-zinc-500 font-medium text-sm animate-pulse">Finding lyrics...</p>
                    </motion.div>
                ) : (error || lyrics.length === 0) && showError ? (
                    <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full flex justify-center items-center my-4 h-12">
                        <p className="text-zinc-500/70 font-medium text-xs tracking-wider uppercase">Lyrics not available</p>
                    </motion.div>
                ) : lyrics.length > 0 ? (
                    <motion.div 
                        key="lyrics-container"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full flex justify-center h-24 relative pointer-events-none z-0 overflow-hidden"
                    >
                        <AnimatePresence>
                            {activeLine && (
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, filter: 'blur(8px)', y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
                                    exit={{ opacity: 0, filter: 'blur(8px)', y: -15, scale: 1.05 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="absolute top-0 w-full h-full flex items-center justify-center px-4 text-center"
                                >
                                    <p className="font-display tracking-tight text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
                                        {words.map((word, i) => {
                                            const isHighlighted = i <= highlightedIndex;
                                            return (
                                                <span
                                                    key={i}
                                                    className={`transition-colors duration-200 inline-block mr-[0.3em] ${isHighlighted
                                                            ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.15)]'
                                                            : 'text-white/20'
                                                        }`}
                                                >
                                                    {word}
                                                </span>
                                            );
                                        })}
                                        {!activeLine.text && <span className="text-white/30">♪</span>}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </motion.div>
    );
};

export default LyricsPlayer;
