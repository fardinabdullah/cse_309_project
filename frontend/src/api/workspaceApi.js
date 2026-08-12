import axios from "axios";

//const API_URL = "http://127.0.0.1:8000";
const API_URL = "https://smart-workspace-backend.onrender.com";

// ✅ Get token from localStorage
const getToken = () => {
    return localStorage.getItem("token");
};

// ✅ Axios instance with auth header
const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ CREATE WORKSPACE
export const createWorkspace = async (data) => {
    try {
        const response = await api.post("/workspaces/", data);
        return response.data;
    } catch (error) {
        console.error("Create workspace error:", error);
        // ✅ Preserve the full error response
        throw error;
    }
};

// ✅ GET ALL WORKSPACES
export const getWorkspaces = async () => {
    try {
        const response = await api.get("/workspaces/");
        return response.data;
    } catch (error) {
        console.error("Get workspaces error:", error);
        throw error;
    }
};

// ✅ GET SINGLE WORKSPACE
export const getWorkspace = async (id) => {
    try {
        const response = await api.get(`/workspaces/${id}`);
        return response.data;
    } catch (error) {
        console.error("Get workspace error:", error);
        throw error;
    }
};

// ✅ UPDATE WORKSPACE
export const updateWorkspace = async (id, data) => {
    try {
        const response = await api.put(`/workspaces/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Update workspace error:", error);
        throw error;
    }
};

// ✅ DELETE WORKSPACE
export const deleteWorkspace = async (id) => {
    try {
        const response = await api.delete(`/workspaces/${id}`);
        return response.data;
    } catch (error) {
        console.error("Delete workspace error:", error);
        throw error;
    }
};