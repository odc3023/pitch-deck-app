import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Edit, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data.data);
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const getAccountCreatedDate = () => {
    const createdAt = profile?.createdAt || profile?.created || user?.createdAt || user?.metadata?.creationTime;
    
    if (createdAt) {
      const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    return 'Date not available';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">View and manage your account information</p>
        </div>

        {/* Profile */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <User size={32} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user?.email}</h2>
                <p className="text-gray-500">Member since {getAccountCreatedDate()}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/profile/edit')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Edit size={16} />
              Edit Profile
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
              <Mail size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium">{profile?.email || user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
              <Calendar size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Account Created</p>
                <p className="font-medium">{getAccountCreatedDate()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;