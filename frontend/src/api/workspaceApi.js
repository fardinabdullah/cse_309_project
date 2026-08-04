import axios from "axios";


const API_URL = "http://127.0.0.1:8000";



const getHeaders = () => {

    const token = localStorage.getItem("token");

    console.log("TOKEN FROM STORAGE:", token);


    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};



// GET workspaces
export const getWorkspaces = async () => {

    const response = await axios.get(
        `${API_URL}/workspaces/`,
        getHeaders()
    );

    return response.data;
};



// CREATE workspace
export const createWorkspace = async (data) => {

    const response = await axios.post(
        `${API_URL}/workspaces/`,
        data,
        getHeaders()
    );

    return response.data;
};



// UPDATE workspace
export const updateWorkspace = async (id, data) => {

    const response = await axios.put(
        `${API_URL}/workspaces/${id}`,
        data,
        getHeaders()
    );

    return response.data;
};



// DELETE workspace
export const deleteWorkspace = async (id) => {

    const response = await axios.delete(
        `${API_URL}/workspaces/${id}`,
        getHeaders()
    );

    return response.data;
};