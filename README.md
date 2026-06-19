# TaskFlow Backend

REST API for the TaskFlow task management app. Built with Node.js, Express, and MongoDB.

---

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT for auth
- bcryptjs for password hashing

---

## Project Structure

```
backend/
├── config/
│   └── db.js               # MongoDB connection
├── controllers/
│   ├── authController.js   # signup, login
│   └── taskController.js   # CRUD + stats
├── middleware/
│   ├── authMiddleware.js   # JWT protect middleware
│   └── errorMiddleware.js  # Global error handler
├── models/
│   ├── User.js
│   └── Task.js
├── routes/
│   ├── authRoutes.js
│   └── taskRoutes.js
├── utils/
│   ├── generateToken.js
│   └── validators.js
├── .env
└── server.js
```

---

## Setup

**1. Install dependencies**

```bash
cd backend
npm install
```

**2. Create `.env` file**

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

**3. Run the server**

```bash
# development
npm run dev

# production
npm start
```

Server runs on `http://localhost:5000`

---

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login and get token |

> Only `@gmail.com` emails are accepted.

**Signup body**
```json
{
  "name": "John",
  "email": "john@gmail.com",
  "password": "123456"
}
```

**Login body**
```json
{
  "email": "john@gmail.com",
  "password": "123456"
}
```

**Response (both)**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "...",
    "name": "John",
    "email": "john@gmail.com"
  }
}
```

---

### Tasks

All task routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks (paginated) |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| PATCH | `/api/tasks/:id/complete` | Mark as completed |
| GET | `/api/tasks/stats` | Get task counts |

**GET /api/tasks — query params**

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| page | number | `1` | Page number |
| limit | number | `9` | Items per page |
| status | string | `Pending` | Filter by status |
| search | string | `meeting` | Search by title |
| sort | string | `newest` | `newest`, `oldest`, `title_asc`, `title_desc` |

**Create / Update task body**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "Pending"
}
```

**Task response**
```json
{
  "data": {
    "_id": "...",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "Pending",
    "user": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Stats response**
```json
{
  "data": {
    "total": 10,
    "completed": 4,
    "pending": 6
  }
}
```

---

## Error Responses

All errors return:
```json
{
  "message": "Error description here"
}
```

Common status codes:
- `400` — validation error / bad input
- `401` — unauthorized / bad token
- `404` — not found
- `409` — duplicate email
- `500` — server error

---

## Auth Flow

1. User signs up → password hashed automatically → JWT returned
2. User logs in → password compared → JWT returned
3. Frontend sends JWT in every request header: `Authorization: Bearer <token>`
4. `protect` middleware validates the token before any task route

---

## Notes

- Passwords are hashed with bcrypt (salt rounds: 10)
- JWT expires in 7 days by default (configurable via `JWT_EXPIRE`)
- Tasks are scoped to the logged-in user — users can't access each other's tasks
- Only Gmail addresses are allowed at signup/login
