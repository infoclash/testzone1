// pages/Login.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { email, password } = formData;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await login(formData);

      if (response.success) {
        toast.success('Welcome back! Login successful!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error) {
      toast.error(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Container fluid className="login-wrapper">
        <Row className="justify-content-center align-items-center">
          <Col xs={12} sm={10} md={8} lg={5}>
            <div className={`login-container ${isVisible ? 'fade-in' : ''}`}>
              {/* Logo Section */}
              <div className="brand-section">
                <h1 className="brand-logo">XeriwoTools</h1>
                <p className="brand-subtitle">Empowering your workflow</p>
              </div>

              {/* Login Form */}
              <Card className="login-card">
                <Card.Body className="card-body">
                  <h2 className="login-title">Sign In</h2>
                  <p className="login-subtitle">Welcome back! Please login to continue.</p>

                  <Form onSubmit={onSubmit} className="login-form">
                    {/* Email */}
                    <Form.Group className="form-group">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                        placeholder="Enter your email"
                        disabled={loading}
                      />
                    </Form.Group>

                    {/* Password */}
                    <Form.Group className="form-group">
                      <Form.Label>Password</Form.Label>
                      <div className="password-wrapper">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={password}
                          onChange={onChange}
                          required
                          placeholder="Enter your password"
                          disabled={loading}
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

                    {/* Remember & Forgot */}
                    <div className="form-options" style={{color:"white"}}>
                      <Form.Check
                        type="checkbox"
                        id="remember"
                        label="Remember me"
                        className="checkbox"
                      />
                      <Link to="/forgot-password" className="forgot-link">
                        Forgot password?
                      </Link>
                    </div>

                    {/* Submit */}
                    <Button type="submit" className="submit-btn" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="spinner"></div> Signing in...
                        </>
                      ) : (
                        <>
                          Sign In <i className="fas fa-arrow-right"></i>
                        </>
                      )}
                    </Button>
                  </Form>
                </Card.Body>

                <Card.Footer className="card-footer">
                  <p style={{color:"white"}}>
                    Don’t have an account?{" "}
                    <Link to="/register" className="register-link">Create one</Link>
                  </p>
                </Card.Footer>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Custom CSS */}
      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0d0d0d, #1a1a1a 70%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          padding: 2rem 0;
        }

        .login-container {
          max-width: 620px;
          margin: auto;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }

        .login-container.fade-in {
          opacity: 1;
          transform: translateY(0);
        }

        .brand-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .brand-logo {
          font-size: 5rem;
          font-weight: 900;
         color:#ff5722;
          margin: 0;
        }

        .brand-subtitle {
          font-size: 1rem;
          color: white;
          margin-top: 0.5rem;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .card-body {
          padding: 2rem;
          text-align: center;
        }

        .login-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: white;
        }

        .login-subtitle {
          font-size: 1.4  rem;
          color: white;
          margin-bottom: 1.5rem;
        }

        .form-group {
          text-align: left;
          margin-bottom: 1.25rem;
        }

        .form-group label {
          font-weight: 600;
          margin-bottom: 0.4rem;
           color: white;
        }

        .form-control {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: #fff;
          transition: all 0.3s ease;
           color: white;
        }

        .form-control:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: #ff5722;
          box-shadow: 0 0 0 0.2rem rgba(255, 87, 34, 0.25);
           color: white;
        }

        .password-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
        }

        .password-toggle:hover {
          color: #ff5722;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .forgot-link {
          color: #ff5722;
          font-weight: 600;
          text-decoration: none;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #ff5722, #e64a19);
          border: none;
          border-radius: 8px;
          padding: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          transition: all 0.3s ease;
        }

        .submit-btn:hover {
          background: linear-gradient(135deg, #e64a19, #d84315);
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          opacity: 0.7;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .card-footer {
          text-align: center;
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .register-link {
          color: #ff5722;
          font-weight: 600;
          text-decoration: none;
        }

        .register-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;
