import axios from "axios";

//const API_URL = "http://127.0.0.1:8000";
const API_URL = "https://smart-workspace-backend.onrender.com";

const getToken = () => localStorage.getItem("token");

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


// ============================================
// 1. UPLOAD PAPER
// ============================================
export const uploadPaper = async (workspaceId, file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('workspace_id', workspaceId);

        const response = await api.post('/papers/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error("Upload paper error:", error);
        throw error;
    }
};


// ============================================
// 2. BULK UPLOAD
// ============================================
export const bulkUploadPapers = async (workspaceId, files) => {
    try {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('workspace_id', workspaceId);

        const response = await api.post('/papers/upload/bulk', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error("Bulk upload error:", error);
        throw error;
    }
};


// ============================================
// 3. IMPORT FROM DOI
// ============================================
export const importFromDOI = async (workspaceId, doi) => {
    try {
        const formData = new FormData();
        formData.append('doi', doi);
        formData.append('workspace_id', workspaceId);

        const response = await api.post('/papers/import/doi', formData);
        return response.data;
    } catch (error) {
        console.error("DOI import error:", error);
        throw error;
    }
};


// ============================================
// 4. SEARCH PAPERS
// ============================================
export const searchPapers = async (workspaceId, query) => {
    try {
        const response = await api.get(`/papers/search?query=${encodeURIComponent(query)}&workspace_id=${workspaceId}`);
        return response.data;
    } catch (error) {
        console.error("Search papers error:", error);
        throw error;
    }
};


// ============================================
// 5. GET PAPER DASHBOARD
// ============================================
export const getPaperDashboard = async (workspaceId) => {
    try {
        const response = await api.get(`/papers/dashboard/${workspaceId}`);
        return response.data;
    } catch (error) {
        console.error("Get dashboard error:", error);
        throw error;
    }
};


// ============================================
// 6. DELETE PAPER
// ============================================
export const deletePaper = async (workspaceId, paperId) => {
    try {
        const response = await api.delete(`/papers/${paperId}?workspace_id=${workspaceId}`);
        return response.data;
    } catch (error) {
        console.error("Delete paper error:", error);
        throw error;
    }
};