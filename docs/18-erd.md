# Entity Relationship Diagram (ERD)

## Introduction
This document defines the database structure and relationships between entities in the Smart Workspace Manager system.

---

## Entities

### 1. User
Stores user account information.

- user_id (PK)
- name
- email
- password_hash
- created_at

---

### 2. Workspace
Represents a workspace created by a user.

- workspace_id (PK)
- user_id (FK)
- name
- description
- created_at

---

### 3. Project
Represents a project inside a workspace.

- project_id (PK)
- workspace_id (FK)
- name
- description
- created_at

---

### 4. Document
Stores notes and documents.

- document_id (PK)
- project_id (FK)
- title
- content
- type (note/document)
- created_at

---

### 5. Image
Stores uploaded images.

- image_id (PK)
- project_id (FK)
- file_path
- uploaded_at

---

## Relationships

- A User has many Workspaces
- A Workspace has many Projects
- A Project has many Documents
- A Project has many Images

---

## ERD Summary

User → Workspace → Project → (Documents, Images)

This hierarchy ensures structured organization of all user data within the system.