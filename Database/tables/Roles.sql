CREATE TABLE public."Roles" (
    "RoleId" uuid NOT NULL,
    "Name" character varying(100) NOT NULL,
    "Description" character varying(255),
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedDate" timestamp with time zone,
    "CreatedBy" uuid,
    "ModifiedDate" timestamp with time zone,
    "ModifiedBy" uuid,
    CONSTRAINT "Roles_pkey" PRIMARY KEY ("RoleId"),
    CONSTRAINT "Roles_Name_key" UNIQUE ("Name")
);
