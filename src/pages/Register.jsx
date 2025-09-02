// pages/Register.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Modal, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isTypingPassword, setIsTypingPassword] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [pandaEmotion, setPandaEmotion] = useState('normal');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { register, verifyOTP, pendingUserId } = useAuth();
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  useEffect(() => {
    // Track mouse movement for eye following
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Calculate eye position based on mouse position
      const pandaRect = document.querySelector('.panda-svg')?.getBoundingClientRect();
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
    // Change panda emotion based on password state
    if (password.length === 0) {
      setPandaEmotion('normal');
    } else if (isTypingPassword && !showPassword) {
      setPandaEmotion('closed');
    } else if (showPassword) {
      setPandaEmotion('surprised');
    } else if (password.length < 6) {
      setPandaEmotion('worried');
    } else {
      setPandaEmotion('happy');
    }
  }, [password, showPassword, isTypingPassword]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === 'password') {
      setIsTypingPassword(e.target.value.length > 0);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await register({ name, email, password });
      if (response.success) {
        setShowOTPModal(true);
        toast.success('Registration successful! Please wait for OTP from admin.');
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await verifyOTP(otp);
      if (res.success) {
        toast.success('Account verified successfully! You are now logged in.');
        setShowOTPModal(false);
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowOTPModal(false);
    setOtp('');
  };

  const getPandaMessage = () => {
    switch (pandaEmotion) {
      case 'closed':
        return "I can't see your password! 🤫";
      case 'surprised':
        return "Oh! I can see it now! 😮";
      case 'worried':
        return "Make it stronger please! 😟";
      case 'happy':
        return "Great password! 😊";
      default:
        return "Hi! Ready to join XeriwoTools? 👋";
    }
  };

  return (
    <>
      <div className="register-page">
        {/* Animated Background */}
        <div className="animated-background">
          <div className="floating-shapes">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="floating-shape"
                style={{
                  '--delay': `${i * 0.5}s`,
                  '--duration': `${10 + (i % 4) * 2}s`,
                  '--size': `${15 + (i % 3) * 10}px`
                }}
              />
            ))}
          </div>
        </div>

        <Container fluid className="register-container">
          <Row className="register-row">
            {/* Left Side - Branding */}
            <Col lg={6} className="d-none d-lg-flex brand-side">
              <div className="brand-content">
                <div className="brand-header">
                  <div className="brand-logo">
                    <i className="fab fa-wordpress-simple"></i>
                  </div>
                  <h1 className="brand-title">XeriwoTools</h1>
                </div>
                
                <div className="brand-message">
                  <h2>Join Our Community!</h2>
                  <p>Create your account and unlock access to premium WordPress themes, plugins, and AI-powered tools.</p>
                </div>

                <div className="features-list">
                  <div className="feature-item">
                    <div className="feature-icon">🎨</div>
                    <div>
                      <h4>500+ Premium Themes</h4>
                      <p>Professional designs for every need</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">🔌</div>
                    <div>
                      <h4>Powerful Plugins</h4>
                      <p>Extend your website functionality</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">🤖</div>
                    <div>
                      <h4>AI Assistant</h4>
                      <p>Smart recommendations for you</p>
                    </div>
                  </div>
                </div>

                <div className="stats-row">
                  <div className="stat">
                    <span className="stat-number">18K+</span>
                    <span className="stat-label">Users</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">4.9★</span>
                    <span className="stat-label">Rating</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">99.9%</span>
                    <span className="stat-label">Uptime</span>
                  </div>
                </div>
              </div>
            </Col>

            {/* Right Side - Form */}
            <Col lg={6} className="form-side">
              <div className="form-container">
                <div className="form-content">
                  {/* Panda Mascot */}
                  <div className="panda-container">
                    <div className="panda-wrapper">
                      <svg
                        className="panda-svg"
                        xmlns="http://www.w3.org/2000/svg"
                        width="100"
                        height="100"
                        viewBox="0 0 200 200"
                      >
                        {/* Panda head */}
                        <circle cx="100" cy="100" r="80" fill="#ffffff" stroke="#000000" strokeWidth="4" />
                        
                        {/* Ears */}
                        <circle cx="55" cy="50" r="20" fill="#000000" />
                        <circle cx="145" cy="50" r="20" fill="#000000" />
                        <circle cx="57" cy="52" r="10" fill="#ffffff" />
                        <circle cx="143" cy="52" r="10" fill="#ffffff" />
                        
                        {/* Eye patches */}
                        <ellipse cx="75" cy="85" rx="16" ry="22" fill="#000000" />
                        <ellipse cx="125" cy="85" rx="16" ry="22" fill="#000000" />
                        
                        {/* Eyes - responsive to emotion */}
                        {pandaEmotion === 'closed' ? (
                          <>
                            <path d="M65 85 Q75 80 85 85" stroke="#000000" strokeWidth="3" fill="none" />
                            <path d="M115 85 Q125 80 135 85" stroke="#000000" strokeWidth="3" fill="none" />
                          </>
                        ) : (
                          <>
                            <circle cx="75" cy="85" r="8" fill="#ffffff" />
                            <circle cx="125" cy="85" r="8" fill="#ffffff" />
                            
                            {/* Moving pupils */}
                            <circle 
                              cx={75 + eyePosition.x} 
                              cy={85 + eyePosition.y} 
                              r={pandaEmotion === 'surprised' ? "5" : "3"} 
                              fill="#000000"
                              style={{ transition: 'all 0.1s ease' }}
                            />
                            <circle 
                              cx={125 + eyePosition.x} 
                              cy={85 + eyePosition.y} 
                              r={pandaEmotion === 'surprised' ? "5" : "3"} 
                              fill="#000000"
                              style={{ transition: 'all 0.1s ease' }}
                            />
                            
                            {/* Eye shine */}
                            <circle cx={75 + eyePosition.x + 1} cy={85 + eyePosition.y - 1} r="1" fill="#ffffff" />
                            <circle cx={125 + eyePosition.x + 1} cy={85 + eyePosition.y - 1} r="1" fill="#ffffff" />
                          </>
                        )}
                        
                        {/* Nose */}
                        <ellipse cx="100" cy="110" rx="3" ry="2" fill="#000000" />
                        
                        {/* Mouth - changes with emotion */}
                        {pandaEmotion === 'worried' ? (
                          <path d="M90 125 Q100 120 110 125" stroke="#000000" strokeWidth="2" fill="none" />
                        ) : pandaEmotion === 'happy' ? (
                          <path d="M90 125 Q100 135 110 125" stroke="#000000" strokeWidth="2" fill="none" />
                        ) : pandaEmotion === 'surprised' ? (
                          <ellipse cx="100" cy="125" rx="4" ry="6" fill="#000000" />
                        ) : (
                          <path d="M95 125 Q100 130 105 125" stroke="#000000" strokeWidth="2" fill="none" />
                        )}
                        
                        {/* Blush for happy emotion */}
                        {pandaEmotion === 'happy' && (
                          <>
                            <circle cx="50" cy="95" r="6" fill="#ff69b4" opacity="0.3" />
                            <circle cx="150" cy="95" r="6" fill="#ff69b4" opacity="0.3" />
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

                  {/* Registration Form */}
                  <Card className="register-card">
                    <Card.Body className="card-body-custom">
                      <div className="form-header">
                        <h2 className="form-title">Create Account</h2>
                        <p className="form-subtitle">Join XeriwoTools community</p>
                      </div>

                      <Form onSubmit={onSubmit} className="register-form">
                        <Form.Group className="form-group-modern">
                          <div className="input-container">
                            <i className="input-icon fas fa-user"></i>
                            <Form.Control
                              type="text"
                              name="name"
                              value={name}
                              onChange={onChange}
                              required
                              placeholder="Full Name"
                              disabled={loading}
                              className="form-input-modern"
                            />
                          </div>
                        </Form.Group>

                        <Form.Group className="form-group-modern">
                          <div className="input-container">
                            <i className="input-icon fas fa-envelope"></i>
                            <Form.Control
                              type="email"
                              name="email"
                              value={email}
                              onChange={onChange}
                              required
                              placeholder="Email Address"
                              disabled={loading}
                              className="form-input-modern"
                            />
                          </div>
                        </Form.Group>

                        <Form.Group className="form-group-modern">
                          <div className="input-container">
                            <i className="input-icon fas fa-lock"></i>
                            <Form.Control
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              value={password}
                              onChange={onChange}
                              required
                              minLength="6"
                              placeholder="Password"
                              disabled={loading}
                              className="form-input-modern"
                            />
                            <button
                              type="button"
                              className="password-toggle-btn"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                          </div>
                        </Form.Group>

                        <Form.Group className="form-group-modern">
                          <div className="input-container">
                            <i className="input-icon fas fa-check-circle"></i>
                            <Form.Control
                              type="password"
                              name="confirmPassword"
                              value={confirmPassword}
                              onChange={onChange}
                              required
                              placeholder="Confirm Password"
                              disabled={loading}
                              className="form-input-modern"
                            />
                          </div>
                          {confirmPassword && (
                            <div className="password-match">
                              {password === confirmPassword ? (
                                <span className="match-success">
                                  <i className="fas fa-check"></i> Passwords match!
                                </span>
                              ) : (
                                <span className="match-error">
                                  <i className="fas fa-times"></i> Passwords don't match
                                </span>
                              )}
                            </div>
                          )}
                        </Form.Group>

                        <Form.Group className="form-check-modern">
                          <Form.Check
                            type="checkbox"
                            required
                            id="terms-check"
                            className="custom-checkbox"
                            label={
                              <span>
                                I agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>
                              </span>
                            }
                          />
                        </Form.Group>

                        <Button 
                          type="submit" 
                          className="submit-button"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <div className="loading-spinner"></div>
                              Creating Account...
                            </>
                          ) : (
                            <>
                              Create Account
                              <i className="fas fa-arrow-right"></i>
                            </>
                          )}
                        </Button>
                      </Form>
                    </Card.Body>

                    <Card.Footer className="card-footer-custom">
                      <p>
                        Already have an account? 
                        <Link to="/login" className="login-link">Sign in here</Link>
                      </p>
                    </Card.Footer>
                  </Card>

                  {/* Security badges */}
                  <div className="security-badges">
                    <div className="security-badge">
                      <i className="fas fa-shield-alt"></i>
                      <span>SSL Secured</span>
                    </div>
                    <div className="security-badge">
                      <i className="fas fa-lock"></i>
                      <span>Encrypted</span>
                    </div>
                    <div className="security-badge">
                      <i className="fas fa-user-shield"></i>
                      <span>Privacy Protected</span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* OTP Modal */}
      <Modal 
        show={showOTPModal} 
        onHide={handleCloseModal} 
        centered 
        backdrop="static"
        className="otp-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title className="modal-title-custom">
            <i className="fas fa-envelope-open"></i>
            Email Verification
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <div className="modal-panda">
            <svg width="60" height="60" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="35" fill="#ffffff" stroke="#000000" strokeWidth="2" />
              <circle cx="32" cy="28" r="8" fill="#000000" />
              <circle cx="68" cy="28" r="8" fill="#000000" />
              <ellipse cx="40" cy="42" rx="6" ry="8" fill="#000000" />
              <ellipse cx="60" cy="42" rx="6" ry="8" fill="#000000" />
              <circle cx="40" cy="42" r="3" fill="#ffffff" />
              <circle cx="60" cy="42" r="3" fill="#ffffff" />
              <circle cx="40" cy="42" r="1.5" fill="#000000" />
              <circle cx="60" cy="42" r="1.5" fill="#000000" />
              <ellipse cx="50" cy="52" rx="1.5" ry="1" fill="#000000" />
              <path d="M45 58 Q50 62 55 58" stroke="#000000" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          
          <div className="verification-text">
            <h5>Check Your Email!</h5>
            <p>We've sent a verification code to <strong>{email}</strong></p>
          </div>

          <Alert variant="info" className="otp-alert">
            Please contact the admin to get your verification code.
          </Alert>
          
          <Form onSubmit={handleOTPSubmit}>
            <Form.Control
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              required
              disabled={otpLoading}
              className="otp-input"
            />
            
            <div className="modal-actions">
              <Button 
                variant="outline-secondary" 
                onClick={handleCloseModal} 
                disabled={otpLoading}
                className="cancel-btn"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="verify-btn"
                disabled={otpLoading || otp.length !== 6}
              >
                {otpLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .register-page {
          min-height: 100vh;
          max-height: 100vh;
          background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
          position: relative;
          overflow: hidden;
        }

        .animated-background {
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
          animation: float var(--duration) ease-in-out infinite var(--delay);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-80px) rotate(90deg); }
          50% { transform: translateY(-160px) rotate(180deg); }
          75% { transform: translateY(-80px) rotate(270deg); }
        }

        .register-container {
          padding: 0;
          height: 100vh;
        }

        .register-row {
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

        .brand-content {
          position: relative;
          z-index: 2;
          width: 100%;
        }

        .brand-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .brand-logo {
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

        .brand-title {
          font-size: 2rem;
          font-weight: 900;
          margin: 0;
        }

        .brand-message {
          margin-bottom: 2rem;
        }

        .brand-message h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .brand-message p {
          font-size: 1rem;
          opacity: 0.9;
          line-height: 1.5;
        }

        .features-list {
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
          font-size: 1.5rem;
          width: 40px;
          text-align: center;
          flex-shrink: 0;
        }

        .feature-item h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          font-weight: 700;
        }

        .feature-item p {
          margin: 0;
          opacity: 0.8;
          font-size: 0.85rem;
        }

        .stats-row {
          display: flex;
          gap: 1.5rem;
        }

        .stat {
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

        .form-container {
          width: 100%;
          padding: 1rem;
        }

        .form-content {
          max-width: 450px;
          margin: 0 auto;
        }

        /* Panda Container */
        .panda-container {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .panda-wrapper {
          position: relative;
          display: inline-block;
        }

        .panda-svg {
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
          transition: all 0.3s ease;
        }

        .speech-bubble {
          position: absolute;
          top: -15px;
          right: -60px;
          background: #000000;
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 15px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 10;
        }

        .bubble-arrow {
          position: absolute;
          left: -6px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-right: 6px solid #000000;
        }

        /* Register Card */
        .register-card {
          border: none;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 2px solid #f0f0f0;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .card-body-custom {
          padding: 2rem;
        }

        .form-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .form-title {
          font-size: 2rem;
          font-weight: 900;
          color: #000000;
          margin-bottom: 0.25rem;
        }

        .form-subtitle {
          color: #666666;
          font-size: 1rem;
        }

        /* Form Styling */
        .form-group-modern {
          margin-bottom: 1.25rem;
        }

        .input-container {
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

        .form-input-modern {
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

        .form-input-modern:focus {
          border-color: #000000;
          box-shadow: 0 0 0 0.15rem rgba(0, 0, 0, 0.1);
          outline: none;
        }

        .password-toggle-btn {
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
          cursor: pointer;
        }

        .password-toggle-btn:hover {
          background: #f0f0f0;
          color: #000000;
        }

        .password-match {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .match-success {
          color: #28a745;
        }

        .match-error {
          color: #dc3545;
        }

        .form-check-modern {
          margin-bottom: 1.5rem;
        }

        .custom-checkbox .form-check-input {
          border-radius: 4px;
          border: 2px solid #f0f0f0;
          width: 1.1rem;
          height: 1.1rem;
        }

        .custom-checkbox .form-check-input:checked {
          background-color: #000000;
          border-color: #000000;
        }

        .custom-checkbox .form-check-label {
          margin-left: 0.5rem;
          color: #666666;
          font-size: 0.9rem;
        }

        .custom-checkbox .form-check-label a {
          color: #000000;
          font-weight: 600;
          text-decoration: none;
        }

        .custom-checkbox .form-check-label a:hover {
          text-decoration: underline;
        }

        .submit-button {
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
          margin-bottom: 0.75rem;
        }

        .submit-button:hover {
          background: #434343;
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
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

        .card-footer-custom {
          background: #f8f8f8;
          border: none;
          padding: 1.25rem 2rem;
          text-align: center;
        }

        .card-footer-custom p {
          margin: 0;
          color: #666666;
          font-size: 0.9rem;
        }

        .login-link {
          color: #000000;
          font-weight: 700;
          text-decoration: none;
          margin-left: 0.25rem;
        }

        .login-link:hover {
          text-decoration: underline;
        }

        .security-badges {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .security-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: #666666;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .security-badge i {
          color: #28a745;
          font-size: 0.9rem;
        }

        /* OTP Modal */
        .otp-modal .modal-content {
          border-radius: 16px;
          border: none;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }

        .modal-header-custom {
          background: linear-gradient(135deg, #f8f8f8, #ffffff);
          border: none;
          padding: 1.5rem;
        }

        .modal-title-custom {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 800;
          color: #000000;
        }

        .modal-body-custom {
          padding: 1.5rem;
          text-align: center;
        }

        .modal-panda {
          margin-bottom: 1.5rem;
        }

        .verification-text h5 {
          font-size: 1.1rem;
          font-weight: 800;
          color: #000000;
          margin-bottom: 0.75rem;
        }

        .verification-text p {
          color: #666666;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .otp-alert {
          background: linear-gradient(135deg, #fff3cd, #ffeaa7);
          border: 1px solid #ffeaa7;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
        }

        .otp-input {
          text-align: center;
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 2px;
          padding: 0.875rem;
          border: 2px solid #f0f0f0;
          border-radius: 10px;
          margin-bottom: 1.5rem;
        }

        .otp-input:focus {
          border-color: #000000;
          box-shadow: 0 0 0 0.15rem rgba(0, 0, 0, 0.1);
          outline: none;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
        }

        .cancel-btn {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .verify-btn {
          flex: 2;
          background: #000000;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .verify-btn:hover {
          background: #434343;
        }

        /* Responsive Design */
        @media (max-width: 992px) {
          .register-row {
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
            top: 0.75rem;
            right: 0;
            margin: 0 auto;
            display: inline-block;
          }

          .bubble-arrow {
            top: -6px;
            left: 50%;
            transform: translateX(-50%);
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-bottom: 6px solid #000000;
            border-top: none;
          }
        }

        @media (max-width: 768px) {
          .form-container {
            padding: 0.75rem;
          }

          .card-body-custom {
            padding: 1.5rem;
          }

          .form-title {
            font-size: 1.75rem;
          }

          .security-badges {
            gap: 1rem;
          }

          .security-badge {
            font-size: 0.75rem;
          }

          .modal-actions {
            flex-direction: column;
          }

          .panda-svg {
            width: 80px;
            height: 80px;
          }

          .speech-bubble {
            font-size: 0.7rem;
            padding: 0.375rem 0.5rem;
          }
        }

        @media (max-width: 576px) {
          .form-container {
            padding: 0.5rem;
          }

          .card-body-custom {
            padding: 1.25rem;
          }

          .security-badges {
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }

          .panda-svg {
            width: 70px;
            height: 70px;
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
    </>
  );
};

export default Register;
