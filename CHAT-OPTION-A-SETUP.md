# Chat setup — Option A (Vercel REST + Render Socket.IO)

## Architecture
- Vercel continues to run `api/index.js` and the existing Express REST API, OAuth, and Nodemailer email features.
- The new Render service runs only `src/socket-server.js` for Socket.IO.
- Both services connect to the same MongoDB Atlas database and use the same `JWT_ACCESS_SECRET`.

## Install dependency locally
Run this once in the project root and commit the updated package-lock.json:

```bash
npm install socket.io@^4.8.1
```

The package script `start:socket` is already added. Existing `npm start` remains unchanged.

## Deploy/update Vercel
1. Push the updated project to the Git repository connected to Vercel.
2. Keep the existing Vercel project settings and environment variables.
3. Ensure `MONGO_URI` and `JWT_ACCESS_SECRET` are configured in Vercel (they should already exist for your current API/auth setup).
4. Vercel will continue to use `api/index.js`; `src/app.js` now also mounts the authenticated `/api/chat` REST routes.
5. Do not change your SMTP/Nodemailer environment variables or mail transport.

## Create the Render Socket.IO service
Create a **Web Service** from the same Git repository:
- Runtime: Node
- Build command: `npm install`
- Start command: `npm run start:socket`
- Root directory: repository root (the directory containing `package.json`)

Set these Render environment variables:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | The exact same MongoDB Atlas connection string used by Vercel |
| `JWT_ACCESS_SECRET` | The exact same access-token secret used by Vercel |
| `FRONTEND_URL` | Your primary deployed frontend origin, e.g. `https://girmaji-rahul.vercel.app` |
| `FRONTEND_URLS` | Optional comma-separated additional frontend origins, e.g. `https://blog-frontend-rahul.vercel.app,https://girmaji-rahul.vercel.app` |

Do not add SMTP credentials to this Render service. It does not send email. Do not generate a different JWT access secret for Render: tokens issued by Vercel must verify on Render.

Render supplies `PORT`; the socket server reads it automatically and binds to `0.0.0.0`.

## Frontend environment
Set these in the frontend deployment:

```env
VITE_API_URL=https://blog-backend-rho-one.vercel.app
VITE_SOCKET_URL=https://YOUR-RENDER-SERVICE.onrender.com
```

Use your actual Render service URL for `VITE_SOCKET_URL`. Rebuild/redeploy the frontend after changing environment variables.

## REST chat endpoints (Vercel)
All require `Authorization: Bearer <accessToken>`:
- `GET /api/chat/users?search=name` — search registered users (maximum 30 results).
- `GET /api/chat/conversations` — current user's conversations.
- `POST /api/chat/conversations` with `{ "receiverId": "<userId>" }` — find/create a direct conversation.
- `GET /api/chat/conversations/:conversationId/messages?limit=30` — load messages; optional `before=<ISO date>` for older messages.
- `PATCH /api/chat/conversations/:conversationId/read` — mark received messages as read.

## Socket.IO client example
Install `socket.io-client` in the frontend:

```bash
npm install socket.io-client
```

Connect with the existing access token:

```js
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket", "polling"],
  auth: { token: accessToken },
  reconnection: true,
});

socket.on("connect", () => console.log("Chat connected", socket.id));
socket.on("connect_error", (error) => console.error("Chat connection failed", error.message));
socket.on("message:new", ({ conversationId, message }) => {
  // Add message to the matching conversation; de-duplicate by message._id.
});
socket.on("typing:update", (data) => { /* update typing indicator */ });
socket.on("presence:update", (data) => { /* update online state */ });
socket.on("chat:error", ({ message }) => console.error(message));

// Start a direct conversation/message:
socket.emit("message:send", { receiverId, text: "Hello!" });

// For an existing conversation:
socket.emit("conversation:join", { conversationId });
socket.emit("message:send", { conversationId, text: "Hello again!" });
socket.emit("typing:start", { conversationId });
socket.emit("typing:stop", { conversationId });
socket.emit("messages:read", { conversationId });

// On component/provider cleanup:
socket.disconnect();
```

## Events
Client -> server:
- `conversation:join` `{ conversationId }`
- `conversation:leave` `{ conversationId }`
- `message:send` `{ receiverId, text }` for a new conversation, or `{ conversationId, text }` for an existing one
- `typing:start` / `typing:stop` `{ conversationId }`
- `messages:read` `{ conversationId }`

Server -> client:
- `conversation:joined` `{ conversationId }`
- `message:new` `{ conversationId, message }`
- `typing:update` `{ conversationId, userId, isTyping }`
- `messages:read` `{ conversationId, readerId, readAt }`
- `presence:update` `{ userId, isOnline }`
- `chat:error` `{ message }`

## Important notes
- The sender ID is always taken from the verified JWT, never from the client payload.
- Conversation membership is checked before history access, joining, typing, and read updates.
- This implementation is a one-to-one text chat MVP (5,000-character message limit). It does not implement file uploads, group chats, message editing/deletion, or push notifications.
- Online presence is in-memory on one Render instance. It resets on restart and is not shared across multiple instances; use a Redis Socket.IO adapter/presence store before scaling to multiple instances.
- Render free services may sleep when idle. The Socket.IO client should keep reconnection enabled.
