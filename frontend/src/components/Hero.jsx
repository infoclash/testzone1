import React from 'react'

const Hero = () => {
  return (
    <div><section id="hero-main" className="main-hero-section" data-animate>
  <Container>
    <Row className="align-items-center min-vh-100">
      <Col lg={12}>
        <div className={`main-hero-content ${isVisible['hero'] ? 'fade-slide-in' : ''}`}>
          {/* Premium Badge */}
          <div className="premium-badge">
            <span className="badge-icon">✨</span>
            <span className="badge-text">Premium WordPress Solutions</span>
          </div>

          {/* Main Hero Title */}
          <h1 className="main-hero-title">
            Build <span className="rotating-word">{dynamicWords[currentWordIndex]}</span>
            <br />
            <span className="gradient-text">WordPress Websites</span>
            <br />
            with <span className="brand-accent" style={{color:"#ff5722"}}>XeriwoTools</span>
          </h1>
          
          {/* Enhanced Subtitle */}
          <p className="main-hero-subtitle">
            Discover premium themes, plugins, and tools with our AI-powered assistant.
            <br />
            <span className="subtitle-accent">Transform your WordPress experience with professional-grade assets.</span>
          </p>

          {/* Feature Highlights */}
          <div className="hero-features">
            <div className="feature-item">
              <div className="feature-icon">🚀</div>
              <span>AI-Powered</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💎</div>
              <span>Premium Quality</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <span>Lightning Fast</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hero-actions">
            <button className="primary-cta-btn">
              <span>Get Started Free</span>
              <svg className="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="secondary-cta-btn">
              <span className="play-icon">▶</span>
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="trust-indicators">
            <div className="trust-item">
              <span className="trust-number">50K+</span>
              <span className="trust-label">Happy Users</span>
            </div>
            <div className="trust-item">
              <span className="trust-number">1000+</span>
              <span className="trust-label">Premium Assets</span>
            </div>
            <div className="trust-item">
              <span className="trust-number">99.9%</span>
              <span className="trust-label">Uptime</span>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  </Container>

  {/* Background Elements */}
  <div className="hero-bg-elements">
    <div className="bg-circle bg-circle-1"></div>
    <div className="bg-circle bg-circle-2"></div>
    <div className="bg-circle bg-circle-3"></div>
  </div>
</section></div>
  )
}

export default Hero