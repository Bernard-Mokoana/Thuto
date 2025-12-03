import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  Settings, 
  Save,
  Edit,
  Camera
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await userAPI.updateUser(user!._id, formData);
      // Update the user context with new data
      const updatedUser = { ...user!, ...formData };
      // Note: In a real app, you'd update the context properly
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-lg text-white/70 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="glass rounded-lg p-6 animate-slide-up">
              <div className="text-center">
                <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/30">
                  <User className="h-12 w-12 text-accent" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-white/70 capitalize">{user?.role}</p>
                <div className="mt-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user?.isVerified
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}>
                    {user?.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="glass rounded-lg">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Personal Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-accent hover:text-accent/80 flex items-center transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-white/90 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input w-full px-3 py-2 disabled:bg-white/10 disabled:text-white/50"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-white/90 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input w-full px-3 py-2 disabled:bg-white/10 disabled:text-white/50"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input w-full px-3 py-2 disabled:bg-white/10 disabled:text-white/50"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Account Type
                    </label>
                    <div className="flex items-center p-3 bg-white/10 rounded-lg border border-white/20">
                      <Award className="h-5 w-5 text-accent mr-3" />
                      <span className="text-white capitalize">{user?.role}</span>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 text-white/90 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Account Settings */}
            <div className="glass rounded-lg mt-6">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Account Settings</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white">Change Password</h3>
                    <p className="text-sm text-white/70">Update your password to keep your account secure</p>
                  </div>
                  <button className="text-accent hover:text-accent/80 text-sm font-medium transition-colors">
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white">Email Notifications</h3>
                    <p className="text-sm text-white/70">Manage your email notification preferences</p>
                  </div>
                  <button className="text-accent hover:text-accent/80 text-sm font-medium transition-colors">
                    Manage
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white">Privacy Settings</h3>
                    <p className="text-sm text-white/70">Control your privacy and data sharing</p>
                  </div>
                  <button className="text-accent hover:text-accent/80 text-sm font-medium transition-colors">
                    Manage
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="glass rounded-lg mt-6 border border-red-500/30">
              <div className="px-6 py-4 border-b border-red-500/30">
                <h2 className="text-lg font-semibold text-red-300">Danger Zone</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-red-300">Delete Account</h3>
                    <p className="text-sm text-red-400">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors text-sm">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
