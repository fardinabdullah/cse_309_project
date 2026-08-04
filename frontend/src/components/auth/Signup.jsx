import { useState } from "react";
import { signup } from "../../api/authApi";


function Signup({ setPage }) {


    const [formData, setFormData] = useState({

        name: "",
        email: "",
        password: ""

    });



    const handleChange = (e) => {

        const { name, value } = e.target;


        setFormData({

            ...formData,
            [name]: value

        });

    };



    const handleSubmit = async (e) => {

        e.preventDefault();


        try {

            await signup(formData);


            alert("Signup successful");


            setPage("login");


        } catch (error) {

            console.log(error);

            alert("Signup failed");

        }

    };



    return (

        <div>

            <h2>Signup</h2>


            <form onSubmit={handleSubmit}>


                <input

                    type="text"

                    name="name"

                    placeholder="Name"

                    value={formData.name}

                    onChange={handleChange}

                />



                <input

                    type="email"

                    name="email"

                    placeholder="Email"

                    value={formData.email}

                    onChange={handleChange}

                />



                <input

                    type="password"

                    name="password"

                    placeholder="Password"

                    value={formData.password}

                    onChange={handleChange}

                />



                <button type="submit">

                    Signup

                </button>


            </form>


        </div>

    );

}


export default Signup;