import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const RegisterForm = () => {
  const { register, verifyOTP, generateTestOTP } = useAuth();
  const [step, setStep] = useState('register'); // 'register' or 'verify'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Registration form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  // OTP verification data
  const [otpData, setOtpData] = useState({
    userId: '',
    otp: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await register(formData);
      console.log('Registration result:', result);
      
      if (result.success) {
        setOtpData({ ...otpData, userId: result.data.userId });
        setMessage(result.message);
        setStep('verify');
        
        // Show debug OTP in development
        if (result.debug?.otp) {
          setMessage(`${result.message}\n\nDEV MODE - OTP: ${result.debug.otp}`);
        }
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      console.log('Submitting OTP verification:', otpData);
      const result = await verifyOTP(otpData.userId, otpData.otp);
      console.log('OTP verification result:', result);
      
      if (result.success) {
        setMessage('Account verified successfully! You are now logged in.');
        // Redirect to dashboard or home page
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTestOTP = async () => {
    if (!otpData.userId) {
      setError('No user ID available');
      return;
    }

    setLoading(true);
    try {
      const result = await generateTestOTP(otpData.userId);
      if (result.success) {
        setMessage(`Test OTP generated: ${result.data.otp}`);
        setOtpData({ ...otpData, otp: result.data.otp });
      }
    } catch (err) {
      setError(err.message || 'Failed to generate test OTP');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Verify OTP</h2>
        
        {message && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded whitespace-pre-line">
            {message}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <input
              type="text"
              value={otpData.userId}
              onChange={(e) => setOtpData({ ...otpData, userId: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Enter OTP
            </label>
            <input
              type="text"
              value={otpData.otp}
              onChange={(e) => setOtpData({ ...otpData, otp: e.target.value })}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleGenerateTestOTP}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Generate Test OTP (Dev Only)
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setStep('register')}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Back to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      
      {message && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            minLength="6"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
