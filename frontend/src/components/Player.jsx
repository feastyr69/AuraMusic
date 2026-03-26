import React from 'react'
import YouTube from 'react-youtube';

export default function Player() {
    return (
        <>
            <div className='flex flex-col h-110 p-5 bg-white/3 rounded-xl border border-white/10 shadow-2xl bg-white/5 backdrop-blur-md border border-white/20'>
                <YouTube videoId="dQw4w9WgXcQ" opts={{
                    height: '1',
                    width: '1',
                    playerVars: {
                        'playsinline': 1,
                        'controls': 0,      // Hide default YT controls
                        'disablekb': 1      // Disable keyboard shortcuts
                    }
                }}
                    onReady={(event) => {
                        //event.target.playVideo();
                    }}
                />

            </div>
        </>
    )
}