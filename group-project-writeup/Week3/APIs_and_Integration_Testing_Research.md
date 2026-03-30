# APIs and Integration Testing with Postman: Research and Analysis
## MSSE640 Group Project Writeup - Part 1

---

## 1. HTTP (HyperText Transfer Protocol) Basics

### Overview
HTTP is a client-server protocol that forms the foundation of data exchange on the World Wide Web. It is an application layer protocol that operates on top of TCP (Transmission Control Protocol) or TLS-encrypted TCP connections. HTTP is extensible, human-readable (in older versions), and designed to be simple yet powerful.

### Key Components

#### 1.1 Clients
**Clients** are entities that initiate communication by sending HTTP requests. Common examples include:
- **Web Browsers**: Firefox, Chrome, Safari, Edge, etc.
- **API Consumers**: Applications, scripts, or services that make programmatic requests to APIs
- **HTTP Tools**: Postman, cURL, wget, and other API testing tools
- **Mobile Applications**: Apps running on smartphones and tablets that communicate with backend servers

The client is always the entity that initiates requests; it never passively receives unsolicited communication in the traditional HTTP model.

#### 1.2 Servers
**Servers** are computer systems that listen for incoming HTTP requests and respond with the requested resources or appropriate error messages. Key aspects include:
- Servers process requests and generate responses based on the request parameters
- They can be single machines or distributed systems with load balancing
- Multiple server instances can be hosted on the same physical machine
- Servers maintain resources (files, databases, APIs) that clients request

#### 1.3 HTTP Requests
An HTTP request consists of:
- **Method/Verb**: Specifies the action to be performed (GET, POST, PUT, DELETE, etc.)
- **Request Line**: Method, resource path, and HTTP version
- **Headers**: Metadata about the request (content type, authentication, etc.)
- **Body**: Optional data payload (typically used with POST, PUT, PATCH)
- **Query Parameters**: Additional data appended to the URL

Example HTTP Request:
```
GET /api/users HTTP/1.1
Host: api.example.com
User-Agent: Mozilla/5.0
Accept: application/json
```

#### 1.4 HTTP Responses
An HTTP response consists of:
- **Status Line**: HTTP version and status code
- **Header Fields**: Metadata about the response
- **Body**: The requested resource or error information
- **Status Code**: Three-digit number indicating the result (e.g., 200, 404, 500)

Example HTTP Response:
```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 256

{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### 1.5 Headers vs. Body

**Headers**:
- Contain metadata about the request or response
- Appear before the body in the HTTP message
- Key-value pairs that provide information to the server/client
- Examples: `Content-Type`, `Authorization`, `Accept`, `Cache-Control`
- Headers are always present, even if empty

**Body**:
- Contains the actual data to be transmitted
- Used primarily in POST, PUT, and PATCH requests
- Can be text, JSON, XML, binary data, form data, etc.
- GET and DELETE requests typically don't have bodies
- Optional in many request types

#### 1.6 Status Codes

HTTP status codes indicate the result of a request. They are grouped into five classes:

**1xx (Informational Responses)**: Continuation of request processing
- `100 Continue`: Client can continue sending the request body
- `101 Switching Protocols`: Server switching to a different protocol

**2xx (Successful Responses)**: Request was successfully received and processed
- `200 OK`: Request succeeded; response contains requested data
- `201 Created`: New resource successfully created
- `204 No Content`: Request succeeded; no content to send back

**3xx (Redirection Messages)**: Further action needed to complete the request
- `301 Moved Permanently`: Resource permanently moved to new URL
- `302 Found`: Resource temporarily moved to different URL
- `304 Not Modified`: Cached version is still valid
- `307 Temporary Redirect`: Use same HTTP method for redirect

**4xx (Client Error Responses)**: Client made an erroneous request
- `400 Bad Request`: Server cannot process due to client error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Client lacks permission for resource
- `404 Not Found`: Requested resource does not exist
- `429 Too Many Requests`: Rate limiting applied

**5xx (Server Error Responses)**: Server failed to fulfill a valid request
- `500 Internal Server Error`: Server encountered unexpected condition
- `502 Bad Gateway`: Invalid response from upstream server
- `503 Service Unavailable`: Server temporarily unavailable
- `504 Gateway Timeout`: Upstream server not responding

#### 1.7 HTTP Verbs (Methods)

**GET**: 
- Retrieves data from the server
- Should not modify server state
- Idempotent (multiple calls produce same result)
- Data passed via URL query strings

**POST**: 
- Submits data to the server
- Can cause state changes and side effects
- Often used for creating new resources
- Data in request body

**PUT**: 
- Replaces entire resource with provided data
- Idempotent
- Creates resource if it doesn't exist
- Requires complete resource representation

**DELETE**: 
- Removes a resource from the server
- Idempotent
- Response may contain status but no body

**PATCH**: 
- Partially modifies a resource
- Not idempotent
- Only includes fields to be changed

**HEAD**: 
- Identical to GET but without response body
- Used to check resource existence and metadata

**OPTIONS**: 
- Describes communication options for the resource
- Used for CORS preflight requests

**TRACE**: 
- Performs message loop-back test
- Rarely used, often disabled for security

#### 1.8 HTTP Statelessness

**What Does "Stateless" Mean?**
HTTP is a stateless protocol, meaning:
- Each request is independent and self-contained
- Server doesn't maintain information about previous client requests
- No inherent connection between sequential requests
- Each request must contain all necessary information to process it

**Implications**:
- Server doesn't know context of a client between requests
- Clients cannot rely on server "remembering" them
- Makes servers highly scalable (no need to maintain session state)

**How Statelessness is Managed**:
- **Cookies**: Browser stores session identifiers that are sent with each request
- **Tokens**: JWT or OAuth tokens passed in Authorization header
- **Session IDs**: Server maintains session data indexed by client-provided ID
- **Database**: Server stores session information in persistent storage

This design allows HTTP to be simple, scalable, and cacheable, which are critical for web performance.

---

## 2. Role of APIs in Modern Applications

### What are APIs?

API (Application Programming Interface) is a set of rules and protocols that allow different software applications to communicate with each other. APIs define how requests and responses should be formatted and what actions can be performed.

### Importance in Modern Applications

**1. Interoperability**: 
- Enable different systems to work together seamlessly
- Allow integration of third-party services
- Break down monolithic applications into microservices

**2. Scalability**: 
- Support distributed system architecture
- Enable independent scaling of services
- Facilitate cloud-based deployments

**3. Flexibility**: 
- Decouple frontend from backend
- Allow multiple clients (web, mobile, desktop)
- Support changing business requirements

**4. Efficiency**: 
- Reduce development time by reusing existing services
- Enable developers to focus on core business logic
- Support rapid iteration and deployment

### Open APIs

**Definition**: Open APIs (also called Public APIs) are APIs that are available to external developers without restrictions. They are made available by organizations for third-party developers to use.

**Why Open APIs are Important**:
1. **Ecosystem Development**: Create ecosystems of third-party applications built on their platform
2. **Market Expansion**: Reach new users through partner applications
3. **Innovation**: Crowdsource innovation by allowing external developers to build
4. **Brand Integration**: Allow competitors to integrate with your platform
5. **Data Sharing**: Enable data sharing across organizational boundaries
6. **Developer Engagement**: Foster developer communities

### Modern Use Case: OpenWeatherMap API

**Description**:
OpenWeatherMap provides a comprehensive weather API that delivers current weather, forecast, and historical data for any location worldwide.

**How It's Used**:
- Weather apps display real-time weather conditions
- News websites embed weather forecasts
- Travel apps integrate weather into trip planning
- Agriculture applications use weather data for crop management
- Smart home systems adjust settings based on weather

**Example Request**:
```
GET https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY

Response:
{
  "coord": {"lon": -0.1257, "lat": 51.5085},
  "weather": [{"id": 804, "main": "Clouds", "description": "overcast clouds"}],
  "main": {"temp": 283.15, "humidity": 72},
  "wind": {"speed": 4.5},
  "clouds": {"all": 90}
}
```

**Sources**:
- OpenWeatherMap Official Website: https://openweathermap.org/
- IBM Topics on Open APIs: https://www.ibm.com/topics/open-apis

---

## 3. Cross-Origin Resource Sharing (CORS)

### Definition
CORS (Cross-Origin Resource Sharing) is an HTTP-header-based mechanism that allows restricted resources on a web page to be requested from another domain outside the domain from which the first resource was served. It's a standard that browsers implement to enable secure cross-origin requests.

### The Problem CORS Solves

Browsers enforce the **Same-Origin Policy** for security reasons:
- JavaScript code can only access resources from the same origin (scheme, domain, port)
- This prevents malicious scripts from the attacker's site accessing your data
- Without CORS, websites cannot legitimately access resources from different origins

### How CORS Works

**Simple Requests** (no preflight needed):
- Limited to GET, HEAD, or POST methods
- Only certain headers allowed
- Specific MIME types only
- Browser adds `Origin` header to request
- Server responds with `Access-Control-Allow-Origin` header

Example:
```
Request:
GET /api/data HTTP/1.1
Host: api.example.com
Origin: https://myapp.com

Response:
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://myapp.com
Content-Type: application/json

{ "data": "..." }
```

**Preflighted Requests** (for complex requests):
- Browser first sends OPTIONS request to check permissions
- Server responds with allowed methods, headers, and max age
- If approved, browser sends actual request
- Used for POST with custom headers, PUT, DELETE, etc.

Example Preflight:
```
OPTIONS /api/data HTTP/1.1
Host: api.example.com
Origin: https://myapp.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type

Response:
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

### Key CORS Headers

**Response Headers**:
- `Access-Control-Allow-Origin`: Specifies which origins can access the resource
- `Access-Control-Allow-Methods`: Lists allowed HTTP methods
- `Access-Control-Allow-Headers`: Lists headers the browser may send
- `Access-Control-Allow-Credentials`: Whether to include credentials
- `Access-Control-Max-Age`: How long preflight results can be cached

**Request Headers**:
- `Origin`: Indicates the origin making the request
- `Access-Control-Request-Method`: Method for preflight request
- `Access-Control-Request-Headers`: Headers to be used in actual request

### CORS and Credentials

- By default, credentials (cookies, HTTP auth) are not sent in cross-origin requests
- Must set `credentials: 'include'` in JavaScript and server must respond with `Access-Control-Allow-Credentials: true`
- When using credentials, `Access-Control-Allow-Origin` cannot be `*` (must be specific origin)

---

## 4. API Security

### Overview
API security encompasses all practices, technologies, and policies used to protect APIs from malicious attacks, unauthorized access, and data breaches. Securing APIs is critical as they are common attack vectors for modern applications.

### Key Security Challenges

1. **Authentication**: Verifying the identity of API consumers
2. **Authorization**: Determining what authenticated users can access
3. **Data Protection**: Securing data in transit and at rest
4. **Rate Limiting**: Preventing abuse and DDoS attacks
5. **Input Validation**: Preventing injection attacks
6. **CSRF Protection**: Preventing forged requests

### How APIs are Secured

#### Authentication Methods

**1. API Keys**:
- Simple string tokens passed in headers or query parameters
- Least secure but easy to implement
- Should be rotated regularly
- Should never be exposed in client-side code

**2. Basic Authentication**:
- Credentials (username:password) base64-encoded in Authorization header
- Must use HTTPS to prevent credential interception
- Format: `Authorization: Basic base64(username:password)`
- Vulnerable to CSRF attacks

**3. Bearer Tokens (OAuth 2.0)**:
- Temporary tokens issued after authentication
- Token passed in Authorization header: `Authorization: Bearer <token>`
- Supports token expiration and refresh
- De facto standard for modern APIs
- Enables third-party integrations safely

**4. JWT (JSON Web Tokens)**:
- Self-contained tokens with encoded claims
- Three parts: header, payload, signature
- Can be validated without server-side session storage
- Commonly used with OAuth 2.0

**5. OAuth 2.0**:
- Industry-standard authorization framework
- Allows users to grant third-party apps access without sharing passwords
- Uses access tokens and refresh tokens
- Supports multiple grant types (Authorization Code, Client Credentials, etc.)

**6. Certificate-Based Authentication**:
- Uses X.509 certificates for mutual TLS
- Most secure option for server-to-server communication
- Required for highly sensitive applications

#### Authorization and Access Control

**Method-Level Authorization**:
- Control which authenticated users can perform specific actions
- Role-Based Access Control (RBAC)
- Attribute-Based Access Control (ABAC)

**Data-Level Authorization**:
- Ensure users only access data they're allowed to see
- Multi-tenancy considerations
- Row-level security

### What You Need to Access a Secure API

1. **Authentication Credentials**:
   - API key, username/password, certificate, or token
   - Obtained from API provider's developer portal

2. **Proper Endpoint Access**:
   - Use HTTPS (not HTTP) for encrypted transmission
   - Know the correct API endpoint URL

3. **Correct Headers**:
   - `Authorization` header with proper format
   - `Content-Type` header for requests with bodies
   - Additional headers as required by API

4. **Required Scopes/Permissions**:
   - May need to request specific permissions
   - Some endpoints may require special privileges

5. **Rate Limit Awareness**:
   - Understand the API's rate limits
   - Implement appropriate retry logic
   - Respect rate limit headers in responses

### Example: Accessing a Secure API

```
# Without Authentication (Fails)
GET /api/protected-data HTTP/1.1
Host: api.example.com

Response: 401 Unauthorized

# With Authentication (Succeeds)
GET /api/protected-data HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

Response: 200 OK
{
  "data": "sensitive information"
}
```

---

## 5. Public Open APIs

Below are 5 commonly used public APIs that developers can use to get real-world data:

### 1. **GitHub API**
- **URL**: https://api.github.com
- **Authentication**: Personal access tokens or OAuth
- **Use Cases**: Retrieve repository information, manage issues, access user data
- **Documentation**: https://docs.github.com/en/rest
- **Rate Limit**: 60 requests/hour (unauthenticated), 5,000/hour (authenticated)

### 2. **JSONPlaceholder**
- **URL**: https://jsonplaceholder.typicode.com
- **Authentication**: None required
- **Use Cases**: Testing, learning API fundamentals, fake data for prototyping
- **Documentation**: https://jsonplaceholder.typicode.com/
- **Rate Limit**: No rate limiting - ideal for testing

### 3. **REST Countries**
- **URL**: https://restcountries.com/v3.1
- **Authentication**: None required
- **Use Cases**: Get information about countries (capitals, currencies, populations, etc.)
- **Documentation**: https://restcountries.com/
- **Data**: 250+ countries with multiple data points

### 4. **Nager.Date Holiday API**
- **URL**: https://date.nager.at/api
- **Authentication**: None required
- **Use Cases**: Get public holidays for any country
- **Documentation**: https://date.nager.at/swagger/index.html
- **Features**: Supports 137+ countries, multiple years

### 5. **OpenWeatherMap API**
- **URL**: https://api.openweathermap.org
- **Authentication**: Free API key required (easy registration)
- **Use Cases**: Current weather, forecasts, historical data
- **Documentation**: https://openweathermap.org/api
- **Coverage**: Global real-time weather data
- **Endpoints**: Weather, forecast, pollution data

---

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
2. Create a virtual environment:
   python -m venv .venv
3. Activate the virtual environment:
   - Windows:  .venv\Scripts\activate.bat
   - macOS/Linux:  source .venv/bin/activate
4. Install dependencies:
   pip install -r requirements.txt
5. Run the Flask API server:
   python triangle_api.py
6. Confirm API is up with POSTMAN:
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
3. POST {{url}}/triangles (valid JSON body: a, b, c)
4. GET {{url}}/triangles/{{triangle_id}}
5. GET {{url}}/triangles?type=Scalene
6. PUT {{url}}/triangles/{{triangle_id}}
7. GET {{url}}/triangles/summary
8. GET {{url}}/triangles/999999 (error example)
9. DELETE {{url}}/triangles/{{triangle_id}}
10. POST {{url}}/triangles (missing field body error example)

## JSON Response Examples (At Least Three)

### Example 3: Successful POST Create
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

### Example 5: Successful GET List
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

### Example 7: Successful GET Summary
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

### 1. Postman Collection
![Postman collection Health](images/week3_PostmanGET_williampriddy.png)

### 2. GET List Response
![GET list response](images/week3_PostmanGET2_williampriddy.png)

### 3. POST Create Response
![POST create response](images/week3_PostmanPOST_williampriddy.png)

### 4. Error Response (Missing Triangle)
![404 error response](images/week3_PostmanGETerror_williampriddy.png)

### 5. API Running Locally (Terminal)
![Flask API running locally](images/week3_FlaskAPILocal_williampriddy.png)

### 6. Demo (YouTube Clickable Image)
[![Demo](images/week3_UpdateTrianglebyID_williampriddy.png)](https://www.youtube.com/watch?v=TiEsXKCt_r8)
