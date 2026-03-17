'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCreditApplication } from '@/lib/hooks/credit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle } from 'lucide-react';

const applicationSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyId: z.string().optional(),
  requestedLimit: z.number().min(1000, 'Minimum requested limit is $1,000'),
  industry: z.string().min(1, 'Industry is required'),
  revenue: z.number().min(0, 'Revenue must be a positive number'),
  creditScore: z.number().min(0).max(850, 'Credit score must be between 0-850'),
  contactName: z.string().min(1, 'Contact name is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().min(10, 'Valid phone number is required'),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

type FormStep = 'basic' | 'company' | 'financial' | 'review';

interface CreditApplicationFormProps {
  companyId?: string;
  onSuccess?: () => void;
}

export function CreditApplicationForm({
  companyId,
  onSuccess,
}: CreditApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { mutateAsync: createApplication } = useCreateCreditApplication();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: companyId ? { companyId } : undefined,
  });

  const requestedLimit = watch('requestedLimit');

  const steps: FormStep[] = ['basic', 'company', 'financial', 'review'];
  const currentStepIndex = steps.indexOf(currentStep);

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitStatus('idle');

      await createApplication({
        requestedLimit: data.requestedLimit,
        industry: data.industry,
        annualRevenue: data.revenue,
        businessCreditScore: data.creditScore,
        companyName: data.companyName,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
      });

      setSubmitStatus('success');
      setErrorMessage('');
      reset();
      onSuccess?.();

      // Reset to first step after success
      setTimeout(() => {
        setCurrentStep('basic');
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to submit application'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      if (nextStep) {
        setCurrentStep(nextStep);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      if (prevStep) {
        setCurrentStep(prevStep);
      }
    }
  };

  const handleReset = () => {
    reset();
    setCurrentStep('basic');
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Credit Application</CardTitle>
        <div className="mt-4 flex gap-2">
          {steps.map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full transition-colors ${
                steps.indexOf(step) <= currentStepIndex
                  ? 'bg-blue-600'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {submitStatus === 'success' && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-700">
              Application submitted successfully!
            </p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 'basic' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  {...register('companyName')}
                  className={errors.companyName ? 'border-red-500' : ''}
                />
                {errors.companyName && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="requestedLimit">Requested Credit Limit</Label>
                <Input
                  id="requestedLimit"
                  type="number"
                  placeholder="Enter amount in dollars"
                  {...register('requestedLimit', { valueAsNumber: true })}
                  className={errors.requestedLimit ? 'border-red-500' : ''}
                />
                {errors.requestedLimit && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.requestedLimit.message}
                  </p>
                )}
                {requestedLimit && (
                  <p className="text-xs text-gray-500 mt-1">
                    You are requesting ${requestedLimit.toLocaleString()} in
                    credit
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Company Info */}
          {currentStep === 'company' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Controller
                  name="industry"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transportation">
                          Transportation
                        </SelectItem>
                        <SelectItem value="manufacturing">
                          Manufacturing
                        </SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.industry && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.industry.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  placeholder="Full name"
                  {...register('contactName')}
                  className={errors.contactName ? 'border-red-500' : ''}
                />
                {errors.contactName && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.contactName.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Financial Info */}
          {currentStep === 'financial' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="revenue">Annual Revenue</Label>
                <Input
                  id="revenue"
                  type="number"
                  placeholder="Enter annual revenue"
                  {...register('revenue', { valueAsNumber: true })}
                  className={errors.revenue ? 'border-red-500' : ''}
                />
                {errors.revenue && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.revenue.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="creditScore">Business Credit Score</Label>
                <Input
                  id="creditScore"
                  type="number"
                  placeholder="0-850"
                  {...register('creditScore', { valueAsNumber: true })}
                  className={errors.creditScore ? 'border-red-500' : ''}
                />
                {errors.creditScore && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.creditScore.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contact@company.com"
                  {...register('contactEmail')}
                  className={errors.contactEmail ? 'border-red-500' : ''}
                />
                {errors.contactEmail && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.contactEmail.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  {...register('contactPhone')}
                  className={errors.contactPhone ? 'border-red-500' : ''}
                />
                {errors.contactPhone && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.contactPhone.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 'review' && (
            <div className="space-y-4 rounded-lg bg-gray-50 p-4">
              <h3 className="font-semibold text-gray-900">
                Application Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Company:</span>
                  <span className="font-medium">{watch('companyName')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Requested Limit:</span>
                  <span className="font-medium">
                    ${watch('requestedLimit')?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Industry:</span>
                  <span className="font-medium">{watch('industry')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Revenue:</span>
                  <span className="font-medium">
                    ${watch('revenue')?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Credit Score:</span>
                  <span className="font-medium">{watch('creditScore')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
            >
              Previous
            </Button>

            {currentStep === 'review' ? (
              <>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={handleNextStep} className="flex-1">
                Next
              </Button>
            )}

            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
