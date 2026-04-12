CREATE OR REPLACE VIEW public."vw_PageAccessCount" AS
 SELECT "Resource",
    count(*) AS count
   FROM "UserActivityLogs"
  WHERE "EventType"::text = 'FRONTEND_ROUTE'::text
  GROUP BY "Resource";
