import React from 'react';
import type { SubmitButtonProps } from '../../types/models';

const SubmitButton: React.FC<SubmitButtonProps> = ({ loading, label }) => {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : label}
    </button>
  );
};

export default SubmitButton;
