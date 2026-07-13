"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`shimmer-button relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 text-white shadow-lg transition-all hover:shadow-xl ${className}`}
        {...props}
      >
        <span className="shimmer-button-border" />
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";

export default ShimmerButton;
