'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useClaimFormStore } from '@/lib/stores/claim-form-store';
import { ClaimFormStep1 } from './ClaimFormStep1';
import { ClaimFormStep2 } from './ClaimFormStep2';
import { ClaimFormStep3 } from './ClaimFormStep3';
import { ClaimFormStep4 } from './ClaimFormStep4';
import { claimsClient, claimItemsClient } from '@/lib/api/claims';
import { CreateClaimDTO } from '@/lib/api/claims/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TOTAL_STEPS = 4;

interface NewClaimWizardProps {
  onSuccess?: (claimId: string) => void;
}

export function NewClaimWizard({ onSuccess }: NewClaimWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [unsavedAction, setUnsavedAction] = useState<'back' | 'exit' | null>(
    null
  );

  const formState = useClaimFormStore();
  const isFormDirty =
    formState.claimType ||
    formState.incidentDate ||
    formState.description ||
    formState.carrierId ||
    formState.items.length > 0 ||
    formState.documents.length > 0;

  const progressPercent = (currentStep / TOTAL_STEPS) * 100;

  const handleBackClick = () => {
    if (isFormDirty && currentStep > 1) {
      setUnsavedAction('back');
      setShowUnsavedWarning(true);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextClick = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleExitClick = () => {
    if (isFormDirty) {
      setUnsavedAction('exit');
      setShowUnsavedWarning(true);
    } else {
      router.push('/claims');
    }
  };

  const confirmUnsavedAction = () => {
    setShowUnsavedWarning(false);

    if (unsavedAction === 'back' && currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (unsavedAction === 'exit') {
      formState.reset();
      router.push('/claims');
    }

    setUnsavedAction(null);
  };

  const handleSaveAsDraft = async () => {
    if (!validateStep1()) {
      toast.error('Please complete the claim type and incident details');
      return;
    }

    setIsSubmitting(true);
    try {
      const claimedAmount = formState.getItemsTotal() || 0;

      const createData: CreateClaimDTO = {
        claimType: formState.claimType as any,
        description: formState.description,
        incidentDate: formState.incidentDate,
        incidentLocation: formState.incidentLocation || undefined,
        carrierId: formState.carrierId || undefined,
        orderId: formState.orderId,
        loadId: formState.loadId,
        claimedAmount,
        claimantName: 'Current User', // TODO: Get from auth context
        items: formState.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          damageType: item.damageType,
          damageExtent: item.damageExtent,
        })),
      };

      const claim = await claimsClient.create(createData);

      // Upload documents if any
      const documents = formState.getDocuments();
      if (documents.length > 0) {
        for (const doc of documents) {
          // In a real implementation, we'd upload the file first
          // For now, we'll just create the document record
          await claimItemsClient.addItem(claim.id, {
            description: `Document: ${doc.name}`,
            quantity: 1,
            unitPrice: 0,
          });
        }
      }

      toast.success('Claim saved as draft');
      formState.reset();
      onSuccess?.(claim.id);
      router.push(`/claims/${claim.id}`);
    } catch (error) {
      toast.error('Failed to save claim draft');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitClaim = async () => {
    // Validate all steps
    if (!validateStep1()) {
      setCurrentStep(1);
      toast.error('Please complete the claim type and incident details');
      return;
    }

    if (!validateStep2()) {
      setCurrentStep(2);
      toast.error('Please add at least one item to the claim');
      return;
    }

    setIsSubmitting(true);
    try {
      const claimedAmount = formState.getItemsTotal();

      const createData: CreateClaimDTO = {
        claimType: formState.claimType as any,
        description: formState.description,
        incidentDate: formState.incidentDate,
        incidentLocation: formState.incidentLocation || undefined,
        carrierId: formState.carrierId || undefined,
        orderId: formState.orderId,
        loadId: formState.loadId,
        claimedAmount,
        claimantName: 'Current User', // TODO: Get from auth context
        items: formState.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          damageType: item.damageType,
          damageExtent: item.damageExtent,
        })),
      };

      // Create claim
      const claim = await claimsClient.create(createData);

      // Upload documents if any
      const documents = formState.getDocuments();
      if (documents.length > 0) {
        for (const doc of documents) {
          // TODO: Upload file to backend first, then create document record
          // For now, we're just tracking in form state
          formState.updateDocument(doc.id, { isUploading: true });
          // Simulate upload
          await new Promise((resolve) => setTimeout(resolve, 500));
          formState.updateDocument(doc.id, { isUploading: false });
        }
      }

      // File the claim (change status from DRAFT to SUBMITTED)
      await claimsClient.file(claim.id, {});

      toast.success('Claim filed successfully');
      formState.reset();
      onSuccess?.(claim.id);
      router.push(`/claims/${claim.id}`);
    } catch (error) {
      toast.error('Failed to file claim');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation functions
  const validateStep1 = (): boolean => {
    return (
      !!formState.claimType &&
      !!formState.incidentDate &&
      !!formState.description &&
      formState.description.length >= 10 &&
      formState.description.length <= 5000 &&
      !!formState.carrierId
    );
  };

  const validateStep2 = (): boolean => {
    return formState.items.length > 0;
  };

  const canProceedToNext = (): boolean => {
    if (currentStep === 1) return validateStep1();
    if (currentStep === 2) return validateStep2();
    if (currentStep === 3) return true; // Documentation is optional
    return true;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (currentStep < TOTAL_STEPS && canProceedToNext()) {
          handleNextClick();
        }
      } else if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        if (currentStep > 1) {
          handleBackClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, canProceedToNext]);

  return (
    <>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Create New Claim
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            File a new insurance claim by completing the steps below
          </p>
        </div>

        {/* Progress Indicator */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Step {currentStep} of {TOTAL_STEPS}
                  </p>
                  <p className="text-xs text-text-muted">
                    {currentStep === 1 && 'Claim Type & Incident Details'}
                    {currentStep === 2 && 'Items & Damages'}
                    {currentStep === 3 && 'Documentation'}
                    {currentStep === 4 && 'Review & Submit'}
                  </p>
                </div>
                <div className="text-sm font-medium text-text-muted">
                  {Math.round(progressPercent)}%
                </div>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">
            {currentStep === 1 && <ClaimFormStep1 />}
            {currentStep === 2 && <ClaimFormStep2 />}
            {currentStep === 3 && <ClaimFormStep3 />}
            {currentStep === 4 && (
              <ClaimFormStep4
                onSaveAsDraft={handleSaveAsDraft}
                onSubmit={handleSubmitClaim}
                isLoading={isSubmitting}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="lg"
            disabled={currentStep === 1 || isSubmitting}
            onClick={handleBackClick}
            className="gap-2"
          >
            <ChevronLeft className="size-4" />
            Back
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExitClick}
            disabled={isSubmitting}
          >
            Exit
          </Button>

          {currentStep < TOTAL_STEPS ? (
            <Button
              size="lg"
              disabled={!canProceedToNext() || isSubmitting}
              onClick={handleNextClick}
              className="gap-2"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          ) : null}
        </div>

        {/* Keyboard shortcuts hint */}
        <p className="text-xs text-text-muted">
          💡 Keyboard shortcuts: Enter to next, Shift+Enter to back
        </p>
      </div>

      {/* Unsaved Changes Warning Dialog */}
      <Dialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to continue?
              {unsavedAction === 'exit' && ' Your form data will be lost.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUnsavedWarning(false)}
            >
              Keep Editing
            </Button>
            <Button
              variant="destructive"
              onClick={confirmUnsavedAction}
              disabled={isSubmitting}
            >
              {unsavedAction === 'exit' ? 'Leave' : 'Continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
