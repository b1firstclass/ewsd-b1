import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Activity, Clock3, ShieldCheck, Users2, type LucideIcon } from "lucide-react";

interface OverviewItem {
    label: string;
    value: string;
    trend: string;
    icon: LucideIcon;
}

const overviewItems: OverviewItem[] = [
    {
        label: "Active Sessions",
        value: "128",
        trend: "+6% this week",
        icon: Activity,
    },
    {
        label: "Team Members",
        value: "24",
        trend: "3 pending invites",
        icon: Users2,
    },
    {
        label: "Security Checks",
        value: "99.8%",
        trend: "No alerts today",
        icon: ShieldCheck,
    },
    {
        label: "Avg Response Time",
        value: "238ms",
        trend: "-11ms from yesterday",
        icon: Clock3,
    },
];

export const HomePage = () => {
    return (
        <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {overviewItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Card key={item.label} className="rounded-2xl">
                            <CardHeader className="space-y-3 pb-3">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="rounded-full">
                                        {item.label}
                                    </Badge>
                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Icon className="h-4 w-4" />
                                    </span>
                                </div>
                                <CardTitle className="text-2xl">{item.value}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{item.trend}</CardDescription>
                            </CardContent>
                        </Card>
                    );
                })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Operations Snapshot</CardTitle>
                        <CardDescription>Daily system activity for web and mobile channels.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Web Traffic</span>
                            <span className="font-semibold">68%</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Mobile Traffic</span>
                            <span className="font-semibold">32%</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Background Jobs Success</span>
                            <span className="font-semibold">99.3%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Quick Notes</CardTitle>
                        <CardDescription>Reusable layout is now ready for protected screens.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>Use `ProtectedLayout` for every new authenticated route.</p>
                        <p>Add new sidebar links from `navItems` in one place.</p>
                        <p>Header actions can be swapped per page without changing the shell.</p>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
