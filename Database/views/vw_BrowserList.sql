CREATE OR REPLACE VIEW public."vw_BrowserList" AS
 SELECT "Browser",
    count(*) AS count
   FROM "UserActivityLogs"
  GROUP BY "Browser";
