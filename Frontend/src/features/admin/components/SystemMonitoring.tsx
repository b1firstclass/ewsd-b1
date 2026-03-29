import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity, Users, Monitor, Globe, Clock, TrendingUp, Eye, RefreshCw
} from "lucide-react";
import { reportApi } from "@/features/report/reportApi";
import type {
  ActivityCountByHourInfo,
  BrowserListInfo,
  DeviceActivityCountInfo,
  FacultyUserCountInfo,
  PageAccessCountInfo,
  UserActivityCountInfo,
} from "@/types/reportType";
import { TinyBarChart } from "@/components/charts/TinyBarChart";
import { TinyDoughnutChart } from "@/components/charts/TinyDoughnutChart";
import { TinyHorizontalBarChart } from "@/components/charts/TinyHorizontalBarChart";

export const SystemMonitoring = () => {
  const [browserList, setBrowserList] = useState<BrowserListInfo[]>([]);
  const [pageAccessCount, setPageAccessCount] = useState<PageAccessCountInfo[]>([]);
  const [userActivityCount, setUserActivityCount] = useState<UserActivityCountInfo[]>([]);
  const [deviceActivityCount, setDeviceActivityCount] = useState<DeviceActivityCountInfo[]>([]);
  const [activityCountByHour, setActivityCountByHour] = useState<ActivityCountByHourInfo[]>([]);
  const [facultyUserCount, setFacultyUserCount] = useState<FacultyUserCountInfo[]>([]);
  const [hourlyFromInput, setHourlyFromInput] = useState("");
  const [hourlyToInput, setHourlyToInput] = useState("");
  const [hourlyRangeError, setHourlyRangeError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "summary">("overview");

  useEffect(() => {
    const loadData = async () => {
      const now = new Date();
      const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      setHourlyFromInput(toLocalInput(from));
      setHourlyToInput(toLocalInput(now));

      const results = await Promise.allSettled([
        reportApi.getBrowserList(),
        reportApi.getPageAccessCount(),
        reportApi.getUserActivityCount(),
        reportApi.getDeviceActivityCount(),
        reportApi.getActivityCountByHour(from.toISOString(), now.toISOString()),
        reportApi.getFacultyUserCount(),
      ]);

      if (results[0].status === "fulfilled") setBrowserList(results[0].value);
      if (results[1].status === "fulfilled") setPageAccessCount(results[1].value);
      if (results[2].status === "fulfilled") setUserActivityCount(results[2].value);
      if (results[3].status === "fulfilled") setDeviceActivityCount(results[3].value);
      if (results[4].status === "fulfilled") setActivityCountByHour(results[4].value);
      if (results[5].status === "fulfilled") setFacultyUserCount(results[5].value);

      setLoading(false);
    };
    loadData();
  }, []);

  const toLocalInput = (d: Date): string => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const refreshHourlyActivity = async () => {
    setHourlyRangeError(null);
    if (!hourlyFromInput || !hourlyToInput) {
      setHourlyRangeError("Please select both From and To dates.");
      return;
    }
    const fromIso = new Date(hourlyFromInput).toISOString();
    const toIso = new Date(hourlyToInput).toISOString();
    if (fromIso > toIso) {
      setHourlyRangeError("From date must be earlier than To date.");
      return;
    }
    try {
      const data = await reportApi.getActivityCountByHour(fromIso, toIso);
      setActivityCountByHour(data);
    } catch {
      setActivityCountByHour([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-lg text-muted-foreground">Loading system monitoring...</div>
      </div>
    );
  }

  // Computed values
  const totalPageViews = pageAccessCount.reduce((s, i) => s + i.count, 0);
  const totalHourlyEvents = activityCountByHour.reduce((s, i) => s + i.count, 0);
  const avgEventsPerHour = activityCountByHour.length > 0 ? Math.round(totalHourlyEvents / activityCountByHour.length) : 0;
  const totalUsers = facultyUserCount.reduce((s, f) => s + f.count, 0);

  const sortedHourly = activityCountByHour.slice().sort((a, b) => {
    return (a.hour ? new Date(a.hour).getTime() : 0) - (b.hour ? new Date(b.hour).getTime() : 0);
  });
  const hourlyLabels = sortedHourly.map((i) => {
    if (!i.hour || Number.isNaN(new Date(i.hour).getTime())) return "";
    return `${i.hour.slice(5, 10)} ${i.hour.slice(11, 13)}:00`;
  });
  const hourlyValues = sortedHourly.map((i) => i.count);
  const peakHour = sortedHourly.reduce((p, c) => (c.count > p.count ? c : p), { hour: null as string | null, count: 0 });
  const peakLabel = peakHour.hour ? `${peakHour.hour.slice(5, 10)} ${peakHour.hour.slice(11, 13)}:00` : "N/A";

  const topPages = pageAccessCount
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const topActiveUsers = userActivityCount.slice().sort((a, b) => b.count - a.count).slice(0, 8);

  const browserLabels = browserList.map((b) => b.browser ?? "Unknown");
  const browserValues = browserList.map((b) => b.count);
  const deviceLabels = deviceActivityCount.map((d) => d.device ?? "Unknown");
  const deviceValues = deviceActivityCount.map((d) => d.count);

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: Monitor },
    { key: "analytics" as const, label: "Analytics", icon: TrendingUp },
    { key: "summary" as const, label: "Summary", icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl font-semibold sm:text-2xl">System Monitoring</h1>
        <p className="text-sm text-muted-foreground">Real-time activity, engagement, and user metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total Page Views", value: totalPageViews, sub: "All time", icon: Eye },
          { label: "Active Users", value: userActivityCount.length, sub: "With recorded activity", icon: Activity },
          { label: "Total Users", value: totalUsers, sub: "Across all faculties", icon: Users },
          { label: "Avg Events/Hour", value: avgEventsPerHour, sub: "Selected range", icon: Clock },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.sub}</p>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <Button key={tab.key} variant={activeTab === tab.key ? "default" : "outline"} size="sm" onClick={() => setActiveTab(tab.key)} className="shrink-0 gap-1.5">
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Most Viewed Pages — Horizontal Bar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Most Viewed Pages</CardTitle>
              <p className="text-xs text-muted-foreground">Top 10 pages by total views</p>
            </CardHeader>
            <CardContent>
              {topPages.length > 0 ? (
                <TinyHorizontalBarChart
                  labels={topPages.map((p) => p.resource ?? "Unknown")}
                  dataPoints={topPages.map((p) => p.count)}
                  label="Views"
                  color="rgba(99, 102, 241, 0.7)"
                />
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Eye className="mx-auto mb-2 h-8 w-8" />
                  <p>No page view data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Browser & Device side by side */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-lg">Browser Usage</CardTitle></CardHeader>
              <CardContent>
                {browserLabels.length > 0 ? (
                  <TinyDoughnutChart labels={browserLabels} dataPoints={browserValues} />
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">No data</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Device Usage</CardTitle></CardHeader>
              <CardContent>
                {deviceLabels.length > 0 ? (
                  <TinyDoughnutChart labels={deviceLabels} dataPoints={deviceValues} />
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">No data</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── Analytics Tab ── */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Hourly Activity Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hourly Activity Trend</CardTitle>
              <p className="text-xs text-muted-foreground">Activity count per hour for your selected range.</p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-muted-foreground">From</label>
                  <input type="datetime-local" value={hourlyFromInput} onChange={(e) => setHourlyFromInput(e.target.value)} className="h-9 rounded-md border border-border bg-background px-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-muted-foreground">To</label>
                  <input type="datetime-local" value={hourlyToInput} onChange={(e) => setHourlyToInput(e.target.value)} className="h-9 rounded-md border border-border bg-background px-2 text-sm" />
                </div>
                <Button variant="outline" size="sm" className="h-9" onClick={refreshHourlyActivity}>Update</Button>
              </div>
              {hourlyRangeError && <p className="mt-2 text-xs text-destructive">{hourlyRangeError}</p>}
            </CardHeader>
            <CardContent>
              {hourlyLabels.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Peak hour</p>
                      <p className="text-lg font-semibold">{peakLabel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Events</p>
                      <p className="text-lg font-semibold">{peakHour.count}</p>
                    </div>
                  </div>
                  <TinyBarChart
                    labels={hourlyLabels}
                    datasets={[{ label: "Events", data: hourlyValues, backgroundColor: "rgba(75, 192, 192, 0.6)" }]}
                  />
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">No hourly activity data available.</p>
              )}
            </CardContent>
          </Card>

          {/* Most Active Users */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Most Active Users</CardTitle></CardHeader>
            <CardContent>
              {topActiveUsers.length > 0 ? (
                <TinyHorizontalBarChart
                  labels={topActiveUsers.map((u) => u.fullName ?? "Unknown")}
                  dataPoints={topActiveUsers.map((u) => u.count)}
                  label="Events"
                  color="rgba(234, 88, 12, 0.6)"
                />
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">No user activity data.</p>
              )}
            </CardContent>
          </Card>

          {/* Faculty User Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Faculty User Distribution</CardTitle>
              <p className="text-xs text-muted-foreground">Total users per faculty</p>
            </CardHeader>
            <CardContent>
              {facultyUserCount.length > 0 ? (
                <TinyHorizontalBarChart
                  labels={facultyUserCount.map((f) => f.facultyName)}
                  dataPoints={facultyUserCount.map((f) => f.count)}
                  label="Users"
                  color="rgba(16, 185, 129, 0.6)"
                />
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">No faculty data available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Summary Tab ── */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Real KPI summary */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{avgEventsPerHour}</p>
                <p className="text-xs text-muted-foreground">Avg Events/Hour</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{pageAccessCount.length}</p>
                <p className="text-xs text-muted-foreground">Tracked Pages</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{browserList.length}</p>
                <p className="text-xs text-muted-foreground">Browsers Detected</p>
              </CardContent>
            </Card>
          </div>

          {/* At-a-glance stats */}
          <Card>
            <CardHeader><CardTitle className="text-lg">System Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">User Engagement</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Active Users</span><span>{userActivityCount.length}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Users</span><span>{totalUsers}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Page Views</span><span>{totalPageViews}</span></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Platform Coverage</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Tracked Browsers</span><span>{browserList.length}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Tracked Devices</span><span>{deviceActivityCount.length}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Faculties</span><span>{facultyUserCount.length}</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-1.5 h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
};
