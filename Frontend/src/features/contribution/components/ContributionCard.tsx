import { Button } from "@/components/ui/button";
import { Edit2, Send, FileText, Clock } from "lucide-react";
import { ContributionStatus, EDITABLE_STATUSES, SUBMITTABLE_STATUSES } from "@/types/contributionType";
import type { ContributionInfo, ContributionStatusValue } from "@/types/contributionType";
import { cn } from "@/lib/utils";

import { getFacultyBanner } from "@/utils/facultyBanners";

// ─── Status Visual Config ───────────────────────────────────────────────────

interface StatusConfig {
    label: string;
    dotColor: string;
    bgColor: string;
    borderColor: string;
    badgeClass: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
    [ContributionStatus.Draft]: {
        label: "Draft",
        dotColor: "bg-muted-foreground",
        bgColor: "bg-muted/40",
        borderColor: "border-border",
        badgeClass: "bg-muted text-muted-foreground",
    },
    [ContributionStatus.Submitted]: {
        label: "Submitted",
        dotColor: "bg-primary",
        bgColor: "bg-primary/5",
        borderColor: "border-primary/20",
        badgeClass: "bg-primary/10 text-primary",
    },
    [ContributionStatus.UnderReview]: {
        label: "Under Review",
        dotColor: "bg-accent-foreground",
        bgColor: "bg-accent/10",
        borderColor: "border-accent/30",
        badgeClass: "bg-accent/20 text-accent-foreground",
    },
    [ContributionStatus.RevisionRequired]: {
        label: "Revision Required",
        dotColor: "bg-chart-5",
        bgColor: "bg-chart-5/5",
        borderColor: "border-chart-5/20",
        badgeClass: "bg-chart-5/10 text-chart-5",
    },
    [ContributionStatus.Approved]: {
        label: "Approved",
        dotColor: "bg-chart-4",
        bgColor: "bg-chart-4/5",
        borderColor: "border-chart-4/20",
        badgeClass: "bg-chart-4/10 text-chart-4",
    },
    [ContributionStatus.Rejected]: {
        label: "Rejected",
        dotColor: "bg-destructive",
        bgColor: "bg-destructive/5",
        borderColor: "border-destructive/20",
        badgeClass: "bg-destructive/10 text-destructive",
    },
    [ContributionStatus.Selected]: {
        label: "Selected ⭐",
        dotColor: "bg-chart-2",
        bgColor: "bg-chart-2/5",
        borderColor: "border-chart-2/20",
        badgeClass: "bg-chart-2/10 text-chart-2",
    },
};

const getStatusConfig = (status: string): StatusConfig =>
    STATUS_CONFIG[status] ?? STATUS_CONFIG[ContributionStatus.Draft];

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatRelativeDate = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ─── Card Component ─────────────────────────────────────────────────────────

interface ContributionCardProps {
    contribution: ContributionInfo;
    index: number;
    onView: (c: ContributionInfo) => void;
    onEdit?: (c: ContributionInfo) => void;
    onSubmit?: (c: ContributionInfo) => void;
    coordinatorMode?: boolean;
    facultyName?: string;
}

export const ContributionCard = ({
    contribution,
    index,
    onView,
    onEdit,
    onSubmit,
    coordinatorMode = false,
    facultyName,
}: ContributionCardProps) => {
    const config = getStatusConfig(contribution.status);
    const canEdit = !coordinatorMode && EDITABLE_STATUSES.includes(contribution.status as ContributionStatusValue);
    const canSubmit = !coordinatorMode && SUBMITTABLE_STATUSES.includes(contribution.status as ContributionStatusValue);
    const editedLabel =
        contribution.modifiedDate && contribution.modifiedDate !== contribution.createdDate
            ? `· Edited ${formatRelativeDate(contribution.modifiedDate)}`
            : "";

    return (
        <article
            className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border cursor-pointer transition-all duration-200",
                "hover:shadow-lg hover:-translate-y-0.5",
                config.borderColor,
                "bg-card",
            )}
            onClick={() => onView(contribution)}
        >
            {/* Status Stripe */}
            <div className={cn("h-1 w-full", config.dotColor)} />

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                {/* Row 1: Status Badge + Action Buttons */}
                <div className="mb-1 flex items-center justify-between">
                    <span
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                            config.badgeClass,
                        )}
                    >
                        <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
                        {config.label}
                    </span>
                    <div className="flex items-center gap-1">
                        {canEdit && onEdit && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
                                onClick={(e) => { e.stopPropagation(); onEdit(contribution); }}
                                title="Edit"
                            >
                                <Edit2 className="h-3 w-3" />
                            </Button>
                        )}
                        {canSubmit && onSubmit && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 rounded-full text-primary hover:text-primary hover:bg-primary/10"
                                onClick={(e) => { e.stopPropagation(); onSubmit(contribution); }}
                                title="Submit for review"
                            >
                                <Send className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Row 2: Date + Edited */}
                <div className="mb-3 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatRelativeDate(contribution.createdDate)}
                    {editedLabel && <span>{editedLabel}</span>}
                </div>

                {/* Title */}
                <h3 className="font-display text-base font-semibold leading-tight text-foreground line-clamp-2">
                    {contribution.subject}
                </h3>

                {/* Description */}
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {contribution.description}
                </p>
            </div>

            {/* Banner Footer — purely decorative */}
            <div className="relative h-12 w-full overflow-hidden">
                <div className="absolute inset-x-0 top-0 z-10 h-3 bg-gradient-to-b from-card/50 via-card/10 to-transparent" />
                <img
                    src={getFacultyBanner(index, facultyName)}
                    alt=""
                    aria-hidden
                    className="h-full w-full object-cover object-bottom opacity-80 transition-opacity duration-200 group-hover:opacity-90"
                />
            </div>
        </article>
    );
};

// ─── Masonry Grid ───────────────────────────────────────────────────────────

interface ContributionGridProps {
    contributions: ContributionInfo[];
    onView: (c: ContributionInfo) => void;
    onEdit?: (c: ContributionInfo) => void;
    onSubmit?: (c: ContributionInfo) => void;
    coordinatorMode?: boolean;
    facultyName?: string;
    emptyMessage?: string;
}

export const ContributionGrid = ({
    contributions,
    onView,
    onEdit,
    onSubmit,
    coordinatorMode = false,
    facultyName,
    emptyMessage = "No contributions found.",
}: ContributionGridProps) => {
    if (contributions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {contributions.map((contribution, index) => (
                <div key={contribution.id} className="mb-4 break-inside-avoid">
                    <ContributionCard
                        contribution={contribution}
                        index={index}
                        onView={onView}
                        onEdit={onEdit}
                        onSubmit={onSubmit}
                        coordinatorMode={coordinatorMode}
                        facultyName={facultyName}
                    />
                </div>
            ))}
        </div>
    );
};
