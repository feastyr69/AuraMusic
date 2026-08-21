export interface LyricLine {
    timeMs: number;
    text: string;
}

export const refineTitle = (title: string): string => {
    if (!title) return "";
    return title
        .replace(/\[.*?\]/g, "")
        .replace(/\(.*?\)/g, "")
        .replace(/official video/ig, "")
        .replace(/official audio/ig, "")
        .replace(/official/ig, "")
        .replace(/music video/ig, "")
        .replace(/lyric video/ig, "")
        .replace(/lyrics/ig, "")
        .trim();
}

export const parseLrc = (lrcString: string): LyricLine[] => {
    if (!lrcString) return [];
    
    const lines = lrcString.split("\n");
    const parsedLines: LyricLine[] = [];
    
    // Regex to match [mm:ss.xx]
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    
    for (const line of lines) {
        const match = timeRegex.exec(line);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const milliseconds = parseInt(match[3], 10) * (match[3].length === 2 ? 10 : 1);
            
            const timeMs = (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
            const text = line.replace(timeRegex, "").trim();
            
            parsedLines.push({ timeMs, text });
        }
    }
    
    return parsedLines;
};

export const isRomanized = (text: string): boolean => {
    // Regex to detect non-Latin scripts: Devanagari, Bengali, Tamil, CJK, Cyrillic, Arabic, etc.
    const nonLatinRegex = /[\u0900-\u0DFF\u0E00-\u0E7F\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\u0400-\u04FF\u0590-\u06FF]/;
    // If it contains any of these characters, it's not English/Romanized
    return !nonLatinRegex.test(text);
};

export const fetchLyrics = async (query: string): Promise<LyricLine[]> => {
    try {
        const cleanedQuery = refineTitle(query);
        const url = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanedQuery)}`;
        const res = await fetch(url);
        if (!res.ok) return [];
        
        const data = await res.json();
        if (data && data.length > 0) {
            // Find the first track that has synced lyrics AND is purely Romanized/English
            const trackWithLyrics = data.find((track: any) => track.syncedLyrics && isRomanized(track.syncedLyrics));
            if (trackWithLyrics) {
                return parseLrc(trackWithLyrics.syncedLyrics);
            }
        }
    } catch (err) {
        console.error("Error fetching lyrics:", err);
    }
    return [];
};
