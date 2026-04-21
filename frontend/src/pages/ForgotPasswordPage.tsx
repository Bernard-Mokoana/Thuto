import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthPageShell from '../components/auth/AuthPageShell';
import FormMessage from '../components/auth/FormMessage';
import SubmitButton from '../components/auth/SubmitButton';
import api from '../services/api';
import { getErrorMessage } from '../utils/errorMessage';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('Password reset link sent to your email.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'An error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Forgot Your Password?"
      subtitle="Enter your email address and we will send you a link to reset your password."
      footer={
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Back to login
        </Link>
      }
    >
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error ? <FormMessage variant="error" message={error} /> : null}
          {success ? <FormMessage variant="success" message={success} /> : null}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <SubmitButton loading={loading} label="Send Reset Link" />
          </div>
        </form>
    </AuthPageShell>
  );
};

export default ForgotPasswordPage;
