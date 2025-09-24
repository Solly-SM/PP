import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, User, Calendar, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { register } from '../services/auth';
import PulseLogo from '../components/PulseLogo';
import './Auth.css';

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    interestedIn: []
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedInterests, setSelectedInterests] = useState([]);
  
  const navigate = useNavigate();

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'other', label: 'Other' }
  ];

  const interestOptions = [
    'Travel', 'Music', 'Movies', 'Sports', 'Reading', 'Cooking',
    'Fitness', 'Art', 'Photography', 'Gaming', 'Dancing', 'Hiking'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleGenderChange = (gender) => {
    setFormData(prev => ({
      ...prev,
      gender,
      interestedIn: gender === 'male' ? ['female'] : ['male']
    }));
    
    if (errors.gender) {
      setErrors(prev => ({ ...prev, gender: '' }));
    }
  };

  const handleInterestToggle = (interest) => {
    const updatedInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];
    
    setSelectedInterests(updatedInterests);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const userData = {
        ...formData,
        interests: selectedInterests.map(interest => ({
          category: 'general',
          name: interest,
          level: 3
        }))
      };
      
      const { user } = await register(userData);
      setUser(user);
      toast.success(`Welcome to DatingPulse, ${user.firstName}! 💗`);
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="floating-hearts">
          <Heart className="floating-heart heart-1" />
          <Heart className="floating-heart heart-2" />
          <Heart className="floating-heart heart-3" />
        </div>
      </div>
      
      <div className="container-xs">
        <div className="auth-card card">
          <div className="auth-header">
            <div className="auth-logo">
              <PulseLogo animated size={32} className="heart-icon" />
              <h1>DatingPulse</h1>
            </div>
            <h2 className="auth-title">Join DatingPulse</h2>
            <p className="auth-subtitle">Create your profile and start finding meaningful connections</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName" className="label">
                  <User size={16} />
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`input ${errors.firstName ? 'input-error' : ''}`}
                  placeholder="First name"
                />
                {errors.firstName && <div className="error-text">{errors.firstName}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName" className="label">
                  <User size={16} />
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`input ${errors.lastName ? 'input-error' : ''}`}
                  placeholder="Last name"
                />
                {errors.lastName && <div className="error-text">{errors.lastName}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="label">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && <div className="error-text">{errors.email}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="label">
                <Lock size={16} />
                Password
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <div className="error-text">{errors.password}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="dateOfBirth" className="label">
                <Calendar size={16} />
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`input ${errors.dateOfBirth ? 'input-error' : ''}`}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
              />
              {errors.dateOfBirth && <div className="error-text">{errors.dateOfBirth}</div>}
              <div className="age-note">You must be at least 18 years old</div>
            </div>
            
            <div className="form-group">
              <label className="label">Gender</label>
              <div className="gender-options">
                {genderOptions.map(option => (
                  <div key={option.value} className="gender-option">
                    <input
                      type="radio"
                      id={option.value}
                      name="gender"
                      value={option.value}
                      checked={formData.gender === option.value}
                      onChange={() => handleGenderChange(option.value)}
                    />
                    <label htmlFor={option.value}>{option.label}</label>
                  </div>
                ))}
              </div>
              {errors.gender && <div className="error-text">{errors.gender}</div>}
            </div>
            
            <div className="form-group">
              <label className="label">Interests (Optional)</label>
              <div className="interests-selection">
                <div className="interests-grid">
                  {interestOptions.map(interest => (
                    <div
                      key={interest}
                      className={`interest-tag ${selectedInterests.includes(interest) ? 'selected' : ''}`}
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest}
                    </div>
                  ))}
                </div>
                <div className="interests-note">
                  Select interests that match your personality
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg auth-submit"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <Heart size={18} />}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
        
        <div className="auth-features">
          <div className="feature-item">
            <Heart className="feature-icon" size={20} />
            <span>Free to join and start matching</span>
          </div>
          <div className="feature-item">
            <Heart className="feature-icon" size={20} />
            <span>Your data is safe and secure</span>
          </div>
          <div className="feature-item">
            <Heart className="feature-icon" size={20} />
            <span>Find genuine connections</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;