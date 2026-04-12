CREATE TABLE public."FacultyMemberShip" (
    "FacultyId" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    CONSTRAINT "FacultyMemberShip_FacultyId_fkey" FOREIGN KEY ("FacultyId") REFERENCES "Faculties"("FacultyId") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "FacultyMemberShip_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("UserId") ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE,
    CONSTRAINT "FacultyMemberShip_pkey" PRIMARY KEY ("FacultyId", "UserId")
);
