import React from 'react';
import { Link } from 'react-router-dom';
import type { SettingsPageHeaderProps } from '../../types/models';

const SettingsPageHeader: React.FC<SettingsPageHeaderProps> = ({ title, description }) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-lg text-gray-600 mt-2">{description}</p>
      </div>
      <Link to="/profile" className="text-sm font-medium text-blue-500 hover:text-blue-600">
        Back to Profile
      </Link>
    </div>
  );
};

export default SettingsPageHeader;
