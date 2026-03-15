'use client';

import { useRouter } from 'next/navigation';
import { useContractBuilderStore } from '@/lib/stores/contractBuilderStore';
import { useContracts } from '@/lib/hooks/contracts/useContracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import BuilderStep1 from './BuilderStep1';
import BuilderStep2 from './BuilderStep2';
import BuilderStep3 from './BuilderStep3';
import BuilderStep4 from './BuilderStep4';

export default function ContractBuilder() {
  const router = useRouter();
  const { currentStep, setCurrentStep, reset } = useContractBuilderStore();
  const { create: createContract, isCreating } = useContracts();

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCancel = () => {
    reset();
    router.push('/contracts');
  };

  const handleSubmit = async () => {
    try {
      const store = useContractBuilderStore.getState();
      const formData = store.getFormData();

      // Create contract with the builder data
      await createContract({
        contractNumber: `CNT-${Date.now()}`,
        contractName: `Contract ${new Date().toLocaleDateString()}`,
        type: formData.type,
        partyId: formData.partyId,
        partyName: formData.partyName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        value: formData.value,
        currency: formData.currency,
        terms: formData.paymentTerms,
      } as any);

      reset();
      router.push('/contracts');
    } catch (error) {
      console.error('Failed to create contract:', error);
    }
  };

  const stepTitles = [
    'Type & Parties',
    'Terms',
    'Rate Tables',
    'SLAs & Review',
  ];

  const progress = (currentStep / 4) * 100;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Create New Contract
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Step {currentStep} of 4 - {stepTitles[currentStep - 1]}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Cancel
        </Button>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <Progress value={progress} className="h-2" />
          <div className="mt-4 flex justify-between text-xs text-text-muted">
            {stepTitles.map((title, index) => (
              <div key={index} className="text-center">
                <div
                  className={`mb-2 inline-block h-6 w-6 rounded-full text-sm font-medium leading-6 ${
                    index + 1 <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'border-2 border-gray-300'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="hidden sm:block">{title}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && <BuilderStep1 />}
          {currentStep === 2 && <BuilderStep2 />}
          {currentStep === 3 && <BuilderStep3 />}
          {currentStep === 4 && <BuilderStep4 />}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePreviousStep}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Previous
        </Button>

        {currentStep === 4 ? (
          <Button
            onClick={handleSubmit}
            disabled={isCreating}
            className="gap-2"
          >
            {isCreating ? 'Creating...' : 'Create Contract'}
          </Button>
        ) : (
          <Button onClick={handleNextStep} className="gap-2">
            Next
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
