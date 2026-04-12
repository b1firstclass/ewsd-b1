CREATE OR REPLACE VIEW public."vw_ContributionPercentageByFacultyAcademicYear" AS
 SELECT f."FacultyName",
    w."AcademicYearStart",
    w."AcademicYearEnd",
    count(c."ContributionId") AS "FacultyContributions",
    sum(count(c."ContributionId")) OVER (PARTITION BY w."ContributionWindowId") AS "YearTotalContributions",
    round(100.0 * count(c."ContributionId")::numeric / NULLIF(sum(count(c."ContributionId")) OVER (PARTITION BY w."ContributionWindowId"), 0::numeric), 2) AS "ContributionPercentage"
   FROM "Contributions" c
     JOIN "Faculties" f ON c."FacultyId" = f."FacultyId"
     JOIN "ContributionWindows" w ON c."ContributionWindowId" = w."ContributionWindowId"
  GROUP BY f."FacultyName", w."ContributionWindowId";
