import type { Socket } from "socket.io";

export function registerLeaveRoom(socket: Socket): void {
  socket.on(
    "leave-room",
    ({
      room,
      shouldReturnData = false,
    }: {
      room: string;
      shouldReturnData?: boolean;
    }) => {
      socket.leave(room);
      console.log(`Client ${socket.id} leave of room ${room}`);

      if (shouldReturnData) {
        socket.emit("leave-room-return", {
          room,
          message: `Client ${socket.id} join in room ${room}`,
        });
      }
    }
  );
}
