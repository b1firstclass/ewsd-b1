import { useEffect, useState, type ChangeEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Image as ImageIcon, AlertCircle, Loader2, X } from "lucide-react";
import { contributionApi } from "@/features/contribution/contributionApi";
import { contributionWindowApi } from "@/features/contributionWindow/contributionWindowApi";
import { ApiRoute } from "@/types/constantApiRoute";
import { useDeadlineLogic, formatDeadlineDisplay, getDeadlineColor } from "../hooks/useDeadlineLogic";
import { useAuth } from "@/contexts/AuthContext";
import { ContributionFileConstraints } from "@/types/contributionType";
import type { ContributionDocumentInfo, ContributionInfo } from "@/types/contributionType";
import type { ContributionWindowInfo } from "@/types/contributionWindowType";
import { toast } from "sonner";

interface SubmissionFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    existingContribution?: ContributionInfo;
    onSuccess?: () => void;
}

interface FormState {
    subject: string;
    description: string;
    documentFile: File | null;
    imageFile: File | null;
}

const INITIAL_FORM: FormState = {
    subject: "",
    description: "",
    documentFile: null,
    imageFile: null,
};

const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getExistingDocument = (documents: ContributionDocumentInfo[]) =>
    documents.find((document) =>
        ContributionFileConstraints.allowedDocumentExtensions.some(
            (extension) => extension === document.extension.toLowerCase()
        )
    ) ?? null;

const getExistingImage = (documents: ContributionDocumentInfo[]) =>
    documents.find((document) =>
        ContributionFileConstraints.allowedImageExtensions.some(
            (extension) => extension === document.extension.toLowerCase()
        )
    ) ?? null;

export const SubmissionFormModal = ({ open, onOpenChange, existingContribution, onSuccess }: SubmissionFormModalProps) => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [existingDocument, setExistingDocument] = useState<ContributionDocumentInfo | null>(null);
    const [existingImage, setExistingImage] = useState<ContributionDocumentInfo | null>(null);
    const [hideExistingDocument, setHideExistingDocument] = useState(false);
    const [hideExistingImage, setHideExistingImage] = useState(false);
    const [currentWindow, setCurrentWindow] = useState<ContributionWindowInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingExistingContribution, setLoadingExistingContribution] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalSteps = 3;
    const progress = (step / totalSteps) * 100;
    const isEditing = !!existingContribution;

    useEffect(() => {
        if (!open) return;

        let cancelled = false;

        setError(null);
        setExistingDocument(null);
        setExistingImage(null);
        setHideExistingDocument(false);
        setHideExistingImage(false);
        setCurrentWindow(null);

        const initialize = async () => {
            if (existingContribution) {
                setForm({
                    subject: existingContribution.subject,
                    description: existingContribution.description,
                    documentFile: null,
                    imageFile: null,
                });
                setAgreedToTerms(true);
                setStep(2);
                setLoadingExistingContribution(true);
            } else {
                setForm(INITIAL_FORM);
                setAgreedToTerms(false);
                setStep(1);
                setLoadingExistingContribution(false);
            }

            try {
                const windowData = await contributionWindowApi.getList({
                    route: ApiRoute.ContributionWindow.List,
                    pageNumber: 1,
                    pageSize: 10,
                    searchKeyword: "",
                });

                if (!cancelled) {
                    const activeWindow = windowData.items.find((windowItem) => windowItem.isActive) ?? null;
                    setCurrentWindow(activeWindow);
                }
            } catch (err) {
                console.error("Failed to load contribution window:", err);
            }

            if (!existingContribution) return;

            try {
                const detail = await contributionApi.getById(existingContribution.id);
                if (cancelled) return;

                setForm({
                    subject: detail.subject,
                    description: detail.description,
                    documentFile: null,
                    imageFile: null,
                });
                setExistingDocument(getExistingDocument(detail.documents));
                setExistingImage(getExistingImage(detail.documents));
            } catch (err) {
                console.error("Failed to load contribution detail:", err);
                if (!cancelled) {
                    setError("Failed to load current contribution details.");
                }
            } finally {
                if (!cancelled) {
                    setLoadingExistingContribution(false);
                }
            }
        };

        initialize();

        return () => {
            cancelled = true;
        };
    }, [open, existingContribution]);

    const deadlineLogic = useDeadlineLogic(currentWindow);
    const canEdit = deadlineLogic?.canEdit ?? true;

    const displayedDocument = form.documentFile
        ? {
            name: form.documentFile.name,
            size: form.documentFile.size,
            isExisting: false,
        }
        : existingDocument && !hideExistingDocument
            ? {
                name: existingDocument.fileName,
                size: existingDocument.size,
                isExisting: true,
            }
            : null;

    const displayedImage = form.imageFile
        ? {
            name: form.imageFile.name,
            size: form.imageFile.size,
            isExisting: false,
        }
        : existingImage && !hideExistingImage
            ? {
                name: existingImage.fileName,
                size: existingImage.size,
                isExisting: true,
            }
            : null;

    const validateDocumentFile = (file: File): string | null => {
        const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`.toLowerCase();
        if (!ContributionFileConstraints.allowedDocumentExtensions.some((extension) => extension === ext)) {
            return `Only ${ContributionFileConstraints.allowedDocumentExtensions.join(", ")} files are allowed.`;
        }
        if (file.size > ContributionFileConstraints.maxDocumentSizeBytes) {
            return `Document must be under ${ContributionFileConstraints.maxDocumentSizeBytes / (1024 * 1024)}MB.`;
        }
        return null;
    };

    const validateImageFile = (file: File): string | null => {
        const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`.toLowerCase();
        if (!ContributionFileConstraints.allowedImageExtensions.some((extension) => extension === ext)) {
            return `Only ${ContributionFileConstraints.allowedImageExtensions.join(", ")} images are allowed.`;
        }
        if (file.size > ContributionFileConstraints.maxImageSizeBytes) {
            return `Image must be under ${ContributionFileConstraints.maxImageSizeBytes / (1024 * 1024)}MB.`;
        }
        return null;
    };

    const handleDocumentSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validationError = validateDocumentFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setHideExistingDocument(false);
        setForm((prev) => ({ ...prev, documentFile: file }));
    };

    const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validationError = validateImageFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setHideExistingImage(false);
        setForm((prev) => ({ ...prev, imageFile: file }));
    };

    const handleRemoveDocument = () => {
        if (form.documentFile) {
            setForm((prev) => ({ ...prev, documentFile: null }));
            setHideExistingDocument(false);
            return;
        }

        setHideExistingDocument(true);
    };

    const handleRemoveImage = () => {
        if (form.imageFile) {
            setForm((prev) => ({ ...prev, imageFile: null }));
            setHideExistingImage(false);
            return;
        }

        setHideExistingImage(true);
    };

    const handleSubmit = async (submitAfterSave: boolean) => {
        if (!form.subject.trim()) {
            setError("Subject is required");
            return;
        }
        if (!form.description.trim()) {
            setError("Description is required");
            return;
        }
        if (!isEditing && !form.documentFile) {
            setError("Word document is required for new submissions");
            return;
        }
        if (!currentWindow) {
            setError("No active contribution window");
            return;
        }

        const facultyId = user?.faculties?.[0]?.id;
        if (!facultyId && !isEditing) {
            setError("You are not assigned to a faculty");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let result: ContributionInfo;

            if (isEditing) {
                result = await contributionApi.update(existingContribution.id, {
                    subject: form.subject,
                    description: form.description,
                    documentFile: form.documentFile,
                    imageFile: form.imageFile,
                });
            } else {
                result = await contributionApi.create({
                    contributionWindowId: currentWindow.id,
                    facultyId: facultyId!,
                    subject: form.subject,
                    description: form.description,
                    documentFile: form.documentFile!,
                    imageFile: form.imageFile,
                });
            }

            if (submitAfterSave) {
                await contributionApi.submit(result.id);
                toast.success("Contribution submitted successfully!");
            } else {
                toast.success(isEditing ? "Contribution updated!" : "Draft saved!");
            }

            onOpenChange(false);
            onSuccess?.();
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Failed to save contribution";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!canEdit && isEditing) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cannot Edit Submission</DialogTitle>
                    </DialogHeader>
                    <div className="p-6 text-center">
                        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
                        <p className="text-sm text-muted-foreground">
                            The final closure date has passed. This submission can no longer be edited.
                        </p>
                        <Button onClick={() => onOpenChange(false)} className="mt-4">Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {isEditing ? "Edit" : "New"} Magazine Contribution
                    </DialogTitle>
                    <DialogDescription>
                        Step {step} of {totalSteps}: {
                            step === 1 ? "Terms & Conditions" :
                            step === 2 ? "Content Details" :
                            "Attachments"
                        }
                    </DialogDescription>
                </DialogHeader>

                {deadlineLogic && (
                    <div className={`rounded-lg border-l-4 p-3 text-sm ${
                        deadlineLogic.status === "closed" ? "border-l-destructive bg-destructive/5" :
                        deadlineLogic.status === "submission-ended" ? "border-l-accent bg-accent/5" :
                        "border-l-primary bg-primary/5"
                    }`}>
                        <span className={`font-medium ${getDeadlineColor(deadlineLogic)}`}>
                            {formatDeadlineDisplay(deadlineLogic)}
                        </span>
                    </div>
                )}

                <div className="space-y-1">
                    <Progress value={progress} className="h-1.5" />
                    <p className="text-right text-xs text-muted-foreground">{step}/{totalSteps}</p>
                </div>

                {error && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                {loadingExistingContribution ? (
                    <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading contribution details...
                    </div>
                ) : (
                    <>
                        {step === 1 && (
                            <div className="space-y-5">
                                <div className="max-h-72 overflow-y-auto rounded-lg border border-border bg-muted/30 p-5">
                                    <h3 className="mb-3 font-semibold">Submission Terms & Conditions</h3>
                                    <div className="space-y-3 text-sm text-muted-foreground">
                                        <p>By submitting your work to the University Annual Magazine, you acknowledge and agree to:</p>
                                        <div><h4 className="font-semibold text-foreground">1. Original Work</h4><p>Your content is original and does not infringe on any intellectual property rights.</p></div>
                                        <div><h4 className="font-semibold text-foreground">2. Publication Rights</h4><p>You grant the University a non-exclusive right to publish and distribute your work.</p></div>
                                        <div><h4 className="font-semibold text-foreground">3. Content Standards</h4><p>All submissions must adhere to academic integrity standards and the University's code of conduct.</p></div>
                                        <div><h4 className="font-semibold text-foreground">4. Deadlines</h4><p>You must adhere to all submission and final closure deadlines.</p></div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 rounded-lg border p-4">
                                    <Checkbox
                                        id="terms"
                                        checked={agreedToTerms}
                                        onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                                        className="mt-0.5"
                                    />
                                    <label htmlFor="terms" className="cursor-pointer text-sm font-medium">
                                        I agree to the Terms & Conditions
                                    </label>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={() => setStep(2)} disabled={!agreedToTerms}>Continue</Button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-5">
                                {currentWindow && (
                                    <div className="rounded-lg bg-muted/50 p-3 text-sm">
                                        <span className="font-medium">Academic Year:</span>{" "}
                                        {currentWindow.academicYearStart}-{currentWindow.academicYearEnd}
                                        {user?.faculties?.[0] && (
                                            <span className="ml-3">
                                                <span className="font-medium">Faculty:</span> {user.faculties[0].name}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="subject">Article Title *</Label>
                                    <Input
                                        id="subject"
                                        placeholder="Enter the title of your article"
                                        value={form.subject}
                                        onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                                        maxLength={100}
                                    />
                                    <p className="text-right text-xs text-muted-foreground">{form.subject.length}/100</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description / Abstract *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Provide a brief description or abstract of your article"
                                        value={form.description}
                                        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                        maxLength={500}
                                        rows={5}
                                    />
                                    <p className="text-right text-xs text-muted-foreground">{form.description.length}/500</p>
                                </div>

                                <div className="flex justify-between">
                                    <Button variant="outline" onClick={() => setStep(1)} disabled={isEditing}>Back</Button>
                                    <Button
                                        onClick={() => setStep(3)}
                                        disabled={!form.subject.trim() || !form.description.trim()}
                                    >
                                        Continue
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Word Document {!isEditing && "*"}</Label>
                                        {displayedDocument ? (
                                            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                                                <FileText className="h-5 w-5 shrink-0 text-primary" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">{displayedDocument.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(displayedDocument.size)}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={handleRemoveDocument}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-primary hover:bg-muted/50">
                                                <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                                                <span className="text-sm font-medium">Upload .doc or .docx</span>
                                                <span className="text-xs text-muted-foreground">Max 10MB</span>
                                                <input type="file" className="hidden" accept=".doc,.docx" onChange={handleDocumentSelect} />
                                            </label>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Cover Image (optional)</Label>
                                        {displayedImage ? (
                                            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                                                <ImageIcon className="h-5 w-5 shrink-0 text-primary" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">{displayedImage.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(displayedImage.size)}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={handleRemoveImage}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-primary hover:bg-muted/50">
                                                <ImageIcon className="mb-2 h-6 w-6 text-muted-foreground" />
                                                <span className="text-sm font-medium">Upload cover image</span>
                                                <span className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP · Max 5MB</span>
                                                <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.gif,.webp" onChange={handleImageSelect} />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <p className="text-xs text-muted-foreground">
                                        Leave files empty to keep existing attachments. Uploading a new file replaces the previous one.
                                    </p>
                                )}

                                <div className="flex justify-between gap-2">
                                    <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => handleSubmit(false)} disabled={loading}>
                                            {loading ? "Saving..." : isEditing ? "Update" : "Save as Draft"}
                                        </Button>
                                        {!isEditing && (
                                            <Button onClick={() => handleSubmit(true)} disabled={loading || !form.documentFile}>
                                                {loading ? "Submitting..." : "Save & Submit"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};
