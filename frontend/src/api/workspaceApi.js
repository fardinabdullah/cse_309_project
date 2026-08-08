import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

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

    return await axios.get(`${API_URL}/`);

};


// Create a new workspace
export const createWorkspace = async (workspaceData) => {

    return await axios.post(
        `${API_URL}/`,
        workspaceData
    );

};


// Get single workspace
export const getWorkspaceById = async (id) => {

    return await axios.get(
        `${API_URL}/${id}`
    );

};


// Update workspace
export const updateWorkspace = async (
    id,
    workspaceData
) => {

    return await axios.put(
        `${API_URL}/${id}`,
        workspaceData
    );

};


// Delete workspace
export const deleteWorkspace = async (id) => {
    try {
        const response = await api.delete(`/workspaces/${id}`);
        return response.data;
    } catch (error) {
        console.error("Delete workspace error:", error);
        throw error;
    }
};