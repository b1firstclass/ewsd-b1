import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    FileText, CheckCircle, Star, Download, BarChart3, Award,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { contributionApi } from "@/features/contribution/contributionApi";
import { reportApi } from "@/features/report/reportApi";
import { ApiRoute } from "@/types/constantApiRoute";
import { ContributionStatus } from "@/types/contributionType";
import type { ContributionInfo } from "@/types/contributionType";
import type {
    ContributionCountByFacultyAcademicYearInfo,
    ContributionPercentageByFacultyAcademicYearInfo,
    ContributionsWithoutCommentInfo,
    FacultyUserCountInfo,
    TopContributorInfo,
} from "@/types/reportType";
import { useNavigate } from "@tanstack/react-router";
import { TinyBarChart } from "@/components/charts/TinyBarChart";
import { TinyDoughnutChart } from "@/components/charts/TinyDoughnutChart";
import { TinyHorizontalBarChart } from "@/components/charts/TinyHorizontalBarChart";

// ─── Component ──────────────────────────────────────────────────────────────
export const ManagerDashboard = () => {
    const navigate = useNavigate();
    const [contributions, setContributions] = useState<ContributionInfo[]>([]);
    const [countByFaculty, setCountByFaculty] = useState<ContributionCountByFacultyAcademicYearInfo[]>([]);
    const [percentageByFaculty, setPercentageByFaculty] = useState<ContributionPercentageByFacultyAcademicYearInfo[]>([]);
    const [facultyUserCount, setFacultyUserCount] = useState<FacultyUserCountInfo[]>([]);
    const [topContributors, setTopContributors] = useState<TopContributorInfo[]>([]);
    const [withoutComment, setWithoutComment] = useState<ContributionsWithoutCommentInfo[]>([]);
    const [withoutComment14Days, setWithoutComment14Days] = useState<ContributionsWithoutCommentInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState<string>("all");

    useEffect(() => {
        const load = async () => {
            // Load all data in parallel with proper error handling
            const results = await Promise.allSettled([
                contributionApi.getSelectedList({
                    route: ApiRoute.Contribution.getSelectedList,
                    pageNumber: 1,
                    pageSize: 100,
                    searchKeyword: "",
                }),
                reportApi.getContributionCountByFaculty(),
                reportApi.getContributionPercentageByFaculty(),
                reportApi.getFacultyUserCount(),
                reportApi.getTopContributors(),
                reportApi.getContributionsWithoutComment({
                    route: ApiRoute.Report.contributionsWithoutComment,
                    pageNumber: 1,
                    pageSize: 100,
                    searchKeyword: "",
                }),
                reportApi.getContributionsWithoutCommentAfter14Days({
                    route: ApiRoute.Report.contributionsWithoutCommentAfter14Days,
                    pageNumber: 1,
                    pageSize: 100,
                    searchKeyword: "",
                }),
            ]);

            // Handle results individually for resilience
            if (results[0].status === "fulfilled") setContributions(results[0].value.items);
            if (results[1].status === "fulfilled") setCountByFaculty(results[1].value);
            if (results[2].status === "fulfilled") setPercentageByFaculty(results[2].value);
            if (results[3].status === "fulfilled") setFacultyUserCount(results[3].value);
            if (results[4].status === "fulfilled") setTopContributors(results[4].value);
            if (results[5].status === "fulfilled") setWithoutComment(results[5].value.items);
            if (results[6].status === "fulfilled") setWithoutComment14Days(results[6].value.items);

            setLoading(false);
        };
        load();
    }, []);

    // ── Academic year options ────────────────────────────────────────────
    const academicYears = useMemo(() => {
        const years = countByFaculty
            .filter((item) => item.academicYearStart && item.academicYearEnd)
            .map((item) => `${item.academicYearStart}/${item.academicYearEnd}`);
        return [...new Set(years)].sort().reverse();
    }, [countByFaculty]);

    const scopedCountByFaculty = useMemo(() => {
        if (selectedYear === "all") return countByFaculty;
        const [startStr, endStr] = selectedYear.split("/");
        const startYear = Number(startStr);
        const endYear = Number(endStr);
        return countByFaculty.filter(
            (item) => item.academicYearStart === startYear && item.academicYearEnd === endYear
        );
    }, [countByFaculty, selectedYear]);

    const scopedPercentageByFaculty = useMemo(() => {
        if (selectedYear === "all") return percentageByFaculty;
        const [startStr, endStr] = selectedYear.split("/");
        const startYear = Number(startStr);
        const endYear = Number(endStr);
        return percentageByFaculty.filter(
            (item) => item.academicYearStart === startYear && item.academicYearEnd === endYear
        );
    }, [percentageByFaculty, selectedYear]);

    const stats = useMemo(() => {
        const totalSelected = contributions.length;
        const selectedCount = contributions.filter(c => c.status === ContributionStatus.Selected).length;
        const yearContributionTotal = scopedCountByFaculty.reduce((sum, item) => sum + item.totalContributions, 0);
        const contributorCount = topContributors.length;

        return {
            total: totalSelected,
            selected: selectedCount,
            selectionRate: totalSelected > 0 ? Math.round((selectedCount / totalSelected) * 100) : 100,
            facultyCount: scopedCountByFaculty.length,
            totalByYear: yearContributionTotal,
            contributorCount,
            topFaculty: scopedCountByFaculty.reduce((prev, current) =>
                prev.totalContributions > current.totalContributions ? prev : current,
                { facultyName: "N/A", totalContributions: 0, academicYearStart: null, academicYearEnd: null }
            ),
        };
    }, [contributions, scopedCountByFaculty, topContributors]);

    const statusDistribution = useMemo(() => {
        const statuses = [
            { status: ContributionStatus.Selected, label: "Selected", color: "bg-chart-2" },
            { status: ContributionStatus.Approved, label: "Approved", color: "bg-chart-4" },
            { status: ContributionStatus.UnderReview, label: "Under Review", color: "bg-chart-3" },
            { status: ContributionStatus.Submitted, label: "Submitted", color: "bg-chart-1" },
            { status: ContributionStatus.Draft, label: "Draft", color: "bg-muted" },
            { status: ContributionStatus.Rejected, label: "Rejected", color: "bg-destructive/20" },
            { status: ContributionStatus.RevisionRequired, label: "Revision Required", color: "bg-amber-500/20" },
        ];
        return statuses.map(s => ({
            ...s,
            count: contributions.filter(c => c.status === s.status).length,
            percentage: contributions.length > 0
                ? ((contributions.filter(c => c.status === s.status).length / contributions.length) * 100)
                : 0,
        }));
    }, [contributions]);

    const facultyChartData = useMemo(() => {
        const labels = scopedCountByFaculty.map((f) => f.facultyName ?? "N/A");
        const contributionData = scopedCountByFaculty.map((f) => f.totalContributions);
        const contributorData = scopedCountByFaculty.map(
            (f) => facultyUserCount.find((u) => u.facultyName === f.facultyName)?.count ?? 0
        );
        return { labels, contributionData, contributorData };
    }, [scopedCountByFaculty, facultyUserCount]);

    const facultyPercentageChartData = useMemo(() => {
        const labels = scopedPercentageByFaculty.map((p) => p.facultyName ?? "N/A");
        const dataPoints = scopedPercentageByFaculty.map((p) => p.contributionPercentage);
        return { labels, dataPoints };
    }, [scopedPercentageByFaculty]);

    const topContributorChartData = useMemo(() => {
        const top = topContributors.slice(0, 8);
        return {
            labels: top.map((c) => c.fullName),
            dataPoints: top.map((c) => c.contributionCount),
        };
    }, [topContributors]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Spinner label="Loading dashboard" />
            </div>
        );
    }

    const kpis = [
        { label: "Total Selected", value: stats.total, icon: FileText, color: "text-blue-600" },
        { label: "Selected Publications", value: `${stats.selected} (${stats.selectionRate}%)`, icon: CheckCircle, color: "text-green-600" },
        { label: "Active Faculties", value: stats.facultyCount, icon: Star, color: "text-purple-600" },
        { label: "Top Contributors", value: stats.contributorCount, icon: Award, color: "text-orange-600" },
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-xl font-semibold sm:text-2xl">Manager Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Marketing Manager overview of selected contributions across all faculties for publication.
                    </p>
                </div>
                <Button
                    size="sm"
                    className="gap-1.5 w-full sm:w-auto"
                    onClick={() => navigate({ to: "/manager/export-center" })}
                >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export Center</span>
                    <span className="sm:hidden">Export</span>
                </Button>
            </div>


            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {kpis.map((k) => (
                    <Card key={k.label}>
                        <CardContent className="flex flex-col items-start justify-between p-3 sm:p-4">
                            <div className="w-full">
                                <p className="text-xs text-muted-foreground">{k.label}</p>
                                <p className="text-lg sm:text-xl font-bold">{k.value}</p>
                            </div>
                            <div className={`flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-muted mt-2 sm:mt-0`}>
                                <k.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${k.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Status Distribution */}
            <Card>
                <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="text-base sm:text-lg">Contribution Status Overview</CardTitle>
                    <p className="text-xs text-muted-foreground hidden sm:block">Complete workflow status distribution across all contributions</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Stacked bar */}
                    <div className="mb-4 flex h-4 sm:h-6 w-full overflow-hidden rounded-full">
                        {statusDistribution.filter(s => s.count > 0).map(s => (
                            <div
                                key={s.status}
                                className={`${s.color} transition-all`}
                                style={{ width: `${s.percentage}%` }}
                                title={`${s.label}: ${s.count} (${s.percentage.toFixed(1)}%)`}
                            />
                        ))}
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-x-3 gap-y-2 sm:gap-x-4 sm:gap-y-1">
                        {statusDistribution.filter(s => s.count > 0).map(s => (
                            <div key={s.status} className="flex items-center gap-1.5 text-xs">
                                <span className={`inline-block h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${s.color}`} />
                                <span className="text-muted-foreground hidden sm:inline">{s.label}</span>
                                <span className="text-muted-foreground sm:hidden">{s.label.slice(0, 1)}</span>
                                <span className="font-medium">{s.count}</span>
                            </div>
                        ))}
                    </div>
                    {statusDistribution.every(s => s.count === 0) && (
                        <p className="text-center text-sm text-muted-foreground py-4">
                            No contributions found in current dataset.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Academic Year Selector + Faculty Breakdown */}
            <Card>
                <CardHeader className="flex-row items-start justify-between space-y-0 pb-3 sm:pb-6">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <BarChart3 className="h-4 w-4" />
                            Faculty Performance Analysis
                        </CardTitle>
                        <p className="text-xs text-muted-foreground hidden sm:block">Contribution metrics by academic year</p>
                    </div>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="rounded-md border border-border bg-background px-2 py-1 text-sm w-full sm:w-auto"
                    >
                        <option value="all">All Academic Years</option>
                        {academicYears.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </CardHeader>
                <CardContent>
                    {scopedCountByFaculty.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">No faculty report data found for this academic year.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left">
                                        <th className="pb-2 font-medium text-muted-foreground">Faculty</th>
                                        <th className="pb-2 text-right font-medium text-muted-foreground hidden sm:table-cell">Contributions</th>
                                        <th className="pb-2 text-right font-medium text-muted-foreground hidden md:table-cell">Contributors</th>
                                        <th className="pb-2 text-right font-medium text-muted-foreground">Share %</th>
                                        <th className="pb-2 text-center font-medium text-muted-foreground hidden lg:table-cell">Performance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scopedCountByFaculty.map((f) => {
                                        const percentage = scopedPercentageByFaculty.find(
                                            (p) =>
                                                p.facultyName === f.facultyName &&
                                                p.academicYearStart === f.academicYearStart &&
                                                p.academicYearEnd === f.academicYearEnd
                                        );
                                        const contributors = facultyUserCount.find((u) => u.facultyName === f.facultyName);
                                        const performance = f.totalContributions > 10 ? "High" : f.totalContributions > 5 ? "Medium" : "Low";
                                        const performanceColor = performance === "High" ? "text-green-600" : performance === "Medium" ? "text-yellow-600" : "text-red-600";
                                        
                                        return (
                                            <tr key={`${f.facultyName}-${f.academicYearStart}`} className="border-b border-border/50 last:border-0">
                                                <td className="py-2 sm:py-2.5 font-medium text-xs sm:text-sm">{f.facultyName ?? "N/A"}</td>
                                                <td className="py-2 sm:py-2.5 text-right tabular-nums font-semibold text-xs sm:text-sm hidden sm:table-cell">{f.totalContributions}</td>
                                                <td className="py-2 sm:py-2.5 text-right tabular-nums text-xs sm:text-sm hidden md:table-cell">{contributors?.count ?? 0}</td>
                                                <td className="py-2 sm:py-2.5 text-right tabular-nums text-xs sm:text-sm">
                                                    {percentage ? `${percentage.contributionPercentage.toFixed(1)}%` : "0.0%"}
                                                </td>
                                                <td className="py-2 sm:py-2.5 text-center hidden lg:table-cell">
                                                    <span className={`text-xs font-medium ${performanceColor}`}>{performance}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader className="pb-3 sm:pb-6">
                        <CardTitle className="text-base sm:text-lg">Faculty Contributions vs Contributors</CardTitle>
                        <p className="text-xs text-muted-foreground hidden sm:block">Comparative analysis by faculty</p>
                    </CardHeader>
                    <CardContent>
                        {facultyChartData.labels.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">No analytics data available.</p>
                        ) : (
                            <TinyBarChart
                                labels={facultyChartData.labels}
                                datasets={[
                                    {
                                        label: "Contributions",
                                        data: facultyChartData.contributionData,
                                        backgroundColor: "rgba(59, 130, 246, 0.8)", // Blue
                                    },
                                    {
                                        label: "Contributors",
                                        data: facultyChartData.contributorData,
                                        backgroundColor: "rgba(16, 185, 129, 0.8)", // Green
                                    },
                                ]}
                            />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3 sm:pb-6">
                        <CardTitle className="text-base sm:text-lg">Faculty Share Distribution</CardTitle>
                        <p className="text-xs text-muted-foreground hidden sm:block">Percentage contribution by faculty</p>
                    </CardHeader>
                    <CardContent>
                        {facultyPercentageChartData.labels.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">No analytics data available.</p>
                        ) : (
                            <TinyDoughnutChart
                                labels={facultyPercentageChartData.labels}
                                dataPoints={facultyPercentageChartData.dataPoints}
                                backgroundColor={[
                                    "rgba(59, 130, 246, 0.8)",   // Blue
                                    "rgba(16, 185, 129, 0.8)",   // Green
                                    "rgba(245, 158, 11, 0.8)",   // Amber
                                    "rgba(239, 68, 68, 0.8)",    // Red
                                    "rgba(139, 92, 246, 0.8)",   // Purple
                                    "rgba(236, 72, 153, 0.8)",   // Pink
                                ]}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="text-base sm:text-lg">Comment Tracking Reports</CardTitle>
                    <p className="text-xs text-muted-foreground hidden sm:block">14-day comment deadline monitoring</p>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border p-3 sm:p-4">
                        <p className="text-xs text-muted-foreground">Contributions Without Comment</p>
                        <p className="mt-1 text-xl sm:text-2xl font-bold">{withoutComment.length}</p>
                    </div>
                    <div className="rounded-lg border border-border p-3 sm:p-4">
                        <p className="text-xs text-muted-foreground">Overdue Comments (14+ Days)</p>
                        <p className="mt-1 text-xl sm:text-2xl font-bold text-destructive">{withoutComment14Days.length}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="text-base sm:text-lg">Top Contributors</CardTitle>
                    <p className="text-xs text-muted-foreground hidden sm:block">Highest performing contributors</p>
                </CardHeader>
                <CardContent>
                    {topContributorChartData.labels.length > 0 && (
                        <div className="mb-4">
                            <TinyHorizontalBarChart
                                labels={topContributorChartData.labels}
                                dataPoints={topContributorChartData.dataPoints}
                                label="Contributions"
                                color="rgba(245, 158, 11, 0.8)" // Amber
                            />
                        </div>
                    )}
                    {topContributors.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            No analytics data available.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left">
                                        <th className="pb-2 font-medium text-muted-foreground">Rank</th>
                                        <th className="pb-2 font-medium text-muted-foreground hidden sm:table-cell">Contributor</th>
                                        <th className="pb-2 font-medium text-muted-foreground">Faculty</th>
                                        <th className="pb-2 text-right font-medium text-muted-foreground">Contributions</th>
                                        <th className="pb-2 text-center font-medium text-muted-foreground hidden md:table-cell">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topContributors.slice(0, 8).map((item, index) => {
                                        const rank = index + 1;
                                        const rankColor = rank === 1 ? "bg-yellow-100 text-yellow-800" : rank === 2 ? "bg-gray-100 text-gray-800" : rank === 3 ? "bg-orange-100 text-orange-800" : "bg-muted text-muted-foreground";
                                        const status = item.contributionCount > 5 ? "Star" : item.contributionCount > 2 ? "Active" : "Regular";
                                        const statusColor = status === "Star" ? "text-green-600" : status === "Active" ? "text-blue-600" : "text-gray-600";
                                        
                                        return (
                                            <tr key={item.userId} className="border-b border-border/50 last:border-0">
                                                <td className="py-2 sm:py-2.5">
                                                    <span className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs font-bold ${rankColor}`}>
                                                        {rank}
                                                    </span>
                                                </td>
                                                <td className="py-2 sm:py-2.5 font-medium text-xs sm:text-sm hidden sm:table-cell">{item.fullName}</td>
                                                <td className="py-2 sm:py-2.5 text-muted-foreground text-xs sm:text-sm">{item.facultyName}</td>
                                                <td className="py-2 sm:py-2.5 text-right tabular-nums font-semibold text-xs sm:text-sm">{item.contributionCount}</td>
                                                <td className="py-2 sm:py-2.5 text-center hidden md:table-cell">
                                                    <span className={`text-xs font-medium ${statusColor}`}>{status}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Selected contributions preview */}
            <Card>
                <CardHeader className="flex-row items-start justify-between space-y-0 pb-3 sm:pb-6">
                    <div className="space-y-1">
                        <CardTitle className="text-base sm:text-lg">Selected for Publication</CardTitle>
                        <p className="text-xs text-muted-foreground hidden sm:block">Contributions approved for publication</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate({ to: "/manager/export-center" })}
                        className="w-full sm:w-auto"
                    >
                        View All ({contributions.length})
                    </Button>
                </CardHeader>
                <CardContent>
                    {contributions.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            No contributions have been selected for publication yet.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {contributions.slice(0, 5).map(c => (
                                <div
                                    key={c.id}
                                    className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                                >
                                    <div className="min-w-0 flex-1 pr-2">
                                        <p className="truncate text-sm font-medium">{c.subject}</p>
                                        <p className="truncate text-xs text-muted-foreground hidden sm:block">{c.description}</p>
                                        <p className="truncate text-xs text-muted-foreground sm:hidden">{c.description.slice(0, 50)}...</p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-chart-2 px-2 py-0.5 text-xs font-medium text-primary-foreground">
                                        Selected
                                    </span>
                                </div>
                            ))}
                            {contributions.length > 5 && (
                                <p className="text-center text-xs text-muted-foreground pt-2">
                                    +{contributions.length - 5} more
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
