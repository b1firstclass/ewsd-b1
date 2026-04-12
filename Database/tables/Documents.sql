CREATE TABLE public."Documents" (
    "DocumentId" uuid NOT NULL,
    "ContributionId" uuid NOT NULL,
    "FileName" character varying(200) NOT NULL,
    "Extension" character varying(100) NOT NULL,
    "Size" integer NOT NULL,
    "Data" bytea,
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedDate" timestamp with time zone,
    "CreatedBy" uuid,
    "ModifiedDate" timestamp with time zone,
    "ModifiedBy" uuid,
    CONSTRAINT "Documents_ContributionId_fkey" FOREIGN KEY ("ContributionId") REFERENCES "Contributions"("ContributionId") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "Documents_pkey" PRIMARY KEY ("DocumentId")
);
