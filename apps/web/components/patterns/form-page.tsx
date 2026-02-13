"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, UseFormReturn, FieldValues, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema } from "zod";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/tms/layout/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormPageSkeleton } from "@/components/shared/form-page-skeleton";
import { ErrorState } from "@/components/shared/error-state";

// ---------------------------------------------------------------------------
// FormPage — Standardized layout for create/edit screens
//
// Composes:
// - PageHeader with back navigation
// - React Hook Form + Zod validation
// - Form sections (Cards)
// - Sticky bottom action bar
// - Dirty state confirmation before leaving
// ---------------------------------------------------------------------------

interface FormPageProps<T extends FieldValues> {
    // --- Header ---
    title: string;
    description?: string;
    backPath?: string; // If not provided, uses router.back()

    // --- Form Config ---
    schema: ZodSchema<T>;
    defaultValues: DefaultValues<T>;
    onSubmit: (values: T) => Promise<void> | void;

    // --- Content ---
    /** 
     * Render function receiving the form instance. 
     * Use this to render form fields organized in sections/cards.
     */
    children: (form: UseFormReturn<T>) => React.ReactNode;

    // --- State ---
    isLoading?: boolean;
    isSubmitting?: boolean;
    error?: Error | null;

    // --- Actions ---
    submitLabel?: string;
    cancelLabel?: string;
    onCancel?: () => void;

    className?: string;
}

export function FormPage<T extends FieldValues>({
    title,
    description,
    backPath,
    schema,
    defaultValues,
    onSubmit,
    children,
    isLoading,
    isSubmitting: externalIsSubmitting,
    error,
    submitLabel = "Save Changes",
    cancelLabel = "Cancel",
    onCancel,
    className,
}: FormPageProps<T>) {
    const router = useRouter();
    const [showExitDialog, setShowExitDialog] = React.useState(false);
    const [pendingNavigation, setPendingNavigation] = React.useState<(() => void) | null>(null);

    // Initialize form
    const form = useForm<T>({
        resolver: zodResolver(schema as any),
        defaultValues,
        mode: "onChange",
        criteriaMode: "all", // Show all errors for a field
    });

    const { isDirty, isValid, isSubmitting: formIsSubmitting } = form.formState;
    const isSubmitting = externalIsSubmitting || formIsSubmitting;

    // Warn on browser close/refresh if dirty
    React.useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    // Handle back button
    const handleBack = () => {
        if (isDirty) {
            setShowExitDialog(true);
            setPendingNavigation(() => () => {
                backPath ? router.push(backPath) : router.back();
            });
        } else {
            backPath ? router.push(backPath) : router.back();
        }
    };

    // Handle cancel button
    const handleCancel = () => {
        if (onCancel) {
            if (isDirty) {
                setShowExitDialog(true);
                setPendingNavigation(() => onCancel);
            } else {
                onCancel();
            }
        } else {
            handleBack();
        }
    };

    // Confirm exit
    const confirmExit = () => {
        setShowExitDialog(false);
        if (pendingNavigation) {
            pendingNavigation();
        }
    };

    // --- Loading State ---
    if (isLoading) {
        return <FormPageSkeleton />;
    }

    // --- Error State ---
    if (error) {
        return (
            <div className="p-6">
                <ErrorState
                    title="Error loading form"
                    message={error.message}
                    retry={() => window.location.reload()}
                    backButton={
                        <Button variant="outline" onClick={() => router.back()}>
                            Go Back
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col min-h-screen bg-background pb-20", className)}>
            {/* Header with Back Button */}
            <PageHeader
                title={
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex flex-col">
                            <span>{title}</span>
                            {description && (
                                <span className="text-xs font-normal text-muted-foreground">{description}</span>
                            )}
                        </div>
                    </div>
                }
            />

            {/* Form Content */}
            <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {children(form)}

                        {/* Hidden submit button to allow Enter key submission */}
                        <button type="submit" className="hidden" />
                    </form>
                </Form>
            </div>

            {/* Sticky Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm p-4 z-50">
                <div className="max-w-5xl mx-auto flex items-center justify-end gap-3 px-4 md:px-0">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={!isDirty || isSubmitting} // Removing !isValid to allow showing validation errors on submit
                        className="min-w-[120px]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {submitLabel}
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Unsaved Changes Dialog */}
            <ConfirmDialog
                open={showExitDialog}
                title="Unsaved Changes"
                description="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
                confirmLabel="Discard Changes"
                cancelLabel="Keep Editing"
                variant="destructive"
                onConfirm={confirmExit}
                onCancel={() => setShowExitDialog(false)}
            />
        </div>
    );
}

// ---------------------------------------------------------------------------
// FormSection — Wrapper for grouping fields in a card
// ---------------------------------------------------------------------------

interface FormSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
                {children}
            </CardContent>
        </Card>
    );
}
