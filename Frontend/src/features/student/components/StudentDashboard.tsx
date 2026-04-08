import { useState, useEffect, useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { contributionApi } from "@/features/contribution/contributionApi";
import { contributionWindowApi } from "@/features/contributionWindow/contributionWindowApi";
import { ApiRoute } from "@/types/constantApiRoute";
import { useDeadlineLogic, formatDeadlineDisplay, getDeadlineColor, getDeadlineUrgency } from "../hooks/useDeadlineLogic";
import { ContributionStatus } from "@/types/contributionType";
import type { ContributionInfo } from "@/types/contributionType";
import type { ContributionWindowInfo } from "@/types/contributionWindowType";
import { ContributionCard } from "@/features/contribution/components/ContributionCard";
import { ContributionDetailPanel } from "@/features/contribution/components/ContributionDetailPanel";
import { SubmissionFormModal } from "./SubmissionFormModal";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
    PlusCircle, FileText, Send, Eye, CheckCircle, Star,
    AlertCircle, Clock, ArrowRight, Sparkles,
} from "lucide-react";

// ─── Stat card config ───────────────────────────────────────────────────────

interface StatCardConfig {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    filterValue: string;
    accentClass: string;
}

const STAT_CARDS: StatCardConfig[] = [
    { label: "Total", icon: FileText, filterValue: "all", accentClass: "text-foreground" },
    { label: "Draft", icon: Clock, filterValue: ContributionStatus.Draft, accentClass: "text-muted-foreground" },
    { label: "Submitted", icon: Send, filterValue: ContributionStatus.Submitted, accentClass: "text-primary" },
    { label: "Under Review", icon: Eye, filterValue: ContributionStatus.UnderReview, accentClass: "text-accent-foreground" },
    { label: "Approved", icon: CheckCircle, filterValue: ContributionStatus.Approved, accentClass: "text-chart-4" },
    { label: "Selected", icon: Star, filterValue: ContributionStatus.Selected, accentClass: "text-chart-2" },
];

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (typeof error === "object" && error !== null) {
        const apiError = error as { response?: { data?: { message?: string } }; message?: string };
        return apiError.response?.data?.message || apiError.message || fallback;
    }
    return fallback;
};

export const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentWindow, setCurrentWindow] = useState<ContributionWindowInfo | null>(null);
    const [mySubmissions, setMySubmissions] = useState<ContributionInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingId, setViewingId] = useState<string | null>(null);
    const [formOpen, setFormOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [windowData, submissionsData] = await Promise.all([
                    contributionWindowApi.getList({ route: ApiRoute.ContributionWindow.List, pageNumber: 1, pageSize: 10, searchKeyword: '' }),
                    contributionApi.getList({ route: ApiRoute.Contribution.List, pageNumber: 1, pageSize: 100, searchKeyword: '' }),
                ]);
                const activeWindow = windowData.items.find(w => w.isActive) ?? null;
                setCurrentWindow(activeWindow);
                setMySubmissions(submissionsData.items);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const deadlineLogic = useDeadlineLogic(currentWindow);
    const deadlineColor = deadlineLogic ? getDeadlineColor(deadlineLogic) : 'text-muted-foreground';
    const deadlineUrgency = deadlineLogic ? getDeadlineUrgency(deadlineLogic) : 'low';

    // Compute deadline progress percentage
    const deadlineProgress = useMemo(() => {
        if (!currentWindow?.submissionOpenDate || !currentWindow?.submissionEndDate) return null;
        const start = new Date(currentWindow.submissionOpenDate).getTime();
        const end = new Date(currentWindow.submissionEndDate).getTime();
        const now = Date.now();
        if (now >= end) return 100;
        if (now <= start) return 0;
        return Math.round(((now - start) / (end - start)) * 100);
    }, [currentWindow]);

    const stats = useMemo(() => {
        const total = mySubmissions.length;
        const draft = mySubmissions.filter(s => s.status === ContributionStatus.Draft).length;
        const submitted = mySubmissions.filter(s => s.status === ContributionStatus.Submitted).length;
        const underReview = mySubmissions.filter(s => s.status === ContributionStatus.UnderReview).length;
        const approved = mySubmissions.filter(s => s.status === ContributionStatus.Approved).length;
        const selected = mySubmissions.filter(s => s.status === ContributionStatus.Selected).length;
        return { total, draft, submitted, underReview, approved, selected };
    }, [mySubmissions]);

    const statValues: Record<string, number> = {
        all: stats.total,
        [ContributionStatus.Draft]: stats.draft,
        [ContributionStatus.Submitted]: stats.submitted,
        [ContributionStatus.UnderReview]: stats.underReview,
        [ContributionStatus.Approved]: stats.approved,
        [ContributionStatus.Selected]: stats.selected,
    };

    const facultyName = user?.faculties?.[0]?.name;
    const indexedSubmissions = mySubmissions.map((item, index) => ({
                                            item,
                                            index,
                                            }));

    const recentSubmissions = indexedSubmissions.slice(0, 4);

    const handleStatClick = (filterValue: string) => {
        const search = filterValue !== 'all' ? `?status=${encodeURIComponent(filterValue)}` : '';
        navigate({ to: `/student/my-submissions${search}` });
    };

    const handleViewContribution = (c: ContributionInfo) => {
        setViewingId(c.id);
    };

    const handleRefresh = () => {
        // Re-fetch data
        setLoading(true);
        Promise.all([
            contributionWindowApi.getList({ route: ApiRoute.ContributionWindow.List, pageNumber: 1, pageSize: 10, searchKeyword: '' }),
            contributionApi.getList({ route: ApiRoute.Contribution.List, pageNumber: 1, pageSize: 100, searchKeyword: '' }),
        ]).then(([windowData, submissionsData]) => {
            const activeWindow = windowData.items.find(w => w.isActive) ?? null;
            setCurrentWindow(activeWindow);
            setMySubmissions(submissionsData.items);
        }).finally(() => setLoading(false));
    };

    const handleDeleteContribution = async (contribution: ContributionInfo) => {
        if (contribution.status !== ContributionStatus.Draft) {
            toast.error("Only draft contributions can be deleted.");
            return;
        }

        const confirmed = window.confirm(`Delete draft "${contribution.subject}"? This action cannot be undone.`);
        if (!confirmed) return;

        try {
            await contributionApi.delete(contribution.id);
            toast.success(`"${contribution.subject}" deleted.`);
            if (viewingId === contribution.id) {
                setViewingId(null);
            }
            handleRefresh();
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Failed to delete contribution"));
        }
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
                        Welcome back, {user?.fullName || 'Student'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Your contribution dashboard
                    </p>
                </div>
                {deadlineLogic?.canSubmit && (
                    <Button
                        onClick={() => setFormOpen(true)}
                        className="gap-2 shadow-md"
                        size="default"
                    >
                        <PlusCircle className="h-4 w-4" />
                        New Contribution
                    </Button>
                )}
            </div>

            {/* ── Deadline Banner with Progress ─────────────────────────── */}
            {deadlineLogic && (
                <Card className={
                    deadlineUrgency === 'high'
                        ? 'border-l-4 border-l-destructive bg-destructive/5'
                        : deadlineUrgency === 'medium'
                        ? 'border-l-4 border-l-accent bg-accent/5'
                        : 'border-l-4 border-l-primary bg-primary/5'
                }>
                    <CardContent className="py-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className={`text-sm font-semibold ${deadlineColor}`}>
                                    {deadlineUrgency === 'high' && <AlertCircle className="mr-1.5 inline h-4 w-4" />}
                                    Submission Deadline
                                </p>
                                <p className={`font-medium ${deadlineColor}`}>
                                    {formatDeadlineDisplay(deadlineLogic)}
                                </p>
                            </div>
                            {deadlineLogic.status !== 'closed' && (
                                <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {deadlineLogic.canSubmit ? 'Submissions open' : 'Edit only'}
                                </div>
                            )}
                        </div>

                        {/* Progress bar */}
                        {deadlineProgress !== null && (
                            <div className="space-y-1">
                                <Progress value={deadlineProgress} className="h-2" />
                                <div className="flex justify-between text-[11px] text-muted-foreground">
                                    <span>
                                        Submission Ends: {deadlineLogic.submissionEndDate ? new Date(deadlineLogic.submissionEndDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                    <span>
                                        Final Closure: {deadlineLogic.closureDate ? new Date(deadlineLogic.closureDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        )}
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

            {/* ── Recent Contributions (Cards) ──────────────────────────── */}
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-display text-lg font-semibold">Recent Contributions</h2>
                    {mySubmissions.length > 4 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-xs text-muted-foreground"
                            onClick={() => navigate({ to: '/student/my-submissions' })}
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
                                onView={handleViewContribution}
                                onDelete={handleDeleteContribution}
                                facultyName={facultyName}
                            />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center py-12 text-center">
                            <FileText className="mb-3 h-10 w-10 text-muted-foreground/30" />
                            <p className="text-muted-foreground">
                                No contributions yet.
                                {deadlineLogic?.canSubmit && ' Start by creating your first one!'}
                            </p>
                            {deadlineLogic?.canSubmit && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4 gap-1.5"
                                    onClick={() => setFormOpen(true)}
                                >
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    Create Contribution
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* ── Detail Panel ──────────────────────────────────────────── */}
            {viewingId && (
                <ContributionDetailPanel
                    contributionId={viewingId}
                    onClose={() => setViewingId(null)}
                    onDelete={() => {
                        setViewingId(null);
                        handleRefresh();
                    }}
                />
            )}

            {/* ── Submission Modal ───────────────────────────────────────── */}
            <SubmissionFormModal
                open={formOpen}
                onOpenChange={setFormOpen}
                onSuccess={handleRefresh}
            />
        </div>
    );
};
