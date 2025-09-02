// pages/Login.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTypingPassword, setIsTypingPassword] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [pandaEmotion, setPandaEmotion] = useState('normal');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const { email, password } = formData;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Track mouse movement for eye following
    const handleMouseMove = (e) => {
      const pandaRect = document.querySelector('.login-panda-svg')?.getBoundingClientRect();
      if (pandaRect) {
        const pandaCenterX = pandaRect.left + pandaRect.width / 2;
        const pandaCenterY = pandaRect.top + pandaRect.height / 2;
        
        const deltaX = e.clientX - pandaCenterX;
        const deltaY = e.clientY - pandaCenterY;
        
        // Limit eye movement
        const maxMove = 3;
        const eyeX = Math.max(-maxMove, Math.min(maxMove, deltaX / 50));
        const eyeY = Math.max(-maxMove, Math.min(maxMove, deltaY / 50));
        
        setEyePosition({ x: eyeX, y: eyeY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Change panda emotion based on form state
    if (email && password && !loading) {
      setPandaEmotion('excited');
    } else if (password.length > 0 && !showPassword) {
      setPandaEmotion('closed');
    } else if (showPassword && password.length > 0) {
      setPandaEmotion('surprised');
    } else if (email.length > 0) {
      setPandaEmotion('thinking');
    } else {
      setPandaEmotion('normal');
    }
  }, [email, password, showPassword, loading]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    if (e.target.name === 'password') {
      setIsTypingPassword(e.target.value.length > 0);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      setPandaEmotion('worried');
      return;
    }

    setLoading(true);
    setPandaEmotion('loading');
    
    try {
      const response = await login(formData);
      
      if (response.success) {
        setPandaEmotion('success');
        toast.success('Welcome back! Login successful!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error) {
      setPandaEmotion('error');
      if (error.requiresVerification) {
        toast.error('Account not verified. Please complete OTP verification first.');
        navigate('/register');
      } else {
        toast.error(error.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setTimeout(() => {
        setLoading(false);
        if (pandaEmotion === 'error') {
          setPandaEmotion('normal');
        }
      }, 2000);
    }
  };

  const getPandaMessage = () => {
    switch (pandaEmotion) {
      case 'closed':
        return "Your password is safe with me! 🔐";
      case 'surprised':
        return "I can see your password now! 👀";
      case 'thinking':
        return "Great! Now enter your password 🤔";
      case 'excited':
        return "Ready to log in! Let's go! 🚀";
      case 'loading':
        return "Checking your credentials... ⏳";
      case 'success':
        return "Welcome back! Success! 🎉";
      case 'error':
        return "Oops! Something went wrong 😅";
      case 'worried':
        return "Please fill in all fields! 😟";
      default:
        return "Welcome back to XeriwoTools! 👋";
    }
  };

  return (
    <div className="login-page">
      {/* Animated Background */}
      <div className="login-bg">
        <div className="floating-shapes">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="floating-shape"
              style={{
                '--delay': `${i * 0.5}s`,
                '--duration': `${8 + (i % 4) * 2}s`,
                '--size': `${15 + (i % 3) * 8}px`
              }}
            />
          ))}
        </div>
      </div>

      <Container fluid className="login-container">
        <Row className="login-row">
          {/* Left Side - Branding */}
          <Col lg={6} className="d-none d-lg-flex brand-side">
            <div className={`login-branding ${isVisible ? 'animate-in' : ''}`}>
              <div className="brand-logo">
                <div className="logo-icon">
                  <i className="fab fa-wordpress-simple"></i>
                </div>
                <h1 className="brand-name">XeriwoTools</h1>
              </div>
              
              <div className="brand-tagline">
                <h2>Welcome Back!</h2>
                <p>Continue your WordPress journey with premium themes and plugins</p>
              </div>

              <div className="brand-features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="fas fa-rocket"></i>
                  </div>
                  <div className="feature-text">
                    <h4>Lightning Fast</h4>
                    <p>Instant access to premium assets</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div className="feature-text">
                    <h4>Secure Platform</h4>
                    <p>Enterprise-grade security</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="fas fa-crown"></i>
                  </div>
                  <div className="feature-text">
                    <h4>Premium Quality</h4>
                    <p>Hand-curated WordPress assets</p>
                  </div>
                </div>
              </div>

              <div className="brand-stats">
                <div className="stat-item">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Premium Assets</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">25K+</span>
                  <span className="stat-label">Downloads</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">4.9★</span>
                  <span className="stat-label">Rating</span>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side - Login Form */}
          <Col lg={6} className="form-side">
            <div className={`login-form-container ${isVisible ? 'animate-in-right' : ''}`}>
              <div className="form-content">
                {/* Panda Mascot */}
                <div className="panda-container">
                  <div className="panda-wrapper">
                    <svg
                      className="login-panda-svg"
                      xmlns="http://www.w3.org/2000/svg"
                      width="90"
                      height="90"
                      viewBox="0 0 200 200"
                    >
                      {/* Panda head */}
                      <circle cx="100" cy="100" r="75" fill="#ffffff" stroke="#000000" strokeWidth="4" />
                      
                      {/* Ears */}
                      <circle cx="60" cy="55" r="18" fill="#000000" />
                      <circle cx="140" cy="55" r="18" fill="#000000" />
                      <circle cx="62" cy="57" r="8" fill="#ffffff" />
                      <circle cx="138" cy="57" r="8" fill="#ffffff" />
                      
                      {/* Eye patches */}
                      <ellipse cx="80" cy="85" rx="14" ry="20" fill="#000000" />
                      <ellipse cx="120" cy="85" rx="14" ry="20" fill="#000000" />
                      
                      {/* Eyes - responsive to emotion */}
                      {pandaEmotion === 'closed' ? (
                        <>
                          <path d="M70 85 Q80 80 90 85" stroke="#000000" strokeWidth="2" fill="none" />
                          <path d="M110 85 Q120 80 130 85" stroke="#000000" strokeWidth="2" fill="none" />
                        </>
                      ) : pandaEmotion === 'loading' ? (
                        <>
                          <circle cx="80" cy="85" r="7" fill="#ffffff" />
                          <circle cx="120" cy="85" r="7" fill="#ffffff" />
                          <circle cx={80} cy={85} r="3" fill="#000000">
                            <animateTransform 
                              attributeName="transform" 
                              type="rotate" 
                              values="0 80 85;360 80 85" 
                              dur="1s" 
                              repeatCount="indefinite"
                            />
                          </circle>
                          <circle cx={120} cy={85} r="3" fill="#000000">
                            <animateTransform 
                              attributeName="transform" 
                              type="rotate" 
                              values="0 120 85;360 120 85" 
                              dur="1s" 
                              repeatCount="indefinite"
                            />
                          </circle>
                        </>
                      ) : (
                        <>
                          <circle cx="80" cy="85" r="7" fill="#ffffff" />
                          <circle cx="120" cy="85" r="7" fill="#ffffff" />
                          
                          {/* Moving pupils */}
                          <circle 
                            cx={80 + eyePosition.x} 
                            cy={85 + eyePosition.y} 
                            r={pandaEmotion === 'surprised' ? "4" : pandaEmotion === 'excited' ? "3.5" : "3"} 
                            fill="#000000"
                            style={{ transition: 'all 0.1s ease' }}
                          />
                          <circle 
                            cx={120 + eyePosition.x} 
                            cy={85 + eyePosition.y} 
                            r={pandaEmotion === 'surprised' ? "4" : pandaEmotion === 'excited' ? "3.5" : "3"} 
                            fill="#000000"
                            style={{ transition: 'all 0.1s ease' }}
                          />
                          
                          {/* Eye shine */}
                          <circle cx={80 + eyePosition.x + 1} cy={85 + eyePosition.y - 1} r="1" fill="#ffffff" />
                          <circle cx={120 + eyePosition.x + 1} cy={85 + eyePosition.y - 1} r="1" fill="#ffffff" />
                          
                          {/* Stars for excited/success */}
                          {(pandaEmotion === 'excited' || pandaEmotion === 'success') && (
                            <>
                              <text x="65" y="75" fontSize="10" fill="#ffd700">✨</text>
                              <text x="125" y="75" fontSize="10" fill="#ffd700">✨</text>
                            </>
                          )}
                        </>
                      )}
                      
                      {/* Nose */}
                      <ellipse cx="100" cy="105" rx="3" ry="2" fill="#000000" />
                      
                      {/* Mouth - changes with emotion */}
                      {pandaEmotion === 'worried' || pandaEmotion === 'error' ? (
                        <path d="M90 120 Q100 115 110 120" stroke="#000000" strokeWidth="2" fill="none" />
                      ) : pandaEmotion === 'excited' || pandaEmotion === 'success' ? (
                        <path d="M85 120 Q100 132 115 120" stroke="#000000" strokeWidth="2" fill="none" />
                      ) : pandaEmotion === 'surprised' ? (
                        <ellipse cx="100" cy="120" rx="4" ry="6" fill="#000000" />
                      ) : pandaEmotion === 'thinking' ? (
                        <path d="M95 120 Q100 125 105 120" stroke="#000000" strokeWidth="2" fill="none" />
                      ) : (
                        <path d="M92 120 Q100 125 108 120" stroke="#000000" strokeWidth="2" fill="none" />
                      )}
                      
                      {/* Blush for excited/success */}
                      {(pandaEmotion === 'excited' || pandaEmotion === 'success') && (
                        <>
                          <circle cx="55" cy="95" r="5" fill="#ff69b4" opacity="0.4" />
                          <circle cx="145" cy="95" r="5" fill="#ff69b4" opacity="0.4" />
                        </>
                      )}
                    </svg>
                    
                    {/* Speech bubble */}
                    <div className="speech-bubble">
                      <div className="bubble-content">
                        {getPandaMessage()}
                      </div>
                      <div className="bubble-arrow"></div>
                    </div>
                  </div>
                </div>

                <div className="login-header">
                  <h2 className="login-title">Sign In</h2>
                  <p className="login-subtitle">Access your XeriwoTools account</p>
                </div>

                <Card className="login-card">
                  <Card.Body>
                    <Form onSubmit={onSubmit} className="login-form">
                      {/* Email Field */}
                      <Form.Group className="form-group-custom">
                        <div className="input-wrapper">
                          <div className="input-icon">
                            <i className="fas fa-envelope"></i>
                          </div>
                          <Form.Control
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                            placeholder="Email Address"
                            disabled={loading}
                            className="form-input-custom"
                          />
                          <div className="input-border"></div>
                        </div>
                      </Form.Group>

                      {/* Password Field */}
                      <Form.Group className="form-group-custom">
                        <div className="input-wrapper">
                          <div className="input-icon">
                            <i className="fas fa-lock"></i>
                          </div>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                            placeholder="Password"
                            disabled={loading}
                            className="form-input-custom"
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                          <div className="input-border"></div>
                        </div>
                      </Form.Group>

                      {/* Remember & Forgot */}
                      <div className="form-options">
                        <Form.Check
                          type="checkbox"
                          id="remember-me"
                          label="Remember me"
                          className="remember-checkbox"
                        />
                        <Link to="/forgot-password" className="forgot-link">
                          <i className="fas fa-key"></i>
                          Forgot password?
                        </Link>
                      </div>

                      {/* Submit Button */}
                      <Button 
                        type="submit" 
                        className="login-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="loading-spinner"></div>
                            <span>Signing In...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-sign-in-alt"></i>
                            <span>Sign In</span>
                            <i className="fas fa-arrow-right"></i>
                          </>
                        )}
                        <div className="btn-ripple"></div>
                      </Button>

                      {/* Social Login */}
                  <Card.Footer className="login-footer">
                    <p>
                      <i className="fas fa-user-plus"></i>
                      Don't have an account? 
                      <Link to="/register" className="register-link">
                        Create one here
                      </Link>
                    </p>
                  </Card.Footer>
                     
                    </Form>
                  </Card.Body>
                </Card>


                {/* Trust Indicators */}
                <div className="trust-indicators">
                  <div className="trust-item">
                    <i className="fas fa-shield-check"></i>
                    <span>SSL Secured</span>
                  </div>
                  <div className="trust-item">
                    <i className="fas fa-user-shield"></i>
                    <span>Privacy Protected</span>
                  </div>
                  <div className="trust-item">
                    <i className="fas fa-clock"></i>
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          max-height: 100vh;
          background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
          position: relative;
          overflow: hidden;
        }

        /* Animated Background */
        .login-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
        }

        .floating-shapes {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .floating-shape {
          position: absolute;
          background: linear-gradient(135deg, #000000, #434343);
          border-radius: 50%;
          width: var(--size);
          height: var(--size);
          opacity: 0.03;
          animation: floatShape var(--duration) ease-in-out infinite var(--delay);
        }

        @keyframes floatShape {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-80px) rotate(90deg); }
          50% { transform: translateY(-160px) rotate(180deg); }
          75% { transform: translateY(-80px) rotate(270deg); }
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .animate-in { animation: slideInLeft 0.8s ease-out forwards; }
        .animate-in-right { animation: slideInRight 0.8s ease-out forwards; }

        /* Container */
        .login-container {
          padding: 0;
          height: 100vh;
        }

        .login-row {
          height: 100vh;
          margin: 0;
        }

        /* Brand Side */
        .brand-side {
          background: linear-gradient(135deg, #000000 0%, #434343 100%);
          color: white;
          padding: 2rem;
          display: flex;
          align-items: center;
          position: relative;
          overflow-y: auto;
        }

        .brand-side::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          opacity: 0.3;
        }

        .login-branding {
          position: relative;
          z-index: 2;
          width: 100%;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .logo-icon {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .brand-name {
          font-size: 2rem;
          font-weight: 900;
          margin: 0;
        }

        .brand-tagline {
          margin-bottom: 2rem;
        }

        .brand-tagline h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .brand-tagline p {
          font-size: 1rem;
          opacity: 0.9;
          line-height: 1.5;
        }

        .brand-features {
          margin-bottom: 2rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .feature-item:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(8px);
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .feature-text h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          font-weight: 700;
        }

        .feature-text p {
          margin: 0;
          opacity: 0.8;
          font-size: 0.85rem;
        }

        .brand-stats {
          display: flex;
          gap: 1.5rem;
        }

        .stat-item {
          text-align: center;
          flex: 1;
        }

        .stat-number {
          display: block;
          font-size: 1.5rem;
          font-weight: 900;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.75rem;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Form Side */
        .form-side {
          padding: 0;
          display: flex;
          align-items: center;
          height: 100vh;
          overflow-y: auto;
        }

        .login-form-container {
          width: 100%;
          padding: 1rem;
        }

        .form-content {
          max-width: 400px;
          margin: 0 auto;
        }

        /* Panda Container */
        .panda-container {
          text-align: center;
          margin-bottom: 1rem;
        }

        .panda-wrapper {
          position: relative;
          display: inline-block;
        }

        .login-panda-svg {
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
          transition: all 0.3s ease;
        }

        .speech-bubble {
          position: absolute;
          top: -10px;
          right: -55px;
          background: #000000;
          color: white;
          padding: 0.4rem 0.7rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 10;
        }

        .bubble-arrow {
          position: absolute;
          left: -5px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 5px solid transparent;
          border-bottom: 5px solid transparent;
          border-right: 5px solid #000000;
        }

        /* Login Header */
        .login-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .login-title {
          font-size: 2rem;
          font-weight: 900;
          color: #000000;
          margin-bottom: 0.25rem;
        }

        .login-subtitle {
          color: #666666;
          font-size: 1rem;
        }

        /* Login Card */
        .login-card {
          border: none;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 2px solid #f0f0f0;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .login-card .card-body {
          padding: 2rem;
        }

        /* Form Groups */
        .form-group-custom {
          margin-bottom: 1.25rem;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #999999;
          font-size: 1rem;
          z-index: 2;
        }

        .form-input-custom {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.75rem;
          border: 2px solid #f0f0f0;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 500;
          background: white;
          transition: all 0.3s ease;
          color: #000000;
        }

        .form-input-custom:focus {
          border-color: #000000;
          box-shadow: 0 0 0 0.15rem rgba(0, 0, 0, 0.1);
          outline: none;
        }

        .input-border {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 3px;
          background: linear-gradient(135deg, #000000, #434343);
          transition: all 0.3s ease;
          border-radius: 0 0 10px 10px;
        }

        .form-input-custom:focus ~ .input-border {
          width: 100%;
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666666;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.3s ease;
          z-index: 5;
        }

        .password-toggle:hover {
          background: #f0f0f0;
          color: #000000;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .remember-checkbox .form-check-input {
          border-radius: 4px;
          border: 2px solid #f0f0f0;
          width: 1.1rem;
          height: 1.1rem;
        }

        .remember-checkbox .form-check-input:checked {
          background-color: #000000;
          border-color: #000000;
        }

        .forgot-link {
          color: #666666;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          transition: all 0.3s ease;
        }

        .forgot-link:hover {
          color: #000000;
          text-decoration: underline;
        }

        .login-btn {
          width: 100%;
          background: #000000;
          color: white;
          border: none;
          padding: 0.875rem 1.5rem;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }

        .login-btn:hover {
          background: #434343;
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-ripple {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: all 0.6s ease;
        }

        .login-btn:active .btn-ripple {
          width: 300px;
          height: 300px;
        }

        .loading-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .login-divider {
          text-align: center;
          position: relative;
          margin-bottom: 1.5rem;
        }

        .login-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #f0f0f0;
        }

        .login-divider span {
          background: white;
          padding: 0 1rem;
          color: #666666;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .social-login {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .social-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.3s ease;
          border: 2px solid #f0f0f0;
          background: white;
          color: #333333;
        }

        .social-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .social-btn.google:hover {
          border-color: #db4437;
          color: #db4437;
        }

        .social-btn.github:hover {
          border-color: #333333;
          color: #333333;
        }

        .login-footer {
          background: #f8f8f8;
          border: none;
          padding: 1.25rem 2rem;
          text-align: center;
        }

        .login-footer p {
          margin: 0;
          color: #666666;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
        }

        .register-link {
          color: #000000;
          font-weight: 700;
          text-decoration: none;
          margin-left: 0.25rem;
        }

        .register-link:hover {
          text-decoration: underline;
        }

        .trust-indicators {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: #666666;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .trust-item i {
          color: #28a745;
          font-size: 0.9rem;
        }

        /* Responsive Design */
        @media (max-width: 992px) {
          .login-row {
            height: auto;
            min-height: 100vh;
          }

          .brand-side {
            display: none;
          }
          
          .form-side {
            height: auto;
            min-height: 100vh;
            padding: 1rem 0;
          }

          .speech-bubble {
            position: relative;
            top: 0.5rem;
            right: 0;
            margin: 0 auto;
            display: inline-block;
          }

          .bubble-arrow {
            top: -5px;
            left: 50%;
            transform: translateX(-50%);
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-bottom: 5px solid #000000;
            border-top: none;
          }
        }

        @media (max-width: 768px) {
          .login-form-container {
            padding: 0.75rem;
          }

          .login-card .card-body {
            padding: 1.5rem;
          }

          .login-title {
            font-size: 1.75rem;
          }

          .social-login {
            flex-direction: column;
          }

          .trust-indicators {
            gap: 1rem;
          }

          .trust-item {
            font-size: 0.75rem;
          }

          .login-panda-svg {
            width: 70px;
            height: 70px;
          }

          .speech-bubble {
            font-size: 0.65rem;
            padding: 0.3rem 0.5rem;
          }
        }

        @media (max-width: 576px) {
          .login-form-container {
            padding: 0.5rem;
          }

          .login-card .card-body {
            padding: 1.25rem;
          }

          .trust-indicators {
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }

          .login-panda-svg {
            width: 60px;
            height: 60px;
          }
        }

        /* Scroll optimizations */
        .form-side {
          -webkit-overflow-scrolling: touch;
        }

        .form-side::-webkit-scrollbar {
          width: 4px;
        }

        .form-side::-webkit-scrollbar-track {
          background: transparent;
        }

        .form-side::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default Login;
