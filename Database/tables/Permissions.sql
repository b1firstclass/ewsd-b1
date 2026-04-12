CREATE TABLE public."Permissions" (
    "PermissionId" uuid NOT NULL,
    "Name" character varying(100) NOT NULL,
    "Module" character varying(50) NOT NULL,
    "Description" character varying(255),
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedDate" timestamp with time zone,
    "CreatedBy" uuid,
    "ModifiedDate" timestamp with time zone,
    "ModifiedBy" uuid,
    CONSTRAINT "Permissions_pkey" PRIMARY KEY ("PermissionId"),
    CONSTRAINT "Permissions_Name_key" UNIQUE ("Name")
);
