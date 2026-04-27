import React from 'react';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Using the platform',
    body:
      'Thuto provides access to courses, lessons, and learning features for students, tutors, and administrators. You agree to use the platform lawfully and keep your account details accurate.',
  },
  {
    title: 'Accounts and responsibilities',
    body:
      'You are responsible for activity that occurs under your account. Keep your login credentials secure and notify the platform if you believe your account has been accessed without permission.',
  },
  {
    title: 'Content and conduct',
    body:
      'Course materials, discussions, and uploads must not violate the rights of others or include harmful, abusive, or misleading content. The platform may remove content that breaks these rules.',
  },
  {
    title: 'Availability',
    body:
      'We work to keep the service available and reliable, but features may change, pause, or be removed as the platform evolves. Continued use of the platform means you accept those updates.',
  },
];

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Thuto
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            These terms explain the basic rules for using the platform. Please read them
            before creating or continuing to use an account.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="rounded-xl border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Back to registration
          </Link>
          <Link to="/login" className="font-medium text-gray-600 hover:text-gray-900">
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
