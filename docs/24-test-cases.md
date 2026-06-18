# Test Cases

## TC-01: User Registration

### Test Steps:
1. Open registration page
2. Enter valid name, email, password
3. Click register button

### Expected Result:
- User account is created successfully
- Confirmation message is shown

---

## TC-02: User Login

### Test Steps:
1. Open login page
2. Enter valid credentials
3. Click login button

### Expected Result:
- User is authenticated
- JWT token is generated
- User is redirected to dashboard

---

## TC-03: Create Workspace

### Test Steps:
1. Login to system
2. Click "Create Workspace"
3. Enter workspace name
4. Save workspace

### Expected Result:
- Workspace is created
- Appears in dashboard

---

## TC-04: Create Project

### Test Steps:
1. Open workspace
2. Click "Create Project"
3. Enter project details
4. Save project

### Expected Result:
- Project is created inside workspace

---

## TC-05: Upload Document

### Test Steps:
1. Open project
2. Upload document or note
3. Save file

### Expected Result:
- Document is stored successfully
- Visible in project section

---

## TC-06: Upload Image

### Test Steps:
1. Open project
2. Upload image file
3. Confirm upload

### Expected Result:
- Image is stored successfully
- Image appears in gallery

---

## TC-07: Search Functionality

### Test Steps:
1. Enter keyword in search bar
2. Press search

### Expected Result:
- Relevant documents/images are shown

---

## TC-08: Dashboard Load

### Test Steps:
1. Login to system
2. Open dashboard

### Expected Result:
- All workspace and project summaries are displayed correctly