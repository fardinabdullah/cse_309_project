import axios from "axios";

const API_URL = "http://127.0.0.1:8000/workspaces";

export const getWorkspaces = async () => {
    const response = await axios.get(`${API_URL}/`);
    return response.data;
};


export const createWorkspace = async (workspace) => {
    const response = await axios.post(
        `${API_URL}/`,
        workspace
    );

    return response.data;
};


export const updateWorkspace = async (id, workspace) => {
    const response = await axios.put(
        `${API_URL}/${id}`,
        workspace
    );

    return response.data;
};


export const deleteWorkspace = async (id) => {
    const response = await axios.delete(
        `${API_URL}/${id}`
    );

    return response.data;
};