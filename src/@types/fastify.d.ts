import "fastify";

import type { Company, Member, Role, User } from "@prisma/client";

interface UserSelect {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  createdAt: Date;
}

declare module "fastify" {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>;
    getCurrentUser(): Promise<UserSelect>;
    getUserMembership(
      slug: string
    ): Promise<{ company: Company; membership: Member; role: Role }>;
  }
}
