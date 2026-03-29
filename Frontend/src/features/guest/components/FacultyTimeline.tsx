import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Award } from "lucide-react";
import type { ContributionInfo } from "@/types/contributionType";

interface FacultyTimelineProps {
    contributions: ContributionInfo[];
    facultyName?: string;
}

export const FacultyTimeline = ({ contributions, facultyName }: FacultyTimelineProps) => {
    const timelineData = useMemo(() => {
        // Sort contributions by creation date
        const sorted = contributions
            .filter(c => c.createdDate && c.status === 'Selected')
            .sort((a, b) => new Date(b.createdDate!).getTime() - new Date(a.createdDate!).getTime())
            .slice(0, 10); // Show last 10 selections

        // Group by month
        const grouped = sorted.reduce((acc, contribution) => {
            const date = new Date(contribution.createdDate!);
            const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            
            if (!acc[monthKey]) {
                acc[monthKey] = [];
            }
            acc[monthKey].push(contribution);
            return acc;
        }, {} as Record<string, ContributionInfo[]>);

        return Object.entries(grouped)
            .map(([month, contribs]) => ({
                month,
                contributions: contribs,
                count: contribs.length,
            }))
            .slice(0, 6); // Show last 6 months
    }, [contributions]);

    if (timelineData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Selection Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        No selected contributions available for timeline.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {facultyName ? `${facultyName} Selection Timeline` : 'Selection Timeline'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {timelineData.map(({ month, contributions: monthContribs, count }) => (
                        <div key={month} className="relative">
                            {/* Timeline marker */}
                            <div className="absolute left-4 top-6 bottom-0 w-0.5 bg-border" />
                            
                            <div className="relative flex items-start gap-4">
                                {/* Timeline dot */}
                                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                                    <Award className="h-4 w-4 text-primary-foreground" />
                                </div>
                                
                                {/* Timeline content */}
                                <div className="min-w-0 flex-1 pb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="text-sm font-semibold">{month}</h4>
                                        <Badge variant="secondary" className="text-xs">
                                            {count} selection{count !== 1 ? 's' : ''}
                                        </Badge>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {monthContribs.slice(0, 3).map((contribution) => (
                                            <div key={contribution.id} className="flex items-center gap-2 text-xs">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                <span className="font-medium truncate">{contribution.subject}</span>
                                                <span className="text-muted-foreground">
                                                    {contribution.createdDate && 
                                                        new Date(contribution.createdDate).toLocaleDateString()
                                                    }
                                                </span>
                                            </div>
                                        ))}
                                        {monthContribs.length > 3 && (
                                            <p className="text-xs text-muted-foreground">
                                                +{monthContribs.length - 3} more selection{monthContribs.length - 3 !== 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
