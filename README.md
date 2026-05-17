# Task Management API

Lightweight REST API for user authentication and task management built with Node.js and Express.

## Features

- User registration and login (JWT authentication)
- Create, read, update, delete tasks
- Swagger API entrypoint: `swagger.js`
- Postman collection: `postman_collection.json`

## Prerequisites

- Node.js 14+ and npm
- Docker (optional)

## Setup

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file at the project root with required variables (example):

```
PORT=3000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
```

## Run

- Development:

```bash
npm run dev
```

- Production:

```bash
npm start
```

## Tests

```bash
npm test
```

## Docker

Start the app using Docker Compose (if configured):

```bash
docker-compose up --build
```

## Useful files

- API entrypoint: `src/app.js`
- Routes: `src/routes/`
- Controllers: `src/controllers/`
- Models: `src/models/`
- Tests: `tests/`

## Postman & Swagger

- Postman collection: `postman_collection.json`
- Swagger setup: `swagger.js`

## License

MIT
# Task Management REST API

A complete REST API for managing tasks built with Node.js, Express.js, and MongoDB.

## Features
- ✅ Full CRUD for tasks
- ✅ Filter by status & priority
- ✅ Pagination
- ✅ Input validation & error handling
- ✅ Proper HTTP status codes
- ✅ JWT Authentication (bonus)
- ✅ Swagger API Docs (bonus)
- ✅ Unit Tests with Jest (bonus)
- ✅ Docker Setup (bonus)
- ✅ Postman Collection (bonus)

---

## Quick Start (Without Docker)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Start MongoDB
Make sure MongoDB is running locally on port 27017.

### 4. Run the Server
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server runs at: http://localhost:3000  
Swagger Docs at: http://localhost:3000/api-docs

---

## Quick Start (With Docker)

```bash
# Build and run everything (app + MongoDB)
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop
docker-compose down
```

---

## Run Tests
```bash
# Make sure MongoDB is running, then:
npm test
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login & get JWT token |
| GET | /api/auth/me | Get current user (protected) |

### Tasks (all protected — require Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/tasks | Create a task |
| GET | /api/tasks | Get all tasks |
| GET | /api/tasks/:id | Get task by ID |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |

### Query Parameters for GET /api/tasks
| Param | Values | Description |
|-------|--------|-------------|
| status | pending, in-progress, completed | Filter by status |
| priority | low, medium, high | Filter by priority |
| page | number (default: 1) | Page number |
| limit | number (default: 10) | Items per page |

---

## Example Requests

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Create Task (use token from login)
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Task details","priority":"high"}'
```

### Get Tasks with Filter
```bash
curl "http://localhost:3000/api/tasks?status=pending&priority=high&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Task Schema
```json
{
  "id": "unique-mongodb-id",
  "title": "Task title",
  "description": "Task description",
  "status": "pending | in-progress | completed",
  "priority": "low | medium | high",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## HTTP Status Codes Used
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Internal Server Error |
