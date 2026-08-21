import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImmersiveBackgroundProps {
    videoId?: string | null;
}

const ImmersiveBackground: React.FC<ImmersiveBackgroundProps> = ({ videoId }) => {
    return (
        <div className="fixed inset-0 w-full h-full z-[-1] overflow-hidden bg-zinc-950 pointer-events-none">
            <AnimatePresence>
                {videoId && (
                    <motion.div
                        key={videoId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full overflow-hidden"
                    >
                        {/* Base background layer to ensure no dark spots */}
                        <div
                            className="absolute inset-0 w-full h-full bg-center bg-cover scale-[1.5]"
                            style={{
                                backgroundImage: `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)`,
                                filter: "blur(100px) brightness(0.4) saturate(1.5)"
                            }}
                        />

                        {/* Blob 1: Slow huge circular swirl */}
                        <motion.div
                            animate={{
                                rotate: [0, 360],
                                scale: [1, 1.3, 1],
                                x: ['-10%', '10%', '-10%'],
                                y: ['-10%', '10%', '-10%']
                            }}
                            transition={{
                                rotate: { duration: 45, repeat: Infinity, ease: "linear" },
                                scale: { duration: 25, repeat: Infinity, ease: "easeInOut" },
                                x: { duration: 30, repeat: Infinity, ease: "easeInOut" },
                                y: { duration: 35, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="absolute -top-[30%] -left-[30%] w-[160%] h-[160%] bg-center bg-cover rounded-[100%] opacity-70 origin-center"
                            style={{
                                backgroundImage: `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)`,
                                filter: "blur(120px) brightness(0.7) saturate(2)"
                            }}
                        />

                        {/* Blob 2: Counter-rotating swirl */}
                        <motion.div
                            animate={{
                                rotate: [360, 0],
                                scale: [1.3, 1, 1.3],
                                x: ['10%', '-10%', '10%'],
                                y: ['10%', '-10%', '10%']
                            }}
                            transition={{
                                rotate: { duration: 55, repeat: Infinity, ease: "linear" },
                                scale: { duration: 30, repeat: Infinity, ease: "easeInOut" },
                                x: { duration: 35, repeat: Infinity, ease: "easeInOut" },
                                y: { duration: 40, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="absolute -bottom-[30%] -right-[30%] w-[160%] h-[160%] bg-center bg-cover rounded-[100%] opacity-60 origin-center"
                            style={{
                                backgroundImage: `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)`,
                                filter: "blur(120px) brightness(0.7) saturate(2)"
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Gradient overlay to ensure text remains readable */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/60 to-zinc-950/90" />

            {/* Grain noise overlay for premium texture */}
            <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
};

export default ImmersiveBackground;
