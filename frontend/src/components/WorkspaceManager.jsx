import { useEffect, useState } from "react";

import {
    createWorkspace,
    getWorkspaces,
    deleteWorkspace,
    updateWorkspace
} from "../api/workspaceApi";


function WorkspaceManager() {


    const [workspaces, setWorkspaces] = useState([]);

    const [formData, setFormData] = useState({

        name: "",
        description: ""

    });


    const [editingId, setEditingId] = useState(null);



    useEffect(() => {

        loadWorkspaces();

    }, []);




    const loadWorkspaces = async () => {

        try {

            const data = await getWorkspaces();

            setWorkspaces(data || []);

        }

        catch(error) {

            console.log(
                "LOAD WORKSPACE ERROR:",
                error
            );

            setWorkspaces([]);

        }

    };





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


            if(editingId) {


                await updateWorkspace(

                    editingId,

                    formData

                );


                setEditingId(null);


            }


            else {


                await createWorkspace(

                    formData

                );


            }



            setFormData({

                name: "",

                description: ""

            });



            await loadWorkspaces();



        }

        catch(error) {


            console.log(

                "CREATE/UPDATE ERROR:",

                error

            );


        }


    };








    const handleDelete = async (id) => {


        try {


            await deleteWorkspace(id);


            await loadWorkspaces();


        }


        catch(error) {


            console.log(

                "DELETE ERROR:",

                error

            );


        }


    };







    const handleEdit = (workspace) => {


        setEditingId(

            workspace._id

        );


        setFormData({

            name: workspace.name,

            description: workspace.description

        });


    };







    const cancelEdit = () => {


        setEditingId(null);


        setFormData({

            name: "",

            description: ""

        });


    };







    return (

        <div>


            <h1>
                Smart Workspace Manager
            </h1>


            <p>
                Manage your research and project workspaces
            </p>





            <h2>

                {

                    editingId

                    ?

                    "Update Workspace"

                    :

                    "Create Workspace"

                }


            </h2>






            <form onSubmit={handleSubmit}>


                <input

                    type="text"

                    name="name"

                    placeholder="Workspace Name"

                    value={formData.name}

                    onChange={handleChange}

                    required

                />



                <br />



                <input

                    type="text"

                    name="description"

                    placeholder="Description"

                    value={formData.description}

                    onChange={handleChange}

                    required

                />



                <br />




                <button type="submit">


                    {

                        editingId

                        ?

                        "Update Workspace"

                        :

                        "Create Workspace"

                    }


                </button>




                {

                    editingId &&

                    <button

                        type="button"

                        onClick={cancelEdit}

                    >

                        Cancel

                    </button>

                }



            </form>







            <h2>
                Workspaces
            </h2>







            {

                workspaces.length === 0


                ?


                <p>
                    No workspaces available
                </p>


                :



                workspaces.map(

                    (workspace) => (


                    <div

                        key={workspace._id}

                    >



                        <h3>

                            {workspace.name}

                        </h3>




                        <p>

                            {workspace.description}

                        </p>




                        <p>

                            Owner:

                            {" "}

                            {workspace.owner_id}

                        </p>




                        <button

                            onClick={() =>

                                handleEdit(workspace)

                            }

                        >

                            Edit

                        </button>





                        <button

                            onClick={() =>

                                handleDelete(

                                    workspace._id

                                )

                            }

                        >

                            Delete

                        </button>




                    </div>


                    )

                )

            }





        </div>

    );


}


export default WorkspaceManager;