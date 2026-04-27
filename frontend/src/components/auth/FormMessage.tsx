import React from 'react';
import type { FormMessageProps } from '../../types/models';

const styles = {
  error: 'bg-red-100 border border-red-400 text-red-700',
  success: 'bg-green-100 border border-green-400 text-green-700',
};

const FormMessage: React.FC<FormMessageProps> = ({ variant, message }) => {
  return <div className={`${styles[variant]} px-4 py-3 rounded relative`}>{message}</div>;
};

export default FormMessage;
