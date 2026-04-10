import { useEffect, useMemo, useState } from "react";
import {
    ArrowRight,
    ArrowUpDown,
    LayoutGrid,
    List,
    Search,
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
import { Input } from "@/components/ui/input";
import {
    NativeSelect,
    NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/AuthContext";
import { ContributionGrid } from "@/features/contribution/components/ContributionCard";
import { contributionApi } from "@/features/contribution/contributionApi";
import {
    RECENT_ACTIVITY_WINDOW_DAYS,
    type GuestContributionSort,
    formatGuestDate,
    formatGuestRelativeDate,
    getContributionContributorName,
    getGuestContributionInsights,
    sortGuestContributions,
} from "@/features/guest/utils/guestContributionInsights";
import { cn } from "@/lib/utils";
import { ApiRoute } from "@/types/constantApiRoute";
import type { ContributionInfo } from "@/types/contributionType";

interface GuestSelectedContributionsProps {
    onView: (contribution: ContributionInfo) => void;
}

const sortLabels: Record<GuestContributionSort, string> = {
    newest: "Newest first",
    oldest: "Oldest first",
    "recently-updated": "Recently updated",
    "top-rated": "Top rated",
    title: "Title A-Z",
};

const getFeaturedLabel = (sortBy: GuestContributionSort) => {
    switch (sortBy) {
        case "top-rated":
            return "Top rated match";
        case "recently-updated":
            return "Recently updated";
        case "oldest":
            return "Archive starting point";
        case "title":
            return "Featured match";
        case "newest":
        default:
            return "Latest addition";
    }
};

export const GuestSelectedContributions = ({ onView }: GuestSelectedContributionsProps) => {
    const { user } = useAuth();
    const [contributions, setContributions] = useState<ContributionInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedYear, setSelectedYear] = useState("all");
    const [sortBy, setSortBy] = useState<GuestContributionSort>("newest");

    const guestFaculty = user?.faculties?.[0];

    useEffect(() => {
        const load = async () => {
            try {
                const response = await contributionApi.getSelectedList({
                    route: ApiRoute.Contribution.getSelectedList,
                    pageNumber: 1,
                    pageSize: 100,
                    searchKeyword: "",
                });
                setContributions(response.items);
            } catch (error) {
                console.error("Failed to load selected contributions:", error);
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    const archiveInsights = useMemo(() => getGuestContributionInsights(contributions), [contributions]);

    const filteredContributions = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        const filtered = contributions.filter((contribution) => {
            const matchesYear = selectedYear === "all"
                ? true
                : new Date(contribution.createdDate ?? "").getFullYear().toString() === selectedYear;

            if (!matchesYear) return false;

            if (!normalizedSearch) return true;

            return contribution.subject.toLowerCase().includes(normalizedSearch)
                || contribution.description.toLowerCase().includes(normalizedSearch)
                || getContributionContributorName(contribution).toLowerCase().includes(normalizedSearch);
        });

        return sortGuestContributions(filtered, sortBy);
    }, [contributions, searchTerm, selectedYear, sortBy]);

    const visibleInsights = useMemo(
        () => getGuestContributionInsights(filteredContributions),
        [filteredContributions],
    );

    const featuredContribution = filteredContributions[0] ?? null;
    const hasActiveFilters = Boolean(searchTerm.trim()) || selectedYear !== "all" || sortBy !== "newest";
    const archiveSummaryItems = [
        {
            label: "Archive size",
            value: archiveInsights.totalSelected,
            helper: `${archiveInsights.totalSelected === 1 ? "selection" : "selections"} in this faculty archive`,
        },
        {
            label: "This year",
            value: archiveInsights.thisYearCount,
            helper: `Selected during ${new Date().getFullYear()}`,
        },
        {
            label: "Contributors",
            value: archiveInsights.contributorCount,
            helper: `${archiveInsights.contributorCount === 1 ? "author" : "authors"} represented`,
        },
    ];
    const signalRows = [
        {
            label: "Archive span",
            value: archiveInsights.archiveSpanLabel,
            detail: archiveInsights.activeYears > 1
                ? `${archiveInsights.activeYears} different years in view`
                : "A focused single-year archive",
        },
        {
            label: "Recent activity",
            value: archiveInsights.recentCount,
            detail: `Updated within the last ${RECENT_ACTIVITY_WINDOW_DAYS} days`,
        },
        {
            label: "Average rating",
            value: archiveInsights.averageRating ? `${archiveInsights.averageRating.toFixed(1)}/5` : "Not rated",
            detail: archiveInsights.ratedCount > 0
                ? `${archiveInsights.ratedCount} rated ${archiveInsights.ratedCount === 1 ? "selection" : "selections"}`
                : "Ratings show once editorial review is complete",
        },
    ];

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedYear("all");
        setSortBy("newest");
    };

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden border-primary/15 bg-[linear-gradient(135deg,rgba(197,160,89,0.14)_0%,rgba(128,0,0,0.06)_52%,rgba(255,255,255,0.95)_100%)]">
                <CardContent className="grid gap-6 p-6 xl:grid-cols-[1.35fr_0.95fr]">
                    <div className="space-y-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">Guest archive</Badge>
                            {guestFaculty ? (
                                <Badge variant="outline">{guestFaculty.name}</Badge>
                            ) : null}
                            <Badge variant="outline">Read-only browsing</Badge>
                        </div>

                        <div className="space-y-2">
                            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                                Selected contributions archive
                            </h2>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                Search, filter, and sort the selected work from {guestFaculty?.name || "your faculty"}.
                                This view is tuned for discovery, so guests can reach the right contribution faster without wading through noisy stats.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            {archiveSummaryItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4 shadow-sm shadow-black/5"
                                >
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        {item.label}
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-border/70 bg-background/82 p-5 shadow-sm shadow-black/5">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            <Sparkles className="h-3.5 w-3.5" />
                            Archive signals
                        </div>

                        <div className="mt-4 space-y-3">
                            {signalRows.map((item) => (
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

            <Card>
                <CardContent className="space-y-4 p-4 sm:p-5">
                    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_180px_180px_auto]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by title, description, or contributor..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="h-10 rounded-2xl pl-10"
                            />
                        </div>

                        <NativeSelect
                            value={selectedYear}
                            onChange={(event) => setSelectedYear(event.target.value)}
                            className="w-full"
                            selectClassName="h-10 w-full rounded-2xl bg-background/85"
                        >
                            <NativeSelectOption value="all">All years</NativeSelectOption>
                            {archiveInsights.availableYears.map((year) => (
                                <NativeSelectOption key={year} value={year}>
                                    {year}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>

                        <NativeSelect
                            value={sortBy}
                            onChange={(event) => setSortBy(event.target.value as GuestContributionSort)}
                            className="w-full"
                            selectClassName="h-10 w-full rounded-2xl bg-background/85"
                        >
                            {Object.entries(sortLabels).map(([value, label]) => (
                                <NativeSelectOption key={value} value={value}>
                                    {label}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>

                        <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/85 p-1">
                            <button
                                type="button"
                                onClick={() => setViewMode("grid")}
                                className={cn(
                                    "flex h-9 flex-1 items-center justify-center rounded-xl text-sm font-medium transition-colors",
                                    viewMode === "grid"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "flex h-9 flex-1 items-center justify-center rounded-xl text-sm font-medium transition-colors",
                                    viewMode === "list"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                            Showing {filteredContributions.length} of {archiveInsights.totalSelected} selections.
                            {selectedYear !== "all" ? ` Filtered to ${selectedYear}.` : ""}
                            {searchTerm.trim() ? ` Matching "${searchTerm.trim()}".` : ""}
                        </p>

                        {hasActiveFilters ? (
                            <Button variant="ghost" size="sm" onClick={resetFilters}>
                                Reset filters
                            </Button>
                        ) : null}
                    </div>
                </CardContent>
            </Card>

            {!loading && featuredContribution ? (
                <Card>
                    <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">{getFeaturedLabel(sortBy)}</Badge>
                                <span className="text-xs text-muted-foreground">
                                    {formatGuestDate(featuredContribution.createdDate)}
                                </span>
                            </div>

                            <h3 className="mt-3 font-display text-xl font-semibold leading-tight text-foreground">
                                {featuredContribution.subject}
                            </h3>
                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                                {featuredContribution.description}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5" />
                                    {getContributionContributorName(featuredContribution)}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <ArrowUpDown className="h-3.5 w-3.5" />
                                    Updated {formatGuestRelativeDate(featuredContribution.modifiedDate ?? featuredContribution.createdDate)}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Star className="h-3.5 w-3.5" />
                                    {typeof featuredContribution.rating === "number" && featuredContribution.rating > 0
                                        ? `${featuredContribution.rating}/5 rating`
                                        : "Not rated yet"}
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="shrink-0"
                            onClick={() => onView(featuredContribution)}
                        >
                            Open details
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Archive results
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Sorted by {sortLabels[sortBy].toLowerCase()} in {viewMode} view.
                    </p>
                </div>

                {!loading ? (
                    <div className="text-xs text-muted-foreground">
                        {visibleInsights.recentCount} updated in the last {RECENT_ACTIVITY_WINDOW_DAYS} days
                    </div>
                ) : null}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Spinner label="Loading selected contributions" />
                </div>
            ) : viewMode === "grid" ? (
                <ContributionGrid
                    contributions={filteredContributions}
                    onView={onView}
                    facultyName={guestFaculty?.name}
                    emptyMessage={`No selected contributions available${guestFaculty ? ` for ${guestFaculty.name}` : ""}.`}
                />
            ) : (
                <div className="space-y-3">
                    {filteredContributions.length === 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">No matching contributions</CardTitle>
                                <CardDescription>
                                    Try adjusting the search, year filter, or sort order to widen the archive view.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ) : (
                        filteredContributions.map((contribution) => (
                            <Card
                                key={contribution.id}
                                className="cursor-pointer border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-xl hover:shadow-black/5"
                                onClick={() => onView(contribution)}
                            >
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="secondary">Selected</Badge>
                                                {typeof contribution.rating === "number" && contribution.rating > 0 ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                                                        <Star className="h-3 w-3 fill-current" />
                                                        {contribution.rating}/5
                                                    </span>
                                                ) : null}
                                            </div>

                                            <h4 className="mt-3 text-base font-semibold text-foreground sm:text-lg">
                                                {contribution.subject}
                                            </h4>
                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                                {contribution.description}
                                            </p>

                                            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Users className="h-3.5 w-3.5" />
                                                    {getContributionContributorName(contribution)}
                                                </span>
                                                <span>{formatGuestDate(contribution.createdDate)}</span>
                                                <span>
                                                    Updated {formatGuestRelativeDate(contribution.modifiedDate ?? contribution.createdDate)}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="shrink-0 self-start"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onView(contribution);
                                            }}
                                        >
                                            Open details
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
