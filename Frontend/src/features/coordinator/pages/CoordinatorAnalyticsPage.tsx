import { useState, useEffect, useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { contributionApi } from "@/features/contribution/contributionApi";
import { reportApi } from "@/features/report/reportApi";
import { ApiRoute } from "@/types/constantApiRoute";
import { ContributionStatus } from "@/types/contributionType";
import type { ContributionInfo } from "@/types/contributionType";
import type { ContributionsWithoutCommentInfo } from "@/types/reportType";
import { computeCommentDeadline } from "../hooks/useCommentDeadline";
import { cn } from "@/lib/utils";
import {
    BarChart3, Clock, AlertTriangle, CheckCircle2,
    TrendingUp, FileWarning,
} from "lucide-react";
import { TinyBarChart } from "@/components/charts/TinyBarChart";
import { TinyDoughnutChart } from "@/components/charts/TinyDoughnutChart";
import { useNavigate } from "@tanstack/react-router";

export const CoordinatorAnalyticsPage = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState<ContributionInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [exceptionFilter, setExceptionFilter] = useState<'all' | 'overdue'>('all');
    const [withoutComment, setWithoutComment] = useState<ContributionsWithoutCommentInfo[]>([]);
    const [withoutCommentAfter14Days, setWithoutCommentAfter14Days] = useState<ContributionsWithoutCommentInfo[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const [submissionsRes, withoutCommentRes, withoutComment14DaysRes] = await Promise.all([
                    contributionApi.getList({
                        route: ApiRoute.Contribution.List,
                        pageNumber: 1,
                        pageSize: 100,
                        searchKeyword: '',
                    }),
                    reportApi.getContributionsWithoutComment({
                        route: ApiRoute.Report.contributionsWithoutComment,
                        pageNumber: 1,
                        pageSize: 100,
                        searchKeyword: '',
                    }),
                    reportApi.getContributionsWithoutCommentAfter14Days({
                        route: ApiRoute.Report.contributionsWithoutCommentAfter14Days,
                        pageNumber: 1,
                        pageSize: 100,
                        searchKeyword: '',
                    }),
                ]);
                setSubmissions(submissionsRes.items);
                setWithoutComment(withoutCommentRes.items);
                setWithoutCommentAfter14Days(withoutComment14DaysRes.items);
            } catch (err) {
                console.error('Failed to load analytics:', err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    // ── Computed analytics ──────────────────────────────────────────────
    const analytics = useMemo(() => {
        const total = submissions.length;
        const statusCounts = {
            submitted: submissions.filter(s => s.status === ContributionStatus.Submitted).length,
            underReview: submissions.filter(s => s.status === ContributionStatus.UnderReview).length,
            approved: submissions.filter(s => s.status === ContributionStatus.Approved).length,
            selected: submissions.filter(s => s.status === ContributionStatus.Selected).length,
            rejected: submissions.filter(s => s.status === ContributionStatus.Rejected).length,
            revisionRequired: submissions.filter(s => s.status === ContributionStatus.RevisionRequired).length,
        };

        // 14-day compliance
        const needsComment = submissions.filter(s =>
            s.status === ContributionStatus.Submitted || s.status === ContributionStatus.UnderReview
        );
        const deadlines = needsComment.map(s => ({
            ...s,
            deadline: s.createdDate ? computeCommentDeadline(s.createdDate) : null,
        }));
        const overdue = deadlines.filter(d => d.deadline?.isOverdue);
        const urgent = deadlines.filter(d => d.deadline?.isUrgent);
        const onTrack = deadlines.filter(d => d.deadline && !d.deadline.isOverdue && !d.deadline.isUrgent);
        const complianceRate = needsComment.length > 0
            ? Math.round(((needsComment.length - overdue.length) / needsComment.length) * 100)
            : 100;

        // Exception Report should only include submitted contributions that still have no comments.
        // "All Pending" = submitted + without comment + within 14 days.
        // "Overdue Only" = submitted + without comment + exceeds 14 days.
        const submissionsById = new Map(submissions.map((submission) => [submission.id, submission]));

        const mapExceptionItem = (item: ContributionsWithoutCommentInfo, isOverdue: boolean) => {
            const createdDate = item.createdDate ?? undefined;
            const deadline = createdDate ? computeCommentDeadline(createdDate) : null;
            const daysElapsed = deadline?.daysElapsed ?? null;

            return {
                id: item.contributionId ?? `${item.facultyId ?? "unknown"}-${item.subject ?? "subject"}`,
                contributionId: item.contributionId,
                subject: item.subject ?? "Untitled",
                createdDate,
                facultyName: item.facultyName ?? "N/A",
                authorName: item.fullName ?? "N/A",
                isOverdue,
                daysRemaining: daysElapsed === null ? null : Math.max(0, 14 - daysElapsed),
                overdueDays: daysElapsed === null ? null : Math.max(0, daysElapsed - 14),
            };
        };

        const submittedWithoutComment = withoutComment.filter((item) => {
            if (!item.contributionId) return false;
            const contribution = submissionsById.get(item.contributionId);
            return contribution?.status === ContributionStatus.Submitted;
        });

        const overdueSubmittedIds = new Set(
            withoutCommentAfter14Days
                .map((item) => item.contributionId)
                .filter((id): id is string => {
                    if (!id) return false;
                    const contribution = submissionsById.get(id);
                    return contribution?.status === ContributionStatus.Submitted;
                }),
        );

        const pendingExceptions = submittedWithoutComment
            .filter((item) => item.contributionId && !overdueSubmittedIds.has(item.contributionId))
            .map((item) => mapExceptionItem(item, false));

        const overdueExceptions = withoutCommentAfter14Days
            .filter((item) => item.contributionId && overdueSubmittedIds.has(item.contributionId))
            .map((item) => mapExceptionItem(item, true));

        const exceptions = exceptionFilter === "overdue" ? overdueExceptions : pendingExceptions;

        // Status distribution for visual bar
        const statusDistribution = [
            { label: "Submitted", count: statusCounts.submitted, colorClass: "bg-primary" },
            { label: "Under Review", count: statusCounts.underReview, colorClass: "bg-accent" },
            { label: "Revision Req.", count: statusCounts.revisionRequired, colorClass: "bg-chart-5" },
            { label: "Approved", count: statusCounts.approved, colorClass: "bg-chart-4" },
            { label: "Selected", count: statusCounts.selected, colorClass: "bg-chart-2" },
            { label: "Rejected", count: statusCounts.rejected, colorClass: "bg-destructive" },
        ];

        // Approval rate
        const reviewed = statusCounts.approved + statusCounts.selected + statusCounts.rejected + statusCounts.revisionRequired;
        const approvalRate = reviewed > 0
            ? Math.round(((statusCounts.approved + statusCounts.selected) / reviewed) * 100)
            : 0;

        return {
            total, statusCounts, needsComment, deadlines,
            overdue, urgent, onTrack, complianceRate,
            exceptions, statusDistribution, approvalRate, reviewed,
            pendingExceptionsCount: pendingExceptions.length,
            overdueExceptionsCount: overdueExceptions.length,
        };
    }, [submissions, exceptionFilter, withoutComment, withoutCommentAfter14Days]);

    const statusChartData = useMemo(() => {
        const labels = analytics.statusDistribution.map((s) => s.label);
        const values = analytics.statusDistribution.map((s) => s.count);
        return { labels, values };
    }, [analytics.statusDistribution]);

    const complianceChartData = useMemo(() => {
        const labels = ["Compliant", "Overdue"];
        const compliantCount = analytics.needsComment.length - analytics.overdue.length;
        const values = [Math.max(compliantCount, 0), analytics.overdue.length];
        return { labels, values };
    }, [analytics.needsComment.length, analytics.overdue.length]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Spinner label="Loading analytics" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-display text-xl font-semibold sm:text-2xl">Coordinator Analytics</h1>
                <p className="text-sm text-muted-foreground">
                    Review performance, compliance tracking, and exception reports
                </p>
            </div>

            {/* ── KPI Cards ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <BarChart3 className="mx-auto mb-1 h-5 w-5 text-primary opacity-60" />
                        <p className="text-2xl font-bold text-foreground">{analytics.total}</p>
                        <p className="text-[11px] text-muted-foreground">Total Submissions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-chart-4 opacity-60" />
                        <p className="text-2xl font-bold text-chart-4">{analytics.complianceRate}%</p>
                        <p className="text-[11px] text-muted-foreground">14-Day Compliance</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <TrendingUp className="mx-auto mb-1 h-5 w-5 text-chart-2 opacity-60" />
                        <p className="text-2xl font-bold text-chart-2">{analytics.approvalRate}%</p>
                        <p className="text-[11px] text-muted-foreground">Approval Rate</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <AlertTriangle className="mx-auto mb-1 h-5 w-5 text-destructive opacity-60" />
                        <p className="text-2xl font-bold text-destructive">{analytics.overdue.length}</p>
                        <p className="text-[11px] text-muted-foreground">Overdue Reviews</p>
                    </CardContent>
                </Card>
            </div>

            {/* ── Status Distribution ──────────────────────────────────── */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        Status Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {analytics.total > 0 ? (
                        <div className="space-y-4">
                            {/* Stacked bar */}
                            <div className="flex h-6 overflow-hidden rounded-full">
                                {analytics.statusDistribution
                                    .filter(s => s.count > 0)
                                    .map((s) => (
                                        <div
                                            key={s.label}
                                            className={cn("transition-all", s.colorClass)}
                                            style={{ width: `${(s.count / analytics.total) * 100}%` }}
                                            title={`${s.label}: ${s.count}`}
                                        />
                                    ))}
                            </div>
                            {/* Legend */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                                {analytics.statusDistribution.map((s) => (
                                    <div key={s.label} className="flex items-center gap-1.5">
                                        <div className={cn("h-2.5 w-2.5 rounded-full", s.colorClass)} />
                                        <span className="text-xs text-muted-foreground">
                                            {s.label} ({s.count})
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="py-8 text-center text-muted-foreground">No submissions yet.</p>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Submission Status Chart</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analytics.total > 0 ? (
                            <TinyBarChart
                                labels={statusChartData.labels}
                                datasets={[
                                    {
                                        label: "Submissions",
                                        data: statusChartData.values,
                                        backgroundColor: "rgba(53, 162, 235, 0.6)",
                                    },
                                ]}
                            />
                        ) : (
                            <p className="py-6 text-center text-sm text-muted-foreground">No analytics data available.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">14-Day Compliance Share</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analytics.needsComment.length > 0 ? (
                            <TinyDoughnutChart
                                labels={complianceChartData.labels}
                                dataPoints={complianceChartData.values}
                                backgroundColor={["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"]}
                            />
                        ) : (
                            <p className="py-6 text-center text-sm text-muted-foreground">No analytics data available.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ── 14-Day Compliance Detail ─────────────────────────────── */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        14-Day Comment Compliance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {analytics.needsComment.length > 0 ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-center">
                                    <p className="text-xl font-bold text-destructive">{analytics.overdue.length}</p>
                                    <p className="text-[11px] text-muted-foreground">Overdue</p>
                                </div>
                                <div className="rounded-xl border border-chart-5/20 bg-chart-5/5 p-3 text-center">
                                    <p className="text-xl font-bold text-chart-5">{analytics.urgent.length}</p>
                                    <p className="text-[11px] text-muted-foreground">Urgent (≤3d)</p>
                                </div>
                                <div className="rounded-xl border border-chart-4/20 bg-chart-4/5 p-3 text-center">
                                    <p className="text-xl font-bold text-chart-4">{analytics.onTrack.length}</p>
                                    <p className="text-[11px] text-muted-foreground">On Track</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Progress value={analytics.complianceRate} className="h-2.5" />
                                <p className="text-xs text-muted-foreground text-right">
                                    {analytics.complianceRate}% compliant
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="py-6 text-center text-muted-foreground">
                            No submissions currently awaiting review.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* ── Exception Report ─────────────────────────────────────── */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileWarning className="h-4 w-4 text-muted-foreground" />
                            Exception Report — Pending Comments
                        </CardTitle>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setExceptionFilter('all')}
                                className={cn(
                                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                    exceptionFilter === 'all'
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                                )}
                            >
                                All Pending ({analytics.pendingExceptionsCount})
                            </button>
                            <button
                                onClick={() => setExceptionFilter('overdue')}
                                className={cn(
                                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                    exceptionFilter === 'overdue'
                                        ? "bg-destructive text-destructive-foreground"
                                        : "bg-destructive/10 text-destructive hover:bg-destructive/20",
                                )}
                            >
                                Overdue Only ({analytics.overdueExceptionsCount})
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {analytics.exceptions.length > 0 ? (
                        <div className="space-y-2">
                            {analytics.exceptions.map((item) => (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "flex items-center justify-between rounded-lg border border-border p-3",
                                        item.contributionId ? "cursor-pointer transition-colors hover:bg-muted/40" : "",
                                    )}
                                    role={item.contributionId ? "button" : undefined}
                                    tabIndex={item.contributionId ? 0 : undefined}
                                    onClick={() => {
                                        if (!item.contributionId) return;
                                        navigate({
                                            to: `/coordinator/review-queue?status=${encodeURIComponent(ContributionStatus.Submitted)}&contributionId=${encodeURIComponent(item.contributionId)}`,
                                        });
                                    }}
                                    onKeyDown={(event) => {
                                        if (!item.contributionId) return;
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            navigate({
                                                to: `/coordinator/review-queue?status=${encodeURIComponent(ContributionStatus.Submitted)}&contributionId=${encodeURIComponent(item.contributionId)}`,
                                            });
                                        }
                                    }}
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{item.subject}</p>
                                        <p className="text-xs text-muted-foreground">Student: {item.authorName}</p>
                                        <p className="text-xs text-muted-foreground">Faculty: {item.facultyName}</p>
                                        <p className="text-xs text-muted-foreground">Submitted: {item.createdDate ? new Date(item.createdDate).toLocaleDateString() : 'N/A'}</p>
                                        <p className={cn("text-xs", item.isOverdue ? "text-destructive" : "text-muted-foreground")}>
                                            {item.isOverdue
                                                ? `Overdue by ${item.overdueDays ?? 0} day${(item.overdueDays ?? 0) === 1 ? '' : 's'}`
                                                : `${item.daysRemaining ?? "N/A"} day${item.daysRemaining === 1 ? '' : 's'} remaining to comment`}
                                        </p>
                                    </div>
                                    <Badge className={cn("shrink-0 text-[10px]", item.isOverdue ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground")}>
                                        {item.isOverdue ? "Overdue" : "Pending"}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="py-8 text-center text-muted-foreground">
                            {exceptionFilter === 'overdue'
                                ? 'No overdue submissions — excellent compliance!'
                                : 'No submitted contributions awaiting comments within 14 days.'}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
