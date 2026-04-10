import type { ContributionInfo } from "@/types/contributionType";

export type GuestContributionSort =
    | "newest"
    | "oldest"
    | "recently-updated"
    | "top-rated"
    | "title";

export const RECENT_ACTIVITY_WINDOW_DAYS = 45;

const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
};

const parseDate = (value?: string | null) => {
    if (!value) return null;

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const getContributionContributorName = (contribution: ContributionInfo) =>
    contribution.createdUser?.trim() ||
    contribution.createdByName?.trim() ||
    "Unknown contributor";

export const getContributionCreatedDate = (contribution: ContributionInfo) =>
    parseDate(contribution.createdDate);

export const getContributionActivityDate = (contribution: ContributionInfo) =>
    parseDate(contribution.modifiedDate) ?? getContributionCreatedDate(contribution);

export const formatGuestDate = (
    value?: string | null,
    options: Intl.DateTimeFormatOptions = DEFAULT_DATE_FORMAT,
) => {
    const parsed = parseDate(value);
    return parsed ? parsed.toLocaleDateString("en-US", options) : "Unknown date";
};

export const formatGuestRelativeDate = (value?: string | null) => {
    const parsed = parseDate(value);
    if (!parsed) return "Unknown date";

    const now = Date.now();
    const diffMs = now - parsed.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return parsed.toLocaleDateString("en-US", DEFAULT_DATE_FORMAT);
};

const compareDatesDesc = (left: Date | null, right: Date | null) =>
    (right?.getTime() ?? 0) - (left?.getTime() ?? 0);

const compareDatesAsc = (left: Date | null, right: Date | null) =>
    (left?.getTime() ?? Number.MAX_SAFE_INTEGER) - (right?.getTime() ?? Number.MAX_SAFE_INTEGER);

export const sortGuestContributions = (
    contributions: ContributionInfo[],
    sortBy: GuestContributionSort,
) => {
    const sorted = [...contributions];

    switch (sortBy) {
        case "oldest":
            return sorted.sort((left, right) =>
                compareDatesAsc(getContributionCreatedDate(left), getContributionCreatedDate(right)),
            );
        case "recently-updated":
            return sorted.sort((left, right) =>
                compareDatesDesc(getContributionActivityDate(left), getContributionActivityDate(right)),
            );
        case "top-rated":
            return sorted.sort((left, right) => {
                const ratingDiff = (right.rating ?? 0) - (left.rating ?? 0);
                if (ratingDiff !== 0) return ratingDiff;

                return compareDatesDesc(getContributionCreatedDate(left), getContributionCreatedDate(right));
            });
        case "title":
            return sorted.sort((left, right) => left.subject.localeCompare(right.subject));
        case "newest":
        default:
            return sorted.sort((left, right) =>
                compareDatesDesc(getContributionCreatedDate(left), getContributionCreatedDate(right)),
            );
    }
};

const formatArchiveSpan = (years: number[]) => {
    if (years.length === 0) return "No dated archive";
    if (years.length === 1) return `${years[0]} only`;

    const sortedYears = [...years].sort((left, right) => right - left);
    return `${sortedYears[sortedYears.length - 1]}-${sortedYears[0]}`;
};

const getRatedContributions = (contributions: ContributionInfo[]) =>
    contributions.filter((contribution) => typeof contribution.rating === "number" && contribution.rating > 0);

export const getGuestContributionInsights = (contributions: ContributionInfo[]) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const recentThreshold = new Date(now.getTime() - RECENT_ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const newestContributions = sortGuestContributions(contributions, "newest");
    const updatedContributions = sortGuestContributions(contributions, "recently-updated");
    const ratedContributions = sortGuestContributions(getRatedContributions(contributions), "top-rated");
    const years = Array.from(
        new Set(
            contributions
                .map((contribution) => getContributionCreatedDate(contribution)?.getFullYear())
                .filter((value): value is number => typeof value === "number"),
        ),
    ).sort((left, right) => right - left);
    const contributors = new Set(
        contributions
            .map(getContributionContributorName)
            .filter((name) => name && name !== "Unknown contributor"),
    );

    return {
        totalSelected: contributions.length,
        thisYearCount: contributions.filter(
            (contribution) => getContributionCreatedDate(contribution)?.getFullYear() === currentYear,
        ).length,
        recentCount: contributions.filter((contribution) => {
            const activityDate = getContributionActivityDate(contribution);
            return Boolean(activityDate && activityDate >= recentThreshold);
        }).length,
        contributorCount: contributors.size,
        activeYears: years.length,
        availableYears: years.map(String),
        archiveSpanLabel: formatArchiveSpan(years),
        newestContributions,
        latestContribution: newestContributions[0] ?? null,
        latestUpdatedContribution: updatedContributions[0] ?? null,
        topRatedContribution: ratedContributions[0] ?? null,
        ratedCount: ratedContributions.length,
        averageRating: ratedContributions.length > 0
            ? ratedContributions.reduce((sum, contribution) => sum + (contribution.rating ?? 0), 0) / ratedContributions.length
            : null,
    };
};
