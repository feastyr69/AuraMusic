const backendUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:8000" : "https://auramusic-fagj.onrender.com");

export default backendUrl;
