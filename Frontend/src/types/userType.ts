import type { Faculity } from "./faculityType";
import type { Role } from "./roleType";

export interface User{
    id: string;
    loginId: string;
    email: string;
    fullName: string;
    isActive: boolean;
    createdDate: string;
    modifiedDate: string;
    faculties: Faculity[];
    role: Role;
}