CREATE TABLE public."Categories" (
    "CategoryId" uuid NOT NULL,
    "Name" character varying(50) NOT NULL,
    "Description" character varying(255),
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedDate" timestamp with time zone,
    "CreatedBy" uuid,
    "ModifiedDate" timestamp with time zone,
    "ModifiedBy" uuid,
    CONSTRAINT "Categories_pkey" PRIMARY KEY ("CategoryId"),
    CONSTRAINT "Categories_Name_key" UNIQUE ("Name")
);
