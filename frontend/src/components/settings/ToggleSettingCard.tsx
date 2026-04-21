import React from 'react';
import type { ToggleSettingCardProps } from '../../types/models';

const ToggleSettingCard: React.FC<ToggleSettingCardProps> = ({
  label,
  description,
  enabled,
  onToggle,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          enabled
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {enabled ? 'Enabled' : 'Disabled'}
      </button>
    </div>
  );
};

export default ToggleSettingCard;
