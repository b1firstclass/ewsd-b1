CREATE OR REPLACE VIEW public."vw_ContributionCountByFacultyAcademicYear" AS
 SELECT f."FacultyName",
    w."AcademicYearStart",
    w."AcademicYearEnd",
    count(c."ContributionId") AS "TotalContributions"
   FROM "Contributions" c
     JOIN "Faculties" f ON c."FacultyId" = f."FacultyId"
     JOIN "ContributionWindows" w ON c."ContributionWindowId" = w."ContributionWindowId"
  GROUP BY f."FacultyName", w."ContributionWindowId";
