import { useEffect, useState } from "react";
import {
    getWorkspaces,
    createWorkspace,
    deleteWorkspace
} from "../api/workspaceApi";


function WorkspaceManager() {

    const [workspaces, setWorkspaces] = useState([]);

    const [form, setForm] = useState({
        name: "",
        description: "",
        owner_id: ""
    });


    const loadWorkspaces = async () => {
        const data = await getWorkspaces();
        setWorkspaces(data);
    };


    useEffect(() => {
        loadWorkspaces();
    }, []);


    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        await createWorkspace(form);

        setForm({
            name: "",
            description: "",
            owner_id: ""
        });

        loadWorkspaces();
    };


    const handleDelete = async (id) => {
        await deleteWorkspace(id);
        loadWorkspaces();
    };


    return (
        <div>

            <h1>Smart Workspace Manager</h1>


            <form onSubmit={handleSubmit}>

                <input
                    name="name"
                    placeholder="Workspace Name"
                    value={form.name}
                    onChange={handleChange}
                />


                <input
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                />


                <input
                    name="owner_id"
                    placeholder="Owner ID"
                    value={form.owner_id}
                    onChange={handleChange}
                />


                <button type="submit">
                    Create Workspace
                </button>

            </form>


            <hr />


            <h2>Workspaces</h2>


            {
                workspaces.map((workspace) => (

                    <div key={workspace._id}>

                        <h3>
                            {workspace.name}
                        </h3>

                        <p>
                            {workspace.description}
                        </p>

                        <p>
                            Owner: {workspace.owner_id}
                        </p>


                        <button
                            onClick={() => handleDelete(workspace._id)}
                        >
                            Delete
                        </button>

                    </div>

                ))
            }


        </div>
    );
}


export default WorkspaceManager;