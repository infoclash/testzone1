import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Badge, Dropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';

const NavigationBar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    setExpanded(false);
  };

  const navStyles = {
    navbar: {
      backgroundColor: '#000000',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.8)',
      padding: '16px 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    },
    brand: {
      fontSize: '1.75rem',
      fontWeight: '800',
      color: '#ffffff',
      textDecoration: 'none',
      letterSpacing: '0.5px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    navLink: {
      color: '#ffffff !important',
      fontWeight: '600',
      margin: '0 8px',
      padding: '10px 20px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      fontSize: '0.95rem',
      cursor: 'pointer',
      border: '1px solid transparent'
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    userDropdown: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: '#ffffff',
      padding: '8px 16px',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    authButtons: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    loginBtn: {
      background: 'transparent',
      border: '2px solid #ffffff',
      color: '#ffffff',
      padding: '10px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease'
    },
    registerBtn: {
      background: '#ffffff',
      border: '2px solid #ffffff',
      color: '#000000',
      padding: '10px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease'
    },
    premiumBadge: {
      background: '#ffc107',
      color: '#000000',
      fontSize: '0.7rem',
      padding: '3px 8px',
      borderRadius: '4px',
      fontWeight: '700',
      marginLeft: '8px'
    },
    adminBadge: {
      background: '#dc3545',
      color: '#ffffff',
      fontSize: '0.7rem',
      padding: '3px 8px',
      borderRadius: '4px',
      fontWeight: '700',
      marginLeft: '8px'
    },
    logo: {
      fontSize: '1.5rem',
      color: '#ffffff'
    }
  };

  const handleNavLinkClick = () => {
    setExpanded(false);
  };

  return (
    <>
      <style>
        {`
          /* Global navbar styles */
          .navbar-nav .nav-link {
            color: #ffffff !important;
          }
          
          .navbar-nav .nav-link:hover {
            background-color: rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
            transform: translateY(-1px);
          }
          
          .navbar-nav .nav-link:focus,
          .navbar-nav .nav-link:active {
            color: #ffffff !important;
          }
          
          /* Navbar toggler */
          .navbar-toggler {
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            outline: none !important;
            box-shadow: none !important;
            padding: 6px 10px !important;
          }
          
          .navbar-toggler:focus {
            box-shadow: none !important;
            border-color: rgba(255, 255, 255, 0.5) !important;
          }
          
          .navbar-toggler-icon {
            background-3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 0.8%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e") !important;
          }
          
          /* Dropdown styles */
          .dropdown-menu {
            background: #000000 !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 8px !important;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.8) !important;
            min-width: 200px !important;
          }
          
          .dropdown-item {
            color: #ffffff !important;
            padding: 12px 20px !important;
            border-radius: 0 !important;
            transition: all 0.3s ease !important;
            font-weight: 500 !important;
          }
          
          .dropdown-item:hover,
          .dropdown-item:focus {
            background-color: rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
          }
          
          .dropdown-divider {
            border-color: rgba(255, 255, 255, 0.2) !important;
            margin: 8px 0 !important;
          }
          
          /* Brand hover effect */
          .navbar-brand:hover {
            color: #ffffff !important;
            text-decoration: none !important;
          }
          
          /* Responsive text */
          @media (max-width: 991.98px) {
            .navbar-nav {
              padding-top: 15px;
            }
            
            .navbar-nav .nav-link {
              padding: 12px 20px !important;
              margin: 2px 0 !important;
            }
            
            .auth-buttons-mobile {
              padding-top: 15px;
              border-top: 1px solid rgba(255, 255, 255, 0.2);
              margin-top: 15px;
            }
          }
        `}
      </style>
      
      <Navbar 
        style={navStyles.navbar} 
        expand="lg" 
        expanded={expanded}
        onToggle={setExpanded}
        className="mb-0"
        variant="dark"
      >
        <Container>
          <LinkContainer to="/" onClick={handleNavLinkClick}>
            <Navbar.Brand style={navStyles.brand}>
              <span style={navStyles.logo}>⚙️</span>
              XeriwoTools
            </Navbar.Brand>
          </LinkContainer>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <LinkContainer to="/" onClick={handleNavLinkClick}>
                <Nav.Link style={navStyles.navLink}>
                  <i className="fas fa-home me-2"></i>
                  Home
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/products" onClick={handleNavLinkClick}>
                <Nav.Link style={navStyles.navLink}>
                  <i className="fas fa-box me-2"></i>
                  Products
                </Nav.Link>
              </LinkContainer>
            </Nav>
            
            <Nav className="ms-auto">
              {isAuthenticated ? (
                <div style={navStyles.userSection} className="d-flex align-items-center">
                  <LinkContainer to="/dashboard" onClick={handleNavLinkClick}>
                    <Nav.Link style={navStyles.navLink}>
                      <i className="fas fa-tachometer-alt me-2"></i>
                      Dashboard
                      {user?.subscription === 'premium' && (
                        <Badge style={navStyles.premiumBadge}>
                          <i className="fas fa-crown me-1"></i>
                          PRO
                        </Badge>
                      )}
                    </Nav.Link>
                  </LinkContainer>
                  
                  {user?.role === 'admin' && (
                    <LinkContainer to="/admin" onClick={handleNavLinkClick}>
                      <Nav.Link style={navStyles.navLink}>
                        <i className="fas fa-shield-alt me-2"></i>
                        Admin
                        <Badge style={navStyles.adminBadge}>
                          <i className="fas fa-user-shield me-1"></i>
                          ADMIN
                        </Badge>
                      </Nav.Link>
                    </LinkContainer>
                  )}
                  
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      as="div"
                      style={navStyles.userDropdown}
                    >
                      <div className="d-flex align-items-center">
                        <div 
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '10px',
                            color: '#ffffff',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                          }}
                        >
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="d-none d-md-block">
                          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#ffffff' }}>
                            {user?.name || 'User'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                            {user?.subscription?.toUpperCase() || 'FREE'}
                          </div>
                        </div>
                        <i className="fas fa-chevron-down ms-2" style={{ fontSize: '0.8rem', color: '#ffffff' }}></i>
                      </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item>
                        <div className="d-flex align-items-center">
                          <div 
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '10px',
                              color: '#ffffff',
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                              {user?.name || 'User'}
                            </div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                              {user?.email || 'user@example.com'}
                            </div>
                          </div>
                        </div>
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <LinkContainer to="/dashboard" onClick={handleNavLinkClick}>
                        <Dropdown.Item>
                          <i className="fas fa-chart-bar me-2"></i>
                          Dashboard
                        </Dropdown.Item>
                      </LinkContainer>
                    
                     
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Sign Out
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              ) : (
                <div style={navStyles.authButtons} className={`${expanded ? 'auth-buttons-mobile' : ''}`}>
                  <LinkContainer to="/login" onClick={handleNavLinkClick}>
                    <Button
                      style={navStyles.loginBtn}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#ffffff';
                      }}
                    >
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Login
                    </Button>
                  </LinkContainer>
                  
                  <LinkContainer to="/register" onClick={handleNavLinkClick}>
                    <Button
                      style={navStyles.registerBtn}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                        e.target.style.color = '#000000';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#ffffff';
                        e.target.style.color = '#000000';
                      }}
                    >
                      <i className="fas fa-user-plus me-2"></i>
                      Register
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
