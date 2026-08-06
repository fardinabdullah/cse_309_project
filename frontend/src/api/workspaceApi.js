import axios from "axios";


// Backend API URL
const API_URL = "http://127.0.0.1:8000/workspaces";


// Get all workspaces
export const getWorkspaces = async () => {

    return await axios.get(`${API_URL}/`);

};


// Create a new workspace
export const createWorkspace = async (workspaceData) => {

    return await axios.post(     // creates the HTTP request and the request left the frontend here to go backend
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

    return await axios.delete(
        `${API_URL}/${id}`
    );

};