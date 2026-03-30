import { useMemo } from "react";

/**
 * Pure utility to compute comment deadline info from a submitted date.
 * The 14-day rule: coordinators must comment within 14 days of submission.
 */
export interface CommentDeadline {
    daysRemaining: number;
    isOverdue: boolean;
    isUrgent: boolean;
    status: 'normal' | 'urgent' | 'overdue';
    submittedDate: string;
    deadlineDate: string;
    daysElapsed: number;
    percentageComplete: number;
}

/** Pure function — safe to call anywhere (loops, callbacks, etc.) */
export const computeCommentDeadline = (submittedDate: string): CommentDeadline => {
    const submitted = new Date(submittedDate);
    const today = new Date();
    const deadlineDate = new Date(submitted);
    deadlineDate.setDate(deadlineDate.getDate() + 14);

    const daysElapsed = Math.floor((today.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    let status: 'normal' | 'urgent' | 'overdue';
    if (daysRemaining <= 0) status = 'overdue';
    else if (daysRemaining <= 3) status = 'urgent';
    else status = 'normal';

    return {
        daysRemaining,
        isOverdue: daysRemaining <= 0,
        isUrgent: daysRemaining <= 3 && daysRemaining > 0,
        status,
        submittedDate: submitted.toISOString(),
        deadlineDate: deadlineDate.toISOString(),
        daysElapsed,
        percentageComplete: Math.min(100, Math.max(0, (daysElapsed / 14) * 100)),
    };
};

/** React hook wrapper — memoized */
export const useCommentDeadline = (submittedDate: string): CommentDeadline => {
    return useMemo(() => computeCommentDeadline(submittedDate), [submittedDate]);
};

export const formatCommentDeadline = (deadline: CommentDeadline): string => {
    if (deadline.isOverdue) return `${Math.abs(deadline.daysRemaining)} days overdue`;
    if (deadline.isUrgent) return `${deadline.daysRemaining} days remaining (URGENT)`;
    return `${deadline.daysRemaining} days remaining`;
};

export const getCommentDeadlineColor = (deadline: CommentDeadline): string => {
    if (deadline.isOverdue) return 'text-destructive';
    if (deadline.isUrgent) return 'text-chart-5';
    return 'text-chart-4';
};

export const getCommentDeadlineBadgeColor = (deadline: CommentDeadline): string => {
    if (deadline.isOverdue) return 'bg-destructive/10 text-destructive border-destructive/20';
    if (deadline.isUrgent) return 'bg-chart-5/10 text-chart-5 border-chart-5/20';
    return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
};

/** Compute deadline stats from contributions (pure function) */
export const computeDeadlineStats = (submissions: Array<{ createdDate?: string }>) => {
    const stats = { total: submissions.length, normal: 0, urgent: 0, overdue: 0 };

    submissions.forEach(s => {
        if (!s.createdDate) return;
        const d = computeCommentDeadline(s.createdDate);
        if (d.isOverdue) stats.overdue++;
        else if (d.isUrgent) stats.urgent++;
        else stats.normal++;
    });

    return stats;
};

/** Hook version of stats */
export const useCommentDeadlineStats = (submissions: Array<{ createdDate?: string }>) => {
    return useMemo(() => computeDeadlineStats(submissions), [submissions]);
};

export const useCommentDeadlineAlerts = (submissions: Array<{ createdDate?: string }>) => {
    return useMemo(() => {
        const alerts = { critical: 0, high: 0, medium: 0, low: 0 };
        submissions.forEach(s => {
            if (!s.createdDate) return;
            const d = computeCommentDeadline(s.createdDate);
            if (d.isOverdue) alerts.critical++;
            else if (d.daysRemaining <= 3) alerts.high++;
            else if (d.daysRemaining <= 7) alerts.medium++;
            else alerts.low++;
        });
        return alerts;
    }, [submissions]);
};
