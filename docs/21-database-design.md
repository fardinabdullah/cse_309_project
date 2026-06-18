# Database Design

## Introduction
This document defines the detailed database schema for the Smart Workspace Manager system.

---

## 1. User Table

### Table: users

| Field | Type | Constraints |
|------|------|------------|
| user_id | INT | Primary Key, Auto Increment |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | UNIQUE, NOT NULL |
| password_hash | TEXT | NOT NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## 2. Workspace Table

### Table: workspaces

| Field | Type | Constraints |
|------|------|------------|
| workspace_id | INT | Primary Key, Auto Increment |
| user_id | INT | Foreign Key (users.user_id) |
| name | VARCHAR(150) | NOT NULL |
| description | TEXT | NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## 3. Project Table

### Table: projects

| Field | Type | Constraints |
|------|------|------------|
| project_id | INT | Primary Key, Auto Increment |
| workspace_id | INT | Foreign Key (workspaces.workspace_id) |
| name | VARCHAR(150) | NOT NULL |
| description | TEXT | NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## 4. Document Table

### Table: documents

| Field | Type | Constraints |
|------|------|------------|
| document_id | INT | Primary Key, Auto Increment |
| project_id | INT | Foreign Key (projects.project_id) |
| title | VARCHAR(150) | NOT NULL |
| content | TEXT | NOT NULL |
| type | VARCHAR(50) | (note/document) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## 5. Image Table

### Table: images

| Field | Type | Constraints |
|------|------|------------|
| image_id | INT | Primary Key, Auto Increment |
| project_id | INT | Foreign Key (projects.project_id) |
| file_path | TEXT | NOT NULL |
| uploaded_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## Relationships Summary

- users → workspaces (1:M)
- workspaces → projects (1:M)
- projects → documents (1:M)
- projects → images (1:M)

---

## Data Integrity Rules

- Every workspace must belong to a valid user
- Every project must belong to a valid workspace
- Every document/image must belong to a valid project
- Deleting parent entity should cascade or restrict child records

---

## Conclusion

The database is structured in a normalized relational format ensuring data consistency, scalability, and efficient querying.