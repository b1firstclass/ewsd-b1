import { useState, useCallback } from "react";
import { GuestDashboard } from "../components/GuestDashboard";
import { GuestSelectedContributions } from "../components/GuestSelectedContributions";
import { ContributionDetailPanel } from "@/features/contribution/components/ContributionDetailPanel";
import type { ContributionInfo } from "@/types/contributionType";

export const GuestDashboardPage = () => {
    const [viewingId, setViewingId] = useState<string | null>(null);

    const handleView = useCallback((contribution: ContributionInfo) => {
        setViewingId(contribution.id);
    }, []);

    return (
        <>
            <GuestDashboard onView={handleView} />
            {viewingId && (
                <ContributionDetailPanel
                    contributionId={viewingId}
                    onClose={() => setViewingId(null)}
                />
            )}
        </>
    );
};

export const SelectedContributionsPage = () => {
    const [viewingId, setViewingId] = useState<string | null>(null);

    const handleView = useCallback((contribution: ContributionInfo) => {
        setViewingId(contribution.id);
    }, []);

    return (
        <>
            <GuestSelectedContributions onView={handleView} />
            {viewingId && (
                <ContributionDetailPanel
                    contributionId={viewingId}
                    onClose={() => setViewingId(null)}
                />
            )}
        </>
    );
};
