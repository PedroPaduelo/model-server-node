import { BadRequestError } from "@/http/routes/_errors";

export interface PermissionRole {
  service: string;
  permissions: string;
  describe: string;
  function: string;
}

export async function can(
  permissions: PermissionRole[],
  permissionsUser: string[]
): Promise<boolean> {
  const requiredPermissions = permissions.flatMap(
    (permission) => permission.permissions
  );
  if (
    !requiredPermissions.some((permission) =>
      permissionsUser.includes(permission)
    )
  ) {
    throw new BadRequestError("You're not allowed to access this route");
  }
  return true;
}
