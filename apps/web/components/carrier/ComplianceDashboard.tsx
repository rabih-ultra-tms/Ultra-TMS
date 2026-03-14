'use client';

import { useState } from 'react';
import { useComplianceDocs } from '@/lib/hooks/useCarrierData';
import { carrierClient } from '@/lib/api/carrier-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';

export interface ComplianceDocStatus {
  id: string;
  documentType: string;
  status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'VERIFIED' | 'EXPIRED';
  uploadedAt?: string;
  expiryDate?: string;
  isRequired: boolean;
}

const REQUIRED_DOCUMENTS = [
  { type: 'W9', label: 'W-9 Form', isRequired: true },
  {
    type: 'INSURANCE_CERTIFICATE',
    label: 'Insurance Certificate',
    isRequired: true,
  },
  { type: 'SAFETY_RECORD', label: 'Safety Record', isRequired: true },
];

const OPTIONAL_DOCUMENTS = [
  {
    type: 'COMMERCIAL_LICENSE',
    label: 'Commercial License',
    isRequired: false,
  },
  {
    type: 'VEHICLE_REGISTRATION',
    label: 'Vehicle Registration',
    isRequired: false,
  },
  { type: 'DRUG_SCREENING', label: 'Drug Screening', isRequired: false },
];

function getStatusColor(
  status: string
): 'destructive' | 'default' | 'outline' | 'secondary' {
  switch (status) {
    case 'VERIFIED':
      return 'default';
    case 'SUBMITTED':
      return 'secondary';
    case 'EXPIRED':
      return 'destructive';
    case 'NOT_SUBMITTED':
    default:
      return 'outline';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'VERIFIED':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'SUBMITTED':
      return <Clock className="h-4 w-4 text-blue-600" />;
    case 'EXPIRED':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'NOT_SUBMITTED':
    default:
      return <AlertCircle className="h-4 w-4 text-amber-600" />;
  }
}

function isExpiringSoon(expiryDate: string | undefined): boolean {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return expiry <= thirtyDaysFromNow && expiry > new Date();
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface ComplianceDashboardProps {
  carrierId?: string;
}

export function ComplianceDashboard(_props: ComplianceDashboardProps) {
  const {
    data: complianceDocs,
    isLoading,
    refetch,
    error: _error,
  } = useComplianceDocs();
  const [uploadingTypes, setUploadingTypes] = useState<Set<string>>(new Set());

  const handleUpload = (documentType: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploadingTypes((prev) => new Set(prev).add(documentType));
      try {
        await carrierClient.uploadComplianceDoc(file, documentType);
        toast.success(`${documentType} uploaded successfully`);
        refetch();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to upload document'
        );
      } finally {
        setUploadingTypes((prev) => {
          const next = new Set(prev);
          next.delete(documentType);
          return next;
        });
      }
    };
    input.click();
  };

  const handleDownload = async (docId: string, docType: string) => {
    try {
      const response = await carrierClient.downloadDocument(docId);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docType}-${Date.now()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (_error) {
      toast.error('Failed to download document');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance Documents</CardTitle>
          <CardDescription>
            Required and optional compliance documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create a map of documents keyed by type
  const docMap = new Map(
    (complianceDocs || []).map((doc) => [doc.documentType, doc])
  );

  const requiredDocs = REQUIRED_DOCUMENTS.map((doc) => ({
    ...doc,
    document: docMap.get(doc.type),
  }));

  const optionalDocs = OPTIONAL_DOCUMENTS.map((doc) => ({
    ...doc,
    document: docMap.get(doc.type),
  }));

  // Calculate compliance percentage
  const submittedRequired = requiredDocs.filter((d) => d.document).length;
  const compliancePercentage = Math.round(
    (submittedRequired / requiredDocs.length) * 100
  );

  const allDocuments = [...requiredDocs, ...optionalDocs];
  const hasAnyDocuments = allDocuments.some((d) => d.document);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Compliance Documents</CardTitle>
            <CardDescription>
              Required and optional compliance documentation
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {compliancePercentage}%
            </div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasAnyDocuments ? (
          <div className="rounded-lg border border-dashed border-gray-300 py-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              No documents uploaded yet. Start by uploading required documents.
            </p>
          </div>
        ) : (
          <>
            {/* Required Documents Section */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Required Documents
              </h3>
              <div className="space-y-3">
                {requiredDocs.map((doc) => {
                  const isUploading = uploadingTypes.has(doc.type);
                  const status = doc.document?.status || 'NOT_SUBMITTED';

                  return (
                    <div
                      key={doc.type}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex flex-1 items-center gap-4">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {doc.label}
                          </p>
                          {doc.document ? (
                            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                              {doc.document.uploadedAt && (
                                <span>
                                  Uploaded:{' '}
                                  {formatDate(doc.document.uploadedAt)}
                                </span>
                              )}
                              {doc.document.expiryDate && (
                                <span
                                  className={
                                    isExpiringSoon(doc.document.expiryDate)
                                      ? 'text-amber-600'
                                      : ''
                                  }
                                >
                                  Expires: {formatDate(doc.document.expiryDate)}
                                  {isExpiringSoon(doc.document.expiryDate) &&
                                    ' (Expiring soon!)'}
                                </span>
                              )}
                            </div>
                          ) : null}
                        </div>
                        <Badge variant={getStatusColor(status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(status)}
                            {status}
                          </span>
                        </Badge>
                      </div>
                      <div className="ml-2 flex gap-2">
                        {doc.document && status !== 'EXPIRED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleDownload(doc.document!.id, doc.type)
                            }
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {!doc.document || status === 'EXPIRED' ? (
                          <Button
                            size="sm"
                            disabled={isUploading}
                            onClick={() => handleUpload(doc.type)}
                          >
                            {isUploading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Upload className="mr-1 h-4 w-4" />
                                {!doc.document ? 'Upload' : 'Re-upload'}
                              </>
                            )}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional Documents Section */}
            {optionalDocs.some((d) => d.document) && (
              <div>
                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                  Optional Documents
                </h3>
                <div className="space-y-3">
                  {optionalDocs.map((doc) => {
                    if (!doc.document) return null;

                    const isUploading = uploadingTypes.has(doc.type);
                    const status = doc.document.status || 'NOT_SUBMITTED';
                    const expiringWarning = isExpiringSoon(
                      doc.document.expiryDate
                    );

                    return (
                      <div
                        key={doc.type}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                      >
                        <div className="flex flex-1 items-center gap-4">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {doc.label}
                            </p>
                            {doc.document && (
                              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                {doc.document.uploadedAt && (
                                  <span>
                                    Uploaded:{' '}
                                    {formatDate(doc.document.uploadedAt)}
                                  </span>
                                )}
                                {doc.document.expiryDate && (
                                  <span
                                    className={
                                      expiringWarning ? 'text-amber-600' : ''
                                    }
                                  >
                                    Expires:{' '}
                                    {formatDate(doc.document.expiryDate)}
                                    {expiringWarning && ' (Expiring soon!)'}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <Badge variant={getStatusColor(status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(status)}
                              {status}
                            </span>
                          </Badge>
                        </div>
                        <div className="ml-2 flex gap-2">
                          {doc.document && status !== 'EXPIRED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleDownload(doc.document!.id, doc.type)
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {status === 'EXPIRED' && (
                            <Button
                              size="sm"
                              disabled={isUploading}
                              onClick={() => handleUpload(doc.type)}
                            >
                              {isUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Upload className="mr-1 h-4 w-4" />
                                  Re-upload
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload New Optional Document Section */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Add Optional Documents
              </h3>
              <div className="flex flex-wrap gap-2">
                {optionalDocs
                  .filter((d) => !d.document)
                  .map((doc) => {
                    const isUploading = uploadingTypes.has(doc.type);
                    return (
                      <Button
                        key={doc.type}
                        size="sm"
                        variant="outline"
                        disabled={isUploading}
                        onClick={() => handleUpload(doc.type)}
                      >
                        {isUploading ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <Upload className="mr-1 h-3 w-3" />
                        )}
                        Upload {doc.label}
                      </Button>
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
