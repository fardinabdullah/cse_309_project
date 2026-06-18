# Acceptance Criteria

This document defines the conditions that must be satisfied for each user story to be considered complete.

---

## Authentication

### US-01: User Registration
- User can enter valid email and password
- System creates a new account successfully
- Duplicate email registration is prevented

### US-02: User Login
- User can login using valid credentials
- Invalid credentials show error message
- JWT token is generated on successful login

---

## Workspace Management

### US-03: Create Workspace
- User can create a workspace with a valid name
- Workspace appears in dashboard after creation

### US-04: Edit Workspace
- User can update workspace name/details
- Changes are reflected immediately

### US-05: Delete Workspace
- User can delete a workspace
- Deleted workspace is removed from system

---

## Project Management

### US-06: Create Project
- User can create a project inside a workspace
- Project is linked to correct workspace

### US-07: Edit Project
- User can update project details successfully

### US-08: Delete Project
- Project is removed from workspace after deletion

---

## Document & Notes

### US-09: Create Notes
- User can create and save notes successfully

### US-10: Edit Notes
- Notes can be updated and saved

### US-11: Delete Notes
- Notes can be deleted permanently

---

## Image Management

### US-12: Upload Images
- User can upload image files successfully
- Only supported file types are accepted

### US-13: View Images
- Uploaded images are displayed correctly

### US-14: Delete Images
- Images can be removed from storage

---

## Search Functionality

### US-15: Search System
- User can search documents, notes, and images
- Relevant results are returned based on keywords

---

## Dashboard

### US-16: Dashboard Overview
- Dashboard displays workspaces, projects, and files
- Data updates dynamically when changes occur