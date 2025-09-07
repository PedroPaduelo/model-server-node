import "fastify";

import type { Company, Member, Role } from "@prisma/client";

declare module "fastify" {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>;
    getUserMembership(
      slug: string
    ): Promise<{ company: Company; membership: Member; role: Role }>;
  }
}
