# Part 2: Postman Video Demo and Test Document (Triangle API)

## Student Deliverable Context
This document supports the Part 2 assignment requirements:
- Demo API testing in Postman
- Show environment variables and a collection
- Include GET and POST requests plus additional CRUD requests
- Explain persistence behavior
- Show normal and error JSON responses
- Provide screenshots in markdown

## API Chosen
I implemented a local Flask API named Triangle API.

Project files:
- triangle_api.py
- requirements.txt
- Triangle_API_Collection.postman_collection.json
- Triangle_API_Local_Environment.postman_environment.json

## Local API Run Steps
1. Open terminal in this folder (group-project-writeup/Week3).
2. Install dependencies:
   pip install -r requirements.txt
3. Run the API:
   python triangle_api.py
4. Confirm API is up:
   GET http://127.0.0.1:5000/health

## Data Persistence (CRUD Explanation)
This API stores data in a local SQLite database file named triangles.db in the same folder as triangle_api.py.

Persistence behavior:
- Data created via POST /triangles is saved to triangles.db.
- Data remains available for later GET requests.
- Updated values via PUT /triangles/<id> stay changed in the database.
- Deleted records via DELETE /triangles/<id> are removed from the database.
- Because storage is file-based SQLite, data persists across API restarts unless triangles.db is deleted.

## Postman Setup Performed
1. Created collection: Triangle API Demo Collection
2. Created environment: Triangle API Local
3. Added environment variable:
   - url = http://127.0.0.1:5000
4. Refactored requests to use {{url}}
5. Added 10 requests (GET, POST, PUT, DELETE)

## Request List Used in Demo
1. GET {{url}}/health
2. GET {{url}}/triangles
3. POST {{url}}/triangles
4. GET {{url}}/triangles/{{triangle_id}}
5. GET {{url}}/triangles?type=Scalene
6. PUT {{url}}/triangles/{{triangle_id}}
7. GET {{url}}/triangles/summary
8. GET {{url}}/triangles/999999 (error example)
9. DELETE {{url}}/triangles/{{triangle_id}}
10. POST {{url}}/triangles (missing field error example)

## JSON Response Examples (At Least Three)

### Example 1: Successful POST Create
Request body:
```json
{
  "a": 3,
  "b": 4,
  "c": 5
}
```

Sample response:
```json
{
  "message": "Triangle created.",
  "item": {
    "id": 1,
    "a": 3.0,
    "b": 4.0,
    "c": 5.0,
    "is_valid": true,
    "triangle_type": "Scalene",
    "created_at": "2026-03-29T00:00:00+00:00"
  }
}
```

### Example 2: Successful GET List
Sample response:
```json
{
  "count": 1,
  "items": [
    {
      "id": 1,
      "a": 3.0,
      "b": 4.0,
      "c": 5.0,
      "is_valid": true,
      "triangle_type": "Scalene",
      "created_at": "2026-03-29T00:00:00+00:00"
    }
  ]
}
```

### Example 3: Successful GET Summary
Sample response:
```json
{
  "total": 1,
  "valid": 1,
  "invalid": 0,
  "by_type": {
    "Scalene": 1
  }
}
```

## Error Response Example (Missing Resource)
The assignment asks for an error example similar to searching for a user that does not exist.

Here, the equivalent is requesting a triangle ID that does not exist:
- GET {{url}}/triangles/999999

Sample response:
```json
{
  "error": "Triangle with id 999999 was not found.",
  "status": 404
}
```

## Additional Error Example (Bad POST Body)
If POST body is missing field c:

```json
{
  "a": 5,
  "b": 10
}
```

Sample response:
```json
{
  "error": "Missing required field(s): c",
  "status": 400
}
```

## Screen Shots (Insert Images Here)
Add your screenshots to group-project-writeup/Week3/images and update the markdown paths if needed.

### 1. Postman Collection and Environment
![Postman collection and environment](images/postman-collection-environment.png)

### 2. GET List Response
![GET list response](images/get-list-response.png)

### 3. POST Create Response
![POST create response](images/post-create-response.png)

### 4. Error Response (Missing Triangle)
![404 error response](images/error-missing-triangle.png)

### 5. API Running Locally (Terminal)
![Flask API running locally](images/flask-running-local.png)

## Suggested Video Demo Flow (3 to 6 minutes)
1. Show API running in terminal.
2. In Postman, show Triangle API Local environment and variable url.
3. Run GET /health and GET /triangles.
4. Run POST /triangles and show JSON result.
5. Run GET /triangles/{{triangle_id}} to show created data.
6. Run PUT then GET summary to show state change.
7. Run GET /triangles/999999 to show error JSON.
8. Optional: Run DELETE and confirm item removed.

## What To Push to Personal GitHub Repo
- This writeup markdown file
- Postman collection JSON
- Postman environment JSON
- API source code and requirements file
- Screenshot image files used in markdown
