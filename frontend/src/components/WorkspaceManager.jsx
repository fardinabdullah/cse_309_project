import { useEffect, useState } from "react";
import {
  getWorkspaces,
  createWorkspace,
  deleteWorkspace,
  updateWorkspace,
} from "../api/workspaceApi";


function WorkspaceManager() {

  const [workspaces, setWorkspaces] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    owner_id: ""
  });


  const [editingId, setEditingId] = useState(null);


  // Load workspaces
  useEffect(() => {

    loadWorkspaces();

  }, []);



  async function loadWorkspaces(){

    try{

      const response = await getWorkspaces();

      setWorkspaces(response.data);

    }

    catch(error){

      console.error(
        "Failed to load workspaces",
        error
      );

    }

  }



  // Handle input
  function handleChange(e){

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });

  }



  // Create / Update
  async function handleSubmit(e){

    e.preventDefault();


    try{


      if(editingId){

        await updateWorkspace(
          editingId,
          formData
        );

        setEditingId(null);

      }


      else{

        await createWorkspace(
          formData
        );

      }


      setFormData({

        name:"",
        description:"",
        owner_id:""

      });


      loadWorkspaces();


    }

    catch(error){

      console.error(
        "Operation failed",
        error
      );

    }

  }




  // Delete
  async function handleDelete(id){

    try{

      await deleteWorkspace(id);

      loadWorkspaces();

    }

    catch(error){

      console.error(
        "Delete failed",
        error
      );

    }

  }




  // Edit button
  function handleEdit(workspace){


    setEditingId(
      workspace._id
    );


    setFormData({

      name: workspace.name,

      description:
      workspace.description,

      owner_id:
      workspace.owner_id

    });


  }




return (

<div className="workspace-container">


<div className="app-header">

<h1>
Smart Workspace Manager
</h1>


<p>
Manage your research and project workspaces
</p>


</div>




<div className="dashboard-grid">



{/* CREATE FORM */}

<div className="card">


<h2>

{editingId
?
"Update Workspace"
:
"Create Workspace"}

</h2>



<form onSubmit={handleSubmit}>


<input

type="text"

name="name"

placeholder="Workspace Name"

value={formData.name}

onChange={handleChange}

/>



<textarea

name="description"

placeholder="Description"

value={formData.description}

onChange={handleChange}

/>



<input

type="text"

name="owner_id"

placeholder="Owner ID"

value={formData.owner_id}

onChange={handleChange}

/>



<button

className="primary-btn"

type="submit"

>

{editingId
?
"Update Workspace"
:
"Create Workspace"}

</button>



</form>



</div>





{/* WORKSPACE LIST */}


<div className="card">


<h2 className="section-title">

Workspaces

</h2>



<div className="workspace-list">



{

workspaces.length === 0

?

<p className="empty-message">

No workspaces available

</p>


:


workspaces.map((workspace)=>(


<div

className="workspace-card"

key={workspace._id}

>


<h3>

{workspace.name}

</h3>



<p>

{workspace.description}

</p>



<p>

<strong>
Owner:
</strong>

{" "}

{workspace.owner_id}

</p>




<button

className="edit-btn"

onClick={()=>
handleEdit(workspace)
}

>

Edit

</button>




<button

className="delete-btn"

onClick={()=>
handleDelete(workspace._id)
}

>

Delete

</button>



</div>


))


}



</div>



</div>



</div>



</div>


);


}


export default WorkspaceManager;