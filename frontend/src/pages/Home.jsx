// pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Modal, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import './Home.css';

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
  const [downloadingProducts, setDownloadingProducts] = useState({});
  const [activeFaq, setActiveFaq] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Animated text words
  const dynamicWords = ['Premium', 'Professional', 'Modern', 'Creative', 'Responsive'];

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
    { number: "2024", label: "Founded", icon: "🚀" },
    { number: "1K+", label: "Happy Customers", icon: "😊" },
    { number: "99.9%", label: "Uptime", icon: "⚡" },
    { number: "24/7", label: "Support", icon: "📞" }
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

    const sections = document.querySelectorAll('[data-scroll-animate]');
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
      
      let featuredProducts = [];
      
      try {
        const featuredRes = await api.get('/products/featured');
        if (featuredRes.data.success && featuredRes.data.products) {
          featuredProducts = featuredRes.data.products;
        }
      } catch (featuredError) {
        console.log('Featured endpoint failed, trying general products...');
      }
      
      if (featuredProducts.length === 0) {
        try {
          const productsRes = await api.get('/products?limit=6');
          if (productsRes.data.success && productsRes.data.products) {
            featuredProducts = productsRes.data.products.slice(0, 6);
          }
        } catch (productsError) {
          console.log('Products endpoint also failed');
        }
      }
      
      setFeaturedProducts(featuredProducts);

      try {
        const statsRes = await api.get('/products/stats');
        if (statsRes.data && statsRes.data.success && statsRes.data.stats) {
          setStats({
            totalProducts: statsRes.data.stats.totalProducts || 500,
            totalDownloads: statsRes.data.stats.totalDownloads || 25000,
            totalUsers: 18500,
            avgRating: 4.9
          });
        }
      } catch (statsError) {
        setStats({
          totalProducts: 500,
          totalDownloads: 25000,
          totalUsers: 18500,
          avgRating: 4.9
        });
      }

    } catch (error) {
      console.error('Home data error:', error);
      setFeaturedProducts([]);
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
        toast.error('🔒 Please login to download products');
        return;
      }

      setDownloadingProducts(prev => ({ ...prev, [product._id]: true }));

      const response = await api.post(`/download/${product._id}`);
      
      if (response.data.success) {
        if (response.data.isRedownload) {
          toast.info(response.data.message);
        } else {
          toast.success(response.data.message);
        }
        
        if (response.data.downloadUrl) {
          window.open(response.data.downloadUrl, '_blank');
        }
        
        setFeaturedProducts(prev => prev.map(p => 
          p._id === product._id 
            ? { ...p, downloads: (p.downloads || 0) + 1 }
            : p
        ));
      }

    } catch (error) {
      console.error('Download error:', error);
      
      if (error.response?.status === 429) {
        const errorData = error.response.data;
        
        if (errorData.limits) {
          const { daily, monthly } = errorData.limits;
          
          if (daily.remaining <= 0) {
            toast.error(`📅 Daily limit reached! Used ${daily.used}/${daily.limit}. Try tomorrow!`);
          } else if (monthly.remaining <= 0) {
            toast.error(`📊 Monthly limit reached! Used ${monthly.used}/${monthly.limit}.`);
          }
        } else {
          toast.error('⏱️ Download limit reached. Please wait and try again.');
        }
      } else if (error.response?.status === 401) {
        toast.error('🔒 Please login to download products');
      } else if (error.response?.status === 403) {
        toast.error('📧 Please verify your email to download products');
      } else if (error.response?.status === 404) {
        toast.error('❌ Product not found');
      } else {
        toast.error('❌ Download failed. Please try again.');
      }
    } finally {
      setDownloadingProducts(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: true
    }));
  };64,"PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmOGY5ZmEiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSIjZGVlMmU2Ii8+PHBhdGggZD0ibTEzMCA4MCAyMC0yMCAxMCAxMCAyMC0yMCAxMCAxMHY0MEgxMzBWODBaIiBmaWxsPSIjOWNhM2FmIi8+PHRleHQgeD0iMTUwIiB5PSIxNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Yjc0ODAiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWkiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

  const getImageSrc = (product) => {
    if (imageErrors[product._id]) {
      return placeholder;
    }
    return product.imageUrl || product.image || placeholder;
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="xeriwo-homepage">
      {/* Enhanced Hero Section */}
      <section id="homepage-hero" className="xeriwo-hero-wrapper" data-scroll-animate>
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={12}>
              <div className={`xeriwo-hero-content ${isVisible['homepage-hero'] ? 'content-visible' : ''}`}>
                {/* Premium Badge */}
                <div className="xeriwo-premium-badge">
                  <span className="badge-sparkle">✨</span>
                  <span className="badge-label">Premium WordPress Solutions</span>
                </div>

                {/* Main Hero Title */}
                <h1 className="xeriwo-hero-title">
                  Build <span className="xeriwo-dynamic-word">{dynamicWords[currentWordIndex]}</span>
                  <br />
                  <span className="xeriwo-gradient-text">WordPress Websites</span>
                  <br />
                  with <span className="xeriwo-brand-accent">XeriwoTools</span>
                </h1>
                
                {/* Enhanced Subtitle */}
                <p className="xeriwo-hero-subtitle">
                  Discover premium themes, plugins, and tools with our AI-powered assistant.
                  <br />
                 
                </p>

              

                {/* Enhanced Search Bar */}
                <Form onSubmit={handleQuickSearch} className="xeriwo-hero-search">
                  <InputGroup className="search-input-group">
                    <Form.Control
                      type="text"
                      placeholder="Search for themes, plugins, or tools..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <Button type="submit" className="search-submit-btn">
                      <i className="fas fa-search"></i>
                      Search
                    </Button>
                  </InputGroup>
                </Form>

                {/* CTA Buttons */}
              

                {/* Trust Indicators */}
               
              </div>
            </Col>
          </Row>
        </Container>

        {/* Background Elements */}
        <div className="xeriwo-hero-bg-elements">
          <div className="hero-bg-circle hero-bg-circle-1"></div>
          <div className="hero-bg-circle hero-bg-circle-2"></div>
          <div className="hero-bg-circle hero-bg-circle-3"></div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="homepage-products" className="xeriwo-featured-wrapper" data-scroll-animate>
        <Container>
          <div className={`xeriwo-section-header ${isVisible['homepage-products'] ? 'header-visible' : ''}`}>
            <div className="xeriwo-section-badge">
              <span className="section-badge-text">Featured Products</span>
              <div className="section-badge-glow"></div>
            </div>
            <h2 className="xeriwo-section-title">
              Hand-picked <span className="title-highlight">Premium Assets</span>
            </h2>
            <p className="xeriwo-section-subtitle">
              Discover our most popular and highest-rated WordPress products
            </p>
          </div>

          {loading ? (
            <div className="xeriwo-products-loading">
              <Row>
                {[...Array(6)].map((_, index) => (
                  <Col lg={4} md={6} key={index} className="mb-4">
                    <Card className="xeriwo-product-skeleton">
                      <div className="skeleton-image-box"></div>
                      <Card.Body>
                        <div className="skeleton-title-box"></div>
                        <div className="skeleton-text-box"></div>
                        <div className="skeleton-button-box"></div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ) : featuredProducts.length > 0 ? (
            <Row className="xeriwo-products-grid">
              {featuredProducts.map((product, index) => (
                <Col lg={4} md={6} key={product._id} className="mb-4">
                  <Card 
                    className={`xeriwo-product-card ${isVisible['homepage-products'] ? 'card-visible' : ''}`}
                    style={{ '--animation-delay': `${index * 0.1}s` }}
                  >
                    {/* Product Image */}
                    <div className="xeriwo-product-image-wrapper">
                      <img
                        src={getImageSrc(product)}
                        alt={product.title || 'Product'}
                        className="xeriwo-product-image"
                        onError={() => handleImageError(product._id)}
                        loading="lazy"
                      />
                      
                      {/* Overlay */}
                      <div className="xeriwo-product-overlay">
                        <Button
                          variant="light"
                          className="xeriwo-overlay-btn"
                          onClick={() => window.open(product.previewUrl || '#', '_blank')}
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                      </div>

                      {/* Category Badge */}
                      {product.category && (
                        <Badge className="xeriwo-product-category">
                          {product.category}
                        </Badge>
                      )}
                    </div>

                    {/* Product Info */}
                    <Card.Body className="xeriwo-product-body">
                      <h5 className="xeriwo-product-title" style={{color:"black"}} title={product.title}>
                        {product.title && product.title.length > 40 
                          ? `${product.title.substring(0, 40)}...` 
                          : (product.title || 'Untitled Product')
                        }
                      </h5>

                      {/* Action Buttons */}
                      <div className="xeriwo-product-actions">
                        <Button
                          variant="outline-primary"
                          className="xeriwo-preview-btn"
                          onClick={() => window.open(product.previewUrl || '#', '_blank')}
                        >
                          <i className="fas fa-external-link-alt me-1"></i>
                          Preview
                        </Button>
                        
                        <Button
                          variant="primary"
                          className="xeriwo-download-btn"
                          onClick={() => handleDownload(product)}
                          disabled={downloadingProducts[product._id]}
                        >
                          {downloadingProducts[product._id] ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1"></span>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-download me-1"></i>
                              Download
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Login Notice */}
                      {!user && (
                        <div className="xeriwo-login-notice">
                          <i className="fas fa-lock me-1"></i>
                          Login required for download
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="xeriwo-no-products">
              <div className="no-products-icon-box">
                <i className="fas fa-box-open"></i>
              </div>
              <h4>No Featured Products</h4>
              <p>Featured products will appear here once they're available.</p>
              <Button as={Link} to="/products" variant="primary">
                Browse All Products
              </Button>
            </div>
          )}

          {/* View All Button */}
          {featuredProducts.length > 0 && (
            <div className="text-center mt-5">
              <Button as={Link} to="/products" size="lg" className="xeriwo-view-all-btn">
                View All Products
                <i className="fas fa-arrow-right ms-2"></i>
              </Button>
            </div>
          )}
        </Container>
      </section>

      {/* About Section */}
      <section id="homepage-about" className="xeriwo-about-wrapper" data-scroll-animate>
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <div className={`xeriwo-about-content ${isVisible['homepage-about'] ? 'about-visible' : ''}`}>
                <div className="xeriwo-section-badge">
                  <span className="section-badge-text">About Us</span>
                  <div className="section-badge-glow"></div>
                </div>
                <h2 className="xeriwo-section-title">
                  Empowering <span className="title-highlight">WordPress Developers</span> Since 2024
                </h2>
                <p className="xeriwo-about-text">
                  Founded with a vision to revolutionize WordPress development, XeriwoTools has become 
                  the trusted platform for developers, designers, and agencies worldwide. We combine 
                  cutting-edge AI technology with premium quality assets to deliver an unmatched experience.
                </p>
                <div className="xeriwo-about-features">
                  <div className="about-feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Premium Quality Assurance</span>
                  </div>
                  <div className="about-feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>AI-Powered Recommendations</span>
                  </div>
                  <div className="about-feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>24/7 Customer Support</span>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className={`xeriwo-stats-grid ${isVisible['homepage-about'] ? 'stats-visible' : ''}`}>
                {companyStats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="xeriwo-stat-card"
                    style={{ '--stat-delay': `${index * 0.2}s` }}
                  >
                    <div className="stat-icon-wrapper">{stat.icon}</div>
                    <div className="stat-info-wrapper">
                      <div className="stat-number-display">{stat.number}</div>
                      <div className="stat-label-display">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section id="homepage-features" className="xeriwo-features-wrapper" data-scroll-animate>
        <Container>
          <div className={`xeriwo-section-header ${isVisible['homepage-features'] ? 'header-visible' : ''}`}>
            <div className="xeriwo-section-badge">
              <span className="section-badge-text">Why Choose XeriwoTools</span>
              <div className="section-badge-glow"></div>
            </div>
            <h2 className="xeriwo-section-title">
              Powerful Features for
              <span className="title-highlight"> Modern Developers</span>
            </h2>
          </div>

          <div className="xeriwo-features-grid">
            <Row>
              {features.map((feature, index) => (
                <Col lg={3} md={6} key={index}>
                  <div 
                    className={`xeriwo-feature-card ${activeFeature === index ? 'feature-active' : ''} ${isVisible['homepage-features'] ? 'feature-visible' : ''}`}
                    style={{ '--feature-delay': `${index * 0.2}s` }}
                    onMouseEnter={() => setActiveFeature(index)}
                  >
                    <div className="xeriwo-feature-icon">{feature.icon}</div>
                    <h4 className="xeriwo-feature-title">{feature.title}</h4>
                    <p className="xeriwo-feature-description">{feature.description}</p>
                    <div className="xeriwo-feature-details">{feature.details}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </section>

    
     
      {/* Payment Methods Section */}
      <section id="homepage-payment" className="xeriwo-payment-wrapper" data-scroll-animate>
        <Container>
          <div className={`xeriwo-section-header ${isVisible['homepage-payment'] ? 'header-visible' : ''}`}>
            <div className="xeriwo-section-badge">
              <span className="section-badge-text">Payment Options</span>
              <div className="section-badge-glow"></div>
            </div>
            <h2 className="xeriwo-section-title">
              Multiple <span className="title-highlight">Payment Methods</span>
            </h2>
            <p className="xeriwo-section-subtitle">
              Pay securely with your preferred method. All transactions are encrypted and protected.
            </p>
          </div>

          <Row className="xeriwo-payment-methods">
            {paymentMethods.map((method, index) => (
              <Col lg={3} md={6} key={method.id}>
                <div 
                  className={`xeriwo-payment-card ${isVisible['homepage-payment'] ? 'payment-visible' : ''}`}
                  style={{ '--payment-delay': `${index * 0.15}s` }}
                >
                  <div className="payment-icon-wrapper" style={{ backgroundColor: method.color }}>
                    <span>{method.icon}</span>
                  </div>
                  <h4 className="payment-method-name">{method.name}</h4>
                  <p className="payment-method-description">{method.description}</p>
                  <div className="payment-security-badge">
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
      <section id="homepage-faq" className="xeriwo-faq-wrapper" data-scroll-animate>
        <Container>
          <div className={`xeriwo-section-header ${isVisible['homepage-faq'] ? 'header-visible' : ''}`}>
            <div className="xeriwo-section-badge">
              <span className="section-badge-text">Frequently Asked</span>
              <div className="section-badge-glow"></div>
            </div>
            <h2 className="xeriwo-section-title">
              Questions & <span className="title-highlight">Answers</span>
            </h2>
          </div>

          <Row>
            <Col lg={8} className="mx-auto">
              <div className="xeriwo-faq-list">
                {faqs.map((faq, index) => (
                  <div 
                    key={index} 
                    className={`xeriwo-faq-item ${activeFaq === index ? 'faq-active' : ''} ${isVisible['homepage-faq'] ? 'faq-visible' : ''}`}
                    style={{ '--faq-delay': `${index * 0.1}s` }}
                  >
                    <div 
                      className="xeriwo-faq-question"
                      onClick={() => toggleFaq(index)}
                    >
                      <h5>{faq.question}</h5>
                      <i className={`fas fa-${activeFaq === index ? 'minus' : 'plus'}`}></i>
                    </div>
                    <div className="xeriwo-faq-answer">
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
      <section id="homepage-cta" className="xeriwo-cta-wrapper" data-scroll-animate>
        <Container>
          <div className={`xeriwo-cta-content ${isVisible['homepage-cta'] ? 'cta-visible' : ''}`}>
            <div className="cta-icon-display">🚀</div>
            <h2>Ready to Transform Your WordPress Experience?</h2>
            <p>Join thousands of developers who trust XeriwoTools for their projects</p>
            
            <div className="xeriwo-cta-actions">
              {!user ? (
                <>
                  <Button as={Link} to="/register" className="xeriwo-cta-primary">
                    Get Started Free
                  </Button>
                  <Button variant="outline-light" className="xeriwo-cta-secondary">
                    Talk to AI Assistant
                  </Button>
                </>
              ) : (
                <Button as={Link} to="/products" className="xeriwo-cta-primary">
                  Start Downloading
                </Button>
              )}
            </div>

            <div className="xeriwo-trust-badges">
              <div className="trust-badge-item">
                <i className="fas fa-shield-check"></i>
                <span>Secure & Trusted</span>
              </div>
              <div className="trust-badge-item">
                <i className="fas fa-infinity"></i>
                <span>Lifetime Access</span>
              </div>
              <div className="trust-badge-item">
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
          <div className="xeriwo-video-container">
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
    </div>
  );
};

export default Home;