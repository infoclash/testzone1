import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Badge, Dropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const NavigationBar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    setExpanded(false);
  };

  const handleNavLinkClick = () => {
    setExpanded(false);
  };

  // Smooth scroll function for one-page navigation
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 100; // Account for navbar height
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
    setExpanded(false);
  };

  return (
    <>
      <style>
        {`
          /* Main Navbar Styles */
          .xeriwo-navbar-premium {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%) !important;
            border-bottom: 2px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.9) !important;
            backdrop-filter: blur(20px) !important;
            padding: 18px 0 !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 1050 !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            
          }
/* Full-width Navbar */
.xeriwo-navbar-premium {
  width: 100% !important;       /* Always span full width */
  max-width: 100% !important;   /* Prevent container shrink */
  margin: 0 auto !important;    /* Center content */
  display: flex !important;
  justify-content: center !important;
}

/* Container override so it doesn't shrink */
.xeriwo-navbar-premium .container,
.xeriwo-navbar-premium .container-fluid {
  width: 100% !important;
  max-width: 100% !important;
  padding-left: 30px !important;   /* More breathing room */
  padding-right: 30px !important;
}

/* Navigation Links Spacing */
.xeriwo-nav-links {
  display: flex !important;
  gap: 4px !important;            /* Adds clean gap between links */
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
}

/* Ensure nav links look uniform */
.xeriwo-nav-links .nav-link {
  margin: 0 !important;            /* Remove old margin */
  padding: 12px 24px !important;   /* Balanced padding */
}

          .xeriwo-navbar-premium.scrolled {
            padding: 12px 0 !important;
            backdrop-filter: blur(30px) !important;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(26, 26, 26, 0.95) 100%) !important;
          }

          /* Brand Styles */
          .xeriwo-brand-master {
            font-size: 2rem !important;
            font-weight: 900 !important;
            color: #ffffff !important;
            text-decoration: none !important;
            letter-spacing: 0.8px !important;
            display: flex !important;
            align-items: center !important;
            gap: 2px !important;
            transition: all 0.3s ease !important;
            position: relative !important;
            cursor: pointer !important;
          }

          .xeriwo-brand-master:hover {
            color: #ffffff !important;
            text-decoration: none !important;
            transform: translateY(-2px) !important;
          }

          .xeriwo-brand-logo {
            font-size: 1.5rem !important;
          
          }

          /* Navigation Links */
          .xeriwo-nav-links .nav-link {
            color: rgba(255, 255, 255, 0.9) !important;
            font-weight: 600 !important;
            margin: 0 15px !important;
            padding: 12px 20px !important;
            border-radius: 12px !important;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
            text-decoration: none !important;
            font-size: 1.4rem !important;
            position: relative !important;
            overflow: hidden !important;
            border: 1px solid transparent !important;
            cursor: pointer !important;
          }

          .xeriwo-nav-links .nav-link::before {
            content: '' !important;
            position: absolute !important;
            bottom: 0 !important;
            left: 50% !important;
            width: 0 !important;
            height: 2px !important;
            background: linear-gradient(90deg, #4f46e5, #06b6d4) !important;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
            transform: translateX(-50%) !important;
          }

          .xeriwo-nav-links .nav-link:hover::before {
            width: 100% !important;
          }

          .xeriwo-nav-links .nav-link:hover {
            color: #ffffff !important;
            background: rgba(255, 255, 255, 0.08) !important;
            transform: translateY(-2px) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
          }

          .xeriwo-nav-links .nav-link:active,
          .xeriwo-nav-links .nav-link:focus {
            color: #ffffff !important;
            background: rgba(255, 255, 255, 0.1) !important;
          }

          /* Auth Buttons */
          .xeriwo-auth-section {
            display: flex !important;
            align-items: center !important;
            gap: 16px !important;
          }

          .xeriwo-login-btn {
            background: transparent !important;
            border: 2px solid rgba(255, 255, 255, 0.8) !important;
            color: #ffffff !important;
            padding: 12px 38px !important;
            border-radius: 12px !important;
            font-weight: 700 !important;
            font-size: 0.9rem !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            position: relative !important;
            overflow: hidden !important;
            letter-spacing: 0.5px !important;
          }

          .xeriwo-login-btn::before {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: -100% !important;
            width: 100% !important;
            height: 100% !important;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent) !important;
            transition: left 0.5s !important;
          }

          .xeriwo-login-btn:hover::before {
            left: 100% !important;
          }

          .xeriwo-login-btn:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: #ffffff !important;
            color: #ffffff !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(255, 255, 255, 0.1) !important;
          }

          .xeriwo-register-btn {
            background: linear-gradient(135deg, #ffffff, #f8f9fa) !important;
            border: 2px solid #ffffff !important;
            color: #000000 !important;
            padding: 12px 48px !important;
            border-radius: 12px !important;
            font-weight: 700 !important;
            font-size: 0.9rem !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            position: relative !important;
            overflow: hidden !important;
            letter-spacing: 0.5px !important;
            box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2) !important;
          }

          .xeriwo-register-btn::before {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: -100% !important;
            width: 100% !important;
            height: 100% !important;
            background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent) !important;
            transition: left 0.5s !important;
          }

          .xeriwo-register-btn:hover::before {
            left: 100% !important;
          }

          .xeriwo-register-btn:hover {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef) !important;
            color: #000000 !important;
            transform: translateY(-3px) !important;
            box-shadow: 0 8px 30px rgba(255, 255, 255, 0.3) !important;
          }

          /* User Section */
          .xeriwo-user-section {
            display: flex !important;
            align-items: center !important;
            gap: 18px !important;
          }

          .xeriwo-user-dropdown {
            background: rgba(255, 255, 255, 0.08) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: #ffffff !important;
            padding: 12px 18px !important;
            border-radius: 12px !important;
            font-weight: 600 !important;
            font-size: 0.9rem !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            backdrop-filter: blur(10px) !important;
          }

          .xeriwo-user-dropdown:hover {
            background: rgba(255, 255, 255, 0.12) !important;
            border-color: rgba(255, 255, 255, 0.4) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
          }

          /* User Avatar */
          .xeriwo-user-avatar {
            width: 36px !important;
            height: 36px !important;
            border-radius: 50% !important;
            background: linear-gradient(135deg, #4f46e5, #06b6d4) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            color: #ffffff !important;
            font-size: 0.95rem !important;
            font-weight: bold !important;
            border: 2px solid rgba(255, 255, 255, 0.2) !important;
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3) !important;
          }

          /* Badges */
          .xeriwo-premium-badge {
            background: linear-gradient(135deg, #ffc107, #ff8f00) !important;
            color: #000000 !important;
            font-size: 0.7rem !important;
            padding: 4px 10px !important;
            border-radius: 6px !important;
            font-weight: 800 !important;
            margin-left: 8px !important;
            box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3) !important;
            letter-spacing: 0.3px !important;
          }

          .xeriwo-admin-badge {
            background: linear-gradient(135deg, #dc3545, #c82333) !important;
            color: #ffffff !important;
            font-size: 0.7rem !important;
            padding: 4px 10px !important;
            border-radius: 6px !important;
            font-weight: 800 !important;
            margin-left: 8px !important;
            box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3) !important;
            letter-spacing: 0.3px !important;
          }

          /* Dropdown Menu */
          .xeriwo-dropdown-menu {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 16px !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8) !important;
            min-width: 280px !important;
            padding: 12px 0 !important;
            backdrop-filter: blur(20px) !important;
            margin-top: 8px !important;
          }

          .xeriwo-dropdown-item {
            color: rgba(255, 255, 255, 0.9) !important;
            padding: 14px 24px !important;
            border-radius: 0 !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            font-weight: 500 !important;
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
          }

          .xeriwo-dropdown-item:hover,
          .xeriwo-dropdown-item:focus {
            background: rgba(255, 255, 255, 0.08) !important;
            color: #ffffff !important;
            transform: translateX(4px) !important;
          }

          .xeriwo-dropdown-divider {
            border-color: rgba(255, 255, 255, 0.15) !important;
            margin: 8px 16px !important;
          }

          .xeriwo-user-info {
            padding: 16px 24px !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            margin-bottom: 8px !important;
          }

          /* Mobile Toggler */
          .xeriwo-navbar-toggler {
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            outline: none !important;
            box-shadow: none !important;
            padding: 8px 12px !important;
            border-radius: 8px !important;
            background: rgba(255, 255, 255, 0.05) !important;
            transition: all 0.3s ease !important;
          }

          .xeriwo-navbar-toggler:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.5) !important;
          }

          .xeriwo-navbar-toggler:focus {
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2) !important;
            border-color: rgba(255, 255, 255, 0.6) !important;
          }

          .xeriwo-navbar-toggler-icon {
            background-image: url(".w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 0.9%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2.5' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e") !important;
            transition: all 0.3s ease !important;
          }

          /* Responsive Styles */
          @media (max-width: 991.98px) {
            .xeriwo-nav-links {
              padding-top: 20px !important;
              border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
              margin-top: 16px !important;
            }
            
            .xeriwo-nav-links .nav-link {
              padding: 16px 24px !important;
              margin: 4px 0 !important;
              border-radius: 12px !important;
            }
            
            .xeriwo-auth-mobile {
              padding-top: 20px !important;
              border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
              margin-top: 20px !important;
              flex-direction: column !important;
              gap: 12px !important;
            }

            .xeriwo-login-btn,
            .xeriwo-register-btn {
              width: 100% !important;
              text-align: center !important;
              padding: 14px 28px !important;
            }

            .xeriwo-user-section {
              padding-top: 20px !important;
              border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
              margin-top: 20px !important;
              justify-content: center !important;
            }
          }

          /* Animation for icons */
          .xeriwo-icon {
            transition: all 0.3s ease !important;
          }

          .xeriwo-nav-links .nav-link:hover .xeriwo-icon {
            transform: scale(1.1) !important;
          }

          /* Scroll effect */
          @media (min-width: 992px) {
            .xeriwo-navbar-premium.scrolled .xeriwo-brand-master {
              font-size: 1.8rem !important;
            }
          }
        `}
      </style>
      
      <Navbar 
        className="xeriwo-navbar-premium" 
        expand="lg" 
        expanded={expanded}
        onToggle={setExpanded}
        variant="dark"
      >
        <Container>
          <div 
            className="xeriwo-brand-master"
            onClick={() => scrollToSection('homepage-hero')}
          >
        
            <span>XeriwoTools</span>
          </div>
          
          <Navbar.Toggle 
            aria-controls="xeriwo-navbar-nav"
            className="xeriwo-navbar-toggler"
          >
            <span className="xeriwo-navbar-toggler-icon"></span>
          </Navbar.Toggle>
          
          <Navbar.Collapse id="xeriwo-navbar-nav">
            <Nav className="me-auto xeriwo-nav-links">
              <Nav.Link onClick={() => scrollToSection('homepage-hero')}>
               
                Home
              </Nav.Link>
              <Nav.Link onClick={() => scrollToSection('homepage-about')}>
              
                About
              </Nav.Link>
             <Nav.Link as={Link} to="/products">
  Products
</Nav.Link>
              <Nav.Link onClick={() => scrollToSection('homepage-features')}>
          
                Features
              </Nav.Link>
            
              <Nav.Link onClick={() => scrollToSection('homepage-payment')}>
              
                Payment
              </Nav.Link>
              <Nav.Link onClick={() => scrollToSection('homepage-faq')}>
               
                FAQ
              </Nav.Link>
             
            </Nav>
            
            <Nav className="ms-auto">
              {isAuthenticated ? (
                <div className={`xeriwo-user-section ${expanded ? 'flex-column' : ''}`}>
                  <LinkContainer to="/dashboard" onClick={handleNavLinkClick}>
                    <Nav.Link className="d-flex align-items-center">
                      <i className="fas fa-tachometer-alt me-2 xeriwo-icon"></i>
                      Dashboard
                      {user?.subscription === 'premium' && (
                        <Badge className="xeriwo-premium-badge">
                          <i className="fas fa-crown me-1"></i>
                          PRO
                        </Badge>
                      )}
                    </Nav.Link>
                  </LinkContainer>
                  
                  {user?.role === 'admin' && (
                    <LinkContainer to="/admin" onClick={handleNavLinkClick}>
                      <Nav.Link className="d-flex align-items-center">
                        <i className="fas fa-shield-alt me-2 xeriwo-icon"></i>
                        Admin
                        <Badge className="xeriwo-admin-badge">
                          <i className="fas fa-user-shield me-1"></i>
                          ADMIN
                        </Badge>
                      </Nav.Link>
                    </LinkContainer>
                  )}
                  
                  <Dropdown align="end">
                    <Dropdown.Toggle as="div" className="xeriwo-user-dropdown">
                      <div className="d-flex align-items-center">
                        <div className="xeriwo-user-avatar">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="d-none d-md-block ms-2">
                          <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                            {user?.name || 'User'}
                          </div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                            {user?.subscription?.toUpperCase() || 'FREE'}
                          </div>
                        </div>
                        <i className="fas fa-chevron-down ms-2 xeriwo-icon" style={{ fontSize: '0.8rem' }}></i>
                      </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="xeriwo-dropdown-menu">
                      <div className="xeriwo-user-info">
                        <div className="d-flex align-items-center">
                          <div className="xeriwo-user-avatar me-3" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff' }}>
                              {user?.name || 'User'}
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7, color: 'rgba(255, 255, 255, 0.7)' }}>
                              {user?.email || 'user@example.com'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <LinkContainer to="/dashboard" onClick={handleNavLinkClick}>
                        <Dropdown.Item className="xeriwo-dropdown-item">
                          <i className="fas fa-chart-bar"></i>
                          <span>Dashboard</span>
                        </Dropdown.Item>
                      </LinkContainer>
                      
                      <LinkContainer to="/profile" onClick={handleNavLinkClick}>
                        <Dropdown.Item className="xeriwo-dropdown-item">
                          <i className="fas fa-user-circle"></i>
                          <span>My Profile</span>
                        </Dropdown.Item>
                      </LinkContainer>
                      
                      <LinkContainer to="/downloads" onClick={handleNavLinkClick}>
                        <Dropdown.Item className="xeriwo-dropdown-item">
                          <i className="fas fa-download"></i>
                          <span>My Downloads</span>
                        </Dropdown.Item>
                      </LinkContainer>
                      
                      <LinkContainer to="/settings" onClick={handleNavLinkClick}>
                        <Dropdown.Item className="xeriwo-dropdown-item">
                          <i className="fas fa-cog"></i>
                          <span>Settings</span>
                        </Dropdown.Item>
                      </LinkContainer>
                      
                      <Dropdown.Divider className="xeriwo-dropdown-divider" />
                      
                      <Dropdown.Item className="xeriwo-dropdown-item" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sign Out</span>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              ) : (
                <div className={`xeriwo-auth-section ${expanded ? 'xeriwo-auth-mobile' : ''}`}>
                  <LinkContainer to="/login" onClick={handleNavLinkClick}>
                    <Button className="xeriwo-login-btn">
                      <i className="fas fa-sign-in-alt me-2 xeriwo-icon"></i>
                      Login
                    </Button>
                  </LinkContainer>
                  
                  <LinkContainer to="/register" onClick={handleNavLinkClick}>
                    <Button className="xeriwo-register-btn">
                      <i className="fas fa-user-plus me-2 xeriwo-icon"></i>
                      Get Started
                    </Button>
                  </LinkContainer>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default NavigationBar;