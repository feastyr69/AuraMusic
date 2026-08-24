export interface RoomInfo {
    roomId: string;
    createdAt: number;
    type: string;
    roomName?: string;
    createdBy?: string;
    success?: boolean;
    userCount?: number;
    error?: string;
}

export interface User {
    userId: string;
    userName: string;
    avatarUrl: string | null;
}

export interface Message {
    message: string;
    sender: string;
    timestamp?: number;
}

export interface QueueItem {
    videoId: string;
    title: string;
    artist: string;
    duration: number;
    thumbnail: string;
}
