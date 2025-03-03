import React from "react";

const ErrorState = ({ error, retry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p className="text-red-500">{error}</p>
      {retry && (
        <button 
          onClick={retry} 
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;