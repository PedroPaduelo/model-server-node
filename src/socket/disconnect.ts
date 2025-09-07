import type { Socket } from "socket.io";

export function registerDisconnect(socket: Socket): void {
  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
}
