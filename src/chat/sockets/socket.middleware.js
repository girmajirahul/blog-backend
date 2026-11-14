import User from "../../models/user.model.js";
import { verifyAccessToken } from "../../services/auth.services.js";

export async function socketAuthMiddleware(socket, next) {
  try {
    // const token = socket.handshake.auth?.token;
    const authHeader = socket.handshake.headers?.authorization;

    const token =
      socket.handshake.auth?.token ||
      authHeader?.replace(/^Bearer\s+/i, "");

    console.log("Socket auth header received:", Boolean(authHeader));
    console.log("Socket token received:", Boolean(token));  

    if (!token) return next(new Error("Authentication required."));

    const decoded = verifyAccessToken(token);
    if (!decoded?.id) return next(new Error("Invalid access token."));

    const user = await User.findById(decoded.id).select("name email avatar role");
    if (!user) return next(new Error("User account not found."));

    socket.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    };
    return next();
  } catch (error) {
    return next(new Error("Invalid or expired access token."));
  }
}
