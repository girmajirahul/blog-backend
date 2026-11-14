# Blog CMS – Socket.IO Chat Server

A dedicated real-time communication server for the Blog CMS application, built with **Node.js, Express, Socket.IO, MongoDB, and JWT authentication**.

This service handles real-time chat functionality independently of the main Express REST API.

## 1. Architecture

The project uses a separate deployment architecture:

| Service | Platform | Responsibility |
|---|---|---|
| React + Vite Frontend | Vercel | User interface |
| Main Express Backend | Vercel | Authentication, REST APIs, chat APIs, email |
| Socket.IO Server | Render | Real-time chat events |
| MongoDB Atlas | MongoDB Atlas | Shared database |

### Communication Flow

```text
React Frontend (Vercel)
        |
        |--------------------------|
        |                          |
        v                          v
Main Express API              Socket.IO Server
(Vercel)                      (Render)
        |                          |
        |                          |
        |--------------------------|
                   |
                   v
              MongoDB Atlas
```

**Important:** The Socket.IO server handles real-time events only. Chat REST APIs remain in the main Express backend deployed on Vercel.

## 2. Features

- Real-time messaging
- JWT-based Socket.IO authentication
- Conversation room management
- Online/offline presence
- Typing indicators
- Message delivery events
- Read receipts
- MongoDB message persistence
- Automatic client reconnection
- CORS configuration for frontend access

## 3. Tech Stack

- Node.js
- Express.js
- Socket.IO
- MongoDB Atlas
- Mongoose
- JSON Web Token (JWT)

## 4. Project Structure

```text
socket-server/
│
├── socket-server.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
│
├── config/
│   └── db.js
│
├── middleware/
│   └── socketAuth.js
│
├── models/
│   ├── user.model.js
│   ├── conversation.model.js
│   └── message.model.js
│
└── sockets/
    └── chat.socket.js
```

*Adjust this structure to match your actual project files.*

## 5. Installation

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
```

Navigate to the Socket.IO server directory:

```bash
cd socket-server
```

Install dependencies:

```bash
npm install
```

## 6. Environment Variables

Create a `.env` file in the Socket.IO server directory.

```env
NODE_ENV=development

PORT=5001

MONGO_URI=your_mongodb_atlas_connection_string

JWT_ACCESS_SECRET=your_existing_backend_access_token_secret

CLIENT_URL=http://localhost:5173
```

### Environment Variable Description

| Variable | Description |
|---|---|
| `NODE_ENV` | Application environment |
| `PORT` | Socket.IO server port |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Same access-token secret used by the main backend |
| `CLIENT_URL` | Allowed frontend origin |

**Security notes:**

- Never commit `.env` to GitHub.
- Never expose the JWT secret in frontend environment variables.
- Use the same JWT verification logic and secret as your main backend.
- Configure the production frontend URL in Render.

## 7. Run Locally

Start the Socket.IO server:

```bash
npm start
```

Or, if a development script is configured:

```bash
npm run dev
```

The server should be available at:

```text
http://localhost:5001
```

Health-check endpoint, if configured:

```text
http://localhost:5001/health
```

## 8. Deploy on Render

### Step 1: Push to GitHub

Commit and push your Socket.IO server code.

```bash
git add .
git commit -m "Add Socket.IO chat server"
git push origin main
```

### Step 2: Create a Render Web Service

1. Visit https://dashboard.render.com/
2. Click **New +**.
3. Select **Web Service**.
4. Connect your GitHub repository.
5. Select the branch containing the Socket.IO server.

### Step 3: Configure Render

| Setting | Value |
|---|---|
| Name | blog-chat-server |
| Runtime | Node |
| Root Directory | socket-server (if applicable) |
| Build Command | npm install |
| Start Command | npm start |
| Health Check Path | /health (if implemented) |

### Step 4: Configure Environment Variables

Add these variables in Render:

```env
NODE_ENV=production

MONGO_URI=your_mongodb_atlas_connection_string

JWT_ACCESS_SECRET=your_existing_backend_access_token_secret

CLIENT_URL=https://blog-frontend-rahul.vercel.app
```

Render automatically provides the `PORT` environment variable to web services. Your application must listen on `process.env.PORT`.

### Step 5: Deploy

Click **Create Web Service**.

After successful deployment, Render provides a URL similar to:

```text
https://blog-chat-server.onrender.com
```

## 9. Frontend Configuration

In your React + Vite frontend, configure:

```env
VITE_API_BASE=https://blog-backend-rho-one.vercel.app

VITE_SOCKET_URL=https://blog-chat-server.onrender.com
```

The responsibilities are:

- `VITE_API_BASE`: Existing REST APIs and chat REST APIs.
- `VITE_SOCKET_URL`: Real-time Socket.IO connection.

Redeploy the frontend after updating its production environment variables.

## 10. Socket.IO Authentication

The frontend should provide its access token during the Socket.IO handshake.

Example:

```javascript
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  auth: {
    token: accessToken,
  },
  transports: ["websocket", "polling"],
  reconnection: true,
});
```

The Socket.IO server verifies the token using the existing backend's access-token verification logic.

**Important:** HTTP 101 Switching Protocols only confirms that the WebSocket connection was upgraded. It does not guarantee successful authentication.

## 11. Chat Events

The following events represent the expected chat protocol. Verify their exact names and payloads against your implementation.

### Client to Server

| Event | Purpose |
|---|---|
| `conversation:join` | Join a conversation |
| `message:send` | Send a message |
| `typing:start` | Notify that the user is typing |
| `typing:stop` | Notify that the user stopped typing |
| `messages:read` | Notify that messages were read |

### Server to Client

| Event | Purpose |
|---|---|
| `message:new` | Receive a new message |
| `typing:update` | Receive typing status |
| `messages:read` | Receive read receipts |
| `presence:update` | Receive online/offline updates |
| `chat:error` | Receive chat-related errors |

## 12. MongoDB Atlas Configuration

Both the main backend and Socket.IO server use the same MongoDB Atlas database.

Ensure:

1. The MongoDB connection string is configured correctly.
2. The database user has appropriate read/write permissions.
3. Atlas Network Access allows connections from the Render service.
4. Both services use compatible collection names and schemas.

## 13. Production Testing Checklist

Test using two separate authenticated user accounts.

- [ ] Socket.IO server deploys successfully.
- [ ] Health endpoint returns HTTP 200.
- [ ] User A connects successfully.
- [ ] User B connects successfully.
- [ ] Invalid JWT is rejected.
- [ ] Users can join authorized conversations.
- [ ] Messages are persisted in MongoDB.
- [ ] New messages arrive in real time.
- [ ] Typing indicators work.
- [ ] Online/offline presence updates.
- [ ] Read receipts are persisted and delivered.
- [ ] Reconnection works after refreshing the browser.
- [ ] Unauthorized users cannot join another user's conversation.

## 14. Deployment Responsibilities

| Change | Redeploy |
|---|---|
| Main `app.js` | Vercel |
| Chat REST routes/controllers | Vercel |
| Existing authentication | Vercel |
| Email functionality | Vercel |
| `socket-server.js` | Render |
| Socket.IO event handlers | Render |
| Socket authentication middleware | Render |
| Frontend chat UI | Vercel |

If both services are modified, redeploy both.

## 15. Important Production Considerations

- Render free services can spin down after inactivity, causing connection delays.
- Use an always-on instance for a more responsive production chat experience.
- Ensure messages are persisted before broadcasting them.
- Validate conversation membership on the server.
- Do not trust sender IDs supplied by the frontend.
- Handle multiple connections per user when tracking presence.
- Consider the Socket.IO Redis adapter if you scale to multiple server instances.
- Use proper logging and error handling for production debugging.

---

**Maintainer:** Blog CMS Project

**Deployment:** Vercel + Render

**Database:** MongoDB Atlas