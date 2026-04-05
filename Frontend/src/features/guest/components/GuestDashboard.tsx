import { useState, useEffect, useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star, Info, TrendingUp, Calendar, Award } from "lucide-react";
import { contributionApi } from "@/features/contribution/contributionApi";
import { ApiRoute } from "@/types/constantApiRoute";
import type { ContributionInfo } from "@/types/contributionType";
import { ContributionGrid } from "@/features/contribution/components/ContributionCard";
import { FacultyTimeline } from "./FacultyTimeline";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";

interface GuestDashboardProps {
    onView?: (contribution: ContributionInfo) => void;
}

export const GuestDashboard = ({ onView }: GuestDashboardProps = {}) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [contributions, setContributions] = useState<ContributionInfo[]>([]);
    const [loading, setLoading] = useState(true);

    // Get guest's assigned faculty
    const guestFaculty = user?.faculties?.[0];

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await contributionApi.getSelectedList({
                    route: ApiRoute.Contribution.getSelectedList,
                    pageNumber: 1,
                    pageSize: 100,
                    searchKeyword: '',
                });
                setContributions(response.items);
            } catch (error) {
                console.error('Failed to load guest data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Faculty-specific statistics - backend already filters by faculty
    const facultyStats = useMemo(() => {
        // All contributions are already filtered by guest's faculty from backend
        const facultyContributions = contributions;
        
        const thisYear = new Date().getFullYear();
        const thisYearContributions = facultyContributions.filter(c => 
            c.createdDate && new Date(c.createdDate).getFullYear() === thisYear
        );

        const recentSelections = facultyContributions.filter(c => 
            c.status === 'Selected' && 
            c.modifiedDate && 
            new Date(c.modifiedDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        );

        return {
            totalSelected: facultyContributions.filter(c => c.status === 'Selected').length,
            thisYear: thisYearContributions.filter(c => c.status === 'Selected').length,
            recentSelections: recentSelections.length,
            selectionRate: facultyContributions.length > 0 
                ? Math.round((facultyContributions.filter(c => c.status === 'Selected').length / facultyContributions.length) * 100)
                : 0,
            facultyName: guestFaculty?.name || 'Unknown Faculty',
        };
    }, [contributions, guestFaculty]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Spinner label="Loading guest dashboard" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Faculty-Aware Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="font-display text-xl font-semibold sm:text-2xl">
                        Welcome, {user?.fullName || 'Guest'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {facultyStats.facultyName} Guest Access - View selected contributions
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="w-fit shrink-0">
                        Guest Access
                    </Badge>
                    {guestFaculty && (
                        <Badge variant="outline" className="w-fit shrink-0">
                            {guestFaculty.name}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Faculty Information */}
            {guestFaculty && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="flex items-start gap-3 py-3">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div className="text-sm">
                            <p className="text-foreground">
                                You have read-only access to selected contributions from {guestFaculty.name}.
                            </p>
                            <p className="text-muted-foreground mt-1">
                                View publication-ready contributions selected for the university magazine.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Faculty-Specific KPIs */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Total Selected</p>
                            <p className="text-xl font-bold">{facultyStats.totalSelected}</p>
                        </div>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                            <Star className="h-4 w-4 text-muted-foreground" />
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
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Recent Selections</p>
                            <p className="text-xl font-bold">{facultyStats.recentSelections}</p>
                        </div>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Selection Rate</p>
                            <p className="text-xl font-bold">{facultyStats.selectionRate}%</p>
                        </div>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Selection Rate Progress */}
            {facultyStats.totalSelected > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Faculty Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Selection Rate</span>
                                    <span>{facultyStats.selectionRate}%</span>
                                </div>
                                <Progress value={facultyStats.selectionRate} className="h-2" />
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-lg font-semibold">{facultyStats.totalSelected}</p>
                                    <p className="text-xs text-muted-foreground">Total</p>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">{facultyStats.thisYear}</p>
                                    <p className="text-xs text-muted-foreground">This Year</p>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">{facultyStats.recentSelections}</p>
                                    <p className="text-xs text-muted-foreground">Recent</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recent Selected Contributions */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Recent Selected Contributions
                    </h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate({ to: "/guest/selected-contributions" })}
                    >
                        View All
                    </Button>
                </div>
                <ContributionGrid
                    contributions={contributions.slice(0, 6)}
                    onView={onView || (() => {})}
                    facultyName={guestFaculty?.name}
                    emptyMessage="No selected contributions available for your faculty."
                />
            </div>

            {/* Faculty Timeline */}
            <FacultyTimeline 
                contributions={contributions} 
                facultyName={guestFaculty?.name}
            />
        </div>
    );
};
