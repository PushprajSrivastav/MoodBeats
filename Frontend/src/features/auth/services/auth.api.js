import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export async function register(email, password, username) {
    const response = await api.post("/api/auth/register", { email, password, username })
    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
    }
    return response.data
}

export async function login(email, password) {
    const response = await api.post("/api/auth/login", { email, password })
    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
    }
    return response.data
}

export async function getMe() {
    const response = await api.get("/api/auth/getme")
    return response.data
}

export async function logout() {
    const response = await api.get("/api/auth/logout")
    localStorage.removeItem("token");
    return response.data
}
