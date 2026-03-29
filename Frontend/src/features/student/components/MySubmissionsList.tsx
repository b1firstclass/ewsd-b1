import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, LayoutGrid, List } from "lucide-react";
import { contributionApi } from "@/features/contribution/contributionApi";
import { ApiRoute } from "@/types/constantApiRoute";
import { ContributionStatus } from "@/types/contributionType";
import { ContributionGrid } from "@/features/contribution/components/ContributionCard";
import type { ContributionInfo, ContributionStatusValue } from "@/types/contributionType";
import { toast } from "sonner";

interface MySubmissionsListProps {
    onCreateNew: () => void;
    onEditSubmission: (submission: ContributionInfo) => void;
    onViewSubmission: (submission: ContributionInfo) => void;
    /** Pre-selected status filter from URL */
    initialStatusFilter?: string;
}

const STATUS_FILTERS = [
    { label: "All", value: "all" },
    { label: "Draft", value: ContributionStatus.Draft },
    { label: "Submitted", value: ContributionStatus.Submitted },
    { label: "Reviewing", value: ContributionStatus.UnderReview },
    { label: "Revision", value: ContributionStatus.RevisionRequired },
    { label: "Approved", value: ContributionStatus.Approved },
    { label: "Selected", value: ContributionStatus.Selected },
    { label: "Rejected", value: ContributionStatus.Rejected },
] as const;

export const MySubmissionsList = ({ onCreateNew, onEditSubmission, onViewSubmission, initialStatusFilter }: MySubmissionsListProps) => {
    const [submissions, setSubmissions] = useState<ContributionInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || 'all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const loadSubmissions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await contributionApi.getList(
                { route: ApiRoute.Contribution.List, pageNumber: 1, pageSize: 100, searchKeyword: searchTerm },
                statusFilter !== 'all' ? statusFilter as ContributionStatusValue : undefined
            );
            setSubmissions(response.items);
        } catch (error) {
            console.error('Failed to load submissions:', error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchTerm]);

    useEffect(() => {
        loadSubmissions();
    }, [loadSubmissions]);

    // Compute counts from all submissions (unfiltered) — we could cache this
    const filteredSubmissions = useMemo(() => {
        if (!searchTerm) return submissions;
        const term = searchTerm.toLowerCase();
        return submissions.filter(s =>
            s.subject.toLowerCase().includes(term) ||
            s.description.toLowerCase().includes(term)
        );
    }, [submissions, searchTerm]);

    const handleSubmitContribution = useCallback(async (contribution: ContributionInfo) => {
        try {
            await contributionApi.submit(contribution.id);
            toast.success(`"${contribution.subject}" submitted for review!`);
            loadSubmissions();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to submit');
        }
    }, [loadSubmissions]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="font-display text-2xl font-semibold">My Contributions</h2>
                    <p className="text-sm text-muted-foreground">
                        {submissions.length} contribution{submissions.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button onClick={onCreateNew} size="sm">
                    <Plus className="mr-1.5 h-4 w-4" />
                    New Contribution
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Status Tabs */}
                <div className="flex flex-wrap gap-1.5">
                    {STATUS_FILTERS.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setStatusFilter(f.value)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                statusFilter === f.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Search + View Toggle */}
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
                            className={`rounded-l-lg p-1.5 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            title="Grid view"
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`rounded-r-lg p-1.5 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            title="List view"
                        >
                            <List className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <p className="text-muted-foreground">Loading contributions...</p>
                </div>
            ) : viewMode === 'grid' ? (
                /* Pinterest Masonry Grid */
                <ContributionGrid
                    contributions={filteredSubmissions}
                    onView={onViewSubmission}
                    onEdit={onEditSubmission}
                    onSubmit={handleSubmitContribution}
                    emptyMessage={
                        searchTerm
                            ? 'No contributions match your search.'
                            : statusFilter !== 'all'
                            ? `No ${statusFilter.toLowerCase()} contributions.`
                            : 'No contributions yet. Create your first one!'
                    }
                />
            ) : (
                /* Compact List View */
                <div className="space-y-2">
                    {filteredSubmissions.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No contributions found.
                            </CardContent>
                        </Card>
                    ) : (
                        filteredSubmissions.map(submission => (
                            <Card
                                key={submission.id}
                                className="cursor-pointer transition-shadow hover:shadow-md"
                                onClick={() => onViewSubmission(submission)}
                            >
                                <CardContent className="flex items-center gap-4 p-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{submission.subject}</p>
                                        <p className="truncate text-xs text-muted-foreground">{submission.description}</p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                                        {submission.status}
                                    </span>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
