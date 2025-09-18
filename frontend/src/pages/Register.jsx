// pages/Register.js
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal } from 'react-bootstrap';
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

  const { register, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        toast.success('Registration successful! Please verify your email.');
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
        navigate('/dashboard');
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

  return (
    <>
      <div className="register-page">
        <Container className="register-container">
          <Row className="justify-content-center align-items-center min-vh-100">
            <Col xl={4} lg={5} md={6} sm={8} xs={11}>
              <Card className="register-card">
                <Card.Body>
                  {/* Header */}
                  <div className="text-center mb-4">
                    <div className="logo-section mb-3">
                      <i className="fab fa-wordpress-simple logo-icon"></i>
                    </div>
                    <h2 className="register-title">Create Account</h2>
                    <p className="register-subtitle">Join XeriwoTools today</p>
                  </div>

                  {/* Registration Form */}
                  <Form onSubmit={onSubmit}>
                    <Form.Group className="mb-3">
                      <div className="input-group-custom">
                        <i className="fas fa-user input-icon"></i>
                        <Form.Control
                          type="text"
                          name="name"
                          value={name}
                          onChange={onChange}
                          placeholder="Full Name"
                          required
                          disabled={loading}
                          className="form-control-custom"
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <div className="input-group-custom">
                        <i className="fas fa-envelope input-icon"></i>
                        <Form.Control
                          type="email"
                          name="email"
                          value={email}
                          onChange={onChange}
                          placeholder="Email Address"
                          required
                          disabled={loading}
                          className="form-control-custom"
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <div className="input-group-custom">
                        <i className="fas fa-lock input-icon"></i>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={password}
                          onChange={onChange}
                          placeholder="Password"
                          required
                          minLength="6"
                          disabled={loading}
                          className="form-control-custom"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <div className="input-group-custom">
                        <i className="fas fa-check-circle input-icon"></i>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={confirmPassword}
                          onChange={onChange}
                          placeholder="Confirm Password"
                          required
                          disabled={loading}
                          className="form-control-custom"
                        />
                      </div>
                      {confirmPassword && (
                        <div className="password-match-indicator">
                          {password === confirmPassword ? (
                            <span className="match-success">
                              <i className="fas fa-check"></i> Passwords match
                            </span>
                          ) : (
                            <span className="match-error">
                              <i className="fas fa-times"></i> Passwords don't match
                            </span>
                          )}
                        </div>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Check
                        type="checkbox"
                        required
                        id="terms-checkbox"
                        className="custom-checkbox"
                        label={
                          <span>
                            I agree to the{' '}
                            <Link to="/terms" className="terms-link">Terms of Service</Link>
                            {' '}and{' '}
                            <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                          </span>
                        }
                      />
                    </Form.Group>

                    <Button
                      type="submit"
                      className="btn-register w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </Form>

                  {/* Footer */}
                  <div className="text-center">
                    <p className="login-link-text">
                      Already have an account?{' '}
                      <Link to="/login" className="login-link">Sign in</Link>
                    </p>
                  </div>
                </Card.Body>
              </Card>

              {/* Security Info */}
              <div className="security-info text-center mt-3">
                <small className="text-muted">
                  <i className="fas fa-shield-alt me-2"></i>
                  Your data is protected with SSL encryption
                </small>
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
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-envelope-open me-2"></i>
            Verify Your Email
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <div className="otp-icon mb-3">
              <i className="fas fa-envelope"></i>
            </div>
            <h5>Check Your Email</h5>
            <p className="text-muted">
              We've sent a 6-digit verification code to <strong>{email}</strong>
            </p>
          </div>

          <Form onSubmit={handleOTPSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength="6"
                className="otp-input text-center"
                required
                disabled={otpLoading}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                onClick={handleCloseModal}
                disabled={otpLoading}
                className="flex-fill"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-verify flex-fill"
                disabled={otpLoading || otp.length !== 6}
              >
                {otpLoading ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .register-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          padding: 20px 0;
        }

        .register-container {
          height: 100%;
        }

        .register-card {
          background: #232323;
          border-radius: 15px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border: none;
          padding: 20px;
        
        }

        .logo-section {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .logo-icon {
          font-size: 3rem;
          color: #ff5722;
          background: linear-gradient(135deg, #ff5722, #ff7043);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .register-title {
          color: white;
          font-weight: 700;
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .register-subtitle {
         color: white;
          font-size: 1rem;
          margin-bottom: 0;
        }

        .input-group-custom {
          position: relative;
          margin-bottom: 0.5rem;
        }

        .input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #ff5722;
          z-index: 2;
          font-size: 1.1rem;
        }

        .form-control-custom {
          padding: 15px 15px 15px 45px !important;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1rem;
          background: #ffffff;
          color: #1a1a1a;
          transition: all 0.3s ease;
        }

        .form-control-custom:focus {
          border-color: #ff5722;
          box-shadow: 0 0 0 0.2rem rgba(255, 87, 34, 0.15);
          background: #ffffff;
          color: #1a1a1a;
        }

        .form-control-custom::placeholder {
          color: #999;
        }

        .password-toggle {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 5px;
          border-radius: 5px;
          z-index: 2;
          transition: color 0.3s ease;
        }

        .password-toggle:hover {
          color: #ff5722;
        }

        .password-match-indicator {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          
        }

        .match-success {
          color: #28a745;
          font-weight: 500;
        }

        .match-error {
          color: #dc3545;
          font-weight: 500;
        }

        .custom-checkbox .form-check-input {
          border: 2px solid #e0e0e0;
          border-radius: 4px;
          width: 1.2rem;
          height: 1.2rem;
        }

        .custom-checkbox .form-check-input:checked {
          background-color: #ff5722;
          border-color: #ff5722;
        }

        .custom-checkbox .form-check-label {
       color: white;
          font-size: 0.9rem;
          margin-left: 0.5rem;
        }

        .terms-link {
         color: white;
          text-decoration: none;
          font-weight: 600;
        }

        .terms-link:hover {
          color: #ff7043;
          text-decoration: underline;
        }

        .btn-register {
          background: linear-gradient(135deg, #ff5722, #ff7043);
          border: none;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          padding: 15px;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .btn-register:hover {
          background: linear-gradient(135deg, #e64a19, #ff5722);
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(255, 87, 34, 0.3);
        }

        .btn-register:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .login-link-text {
          color: #666;
          margin-bottom: 0;
          font-size: 0.95rem;
        }

        .login-link {
          color: #ff5722;
          text-decoration: none;
          font-weight: 600;
        }

        .login-link:hover {
          color: #ff7043;
          text-decoration: underline;
        }

        .security-info {
          color: rgba(255, 255, 255, 0.7);
        }

        /* OTP Modal Styles */
        .otp-modal .modal-content {
          border-radius: 15px;
          border: none;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .otp-modal .modal-header {
          border-bottom: 1px solid #e0e0e0;
          padding: 1.5rem;
        }

        .otp-modal .modal-title {
          color: #1a1a1a;
          font-weight: 700;
        }

        .otp-modal .modal-body {
          padding: 2rem;
        }

        .otp-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #ff5722, #ff7043);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          color: white;
          font-size: 1.5rem;
        }

        .otp-modal h5 {
          color: #1a1a1a;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .otp-input {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.5rem;
          padding: 15px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          background: #ffffff;
        }

        .otp-input:focus {
          border-color: #ff5722;
          box-shadow: 0 0 0 0.2rem rgba(255, 87, 34, 0.15);
        }

        .btn-verify {
          background: linear-gradient(135deg, #ff5722, #ff7043);
          border: none;
          color: white;
          font-weight: 600;
          padding: 12px 20px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .btn-verify:hover {
          background: linear-gradient(135deg, #e64a19, #ff5722);
        }

        .btn-verify:disabled {
          opacity: 0.7;
        }

        /* Responsive Design */
        @media (max-width: 576px) {
          .register-page {
            padding: 10px 0;
          }
          
          .register-card {
            margin: 10px;
            padding: 15px;
          }

          .register-title {
            font-size: 1.5rem;
          }

          .logo-icon {
            font-size: 2.5rem;
          }

          .form-control-custom {
            padding: 12px 12px 12px 40px !important;
            font-size: 0.95rem;
          }

          .input-icon {
            left: 12px;
            font-size: 1rem;
          }

          .btn-register {
            font-size: 1rem;
            padding: 12px;
          }

          .otp-modal .modal-body {
            padding: 1.5rem;
          }
        }

        /* Loading Animation */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .spinner-border-sm {
          animation: spin 1s linear infinite;
        }

        /* Focus states for accessibility */
        .form-control-custom:focus,
        .btn-register:focus,
        .btn-verify:focus,
        .terms-link:focus,
        .login-link:focus {
          outline: none;
        }

        /* Smooth transitions */
        * {
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default Register;