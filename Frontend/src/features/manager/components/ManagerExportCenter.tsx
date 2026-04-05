import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2, ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { contributionApi } from "@/features/contribution/contributionApi";
import { ApiRoute } from "@/types/constantApiRoute";
import type { ContributionInfo } from "@/types/contributionType";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const ManagerExportCenter = () => {
    const navigate = useNavigate();
    const [contributions, setContributions] = useState<ContributionInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const load = async () => {
            try {
                const res = await contributionApi.getSelectedList({
                    route: ApiRoute.Contribution.getSelectedList,
                    pageNumber: 1,
                    pageSize: 100, // Backend validation: MaxPageSize = 100
                    searchKeyword: "",
                });
                setContributions(res.items);
            } catch (err) {
                console.error("Failed to load selected contributions:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const toggleCheck = (id: string) => {
        setCheckedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        if (checkedIds.size === contributions.length) {
            setCheckedIds(new Set());
        } else {
            setCheckedIds(new Set(contributions.map(c => c.id)));
        }
    };

    const handleBulkDownload = async () => {
        if (checkedIds.size === 0) return;
        setExporting(true);
        try {
            await contributionApi.downloadSelectedBulk({ contributionIds: Array.from(checkedIds) });
            toast.success(`Downloaded ${checkedIds.size} contribution(s)`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Download failed");
        } finally {
            setExporting(false);
        }
    };

    const handleSingleDownload = async (id: string) => {
        try {
            await contributionApi.downloadSelected(id);
        } catch {
            toast.error("Download failed");
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
            {/* Header */}
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
                    <h1 className="font-display text-xl font-semibold sm:text-2xl">Export Center</h1>
                    <p className="text-sm text-muted-foreground">
                        Download selected contributions as ZIP files for transfer.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg">
                        Selected Contributions ({contributions.length})
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={selectAll}>
                            {checkedIds.size === contributions.length && contributions.length > 0
                                ? "Deselect All"
                                : "Select All"}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleBulkDownload}
                            disabled={checkedIds.size === 0 || exporting}
                        >
                            {exporting ? (
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-1.5 h-4 w-4" />
                            )}
                            Download ({checkedIds.size})
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {contributions.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">
                            No selected contributions to export.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {contributions.map(c => (
                                <div
                                    key={c.id}
                                    className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={checkedIds.has(c.id)}
                                        onChange={() => toggleCheck(c.id)}
                                        className="rounded"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{c.subject}</p>
                                        <p className="truncate text-xs text-muted-foreground">{c.description}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 shrink-0 p-0"
                                        onClick={() => handleSingleDownload(c.id)}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
