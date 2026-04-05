const getActionsRoute = (mainRoute: string): ActionProperties => {
    return {
        List: mainRoute,
        GetById: (id: string) => mainRoute + `/${id}`,
        Create: mainRoute,
        Update: (id: string) => mainRoute + `/${id}`,
        Delete: (id: string) => mainRoute + `/${id}`,
    };
};

export const ApiRoute = {
    Auth: {
        Login: "/Users/login",
        RefreshToken: "/Users/refresh-token"
    },
    Role: getActionsRoute("/roles"),
    User: {
        profile: "/users/profile",
        ...getActionsRoute("/users"),
    },
    Faculity: getActionsRoute("/faculties"),
    Permission: {
        getActiveList: "/permissions/activePermissions"
    },
    Category: {
        getActiveList: "/Categories/ActiveCategories",
        ...getActionsRoute("/Categories"),
    },
    ContributionWindow: {
        getStatus: "/ContributionWindows/status",
        ...getActionsRoute("/ContributionWindows"),
    },
    Contribution: {
        getSelectedList: "/Contributions/selected",
        downloadSelected: (id: string) => `/Contributions/selected/${id}/download`,
        downloadSelectedList: "/Contributions/selected/download",
        submit: (id: string) => `/Contributions/${id}/submit`,
        review: (id: string) => `/Contributions/${id}/review`,
        approve: (id: string) => `/Contributions/${id}/approve`,
        select: (id: string) => `/Contributions/${id}/select`,
        selectList: "/Contributions/select",
        reject: (id: string) => `/Contributions/${id}/reject`,
        requestRevision: (id: string) => `/Contributions/${id}/request-revision`,
        ...getActionsRoute("/Contributions"),
    },
    Comment: {
        getByContributionId: (contributionId: string) => `/Comments/contribution/${contributionId}`,
        ...getActionsRoute("/Comments"),
    },
    Report: {
        browserList: "/report/browser-list",
        contributionCountByFaculty: "/report/contribution-count-by-faculty",
        contributionPercentageByFaculty: "/report/contribution-percentage-by-faculty",
        contributionsWithoutComment: "/report/contributions-without-comment",
        contributionsWithoutCommentAfter14Days: "/report/contributions-without-comment-after-14-days",
        deviceActivityCount: "/report/device-activity-count",
        activityCountByHour: "/report/activity-count-by-hour",
        pageAccessCount: "/report/page-access-count",
        userActivityCount: "/report/user-activity-count",
        myContributionStatusCount: "/report/my-contribution-status-count",
        facultyContributionStatusCount: "/report/faculty-contribution-status-count",
        facultyUserCount: "/report/faculty-user-count",
        myFacultyStudentCount: "/report/my-faculty-student-count",
        topContributors: "/report/top-contributors",
    },
    // New system monitoring routes
    SystemMonitoring: {
        getActivityLogs: "/UserActivityLogs",
        getAnalytics: "/UserActivityLogs/analytics",
        getMostViewedPages: "/UserActivityLogs/most-viewed-pages",
        getBrowserStats: "/UserActivityLogs/browser-stats",
        getDeviceStats: "/UserActivityLogs/device-stats",
    },
    // New guest management routes
    GuestManagement: {
        getGuestList: "/Users/guest-users",
        triggerNotification: (facultyId: string) => `/Faculties/${facultyId}/notify-coordinator`,
        getGuestContributions: "/Contributions/guest-contributions",
    },
}

interface ActionProperties {
    List: string;
    GetById: (id: string) => string;
    Create: string;
    Update: (id: string) => string;
    Delete: (id: string) => string;
}

