import { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, LayoutGrid, List, Clock, AlertTriangle } from "lucide-react";
import { contributionApi } from "@/features/contribution/contributionApi";
import { ApiRoute } from "@/types/constantApiRoute";
import { ContributionStatus } from "@/types/contributionType";
import type { ContributionInfo, ContributionStatusValue } from "@/types/contributionType";
import { ContributionGrid } from "@/features/contribution/components/ContributionCard";
import { computeCommentDeadline, formatCommentDeadline, getCommentDeadlineBadgeColor } from "../hooks/useCommentDeadline";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

// ─── Status Filters (coordinator sees non-draft statuses) ───────────────────

const STATUS_FILTERS = [
    { label: "All", value: "all" },
    { label: "Submitted", value: ContributionStatus.Submitted },
    { label: "Under Review", value: ContributionStatus.UnderReview },
    { label: "Revision Req.", value: ContributionStatus.RevisionRequired },
    { label: "Approved", value: ContributionStatus.Approved },
    { label: "Selected", value: ContributionStatus.Selected },
    { label: "Rejected", value: ContributionStatus.Rejected },
] as const;


interface ReviewQueueProps {
    onViewDetails: (submission: ContributionInfo) => void;
    initialStatusFilter?: string;
}

export const ReviewQueueTable = ({ onViewDetails, initialStatusFilter }: ReviewQueueProps) => {
    const { user } = useAuth();
    const facultyName = user?.faculties?.[0]?.name;
    const [submissions, setSubmissions] = useState<ContributionInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || 'all');
    const [deadlineFilter, setDeadlineFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const loadSubmissions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await contributionApi.getList(
                { route: ApiRoute.Contribution.List, pageNumber: 1, pageSize: 100, searchKeyword: searchTerm },
                statusFilter !== 'all' ? statusFilter as ContributionStatusValue : undefined,
            );
            setSubmissions(response.items);
        } catch (error) {
            console.error('Failed to load review queue:', error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchTerm]);

    useEffect(() => {
        loadSubmissions();
    }, [loadSubmissions]);

    // Apply deadline filter client-side (deadline is computed from createdDate)
    const filteredSubmissions = useMemo(() => {
        let result = submissions;

        if (deadlineFilter !== 'all') {
            result = result.filter(s => {
                if (!s.createdDate) return false;
                const d = computeCommentDeadline(s.createdDate);
                if (deadlineFilter === 'overdue') return d.isOverdue;
                if (deadlineFilter === 'urgent') return d.isUrgent;
                if (deadlineFilter === 'normal') return !d.isOverdue && !d.isUrgent;
                return true;
            });
        }

        return result;
    }, [submissions, deadlineFilter]);

    // Deadline stats for the bar
    const deadlineStats = useMemo(() => {
        const stats = { overdue: 0, urgent: 0, normal: 0 };
        submissions.forEach(s => {
            if (!s.createdDate) return;
            const d = computeCommentDeadline(s.createdDate);
            if (d.isOverdue) stats.overdue++;
            else if (d.isUrgent) stats.urgent++;
            else stats.normal++;
        });
        return stats;
    }, [submissions]);

    return (
        <div className="space-y-6">
            {/* Deadline Summary Bar */}
            {(deadlineStats.overdue > 0 || deadlineStats.urgent > 0) && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
                    {deadlineStats.overdue > 0 && (
                        <button
                            onClick={() => setDeadlineFilter(deadlineFilter === 'overdue' ? 'all' : 'overdue')}
                            className={cn(
                                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                                deadlineFilter === 'overdue'
                                    ? "bg-destructive text-destructive-foreground"
                                    : "bg-destructive/10 text-destructive hover:bg-destructive/20",
                            )}
                        >
                            <AlertTriangle className="h-3 w-3" />
                            {deadlineStats.overdue} Overdue
                        </button>
                    )}
                    {deadlineStats.urgent > 0 && (
                        <button
                            onClick={() => setDeadlineFilter(deadlineFilter === 'urgent' ? 'all' : 'urgent')}
                            className={cn(
                                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                                deadlineFilter === 'urgent'
                                    ? "bg-chart-5 text-primary-foreground"
                                    : "bg-chart-5/10 text-chart-5 hover:bg-chart-5/20",
                            )}
                        >
                            <Clock className="h-3 w-3" />
                            {deadlineStats.urgent} Urgent
                        </button>
                    )}
                    <span className="text-xs text-muted-foreground">
                        {deadlineStats.normal} on track
                    </span>
                    {deadlineFilter !== 'all' && (
                        <button
                            onClick={() => setDeadlineFilter('all')}
                            className="ml-auto text-xs text-primary hover:underline"
                        >
                            Clear filter
                        </button>
                    )}
                </div>
            )}

            {/* Header & Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="font-display text-2xl font-semibold">Review Queue</h2>
                    <p className="text-sm text-muted-foreground">
                        {submissions.length} submission{submissions.length !== 1 ? 's' : ''} in your faculty
                    </p>
                </div>
            </div>

            {/* Status Filter Tabs + Search */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1.5">
                    {STATUS_FILTERS.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setStatusFilter(f.value)}
                            className={cn(
                                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                statusFilter === f.value
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-8 w-48 pl-8 text-sm"
                        />
                    </div>
                    <div className="flex rounded-lg border border-border">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "rounded-l-lg p-1.5",
                                viewMode === 'grid' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "rounded-r-lg p-1.5",
                                viewMode === 'list' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            <List className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <p className="text-muted-foreground">Loading review queue...</p>
                </div>
            ) : viewMode === 'grid' ? (
                <ContributionGrid
                    contributions={filteredSubmissions}
                    onView={onViewDetails}
                    coordinatorMode
                    facultyName={facultyName}
                    emptyMessage={
                        statusFilter !== 'all'
                            ? `No ${statusFilter.toLowerCase()} contributions.`
                            : 'No submissions pending review.'
                    }
                />
            ) : (
                <div className="space-y-2">
                    {filteredSubmissions.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No submissions found.
                            </CardContent>
                        </Card>
                    ) : (
                        filteredSubmissions.map(submission => {
                            const deadline = submission.createdDate ? computeCommentDeadline(submission.createdDate) : null;
                            return (
                                <Card
                                    key={submission.id}
                                    className="cursor-pointer transition-shadow hover:shadow-md"
                                    onClick={() => onViewDetails(submission)}
                                >
                                    <CardContent className="flex items-center gap-4 p-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{submission.subject}</p>
                                            <p className="truncate text-xs text-muted-foreground">{submission.description}</p>
                                        </div>
                                        {deadline && (
                                            <Badge className={cn("shrink-0 text-[10px]", getCommentDeadlineBadgeColor(deadline))}>
                                                <Clock className="mr-1 h-3 w-3" />
                                                {formatCommentDeadline(deadline)}
                                            </Badge>
                                        )}
                                        <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                                            {submission.status}
                                        </span>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};
