import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AuthPageShell from '../components/auth/AuthPageShell';
import FormMessage from '../components/auth/FormMessage';
import PasswordInput from '../components/auth/PasswordInput';
import SubmitButton from '../components/auth/SubmitButton';
import api from '../services/api';
import { getErrorMessage } from '../utils/errorMessage';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('No token provided. Please request a new password reset link.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post(`/auth/reset-password?token=${token}`, { password });
      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Password reset failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell title="Reset your password">
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error ? <FormMessage variant="error" message={error} /> : null}
          {success ? <FormMessage variant="success" message={success} /> : null}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                value={password}
                placeholder="New Password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm New Password
              </label>
              <PasswordInput
                id="confirm-password"
                name="confirm-password"
                value={confirmPassword}
                placeholder="Confirm New Password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <SubmitButton loading={loading} label="Reset Password" />
          </div>
        </form>
    </AuthPageShell>
  );
};

export default ResetPasswordPage;
