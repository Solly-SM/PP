import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from '../services/auth';
import PulseLogo from '../components/PulseLogo';
import './Auth.css';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const { user } = await login(formData.email, formData.password);
      setUser(user);
      toast.success(`Welcome back, ${user.firstName}! 💖`);
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
            <h2 className="auth-title">Welcome Back!</h2>
            <p className="auth-subtitle">Sign in to continue your journey to finding love</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
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
                autoComplete="email"
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
            
            <div className="form-options">
              <Link to="/forgot-password" className="forgot-link">
                Forgot your password?
              </Link>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg auth-submit"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              {!loading && <Heart size={18} />}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
        
        <div className="auth-features">
          <div className="feature-item">
            <Heart className="feature-icon" size={20} />
            <span>Find meaningful connections</span>
          </div>
          <div className="feature-item">
            <Heart className="feature-icon" size={20} />
            <span>Advanced compatibility matching</span>
          </div>
          <div className="feature-item">
            <Heart className="feature-icon" size={20} />
            <span>Safe and secure platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;