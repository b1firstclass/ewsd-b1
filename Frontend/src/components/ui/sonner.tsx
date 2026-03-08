import { Toaster as SonnerToaster, type ToasterProps, toast } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-xl group-[.toaster]:border-border/60 group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
