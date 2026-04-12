CREATE TABLE public."ContributionWindows" (
    "ContributionWindowId" uuid NOT NULL,
    "SubmissionOpenDate" timestamp with time zone NOT NULL,
    "SubmissionEndDate" timestamp with time zone NOT NULL,
    "ClosureDate" timestamp with time zone NOT NULL,
    "AcademicYearStart" integer NOT NULL,
    "AcademicYearEnd" integer NOT NULL,
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedDate" timestamp with time zone,
    "CreatedBy" uuid,
    "ModifiedDate" timestamp with time zone,
    "ModifiedBy" uuid,
    CONSTRAINT "ContributionWindows_pkey" PRIMARY KEY ("ContributionWindowId")
);
