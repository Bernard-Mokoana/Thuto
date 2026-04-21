import React from 'react';
import type { AuthPageShellProps } from '../../types/models';

const AuthPageShell: React.FC<AuthPageShellProps> = ({
  title,
  subtitle,
  footer,
  children,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
          {subtitle ? <div className="mt-2 text-sm text-gray-600">{subtitle}</div> : null}
        </div>
        {children}
        {footer ? <div className="text-sm text-center">{footer}</div> : null}
      </div>
    </div>
  );
};

export default AuthPageShell;
