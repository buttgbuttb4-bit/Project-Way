import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const validateEmail = (value) => {
    if (!value) {
      return "Email is required";
    }

    // Check for multiple @ symbols
    const atCount = (value.match(/@/g) || []).length;
    if (atCount !== 1) {
      return "Email must contain exactly one '@' symbol";
    }

    // Check if @ is at the beginning or end
    if (value.startsWith('@') || value.endsWith('@')) {
      return "'@' symbol cannot be at the beginning or end";
    }

    // Split email into local part and domain
    const [localPart, domain] = value.split('@');

    // Validate local part (before @)
    if (!localPart) {
      return "Missing name before '@' symbol";
    }

    // Local part should only contain alphanumeric characters, dots, hyphens, and underscores
    if (!/^[a-zA-Z0-9._-]+$/.test(localPart)) {
      return "Name can only contain letters, numbers, dots, hyphens, and underscores";
    }

    // Local part should not start or end with dot, hyphen, or underscore
    if (/^[._-]|[._-]$/.test(localPart)) {
      return "Name cannot start or end with dot, hyphen, or underscore";
    }

    // Local part should not have consecutive dots
    if (/\.\./.test(localPart)) {
      return "Name cannot have consecutive dots";
    }

    // Local part length check
    if (localPart.length < 2) {
      return "Name must be at least 2 characters before '@'";
    }

    if (localPart.length > 64) {
      return "Name is too long (max 64 characters)";
    }

    // Validate domain part (after @)
    if (!domain) {
      return "Missing domain after '@' symbol";
    }

    // Check if domain contains exactly one dot
    const domainDotCount = (domain.match(/\./g) || []).length;
    if (domainDotCount !== 1) {
      return "Domain must contain exactly one '.' (e.g., gmail.com)";
    }

    // Split domain into domain name and TLD
    const [domainName, tld] = domain.split('.');

    // Validate domain name
    if (!domainName) {
      return "Missing domain name before '.'";
    }

    // Domain name should only contain alphanumeric characters and hyphens
    if (!/^[a-zA-Z0-9-]+$/.test(domainName)) {
      return "Domain name can only contain letters, numbers, and hyphens";
    }

    // Domain name should not start or end with hyphen
    if (/^-|-$/.test(domainName)) {
      return "Domain name cannot start or end with hyphen";
    }

    // Domain name length check
    if (domainName.length < 3) {
      return "Domain name must be at least 3 characters (e.g., gmail)";
    }

    if (domainName.length > 63) {
      return "Domain name is too long (max 63 characters)";
    }

    // Validate TLD
    if (!tld) {
      return "Missing top-level domain after '.' (e.g., .com)";
    }

    // TLD should only contain letters
    if (!/^[a-zA-Z]+$/.test(tld)) {
      return "Top-level domain can only contain letters";
    }

    // TLD length check
    if (tld.length < 2) {
      return "Top-level domain must be at least 2 characters (e.g., .com)";
    }

    if (tld.length > 63) {
      return "Top-level domain is too long (max 63 characters)";
    }

    // Valid TLDs list - only .com allowed
    const validTLDs = ['com'];

    if (!validTLDs.includes(tld.toLowerCase())) {
      return "Invalid top-level domain. Only .com domain is allowed";
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setMessageType('error');
      setMessage('Please enter your email');
      return;
    }

    // Validate email format
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setMessageType('error');
      setMessage(emailError);
      return;
    }

    if (!formData.password.trim()) {
      setMessageType('error');
      setMessage('Please enter your password');
      return;
    }
    if (!formData.role) {
      setMessageType('error');
      setMessage('Please select a role');
      return;
    }

    const response = await onLogin({
      role: formData.role,
      email: formData.email,
      password: formData.password,
    });

    if (!response.success) {
      setMessageType('error');
      setMessage(response.message);
      return;
    }

    setMessageType('success');
    setMessage('Login successful. Redirecting...');
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-brand">
          <div className="brand-content">
            <h1 className="brand-title">Project Way</h1>
            <p className="brand-subtitle">Collaborative Education Platform</p>
            <div className="brand-features">
              <div className="feature-item">
                <span className="feature-icon">📚</span>
                <span>Learn Together</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <span>Share Ideas</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🚀</span>
                <span>Grow Fast</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-wrapper">
          <div className="login-form-content">
            <h2 className="form-title">Welcome Back</h2>
            <p className="form-subtitle">Sign in to your account</p>

            <form className="login-form" onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <span className="label-icon">👤</span>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <span className="label-icon">📧</span>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <span className="label-icon">🔐</span>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Role Selection */}
              <div className="form-group">
                <label htmlFor="role" className="form-label">
                  <span className="label-icon">🎯</span>
                  Select Your Role
                </label>
                <select
                  id="role"
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Message Display */}
              {message && (
                <div className={`message ${messageType}`}>
                  <span className="message-icon">
                    {messageType === 'success' ? '✓' : '⚠'}
                  </span>
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <button type="submit" className="login-button">
                <span className="button-icon">→</span>
                Sign In
              </button>
            </form>

            <p className="form-footer">
              Protected by enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;