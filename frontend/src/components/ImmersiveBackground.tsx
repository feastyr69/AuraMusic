import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
                            {/* Deep base layer */}
                            <div
                                className="absolute inset-[-20%] w-[140%] h-[140%] bg-center bg-cover opacity-20"
                                style={{
                                    backgroundImage: `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)`,
                                    filter: "blur(80px) brightness(0.3) saturate(1.5)",
                                }}
                            />

                            {/* Fluid 3D Blob 1 */}
                            <motion.div
                                animate={{
                                    rotate: [0, 360],
                                    borderRadius: [
                                        "40% 60% 70% 30% / 40% 50% 60% 50%",
                                        "60% 40% 30% 70% / 60% 30% 70% 40%",
                                        "30% 70% 70% 30% / 30% 30% 70% 70%",
                                        "40% 60% 70% 30% / 40% 50% 60% 50%"
                                    ],
                                    x: ['-5%', '5%', '-5%'],
                                    y: ['5%', '-5%', '5%'],
                                }}
                                transition={{
                                    rotate: { duration: 35, repeat: Infinity, ease: "linear" },
                                    borderRadius: { duration: 20, repeat: Infinity, ease: "easeInOut" },
                                    x: { duration: 15, repeat: Infinity, ease: "easeInOut" },
                                    y: { duration: 18, repeat: Infinity, ease: "easeInOut" }
                                }}
                                className="absolute top-[5%] left-[10%] w-[120%] h-[120%] bg-center bg-cover origin-center opacity-40 mix-blend-screen"
                                style={{
                                    backgroundImage: `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)`,
                                    filter: "blur(70px) brightness(0.4) saturate(2)",
                                    willChange: "transform, border-radius"
                                }}
                            />

                            {/* Fluid 3D Blob 2 - Counter rotating */}
                            <motion.div
                                animate={{
                                    rotate: [360, 0],
                                    borderRadius: [
                                        "60% 40% 30% 70% / 60% 30% 70% 40%",
                                        "30% 70% 70% 30% / 30% 30% 70% 70%",
                                        "40% 60% 70% 30% / 40% 50% 60% 50%",
                                        "60% 40% 30% 70% / 60% 30% 70% 40%"
                                    ],
                                    x: ['5%', '-5%', '5%'],
                                    y: ['-5%', '5%', '-5%'],
                                }}
                                transition={{
                                    rotate: { duration: 45, repeat: Infinity, ease: "linear" },
                                    borderRadius: { duration: 25, repeat: Infinity, ease: "easeInOut" },
                                    x: { duration: 20, repeat: Infinity, ease: "easeInOut" },
                                    y: { duration: 22, repeat: Infinity, ease: "easeInOut" }
                                }}
                                className="absolute bottom-[5%] right-[10%] w-[120%] h-[120%] bg-center bg-cover origin-center opacity-30 mix-blend-screen"
                                style={{
                                    backgroundImage: `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)`,
                                    filter: "blur(80px) brightness(0.4) saturate(2)",
                                    willChange: "transform, border-radius"
                                }}
                            />
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
