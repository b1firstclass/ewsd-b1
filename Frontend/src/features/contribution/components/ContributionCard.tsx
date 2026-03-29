import { Button } from "@/components/ui/button";
import { Edit2, Send, FileText, Clock } from "lucide-react";
import { ContributionStatus, EDITABLE_STATUSES, SUBMITTABLE_STATUSES } from "@/types/contributionType";
import type { ContributionInfo, ContributionStatusValue } from "@/types/contributionType";
import { cn } from "@/lib/utils";

import banner1 from "@/assets/banner1.jpg";
import banner2 from "@/assets/banner2.jpg";
import banner3 from "@/assets/banner3.jpg";
import banner4 from "@/assets/banner4.jpg";

const BANNERS = [banner1, banner2, banner3, banner4];

const getBanner = (id: string) => {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  return BANNERS[Math.abs(hash) % BANNERS.length];
};

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
    onView: (c: ContributionInfo) => void;
    onEdit?: (c: ContributionInfo) => void;
    onSubmit?: (c: ContributionInfo) => void;
    coordinatorMode?: boolean;
}

export const ContributionCard = ({
    contribution,
    onView,
    onEdit,
    onSubmit,
    coordinatorMode = false,
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
                {/* Header: Status Badge + Date + Edited */}
                <div className="mb-3 flex items-center justify-between">
                    <span
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                            config.badgeClass,
                        )}
                    >
                        <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
                        {config.label}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatRelativeDate(contribution.createdDate)}
                        {editedLabel && <span className="ml-0.5">{editedLabel}</span>}
                    </span>
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

            {/* Banner Footer — decorative image strip with hover action overlay */}
            <div className="relative h-12 w-full overflow-hidden">
                {/* Soft top fade */}
                <div className="absolute inset-x-0 top-0 z-10 h-4 bg-gradient-to-b from-card/80 to-transparent" />
                <img
                    src={getBanner(contribution.id)}
                    alt=""
                    aria-hidden
                    className="h-full w-full object-cover object-bottom opacity-80 transition-opacity duration-200 group-hover:opacity-90"
                />
                {/* Hover action buttons */}
                <div className="absolute inset-0 z-20 flex items-center justify-end gap-1 px-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {canEdit && onEdit && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 bg-card/70 hover:bg-card backdrop-blur-sm"
                            onClick={(e) => { e.stopPropagation(); onEdit(contribution); }}
                            title="Edit"
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                    {canSubmit && onSubmit && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 bg-card/70 hover:bg-card backdrop-blur-sm text-primary hover:text-primary"
                            onClick={(e) => { e.stopPropagation(); onSubmit(contribution); }}
                            title="Submit for review"
                        >
                            <Send className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
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
    emptyMessage?: string;
}

export const ContributionGrid = ({
    contributions,
    onView,
    onEdit,
    onSubmit,
    coordinatorMode = false,
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
            {contributions.map((contribution) => (
                <div key={contribution.id} className="mb-4 break-inside-avoid">
                    <ContributionCard
                        contribution={contribution}
                        onView={onView}
                        onEdit={onEdit}
                        onSubmit={onSubmit}
                        coordinatorMode={coordinatorMode}
                    />
                </div>
            ))}
        </div>
    );
};
