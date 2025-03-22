// src/hooks/useToast.jsx
import { useToast as useToastOriginal } from "@/components/ui/toast";

export const useToast = () => {
  const { toast } = useToastOriginal();

  const showSuccess = (title, description) => {
    toast({
      title,
      description,
      variant: "success",
      duration: 3000,
    });
  };

  const showError = (title, description) => {
    toast({
      title,
      description,
      variant: "destructive",
      duration: 5000,
    });
  };

  const showInfo = (title, description) => {
    toast({
      title,
      description,
      duration: 3000,
    });
  };

  const showWarning = (title, description) => {
    toast({
      title,
      description,
      variant: "warning",
      duration: 4000,
    });
  };

  return {
    toast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};