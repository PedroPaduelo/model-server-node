import type { Server, Socket } from "socket.io";

export function registerJoinRoom(socket: Socket): void {
  socket.on(
    "join-room",
    ({
      room,
      shouldReturnData = false,
    }: {
      room: string;
      shouldReturnData?: boolean;
    }) => {
      socket.join(room);
      console.log(`Client ${socket.id} join in room ${room}`);

      if (shouldReturnData) {
        socket.emit("join-room-return", {
          room,
          message: `Client ${socket.id} join in room ${room}`,
        });
      }
    }
  );
}
