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
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 0.6, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full bg-center bg-cover bg-no-repeat"
                        style={{
                            backgroundImage: `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)`,
                            filter: "blur(60px) brightness(0.6) saturate(1.5)",
                            transform: "scale(1.2)" // Prevent blurred edges from bleeding white
                        }}
                    />
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
