CREATE OR REPLACE VIEW public."vw_ContributionsWithoutCommentAfter14Days" AS
 SELECT c."ContributionId",
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
  WHERE c."CommentedDate" IS NULL AND c."SubmittedDate" <= (now() - '14 days'::interval) AND c."Status"::text <> 'Draft'::text;
