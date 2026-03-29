-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

COMMENT ON SCHEMA public IS 'standard public schema';
-- public."ContributionWindows" definition

-- Drop table

-- DROP TABLE "ContributionWindows";

CREATE TABLE "ContributionWindows" (
	"ContributionWindowId" uuid NOT NULL,
	"SubmissionOpenDate" timestamptz NOT NULL,
	"SubmissionEndDate" timestamptz NOT NULL,
	"ClosureDate" timestamptz NOT NULL,
	"AcademicYearStart" int4 NOT NULL,
	"AcademicYearEnd" int4 NOT NULL,
	"IsActive" bool DEFAULT true NOT NULL,
	"CreatedDate" timestamptz NULL,
	"CreatedBy" uuid NULL,
	"ModifiedDate" timestamptz NULL,
	"ModifiedBy" uuid NULL,
	CONSTRAINT "ContributionWindows_pkey" PRIMARY KEY ("ContributionWindowId")
);


-- public."Faculties" definition

-- Drop table

-- DROP TABLE "Faculties";

CREATE TABLE "Faculties" (
	"FacultyId" uuid NOT NULL,
	"FacultyName" varchar(200) NOT NULL,
	"IsActive" bool DEFAULT true NOT NULL,
	"CreatedDate" timestamptz NULL,
	"CreatedBy" uuid NULL,
	"ModifiedDate" timestamptz NULL,
	"ModifiedBy" uuid NULL,
	CONSTRAINT "Faculties_FacultyName_key" UNIQUE ("FacultyName"),
	CONSTRAINT "Faculties_pkey" PRIMARY KEY ("FacultyId")
);


-- public."Permissions" definition

-- Drop table

-- DROP TABLE "Permissions";

CREATE TABLE "Permissions" (
	"PermissionId" uuid NOT NULL,
	"Name" varchar(100) NOT NULL,
	"Module" varchar(50) NOT NULL,
	"Description" varchar(255) NULL,
	"IsActive" bool DEFAULT true NOT NULL,
	"CreatedDate" timestamptz NULL,
	"CreatedBy" uuid NULL,
	"ModifiedDate" timestamptz NULL,
	"ModifiedBy" uuid NULL,
	CONSTRAINT "Permissions_Name_key" UNIQUE ("Name"),
	CONSTRAINT "Permissions_pkey" PRIMARY KEY ("PermissionId")
);
CREATE UNIQUE INDEX "Permissions_Module_Name_idx" ON public."Permissions" USING btree ("Module", "Name");


-- public."Roles" definition

-- Drop table

-- DROP TABLE "Roles";

CREATE TABLE "Roles" (
	"RoleId" uuid NOT NULL,
	"Name" varchar(100) NOT NULL,
	"Description" varchar(255) NULL,
	"IsActive" bool DEFAULT true NOT NULL,
	"CreatedDate" timestamptz NULL,
	"CreatedBy" uuid NULL,
	"ModifiedDate" timestamptz NULL,
	"ModifiedBy" uuid NULL,
	CONSTRAINT "Roles_Name_key" UNIQUE ("Name"),
	CONSTRAINT "Roles_pkey" PRIMARY KEY ("RoleId")
);


-- public."Roles_Permissions" definition

-- Drop table

-- DROP TABLE "Roles_Permissions";

CREATE TABLE "Roles_Permissions" (
	"RoleId" uuid NOT NULL,
	"PermissionId" uuid NOT NULL,
	CONSTRAINT "Roles_Permissions_pkey" PRIMARY KEY ("RoleId", "PermissionId"),
	CONSTRAINT "Roles_Permissions_PermissionId_fkey" FOREIGN KEY ("PermissionId") REFERENCES "Permissions"("PermissionId") ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT "Roles_Permissions_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES "Roles"("RoleId") ON DELETE CASCADE ON UPDATE CASCADE
);


-- public."Users" definition

-- Drop table

-- DROP TABLE "Users";

CREATE TABLE "Users" (
	"UserId" uuid NOT NULL,
	"LoginId" varchar(50) NOT NULL,
	"Password" varchar(255) NOT NULL,
	"Email" varchar(100) NOT NULL,
	"FullName" varchar(200) NOT NULL,
	"LastLoginDate" timestamptz NULL,
	"LastLoginIp" varchar(50) NULL,
	"IsActive" bool DEFAULT true NOT NULL,
	"RefreshToken" varchar(200) NULL,
	"RefreshTokenExpiresAt" timestamptz NULL,
	"RoleId" uuid NOT NULL,
	"CreatedDate" timestamptz NULL,
	"CreatedBy" uuid NULL,
	"ModifiedDate" timestamptz NULL,
	"ModifiedBy" uuid NULL,
	CONSTRAINT "Users_Email_key" UNIQUE ("Email"),
	CONSTRAINT "Users_LoginId_key" UNIQUE ("LoginId"),
	CONSTRAINT "Users_pkey" PRIMARY KEY ("UserId"),
	CONSTRAINT "Users_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES "Roles"("RoleId") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE
);


-- public."Contributions" definition

-- Drop table

-- DROP TABLE "Contributions";

CREATE TABLE "Contributions" (
	"ContributionId" uuid NOT NULL,
	"UserId" uuid NOT NULL,
	"FacultyId" uuid NOT NULL,
	"ContributionWindowId" uuid NOT NULL,
	"Subject" varchar(100) NOT NULL,
	"Description" varchar(500) NOT NULL,
	"Rating" int4 NOT NULL,
	"Status" varchar(20) NOT NULL,
	"IsActive" bool DEFAULT true NOT NULL,
	"CreatedDate" timestamptz NULL,
	"CreatedBy" uuid NULL,
	"SubmittedDate" timestamptz NULL,
	"SubmittedBy" uuid NULL,
	"ReviewedDate" timestamptz NULL,
	"ReviewedBy" uuid NULL,
	"ModifiedDate" timestamptz NULL,
	"ModifiedBy" uuid NULL,
	"CommentedDate" timestamptz NULL,
	"CommentedBy" uuid NULL,
	CONSTRAINT "Contributions_pkey" PRIMARY KEY ("ContributionId"),
	CONSTRAINT "Contributions_ContributionWindowId_fkey" FOREIGN KEY ("ContributionWindowId") REFERENCES "ContributionWindows"("ContributionWindowId") ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT "Contributions_FacultyId_fkey" FOREIGN KEY ("FacultyId") REFERENCES "Faculties"("FacultyId") ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT "Contributions_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("UserId") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE
);


-- public."Documents" definition

-- Drop table

-- DROP TABLE "Documents";

CREATE TABLE "Documents" (
	"DocumentId" uuid NOT NULL,
	"ContributionId" uuid NOT NULL,
	"FileName" varchar(200) NOT NULL,
	"Extension" varchar(100) NOT NULL,
	"Size" int4 NOT NULL,
	"Data" bytea NULL,
	"IsActive" bool DEFAULT true NOT NULL,
	"CreatedDate" timestamptz NULL,
	"CreatedBy" uuid NULL,
	"ModifiedDate" timestamptz NULL,
	"ModifiedBy" uuid NULL,
	CONSTRAINT "Documents_FileName_key" UNIQUE ("FileName"),
	CONSTRAINT "Documents_pkey" PRIMARY KEY ("DocumentId"),
	CONSTRAINT "Documents_ContributionId_fkey" FOREIGN KEY ("ContributionId") REFERENCES "Contributions"("ContributionId") ON DELETE CASCADE ON UPDATE CASCADE
);


-- public."FacultyMemberShip" definition

-- Drop table

-- DROP TABLE "FacultyMemberShip";

CREATE TABLE "FacultyMemberShip" (
	"FacultyId" uuid NOT NULL,
	"UserId" uuid NOT NULL,
	CONSTRAINT "FacultyMemberShip_pkey" PRIMARY KEY ("FacultyId", "UserId"),
	CONSTRAINT "FacultyMemberShip_FacultyId_fkey" FOREIGN KEY ("FacultyId") REFERENCES "Faculties"("FacultyId") ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT "FacultyMemberShip_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("UserId") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE
);


-- public."UserActivityLogs" definition

-- Drop table

-- DROP TABLE "UserActivityLogs";

CREATE TABLE "UserActivityLogs" (
	"ActivityId" uuid NOT NULL,
	"UserId" uuid NULL,
	"EventType" varchar(20) NOT NULL,
	"Resource" varchar(200) NOT NULL,
	"HttpMethod" varchar(50) NULL,
	"StatusCode" varchar(10) NULL,
	"LoggedDate" timestamptz NULL,
	"DurationMs" int4 NULL,
	"IpAddress" varchar(100) NULL,
	"UserAgent" varchar(500) NULL,
	"Device" varchar(100) NULL,
	"Browser" varchar(100) NULL,
	"BrowserVersion" varchar(50) NULL,
	"OS" varchar(50) NULL,
	"OsVersion" varchar(50) NULL,
	CONSTRAINT "UserActivityLogs_pkey" PRIMARY KEY ("ActivityId"),
	CONSTRAINT "UserActivityLogs_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("UserId") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE
);


-- public."Comments" definition

-- Drop table

-- DROP TABLE "Comments";

CREATE TABLE "Comments" (
	"CommentId" uuid NOT NULL,
	"ContributionId" uuid NOT NULL,
	"Comment" varchar(500) NOT NULL,
	"IsActive" bool DEFAULT true NOT NULL,
	"CreatedDate" timestamptz NULL,
	"CreatedBy" uuid NULL,
	"ModifiedDate" timestamptz NULL,
	"ModifiedBy" uuid NULL,
	"Poster" varchar(200) NULL,
	CONSTRAINT "Comments_pkey" PRIMARY KEY ("CommentId"),
	CONSTRAINT "Comments_ContributionId_fkey" FOREIGN KEY ("ContributionId") REFERENCES "Contributions"("ContributionId") ON DELETE CASCADE ON UPDATE CASCADE
);


-- public."vw_BrowserList" source

CREATE OR REPLACE VIEW "vw_BrowserList"
AS SELECT "Browser",
    count(*) AS count
   FROM "UserActivityLogs"
  GROUP BY "Browser";


-- public."vw_ContributionCountByFacultyAcademicYear" source

CREATE OR REPLACE VIEW "vw_ContributionCountByFacultyAcademicYear"
AS SELECT f."FacultyName",
    w."AcademicYearStart",
    w."AcademicYearEnd",
    count(c."ContributionId") AS "TotalContributions"
   FROM "Contributions" c
     JOIN "Faculties" f ON c."FacultyId" = f."FacultyId"
     JOIN "ContributionWindows" w ON c."ContributionWindowId" = w."ContributionWindowId"
  GROUP BY f."FacultyName", w."ContributionWindowId";


-- public."vw_ContributionPercentageByFacultyAcademicYear" source

CREATE OR REPLACE VIEW "vw_ContributionPercentageByFacultyAcademicYear"
AS SELECT f."FacultyName",
    w."AcademicYearStart",
    w."AcademicYearEnd",
    count(c."ContributionId") AS "FacultyContributions",
    sum(count(c."ContributionId")) OVER (PARTITION BY w."ContributionWindowId") AS "YearTotalContributions",
    round(100.0 * count(c."ContributionId")::numeric / NULLIF(sum(count(c."ContributionId")) OVER (PARTITION BY w."ContributionWindowId"), 0::numeric), 2) AS "ContributionPercentage"
   FROM "Contributions" c
     JOIN "Faculties" f ON c."FacultyId" = f."FacultyId"
     JOIN "ContributionWindows" w ON c."ContributionWindowId" = w."ContributionWindowId"
  GROUP BY f."FacultyName", w."ContributionWindowId";


-- public."vw_ContributionsWithoutCommentAfter14Days" source

CREATE OR REPLACE VIEW "vw_ContributionsWithoutCommentAfter14Days"
AS SELECT c."ContributionId",
    c."FacultyId",
    f."FacultyName",
    c."ContributionWindowId",
    cw."AcademicYearStart",
    cw."AcademicYearEnd",
    c."UserId",
    u."FullName",
    c."Subject",
    c."SubmittedDate"
   FROM "Contributions" c
     LEFT JOIN "Comments" cm ON cm."ContributionId" = c."ContributionId"
     JOIN "Faculties" f ON f."FacultyId" = c."FacultyId"
     JOIN "ContributionWindows" cw ON cw."ContributionWindowId" = c."ContributionWindowId"
     JOIN "Users" u ON u."UserId" = c."UserId"
  WHERE c."CommentedDate" IS NULL AND c."SubmittedDate" <= (now() - '14 days'::interval);


-- public."vw_ContributionsWithoutComments" source

CREATE OR REPLACE VIEW "vw_ContributionsWithoutComments"
AS SELECT c."ContributionId",
    c."FacultyId",
    f."FacultyName",
    c."ContributionWindowId",
    cw."AcademicYearStart",
    cw."AcademicYearEnd",
    c."UserId",
    u."FullName",
    c."Subject",
    c."CreatedDate"
   FROM "Contributions" c
     LEFT JOIN "Comments" cm ON cm."ContributionId" = c."ContributionId"
     JOIN "Faculties" f ON f."FacultyId" = c."FacultyId"
     JOIN "ContributionWindows" cw ON cw."ContributionWindowId" = c."ContributionWindowId"
     JOIN "Users" u ON u."UserId" = c."UserId"
  WHERE c."CommentedDate" IS NULL;


-- public."vw_PageAccessCount" source

CREATE OR REPLACE VIEW "vw_PageAccessCount"
AS SELECT "Resource",
    count(*) AS count
   FROM "UserActivityLogs"
  WHERE "EventType"::text = 'FRONTEND_ROUTE'::text
  GROUP BY "Resource";


-- public."vw_UserActivityCount" source

CREATE OR REPLACE VIEW "vw_UserActivityCount"
AS SELECT "FullName",
    "UserId",
    count(*) AS count
   FROM ( SELECT l."ActivityId",
            u."UserId",
            u."FullName"
           FROM "UserActivityLogs" l
             JOIN "Users" u ON l."UserId" = u."UserId") t
  GROUP BY "UserId", "FullName"
  ORDER BY (count(*)) DESC;