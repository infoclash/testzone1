// pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [downloadingProducts, setDownloadingProducts] = useState({});

  const { user } = useAuth();

  const categories = [
    { value: 'all', label: 'All Categories', icon: '🎯' },
    { value: 'themes', label: 'WordPress Themes', icon: '🎨' },
    { value: 'plugins', label: 'WordPress Plugins', icon: '⚡' },
    { value: 'templates', label: 'HTML Templates', icon: '📄' },
    { value: 'graphics', label: 'Graphics & UI', icon: '🎭' }
  ];

  useEffect(() => {
    loadProducts();
  }, [currentPage, selectedCategory]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: 20
      };
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const response = await api.get('/products', { params });
      
      if (response.data.success) {
        setProducts(response.data.products || []);
        setPagination(response.data.pagination || {});
        setTotalPages(response.data.pagination?.totalPages || 1);
        setImageErrors({});
      } else {
        setProducts([]);
        setPagination({});
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product => 
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredProducts(filtered);
  };

  // In the handleDownload function of Products.jsx, replace the error handling section:

// pages/Products.jsx - Update just the handleDownload function:

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
      
      setProducts(prev => prev.map(p => 
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
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const handleImageLoad = (productId) => {
    setImageErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[productId];
      return newErrors;
    });
  };

  const getPlaceholderImage = () => {
    return "64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiNmOGY5ZmEiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSIjZGVlMmU2Ii8+PHBhdGggZD0ibTE4MCA4MCAyMC0yMCAxMCAxMCAyMC0yMCAxMCAxMHY0MEgxODBWODBaIiBmaWxsPSIjOWNhM2FmIi8+PHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Yjc0ODAiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWkiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="products-loading">
        <Container>
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <h4>Loading Premium Products...</h4>
            <p>Discovering amazing WordPress assets for you</p>
          </div>
        </Container>
      </div>
    );
  }

  const productsToShow = searchTerm ? filteredProducts : products;

  return (
    <div className="products-page">
      {/* Hero Header */}
      <section className="products-hero">
        <Container>
          <div className="hero-content">
            <h1 className="hero-title">
              Premium <span className="highlight">WordPress</span> Collection
            </h1>
            <p className="hero-subtitle">
              Discover hand-picked themes, plugins, and templates from top developers
            </p>
            {user && (
              <div className="hero-stats">
                <Badge bg="light" text="dark" className="me-2 px-3 py-2">
                  <i className="fas fa-download me-1"></i>
                  15 downloads per day
                </Badge>
                <Badge bg="primary" className="px-3 py-2">
                  <i className="fas fa-calendar me-1"></i>
                  350 downloads per month
                </Badge>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Search and Filters */}
      <section className="search-section">
        <Container>
          <div className="search-container">
            {/* Search Bar */}
            <div className="search-bar">
              <div className="search-input-group">
                <div className="search-icon">
                  <i className="fas fa-search"></i>
                </div>
                <Form.Control
                  type="text"
                  placeholder="Search for themes, plugins, or templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    className="clear-btn"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="category-filter">
              <div className="category-tabs">
                {categories.map(category => (
                  <button
                    key={category.value}
                    className={`category-tab ${selectedCategory === category.value ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(category.value);
                      setCurrentPage(1);
                    }}
                  >
                    <span className="tab-icon">{category.icon}</span>
                    <span className="tab-label">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Results Info */}
            <div className="results-info">
              <div className="results-text">
                <strong>{productsToShow.length}</strong> products found
                {searchTerm && <span> for "<em>{searchTerm}</em>"</span>}
                {selectedCategory !== 'all' && (
                  <Badge bg="primary" className="ms-2">
                    {categories.find(cat => cat.value === selectedCategory)?.label}
                  </Badge>
                )}
              </div>
              
              {(searchTerm || selectedCategory !== 'all') && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={resetFilters}
                  className="reset-btn"
                >
                  <i className="fas fa-refresh me-1"></i>
                  Reset
                </Button>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Products Grid */}
      <section className="products-section">
        <Container>
          {productsToShow.length > 0 ? (
            <>
              <Row className="products-grid">
                {productsToShow.map((product, index) => (
                  <Col xl={3} lg={4} md={6} className="mb-4" key={product._id}>
                    <Card className="product-card" style={{ '--delay': `${index * 0.05}s` }}>
                      {/* Product Image */}
                      <div className="product-image-container">
                        <img
                          src={imageErrors[product._id] ? getPlaceholderImage() : (product.imageUrl || product.image || getPlaceholderImage())}
                          alt={product.title || 'Product Image'}
                          className="product-image"
                          onError={() => handleImageError(product._id)}
                          onLoad={() => handleImageLoad(product._id)}
                          loading="lazy"
                        />
                        
                        {/* Overlay on Hover */}
                        <div className="image-overlay">
                          <div className="overlay-content">
                            <Button
                              variant="light"
                              className="overlay-btn preview-btn"
                              onClick={() => window.open(product.previewUrl || '#', '_blank')}
                              title="Preview"
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                          </div>
                        </div>

                        {/* Category Badge */}
                        <div className="category-badge-overlay">
                          <Badge className={`category-badge ${product.category || 'default'}`}>
                            {product.category || 'Product'}
                          </Badge>
                        </div>
                      </div>

                      {/* Product Info */}
                      <Card.Body className="product-body">
                        <h5 className="product-title" title={product.title}>
                          {product.title && product.title.length > 50 
                            ? `${product.title.substring(0, 50)}...` 
                            : (product.title || 'Untitled Product')
                          }
                        </h5>

                        {/* Action Buttons */}
                        <div className="product-actions">
                          <Button
                            variant="outline-primary"
                            className="action-btn preview-btn-main"
                            onClick={() => window.open(product.previewUrl || '#', '_blank')}
                          >
                            <i className="fas fa-external-link-alt me-2"></i>
                            Preview
                          </Button>
                          
                          <Button
                            variant="primary"
                            className="action-btn download-btn"
                            onClick={() => handleDownload(product)}
                            disabled={downloadingProducts[product._id]}
                          >
                            {downloadingProducts[product._id] ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Downloading...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-download me-2"></i>
                                Download
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Login Notice */}
                        {!user && (
                          <div className="login-notice">
                            <i className="fas fa-lock me-1"></i>
                            Login required for download
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {!searchTerm && totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.totalProducts || 0)} of {pagination.totalProducts || 0} products
                  </div>
                  
                  <div className="pagination-controls">
                    <Button
                      variant="outline-primary"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-chevron-left me-1"></i>
                      Previous
                    </Button>
                    
                    <div className="page-numbers">
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        
                        if (
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 2 && page <= currentPage + 2)
                        ) {
                          return (
                            <button
                              key={page}
                              className={`page-number ${currentPage === page ? 'active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 3 || 
                          page === currentPage + 3
                        ) {
                          return <span key={page} className="page-dots">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    
                    <Button
                      variant="outline-primary"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next
                      <i className="fas fa-chevron-right ms-1"></i>
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>No products found</h3>
              <p>
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or browse all categories'
                  : 'No products available at the moment'
                }
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <Button variant="primary" onClick={resetFilters}>
                  <i className="fas fa-refresh me-2"></i>
                  Show All Products
                </Button>
              )}
            </div>
          )}
        </Container>
      </section>

      {/* Styles */}
      <style jsx>{`
        .products-page {
          background: #f8f9fa;
          min-height: 100vh;
        }

        /* Loading */
        .products-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .loading-container {
          text-align: center;
        }

        .loading-spinner {
          margin-bottom: 2rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Hero Section */
        .products-hero {
          background: linear-gradient(135deg, #000000 0%, #434343 100%);
          color: white;
          padding: 5rem 0 3rem;
          position: relative;
          overflow: hidden;
        }

        .products-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .hero-content {
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 1.5rem;
        }

        .highlight {
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.3rem;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto 2rem;
        }

        .hero-stats {
          margin-top: 2rem;
        }

        /* Search Section */
        .search-section {
          background: white;
          padding: 3rem 0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .search-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .search-bar {
          margin-bottom: 2.5rem;
        }

        .search-input-group {
          position: relative;
          max-width: 600px;
          margin: 0 auto;
        }

        .search-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
          z-index: 2;
        }

        .search-input {
          padding: 16px 24px 16px 55px;
          font-size: 1.1rem;
          border: 2px solid #e9ecef;
          border-radius: 50px;
          background: #f8f9fa;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          border-color: #000000;
          background: white;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
        }

        .clear-btn {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6c757d;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .clear-btn:hover {
          background: #f8f9fa;
          color: #000000;
        }

        /* Category Filter */
        .category-filter {
          margin-bottom: 2rem;
        }

        .category-tabs {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .category-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: 2px solid #e9ecef;
          border-radius: 30px;
          background: white;
          color: #495057;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .category-tab:hover {
          border-color: #000000;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .category-tab.active {
          background: #000000;
          color: white;
          border-color: #000000;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .tab-icon {
          font-size: 1.1rem;
        }

        /* Results Info */
        .results-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 0;
          border-top: 1px solid #e9ecef;
        }

        .results-text {
          font-size: 1.1rem;
          font-weight: 600;
          color: #495057;
        }

        .reset-btn {
          border-radius: 20px;
          font-weight: 600;
        }

        /* Products Section */
        .products-section {
          padding: 4rem 0 5rem;
        }

        .products-grid {
          margin-bottom: 3rem;
        }

        .product-card {
          border: none;
          border-radius: 20px;
          overflow: hidden;
          background: white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          height: 100%;
          animation: fadeInUp 0.6s ease-out forwards var(--delay);
          opacity: 0;
          transform: translateY(30px);
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .product-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        .product-image-container {
          position: relative;
          height: 250px;
          overflow: hidden;
          background: #f8f9fa;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.4s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.08);
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .product-card:hover .image-overlay {
          opacity: 1;
        }

        .overlay-content {
          display: flex;
          gap: 12px;
        }

        .overlay-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          border: none;
        }

        .overlay-btn:hover {
          transform: scale(1.1);
        }

        .category-badge-overlay {
          position: absolute;
          top: 16px;
          left: 16px;
        }

        .category-badge {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 20px;
          text-transform: capitalize;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .category-badge.themes {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .category-badge.plugins {
          background: linear-gradient(135deg, #f093fb, #f5576c);
          color: white;
        }

        .category-badge.templates {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          color: white;
        }

        .category-badge.graphics {
          background: linear-gradient(135deg, #43e97b, #38f9d7);
          color: #000000;
        }

        .category-badge.default {
          background: #6c757d;
          color: white;
        }

        .product-body {
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .product-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 1.5rem;
          line-height: 1.4;
          min-height: 60px;
          display: flex;
          align-items: center;
        }

        .product-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 1rem;
        }

        .action-btn {
          flex: 1;
          border-radius: 12px;
          font-weight: 600;
          padding: 12px 16px;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .preview-btn-main {
          border-color: #0066cc;
          color: #0066cc;
        }

        .preview-btn-main:hover {
          background: #0066cc;
          border-color: #0066cc;
          color: white;
          transform: translateY(-2px);
        }

        .download-btn {
          background: linear-gradient(135deg, #000000, #434343);
          border: none;
        }

        .download-btn:hover {
          background: linear-gradient(135deg, #434343, #000000);
          transform: translateY(-2px);
        }

        .download-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .login-notice {
          text-align: center;
          padding: 12px;
          background: linear-gradient(135deg, #fff3cd, #ffeaa7);
          color: #856404;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid #ffeaa7;
        }

        /* Pagination */
        .pagination-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          margin-top: 4rem;
          padding: 3rem 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        }

        .pagination-info {
          color: #6c757d;
          font-weight: 500;
          text-align: center;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .pagination-btn {
          border-radius: 12px;
          font-weight: 600;
          padding: 12px 20px;
          transition: all 0.3s ease;
        }

        .pagination-btn:hover {
          transform: translateY(-2px);
        }

        .page-numbers {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .page-number {
          min-width: 45px;
          height: 45px;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          background: white;
          color: #495057;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .page-number:hover {
          border-color: #000000;
          background: #f8f9fa;
          transform: translateY(-2px);
        }

        .page-number.active {
          background: #000000;
          color: white;
          border-color: #000000;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .page-dots {
          padding: 0 12px;
          color: #6c757d;
          font-weight: bold;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 6rem 2rem;
          color: #6c757d;
        }

        .empty-icon {
          font-size: 6rem;
          color: #dee2e6;
          margin-bottom: 2rem;
        }

        .empty-state h3 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #495057;
        }

        .empty-state p {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .hero-title {
            font-size: 3rem;
          }
        }

        @media (max-width: 992px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .category-tabs {
            justify-content: center;
          }

          .results-info {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .pagination-controls {
            flex-direction: column;
            gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .products-hero {
            padding: 3rem 0 2rem;
          }

          .hero-title {
            font-size: 2rem;
          }

          .search-section {
            padding: 2rem 0;
          }

          .search-input {
            font-size: 1rem;
            padding: 14px 20px 14px 50px;
          }

          .category-tabs {
            gap: 8px;
          }

          .category-tab {
            padding: 10px 18px;
            font-size: 0.9rem;
          }

          .product-image-container {
            height: 200px;
          }

          .product-body {
            padding: 1.5rem 1rem;
          }

          .product-title {
            font-size: 1.1rem;
            min-height: 50px;
          }

          .action-btn {
            padding: 10px 12px;
            font-size: 0.85rem;
          }

          .pagination-container {
            padding: 2rem 1rem;
          }

          .page-number {
            min-width: 40px;
            height: 40px;
          }
        }

        @media (max-width: 576px) {
          .hero-title {
            font-size: 1.75rem;
          }

          .category-tabs {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .category-tab {
            justify-content: center;
          }

          .product-actions {
            flex-direction: column;
          }

          .page-numbers {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Products;
