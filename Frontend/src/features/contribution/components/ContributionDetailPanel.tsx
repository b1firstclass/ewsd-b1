import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    X,
    Download,
    FileText,
    Image as ImageIcon,
    Send,
    Clock,
    CheckCircle2,
    AlertCircle,
    Star,
    XCircle,
    Edit3,
    MessageSquare,
    Loader2,
} from "lucide-react";
import { contributionApi } from "@/features/contribution/contributionApi";
import { commentApi } from "@/features/comment/commentApi";
import { ContributionStatus, EDITABLE_STATUSES, SUBMITTABLE_STATUSES } from "@/types/contributionType";
import type { ContributionDetailInfo, ContributionStatusValue, ContributionDocumentInfo } from "@/types/contributionType";
import type { CommentInfo } from "@/types/commentType";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Status Timeline ────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
    { status: ContributionStatus.Draft, label: "Draft", icon: Edit3 },
    { status: ContributionStatus.Submitted, label: "Submitted", icon: Send },
    { status: ContributionStatus.UnderReview, label: "Under Review", icon: Clock },
    { status: ContributionStatus.Approved, label: "Approved", icon: CheckCircle2 },
    { status: ContributionStatus.Selected, label: "Selected", icon: Star },
] as const;

const TERMINAL_STATUSES: Record<string, { label: string; icon: typeof XCircle }> = {
    [ContributionStatus.Rejected]: { label: "Rejected", icon: XCircle },
    [ContributionStatus.RevisionRequired]: { label: "Revision Required", icon: AlertCircle },
};

const getStepState = (stepStatus: string, currentStatus: string) => {
    const order = [
        ContributionStatus.Draft,
        ContributionStatus.Submitted,
        ContributionStatus.UnderReview,
        ContributionStatus.Approved,
        ContributionStatus.Selected,
    ];
    const stepIdx = order.indexOf(stepStatus as any);
    const currentIdx = order.indexOf(currentStatus as any);

    // Terminal statuses: mark steps up to UnderReview as completed
    if (currentStatus === ContributionStatus.Rejected || currentStatus === ContributionStatus.RevisionRequired) {
        const terminalIdx = order.indexOf(ContributionStatus.UnderReview);
        if (stepIdx < terminalIdx) return "completed";
        if (stepIdx === terminalIdx) return "current";
        return "upcoming";
    }

    if (currentIdx < 0) return "upcoming";
    if (stepIdx < currentIdx) return "completed";
    if (stepIdx === currentIdx) return "current";
    return "upcoming";
};

const StatusTimeline = ({ status }: { status: string }) => {
    const isTerminal = status in TERMINAL_STATUSES;

    return (
        <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status Timeline</h4>
            <div className="flex items-center gap-0">
                {TIMELINE_STEPS.map((step, i) => {
                    const state = getStepState(step.status, status);
                    const Icon = step.icon;
                    const underReviewCss = step.status === ContributionStatus.UnderReview ? "mt-3" : "";
                    const underReviewCss2 = step.status === ContributionStatus.UnderReview ? "items-center" : "items-start"
                    const underReviewCss3 = step.status === ContributionStatus.UnderReview ? "self-center mb-3" : "mt-4 self-start";
                    return (
                        <div key={step.status} className={cn("flex", underReviewCss2)}>
                            <div className={cn("flex flex-col items-center gap-1", underReviewCss)}>
                                <div
                                    className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                                        state === "completed" && "border-primary bg-primary text-primary-foreground",
                                        state === "current" && "border-primary bg-primary/10 text-primary",
                                        state === "upcoming" && "border-border bg-muted text-muted-foreground",
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "h-3.5 w-3.5",
                                            step.status === ContributionStatus.UnderReview && "translate-y-px",
                                        )}
                                    />
                                </div>
                                <span
                                    className={cn(
                                        "text-[9px] font-medium leading-tight text-center w-14",
                                        state === "completed" && "text-primary",
                                        state === "current" && "text-primary font-semibold",
                                        state === "upcoming" && "text-muted-foreground",
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {i < TIMELINE_STEPS.length - 1 && (
                                <div
                                    className={cn(
                                        "mx-0.5 h-0.5 w-6 self-start rounded-full",
                                        state === "completed" ? "bg-primary" : "bg-border",
                                        underReviewCss3
                                    )}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            {isTerminal && (
                <div className={cn(
                    "mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                    status === ContributionStatus.Rejected
                        ? "bg-destructive/10 text-destructive"
                        : "bg-chart-5/10 text-chart-5",
                )}>
                    {status === ContributionStatus.Rejected ? (
                        <XCircle className="h-4 w-4" />
                    ) : (
                        <AlertCircle className="h-4 w-4" />
                    )}
                    {TERMINAL_STATUSES[status].label}
                </div>
            )}
        </div>
    );
};

// ─── Document Card ──────────────────────────────────────────────────────────

const DocumentCard = ({ doc }: { doc: ContributionDocumentInfo }) => {
    const [downloading, setDownloading] = useState(false);
    const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(doc.extension.toLowerCase());

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await contributionApi.downloadDocument(doc.id, doc.fileName);
        } catch {
            toast.error("Failed to download file");
        } finally {
            setDownloading(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5 transition-colors hover:bg-muted/50 sm:gap-3 sm:p-3">
            <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                isImage ? "bg-chart-2/10 text-chart-2" : "bg-primary/10 text-primary",
            )}>
                {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{doc.fileName}</p>
                <p className="truncate text-xs text-muted-foreground">
                    {doc.extension.toUpperCase().replace(".", "")} · {formatSize(doc.size)}
                </p>
            </div>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 shrink-0 p-0 sm:h-9 sm:w-9"
                onClick={handleDownload}
                disabled={downloading}
                aria-label={`Download ${doc.fileName}`}
            >
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </Button>
        </div>
    );
};

// ─── Comment Item ───────────────────────────────────────────────────────────

const CommentItem = ({ comment }: { comment: CommentInfo }) => {
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
            " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                {(comment.poster || "?")[0]}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-foreground">{comment.poster || "Unknown"}</span>
                    <span className="text-[11px] text-muted-foreground">{formatDate(comment.createdDate)}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">{comment.comment}</p>
            </div>
        </div>
    );
};

// ─── Comment Deadline Indicator ─────────────────────────────────────────────

const CommentDeadlineIndicator = ({ submittedDate }: { submittedDate?: string }) => {
    if (!submittedDate) return null;

    const submitted = new Date(submittedDate);
    const deadline = new Date(submitted.getTime() + 14 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
        return (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                Comment deadline overdue
            </div>
        );
    }

    return (
        <div className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
            daysLeft <= 3 ? "bg-chart-5/10 text-chart-5" : "bg-muted text-muted-foreground",
        )}>
            <Clock className="h-3.5 w-3.5" />
            {daysLeft} day{daysLeft !== 1 ? "s" : ""} left for coordinator feedback
        </div>
    );
};

// ─── Main Detail Panel ──────────────────────────────────────────────────────

interface ContributionDetailPanelProps {
    contributionId: string;
    onClose: () => void;
    onEdit?: (contribution: ContributionDetailInfo) => void;
    onSubmit?: (contribution: ContributionDetailInfo) => void;
    /** Coordinator mode shows different actions */
    coordinatorMode?: boolean;
}

export const ContributionDetailPanel = ({
    contributionId,
    onClose,
    onEdit,
    onSubmit,
    coordinatorMode = false,
}: ContributionDetailPanelProps) => {
    const [detail, setDetail] = useState<ContributionDetailInfo | null>(null);
    const [comments, setComments] = useState<CommentInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const loadDetail = useCallback(async () => {
        try {
            const data = await contributionApi.getById(contributionId);
            setDetail(data);
            setComments(data.comments ?? []);
        } catch (err) {
            console.error("Failed to load contribution detail:", err);
            toast.error("Failed to load contribution details");
        } finally {
            setLoading(false);
        }
    }, [contributionId]);

    useEffect(() => {
        loadDetail();
    }, [loadDetail]);

    const handleAddComment = async () => {
        if (!newComment.trim() || !detail) return;
        setSubmittingComment(true);
        try {
            const created = await commentApi.create({
                contributionId: detail.id,
                comment: newComment.trim(),
            });
            setComments(prev => [...prev, created]);
            setNewComment("");
            toast.success("Comment added");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to add comment");
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleAction = async (action: "submit" | "review" | "approve" | "reject" | "requestRevision" | "select") => {
        if (!detail) return;
        setActionLoading(true);
        try {
            await contributionApi[action](detail.id);
            toast.success(`Contribution ${action === "requestRevision" ? "revision requested" : action + "ed"} successfully`);
            await loadDetail();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || `Failed to ${action}`);
        } finally {
            setActionLoading(false);
        }
    };

    const canEdit = detail && !coordinatorMode && EDITABLE_STATUSES.includes(detail.status as ContributionStatusValue);
    const canSubmit = detail && !coordinatorMode && SUBMITTABLE_STATUSES.includes(detail.status as ContributionStatusValue);
    const showCommentDeadline = detail && [ContributionStatus.Submitted, ContributionStatus.UnderReview].includes(detail.status as any);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative z-10 flex h-full w-full max-w-xl flex-col bg-background shadow-2xl animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 className="font-display text-lg font-semibold text-foreground">Contribution Details</h2>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Scrollable Content */}
                {loading ? (
                    <div className="flex flex-1 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : detail ? (
                    <div className="flex-1 overflow-y-auto">
                        <div className="space-y-6 p-6">
                            {/* Title & Description */}
                            <div>
                                <h3 className="font-display text-xl font-bold leading-tight text-foreground">
                                    {detail.subject}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {detail.description}
                                </p>
                                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>Created {detail.createdDate ? new Date(detail.createdDate).toLocaleDateString() : "N/A"}</span>
                                    {detail.modifiedDate && detail.modifiedDate !== detail.createdDate && (
                                        <>
                                            <span>·</span>
                                            <span>Modified {new Date(detail.modifiedDate).toLocaleDateString()}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mt-3">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Category
                                </span>
                                <p className="mt-1 text-sm font-medium text-foreground">
                                    {detail.category?.name || "Not selected"}
                                </p>
                            </div>

                            <Separator />

                            {/* Status Timeline */}
                            <StatusTimeline status={detail.status} />

                            {/* Comment Deadline */}
                            {showCommentDeadline && (
                                <CommentDeadlineIndicator submittedDate={detail.createdDate} />
                            )}

                            <Separator />

                            {/* Documents */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Documents ({detail.documents?.length || 0})
                                </h4>
                                {detail.documents && detail.documents.length > 0 ? (
                                    <div className="space-y-2">
                                        {detail.documents.map((doc) => (
                                            <DocumentCard key={doc.id} doc={doc} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No documents attached.</p>
                                )}
                            </div>

                            <Separator />

                            {/* Comments */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <MessageSquare className="mr-1 inline h-3.5 w-3.5" />
                                    Comments ({comments.length})
                                </h4>

                                {comments.length > 0 ? (
                                    <div className="space-y-4">
                                        {comments.map((c) => (
                                            <CommentItem key={c.id} comment={c} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                                )}

                                {/* Add Comment */}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
                                        className="h-9 text-sm"
                                        maxLength={500}
                                    />
                                    <Button
                                        size="sm"
                                        className="h-9 shrink-0"
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim() || submittingComment}
                                    >
                                        {submittingComment ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-1 items-center justify-center text-muted-foreground">
                        Contribution not found.
                    </div>
                )}

                {/* Footer Actions */}
                {detail && (
                    <div className="flex items-center gap-2 border-t border-border px-6 py-4">
                        {/* Student Actions */}
                        {!coordinatorMode && (
                            <>
                                {canEdit && onEdit && (
                                    <Button variant="outline" size="sm" onClick={() => onEdit(detail)}>
                                        <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                                        Edit
                                    </Button>
                                )}
                                {canSubmit && onSubmit && (
                                    <Button size="sm" onClick={() => onSubmit(detail)} disabled={actionLoading}>
                                        <Send className="mr-1.5 h-3.5 w-3.5" />
                                        Submit for Review
                                    </Button>
                                )}
                            </>
                        )}

                        {/* Coordinator Actions */}
                        {coordinatorMode && (
                            <>
                                {detail.status === ContributionStatus.Submitted && (
                                    <Button size="sm" onClick={() => handleAction("review")} disabled={actionLoading}>
                                        <Clock className="mr-1.5 h-3.5 w-3.5" />
                                        Start Review
                                    </Button>
                                )}
                                {detail.status === ContributionStatus.UnderReview && (
                                    <>
                                        <Button size="sm" onClick={() => handleAction("approve")} disabled={actionLoading}>
                                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                            Approve
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleAction("requestRevision")} disabled={actionLoading}>
                                            <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                                            Request Revision
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleAction("reject")} disabled={actionLoading}>
                                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                            Reject
                                        </Button>
                                    </>
                                )}
                                {detail.status === ContributionStatus.Approved && (
                                    <Button size="sm" onClick={() => handleAction("select")} disabled={actionLoading}>
                                        <Star className="mr-1.5 h-3.5 w-3.5" />
                                        Select for Magazine
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
