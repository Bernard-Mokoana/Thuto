import React, { useState } from 'react';
import type { PasswordInputProps } from '../../types/models';

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  value,
  placeholder,
  autoComplete,
  required = false,
  className,
  onChange,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        required={required}
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        <button
          type="button"
          className="text-gray-400 hover:text-gray-500"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .525-1.662 1.51-3.134 2.734-4.266M6.458 6.458A8.95 8.95 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-1.35 2.825M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
