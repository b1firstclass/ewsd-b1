export interface Faculity {
    id: string;
    name: string;
    isActive: boolean;
    createdDate: string;
}

export interface FaculityCreateRequest {
    name: string;
}

export interface FaculityUpdateRequest extends FaculityCreateRequest {
    isActive: boolean;
}

export interface FaculityListResponse {
    items: Faculity[];
}