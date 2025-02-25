// common/LoadingState.jsx - Reusable loading component
import React from "react";

const LoadingState = () => {
  return (
    <div className="space-y-4">
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
};

export default LoadingState;