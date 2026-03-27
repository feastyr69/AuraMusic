import React, { useState, useRef, useEffect } from 'react'
import { IoSend } from "react-icons/io5";


export default function Chat({ roomId, sessionId, userName, className, socket }) {
    const senderId = userName;
    const [chat, setChat] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [messageObj, setMessageObj] = useState({ message: "", sender: senderId });
    const messageEndRef = useRef(null);
    const [rotation, setRotation] = useState({ x: 0, y: 15 });

    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const rotateY = -((mouseX / width) - 1.4) * 20;
        const rotateX = ((mouseY / height) - 0.5) * 20;

        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 15 });
    };


    useEffect(() => {
        const timestamp = Date.now();
        socket.emit('join-room', roomId, senderId, timestamp);

        socket.on('room-history', (history) => {
            setIsLoading(false);
            setChat(history);
        });

        socket.on('receive-message', (messageObj) => {
            setChat((chat) => [...chat, messageObj]);
        });

        return () => {
            socket.off('room-history');
            socket.off('receive-message');
        }

    }, [roomId])

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat])

    const handleSend = (e) => {
        e.preventDefault();
        socket.emit('send-message', { roomId, messageObj });
        setChat([...chat, messageObj]);
        setMessageObj({ message: "", sender: senderId });
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSend(e);
        }
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
                className='flex flex-col w-80 h-120 p-4 bg-white/3 rounded-xl border border-white/10 shadow-2xl bg-white/5 backdrop-blur-md border border-white/20'
            >
                <div className="flex flex-col font-light tracking-tight mb-2 h-full overflow-auto scrollbar snap-y">
                    {
                        isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                            </div>
                        ) : (
                            chat.map((messageObj, index) => {
                                const msgClass = messageObj.sender === "System" ? "w-full font-medium text-gray-500 uppercase text-sm" : "w-full break-words whitespace-pre-wrap";
                                const isMe = messageObj.sender === senderId;
                                const isSystem = messageObj.sender === "System";
                                const lastSender = chat[index - 1]?.sender;
                                return (
                                    <div className={`flex flex-row flex-wrap tracking-tight w-full`} key={index}>
                                        <p className={`${msgClass} font-medium text-purple-300`}>
                                            {
                                                isSystem ? "" : lastSender === messageObj.sender ? "" : isMe ? "You" : messageObj.sender
                                            }
                                        </p>
                                        <p className={`${msgClass} text-sm`}>
                                            {messageObj.message}
                                        </p>
                                    </div>
                                )
                            })
                        )
                    }
                    <div ref={messageEndRef} />
                </div>
                <div className="flex flex-row">
                    <input type="text" placeholder="Type a message..." className="w-full p-2 my-1 text-sm rounded-xl border border-white/10" value={messageObj.message} onChange={(e) => setMessageObj({ ...messageObj, message: e.target.value })} onKeyDown={handleKeyDown} />
                    <button className="p-3 m-1 ml-2 rounded-full border border-white/10" onClick={handleSend}><IoSend className='size-6' /></button>
                </div>
            </div>
        </>
    )
}