'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogFooter
} from '@/components/ui/alert-dialog';

const ConfirmDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "확인",
  description = "저장하시겠습니까?",
  confirmText = "확인",
  cancelText = "취소",
  isLoading = false
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(isLoading);
  
  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Confirmation action failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isSubmitting}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              await handleConfirm();
              onOpenChange(false);
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "처리 중..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { ConfirmDialog }