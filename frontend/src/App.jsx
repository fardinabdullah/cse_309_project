import { useState } from "react";

import WorkspaceManager from "./components/WorkspaceManager";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";


function App() {


    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );


    const [page, setPage] = useState(
        localStorage.getItem("token")
            ? "workspace"
            : "login"
    );



    const handleLogin = () => {

        setIsLoggedIn(true);

        setPage("workspace");

    };



    const logout = () => {

        localStorage.removeItem("token");

        setIsLoggedIn(false);

        setPage("login");

    };



    return (

        <div>


            <nav>


                {
                    !isLoggedIn &&

                    <>
                        <button onClick={() => setPage("login")}>
                            Login
                        </button>


                        <button onClick={() => setPage("signup")}>
                            Signup
                        </button>
                    </>

                }



                {
                    isLoggedIn &&

                    <>
                        <button onClick={() => setPage("workspace")}>
                            Workspace
                        </button>


                        <button onClick={logout}>
                            Logout
                        </button>
                    </>

                }


            </nav>



            {
                page === "login" &&
                <Login onLogin={handleLogin} />
            }



            {
                page === "signup" &&
                <Signup setPage={setPage} />
            }



            {
                page === "workspace" &&
                <WorkspaceManager />
            }


        </div>

    );

}


export default App;