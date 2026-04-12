CREATE TABLE public."Roles_Permissions" (
    "RoleId" uuid NOT NULL,
    "PermissionId" uuid NOT NULL,
    CONSTRAINT "Roles_Permissions_PermissionId_fkey" FOREIGN KEY ("PermissionId") REFERENCES "Permissions"("PermissionId") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "Roles_Permissions_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES "Roles"("RoleId") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "Roles_Permissions_pkey" PRIMARY KEY ("RoleId", "PermissionId")
);
