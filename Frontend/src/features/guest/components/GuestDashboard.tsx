import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
    ArrowRight,
    BookOpenText,
    Eye,
    History,
    Sparkles,
    Star,
    Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/AuthContext";
import { ContributionGrid } from "@/features/contribution/components/ContributionCard";
import { contributionApi } from "@/features/contribution/contributionApi";
import { FacultyTimeline } from "@/features/guest/components/FacultyTimeline";
import {
    RECENT_ACTIVITY_WINDOW_DAYS,
    formatGuestDate,
    formatGuestRelativeDate,
    getContributionContributorName,
    getGuestContributionInsights,
} from "@/features/guest/utils/guestContributionInsights";
import { ApiRoute } from "@/types/constantApiRoute";
import type { ContributionInfo } from "@/types/contributionType";

interface GuestDashboardProps {
    onView?: (contribution: ContributionInfo) => void;
}

const usageTips = [
    {
        title: "Open full contribution details",
        description: "Review documents, subject, description, and editorial metadata from one side panel.",
        icon: Eye,
    },
    {
        title: "Read comment history only",
        description: "Guests can review the comment trail, but new comments stay disabled for a clean read-only workflow.",
        icon: History,
    },
    {
        title: "Browse the full faculty archive",
        description: "Use the selected contributions page to search by keyword, filter by year, and sort the archive faster.",
        icon: BookOpenText,
    },
] as const;

export const GuestDashboard = ({ onView }: GuestDashboardProps = {}) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [contributions, setContributions] = useState<ContributionInfo[]>([]);
    const [loading, setLoading] = useState(true);

    const guestFaculty = user?.faculties?.[0];

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await contributionApi.getSelectedList({
                    route: ApiRoute.Contribution.getSelectedList,
                    pageNumber: 1,
                    pageSize: 100,
                    searchKeyword: "",
                });
                setContributions(response.items);
            } catch (error) {
                console.error("Failed to load guest data:", error);
            } finally {
                setLoading(false);
            }
        };

        void loadData();
    }, []);

    const insights = useMemo(() => getGuestContributionInsights(contributions), [contributions]);
    const featuredContribution = insights.topRatedContribution ?? insights.latestContribution;
    const latestPreview = insights.newestContributions.slice(0, 4);
    const archiveCoverageValue = insights.activeYears > 0
        ? `${insights.activeYears} year${insights.activeYears > 1 ? "s" : ""}`
        : "No archive yet";
    const archiveCoverageHelper = insights.activeYears > 1
        ? `Coverage from ${insights.archiveSpanLabel}`
        : insights.activeYears === 1
            ? `Coverage focused on ${insights.archiveSpanLabel.replace(" only", "")}`
            : "Waiting for selected contributions";
    const snapshotItems = [
        {
            label: "Archive",
            value: insights.totalSelected,
            helper: `${insights.totalSelected === 1 ? "selection" : "selections"} ready to explore`,
        },
        {
            label: "Contributors",
            value: insights.contributorCount,
            helper: `${insights.contributorCount === 1 ? "author" : "authors"} represented`,
        },
        {
            label: "Coverage",
            value: archiveCoverageValue,
            helper: archiveCoverageHelper,
        },
    ];
    const snapshotRows = [
        {
            label: "New this year",
            value: insights.thisYearCount,
            detail: `Selections added during ${new Date().getFullYear()}`,
        },
        {
            label: "Recent activity",
            value: insights.recentCount,
            detail: `Updated in the last ${RECENT_ACTIVITY_WINDOW_DAYS} days`,
        },
        {
            label: "Average rating",
            value: insights.averageRating ? `${insights.averageRating.toFixed(1)}/5` : "Not rated",
            detail: insights.ratedCount > 0
                ? `${insights.ratedCount} rated ${insights.ratedCount === 1 ? "selection" : "selections"}`
                : "Ratings will appear once assigned",
        },
        {
            label: "Latest addition",
            value: insights.latestContribution ? formatGuestRelativeDate(insights.latestContribution.createdDate) : "No data yet",
            detail: insights.latestContribution ? formatGuestDate(insights.latestContribution.createdDate) : "Waiting for the first selected contribution",
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Spinner label="Loading guest dashboard" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden border-primary/15 bg-[linear-gradient(135deg,rgba(128,0,0,0.06)_0%,rgba(197,160,89,0.14)_48%,rgba(255,255,255,0.94)_100%)]">
                <CardContent className="grid gap-6 p-6 xl:grid-cols-[1.45fr_0.95fr]">
                    <div className="space-y-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">Guest access</Badge>
                            {guestFaculty ? (
                                <Badge variant="outline">{guestFaculty.name}</Badge>
                            ) : (
                                <Badge variant="outline">Faculty archive</Badge>
                            )}
                            <Badge variant="outline">Read-only archive</Badge>
                        </div>

                        <div className="space-y-2">
                            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                                Faculty selection archive
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                Browse publication-ready contributions selected for the university magazine.
                                Open any piece to read the documents, review comment history, and follow what is new in{" "}
                                {guestFaculty?.name || "your assigned"} faculty.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            {snapshotItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4 shadow-sm shadow-black/5"
                                >
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        {item.label}
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button onClick={() => navigate({ to: "/guest/selected-contributions" })}>
                                Browse archive
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                            {featuredContribution && onView ? (
                                <Button variant="outline" onClick={() => onView(featuredContribution)}>
                                    Open latest highlight
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5 shadow-sm shadow-black/5">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            <Sparkles className="h-3.5 w-3.5" />
                            Guest snapshot
                        </div>

                        <div className="mt-4 space-y-3">
                            {snapshotRows.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                                            <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                                        </div>
                                        <p className="shrink-0 text-right text-lg font-semibold text-foreground">
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">What to open next</CardTitle>
                        <CardDescription>
                            A quick starting point for guests who want the most relevant selection first.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {featuredContribution ? (
                            <div className="rounded-[1.75rem] border border-primary/15 bg-primary/5 p-5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary">
                                        {insights.topRatedContribution?.id === featuredContribution.id ? "Top rated" : "Latest addition"}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {formatGuestDate(featuredContribution.createdDate)}
                                    </span>
                                </div>

                                <h2 className="mt-3 font-display text-xl font-semibold leading-tight text-foreground">
                                    {featuredContribution.subject}
                                </h2>
                                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                                    {featuredContribution.description}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5" />
                                        {getContributionContributorName(featuredContribution)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Star className="h-3.5 w-3.5" />
                                        {typeof featuredContribution.rating === "number" && featuredContribution.rating > 0
                                            ? `${featuredContribution.rating}/5 rating`
                                            : "Not rated yet"}
                                    </span>
                                </div>

                                {onView ? (
                                    <Button className="mt-5" onClick={() => onView(featuredContribution)}>
                                        Open contribution
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                ) : null}
                            </div>
                        ) : (
                            <div className="rounded-[1.75rem] border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
                                No selected contributions are available for this faculty yet.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">How guest access works</CardTitle>
                        <CardDescription>
                            This space is optimized for quick review, not editing or admin actions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {usageTips.map((tip) => (
                            <div
                                key={tip.title}
                                className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/70 px-4 py-3"
                            >
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <tip.icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{tip.title}</p>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{tip.description}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Latest additions
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            The newest selected contributions from {guestFaculty?.name || "your faculty"}.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate({ to: "/guest/selected-contributions" })}
                    >
                        View full archive
                    </Button>
                </div>

                <ContributionGrid
                    contributions={latestPreview}
                    onView={onView || (() => {})}
                    facultyName={guestFaculty?.name}
                    emptyMessage="No selected contributions available for your faculty."
                />
            </div>

            <FacultyTimeline
                contributions={contributions}
                facultyName={guestFaculty?.name}
            />
        </div>
    );
};
