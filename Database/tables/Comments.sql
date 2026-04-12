CREATE TABLE public."Comments" (
    "CommentId" uuid NOT NULL,
    "ContributionId" uuid NOT NULL,
    "Comment" character varying(500) NOT NULL,
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedDate" timestamp with time zone,
    "CreatedBy" uuid,
    "ModifiedDate" timestamp with time zone,
    "ModifiedBy" uuid,
    "Poster" character varying(200),
    CONSTRAINT "Comments_ContributionId_fkey" FOREIGN KEY ("ContributionId") REFERENCES "Contributions"("ContributionId") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "Comments_pkey" PRIMARY KEY ("CommentId")
);
