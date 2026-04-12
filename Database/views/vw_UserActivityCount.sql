CREATE OR REPLACE VIEW public."vw_UserActivityCount" AS
 SELECT "FullName",
    "UserId",
    count(*) AS count
   FROM ( SELECT l."ActivityId",
            u."UserId",
            u."FullName"
           FROM "UserActivityLogs" l
             JOIN "Users" u ON l."UserId" = u."UserId") t
  GROUP BY "UserId", "FullName"
  ORDER BY (count(*)) DESC;
