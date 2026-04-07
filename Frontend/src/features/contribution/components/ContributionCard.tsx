import { Button } from "@/components/ui/button";
import { Edit2, Send, FileText, Clock } from "lucide-react";
import {
  ContributionStatus,
  EDITABLE_STATUSES,
  SUBMITTABLE_STATUSES,
} from "@/types/contributionType";
import type {
  ContributionInfo,
  ContributionImageInfo,
  ContributionStatusValue,
} from "@/types/contributionType";
import { cn } from "@/lib/utils";

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

const getImageMimeType = (extension?: string): string => {
  const normalizedExtension = (extension ?? "").replace(".", "").toLowerCase();
  switch (normalizedExtension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
};

const getContributionBannerSrc = (
  image?: ContributionImageInfo | null,
): string | null => {
  const rawData = image?.data?.trim();
  if (!rawData) return null;
  if (rawData.startsWith("data:")) return rawData;
  return `data:${getImageMimeType(image?.extension)};base64,${rawData}`;
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
  categoryNameById?: Record<string, string>;
}

export const ContributionCard = (props: ContributionCardProps) => {
  const {
    contribution,
    index,
    onView,
    onEdit,
    onSubmit,
    coordinatorMode = false,
    categoryNameById,
  } = props;
  const config = getStatusConfig(contribution.status);
  const canEdit =
    !coordinatorMode &&
    EDITABLE_STATUSES.includes(contribution.status as ContributionStatusValue);
  const canSubmit =
    !coordinatorMode &&
    SUBMITTABLE_STATUSES.includes(
      contribution.status as ContributionStatusValue,
    );
  const categoryName = contribution.categoryId
    ? categoryNameById?.[contribution.categoryId]
    : undefined;
  const editedLabel =
    contribution.modifiedDate &&
    contribution.modifiedDate !== contribution.createdDate
      ? `· Edited ${formatRelativeDate(contribution.modifiedDate)}`
      : "";

  const bannerSrc = getContributionBannerSrc(contribution.image);
  const placeholderVariant = index % 3;
  const placeholderGradients = [
    "from-chart-2/20 via-primary/10 to-accent/20",
    "from-chart-4/20 via-primary/5 to-chart-5/20",
    "from-primary/15 via-chart-2/10 to-chart-4/20",
  ] as const;

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
        {/* Row 1: Status Badge + Category + Action Buttons */}
        <div className="mb-1 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  config.badgeClass,
                )}
              >
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)}
                />
                {config.label}
              </span>

              {categoryName && (
                <span
                  className={cn(
                    "inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full px-2.5 py-0.5",
                    "border border-primary/15 bg-primary/10 text-[10px] font-semibold uppercase tracking-wider text-primary",
                  )}
                  title={categoryName}
                >
                  <span className="shrink-0 opacity-70">#</span>
                  <span className="truncate max-w-[90px] xs:max-w-[120px] sm:max-w-[160px] md:max-w-[200px] lg:max-w-[240px]">
                    {categoryName}
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 self-start">
            {canEdit && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 rounded-full p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(contribution);
                }}
                title="Edit"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}

            {canSubmit && onSubmit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 rounded-full p-0 text-primary hover:bg-primary/10 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onSubmit(contribution);
                }}
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
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {contribution.description}
        </p>
      </div>

      {/* Banner Footer — purely decorative */}
      <div className="relative h-20 w-full overflow-hidden">
        <div className="absolute inset-x-0 top-0 z-10 h-3 bg-gradient-to-b from-card/50 via-card/10 to-transparent" />
        {bannerSrc ? (
          <img
            src={bannerSrc}
            alt=""
            aria-hidden
            className="h-full w-full object-cover object-center opacity-85 transition-opacity duration-200 group-hover:opacity-95"
          />
        ) : (
          <div
            aria-hidden
            className={cn(
              "relative h-full w-full bg-gradient-to-br",
              placeholderGradients[placeholderVariant],
            )}
          >
            <div className="absolute -left-4 top-2 h-12 w-12 rounded-full bg-background/45 blur-xl" />
            <div className="absolute right-2 -bottom-5 h-16 w-16 rounded-full bg-background/40 blur-xl" />
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(125deg,transparent_0%,transparent_38%,rgba(255,255,255,0.55)_38%,rgba(255,255,255,0.55)_52%,transparent_52%,transparent_100%)]" />
            <div className="absolute inset-0 opacity-35 [background-size:22px_22px] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)]" />
          </div>
        )}
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
  categoryNameById?: Record<string, string>;
  emptyMessage?: string;
}

export const ContributionGrid = ({
  contributions,
  onView,
  onEdit,
  onSubmit,
  coordinatorMode = false,
  facultyName,
  categoryNameById,
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
            categoryNameById={categoryNameById}
          />
        </div>
      ))}
    </div>
  );
};
