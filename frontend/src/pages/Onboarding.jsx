import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/api';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    bio: '',
    location: '',
    interests: [],
    occupation: '',
    lookingFor: '',
    avatar: null,
  });
  const [newInterest, setNewInterest] = useState('');

  const interestsList = [
    'Travel', 'Music', 'Movies', 'Reading', 'Cooking', 'Sports',
    'Gaming', 'Fitness', 'Art', 'Photography', 'Dancing', 'Yoga'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleAvatarChange = (e) => {
    setFormData({ ...formData, avatar: e.target.files[0] });
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAddCustomInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleSubmit = async (skip = false) => {
    setIsLoading(true);
    setError('');

    // Validate if not skipping
    if (!skip) {
      if (!formData.fullName?.trim()) {
        setError('Full name is required');
        setIsLoading(false);
        return;
      }
      if (!formData.age || parseInt(formData.age) < 18) {
        setError('You must be at least 18 years old');
        setIsLoading(false);
        return;
      }
      if (!formData.gender) {
        setError('Please select your gender');
        setIsLoading(false);
        return;
      }
    }

    try {
      // Prepare data for API
      const updateData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
      };

      // Remove avatar from data if not selected
      if (!updateData.avatar) {
        delete updateData.avatar;
      }

      const result = await userService.updateProfile(updateData);

      if (result.success) {
        // Update local user data
        if (result.user) {
          setUser(result.user);
        }
        // Navigate to discover page
        navigate('/discover');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
              <p className="text-gray-500 text-sm mt-1">Let's start with the basics</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Your age"
                  min={18}
                  max={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Looking For
              </label>
              <select
                name="lookingFor"
                value={formData.lookingFor}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select what you're looking for</option>
                <option value="relationship">Long-term relationship</option>
                <option value="friendship">Friendship</option>
                <option value="casual">Casual dating</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Your Photos</h3>
              <p className="text-gray-500 text-sm mt-1">Add a profile photo</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Photo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  name="avatar"
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  {formData.avatar ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={URL.createObjectURL(formData.avatar)}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover mb-2"
                      />
                      <span className="text-sm text-primary-500">Click to change</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">Click to upload photo</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="input-field min-h-[100px]"
                placeholder="Tell something about yourself..."
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{formData.bio.length}/500</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Your Interests</h3>
              <p className="text-gray-500 text-sm mt-1">Select what you enjoy</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interests
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {interestsList.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.interests.includes(interest)
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              
              {/* Custom interest input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomInterest())}
                  className="input-field flex-1"
                  placeholder="Add custom interest..."
                />
                <button
                  type="button"
                  onClick={handleAddCustomInterest}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
              
              {/* Selected interests */}
              {formData.interests.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Selected: {formData.interests.length}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-field"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occupation
              </label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="input-field"
                placeholder="What do you do?"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Step {currentStep} of 3</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(step => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full transition-colors ${
                step <= currentStep ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Form Card */}
        <div className="card p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50"
              >
                Back
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex-1 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600"
              >
                Continue
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Complete'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Skip to Discover */}
        <p className="text-center mt-6">
          <button
            type="button"
            onClick={() => navigate('/discover')}
            className="text-gray-500 text-sm hover:text-gray-700"
          >
            Skip for now →
          </button>
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
