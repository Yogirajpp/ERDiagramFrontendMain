// Example usage in a Toaster component
// src/components/ui/toaster.jsx
"use client";

import { useToast } from "@/components/ui/toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

// Example usage in a page or component
// src/app/page.jsx
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";

export default function ToastDemo() {
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  return (
    <div className="flex flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">Toast Demo</h1>
      
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={() => 
            showSuccess("Success!", "Your action was completed successfully.")
          }
        >
          Show Success Toast
        </Button>
        
        <Button 
          onClick={() => 
            showError("Error!", "There was a problem with your request.")
          }
          variant="destructive"
        >
          Show Error Toast
        </Button>
        
        <Button 
          onClick={() => 
            showInfo("Information", "This is some helpful information.")
          }
          variant="outline"
        >
          Show Info Toast
        </Button>
        
        <Button 
          onClick={() => 
            showWarning("Warning", "Please review this important notice.")
          }
          variant="secondary"
        >
          Show Warning Toast
        </Button>
      </div>
    </div>
  );
}

// Don't forget to add the Toaster component to your layout
// src/app/layout.jsx
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}