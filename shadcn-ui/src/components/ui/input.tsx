import * as React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm " +
          "focus:outline-none focus:ring-2 focus:ring-black/30 " +
          className
        }
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
