import { useMemo } from "react";
import type { UserProfile } from "@/lib/backendApi";
import type { Contribution } from "@/lib/backendApi";

interface MockGuest {
    id: string;
    name: string;
    email: string;
    facultyId: string;
    isActive: boolean;
    createdDate: string;
    permissions: string[];
}

export interface GuestAccess {
    canViewSelected: boolean;
    canReview: boolean;
    canComment: boolean;
    canSubmit: boolean;
    canEdit: boolean;
    canExport: boolean;
    allowedFaculties: string[];
    permissions: string[];
    accessLevel: 'read-only' | 'reviewer' | 'full';
}

export const useGuestAccess = (user: UserProfile | null, guest: MockGuest | null): GuestAccess => {
    return useMemo(() => {
        // Default guest access permissions
        const defaultAccess: GuestAccess = {
            canViewSelected: true,
            canReview: false,
            canComment: false,
            canSubmit: false,
            canEdit: false,
            canExport: false,
            allowedFaculties: guest?.facultyId ? [guest.facultyId] : [],
            permissions: guest?.permissions || [],
            accessLevel: 'read-only'
        };

        // If no user or guest, return minimal access
        if (!user || !guest) {
            return defaultAccess;
        }

        // Check if user is a guest role
        const isGuest = user.loginId.includes('guest') || user.email.includes('external');
        
        if (!isGuest) {
            return {
                ...defaultAccess,
                canViewSelected: false,
                allowedFaculties: [],
                accessLevel: 'read-only'
            };
        }

        // Enhanced guest permissions based on guest profile
        const enhancedAccess: GuestAccess = {
            canViewSelected: true,
            canReview: guest.permissions.includes('review'),
            canComment: guest.permissions.includes('comment'),
            canSubmit: false, // Guests cannot submit
            canEdit: false,   // Guests cannot edit
            canExport: guest.permissions.includes('export'),
            allowedFaculties: guest.facultyId ? [guest.facultyId] : [],
            permissions: guest.permissions,
            accessLevel: guest.permissions.includes('review') ? 'reviewer' : 'read-only'
        };

        return enhancedAccess;
    }, [user, guest]);
};

// Hook to filter contributions based on guest access
export const useGuestMockContributionFilter = (
    contributions: Contribution[],
    guestAccess: GuestAccess
): Contribution[] => {
    return useMemo(() => {
        if (!guestAccess.canViewSelected) {
            return [];
        }

        // Filter contributions based on guest permissions
        return contributions.filter(contribution => {
            // Only show selected contributions to guests
            if (contribution.status !== 'Selected') {
                return false;
            }

            // Filter by allowed faculties if specified
            if (guestAccess.allowedFaculties.length > 0) {
                return guestAccess.allowedFaculties.includes(contribution.facultyId);
            }

            return true;
        });
    }, [contributions, guestAccess]);
};

// Hook to get guest statistics
export const useGuestStatistics = (
    contributions: Contribution[],
    guestAccess: GuestAccess
) => {
    return useMemo(() => {
        // Filter contributions based on guest permissions (inline logic)
        const filteredContributions = guestAccess.canViewSelected 
            ? contributions.filter(contribution => {
                // Only show selected contributions to guests
                if (contribution.status !== 'Selected') {
                    return false;
                }

                // Filter by allowed faculties if specified
                if (guestAccess.allowedFaculties.length > 0) {
                    return guestAccess.allowedFaculties.includes(contribution.facultyId);
                }

                return true;
            })
            : [];

        const stats = {
            totalViewable: filteredContributions.length,
            byStatus: {
                selected: filteredContributions.filter(c => c.status === 'Selected').length,
                approved: filteredContributions.filter(c => c.status === 'Approved').length,
                underReview: filteredContributions.filter(c => c.status === 'Under Review').length
            },
            byFaculty: {} as Record<string, number>,
            recentActivity: filteredContributions
                .sort((a, b) => new Date(b.modifiedDate).getTime() - new Date(a.modifiedDate).getTime())
                .slice(0, 5)
        };

        // Calculate contributions by faculty
        filteredContributions.forEach(contribution => {
            if (!stats.byFaculty[contribution.facultyId]) {
                stats.byFaculty[contribution.facultyId] = 0;
            }
            stats.byFaculty[contribution.facultyId]++;
        });

        return stats;
    }, [contributions, guestAccess]);
};

// Hook to validate guest actions
export const useGuestActionValidation = (guestAccess: GuestAccess) => {
    return useMemo(() => {
        const canViewMockContribution = (contribution: Contribution): boolean => {
            if (!guestAccess.canViewSelected) return false;
            if (contribution.status !== 'Selected') return false;
            if (guestAccess.allowedFaculties.length > 0) {
                return guestAccess.allowedFaculties.includes(contribution.facultyId);
            }
            return true;
        };

        const canReviewMockContribution = (contribution: Contribution): boolean => {
            return guestAccess.canReview && canViewMockContribution(contribution);
        };

        const canCommentOnMockContribution = (contribution: Contribution): boolean => {
            return guestAccess.canComment && canViewMockContribution(contribution);
        };

        const canExportMockContribution = (contribution: Contribution): boolean => {
            return guestAccess.canExport && canViewMockContribution(contribution);
        };

        return {
            canViewMockContribution,
            canReviewMockContribution,
            canCommentOnMockContribution,
            canExportMockContribution
        };
    }, [guestAccess]);
};

// Hook to get guest session information
export const useGuestSession = (user: UserProfile | null, guest: MockGuest | null) => {
    return useMemo(() => {
        if (!user || !guest) {
            return {
                isLoggedIn: false,
                sessionStartTime: null,
                sessionDuration: 0,
                accessLevel: 'none'
            };
        }

        const sessionStartTime = new Date(user.createdDate);
        const sessionDuration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / (1000 * 60 * 60 * 24));

        return {
            isLoggedIn: true,
            sessionStartTime,
            sessionDuration,
            accessLevel: guest.permissions.includes('review') ? 'reviewer' : 'read-only'
        };
    }, [user, guest]);
};

// Hook to format guest welcome message
export const useGuestWelcomeMessage = (user: UserProfile | null, guest: MockGuest | null): string => {
    return useMemo(() => {
        if (!user || !guest) {
            return 'Welcome, Guest';
        }

        const accessLevel = guest.permissions.includes('review') ? 'Reviewer' : 'Guest';
        const facultyName = guest.facultyId ? `for ${guest.facultyId}` : '';
        
        return `Welcome, ${user.fullName} - ${accessLevel} ${facultyName}`;
    }, [user, guest]);
};

// Hook to track guest activity
export const useGuestActivityTracker = () => {
    const trackActivity = (action: string, contributionId?: string, details?: any) => {
        // Mock activity tracking for Phase 1
        console.log('Guest Activity:', {
            action,
            contributionId,
            details,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });

        // In real implementation, this would send to backend
        // await api.post('/guest-activity', { action, contributionId, details });
    };

    const trackView = (contributionId: string) => {
        trackActivity('view_contribution', contributionId);
    };

    const trackReview = (contributionId: string) => {
        trackActivity('review_contribution', contributionId);
    };

    const trackComment = (contributionId: string, comment: string) => {
        trackActivity('add_comment', contributionId, { commentLength: comment.length });
    };

    const trackExport = (contributionIds: string[]) => {
        trackActivity('export_contributions', undefined, { count: contributionIds.length });
    };

    return {
        trackActivity,
        trackView,
        trackReview,
        trackComment,
        trackExport
    };
};
