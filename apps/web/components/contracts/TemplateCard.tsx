'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Copy, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { ContractTemplate, ContractType } from '@/lib/api/contracts/types';
import { contractTemplatesApi } from '@/lib/api/contracts/client';
import { toast } from 'sonner';

interface TemplateCardProps {
  template: ContractTemplate;
  onEdit?: (template: ContractTemplate) => void;
  onDelete?: (id: string) => void;
  onClone?: () => void;
}

/**
 * Template Card Component
 * Displays template with actions: Edit, Clone, Delete
 */
export function TemplateCard({
  template,
  onEdit,
  onDelete,
  onClone,
}: TemplateCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  const getTypeBadgeColor = (type: ContractType): string => {
    switch (type) {
      case ContractType.CARRIER:
        return 'bg-blue-100 text-blue-800';
      case ContractType.CUSTOMER:
        return 'bg-green-100 text-green-800';
      case ContractType.VENDOR:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Call delete API here if available
      // For now, just notify parent
      onDelete?.(template.id);
      toast.success('Template deleted successfully');
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete template');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClone = async () => {
    setIsCloning(true);
    try {
      // Clone template and create new contract
      await contractTemplatesApi.clone(template.id);
      toast.success('Contract created from template');
      onClone?.();
      // Optionally redirect to new contract edit page
      // router.push(`/contracts/${newContract.id}/edit`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to clone template');
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">{template.name}</CardTitle>
              <p className="mt-1 text-sm text-text-muted">
                {template.description || 'No description'}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(template)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleClone} disabled={isCloning}>
                  <Copy className="h-4 w-4 mr-2" />
                  {isCloning ? 'Cloning...' : 'Clone to Contract'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between">
            <Badge className={getTypeBadgeColor(template.type as ContractType)}>
              {template.type}
            </Badge>
            <p className="text-xs text-text-muted">
              Updated{' '}
              {new Date(template.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Template</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the "{template.name}" template? This
            action cannot be undone.
          </AlertDialogDescription>
          <div className="flex items-center justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
