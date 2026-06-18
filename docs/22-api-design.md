# API Design

## Base URL
/api

---

## Authentication APIs

### Register User
POST /auth/register

### Login User
POST /auth/login

---

## Workspace APIs

### Create Workspace
POST /workspaces

### Get Workspaces
GET /workspaces

### Update Workspace
PUT /workspaces/{workspace_id}

### Delete Workspace
DELETE /workspaces/{workspace_id}

---

## Project APIs

### Create Project
POST /projects

### Get Projects
GET /projects/{workspace_id}

### Update Project
PUT /projects/{project_id}

### Delete Project
DELETE /projects/{project_id}

---

## Document APIs

### Create Document
POST /documents

### Get Documents
GET /documents/{project_id}

### Update Document
PUT /documents/{document_id}

### Delete Document
DELETE /documents/{document_id}

---

## Image APIs

### Upload Image
POST /images

### Get Images
GET /images/{project_id}

### Delete Image
DELETE /images/{image_id}

---

## Search API

### Search
GET /search?q=keyword