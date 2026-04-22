import React from 'react';
import type { StatCardProps } from '../../types/models';

const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default StatCard;
