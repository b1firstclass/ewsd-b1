CREATE TABLE public."UserActivityLogs" (
    "ActivityId" uuid NOT NULL,
    "UserId" uuid,
    "EventType" character varying(20) NOT NULL,
    "Resource" character varying(200) NOT NULL,
    "HttpMethod" character varying(50),
    "StatusCode" character varying(10),
    "LoggedDate" timestamp with time zone,
    "DurationMs" integer,
    "IpAddress" character varying(100),
    "UserAgent" character varying(500),
    "Device" character varying(100),
    "Browser" character varying(100),
    "BrowserVersion" character varying(50),
    "OS" character varying(50),
    "OsVersion" character varying(50),
    CONSTRAINT "UserActivityLogs_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("UserId") ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE,
    CONSTRAINT "UserActivityLogs_pkey" PRIMARY KEY ("ActivityId")
);
