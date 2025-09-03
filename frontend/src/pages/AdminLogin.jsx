// pages/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../config/api';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { username, password } = formData;

  useEffect(() => {
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      navigate('/admin');
    }
  }, [navigate]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Fixed credentials
    if (username !== 'admin' || password !== 'admin123') {
      toast.error('Invalid admin credentials');
      return;
    }

    setLoading(true);
    
    try {
      // Create admin token (simple approach)
      const adminToken = 'admin_' + Date.now();
      const adminData = {
        username: 'admin',
        name: 'System Administrator',
        role: 'admin',
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('adminToken', adminToken);
      localStorage.setItem('adminData', JSON.stringify(adminData));
      
      toast.success('Admin login successful!');
      navigate('/admin');
      
    } catch (error) {
      console.error('❌ Admin login error:', error);
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', minHeight: '100vh', padding: '20px 0' }}>
      <Container>
        <Row className="justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <Col md={6} lg={5} xl={4}>
            <Card className="shadow-lg" style={{ borderRadius: '20px', border: 'none' }}>
              <Card.Header 
                className="text-center text-white" 
                style={{ 
                  background: 'linear-gradient(135deg, #dc3545, #c82333)', 
                  padding: '30px 20px',
                  borderRadius: '20px 20px 0 0'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h2 className="mb-0">Admin Portal</h2>
                <p className="mb-0">Secure Administrative Access</p>
              </Card.Header>
              
              <Card.Body className="p-4">
                <Alert variant="info" className="small mb-4">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-info-circle me-2"></i>
                    <div>
                      <strong>Admin Credentials:</strong><br />
                      Username: <code>admin</code><br />
                      Password: <code>admin123</code>
                    </div>
                  </div>
                </Alert>

                <Form onSubmit={onSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-user me-2"></i>
                      Username
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={username}
                      onChange={onChange}
                      placeholder="Enter admin username"
                      disabled={loading}
                      style={{ borderRadius: '10px', padding: '12px 15px' }}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      <i className="fas fa-lock me-2"></i>
                      Password
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={password}
                        onChange={onChange}
                        placeholder="Enter admin password"
                        disabled={loading}
                        style={{ borderRadius: '10px 0 0 10px', padding: '12px 15px' }}
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        style={{ borderRadius: '0 10px 10px 0' }}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <div className="d-grid">
                    <Button 
                      type="submit" 
                      variant="danger"
                      size="lg"
                      disabled={loading}
                      style={{
                        borderRadius: '10px',
                        padding: '12px',
                        fontWeight: '600',
                        background: 'linear-gradient(135deg, #dc3545, #c82333)',
                        border: 'none'
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Admin Login
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
              
              <Card.Footer className="text-center" style={{ background: '#f8f9fa', padding: '15px' }}>
                <small className="text-muted">
                  <i className="fas fa-shield-alt me-1"></i>
                  Secure Admin Authentication System
                </small>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLogin;
