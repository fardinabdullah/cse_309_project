import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

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
// 1. UPLOAD DOCUMENT
// ============================================
export const uploadDocument = async (workspaceId, file, name = null, description = "") => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('workspace_id', workspaceId);
        if (name) formData.append('name', name);
        formData.append('description', description);

        const response = await api.post('/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error("Upload document error:", error);
        throw error;
    }
};


// ============================================
// 2. BULK UPLOAD
// ============================================
export const bulkUploadDocuments = async (workspaceId, files) => {
    try {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('workspace_id', workspaceId);

        const response = await api.post('/documents/upload/bulk', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error("Bulk upload error:", error);
        throw error;
    }
};


// ============================================
// 3. GET DOCUMENTS
// ============================================
export const getDocuments = async (workspaceId) => {
    try {
        const response = await api.get(`/documents/${workspaceId}`);
        return response.data;
    } catch (error) {
        console.error("Get documents error:", error);
        throw error;
    }
};


// ============================================
// 4. VIEW DOCUMENT
// ============================================
export const viewDocument = async (workspaceId, documentId) => {
    try {
        const response = await api.get(`/documents/view/${documentId}?workspace_id=${workspaceId}`);
        return response.data;
    } catch (error) {
        console.error("View document error:", error);
        throw error;
    }
};


// ============================================
// 5. DELETE DOCUMENT
// ============================================
export const deleteDocument = async (workspaceId, documentId) => {
    try {
        const response = await api.delete(`/documents/${documentId}?workspace_id=${workspaceId}`);
        return response.data;
    } catch (error) {
        console.error("Delete document error:", error);
        throw error;
    }
};


// ============================================
// 6. GET DOCUMENT DASHBOARD
// ============================================
export const getDocumentDashboard = async (workspaceId) => {
    try {
        const response = await api.get(`/documents/dashboard/${workspaceId}`);
        return response.data;
    } catch (error) {
        console.error("Get document dashboard error:", error);
        throw error;
    }
};