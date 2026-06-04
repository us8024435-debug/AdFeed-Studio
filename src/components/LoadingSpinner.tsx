/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className={`flex items-center justify-center ${className}`} id="loading-spinner-container">
      <div
        className={`${sizeClasses[size]} border-t-[#FF4D00] border-gray-700 rounded-full animate-spin`}
        id="loading-spinner-orb"
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
