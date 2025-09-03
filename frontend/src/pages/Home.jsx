// pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalDownloads: 0,
    totalUsers: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFeature, setActiveFeature] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activePlan, setActivePlan] = useState('standard');
  
  const { user } = useAuth();

  // Animated text words
  const dynamicWords = ['Premium', 'Professional', 'Modern', 'Creative', 'Responsive'];

  // Pricing plans
  const pricingPlans = [
    
    {
      id: 'standard',
      name: 'Standard',
      price: 799,
      period: 'month',
      downloads: 15,
      features: [
        '15 Downloads per day',
        'All premium content',
        'Advanced AI chatbot',
        'Priority support',
      ],
      popular: true,
      gradient: 'linear-gradient(135deg, #000000 0%, #434343 100%)'
    },
    
  ];

  // Payment methods
  const paymentMethods = [
    {
      id: 'easypaisa',
      name: 'EasyPaisa',
      icon: '💳',
      description: 'Pay with EasyPaisa wallet',
      color: '#00a86b'
    },
    {
      id: 'jazzcash',
      name: 'JazzCash',
      icon: '📱',
      description: 'Quick payment via JazzCash',
      color: '#ff6b35'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: '🏦',
      description: 'Direct bank transfer',
      color: '#4a90e2'
    },
    {
      id: 'card',
      name: 'Credit Card',
      icon: '💳',
      description: 'Visa, Mastercard accepted',
      color: '#6c5ce7'
    }
  ];

  // Enhanced testimonials
  const testimonials = [
    {
      id: 1,
      name: "Alex Thompson",
      role: "Full Stack Developer",
      company: "TechInnovate",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "XeriwoTools revolutionized my development workflow. The AI assistant is incredibly smart and the product quality is unmatched!",
      plan: "Premium"
    },
    {
      id: 2,
      name: "Sarah Kim",
      role: "UI/UX Designer",
      company: "DesignStudio Pro",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "Best marketplace for WordPress assets! The download process is seamless and the AI chatbot saves me hours of searching.",
      plan: "Standard"
    },
    {
      id: 3,
      name: "Marcus Johnson",
      role: "Agency Owner",
      company: "Digital Nexus",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "Outstanding platform! Our agency productivity increased 300% since we started using XeriwoTools. Highly recommended!",
      plan: "Premium"
    }
  ];

  // Enhanced features
  const features = [
    {
      icon: "🚀",
      title: "Lightning Speed",
      description: "Ultra-fast search and instant downloads with optimized performance",
      details: "Sub-second response time",
      gradient: "linear-gradient(135deg, #000000 0%, #434343 100%)"
    },
    {
      icon: "🤖",
      title: "AI Assistant",
      description: "Intelligent chatbot that understands your needs perfectly",
      details: "24/7 smart assistance",
      gradient: "linear-gradient(135deg, #434343 0%, #000000 100%)"
    },
    {
      icon: "🛡️",
      title: "Enterprise Security",
      description: "Military-grade security for all your downloads and data",
      details: "99.99% uptime guaranteed",
      gradient: "linear-gradient(135deg, #000000 0%, #434343 100%)"
    },
    {
      icon: "💎",
      title: "Premium Quality",
      description: "Hand-curated themes and plugins from top developers",
      details: "Quality guaranteed",
      gradient: "linear-gradient(135deg, #434343 0%, #000000 100%)"
    }
  ];

  // Company stats
  const companyStats = [
    {
      number: "2019",
      label: "Founded",
      icon: "🚀"
    },
    {
      number: "50K+",
      label: "Happy Customers",
      icon: "😊"
    },
    {
      number: "99.9%",
      label: "Uptime",
      icon: "⚡"
    },
    {
      number: "24/7",
      label: "Support",
      icon: "🛟"
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "How do downloads work?",
      answer: "Simply choose your plan, browse our collection, and click download. You get instant access to premium WordPress themes and plugins with lifetime updates."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept EasyPaisa, JazzCash, bank transfers, and all major credit cards. All payments are secured with enterprise-grade encryption."
    },
    {
      question: "Can I upgrade my plan anytime?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. The changes will be reflected in your next billing cycle."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee. If you're not satisfied with our service, contact our support team for a full refund."
    },
    {
      question: "How does the AI assistant work?",
      answer: "Our AI chatbot helps you find the perfect themes and plugins based on your requirements. It can understand natural language and provide personalized recommendations."
    }
  ];

  useEffect(() => {
    fetchHomeData();
    
    // Mouse tracking for parallax effects
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Auto-rotate testimonials
    const testimonialTimer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    // Auto-rotate features
    const featureTimer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3500);

    // Animate dynamic words
    const wordTimer = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % dynamicWords.length);
    }, 2000);

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(testimonialTimer);
      clearInterval(featureTimer);
      clearInterval(wordTimer);
      observer.disconnect();
    };
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      const [featuredRes, statsRes] = await Promise.all([
        api.get('/products/featured'),
        api.get('/products/stats')
      ]);

      if (featuredRes.data.success) {
        setFeaturedProducts(featuredRes.data.products || []);
      }

      if (statsRes.data && statsRes.data.success && statsRes.data.stats) {
        setStats({
          totalProducts: statsRes.data.stats.totalProducts || 500,
          totalDownloads: statsRes.data.stats.totalDownloads || 25000,
          totalUsers: 18500,
          avgRating: 4.9
        });
      }

    } catch (error) {
      console.error('Home data error:', error);
      setStats({
        totalProducts: 500,
        totalDownloads: 25000,
        totalUsers: 18500,
        avgRating: 4.9
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (product) => {
    try {
      if (!user) {
        toast.error('Please login to download products');
        return;
      }

      await api.post(`/products/${product._id}/download`);
      window.open(product.downloadUrl, '_blank');
      toast.success('Download started successfully!');
      fetchHomeData();
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Please login to download');
    }
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  const getImageSrc = (product) => {
    const placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmOGY5ZmEiLz48cGF0aCBkPSJNMTUwIDEwMGMtMTMuODA3IDAtMjUtMTEuMTkzLTI1LTI1czExLjE5My0yNSAyNS0yNSAyNSAxMS4xOTMgMjUgMjUtMTEuMTkzIDI1LTI1IDI1ek0xMDAgMTUwaDEwMGwtMjAtMzBjLTMuMzMzLTUtOC4zMzMtNS0xMS42NjcgMEwxNDAgMTQwbC0xNi42NjctMjBjLTMuMzMzLTUtOC4zMzMtNS0xMS42NjcgMEwxMDAgMTUweiIgZmlsbD0iI2VkZjJmNyIvPjwvc3ZnPg==";
    return imageErrors[product._id] ? placeholder : product.image;
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <div className="xeriwo-home">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="floating-particles">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="particle"
              style={{
                '--delay': `${i * 0.5}s`,
                '--duration': `${8 + (i % 4) * 2}s`,
                '--size': `${2 + (i % 3)}px`
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section id="hero" className="hero-section" data-animate>
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6}>
              <div className={`hero-content ${isVisible['hero'] ? 'animate-in' : ''}`}>
                <div className="brand-badge">
                  <div className="badge-icon">⚡</div>
                  <span>XeriwoTools - WordPress Marketplace</span>
                  <div className="badge-shine"></div>
                </div>
                
                <h1 className="hero-title">
                  Build <span className="dynamic-word">{dynamicWords[currentWordIndex]}</span>
                  <br />WordPress Sites with
                  <span className="brand-highlight"> XeriwoTools</span>
                </h1>
                
                <p className="hero-subtitle">
                  Discover premium themes, plugins, and tools with our AI-powered assistant. 
                  Transform your WordPress experience with professional-grade assets.
                </p>

                {/* Enhanced Search */}
                <div className="hero-search">
                  <Form onSubmit={handleQuickSearch}>
                    <div className="search-wrapper">
                      <div className="search-input-container">
                        <i className="search-icon fas fa-search"></i>
                        <Form.Control
                          type="text"
                          placeholder="What are you looking for today?"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="search-input"
                        />
                        <div className="ai-indicator">
                          <i className="fas fa-robot"></i>
                          <span>AI</span>
                        </div>
                      </div>
                      <Button type="submit" className="search-button">
                        <span>Search</span>
                        <i className="fas fa-arrow-right"></i>
                      </Button>
                    </div>
                  </Form>
                </div>

                {/* Hero Stats */}
                <div className="hero-stats">
                  <div className="stat-card">
                    <div className="stat-number">{stats.totalProducts.toLocaleString()}+</div>
                    <div className="stat-label">Premium Products</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{stats.totalDownloads.toLocaleString()}+</div>
                    <div className="stat-label">Downloads</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{stats.totalUsers.toLocaleString()}+</div>
                    <div className="stat-label">Happy Users</div>
                  </div>
                </div>

                {/* Hero Actions */}
                <div className="hero-actions">
                  <Button as={Link} to="/products" className="btn-primary-hero">
                    <span>Explore Products</span>
                    <div className="btn-ripple"></div>
                  </Button>
                  <Button className="btn-secondary-hero" onClick={() => setShowVideoModal(true)}>
                    <i className="fas fa-play"></i>
                    <span>Watch Demo</span>
                  </Button>
                </div>
              </div>
            </Col>
            
            <Col lg={6}>
              <div className={`hero-visual ${isVisible['hero'] ? 'animate-in' : ''}`}>
                <div className="visual-container">
                  <div className="main-screen">
                    <div className="screen-header">
                      <div className="window-controls">
                        <span className="control close"></span>
                        <span className="control minimize"></span>
                        <span className="control maximize"></span>
                      </div>
                      <div className="screen-title">
                        <i className="fab fa-wordpress-simple"></i>
                        <span>XeriwoTools Dashboard</span>
                      </div>
                    </div>
                    <div className="screen-content">
                      <div className="content-grid">
                        {featuredProducts.slice(0, 6).map((product, index) => (
                          <div key={product._id} className="content-item" style={{ '--delay': `${index * 0.1}s` }}>
                            <img 
                              src={getImageSrc(product)} 
                              alt={product.title}
                              onError={() => handleImageError(product._id)}
                            />
                            <div className="item-overlay">
                              <i className="fas fa-download"></i>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="floating-ui-elements">
                    <div className="ui-element notification">
                      <i className="fas fa-bell"></i>
                      <span>New premium theme available!</span>
                    </div>
                    <div className="ui-element download">
                      <i className="fas fa-download"></i>
                      <span>Download Complete</span>
                    </div>
                    <div className="ui-element ai-chat">
                      <i className="fas fa-robot"></i>
                      <span>AI: How can I help?</span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* About Section */}
      <section id="about" className="about-section" data-animate>
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <div className={`about-content ${isVisible['about'] ? 'animate-in' : ''}`}>
                <div className="section-badge">
                  <span className="badge-text">About XeriwoTools</span>
                  <div className="badge-glow"></div>
                </div>
                <h2 className="section-title">
                  Empowering <span className="highlight">WordPress Developers</span> Since 2019
                </h2>
                <p className="about-text">
                  Founded with a vision to revolutionize WordPress development, XeriwoTools has become 
                  the trusted platform for developers, designers, and agencies worldwide. We combine 
                  cutting-edge AI technology with premium quality assets to deliver an unmatched experience.
                </p>
                <div className="about-highlights">
                  <div className="highlight-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Hand-curated premium content</span>
                  </div>
                  <div className="highlight-item">
                    <i className="fas fa-check-circle"></i>
                    <span>AI-powered intelligent assistance</span>
                  </div>
                  <div className="highlight-item">
                    <i className="fas fa-check-circle"></i>
                    <span>24/7 dedicated support team</span>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className={`company-stats-grid ${isVisible['about'] ? 'animate-in' : ''}`}>
                {companyStats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="company-stat-card"
                    style={{ '--delay': `${index * 0.2}s` }}
                  >
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-info">
                      <div className="stat-number">{stat.number}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section" data-animate>
        <Container>
          <div className={`section-header ${isVisible['features'] ? 'animate-in' : ''}`}>
            <div className="section-badge">
              <span className="badge-text">Why Choose XeriwoTools</span>
              <div className="badge-glow"></div>
            </div>
            <h2 className="section-title">
              Powerful Features for
              <span className="highlight"> Modern Developers</span>
            </h2>
          </div>

          <div className="features-grid">
            <Row>
              {features.map((feature, index) => (
                <Col lg={3} md={6} key={index}>
                  <div 
                    className={`feature-card ${activeFeature === index ? 'active' : ''} ${isVisible['features'] ? 'animate-in' : ''}`}
                    style={{ '--delay': `${index * 0.2}s` }}
                    onMouseEnter={() => setActiveFeature(index)}
                  >
                    <div className="feature-icon">{feature.icon}</div>
                    <h4 className="feature-title">{feature.title}</h4>
                    <p className="feature-description">{feature.description}</p>
                    <div className="feature-details">{feature.details}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section" data-animate>
        <Container>
          <div className={`section-header ${isVisible['pricing'] ? 'animate-in' : ''}`}>
            <div className="section-badge">
              <span className="badge-text">Flexible Pricing</span>
              <div className="badge-glow"></div>
            </div>
            <h2 className="section-title">
              Choose Your <span className="highlight">Perfect Plan</span>
            </h2>
            <p className="section-subtitle">
              Start with any plan and upgrade as you grow. All plans include lifetime access.
            </p>
          </div>

          <Row className="pricing-cards">
            {pricingPlans.map((plan, index) => (
              <Col lg={4} md={6} key={plan.id}>
                <div 
                  className={`pricing-card ${plan.popular ? 'popular' : ''} ${activePlan === plan.id ? 'active' : ''} ${isVisible['pricing'] ? 'animate-in' : ''}`}
                  style={{ '--delay': `${index * 0.2}s` }}
                  onClick={() => setActivePlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="popular-badge">
                      <i className="fas fa-crown"></i>
                      Most Popular
                    </div>
                  )}
                  
                  <div className="plan-header">
                    <h3 className="plan-name">{plan.name}</h3>
                    <div className="plan-price">
                      <span className="currency">PKR</span>
                      <span className="amount">{plan.price.toLocaleString()}</span>
                      <span className="period">/{plan.period}</span>
                    </div>
                    <div className="plan-download-limit">
                      <strong>{plan.downloads}</strong> downloads per day
                    </div>
                  </div>

                  <div className="plan-features">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="feature-item">
                        <i className="fas fa-check"></i>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button className="plan-btn">
                    {plan.popular ? 'Get Started Now' : 'Choose Plan'}
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Payment Methods Section */}
      <section id="payment" className="payment-section" data-animate>
        <Container>
          <div className={`section-header ${isVisible['payment'] ? 'animate-in' : ''}`}>
            <div className="section-badge">
              <span className="badge-text">Payment Options</span>
              <div className="badge-glow"></div>
            </div>
            <h2 className="section-title">
              Multiple <span className="highlight">Payment Methods</span>
            </h2>
            <p className="section-subtitle">
              Pay securely with your preferred method. All transactions are encrypted and protected.
            </p>
          </div>

          <Row className="payment-methods">
            {paymentMethods.map((method, index) => (
              <Col lg={3} md={6} key={method.id}>
                <div 
                  className={`payment-card ${isVisible['payment'] ? 'animate-in' : ''}`}
                  style={{ '--delay': `${index * 0.15}s` }}
                >
                  <div className="payment-icon" style={{ backgroundColor: method.color }}>
                    <span>{method.icon}</span>
                  </div>
                  <h4 className="payment-name">{method.name}</h4>
                  <p className="payment-description">{method.description}</p>
                  <div className="payment-secure">
                    <i className="fas fa-shield-check"></i>
                    <span>Secure & Encrypted</span>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

     

      {/* FAQ Section */}
      <section id="faq" className="faq-section" data-animate>
        <Container>
          <div className={`section-header ${isVisible['faq'] ? 'animate-in' : ''}`}>
            <div className="section-badge">
              <span className="badge-text">Frequently Asked</span>
              <div className="badge-glow"></div>
            </div>
            <h2 className="section-title">
              Questions & <span className="highlight">Answers</span>
            </h2>
          </div>

          <Row>
            <Col lg={8} className="mx-auto">
              <div className="faq-list">
                {faqs.map((faq, index) => (
                  <div 
                    key={index} 
                    className={`faq-item ${isVisible['faq'] ? 'animate-in' : ''}`}
                    style={{ '--delay': `${index * 0.1}s` }}
                  >
                    <div className="faq-question">
                      <h5>{faq.question}</h5>
                      <i className="fas fa-plus"></i>
                    </div>
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section id="cta" className="cta-section" data-animate>
        <Container>
          <div className={`cta-content ${isVisible['cta'] ? 'animate-in' : ''}`}>
            <div className="cta-icon">🚀</div>
            <h2>Ready to Transform Your WordPress Experience?</h2>
            <p>Join thousands of developers who trust XeriwoTools for their projects</p>
            
            <div className="cta-actions">
              {!user ? (
                <>
                  <Button as={Link} to="/register" className="btn-cta-primary">
                    Get Started Free
                  </Button>
                  <Button className="btn-cta-secondary">
                    Talk to AI Assistant
                  </Button>
                </>
              ) : (
                <Button as={Link} to="/products" className="btn-cta-primary">
                  Start Downloading
                </Button>
              )}
            </div>

            <div className="trust-badges">
              <div className="trust-item">
                <i className="fas fa-shield-check"></i>
                <span>Secure & Trusted</span>
              </div>
              <div className="trust-item">
                <i className="fas fa-infinity"></i>
                <span>Lifetime Access</span>
              </div>
              <div className="trust-item">
                <i className="fas fa-headset"></i>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Video Modal */}
      <Modal show={showVideoModal} onHide={() => setShowVideoModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>XeriwoTools Demo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="video-container">
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="XeriwoTools Demo"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </Modal.Body>
      </Modal>

      {/* Enhanced Styles */}
      <style jsx>{`
        .xeriwo-home {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #ffffff;
          color: #000000;
          overflow-x: hidden;
          position: relative;
        }
 .products-section {
    padding: 120px 0;
    background: linear-gradient(135deg, #f8f8f8 0%, #ffffff 100%);
    position: relative;
    overflow: hidden;
  }

  .products-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(0, 0, 0, 0.03) 0%, transparent 50%);
    pointer-events: none;
  }

  /* Products Showcase */
  .products-showcase {
    margin: 4rem 0;
    position: relative;
    padding: 0 20px;
  }

  .products-track {
    display: grid;
    grid-template-columns: repeat(8, minmax(280px, 1fr));
    gap: 2rem;
    padding: 2rem 0;
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .products-track::-webkit-scrollbar {
    display: none;
  }

  .product-showcase-item {
    min-width: 280px;
    opacity: 0;
    transform: translateY(30px);
    animation: productSlideIn 0.6s ease-out forwards;
    animation-delay: var(--delay);
  }

  @keyframes productSlideIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .product-showcase-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .product-showcase-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, transparent 100%);
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;
    border-radius: 20px;
  }

  .product-showcase-card:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    border-color: #000000;
  }

  .product-showcase-card:hover::before {
    opacity: 1;
  }

  /* Product Image */
  .product-image-wrapper {
    position: relative;
    height: 200px;
    overflow: hidden;
    background: linear-gradient(135deg, #f8f8f8, #e9ecef);
  }

  .product-showcase-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.4s ease;
  }

  .product-showcase-card:hover .product-showcase-image {
    transform: scale(1.1);
    filter: brightness(1.1);
  }

  /* Hover Overlay */
  .product-hover-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.3s ease;
    backdrop-filter: blur(2px);
  }

  .product-showcase-card:hover .product-hover-overlay {
    opacity: 1;
  }

  .overlay-buttons {
    display: flex;
    gap: 12px;
    transform: translateY(20px);
    transition: all 0.3s ease;
  }

  .product-showcase-card:hover .overlay-buttons {
    transform: translateY(0);
  }

  .overlay-action-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .overlay-action-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: all 0.4s ease;
  }

  .overlay-action-btn:hover::before {
    width: 100%;
    height: 100%;
  }

  .overlay-action-btn.preview {
    background: rgba(255, 255, 255, 0.9);
    color: #000000;
  }

  .overlay-action-btn.download {
    background: #000000;
    color: white;
  }

  .overlay-action-btn.favorite {
    background: rgba(220, 53, 69, 0.9);
    color: white;
  }

  .overlay-action-btn:hover {
    transform: scale(1.1);
  }

  /* Product Badges and Info */
  .product-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 2;
  }

  .type-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 4px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .type-badge.themes {
    background: rgba(52, 152, 219, 0.9);
    color: white;
  }

  .type-badge.plugins {
    background: rgba(155, 89, 182, 0.9);
    color: white;
  }

  .product-rating {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 6px 10px;
    border-radius: 15px;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 4px;
    backdrop-filter: blur(10px);
  }

  .stars-small {
    display: flex;
    gap: 2px;
  }

  .stars-small i {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .stars-small i.filled {
    color: #ffc107;
  }

  .rating-text {
    font-weight: 600;
    margin-left: 2px;
  }

  .download-counter {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: rgba(40, 167, 69, 0.9);
    color: white;
    padding: 6px 10px;
    border-radius: 15px;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    backdrop-filter: blur(10px);
  }

  /* Product Content */
  .product-showcase-content {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .product-showcase-title {
    font-size: 1.2rem;
    font-weight: 800;
    color: #000000;
    margin-bottom: 0.75rem;
    line-height: 1.3;
  }

  .product-showcase-description {
    font-size: 0.9rem;
    color: #666666;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    flex: 1;
  }

  .product-showcase-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }

  .product-price {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .price-label {
    font-size: 0.75rem;
    color: #999999;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .price-badge {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 700;
    text-align: center;
  }

  .quick-download-btn {
    background: #000000;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 25px;
    font-size: 0.85rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
  }

  .quick-download-btn:hover {
    background: #434343;
    transform: translateX(4px);
  }

  /* Products CTA Section */
  .products-cta {
    text-align: center;
    margin-top: 5rem;
    padding: 3rem 2rem;
    background: white;
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    border: 2px solid #f0f0f0;
    position: relative;
    overflow: hidden;
  }

  .products-cta::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #000000, #434343, #000000);
  }

  .products-stats {
    display: flex;
    justify-content: center;
    gap: 4rem;
    margin-bottom: 3rem;
    flex-wrap: wrap;
  }

  .products-stats .stat-item {
    text-align: center;
  }

  .products-stats .stat-number {
    display: block;
    font-size: 2rem;
    font-weight: 900;
    color: #000000;
    margin-bottom: 0.5rem;
  }

  .products-stats .stat-text {
    color: #666666;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .view-all-products-btn {
    background: #000000;
    color: white;
    border: none;
    padding: 20px 40px;
    border-radius: 60px;
    font-size: 1.2rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 16px;
    transition: all 0.4s ease;
    position: relative;
    overflow: hidden;
    margin-bottom: 2rem;
  }

  .btn-bg-effect {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: all 0.6s ease;
  }

  .view-all-products-btn:hover .btn-bg-effect {
    left: 100%;
  }

  .view-all-products-btn:hover {
    background: #434343;
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .btn-icon {
    background: rgba(255, 255, 255, 0.2);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .view-all-products-btn:hover .btn-icon {
    background: white;
    color: #000000;
    transform: rotate(45deg);
  }

  .products-note {
    color: #666666;
    font-size: 0.95rem;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .products-note i {
    color: #007bff;
  }

  /* Empty State */
  .empty-products-state {
    text-align: center;
    padding: 5rem 2rem;
  }

  .empty-illustration {
    position: relative;
    margin-bottom: 2rem;
  }

  .empty-illustration i {
    font-size: 6rem;
    color: #e9ecef;
    margin-bottom: 1rem;
  }

  .empty-particles {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  .empty-particles span {
    position: absolute;
    width: 6px;
    height: 6px;
    background: #dee2e6;
    border-radius: 50%;
    animation: emptyFloat 3s ease-in-out infinite;
  }

  .empty-particles span:nth-child(1) {
    left: -40px;
    animation-delay: 0s;
  }

  .empty-particles span:nth-child(2) {
    left: 0;
    animation-delay: 1s;
  }

  .empty-particles span:nth-child(3) {
    left: 40px;
    animation-delay: 2s;
  }

  @keyframes emptyFloat {
    0%, 100% { transform: translateY(0); opacity: 0.7; }
    50% { transform: translateY(-20px); opacity: 1; }
  }

  .empty-products-state h4 {
    font-size: 1.8rem;
    font-weight: 800;
    color: #000000;
    margin-bottom: 1rem;
  }

  .empty-products-state p {
    color: #666666;
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }

  .notify-btn {
    background: transparent;
    color: #000000;
    border: 2px solid #000000;
    padding: 12px 24px;
    border-radius: 25px;
    font-weight: 700;
    transition: all 0.3s ease;
  }

  .notify-btn:hover {
    background: #000000;
    color: white;
  }

  /* Responsive Design for Products */
  @media (max-width: 1400px) {
    .products-track {
      grid-template-columns: repeat(6, minmax(280px, 1fr));
    }
  }

  @media (max-width: 1200px) {
    .products-track {
      grid-template-columns: repeat(4, minmax(280px, 1fr));
    }
  }

  @media (max-width: 992px) {
    .products-track {
      grid-template-columns: repeat(3, minmax(260px, 1fr));
      gap: 1.5rem;
    }

    .product-showcase-item {
      min-width: 260px;
    }

    .products-stats {
      gap: 2rem;
    }
  }

  @media (max-width: 768px) {
    .products-track {
      grid-template-columns: repeat(2, minmax(240px, 1fr));
      gap: 1rem;
      padding: 1rem 0;
    }

    .product-showcase-item {
      min-width: 240px;
    }

    .products-showcase {
      padding: 0 10px;
    }

    .products-stats {
      flex-direction: column;
      gap: 1.5rem;
    }

    .view-all-products-btn {
      padding: 16px 32px;
      font-size: 1rem;
    }

    .products-cta {
      padding: 2rem 1rem;
    }
  }

  @media (max-width: 576px) {
    .products-track {
      grid-template-columns: repeat(1, 1fr);
      justify-items: center;
    }

    .product-showcase-item {
      min-width: 280px;
      max-width: 100%;
    }

    .overlay-buttons {
      gap: 8px;
    }

    .overlay-action-btn {
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }

    .view-all-products-btn {
      width: 100%;
      max-width: 300px;
      justify-content: center;
    }
  }

  /* Scroll Indicators for Mobile */
  @media (max-width: 992px) {
    .products-showcase::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 4px;
      background: linear-gradient(90deg, transparent, #000000, transparent);
      border-radius: 2px;
    }
  }
        /* Animated Background */
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
        }

        .floating-particles {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .particle {
          position: absolute;
          background: linear-gradient(135deg, #000000, #434343);
          border-radius: 50%;
          width: var(--size);
          height: var(--size);
          animation: float var(--duration) ease-in-out infinite var(--delay);
          opacity: 0.1;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.1;
          }
          25% {
            transform: translateY(-100px) rotate(90deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-200px) rotate(180deg);
            opacity: 0.1;
          }
          75% {
            transform: translateY(-100px) rotate(270deg);
            opacity: 0.3;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-in {
          animation: fadeInUp 0.8s ease-out forwards;
          animation-delay: var(--delay, 0s);
        }

        /* Hero Section */
        .hero-section {
          min-height: 100vh;
          background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
          position: relative;
          display: flex;
          align-items: center;
          padding: 80px 0;
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: #000000;
          color: white;
          padding: 12px 24px;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
        }

        .badge-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: shimmer 2s ease-in-out infinite;
        }

        .hero-title {
          font-size: 4.5rem;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 2rem;
          color: #000000;
        }

        .dynamic-word {
          color: #434343;
          position: relative;
          display: inline-block;
          animation: fadeInUp 0.5s ease-out;
        }

        .brand-highlight {
          background: linear-gradient(135deg, #000000 0%, #434343 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        .brand-highlight::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(135deg, #000000 0%, #434343 100%);
          border-radius: 2px;
        }

        .hero-subtitle {
          font-size: 1.4rem;
          color: #666666;
          line-height: 1.7;
          margin-bottom: 3rem;
          max-width: 500px;
        }

        /* Enhanced Search */
        .hero-search {
          margin-bottom: 3rem;
        }

        .search-wrapper {
          display: flex;
          background: #ffffff;
          border: 2px solid #f0f0f0;
          border-radius: 60px;
          padding: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          transition: all 0.3s ease;
        }

        .search-wrapper:focus-within {
          border-color: #000000;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }

        .search-input-container {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 24px;
          color: #999999;
          font-size: 1.1rem;
          z-index: 2;
        }

        .search-input {
          flex: 1;
          border: none;
          background: none;
          padding: 20px 24px 20px 60px;
          font-size: 1.1rem;
          outline: none;
          color: #000000;
          font-weight: 500;
        }

        .search-input::placeholder {
          color: #999999;
        }

        .ai-indicator {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: #000000;
          color: white;
          padding: 8px 16px;
          border-radius: 25px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .search-button {
          background: #000000;
          color: white;
          border: none;
          padding: 18px 32px;
          border-radius: 50px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
        }

        .search-button:hover {
          background: #434343;
          transform: translateX(4px);
        }

        /* Hero Stats */
        .hero-stats {
          display: flex;
          gap: 3rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .stat-card {
          text-align: center;
          padding: 1.5rem;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
          transition: all 0.3s ease;
          min-width: 120px;
        }

        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 900;
          color: #000000;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #666666;
          font-weight: 600;
        }

        /* Hero Actions */
        .hero-actions {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .btn-primary-hero {
          background: #000000;
          color: white;
          border: none;
          padding: 20px 40px;
          border-radius: 60px;
          font-weight: 700;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .btn-primary-hero:hover {
          background: #434343;
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }

        .btn-secondary-hero {
          background: transparent;
          color: #000000;
          border: 2px solid #000000;
          padding: 18px 36px;
          border-radius: 60px;
          font-weight: 700;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
        }

        .btn-secondary-hero:hover {
          background: #000000;
          color: white;
          transform: translateY(-3px);
        }

        /* Hero Visual */
        .hero-visual {
          position: relative;
          z-index: 2;
        }

        .visual-container {
          position: relative;
          max-width: 500px;
          margin: 0 auto;
        }

        .main-screen {
          background: #1a1a1a;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
          border: 1px solid #333333;
          transform: perspective(1000px) rotateY(-10deg) rotateX(5deg);
          transition: all 0.3s ease;
        }

        .main-screen:hover {
          transform: perspective(1000px) rotateY(-5deg) rotateX(2deg);
        }

        .screen-header {
          background: #2a2a2a;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid #333333;
        }

        .window-controls {
          display: flex;
          gap: 8px;
        }

        .control {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .control:hover {
          transform: scale(1.3);
        }

        .control.close { background: #ff5f57; }
        .control.minimize { background: #ffbd2e; }
        .control.maximize { background: #28ca42; }

        .screen-title {
          color: #ffffff;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .screen-content {
          padding: 30px;
          background: #f8f8f8;
          min-height: 300px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          height: 100%;
        }

        .content-item {
          aspect-ratio: 4/3;
          border-radius: 16px;
          overflow: hidden;
          background: white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          position: relative;
          transition: all 0.3s ease;
          animation: fadeInUp 0.6s ease-out forwards var(--delay);
        }

        .content-item:hover {
          transform: translateY(-8px) scale(1.05);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
        }

        .content-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .content-item:hover .item-overlay {
          opacity: 1;
        }

        /* Floating UI Elements */
        .floating-ui-elements {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .ui-element {
          position: absolute;
          background: white;
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #000000;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border: 1px solid #f0f0f0;
          animation: float 6s ease-in-out infinite;
        }

        .ui-element.notification {
          top: 20%;
          left: -40px;
          animation-delay: 0s;
        }

        .ui-element.download {
          top: 50%;
          right: -60px;
          animation-delay: 2s;
        }

        .ui-element.ai-chat {
          bottom: 30%;
          left: -50px;
          animation-delay: 4s;
        }

        /* About Section */
        .about-section {
          padding: 120px 0;
          background: white;
        }

        .about-content {
          padding-right: 2rem;
        }

        .about-text {
          font-size: 1.2rem;
          line-height: 1.8;
          color: #666666;
          margin-bottom: 2.5rem;
        }

        .about-highlights {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .highlight-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #000000;
        }

        .highlight-item i {
          color: #28a745;
          font-size: 1.2rem;
        }

        .company-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          padding: 2rem;
        }

        .company-stat-card {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          border: 2px solid #f0f0f0;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: all 0.3s ease;
        }

        .company-stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
          border-color: #000000;
        }

        .stat-icon {
          font-size: 3rem;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f8f8;
          border-radius: 16px;
        }

        /* Sections */
        .features-section,
        .pricing-section,
        .payment-section,
        .products-section,
        .testimonials-section,
        .faq-section {
          padding: 120px 0;
        }

        .features-section {
          background: #f8f8f8;
        }

        .pricing-section {
          background: white;
        }

        .payment-section {
          background: #f8f8f8;
        }

        .products-section {
          background: white;
        }

        .testimonials-section {
          background: #f8f8f8;
        }

        .faq-section {
          background: white;
        }

        /* Section Header */
        .section-header {
          text-align: center;
          margin-bottom: 5rem;
        }

        .section-badge {
          display: inline-flex;
          align-items: center;
          background: #000000;
          color: white;
          padding: 12px 28px;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
        }

        .badge-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 3s ease-in-out infinite;
        }

        .section-title {
          font-size: 3.5rem;
          font-weight: 900;
          color: #000000;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .highlight {
          background: linear-gradient(135deg, #434343 0%, #000000 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-subtitle {
          font-size: 1.3rem;
          color: #666666;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* Features Grid */
        .features-grid {
          margin-top: 4rem;
        }

        .feature-card {
          background: white;
          border-radius: 24px;
          padding: 3rem 2rem;
          height: 100%;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          border: 2px solid #f0f0f0;
          transition: all 0.4s ease;
          margin-bottom: 2rem;
          text-align: center;
        }

        .feature-card:hover,
        .feature-card.active {
          transform: translateY(-12px);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
          border-color: #000000;
        }

        .feature-icon {
          font-size: 4rem;
          margin-bottom: 2rem;
          display: block;
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #000000;
          margin-bottom: 1rem;
        }

        .feature-description {
          color: #666666;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .feature-details {
          font-size: 0.9rem;
          color: #999999;
          font-weight: 600;
        }

        /* Pricing Cards */
        .pricing-cards {
          margin-top: 4rem;
        }

        .pricing-card {
          background: white;
          border-radius: 24px;
          padding: 3rem 2rem;
          border: 2px solid #f0f0f0;
          position: relative;
          cursor: pointer;
          transition: all 0.4s ease;
          margin-bottom: 2rem;
          height: 100%;
        }

        .pricing-card:hover,
        .pricing-card.active {
          transform: translateY(-12px);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
          border-color: #000000;
        }

        .pricing-card.popular {
          border-color: #000000;
          background: linear-gradient(135deg, #f8f8f8 0%, #ffffff 100%);
        }

        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #000000;
          color: white;
          padding: 8px 24px;
          border-radius: 25px;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .plan-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .plan-name {
          font-size: 1.5rem;
          font-weight: 800;
          color: #000000;
          margin-bottom: 1rem;
        }

        .plan-price {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 4px;
          margin-bottom: 1rem;
        }

        .currency {
          font-size: 1.2rem;
          color: #666666;
          font-weight: 600;
        }

        .amount {
          font-size: 3.5rem;
          font-weight: 900;
          color: #000000;
        }

        .period {
          font-size: 1.2rem;
          color: #666666;
          font-weight: 600;
        }

        .plan-download-limit {
          background: #f8f8f8;
          padding: 12px 24px;
          border-radius: 25px;
          font-size: 1rem;
          color: #666666;
        }

        .plan-features {
          margin-bottom: 3rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .feature-item:last-child {
          border-bottom: none;
        }

        .feature-item i {
          color: #28a745;
          font-size: 1rem;
        }

        .plan-btn {
          width: 100%;
          background: #000000;
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .plan-btn:hover {
          background: #434343;
          transform: translateY(-2px);
        }

        /* Payment Methods */
        .payment-methods {
          margin-top: 4rem;
        }

        .payment-card {
          background: white;
          border-radius: 20px;
          padding: 2.5rem 2rem;
          text-align: center;
          border: 2px solid #f0f0f0;
          transition: all 0.3s ease;
          height: 100%;
          margin-bottom: 2rem;
        }

        .payment-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
          border-color: #000000;
        }

        .payment-icon {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin: 0 auto 1.5rem;
          color: white;
        }

        .payment-name {
          font-size: 1.3rem;
          font-weight: 800;
          color: #000000;
          margin-bottom: 1rem;
        }

        .payment-description {
          color: #666666;
          margin-bottom: 1.5rem;
        }

        .payment-secure {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #28a745;
          font-weight: 600;
        }

        /* Products */
        .loading-container {
          text-align: center;
          padding: 4rem 0;
        }

        .loading-spinner {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 2rem;
        }

        .spinner-ring {
          width: 16px;
          height: 16px;
          border: 3px solid #f0f0f0;
          border-top: 3px solid #000000;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .spinner-ring:nth-child(2) { animation-delay: 0.1s; }
        .spinner-ring:nth-child(3) { animation-delay: 0.2s; }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .products-grid {
          margin-top: 4rem;
        }

        .product-card {
          border: none;
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.4s ease;
          background: white;
          height: 100%;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 2px solid #f0f0f0;
          margin-bottom: 2rem;
        }

        .product-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
          border-color: #000000;
        }

        .product-image-container {
          position: relative;
          height: 220px;
          overflow: hidden;
          background: #f8f8f8;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.4s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.1);
        }

        .product-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .product-card:hover .product-overlay {
          opacity: 1;
        }

        .overlay-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .preview-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .download-btn {
          background: white;
          color: #000000;
        }

        .overlay-btn:hover {
          transform: scale(1.15);
        }

        .product-body {
          padding: 2rem 1.5rem;
        }

        .product-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .category-badge {
          padding: 6px 16px;
          border-radius: 25px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .category-badge.themes {
          background: #f0f0f0;
          color: #000000;
        }

        .category-badge.plugins {
          background: #434343;
          color: white;
        }

        .download-count {
          font-size: 0.8rem;
          color: #666666;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .product-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #000000;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }

        .product-description {
          font-size: 0.95rem;
          color: #666666;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .product-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-preview {
          flex: 1;
          background: transparent;
          color: #000000;
          border: 2px solid #f0f0f0;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }

        .btn-preview:hover {
          border-color: #000000;
          background: #000000;
          color: white;
        }

        .btn-download {
          flex: 1;
          background: #000000;
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }

        .btn-download:hover {
          background: #434343;
          transform: translateY(-2px);
        }

        .section-footer {
          text-align: center;
          margin-top: 4rem;
        }

        .btn-view-all {
          background: #000000;
          color: white;
          border: none;
          padding: 20px 40px;
          border-radius: 60px;
          font-weight: 700;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .btn-view-all:hover {
          background: #434343;
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }

        /* Testimonials */
        .testimonial-carousel {
          max-width: 900px;
          margin: 0 auto;
        }

        .testimonial-card {
          background: white;
          border-radius: 24px;
          padding: 3rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
          text-align: center;
          border: 2px solid #f0f0f0;
        }

        .stars {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-bottom: 2rem;
        }

        .stars i {
          color: #ffc107;
          font-size: 1.3rem;
        }

        .testimonial-text {
          font-size: 1.3rem;
          line-height: 1.7;
          color: #000000;
          margin-bottom: 2.5rem;
          font-weight: 500;
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }

        .author-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #f0f0f0;
        }

        .author-info {
          text-align: left;
        }

        .author-info h5 {
          font-size: 1.3rem;
          font-weight: 800;
          color: #000000;
          margin-bottom: 0.5rem;
        }

        .author-info p {
          font-size: 1rem;
          color: #666666;
          margin: 0 0 0.5rem 0;
        }

        .plan-badge {
          background: #000000;
          color: white;
          font-size: 0.75rem;
          padding: 4px 12px;
          border-radius: 15px;
        }

        .testimonial-navigation {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 3rem;
        }

        .nav-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: none;
          background: #f0f0f0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-dot.active {
          background: #000000;
          transform: scale(1.3);
        }

        /* FAQ Section */
        .faq-list {
          margin-top: 3rem;
        }

        .faq-item {
          background: white;
          border-radius: 16px;
          margin-bottom: 1.5rem;
          border: 2px solid #f0f0f0;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .faq-item:hover {
          border-color: #000000;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        }

        .faq-question {
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          background: white;
        }

        .faq-question h5 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 700;
          color: #000000;
        }

        .faq-question i {
          color: #666666;
          transition: all 0.3s ease;
        }

        .faq-answer {
          padding: 0 2rem 2rem;
          background: #f8f8f8;
        }

        .faq-answer p {
          margin: 0;
          color: #666666;
          line-height: 1.6;
        }

        /* CTA Section */
        .cta-section {
          padding: 120px 0;
          background: #000000;
          color: white;
          text-align: center;
        }

        .cta-icon {
          width: 120px;
          height: 120px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: white;
          margin: 0 auto 2.5rem;
        }

        .cta-content h2 {
          font-size: 3.5rem;
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .cta-content p {
          font-size: 1.4rem;
          opacity: 0.9;
          margin-bottom: 3rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-actions {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 4rem;
          flex-wrap: wrap;
        }

        .btn-cta-primary {
          background: white;
          color: #000000;
          border: none;
          padding: 20px 40px;
          border-radius: 60px;
          font-weight: 700;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .btn-cta-primary:hover {
          background: #f0f0f0;
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(255, 255, 255, 0.2);
        }

        .btn-cta-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
          padding: 18px 36px;
          border-radius: 60px;
          font-weight: 700;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .btn-cta-secondary:hover {
          background: white;
          color: #000000;
          transform: translateY(-3px);
        }

        .trust-badges {
          display: flex;
          justify-content: center;
          gap: 3rem;
          flex-wrap: wrap;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          font-size: 1rem;
        }

        .trust-item i {
          font-size: 1.5rem;
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #666666;
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 2rem;
          opacity: 0.5;
        }

        /* Video Modal */
        .video-container {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%;
        }

        .video-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .hero-title {
            font-size: 3.8rem;
          }
          
          .section-title {
            font-size: 3rem;
          }
          
          .visual-container {
            margin-top: 3rem;
          }

          .main-screen {
            transform: none;
          }

          .company-stats-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 992px) {
          .hero-title {
            font-size: 3.2rem;
          }

          .section-title {
            font-size: 2.5rem;
          }

          .hero-content {
            margin-bottom: 3rem;
          }

          .floating-ui-elements {
            display: none;
          }

          .testimonial-author {
            flex-direction: column;
          }

          .author-info {
            text-align: center;
          }

          .cta-actions {
            flex-direction: column;
            align-items: center;
          }

          .about-content {
            padding-right: 0;
            margin-bottom: 3rem;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .hero-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .search-wrapper {
            flex-direction: column;
            gap: 12px;
            border-radius: 20px;
          }

          .search-button {
            justify-content: center;
            border-radius: 12px;
          }

          .ai-indicator {
            position: relative;
            right: auto;
            top: auto;
            transform: none;
            margin-top: 8px;
            align-self: flex-start;
          }

          .hero-stats {
            justify-content: center;
          }

          .trust-badges {
            gap: 1.5rem;
          }

          .trust-item {
            flex-direction: column;
            text-align: center;
            gap: 8px;
          }

          .cta-content h2 {
            font-size: 2.5rem;
          }

          .btn-cta-primary,
          .btn-cta-secondary {
            width: 100%;
            max-width: 320px;
            justify-content: center;
          }

          .company-stats-grid {
            grid-template-columns: 1fr;
          }

          .company-stat-card {
            flex-direction: column;
            text-align: center;
          }

          .plan-price .amount {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 576px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-stats {
            flex-direction: column;
            align-items: center;
          }

          .stat-card {
            width: 100%;
            max-width: 200px;
          }

          .testimonial-card {
            padding: 2rem;
          }

          .testimonial-text {
            font-size: 1.1rem;
          }

          .trust-badges {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }

          .content-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .plan-price .amount {
            font-size: 2rem;
          }

          .faq-question {
            padding: 1.5rem;
          }

          .faq-answer {
            padding: 0 1.5rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
