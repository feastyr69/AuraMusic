import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WebGLFluidBackground from './WebGLFluidBackground';

interface ImmersiveBackgroundProps {
    videoId?: string | null;
}

const ImmersiveBackground: React.FC<ImmersiveBackgroundProps> = ({ videoId }) => {
    return (
        <div className={`fixed inset-0 w-full h-full z-[-1] overflow-hidden pointer-events-none ${videoId ? 'bg-zinc-950' : ''}`}>
            <AnimatePresence>
                {videoId && (
                    <motion.div
                        key={videoId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                    >
                        <div className="absolute inset-0 w-full h-full overflow-hidden">
                            {/* Base layer for ambient color */}
                            <div
                                className="absolute inset-[-20%] w-[140%] h-[140%] bg-center bg-cover opacity-20"
                                style={{
                                    backgroundImage: `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)`,
                                    filter: "blur(80px) brightness(0.2) saturate(1.2)",
                                }}
                            />

                            {/* True WebGL Fluid Mesh Gradient */}
                            <div
                                className="absolute inset-[-20%] w-[140%] h-[140%] opacity-60"
                                style={{
                                    filter: "blur(60px) brightness(0.5) saturate(1.5)",
                                }}
                            >
                                <WebGLFluidBackground imageUrl={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Gradient overlay to ensure text remains readable */}
            {videoId && <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/60 to-zinc-950/90" />}

        </div>
    );
};

export default ImmersiveBackground;
