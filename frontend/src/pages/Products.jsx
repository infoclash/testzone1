// pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Dropdown, Modal, ProgressBar } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import './Products.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [priceRange, setPriceRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [downloadingProducts, setDownloadingProducts] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [productModal, setProductModal] = useState({ show: false, product: null });
  const [wishlist, setWishlist] = useState(new Set());

  const { user } = useAuth();

  // Enhanced categories with subcategories
  const categories = [
    { 
      value: 'all', 
      label: 'All Categories', 
      icon: '🎯',
      description: 'Browse everything',
      count: 0
    },
    { 
      value: 'wordpress-themes', 
      label: 'WordPress Themes', 
      icon: '🎨',
      description: 'Premium WP themes',
      count: 0,
      subcategories: [
        { value: 'business', label: 'Business & Corporate' },
        { value: 'ecommerce', label: 'E-commerce' },
        { value: 'blog', label: 'Blog & Magazine' },
        { value: 'portfolio', label: 'Portfolio & Creative' },
        { value: 'landing', label: 'Landing Pages' }
      ]
    },
    { 
      value: 'wordpress-plugins', 
      label: 'WordPress Plugins', 
      icon: '⚡',
      description: 'Powerful WP plugins',
      count: 0,
      subcategories: [
        { value: 'seo', label: 'SEO & Marketing' },
        { value: 'ecommerce-plugins', label: 'E-commerce' },
        { value: 'security', label: 'Security' },
        { value: 'performance', label: 'Performance' },
        { value: 'forms', label: 'Forms & Contact' }
      ]
    },
    { 
      value: 'html-templates', 
      label: 'HTML Templates', 
      icon: '📄',
      description: 'Static HTML templates',
      count: 0,
      subcategories: [
        { value: 'bootstrap', label: 'Bootstrap Templates' },
        { value: 'react', label: 'React Templates' },
        { value: 'vue', label: 'Vue Templates' },
        { value: 'admin', label: 'Admin Dashboards' }
      ]
    },
    { 
      value: 'graphics-design', 
      label: 'Graphics & Design', 
      icon: '🎭',
      description: 'Design resources',
      count: 0,
      subcategories: [
        { value: 'ui-kits', label: 'UI Kits' },
        { value: 'icons', label: 'Icon Sets' },
        { value: 'illustrations', label: 'Illustrations' },
        { value: 'mockups', label: 'Mockups' }
      ]
    },
    { 
      value: 'video-audio', 
      label: 'Video & Audio', 
      icon: '🎬',
      description: 'Multimedia assets',
      count: 0,
      subcategories: [
        { value: 'video-templates', label: 'Video Templates' },
        { value: 'audio-tracks', label: 'Audio Tracks' },
        { value: 'sound-effects', label: 'Sound Effects' },
        { value: 'animations', label: 'Animations' }
      ]
    }
  ];

  // Sort options
  const sortOptions = [
    { value: 'latest', label: 'Latest First', icon: '🕐' },
    { value: 'popular', label: 'Most Popular', icon: '🔥' },
    { value: 'downloads', label: 'Most Downloaded', icon: '⬇️' },
    { value: 'rating', label: 'Highest Rated', icon: '⭐' },
    { value: 'name-asc', label: 'Name A-Z', icon: '🔤' },
    { value: 'name-desc', label: 'Name Z-A', icon: '🔤' }
  ];

  // Price range options
  const priceRanges = [
    { value: 'all', label: 'All Prices', icon: '💰' },
    { value: 'free', label: 'Free', icon: '🆓' },
    { value: 'premium', label: 'Premium', icon: '💎' }
  ];

  useEffect(() => {
    loadProducts();
  }, [currentPage, selectedCategory, selectedType, sortBy, priceRange]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  useEffect(() => {
    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchFromUrl = urlParams.get('search');
    const categoryFromUrl = urlParams.get('category');
    const typeFromUrl = urlParams.get('type');
    const sortFromUrl = urlParams.get('sort');
    
    if (searchFromUrl && searchFromUrl !== searchTerm) {
      setSearchTerm(searchFromUrl);
    }
    
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
    }

    if (typeFromUrl && typeFromUrl !== selectedType) {
      setSelectedType(typeFromUrl);
    }

    if (sortFromUrl && sortFromUrl !== sortBy) {
      setSortBy(sortFromUrl);
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const urlParams = new URLSearchParams();
    
    if (searchTerm) urlParams.set('search', searchTerm);
    if (selectedCategory !== 'all') urlParams.set('category', selectedCategory);
    if (selectedType !== 'all') urlParams.set('type', selectedType);
    if (sortBy !== 'latest') urlParams.set('sort', sortBy);
    if (priceRange !== 'all') urlParams.set('price', priceRange);
    if (currentPage > 1) urlParams.set('page', currentPage);
    
    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [searchTerm, selectedCategory, selectedType, sortBy, priceRange, currentPage]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: 24,
        sort: sortBy
      };
      
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedType !== 'all') params.type = selectedType;
      if (priceRange !== 'all') params.price = priceRange;

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
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredProducts(filtered);
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
    return "64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiMxYTFhMWEiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSIjMzMzMzMzIi8+PHBhdGggZD0ibTE4MCA4MCAyMC0yMCAxMCAxMCAyMC0yMCAxMCAxMHY0MEgxODBWODBaIiBmaWxsPSIjNjY2NjY2Ii8+PHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZjU3MjIiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWkiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSortBy('latest');
    setPriceRange('all');
    setCurrentPage(1);
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
        toast.info('Removed from wishlist');
      } else {
        newWishlist.add(productId);
        toast.success('Added to wishlist');
      }
      return newWishlist;
    });
  };

  const openProductModal = (product) => {
    setProductModal({ show: true, product });
  };

  const closeProductModal = () => {
    setProductModal({ show: false, product: null });
  };

  if (loading) {
    return (
      <div className="xeriwo-products-loading">
        <Container>
          <div className="loading-masterpiece">
            <div className="loading-animation">
              <div className="loading-rings">
                <div className="ring ring-1"></div>
                <div className="ring ring-2"></div>
                <div className="ring ring-3"></div>
              </div>
              <div className="loading-icon">
                <i className="fab fa-wordpress"></i>
              </div>
            </div>
            <h3 className="loading-title">Discovering Premium Products</h3>
            <p className="loading-subtitle">Curating the best WordPress assets for you...</p>
            <div className="loading-progress">
              <div className="progress-bar"></div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const productsToShow = searchTerm ? filteredProducts : products;

  return (
    <div className="xeriwo-products-marketplace">
      {/* Epic Hero Section */}
      <section className="xeriwo-marketplace-hero">
        <div className="hero-background-effects">
          <div className="floating-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`particle particle-${i % 4}`}></div>
            ))}
          </div>
          <div className="gradient-orbs">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="orb orb-3"></div>
          </div>
        </div>
        
        <Container>
          <div className="hero-content-masterpiece">
            <div className="hero-badge-floating">
              <span className="badge-icon">🚀</span>
              <span className="badge-text">Premium Marketplace</span>
              <div className="badge-glow"></div>
            </div>
            
            <h1 className="hero-title-epic">
              <span className="title-line">Discover</span>
              <span className="title-highlight">Premium WordPress</span>
              <span className="title-line">Assets & Templates</span>
            </h1>
            
            <p className="hero-description-enhanced">
              Handpicked collection of premium themes, plugins, templates, and design resources 
              from industry-leading developers worldwide
            </p>
<Form.Control
                  type="text"
                  placeholder="Search themes, plugins, templates, graphics, videos & more..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input-advanced"
                />
                {searchTerm && (
                  <button 
                    className="search-clear-advanced"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
            {/* Live Stats */}
           

            {/* User Benefits for logged in users */}
            {user && (
              <div className="user-benefits-showcase">
                <div className="benefit-card-hero">
                  <div className="benefit-icon-hero">⚡</div>
                  <div className="benefit-content-hero">
                    <span className="benefit-number">15</span>
                    <span className="benefit-text">Daily Downloads</span>
                  </div>
                </div>
                <div className="benefit-card-hero">
                  <div className="benefit-icon-hero">📅</div>
                  <div className="benefit-content-hero">
                    <span className="benefit-number">350</span>
                    <span className="benefit-text">Monthly Quota</span>
                  </div>
                </div>
                <div className="benefit-card-hero">
                  <div className="benefit-icon-hero">🎯</div>
                  <div className="benefit-content-hero">
                    <span className="benefit-number">∞</span>
                    <span className="benefit-text">Premium Access</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Advanced Search & Filter System */}
     

      {/* Products Showcase Grid */}
      <section className="xeriwo-products-showcase">
        <Container>
          {productsToShow.length > 0 ? (
            <>
              <Row className={`products-grid-master ${viewMode}`}>
                {productsToShow.map((product, index) => (
                 <Col 
      xl={4}  // 3 per row on extra large
      lg={4}  // 3 per row on large
      md={6}  // 2 per row on medium
      sm={12} // 1 per row on small screens
      className="mb-4" 
      key={product._id}
    >
                    <Card className={`product-card-masterpiece ${viewMode}-view`}>
                      {/* Product Image Container */}
                      <div className="product-image-container-advanced">
                        <div className="image-frame-advanced">
                          <img
                            src={imageErrors[product._id] ? getPlaceholderImage() : (product.imageUrl || product.image || getPlaceholderImage())}
                            alt={product.title || 'Product Preview'}
                            className="product-image-advanced"
                            onError={() => handleImageError(product._id)}
                            onLoad={() => handleImageLoad(product._id)}
                            loading="lazy"
                          />
                          
                          {/* Hover Overlay */}
                          <div className="image-overlay-advanced">
  <div className="overlay-actions-advanced">
    {/* Live Preview */}
    <button
      className="overlay-btn-advanced preview-btn"
      onClick={() => window.open(product.previewUrl || '#', '_blank')}
      title="Live Preview"
    >
      <i className="fas fa-external-link-alt"></i>
    </button>

    {/* Quick View */}
    <button
      className="overlay-btn-advanced quick-view-btn"
      onClick={() => openProductModal(product)}
      title="Quick View"
    >
      <i className="fas fa-eye"></i>
    </button>

    {/* Wishlist */}
    
  </div>
</div>


                          {/* Category Badge */}
                          <div className="category-badge-advanced">
                            <span className={`category-label-advanced ${product.category || 'default'}`}>
                              {categories.find(cat => cat.value === product.category)?.icon || '📦'}
                              <span>{product.category || 'Product'}</span>
                            </span>
                          </div>

                          {/* Premium Badge */}
                          <div className="premium-badge-advanced">
                            <i className="fas fa-crown"></i>
                          </div>
                        </div>
                      </div>

                      {/* Product Content */}
                      <Card.Body className="product-content-advanced">
                        <div className="product-header-advanced">
                          <h5 className="product-title-advanced" title={product.title}>
                            {product.title && product.title.length > (viewMode === 'list' ? 80 : 45) 
                              ? `${product.title.substring(0, viewMode === 'list' ? 80 : 45)}...` 
                              : (product.title || 'Premium Product')
                            }
                          </h5>
                          
                          {viewMode === 'list' && product.description && (
                            <p className="product-description-advanced">
                              {product.description.length > 120 
                                ? `${product.description.substring(0, 120)}...` 
                                : product.description
                              }
                            </p>
                          )}
                        </div>

                        {/* Product Meta */}
                        <div className="product-meta-advanced">
                          {product.rating && (
                            <div className="rating-display-advanced">
                              <div className="stars-advanced">
                                {[...Array(5)].map((_, i) => (
                                  <i 
                                    key={i} 
                                    className={`fas fa-star ${i < Math.floor(product.rating) ? 'filled' : ''}`}
                                  ></i>
                                ))}
                              </div>
                              <span className="rating-number">{product.rating}</span>
                            </div>
                          )}
                          
                          
                        </div>

                        {/* Action Buttons */}
                        <div className="product-actions-advanced">
                          <Button
                            variant="outline-primary"
                            className="action-btn-advanced preview-action"
                            onClick={() => window.open(product.previewUrl || '#', '_blank')}
                          >
                            <i className="fas fa-eye me-2"></i>
                            <span>Live Demo</span>
                          </Button>
                          
                          <Button
                            variant="primary"
                            className="action-btn-advanced download-action"
                            onClick={() => handleDownload(product)}
                            disabled={downloadingProducts[product._id]}
                          >
                            {downloadingProducts[product._id] ? (
                              <>
                                <div className="loading-spinner-advanced">
                                  <i className="fas fa-circle-notch fa-spin"></i>
                                </div>
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <i className="fas fa-download me-2"></i>
                                <span>Download</span>
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Access Notice for non-users */}
                        {!user && (
                          <div className="access-notice-advanced">
                            <div className="notice-icon-advanced">
                              <i className="fas fa-lock"></i>
                            </div>
                            <span className="notice-text-advanced">Login required for download</span>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Advanced Pagination */}
              {!searchTerm && totalPages > 1 && (
                <div className="pagination-masterpiece">
                  <div className="pagination-info-advanced">
                    <div className="pagination-summary-advanced">
                      <i className="fas fa-layer-group me-2"></i>
                      <span>
                        Showing {((currentPage - 1) * 24) + 1}–{Math.min(currentPage * 24, pagination.totalProducts || 0)} 
                        of <strong>{pagination.totalProducts || 0}</strong> results
                      </span>
                    </div>
                  </div>
                  
                  <div className="pagination-controls-advanced">
                    <Button
                      variant="outline-primary"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn-advanced prev-btn-advanced"
                    >
                      <i className="fas fa-chevron-left me-2"></i>
                      Previous
                    </Button>
                    
                    <div className="page-numbers-advanced">
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
                              className={`page-btn-advanced ${currentPage === page ? 'active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 3 || 
                          page === currentPage + 3
                        ) {
                          return <span key={page} className="page-dots-advanced">⋯</span>;
                        }
                        return null;
                      })}
                    </div>
                    
                    <Button
                      variant="outline-primary"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-btn-advanced next-btn-advanced"
                    >
                      Next
                      <i className="fas fa-chevron-right ms-2"></i>
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state-masterpiece">
              <div className="empty-state-animation">
                <div className="empty-icon-container-advanced">
                  <i className="fas fa-search-minus"></i>
                </div>
                <div className="floating-elements-advanced">
                  <span className="element element-1"></span>
                  <span className="element element-2"></span>
                  <span className="element element-3"></span>
                </div>
              </div>
              
              <div className="empty-state-content-advanced">
                <h3 className="empty-title-advanced">No Products Found</h3>
                <p className="empty-description-advanced">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'No products match your current search criteria. Try adjusting your filters or explore our complete catalog.'
                    : 'Our premium collection is being curated with amazing new products. Check back soon!'
                  }
                </p>
                
                <div className="empty-state-actions-advanced">
                  {(searchTerm || selectedCategory !== 'all') && (
                    <Button 
                      variant="primary" 
                      onClick={resetFilters}
                      className="empty-action-btn-advanced"
                    >
                      <i className="fas fa-compass me-2"></i>
                      Explore All Products
                    </Button>
                  )}
                  <Button 
                    variant="outline-primary"
                    className="empty-action-btn-advanced"
                  >
                    <i className="fas fa-bell me-2"></i>
                    Notify Me
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Product Detail Modal */}
      <Modal 
        show={productModal.show} 
        onHide={closeProductModal} 
        size="xl" 
        centered
        className="product-modal-advanced"
      >
        <Modal.Header closeButton className="modal-header-advanced">
          <Modal.Title className="modal-title-advanced">
            {productModal.product?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-advanced">
          {productModal.product && (
            <Row>
              <Col lg={6}>
                <div className="modal-image-container">
                  <img
                    src={productModal.product.imageUrl || productModal.product.image || getPlaceholderImage()}
                    alt={productModal.product.title}
                    className="modal-product-image"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="modal-product-details">
                  <h4>{productModal.product.title}</h4>
                  <p className="modal-description">
                    {productModal.product.description || 'Premium WordPress product with professional quality and features.'}
                  </p>
                  
                  <div className="modal-product-meta">
                    <div className="meta-item">
                      <strong>Category:</strong>
                      <span>{productModal.product.category || 'Product'}</span>
                    </div>
                   
                    
                  </div>

                  <div className="modal-actions">
                    <Button
                      variant="outline-primary"
                      onClick={() => window.open(productModal.product.previewUrl || '#', '_blank')}
                      className="modal-btn preview-modal-btn"
                    >
                      <i className="fas fa-external-link-alt me-2"></i>
                      Live Preview
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleDownload(productModal.product)}
                      disabled={downloadingProducts[productModal.product._id]}
                      className="modal-btn download-modal-btn"
                    >
                      {downloadingProducts[productModal.product._id] ? (
                        <>
                          <i className="fas fa-circle-notch fa-spin me-2"></i>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-download me-2"></i>
                          Download Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Products;