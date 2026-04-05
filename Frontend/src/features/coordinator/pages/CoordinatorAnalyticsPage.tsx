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

export const CoordinatorAnalyticsPage = () => {
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

        // Exception report from backend report views.
        // Backend is source of truth for 14-day rule (will be switched to SubmittedDate basis).
        const exceptions = exceptionFilter === 'overdue'
            ? withoutCommentAfter14Days.map(item => ({
                id: item.contributionId ?? `${item.facultyId ?? "unknown"}-${item.subject ?? "subject"}`,
                subject: item.subject ?? 'Untitled',
                createdDate: item.createdDate ?? undefined,
                facultyName: item.facultyName ?? "N/A",
                authorName: item.fullName ?? "N/A",
                isOverdue: true,
            }))
            : withoutComment.map(item => ({
                id: item.contributionId ?? `${item.facultyId ?? "unknown"}-${item.subject ?? "subject"}`,
                subject: item.subject ?? 'Untitled',
                createdDate: item.createdDate ?? undefined,
                facultyName: item.facultyName ?? "N/A",
                authorName: item.fullName ?? "N/A",
                isOverdue: withoutCommentAfter14Days.some(
                    (overdue) => overdue.contributionId && overdue.contributionId === item.contributionId
                ),
            }));

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
                                All Pending
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
                                Overdue Only
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
                                    className="flex items-center justify-between rounded-lg border border-border p-3"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{item.subject}</p>
                                        <p className="text-xs text-muted-foreground">Student: {item.authorName}</p>
                                        <p className="text-xs text-muted-foreground">Faculty: {item.facultyName}</p>
                                        <p className="text-xs text-muted-foreground">Submitted: {item.createdDate ? new Date(item.createdDate).toLocaleDateString() : 'N/A'}</p>
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
                                : 'No submissions awaiting comments.'}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
