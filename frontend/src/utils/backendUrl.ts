const backendUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:8000" : "https://aura-backend-ebam.onrender.com");

export default backendUrl;
