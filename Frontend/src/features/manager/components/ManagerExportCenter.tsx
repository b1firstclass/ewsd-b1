import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import {
    ArrowLeft,
    Building2,
    Download,
    Loader2,
    Package,
    User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { contributionApi } from "@/features/contribution/contributionApi";
import { ApiRoute } from "@/types/constantApiRoute";
import type { ContributionInfo } from "@/types/contributionType";
import { toast } from "sonner";

interface FacultyGroup {
    facultyName: string;
    contributions: ContributionInfo[];
}

const getFacultyName = (facultyName?: string | null) =>
    facultyName?.trim() || "Unassigned faculty";

const getContributorName = (contribution: ContributionInfo) =>
    contribution.createdUser?.trim() ||
    contribution.createdByName?.trim() ||
    "Unknown contributor";

const formatCreatedDate = (dateString?: string) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const groupByFaculty = (items: ContributionInfo[]): FacultyGroup[] => {
    const grouped = new Map<string, ContributionInfo[]>();

    for (const contribution of items) {
        const facultyName = getFacultyName(contribution.facultyName);
        const entries = grouped.get(facultyName) ?? [];
        entries.push(contribution);
        grouped.set(facultyName, entries);
    }

    return Array.from(grouped.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([facultyName, contributions]) => ({
            facultyName,
            contributions: [...contributions].sort((left, right) => {
                const leftContributor = getContributorName(left);
                const rightContributor = getContributorName(right);
                const contributorCompare = leftContributor.localeCompare(rightContributor);

                if (contributorCompare !== 0) {
                    return contributorCompare;
                }

                return left.subject.localeCompare(right.subject);
            }),
        }));
};

export const ManagerExportCenter = () => {
    const navigate = useNavigate();
    const [contributions, setContributions] = useState<ContributionInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            try {
                const response = await contributionApi.getSelectedList({
                    route: ApiRoute.Contribution.getSelectedList,
                    pageNumber: 1,
                    pageSize: 100,
                    searchKeyword: "",
                });

                if (!isMounted) return;
                setContributions(response.items);
            } catch (error) {
                console.error("Failed to load selected contributions:", error);
                toast.error("Failed to load selected contributions.");
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void load();

        return () => {
            isMounted = false;
        };
    }, []);

    const groups = useMemo(() => groupByFaculty(contributions), [contributions]);
    const allContributionIds = useMemo(
        () => contributions.map((contribution) => contribution.id),
        [contributions],
    );
    const selectedCount = checkedIds.size;
    const allSelected = contributions.length > 0 && selectedCount === contributions.length;
    const selectedFacultyCount = useMemo(() => {
        return groups.filter((group) =>
            group.contributions.some((contribution) => checkedIds.has(contribution.id)),
        ).length;
    }, [checkedIds, groups]);

    const toggleCheck = (id: string) => {
        setCheckedIds((previous) => {
            const next = new Set(previous);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    };

    const toggleAll = () => {
        setCheckedIds(allSelected ? new Set() : new Set(allContributionIds));
    };

    const toggleFacultyGroup = (group: FacultyGroup) => {
        const groupIds = group.contributions.map((contribution) => contribution.id);
        const isEntireGroupSelected = groupIds.every((id) => checkedIds.has(id));

        setCheckedIds((previous) => {
            const next = new Set(previous);

            for (const id of groupIds) {
                if (isEntireGroupSelected) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
            }

            return next;
        });
    };

    const handleBulkDownload = async () => {
        if (selectedCount === 0) return;

        setExporting(true);

        try {
            await contributionApi.downloadSelectedBulk({
                contributionIds: Array.from(checkedIds),
            });
            toast.success(`Downloaded ${selectedCount} contribution(s).`);
        } catch (error: unknown) {
            const message = isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message
                : undefined;
            toast.error(message || "Download failed.");
        } finally {
            setExporting(false);
        }
    };

    const handleSingleDownload = async (id: string) => {
        setDownloadingId(id);

        try {
            await contributionApi.downloadSelected(id);
        } catch {
            toast.error("Download failed.");
        } finally {
            setDownloadingId((current) => (current === id ? null : current));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Spinner label="Loading export center" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => navigate({ to: "/manager/dashboard" })}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>

                <div>
                    <h1 className="font-display text-xl font-semibold sm:text-2xl">
                        Export Center
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Download selected contributions as ZIP files, grouped by faculty.
                    </p>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Selected contributions</p>
                            <p className="text-2xl font-semibold">{contributions.length}</p>
                        </div>
                        <Package className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Faculties in export</p>
                            <p className="text-2xl font-semibold">{groups.length}</p>
                        </div>
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Currently selected</p>
                            <p className="text-2xl font-semibold">{selectedCount}</p>
                            <p className="text-xs text-muted-foreground">
                                Across {selectedFacultyCount} faculty group(s)
                            </p>
                        </div>
                        <Download className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg">
                            Selected Contributions for Publication({contributions.length})
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Choose individual contributions or whole faculty groups before exporting.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" onClick={toggleAll}>
                            {allSelected ? "Deselect All" : "Select All"}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleBulkDownload}
                            disabled={selectedCount === 0 || exporting}
                        >
                            {exporting ? (
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-1.5 h-4 w-4" />
                            )}
                            Download ({selectedCount})
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    {contributions.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">
                            No selected contributions to export.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {groups.map((group) => {
                                const groupIds = group.contributions.map((contribution) => contribution.id);
                                const selectedInGroup = groupIds.filter((id) => checkedIds.has(id)).length;
                                const allGroupSelected =
                                    group.contributions.length > 0 &&
                                    selectedInGroup === group.contributions.length;
                                const someGroupSelected =
                                    selectedInGroup > 0 && selectedInGroup < group.contributions.length;

                                return (
                                    <section
                                        key={group.facultyName}
                                        className="overflow-hidden rounded-xl border border-border"
                                    >
                                        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/30 px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={allGroupSelected}
                                                ref={(element) => {
                                                    if (element) {
                                                        element.indeterminate = someGroupSelected;
                                                    }
                                                }}
                                                onChange={() => toggleFacultyGroup(group)}
                                                className="rounded"
                                            />
                                            <Building2 className="h-4 w-4 text-primary" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-foreground">
                                                    {group.facultyName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {selectedInGroup} of {group.contributions.length} selected
                                                </p>
                                            </div>
                                            <Badge variant="secondary" className="ml-auto text-xs">
                                                {group.contributions.length}
                                            </Badge>
                                        </div>

                                        <div className="divide-y divide-border">
                                            {group.contributions.map((contribution) => {
                                                const contributorName = getContributorName(contribution);
                                                const isDownloading = downloadingId === contribution.id;

                                                return (
                                                    <div
                                                        key={contribution.id}
                                                        className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center"
                                                    >
                                                        <div className="flex items-start gap-3 sm:flex-1">
                                                            <input
                                                                type="checkbox"
                                                                checked={checkedIds.has(contribution.id)}
                                                                onChange={() => toggleCheck(contribution.id)}
                                                                className="mt-1 rounded"
                                                            />

                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-medium text-foreground">
                                                                    {contribution.subject}
                                                                </p>

                                                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <User className="h-3 w-3" />
                                                                        {contributorName}
                                                                    </span>
                                                                    <span>{formatCreatedDate(contribution.createdDate)}</span>
                                                                </div>

                                                                {contribution.description && (
                                                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                                        {contribution.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 shrink-0 gap-1.5 self-start sm:self-center"
                                                            onClick={() => handleSingleDownload(contribution.id)}
                                                            disabled={isDownloading}
                                                        >
                                                            {isDownloading ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Download className="h-4 w-4" />
                                                            )}
                                                            <span className="sm:hidden">Download</span>
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
