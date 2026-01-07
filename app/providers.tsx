"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        closeButton
        toastOptions={{
          className: "text-sm rounded-sm border border-border bg-card text-foreground shadow-lg",
          style: {
            background: "hsl(var(--card))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        }}
        classNames={{
          toast: "bg-card text-foreground border-border",
          title: "text-foreground font-medium",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground hover:opacity-90",
          cancelButton: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          closeButton: "text-muted-foreground hover:text-foreground",
          success: "bg-card text-foreground border-border",
          error: "bg-card text-foreground border-border",
          info: "bg-card text-foreground border-border",
          warning: "bg-card text-foreground border-border",
        }}
      />
    </SessionProvider>
  );
}