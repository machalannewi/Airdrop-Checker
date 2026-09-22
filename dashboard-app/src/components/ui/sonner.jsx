import { Toaster as Sonner } from "sonner";

// shadcn/ui's sonner wrapper, adapted to this app's fixed dark theme instead
// of shadcn's CSS-variable design tokens (this app doesn't use those).
const Toaster = (props) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-ink-900 text-white border border-ink-700 shadow-lg rounded-xl",
          description: "text-muted",
          actionButton: "bg-brand text-white",
          cancelButton: "bg-ink-800 text-muted",
          success: "!border-emerald-500/30",
          error: "!border-red-500/30",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
