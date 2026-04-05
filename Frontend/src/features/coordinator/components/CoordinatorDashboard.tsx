import { useState, useEffect, useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { contributionApi } from "@/features/contribution/contributionApi";
import { ApiRoute } from "@/types/constantApiRoute";
import { ContributionStatus } from "@/types/contributionType";
import type { ContributionInfo } from "@/types/contributionType";
import { ContributionCard } from "@/features/contribution/components/ContributionCard";
import { ContributionDetailPanel } from "@/features/contribution/components/ContributionDetailPanel";
import { useCommentDeadlineStats, useCommentDeadlineAlerts } from "../hooks/useCommentDeadline";
import { useNavigate } from "@tanstack/react-router";
import {
    Eye, Send, CheckCircle, Star, XCircle, RotateCcw,
    AlertTriangle, ArrowRight, FileText,
} from "lucide-react";

// ─── Stat card config ───────────────────────────────────────────────────────

interface StatCardConfig {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    filterValue: string;
    accentClass: string;
}

const STAT_CARDS: StatCardConfig[] = [
    { label: "Submitted", icon: Send, filterValue: ContributionStatus.Submitted, accentClass: "text-primary" },
    { label: "Under Review", icon: Eye, filterValue: ContributionStatus.UnderReview, accentClass: "text-accent-foreground" },
    { label: "Revision Req.", icon: RotateCcw, filterValue: ContributionStatus.RevisionRequired, accentClass: "text-chart-5" },
    { label: "Approved", icon: CheckCircle, filterValue: ContributionStatus.Approved, accentClass: "text-chart-4" },
    { label: "Selected", icon: Star, filterValue: ContributionStatus.Selected, accentClass: "text-chart-2" },
    { label: "Rejected", icon: XCircle, filterValue: ContributionStatus.Rejected, accentClass: "text-destructive" },
];

export const CoordinatorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState<ContributionInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingId, setViewingId] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await contributionApi.getList({
                    route: ApiRoute.Contribution.List,
                    pageNumber: 1,
                    pageSize: 100,
                    searchKeyword: '',
                });
                setSubmissions(response.items);
            } catch (error) {
                console.error('Failed to load coordinator data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const reviewQueue = submissions.filter(s =>
        s.status === ContributionStatus.Submitted || s.status === ContributionStatus.UnderReview
    );
    const deadlineStats = useCommentDeadlineStats(reviewQueue);
    const alerts = useCommentDeadlineAlerts(reviewQueue);

    // 14-day compliance percentage
    const compliancePercent = useMemo(() => {
        if (deadlineStats.total === 0) return 100;
        return Math.round(((deadlineStats.total - deadlineStats.overdue) / deadlineStats.total) * 100);
    }, [deadlineStats]);

    const stats = useMemo(() => ({
        submitted: submissions.filter(s => s.status === ContributionStatus.Submitted).length,
        underReview: submissions.filter(s => s.status === ContributionStatus.UnderReview).length,
        approved: submissions.filter(s => s.status === ContributionStatus.Approved).length,
        selected: submissions.filter(s => s.status === ContributionStatus.Selected).length,
        rejected: submissions.filter(s => s.status === ContributionStatus.Rejected).length,
        revisionRequired: submissions.filter(s => s.status === ContributionStatus.RevisionRequired).length,
    }), [submissions]);

    const statValues: Record<string, number> = {
        [ContributionStatus.Submitted]: stats.submitted,
        [ContributionStatus.UnderReview]: stats.underReview,
        [ContributionStatus.RevisionRequired]: stats.revisionRequired,
        [ContributionStatus.Approved]: stats.approved,
        [ContributionStatus.Selected]: stats.selected,
        [ContributionStatus.Rejected]: stats.rejected,
    };

    const facultyName = user?.faculties?.[0]?.name;
    const indexedSubmissions = reviewQueue.map((item, index) => ({
                                item,
                                index,
                                }));

    const recentSubmissions = indexedSubmissions.slice(0, 4);

    const handleStatClick = (filterValue: string) => {
        navigate({ to: `/coordinator/review-queue?status=${encodeURIComponent(filterValue)}` });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Spinner label="Loading dashboard" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ── Welcome + CTA ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-xl font-semibold sm:text-2xl">
                        Welcome back, {user?.fullName || 'Coordinator'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Faculty submissions overview & review management
                    </p>
                </div>
                <Button
                    onClick={() => navigate({ to: '/coordinator/review-queue' })}
                    className="gap-2 shadow-md"
                    size="default"
                >
                    <Eye className="h-4 w-4" />
                    Go to Review Queue
                </Button>
            </div>

            {/* ── 14-Day Compliance Banner ──────────────────────────────── */}
            {reviewQueue.length > 0 && (
                <Card className={
                    alerts.critical > 0
                        ? 'border-l-4 border-l-destructive bg-destructive/5'
                        : alerts.high > 0
                        ? 'border-l-4 border-l-chart-5 bg-chart-5/5'
                        : 'border-l-4 border-l-chart-4 bg-chart-4/5'
                }>
                    <CardContent className="py-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className={`text-sm font-semibold ${
                                    alerts.critical > 0 ? 'text-destructive' : alerts.high > 0 ? 'text-chart-5' : 'text-chart-4'
                                }`}>
                                    {alerts.critical > 0 && <AlertTriangle className="mr-1.5 inline h-4 w-4" />}
                                    14-Day Comment Compliance
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {deadlineStats.overdue > 0
                                        ? `${deadlineStats.overdue} submission${deadlineStats.overdue > 1 ? 's' : ''} overdue — action required`
                                        : alerts.high > 0
                                        ? `${alerts.high} submission${alerts.high > 1 ? 's' : ''} due within 3 days`
                                        : 'All submissions on track — great job!'}
                                </p>
                            </div>
                            <div className="hidden items-center gap-3 sm:flex">
                                {deadlineStats.overdue > 0 && (
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-destructive">{deadlineStats.overdue}</p>
                                        <p className="text-[10px] text-muted-foreground">Overdue</p>
                                    </div>
                                )}
                                {alerts.high > 0 && (
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-chart-5">{alerts.high}</p>
                                        <p className="text-[10px] text-muted-foreground">Urgent</p>
                                    </div>
                                )}
                                <div className="text-center">
                                    <p className="text-xl font-bold text-chart-4">{deadlineStats.normal}</p>
                                    <p className="text-[10px] text-muted-foreground">On Track</p>
                                </div>
                            </div>
                        </div>

                        {/* Compliance progress bar */}
                        <div className="space-y-1">
                            <Progress value={compliancePercent} className="h-2" />
                            <div className="flex justify-between text-[11px] text-muted-foreground">
                                <span>{compliancePercent}% compliance rate</span>
                                <span>{reviewQueue.length} pending review</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Clickable Stats Grid ──────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {STAT_CARDS.map((card) => {
                    const count = statValues[card.filterValue] ?? 0;
                    const Icon = card.icon;
                    return (
                        <Card
                            key={card.filterValue}
                            className="group cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                            onClick={() => handleStatClick(card.filterValue)}
                        >
                            <CardContent className="flex flex-col items-center p-4 text-center">
                                <Icon className={`mb-1.5 h-4 w-4 ${card.accentClass} opacity-60 group-hover:opacity-100 transition-opacity`} />
                                <p className={`text-2xl font-bold ${card.accentClass}`}>{count}</p>
                                <p className="text-[11px] text-muted-foreground">{card.label}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* ── Recent Submissions (Cards) ────────────────────────────── */}
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-display text-lg font-semibold">Needs Your Review</h2>
                    {reviewQueue.length > 4 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-xs text-muted-foreground"
                            onClick={() => navigate({ to: '/coordinator/review-queue' })}
                        >
                            View all
                            <ArrowRight className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {recentSubmissions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {recentSubmissions.map(({ item, index }) => (
                            <ContributionCard
                                key={item.id}
                                contribution={item}
                                index={index}
                                onView={(c) => setViewingId(c.id)}
                                coordinatorMode
                                facultyName={facultyName}
                            />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center py-12 text-center">
                            <FileText className="mb-3 h-10 w-10 text-muted-foreground/30" />
                            <p className="text-muted-foreground">
                                No submissions pending review. All caught up!
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* ── Detail Panel ──────────────────────────────────────────── */}
            {viewingId && (
                <ContributionDetailPanel
                    contributionId={viewingId}
                    onClose={() => setViewingId(null)}
                    coordinatorMode
                />
            )}
        </div>
    );
};
