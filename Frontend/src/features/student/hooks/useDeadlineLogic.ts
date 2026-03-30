import { useMemo } from "react";
import type { ContributionWindowInfo } from "@/types/contributionWindowType";

export interface DeadlineLogic {
    canSubmit: boolean;
    canEdit: boolean;
    daysToSubmission: number;
    daysToClosure: number;
    status: 'open' | 'submission-ended' | 'closed';
    submissionEndDate?: string;
    closureDate?: string;
}

export const useDeadlineLogic = (window?: ContributionWindowInfo | null): DeadlineLogic | null => {
    return useMemo(() => {
        if (!window) return null;

        const today = new Date();
        const submissionEnd = new Date(window.submissionEndDate || '');
        const finalClosure = new Date(window.closureDate || '');

        const daysToSubmission = Math.max(0, Math.ceil((submissionEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
        const daysToClosure = Math.max(0, Math.ceil((finalClosure.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

        let status: 'open' | 'submission-ended' | 'closed';
        if (today > finalClosure) {
            status = 'closed';
        } else if (today > submissionEnd) {
            status = 'submission-ended';
        } else {
            status = 'open';
        }

        return {
            canSubmit: today <= submissionEnd,
            canEdit: today <= finalClosure,
            daysToSubmission,
            daysToClosure,
            status,
            submissionEndDate: window.submissionEndDate,
            closureDate: window.closureDate,
        };
    }, [window]);
};

export const formatDeadlineDisplay = (deadline: DeadlineLogic): string => {
    if (!deadline) return 'No deadline information';

    const { daysToSubmission, daysToClosure, status } = deadline;

    switch (status) {
        case 'open':
            return `${daysToSubmission} days remaining to submit`;
        case 'submission-ended':
            return `Submission ended. You can still edit for ${daysToClosure} more days.`;
        case 'closed':
            return `Submission period closed.`;
        default:
            return 'Checking deadline status...';
    }
};

export const getDeadlineColor = (deadline: DeadlineLogic): string => {
    if (!deadline) return 'text-muted-foreground';

    const { daysToSubmission, daysToClosure, status } = deadline;

    if (status === 'closed') return 'text-destructive';
    if (status === 'submission-ended' && daysToClosure <= 7) return 'text-accent-foreground';
    if (daysToSubmission <= 3 && status === 'open') return 'text-accent-foreground';

    return 'text-primary';
};

export const getDeadlineUrgency = (deadline: DeadlineLogic): 'high' | 'medium' | 'low' => {
    if (!deadline) return 'low';

    const { daysToSubmission, daysToClosure, status } = deadline;

    if (status === 'closed') return 'high';
    if (daysToClosure <= 3) return 'high';
    if (daysToSubmission <= 7) return 'medium';

    return 'low';
};
