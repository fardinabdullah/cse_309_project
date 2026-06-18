# Use Cases

## Introduction
This document describes how users interact with the Smart Workspace Manager system through different functional scenarios.

---

## UC-01: User Registration

### Actor:
User

### Description:
A new user registers an account in the system.

### Preconditions:
User is not already registered.

### Main Flow:
1. User enters email and password
2. System validates input
3. System creates new account
4. Confirmation is shown

### Postconditions:
User account is created successfully

---

## UC-02: User Login

### Actor:
User

### Description:
User logs into the system.

### Main Flow:
1. User enters credentials
2. System verifies credentials
3. JWT token is generated
4. User is redirected to dashboard

---

## UC-03: Create Workspace

### Actor:
User

### Description:
User creates a new workspace.

### Main Flow:
1. User clicks "Create Workspace"
2. User enters workspace name
3. System saves workspace
4. Workspace appears in dashboard

---

## UC-04: Create Project

### Actor:
User

### Description:
User creates a project inside a workspace.

### Main Flow:
1. User selects workspace
2. User clicks "Create Project"
3. User enters project details
4. System saves project under workspace

---

## UC-05: Upload Document

### Actor:
User

### Description:
User uploads a document or note.

### Main Flow:
1. User selects upload option
2. User chooses file or enters note
3. System stores data
4. File becomes visible in workspace

---

## UC-06: Upload Image

### Actor:
User

### Description:
User uploads images to system.

### Main Flow:
1. User selects image upload
2. System validates file type
3. Image is stored
4. Image appears in gallery

---

## UC-07: Search Data

### Actor:
User

### Description:
User searches for documents, notes, or images.

### Main Flow:
1. User enters keyword
2. System searches database
3. Matching results are displayed

---

## UC-08: View Dashboard

### Actor:
User

### Description:
User views overall system summary.

### Main Flow:
1. User opens dashboard
2. System fetches data
3. Summary is displayed (workspaces, projects, files)