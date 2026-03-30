import type { ContributionCreateForm, ContributionUpdateForm } from "./contributionType";

export function toContributionCreateFormData(data: ContributionCreateForm): FormData {
    const fd = new FormData();

    fd.append("ContributionWindowId", data.contributionWindowId);
    fd.append("FacultyId", data.facultyId);
    fd.append("Subject", data.subject);
    fd.append("Description", data.description);
    fd.append("DocumentFile", data.documentFile);

    if (data.imageFile) {
        fd.append("ImageFile", data.imageFile);
    }

    return fd;
}

export function toContributionUpdateFormData(data: ContributionUpdateForm): FormData {
    const fd = new FormData();

    if (data.subject) {
        fd.append("Subject", data.subject);
    }

    if (data.description) {
        fd.append("Description", data.description);
    }

    if (data.documentFile) {
        fd.append("DocumentFile", data.documentFile);
    }

    if (data.imageFile) {
        fd.append("ImageFile", data.imageFile);
    }
    return fd;
}