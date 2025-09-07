import type { FastifyInstance } from "fastify";
import { Server } from "socket.io";
import { authenticate } from "./middlewares/auth-socket";
import { registerDisconnect } from "./socket/disconnect";
import { registerJoinRoom } from "./socket/events/join-room";
import { registerLeaveRoom } from "./socket/events/leave-room";

export function setupSocketIO(app: FastifyInstance) {
  const io = new Server(app.server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(authenticate);

  io.on("connection", async (socket) => {
    try {
      registerJoinRoom(socket);
      registerLeaveRoom(socket);

      registerDisconnect(socket);
    } catch (error) {
      console.error("Erro na conexão do socket:", error);
      socket.disconnect(true);
    }
  });

  return io;
}
