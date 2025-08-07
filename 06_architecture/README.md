# Live Scoreboard API Service Specification

## Overview

This document provides the specification for a backend API service that manages a live scoreboard system showing the top 10 users' scores with real-time updates and secure score management.

## System Architecture

### System Flow Diagram

The following diagram illustrates the complete flow of execution for the live scoreboard system:


### Flow Explanation

The sequence diagram shows the complete interaction flow between all system components:

1. **Authentication Flow (Steps 1-9)**: User login process with JWT token generation
2. **WebSocket Connection (Steps 10-14)**: Real-time connection establishment for live updates
3. **Action Token Generation (Steps 15-22)**: Secure token creation for authorized score updates
4. **Score Update Flow (Steps 23-47)**: Complete score validation and update process including:
   - Rate limiting validation
   - Action token verification
   - Anti-cheat pattern detection
   - Database transaction processing
   - Cache updates and event publishing
5. **Real-time Broadcast (Steps 48-50)**: Live leaderboard updates to all connected clients
6. **Leaderboard Query (Steps 51-60)**: Efficient leaderboard retrieval with cache optimization

The diagram demonstrates the security-first approach with multiple validation layers and real-time capabilities for seamless user experience.

### Core Components

1. **Authentication Service**: JWT-based user authentication and action authorization
2. **Score Management Service**: Handles score updates with validation and anti-cheat mechanisms
3. **Leaderboard Service**: Manages top 10 scores with efficient queries and caching
4. **Real-time Communication**: WebSocket connections for live scoreboard updates
5. **Security Layer**: Rate limiting, audit logging, and malicious activity prevention

### Technology Stack

- **Backend Framework**: Node.js with Express.js or Python with FastAPI
- **Database**: PostgreSQL for persistent data storage
- **Cache Layer**: Redis for leaderboard caching and real-time pub/sub
- **Real-time**: WebSocket (Socket.IO) or Server-Sent Events
- **Authentication**: JWT tokens with refresh mechanism

### Sequence Diagram (Mermaid)
```mermaid
sequenceDiagram
    participant U as User
    participant WC as Web Client
    participant LB as Load Balancer
    participant AUTH as Auth Service
    participant SCORE as Score Service
    participant RATE as Rate Limiter
    participant ANTI as Anti-Cheat Engine
    participant DB as PostgreSQL
    participant CACHE as Redis Cache
    participant PUBSUB as Redis Pub/Sub
    participant WS as WebSocket Service
    participant AUDIT as Audit Logger

    Note over U, AUDIT: Authentication Flow
    U->>WC: 1. Login Request
    WC->>LB: 2. POST /auth/login
    LB->>AUTH: 3. Route to Auth Service
    AUTH->>DB: 4. Validate Credentials
    DB-->>AUTH: 5. User Data
    AUTH->>DB: 6. Generate JWT Token
    AUTH-->>LB: 7. Return JWT Token
    LB-->>WC: 8. Return Token
    WC-->>U: 9. Login Success

    Note over U, AUDIT: WebSocket Connection
    WC->>WS: 10. Connect with JWT
    WS->>AUTH: 11. Validate JWT
    AUTH-->>WS: 12. JWT Valid
    WS->>PUBSUB: 13. Subscribe to score_updates
    WS-->>WC: 14. Connection Established

    Note over U, AUDIT: Action Token Generation
    U->>WC: 15. Complete Game Action
    WC->>LB: 16. POST /auth/action-token
    LB->>AUTH: 17. Route with JWT
    AUTH->>DB: 18. Generate Action Token
    DB-->>AUTH: 19. Token Stored
    AUTH-->>LB: 20. Return Action Token
    LB-->>WC: 21. Action Token Response
    WC-->>U: 22. Ready for Score Update

    Note over U, AUDIT: Score Update Flow
    U->>WC: 23. Submit Score
    WC->>LB: 24. POST /scores/update (JWT + Action Token)
    LB->>RATE: 25. Check Rate Limits
    RATE->>CACHE: 26. Validate Rate Limits
    CACHE-->>RATE: 27. Rate Limit OK
    RATE->>SCORE: 28. Forward Request
    
    SCORE->>AUTH: 29. Validate Action Token
    AUTH->>DB: 30. Check Token Validity
    DB-->>AUTH: 31. Token Valid
    AUTH-->>SCORE: 32. Token Approved
    
    SCORE->>ANTI: 33. Validate Score Pattern
    ANTI->>DB: 34. Check User History
    DB-->>ANTI: 35. Historical Data
    ANTI-->>SCORE: 36. Validation Passed
    
    SCORE->>DB: 37. Begin Transaction
    SCORE->>DB: 38. Update User Score
    SCORE->>DB: 39. Mark Token as Used
    SCORE->>DB: 40. Log Score Change
    SCORE->>DB: 41. Commit Transaction
    
    SCORE->>CACHE: 42. Update Leaderboard Cache
    SCORE->>PUBSUB: 43. Publish Score Update Event
    SCORE->>AUDIT: 44. Log Security Event
    
    SCORE-->>LB: 45. Score Update Success
    LB-->>WC: 46. Return New Score & Rank
    WC-->>U: 47. Display Updated Score

    Note over U, AUDIT: Real-time Broadcast
    PUBSUB->>WS: 48. Score Update Event
    WS->>WC: 49. Broadcast to All Clients
    WC->>U: 50. Live Leaderboard Update

    Note over U, AUDIT: Leaderboard Query
    U->>WC: 51. Request Leaderboard
    WC->>LB: 52. GET /leaderboard/top10
    LB->>SCORE: 53. Route to Score Service
    SCORE->>CACHE: 54. Check Cache First
    
    alt Cache Hit
        CACHE-->>SCORE: 55a. Cached Data
    else Cache Miss
        SCORE->>DB: 55b. Query Database
        DB-->>SCORE: 56b. Fresh Data
        SCORE->>CACHE: 57b. Update Cache
    end
    
    SCORE-->>LB: 58. Return Leaderboard
    LB-->>WC: 59. Leaderboard Response
    WC-->>U: 60. Display Leaderboard
```


### Architecture Deployment Options

#### Phase 1: Monolithic Architecture (for MVP)
All services run in a single application with modular structure:

```typescript
// NestJS Module Structure
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   └── guards/
├── scores/
│   ├── scores.module.ts
│   ├── scores.service.ts
│   ├── scores.controller.ts
│   └── anti-cheat/
├── leaderboard/
│   ├── leaderboard.module.ts
│   ├── leaderboard.service.ts
│   └── leaderboard.controller.ts
├── websocket/
│   ├── websocket.module.ts
│   ├── websocket.gateway.ts
│   └── events/
├── shared/
│   ├── database/
│   ├── redis/
│   ├── guards/
│   └── interceptors/
└── app.module.ts
```

#### Phase 2: Microservices Architecture (For Scale)
Each service as independent application:

```
Services:
├── auth-service/          (Port 3001)
├── score-service/         (Port 3002)
├── leaderboard-service/   (Port 3003)
├── websocket-service/     (Port 3004)
├── api-gateway/           (Port 3000)
└── shared-libs/
```
## API Specification

### Base URL
```
https://api.scoreboard.com/v1
```

### Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Endpoints

#### 1. User Authentication

**POST /auth/login**
```json
{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "access_token": "string",
    "refresh_token": "string",
    "user_id": "string",
    "expires_in": 3600
  }
}
```

**POST /auth/refresh**
```json
{
  "refresh_token": "string"
}
```

#### 2. Action Token Generation

**POST /auth/action-token**

Headers: `Authorization: Bearer <jwt_token>`

```json
{
  "action_type": "game_completion",
  "session_id": "string",
  "timestamp": "ISO8601"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "action_token": "string",
    "expires_in": 300,
    "max_score_increase": 100
  }
}
```

#### 3. Score Management

**POST /scores/update**

Headers: 
- `Authorization: Bearer <jwt_token>`
- `X-Action-Token: <action_token>`

```json
{
  "score_increase": 50,
  "action_type": "game_completion",
  "session_id": "string",
  "action_data": {
    "level": 5,
    "time_taken": 120,
    "accuracy": 0.95
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "new_score": 1250,
    "score_increase": 50,
    "rank": 3,
    "user_id": "string"
  }
}
```

**GET /scores/user/{user_id}**

Response:
```json
{
  "success": true,
  "data": {
    "user_id": "string",
    "username": "string",
    "current_score": 1250,
    "rank": 3,
    "last_updated": "ISO8601"
  }
}
```

#### 4. Leaderboard

**GET /leaderboard/top10**

Response:
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user_id": "string",
        "username": "string",
        "score": 2500,
        "last_updated": "ISO8601"
      }
    ],
    "last_updated": "ISO8601",
    "total_players": 15420
  }
}
```

#### 5. Real-time WebSocket

**Connection: /ws/leaderboard**

Authentication: Send JWT token in connection query parameter
```
wss://api.scoreboard.com/ws/leaderboard?token=<jwt_token>
```

**Events:**

Incoming (Client → Server):
```json
{
  "type": "subscribe_leaderboard",
  "data": {}
}
```

Outgoing (Server → Client):
```json
{
  "type": "leaderboard_update",
  "data": {
    "leaderboard": [...],
    "updated_user": {
      "user_id": "string",
      "old_rank": 5,
      "new_rank": 3,
      "score_change": 50
    },
    "timestamp": "ISO8601"
  }
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  current_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_score ON users(current_score DESC);
CREATE INDEX idx_users_username ON users(username);
```

### Scores Table
```sql
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  score_change INTEGER NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  session_id VARCHAR(100),
  action_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX idx_scores_user_id ON scores(user_id);
CREATE INDEX idx_scores_created_at ON scores(created_at);
```

### Action Tokens Table
```sql
CREATE TABLE action_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  token_hash VARCHAR(255) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  session_id VARCHAR(100),
  max_score_increase INTEGER,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_action_tokens_hash ON action_tokens(token_hash);
CREATE INDEX idx_action_tokens_expires ON action_tokens(expires_at);
```

## Security Measures

### 1. Action Token System
- Generate time-limited tokens for each legitimate action
- Tokens include maximum allowable score increase
- One-time use tokens prevent replay attacks
- Server-side validation of action context

### 2. Rate Limiting
```javascript
// Rate limiting rules
const rateLimits = {
  score_update: "10 requests per minute per user",
  action_token: "20 requests per minute per user",
  leaderboard: "60 requests per minute per IP"
};
```

### 3. Score Validation
- Server-side calculation verification
- Historical pattern analysis
- Anomaly detection for unusual score increases
- Action context validation

### 4. Audit Logging
```json
{
  "event_type": "score_update",
  "user_id": "string",
  "ip_address": "string",
  "user_agent": "string",
  "score_change": 50,
  "validation_result": "approved",
  "risk_score": 0.2,
  "timestamp": "ISO8601"
}
```

## Implementation Guidelines

### 1. Environment Setup
```bash
# Required environment variables
DATABASE_URL=postgresql://user:pass@localhost/scoreboard
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

### 2. Key Implementation Points

#### Score Update Flow
1. Validate JWT token and extract user ID
2. Verify action token and check expiration
3. Validate score increase against maximum allowed
4. Check rate limits and user history
5. Update database with transaction
6. Update Redis leaderboard cache
7. Broadcast update via WebSocket
8. Log audit trail

#### Leaderboard Caching Strategy
```javascript
// Redis operations
ZADD leaderboard user_id score
ZREVRANGE leaderboard 0 9 WITHSCORES
ZRANK leaderboard user_id
```

#### Real-time Update Optimization
- Use Redis pub/sub for scaling across multiple server instances
- Implement connection pooling for WebSocket management
- Batch leaderboard updates if multiple score changes occur rapidly

### 3. Error Handling

Standard error response format:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_ACTION_TOKEN",
    "message": "The provided action token is invalid or expired",
    "details": {}
  }
}
```

Common error codes:
- `INVALID_TOKEN`: JWT token invalid or expired
- `INVALID_ACTION_TOKEN`: Action token invalid or already used
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SCORE_VALIDATION_FAILED`: Score increase validation failed
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions

## Performance Considerations

### 1. Database Optimization
- Use database indexes for score queries
- Implement read replicas for leaderboard queries
- Consider partitioning scores table by date

### 2. Caching Strategy
- Cache top 10 leaderboard in Redis with 1-minute TTL
- Cache user scores with longer TTL
- Implement cache warming for popular data

### 3. Scaling Considerations
- Horizontal scaling with load balancers
- Redis cluster for cache layer scaling
- WebSocket server clustering with Redis pub/sub

## Monitoring and Metrics

### Key Metrics to Track
- Score update frequency per user
- Leaderboard query response times
- WebSocket connection counts
- Failed authentication attempts
- Anomalous score patterns

### Health Check Endpoints
```
GET /health - Basic service health
GET /health/detailed - Detailed component status
```

## Security Improvements and Recommendations

### 1. Advanced Anti-Cheat Measures
- Machine learning models for pattern detection
- Device fingerprinting for user verification
- Behavioral analysis for automated play detection
- Cross-reference with game client telemetry

### 2. Enhanced Security Features
- IP-based geolocation verification
- Device registration and verification
- Multi-factor authentication for high-value actions
- Encrypted action data with server-side decryption

### 3. Performance Optimizations
- Implement GraphQL for flexible data fetching
- Use HTTP/2 for improved connection efficiency
- Implement compression for WebSocket messages
- Consider edge caching for global distribution

### 4. Operational Improvements
- Implement distributed tracing for debugging
- Add comprehensive logging with structured format
- Set up automated alerting for security anomalies
- Create admin dashboard for monitoring and management

### Recommended Approach: Monolithic with NestJS Modules

For the live scoreboard system, I recommend **Option 1 (Monolithic)** for the following reasons:

1. **Scope Complexity**: The system has clear, tightly-coupled components
2. **Team Size**: Likely < 10 developers initially
3. **Performance**: Real-time features need low latency
4. **Development Speed**: Faster to market with single codebase
5. **Operational Simplicity**: Easier monitoring and deployment

### Migration Path to Microservices

When you reach these thresholds, consider migrating to microservices:
- **Team Size**: > 10 developers
- **Traffic**: > 10,000 concurrent users
- **Different Scaling Needs**: WebSocket service needs more resources than auth
- **Technology Requirements**: Need different tech stacks for different services

```mermaid
graph LR
    A[MVP: Monolithic NestJS] --> B[Scale: Add Load Balancer]
    B --> C[Extract: WebSocket Service]
    C --> D[Extract: Score Service]
    D --> E[Full Microservices]
```

## Testing Strategy

### 1. Load Testing

```javascript
// Use Artillery.js or k6 for load testing
// artillery-config.yml
config:
  target: 'https://api.scoreboard.com'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100

scenarios:
  - name: "Score Update Flow"
    requests:
      - post:
          url: "/auth/login"
          json:
            username: "test_user"
            password: "password"
          capture:
            jwt_token: "$.data.access_token"
      
      - post:
          url: "/auth/action-token"
          headers:
            Authorization: "Bearer {{ jwt_token }}"
          json:
            action_type: "game_completion"
            session_id: "{{ $randomString() }}"
          capture:
            action_token: "$.data.action_token"
      
      - post:
          url: "/scores/update"
          headers:
            Authorization: "Bearer {{ jwt_token }}"
            X-Action-Token: "{{ action_token }}"
          json:
            score_increase: "{{ $randomInt(1, 100) }}"
            action_type: "game_completion"
```

### 2. Security Testing

```javascript
// Security test cases
describe('Security Tests', () => {
  test('Should reject invalid action tokens', async () => {
    const response = await request(app)
      .post('/scores/update')
      .set('Authorization', `Bearer ${validJWT}`)
      .set('X-Action-Token', 'invalid_token')
      .send({ score_increase: 50 });
    
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_ACTION_TOKEN');
  });
  
  test('Should prevent score increase above maximum', async () => {
    const actionToken = await generateTestActionToken(userId, 50);
    
    const response = await request(app)
      .post('/scores/update')
      .set('Authorization', `Bearer ${validJWT}`)
      .set('X-Action-Token', actionToken)
      .send({ score_increase: 100 }); // Above maximum
    
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('SCORE_VALIDATION_FAILED');
  });
});
```
