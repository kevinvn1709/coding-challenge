# CRUD Server API

A RESTful API server built with Express.js, TypeScript, and SQLite for managing user resources with full CRUD operations.

## Features

- ✅ **Complete CRUD Operations**: Create, Read, Update, Delete users
- ✅ **TypeScript**: Full type safety and development experience
- ✅ **SQLite Database**: Lightweight, file-based database for data persistence
- ✅ **Input Validation**: Comprehensive validation and error handling
- ✅ **Filtering & Pagination**: Advanced filtering and pagination support
- ✅ **Security**: Helmet for security headers, CORS enabled
- ✅ **Logging**: Morgan for request logging
- ✅ **Error Handling**: Centralized error handling middleware

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd 05_crud_server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Or build and run production:**
   ```bash
   npm run build
   npm start
   ```

The server will start on `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:3000
```

### Health Check
```http
GET /health
```

### Root Endpoint
```http
GET /
```

### User Endpoints

#### 1. Create User
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "status": "active",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

#### 2. Get All Users (with filtering)
```http
GET /api/users?name=John&status=active&limit=10&offset=0
```

**Query Parameters:**
- `name` - Filter by name (partial match)
- `email` - Filter by email (partial match)
- `status` - Filter by status (`active` or `inactive`)
- `age_min` - Minimum age filter
- `age_max` - Maximum age filter
- `limit` - Number of results per page (default: 10)
- `offset` - Number of results to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30,
      "status": "active",
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

#### 3. Get User by ID
```http
GET /api/users/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "status": "active",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

#### 4. Update User
```http
PUT /api/users/:id
Content-Type: application/json

{
  "name": "John Smith",
  "age": 31
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "John Smith",
    "email": "john@example.com",
    "age": 31,
    "status": "active",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:05:00Z"
  }
}
```

#### 5. Delete User
```http
DELETE /api/users/:id
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Data Model

### User Schema
```typescript
interface User {
  id?: number;
  name: string;
  email: string;
  age?: number;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}
```

### Validation Rules
- **name**: Required, string
- **email**: Required, valid email format, unique
- **age**: Optional, integer between 0-150
- **status**: Optional, either 'active' or 'inactive' (default: 'active')

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

## Example Usage with cURL

### Create a user
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "age": 25,
    "status": "active"
  }'
```

### Get all users
```bash
curl http://localhost:3000/api/users
```

### Get users with filters
```bash
curl "http://localhost:3000/api/users?status=active&age_min=20&limit=5"
```

### Get user by ID
```bash
curl http://localhost:3000/api/users/1
```

### Update user
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "age": 26
  }'
```

### Delete user
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Remove build directory

### Project Structure

```
05_crud_server/
├── src/
│   ├── controllers/
│   │   └── userController.ts
│   ├── database/
│   │   └── connection.ts
│   ├── middleware/
│   │   └── errorHandler.ts
│   ├── models/
│   │   └── User.ts
│   ├── routes/
│   │   └── userRoutes.ts
│   ├── utils/
│   │   └── database.ts
│   └── index.ts
├── database.sqlite (created automatically)
├── package.json
├── tsconfig.json
├── nodemon.json
└── README.md
```

### Database

The application uses SQLite database stored in `database.sqlite` file. The database and tables are created automatically when the server starts.

### Environment Variables

You can set the following environment variables:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Testing

You can test the API using:

1. **cURL** (examples provided above)
2. **Postman** - Import the endpoint collection
3. **HTTP Client** extensions in your code editor
4. **Browser** for GET requests

## Production Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start with PM2 (recommended):**
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name "crud-server"
   ```

3. **Environment setup:**
   ```bash
   export NODE_ENV=production
   export PORT=3000
   ```

## License

ISC License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
