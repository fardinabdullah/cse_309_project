import React, { useState } from "react";
import axios from "axios";


function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const handleLogin = async (e) => {

        e.preventDefault();


        try {

            const response = await axios.post(
                "http://127.0.0.1:8000/auth/login",
                {
                    email,
                    password
                }
            );


            console.log(
                "LOGIN RESPONSE:",
                response.data
            );


            localStorage.setItem(
                "token",
                response.data.access_token
            );


            console.log(
                "SAVED TOKEN:",
                localStorage.getItem("token")
            );


            alert("Login successful");


            // refresh current page
            window.location.reload();


        } catch(error) {

            console.log(
                "LOGIN ERROR:",
                error
            );


            alert("Login failed");

        }

    };


    return (

        <div>

            <h2>
                Login
            </h2>


            <form onSubmit={handleLogin}>


                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                />


                <br/>


                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />


                <br/>


                <button type="submit">
                    Login
                </button>


            </form>

        </div>

    );
}


export default Login;