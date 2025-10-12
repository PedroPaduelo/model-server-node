import { Socket } from "socket.io";

interface UserSocketData {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

declare module "socket.io" {
  interface Socket {
    user_id: string;
    user: UserSocketData;
    company_id?: string;
  }
}

