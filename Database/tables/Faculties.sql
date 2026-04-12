CREATE TABLE public."Faculties" (
    "FacultyId" uuid NOT NULL,
    "FacultyName" character varying(200) NOT NULL,
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedDate" timestamp with time zone,
    "CreatedBy" uuid,
    "ModifiedDate" timestamp with time zone,
    "ModifiedBy" uuid,
    CONSTRAINT "Faculties_pkey" PRIMARY KEY ("FacultyId"),
    CONSTRAINT "Faculties_FacultyName_key" UNIQUE ("FacultyName")
);
