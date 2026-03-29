import { useState, useCallback } from "react";
import { CoordinatorDashboard } from "../components/CoordinatorDashboard";
import { ReviewQueueTable } from "../components/ReviewQueueTable";
import { ContributionDetailPanel } from "@/features/contribution/components/ContributionDetailPanel";
import type { ContributionInfo } from "@/types/contributionType";

export const CoordinatorDashboardPage = () => {
    return <CoordinatorDashboard />;
};

export const ReviewQueuePage = () => {
    const [viewingId, setViewingId] = useState<string | null>(null);

    // Read initial status filter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const initialStatus = urlParams.get('status') || undefined;

    const handleViewDetails = useCallback((submission: ContributionInfo) => {
        setViewingId(submission.id);
    }, []);

    return (
        <>
            <ReviewQueueTable
                onViewDetails={handleViewDetails}
                initialStatusFilter={initialStatus}
            />
            {viewingId && (
                <ContributionDetailPanel
                    contributionId={viewingId}
                    onClose={() => setViewingId(null)}
                    coordinatorMode
                />
            )}
        </>
    );
};
