import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="bottom-right" // Improved default position
      richColors // Enable richer color palette
      duration={3000} // 3 second default duration
      gap={12} // Space between multiple toasts
      toastOptions={{
        classNames: {
          toast: `
            group toast 
            group-[.toaster]:bg-[#249885] 
            group-[.toaster]:text-white
            group-[.toaster]:border-none
            group-[.toaster]:shadow-[0_4px_14px_rgba(36,152,133,0.25)]
            group-[.toaster]:rounded-xl
            group-[.toaster]:p-4
            group-[.toaster]:transition-all
            group-[.toaster]:hover:shadow-[0_6px_20px_rgba(36,152,133,0.35)]
            group-[.toaster]:animate-slideIn
          `,
          description: `
            group-[.toast]:text-gray-100 
            group-[.toast]:text-sm
            group-[.toast]:mt-1
          `,
          actionButton: `
            group-[.toast]:bg-white 
            group-[.toast]:text-[#249885]
            group-[.toast]:font-medium
            group-[.toast]:px-3
            group-[.toast]:py-1
            group-[.toast]:rounded-lg
            group-[.toast]:transition-colors
            group-[.toast]:hover:bg-gray-100
          `,
          cancelButton: `
            group-[.toast]:bg-white/20 
            group-[.toast]:text-white
            group-[.toast]:px-3
            group-[.toast]:py-1
            group-[.toast]:rounded-lg
            group-[.toast]:hover:bg-white/30
          `,
          title: `
            group-[.toast]:font-semibold
            group-[.toast]:text-base
          `,
          error: `
            group-[.toaster]:bg-red-600
            group-[.toaster]:shadow-[0_4px_14px_rgba(220,38,38,0.25)]
          `,
          success: `
            group-[.toaster]:bg-[#249885]
            group-[.toaster]:shadow-[0_4px_14px_rgba(36,152,133,0.25)]
          `,
          warning: `
            group-[.toaster]:bg-amber-500
            group-[.toaster]:shadow-[0_4px_14px_rgba(245,158,11,0.25)]
          `,
          info: `
            group-[.toaster]:bg-blue-500
            group-[.toaster]:shadow-[0_4px_14px_rgba(59,130,246,0.25)]
          `,
        },
        style: {
          // Custom CSS properties
          backdropFilter: "blur(4px)",
          minWidth: "260px",
          maxWidth: "400px",
        },
      }}
      {...props}
    />
  );
};

// Add custom animation keyframes (you'd need to add this to your global CSS)
const styles = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export { Toaster };