# Data Flow Diagram (DFD)

## Introduction
This document describes how data flows through the Smart Workspace Manager system between users, frontend, backend, and database.

---

## Level 0 DFD (Context Diagram)

### System:
Smart Workspace Manager

### External Entity:
- User

### Data Flow:
- User sends login, workspace, project, document, and image requests
- System processes requests and returns results

---

## Level 1 DFD

### Processes:

#### 1. User Authentication
- Input: User credentials
- Process: Validate credentials and generate JWT
- Output: Authenticated session

---

#### 2. Workspace Management
- Input: Workspace data (create/update/delete)
- Process: Store and manage workspace records
- Output: Updated workspace list

---

#### 3. Project Management
- Input: Project data
- Process: Store projects under workspaces
- Output: Project details

---

#### 4. Document & Notes Management
- Input: Notes or documents
- Process: Store and retrieve documents
- Output: Stored documents

---

#### 5. Image Management
- Input: Image files
- Process: Validate and store images
- Output: Image URLs / metadata

---

#### 6. Search System
- Input: Search query
- Process: Query database
- Output: Matching results

---

## Data Stores

- User Database
- Workspace Table
- Project Table
- Document Table
- Image Storage

---

## Data Flow Summary

User → Frontend (React) → Backend (FastAPI) → Database → Backend → Frontend → User