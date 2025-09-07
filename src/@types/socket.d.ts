import { Socket } from "socket.io";

declare module "socket.io" {
  interface Socket {
    user_id: string;
    company_id: string;
  }
}

