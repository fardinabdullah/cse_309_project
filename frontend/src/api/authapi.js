import axios from "axios";


//const API_URL = "http://127.0.0.1:8000/auth";
const API_URL = "https://smart-workspace-backend.onrender.com/auth";

// Signup
export const signup = async (userData) => {

    const response = await axios.post(
        `${API_URL}/signup`,
        userData
    );

    return response.data;
};


// Login
export const login = async (loginData) => {

    const response = await axios.post(
        `${API_URL}/login`,
        loginData
    );


    // Save JWT token
    localStorage.setItem(
        "token",
        response.data.access_token
    );


    return response.data;
};


// Logout
export const logout = () => {

    localStorage.removeItem("token");

};