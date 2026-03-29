import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, LayoutGrid, List, Award, TrendingUp } from "lucide-react";
import { contributionApi } from "@/features/contribution/contributionApi";
import { ApiRoute } from "@/types/constantApiRoute";
import type { ContributionInfo } from "@/types/contributionType";
import { ContributionGrid } from "@/features/contribution/components/ContributionCard";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface GuestSelectedContributionsProps {
    onView: (contribution: ContributionInfo) => void;
}

export const GuestSelectedContributions = ({ onView }: GuestSelectedContributionsProps) => {
    const { user } = useAuth();
    const [contributions, setContributions] = useState<ContributionInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedYear, setSelectedYear] = useState('all');

    // Get guest's assigned faculty
    const guestFaculty = user?.faculties?.[0];

    useEffect(() => {
        const load = async () => {
            try {
                const response = await contributionApi.getSelectedList({
                    route: ApiRoute.Contribution.getSelectedList,
                    pageNumber: 1,
                    pageSize: 100,
                    searchKeyword: '',
                });
                setContributions(response.items);
            } catch (error) {
                console.error('Failed to load selected contributions:', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Faculty-specific filtering - backend already filters by guest's faculty
    const facultyContributions = contributions;

    // Year filtering
    const filteredByYear = useMemo(() => {
        if (selectedYear === 'all') return facultyContributions;
        
        const year = parseInt(selectedYear);
        return facultyContributions.filter(c => 
            c.createdDate && new Date(c.createdDate).getFullYear() === year
        );
    }, [facultyContributions, selectedYear]);

    // Search filtering
    const filtered = useMemo(() => {
        if (!searchTerm) return filteredByYear;
        const term = searchTerm.toLowerCase();
        return filteredByYear.filter(c =>
            c.subject.toLowerCase().includes(term) || c.description.toLowerCase().includes(term)
        );
    }, [filteredByYear, searchTerm]);

    // Available years for filtering
    const availableYears = useMemo(() => {
        const years = new Set(facultyContributions.map(c => 
            c.createdDate ? new Date(c.createdDate).getFullYear().toString() : 'unknown'
        ));
        return Array.from(years).sort().reverse();
    }, [facultyContributions]);

    // Faculty statistics
    const facultyStats = useMemo(() => {
        const total = filtered.length;
        const thisYear = filtered.filter(c => 
            c.createdDate && new Date(c.createdDate).getFullYear() === new Date().getFullYear()
        ).length;
        
        const recent = filtered.filter(c => 
            c.modifiedDate && 
            new Date(c.modifiedDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length;

        return { total, thisYear, recent };
    }, [filtered]);

    return (
        <div className="space-y-6">
            {/* Faculty-Aware Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="font-display text-2xl font-semibold">
                        Selected Contributions
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {facultyStats.total} publication-ready contribution{facultyStats.total !== 1 ? 's' : ''}
                        {guestFaculty && ` (${guestFaculty.name} Faculty)`}
                    </p>
                </div>
            </div>

            {/* Faculty Statistics */}
            {guestFaculty && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center justify-between p-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Total Selected</p>
                                <p className="text-xl font-bold">{facultyStats.total}</p>
                            </div>
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                <Award className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center justify-between p-4">
                            <div>
                                <p className="text-xs text-muted-foreground">This Year</p>
                                <p className="text-xl font-bold">{facultyStats.thisYear}</p>
                            </div>
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center justify-between p-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Recent (30 days)</p>
                                <p className="text-xl font-bold">{facultyStats.recent}</p>
                            </div>
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                <Search className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Search + Filters + View Toggle */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 sm:max-w-xs">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search contributions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-8 pl-8 text-sm"
                        />
                    </div>
                    {availableYears.length > 0 && (
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="h-8 rounded-md border border-border bg-background px-2 py-1 text-sm"
                        >
                            <option value="all">All Years</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="flex rounded-lg border border-border">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "rounded-l-lg p-1.5",
                            viewMode === 'grid' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        <LayoutGrid className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "rounded-r-lg p-1.5",
                            viewMode === 'list' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        <List className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <p className="text-muted-foreground">Loading selected contributions...</p>
                </div>
            ) : viewMode === 'grid' ? (
                <ContributionGrid
                    contributions={filtered}
                    onView={onView}
                    emptyMessage={`No selected contributions available${guestFaculty ? ` for ${guestFaculty.name}` : ''}.`}
                />
            ) : (
                <div className="space-y-2">
                    {filtered.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No contributions found{guestFaculty ? ` for ${guestFaculty.name}` : ''}.
                            </CardContent>
                        </Card>
                    ) : (
                        filtered.map(c => (
                            <Card
                                key={c.id}
                                className="cursor-pointer transition-shadow hover:shadow-md"
                                onClick={() => onView(c)}
                            >
                                <CardContent className="flex items-center gap-4 p-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{c.subject}</p>
                                        <p className="truncate text-xs text-muted-foreground">{c.description}</p>
                                        {c.createdDate && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(c.createdDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <span className="shrink-0 rounded-full bg-chart-2/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-chart-2">
                                        Selected ⭐
                                    </span>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
