# PeopleDex API — Backend Service

A robust **Node.js/Express** API backend for **PeopleDex**, a modern contact book application. This API provides authentication, user management, and contact CRUD operations with **MongoDB** integration and **JWT** security.

🔗 **Frontend:** https://peopledex.space/

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Database models](#database-models)
- [Authentication](#authentication)
- [Development notes](#development-notes)
- [API contract](#api-contract)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **JWT Authentication:** Secure token-based authentication with bcrypt password hashing
- **Google OAuth 2.0:** Integration with Google Sign-In for seamless user registration/login
- **Contact Management:** Full CRUD operations for contacts with user isolation
- **Search & Filtering:** Real-time search across multiple contact fields with favorites filtering
- **User Management:** Secure user registration, login, and profile management
- **CORS Configuration:** Pre-configured CORS for production and development environments
- **MongoDB Integration:** Robust data persistence with Mongoose ODM
- **Security Middleware:** Protected routes with JWT verification

---

## Tech stack

- **Node.js** with **Express 5.1.0** framework
- **MongoDB** with **Mongoose 8.15.1** ODM
- **JWT** for stateless authentication
- **bcrypt** for password hashing
- **CORS** for cross-origin resource sharing
- **dotenv** for environment configuration

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint         | Description                           | Auth Required |
| ------ | ---------------- | ------------------------------------- | ------------- |
| `POST` | `/register`      | User registration with email/password | ❌            |
| `POST` | `/login`         | User login with email/password        | ❌            |
| `POST` | `/google/verify` | Google OAuth verification             | ❌            |
| `GET`  | `/me`            | Get current user profile              | ✅            |

### Contacts (`/api/contacts`)

| Method   | Endpoint    | Description                            | Auth Required |
| -------- | ----------- | -------------------------------------- | ------------- |
| `GET`    | `/`         | Get contacts (with search & filtering) | ✅            |
| `POST`   | `/`         | Create new contact                     | ✅            |
| `PUT`    | `/`         | Update existing contact                | ✅            |
| `DELETE` | `/`         | Delete contact                         | ✅            |
| `PATCH`  | `/favorite` | Toggle contact favorite status         | ✅            |

### Health Check

| Method | Endpoint  | Description       | Auth Required |
| ------ | --------- | ----------------- | ------------- |
| `GET`  | `/health` | API health status | ❌            |

---

## Getting started

### Prerequisites

- **Node.js** 18+ and **npm**
- **MongoDB** instance (local or cloud)

### 1) Clone & install

```bash
git clone https://github.com/rajkapadia247/peopledex-api.git
cd peopledex-api
npm install
```

### 2) Configure environment

Create a `.env` file in the project root:

```env
# MongoDB connection string
MONGO_URI=mongodb://localhost:27017/peopledex

# JWT secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Optional: Custom port (defaults to 8080)
PORT=8080
```

### 3) Start the server

```bash
npm start
```

The API will start on **http://localhost:8080**.

---

## Environment variables

| Variable     | Required | Description                 | Example                               |
| ------------ | -------- | --------------------------- | ------------------------------------- |
| `MONGO_URI`  | ✅       | MongoDB connection string   | `mongodb://localhost:27017/peopledex` |
| `JWT_SECRET` | ✅       | Secret key for JWT signing  | `your-super-secret-key`               |
| `PORT`       | ❌       | Server port (default: 8080) | `3000`                                |

---

## Project structure

```
├── index.js              # Main server file with Express setup
├── middleware/
│   └── auth.js          # JWT authentication middleware
├── models/
│   ├── User.js          # User schema and model
│   └── Contact.js       # Contact schema and model
├── routes/
│   ├── auth.js          # Authentication endpoints
│   └── contacts.js      # Contact management endpoints
├── utils/
│   ├── hash.js          # Password hashing utilities
│   ├── jwt.js           # JWT token utilities
│   └── utils.js         # General utility functions
└── package.json
```

---

## Database models

### User Schema

```javascript
{
  name: String,           // Required, trimmed
  email: String,          // Required, unique, trimmed
  password: String,       // Optional (for Google OAuth users)
  picture: String,        // Optional profile picture URL
  timestamps: true        // createdAt, updatedAt
}
```

### Contact Schema

```javascript
{
  name: String,           // Required, trimmed
  phone: String,          // Required, trimmed
  email: String,          // Optional, trimmed
  company: String,        // Optional, trimmed
  favorite: Boolean,      // Default: false
  userId: ObjectId,       // Reference to User, required
  timestamps: true        // createdAt, updatedAt
}
```

---

## Authentication

### JWT Token Flow

1. **Registration/Login:** User credentials validated → JWT token generated
2. **Google OAuth:** Google access token verified → User created/found → JWT token generated
3. **Protected Routes:** JWT token verified in Authorization header
4. **Token Format:** `Bearer <token>` in Authorization header

### Password Security

- Passwords hashed using **bcrypt** with salt rounds
- Minimum password length: 6 characters
- Secure password comparison using bcrypt.compare()

---

## Development notes

### CORS Configuration

Pre-configured CORS for:

- Production: `https://peopledex.space`, `https://www.peopledex.space`
- Development: `http://localhost:5173` (Vite default)

### Error Handling

- Consistent error response format: `{ message: "Error description" }`
- HTTP status codes: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 404 (not found), 409 (conflict), 500 (server error)

### Search Implementation

- Case-insensitive search across: name, email, phone, company
- MongoDB collation for proper string sorting
- Results limited to 20 contacts per request
- Favorites filtering support

---

## API contract

### Request/Response Examples

#### User Registration

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "message": "Registered",
  "isNewUser": true,
  "userData": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### Get Contacts

```http
GET /api/contacts?searchTerm=john&filterFavoritesOnly=false
Authorization: Bearer <token>
```

**Response:**

```json
{
  "data": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "John Smith",
      "email": "john.smith@company.com",
      "phone": "+1234567890",
      "company": "Tech Corp",
      "favorite": false,
      "color": "#339af0"
    }
  ]
}
```

#### Create Contact

```http
POST /api/contacts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "+1987654321",
  "email": "jane@example.com",
  "company": "Design Studio"
}
```

**Response:**

```json
{
  "message": "Contact added",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "name": "Jane Doe",
    "phone": "+1987654321",
    "email": "jane@example.com",
    "company": "Design Studio",
    "favorite": false,
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Roadmap

- [x] JWT authentication system
- [x] Google OAuth 2.0 integration
- [x] Contact CRUD operations
- [x] Search and filtering
- [x] Favorites system
- [x] User isolation and security
- [x] CORS configuration
- [ ] Rate limiting
- [ ] Input validation middleware
- [ ] Logging and monitoring
- [ ] Unit and integration tests
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Performance optimization
- [ ] Backup and recovery

---

## Contributing

1. Fork the repo and create a feature branch: `git checkout -b feat/your-feature`
2. Commit with clear messages: `git commit -m "feat(auth): add rate limiting"`
3. Push and open a PR.

Please ensure all endpoints are properly tested and documented.

---

## License

This project is licensed under the **ISC License**. See `package.json` for details.

---

### Credits

Built with ❤️ as part of **PeopleDex**, a modern, privacy-minded contact book.

**Backend API** - Node.js/Express + MongoDB  
**Frontend UI** - React + TypeScript + Vite
