import { useState, useCallback } from "react";
import { StudentDashboard } from "../components/StudentDashboard";
import { SubmissionFormModal } from "../components/SubmissionFormModal";
import { MySubmissionsList } from "../components/MySubmissionsList";
import { ContributionDetailPanel } from "@/features/contribution/components/ContributionDetailPanel";
import type { ContributionInfo } from "@/types/contributionType";
import { contributionApi } from "@/features/contribution/contributionApi";
import { toast } from "sonner";

export const StudentDashboardPage = () => {
    return <StudentDashboard />;
};

export const StudentSubmissionsPage = () => {
    const [formOpen, setFormOpen] = useState(false);
    const [editingContribution, setEditingContribution] = useState<ContributionInfo | undefined>();
    const [viewingId, setViewingId] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Read ?status= from URL for pre-filtering
    const urlParams = new URLSearchParams(window.location.search);
    const initialStatus = urlParams.get('status') || undefined;

    const handleCreateNew = useCallback(() => {
        setEditingContribution(undefined);
        setFormOpen(true);
    }, []);

    const handleEdit = useCallback((submission: ContributionInfo) => {
        setViewingId(null);
        setEditingContribution(submission);
        setFormOpen(true);
    }, []);

    const handleView = useCallback((submission: ContributionInfo) => {
        setViewingId(submission.id);
    }, []);

    const handleSubmitFromDetail = useCallback(async (submission: ContributionInfo) => {
        try {
            await contributionApi.submit(submission.id);
            toast.success(`"${submission.subject}" submitted for review!`);
            setViewingId(null);
            setRefreshKey(k => k + 1);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to submit");
        }
    }, []);

    const handleSuccess = useCallback(() => {
        setRefreshKey(k => k + 1);
    }, []);

    return (
        <div>
            <MySubmissionsList
                key={refreshKey}
                onCreateNew={handleCreateNew}
                onEditSubmission={handleEdit}
                onViewSubmission={handleView}
                initialStatusFilter={initialStatus}
            />
            <SubmissionFormModal
                open={formOpen}
                onOpenChange={setFormOpen}
                existingContribution={editingContribution}
                onSuccess={handleSuccess}
            />
            {viewingId && (
                <ContributionDetailPanel
                    contributionId={viewingId}
                    onClose={() => setViewingId(null)}
                    onEdit={(d) => handleEdit(d as ContributionInfo)}
                    onSubmit={(d) => handleSubmitFromDetail(d as ContributionInfo)}
                />
            )}
        </div>
    );
};
