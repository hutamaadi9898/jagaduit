import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitive.Provider;
const ToastViewport = ToastPrimitive.Viewport;
const Toast = ToastPrimitive.Root;
const ToastTitle = ToastPrimitive.Title;
const ToastDescription = ToastPrimitive.Description;
const ToastClose = ToastPrimitive.Close;

function AppToast({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Root>) {
  return (
    <ToastPrimitive.Root
      className={cn(
        "grid gap-1 rounded-[1.2rem] border border-white/60 bg-white p-4 shadow-[0_20px_50px_rgba(65,43,28,0.16)]",
        className
      )}
      {...props}
    />
  );
}

export {
  ToastProvider,
  ToastViewport,
  Toast,
  AppToast,
  ToastTitle,
  ToastDescription,
  ToastClose
};
