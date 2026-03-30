# Program Explanation

## Purpose of This Document
This explanation is organized directly around the original assignment prompt. For each prompt requirement, it explains:
1. What the requirement asked for.
2. What was implemented.
3. Why that implementation was chosen.
4. A concrete code example and/or JSON example from the submitted files.

Primary implementation files:
- triangle_api.py
- Triangle_API_Collection.postman_collection.json
- Triangle_API_Local_Environment.postman_environment.json
- Part2_Postman_Demo_Writeup.md

## Requirement 1: Use a Public API or Build Your Own API
### What the prompt asked
Use a public API or build your own API. Flask/Python was recommended.

### What was implemented
A custom local Flask API was built for triangle operations.

### Why this step was taken
Building a local API gives full control over routes, request/response design, and error handling, which makes it easier to satisfy all grading checkpoints (CRUD, persistence discussion, and error demos).

### Code example
    from flask import Flask, jsonify, request

    def create_app() -> Flask:
        app = Flask(__name__)
        init_db()
        ...
        return app

## Requirement 2: API Should Return JSON Data
### What the prompt asked
The API should return JSON responses.

### What was implemented
Every route uses jsonify and returns JSON payloads for both success and failure.

### Why this step was taken
JSON is the expected format for API testing in Postman and was explicitly required.

### Code example
    @app.get("/health")
    def health() -> Any:
        return jsonify({"status": "ok"})

    def error_response(message: str, status_code: int) -> tuple[Any, int]:
        return jsonify({"error": message, "status": status_code}), status_code

### JSON example
    {
      "status": "ok"
    }

## Requirement 3: Create a Collection in Postman
### What the prompt asked
Create a Postman collection for API testing.

### What was implemented
A full collection JSON export was created with 10 requests that cover health, list, create, retrieve, update, delete, summary, filtering, and error cases.

### Why this step was taken
Using one collection makes the demo reproducible and ensures all required test scenarios are grouped in order.

### JSON example from collection metadata
    {
      "info": {
        "name": "Triangle API Demo Collection",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      }
    }

## Requirement 4: Create a Test GET Request to List Items
### What the prompt asked
Create a GET request that lists items in a database.

### What was implemented
GET /triangles returns all persisted triangle rows and count.

### Why this step was taken
This endpoint proves records are being stored and retrieved from the database layer.

### Code example
    @app.get("/triangles")
    def list_triangles() -> Any:
        ...
        return jsonify({"count": len(rows), "items": [row_to_dict(r) for r in rows]})

### JSON response example
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

## Requirement 5: Create an Environment for the Collection
### What the prompt asked
Create a Postman environment for collection requests.

### What was implemented
An environment JSON export was created with url and triangle_id variables.

### Why this step was taken
Environment variables avoid hardcoded request targets and support local or future deployed URLs.

### JSON example from environment file
    {
      "name": "Triangle API Local",
      "values": [
        { "key": "url", "value": "http://127.0.0.1:5000", "enabled": true },
        { "key": "triangle_id", "value": "1", "enabled": true }
      ]
    }

## Requirement 6: Refactor Requests to Use Environment Variable Base URL
### What the prompt asked
Use environment variable syntax for base URL, such as {{url}}.

### What was implemented
Requests in collection use {{url}} for all endpoints.

### Why this step was taken
This keeps the same collection reusable in different environments with no manual URL edits.

### JSON example from collection request
    {
      "name": "01 - Health Check",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{url}}/health"
        }
      }
    }

## Requirement 7: Create 5 to 10 Additional Requests Including GET and POST
### What the prompt asked
Add at least 5 to 10 additional requests, including GET and at least one POST.

### What was implemented
10 requests were added:
1. GET /health
2. GET /triangles
3. POST /triangles
4. GET /triangles/{{triangle_id}}
5. GET /triangles?type=Scalene
6. PUT /triangles/{{triangle_id}}
7. GET /triangles/summary
8. GET /triangles/999999
9. DELETE /triangles/{{triangle_id}}
10. POST /triangles (missing field error)

### Why this step was taken
This set exceeds the minimum and demonstrates both standard and edge-case API behavior.

### Code example for POST route
    @app.post("/triangles")
    def create_triangle() -> Any:
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return error_response("Request body must be valid JSON.", 400)
        ...
        return jsonify({"message": "Triangle created.", "item": row_to_dict(row)}), 201

## Requirement 8: Explain Whether Data Is Persisted After CRUD Operations
### What the prompt asked
Explain whether data persists after create/retrieve/update/delete operations.

### What was implemented
SQLite persistence was implemented with a file database named triangles.db.

### Why this step was taken
A file-backed database makes persistence easy to demonstrate during video and screenshot capture:
- create writes to disk
- retrieve reads same record later
- update saves changed values
- delete removes record

### Code examples
    DB_PATH = Path(__file__).with_name("triangles.db")

    def get_conn() -> sqlite3.Connection:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db() -> None:
        with get_conn() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS triangles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    a REAL NOT NULL,
                    b REAL NOT NULL,
                    c REAL NOT NULL,
                    is_valid INTEGER NOT NULL,
                    triangle_type TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )

## Requirement 9: Show Examples of Data Returned for Requests (At Least Three)
### What the prompt asked
Show at least three returned data examples.

### What was implemented
The writeup and live tests include multiple response examples. Three representative examples are below.

### JSON example A: POST create response
    {
      "message": "Triangle created.",
      "item": {
        "id": 2,
        "a": 3.0,
        "b": 4.0,
        "c": 5.0,
        "is_valid": true,
        "triangle_type": "Scalene",
        "created_at": "2026-03-29T20:16:11.066455+00:00"
      }
    }

### JSON example B: GET by id response
    {
      "item": {
        "id": 2,
        "a": 3.0,
        "b": 4.0,
        "c": 5.0,
        "is_valid": true,
        "triangle_type": "Scalene",
        "created_at": "2026-03-29T20:16:11.066455+00:00"
      }
    }

### JSON example C: PUT update response
    {
      "message": "Triangle updated.",
      "item": {
        "id": 2,
        "a": 5.0,
        "b": 5.0,
        "c": 5.0,
        "is_valid": true,
        "triangle_type": "Equilateral",
        "created_at": "2026-03-29T20:16:11.066455+00:00"
      }
    }

## Requirement 10: Show Error Data for a Missing Resource
### What the prompt asked
Show error data for a request where a target does not exist (for example, a missing user).

### What was implemented
GET /triangles/999999 is used as the missing-resource example.

### Why this step was taken
It is a direct equivalent to searching for a non-existent record and demonstrates proper API error handling.

### Code example
    @app.get("/triangles/<int:triangle_id>")
    def get_triangle(triangle_id: int) -> Any:
        ...
        if row is None:
            return error_response(f"Triangle with id {triangle_id} was not found.", 404)

### JSON error response example
    {
      "error": "Triangle with id 999999 was not found.",
      "status": 404
    }

## Supporting Implementation Steps and Why They Matter
### Step A: Input validation before DB writes
Why: Prevent invalid JSON shapes and wrong types from corrupting stored records.

Code example:
    def parse_triangle_payload(payload: dict[str, Any]) -> tuple[bool, tuple[float, float, float] | str]:
        required = ["a", "b", "c"]
        missing = [k for k in required if k not in payload]
        if missing:
            return False, f"Missing required field(s): {', '.join(missing)}"
        ...

### Step B: Reuse triangle logic from prior assignment scope
Why: Keeps core business logic clear, testable, and consistent across CLI and API versions.

Code example:
    def is_valid_triangle(a: float, b: float, c: float) -> bool:
        if a <= 0 or b <= 0 or c <= 0:
            return False
        return a + b > c and a + c > b and b + c > a

    def triangle_type(a: float, b: float, c: float) -> str:
        if a == b == c:
            return "Equilateral"
        if a == b or b == c or a == c:
            return "Isosceles"
        return "Scalene"

### Step C: Include Postman Tests in collection requests
Why: Demonstrates verification, not only manual clicking.

JSON example from collection test script:
    {
      "listen": "test",
      "script": {
        "exec": [
          "pm.test('Status code is 201', function () {",
          "  pm.response.to.have.status(201);",
          "});",
          "pm.test('Save triangle id from POST response', function () {",
          "  const body = pm.response.json();",
          "  pm.environment.set('triangle_id', String(body.item.id));",
          "});"
        ]
      }
    }

## End-to-End CRUD Sequence Used in Demo
1. POST /triangles creates a record.
2. GET /triangles/{id} confirms retrieval.
3. PUT /triangles/{id} confirms update.
4. DELETE /triangles/{id} confirms removal.
5. GET /triangles/{id} confirms missing-resource error.

This sequence was chosen because it proves both functional behavior and persistence behavior in the shortest clear demo path.

## Final Alignment Summary to Prompt
All major assignment points are addressed:
- custom Flask/Python API
- JSON responses
- Postman collection created
- GET listing request against persisted data
- Postman environment created
- base URL refactored to {{url}}
- 10 requests included (with GET and POST)
- persistence explained through SQLite
- 3+ response examples shown
- missing-resource error payload shown
