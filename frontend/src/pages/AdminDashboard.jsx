// pages/AdminDashboard.jsx (Updated - Remove the parts with icons and colors)
import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, Modal, Form, 
  Badge, Alert, Spinner, Image, Nav, Tab
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  
  // Products state
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    title: '',
    category: '',
    imageUrl: '',
    previewUrl: '',
    downloadUrl: '',
    featured: false,
  });
  
  // Categories state
  const [categories, setCategories] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    parent: '',
    isActive: true
  });

  // Stats and UI state
  const [stats, setStats] = useState({ 
    totalProducts: 0, 
    totalDownloads: 0, 
    totalCategories: 0 
  });
  const [imagePreview, setImagePreview] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    // Set up API interceptor for admin routes
    api.interceptors.request.use((config) => {
      if (config.url.includes('/admin') || config.url.includes('/products/admin') || 
          config.url.includes('/categories') ||
          (config.method === 'post' && (config.url.includes('/products') || config.url.includes('/categories'))) ||
          (config.method === 'put' && (config.url.includes('/products') || config.url.includes('/categories'))) ||
          (config.method === 'delete' && (config.url.includes('/products') || config.url.includes('/categories')))) {
        config.headers.Authorization = adminToken;
      }
      return config;
    });

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [productsRes, categoriesRes, parentCategoriesRes, statsRes] = await Promise.all([
        api.get('/products/admin'),
        api.get('/categories/admin'),
        api.get('/categories/parents'),
        api.get('/products/stats')
      ]);

      if (productsRes.data.success) {
        setProducts(productsRes.data.products || []);
      }

      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.categories || []);
        setFlatCategories(categoriesRes.data.flatCategories || []);
      }

      if (parentCategoriesRes.data.success) {
        setParentCategories(parentCategoriesRes.data.categories || []);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.stats || { totalProducts: 0, totalDownloads: 0, totalCategories: 0 });
      }

    } catch (error) {
      console.error('❌ Dashboard error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else {
        toast.error('Failed to load dashboard data');
        setProducts([]);
        setCategories([]);
        setFlatCategories([]);
        setParentCategories([]);
        setStats({ totalProducts: 0, totalDownloads: 0, totalCategories: 0 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    toast.success('Admin logged out successfully');
    navigate('/admin/login');
  };

  // Product handlers (same as before)
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validation
      if (!productFormData.title.trim() || !productFormData.category || 
          !productFormData.imageUrl.trim() || !productFormData.previewUrl.trim() || 
          !productFormData.downloadUrl.trim()) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate image URL
      if (!isValidImageUrl(productFormData.imageUrl)) {
        toast.error('Please provide a valid image URL (jpg, jpeg, png, gif, webp)');
        return;
      }

      const url = editingProduct 
        ? `/products/${editingProduct._id}`
        : '/products';
      
      const method = editingProduct ? 'put' : 'post';
      
      const response = await api[method](url, productFormData);
      
      if (response.data.success) {
        toast.success(`Product ${editingProduct ? 'updated' : 'created'} successfully!`);
        setShowProductModal(false);
        setEditingProduct(null);
        resetProductForm();
        fetchDashboardData();
      }
      
    } catch (error) {
      console.error('❌ Product submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductFormData({
      title: product.title,
      category: product.category,
      imageUrl: product.imageUrl,
      previewUrl: product.previewUrl,
      downloadUrl: product.downloadUrl,
      featured: product.featured || false,
    });
    setImagePreview(product.imageUrl);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await api.delete(`/products/${productId}`);
        if (response.data.success) {
          toast.success('Product deleted successfully');
          fetchDashboardData();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const resetProductForm = () => {
    setProductFormData({
      title: '',
      category: '',
      imageUrl: '',
      previewUrl: '',
      downloadUrl: '',
      featured: false,
    });
    setImagePreview('');
  };

  const onProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Update image preview when imageUrl changes
    if (name === 'imageUrl') {
      setImagePreview(value);
    }
  };

  // Category handlers (SIMPLIFIED)
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validation
      if (!categoryFormData.name.trim()) {
        toast.error('Category name is required');
        return;
      }

      const submitData = {
        name: categoryFormData.name,
        parent: categoryFormData.parent || null,
        isActive: categoryFormData.isActive
      };

      const url = editingCategory 
        ? `/categories/${editingCategory._id}`
        : '/categories';
      
      const method = editingCategory ? 'put' : 'post';
      
      const response = await api[method](url, submitData);
      
      if (response.data.success) {
        toast.success(`Category ${editingCategory ? 'updated' : 'created'} successfully!`);
        setShowCategoryModal(false);
        setEditingCategory(null);
        resetCategoryForm();
        fetchDashboardData();
      }
      
    } catch (error) {
      console.error('❌ Category submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      parent: category.parent?._id || '',
      isActive: category.isActive
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        const response = await api.delete(`/categories/${categoryId}`);
        if (response.data.success) {
          toast.success('Category deleted successfully');
          fetchDashboardData();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      parent: '',
      isActive: true
    });
  };

  const onCategoryFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Utility functions
  const isValidImageUrl = (url) => {
    return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderCategoryTree = (categories, level = 0) => {
    return categories.map((category, index) => (
      <React.Fragment key={category._id}>
        <tr>
          <td>{level === 0 ? index + 1 : ''}</td>
          <td>
            <div style={{ marginLeft: `${level * 20}px` }}>
              <h6 className="mb-1">{category.name}</h6>
              <small className="text-muted">
                {category.slug} {category.parent && (
                  <Badge bg="info" className="ms-1">Child</Badge>
                )}
              </small>
            </div>
          </td>
          <td>
            <Badge bg="primary" className="fw-bold">
              {category.productCount || 0}
            </Badge>
          </td>
          <td>
            <Badge bg={category.isActive ? 'success' : 'secondary'}>
              {category.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </td>
          <td>
            <small className="text-muted">
              {formatDate(category.createdAt)}
            </small>
          </td>
          <td>
            <div className="btn-group" role="group">
              <Button
                size="sm"
                variant="outline-success"
                onClick={() => handleEditCategory(category)}
                title="Edit"
              >
                <i className="fas fa-edit"></i>
              </Button>
              <Button
                size="sm"
                variant="outline-danger"
                onClick={() => handleDeleteCategory(category._id)}
                title="Delete"
                disabled={category.productCount > 0 || (category.children && category.children.length > 0)}
              >
                <i className="fas fa-trash"></i>
              </Button>
            </div>
          </td>
        </tr>
        {category.children && category.children.length > 0 && 
          renderCategoryTree(category.children, level + 1)
        }
      </React.Fragment>
    ));
  };

  // Safe access to stats
  const safeStats = {
    totalProducts: stats?.totalProducts || 0,
    totalDownloads: stats?.totalDownloads || 0,
    totalCategories: stats?.totalCategories || flatCategories.length
  };

  if (loading && products.length === 0 && categories.length === 0) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <Spinner animation="border" variant="danger" size="lg" />
          <h4 className="mt-3">Loading Admin Dashboard...</h4>
        </div>
      </Container>
    );
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="mb-1">
                      <i className="fas fa-tachometer-alt me-2 text-danger"></i>
                      Admin Dashboard
                    </h2>
                    <p className="text-muted mb-0">Manage your digital marketplace</p>
                  </div>
                  <div>
                    {activeTab === 'products' ? (
                      <Button 
                        variant="success" 
                        className="me-2"
                        onClick={() => {
                          resetProductForm();
                          setEditingProduct(null);
                          setShowProductModal(true);
                        }}
                        disabled={flatCategories.length === 0}
                      >
                        <i className="fas fa-plus me-2"></i>
                        Add Product
                      </Button>
                    ) : (
                      <Button 
                        variant="success" 
                        className="me-2"
                        onClick={() => {
                          resetCategoryForm();
                          setEditingCategory(null);
                          setShowCategoryModal(true);
                        }}
                      >
                        <i className="fas fa-plus me-2"></i>
                        Add Category
                      </Button>
                    )}
                    <Button variant="outline-danger" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div style={{ fontSize: '2.5rem', color: '#007bff', marginBottom: '10px' }}>
                  <i className="fas fa-box"></i>
                </div>
                <h3 className="mb-1">{safeStats.totalProducts}</h3>
                <p className="text-muted mb-0">Total Products</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div style={{ fontSize: '2.5rem', color: '#28a745', marginBottom: '10px' }}>
                  <i className="fas fa-download"></i>
                </div>
                <h3 className="mb-1">{safeStats.totalDownloads}</h3>
                <p className="text-muted mb-0">Total Downloads</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div style={{ fontSize: '2.5rem', color: '#ffc107', marginBottom: '10px' }}>
                  <i className="fas fa-star"></i>
                </div>
                <h3 className="mb-1">{products.filter(p => p.featured).length}</h3>
                <p className="text-muted mb-0">Featured Products</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div style={{ fontSize: '2.5rem', color: '#17a2b8', marginBottom: '10px' }}>
                  <i className="fas fa-sitemap"></i>
                </div>
                <h3 className="mb-1">{safeStats.totalCategories}</h3>
                <p className="text-muted mb-0">Categories</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Alert for no categories */}
        {flatCategories.length === 0 && (
          <Alert variant="warning" className="mb-4">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>No categories found!</strong> Please create categories first before adding products.
          </Alert>
        )}

        {/* Navigation Tabs */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white">
            <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
              <Nav.Item>
                <Nav.Link eventKey="products">
                  <i className="fas fa-box me-2"></i>
                  Products ({products.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="categories">
                  <i className="fas fa-sitemap me-2"></i>
                  Categories ({flatCategories.length})
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body className="p-0">
            <Tab.Container activeKey={activeTab}>
              <Tab.Content>
                {/* Products Tab (same as before) */}
                <Tab.Pane eventKey="products">
                  {products.length > 0 ? (
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: '40px' }}>#</th>
                            <th style={{ width: '80px' }}>Image</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Downloads</th>
                            <th>Created</th>
                            <th style={{ width: '200px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product, index) => (
                            <tr key={product._id}>
                              <td>{index + 1}</td>
                              <td>
                                <Image
                                  src={product.imageUrl}
                                  alt={product.title}
                                  width={60}
                                  height={45}
                                  rounded
                                  style={{ objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/60x45?text=No+Image';
                                  }}
                                />
                              </td>
                              <td>
                                <div>
                                  <h6 className="mb-1">{product.title}</h6>
                                  <small className="text-muted">
                                    ID: {product._id.slice(-6)}
                                  </small>
                                </div>
                              </td>
                              <td>
                                {product.categoryInfo ? (
                                  <div>
                                    <Badge bg="primary">
                                      {product.categoryInfo.name}
                                    </Badge>
                                    {product.categoryInfo.parent && (
                                      <div className="mt-1">
                                        <small className="text-muted">
                                          <i className="fas fa-arrow-up me-1"></i>
                                          {product.categoryInfo.parent.name}
                                        </small>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <Badge bg="secondary">{product.category}</Badge>
                                )}
                              </td>
                              <td>
                                <div>
                                  {product.featured && (
                                    <Badge bg="warning" className="me-1">
                                      <i className="fas fa-star me-1"></i>Featured
                                    </Badge>
                                  )}
                                  <Badge bg={product.isActive ? 'success' : 'secondary'}>
                                    {product.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                              </td>
                              <td>
                                <span className="fw-bold">{product.downloads || 0}</span>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {formatDate(product.createdAt)}
                                </small>
                              </td>
                              <td>
                                <div className="btn-group" role="group">
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={() => window.open(product.previewUrl, '_blank')}
                                    title="Preview"
                                  >
                                    <i className="fas fa-eye"></i>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-success"
                                    onClick={() => handleEditProduct(product)}
                                    title="Edit"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => handleDeleteProduct(product._id)}
                                    title="Delete"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <div style={{ fontSize: '4rem', color: '#dee2e6', marginBottom: '20px' }}>
                        <i className="fas fa-box-open"></i>
                      </div>
                      <h5 className="text-muted mb-3">No products yet</h5>
                      {flatCategories.length > 0 ? (
                        <Button 
                          variant="primary" 
                          onClick={() => {
                            resetProductForm();
                            setEditingProduct(null);
                            setShowProductModal(true);
                          }}
                        >
                          <i className="fas fa-plus me-2"></i>
                          Add Your First Product
                        </Button>
                      ) : (
                        <div>
                          <p className="text-muted mb-3">Create categories first to add products</p>
                          <Button 
                            variant="outline-primary" 
                            onClick={() => setActiveTab('categories')}
                          >
                            <i className="fas fa-sitemap me-2"></i>
                            Manage Categories
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Tab.Pane>

                {/* Categories Tab (SIMPLIFIED) */}
                <Tab.Pane eventKey="categories">
                  {categories.length > 0 ? (
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: '40px' }}>#</th>
                            <th>Name</th>
                            <th>Products</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th style={{ width: '150px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {renderCategoryTree(categories)}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <div style={{ fontSize: '4rem', color: '#dee2e6', marginBottom: '20px' }}>
                        <i className="fas fa-sitemap"></i>
                      </div>
                      <h5 className="text-muted mb-3">No categories yet</h5>
                      <p className="text-muted mb-4">
                        Create parent categories (e.g., WordPress) and child categories (e.g., Themes, Plugins)
                      </p>
                      <Button 
                        variant="primary" 
                        onClick={() => {
                          resetCategoryForm();
                          setEditingCategory(null);
                          setShowCategoryModal(true);
                        }}
                      >
                        <i className="fas fa-plus me-2"></i>
                        Create Your First Category
                      </Button>
                    </div>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Card.Body>
        </Card>
      </Container>

      {/* Product Modal (same as before) */}
      <Modal 
        show={showProductModal} 
        onHide={() => setShowProductModal(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-box me-2"></i>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </Modal.Title>
        </Modal.Header>
        
        <Form onSubmit={handleProductSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Product Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={productFormData.title}
                    onChange={onProductFormChange}
                    placeholder="Enter product title"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="category"
                    value={productFormData.category}
                    onChange={onProductFormChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {flatCategories.filter(cat => cat.isActive).map(category => (
                      <option key={category._id} value={category.slug}>
                        {category.parent ? `${category.parent.name} → ` : ''}{category.name}
                      </option>
                    ))}
                  </Form.Select>
                  {flatCategories.length === 0 && (
                    <Form.Text className="text-warning">
                      No categories available. Please create a category first.
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Image URL <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="url"
                    name="imageUrl"
                    value={productFormData.imageUrl}
                    onChange={onProductFormChange}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  <Form.Text className="text-muted">
                    Supported formats: JPG, JPEG, PNG, GIF, WebP
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Preview URL <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="url"
                    name="previewUrl"
                    value={productFormData.previewUrl}
                    onChange={onProductFormChange}
                    placeholder="https://example.com/preview"
                    required
                  />
                  <Form.Text className="text-muted">
                    URL where users can preview the product
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                {/* Image Preview */}
                <div className="mb-3">
                  <Form.Label>Image Preview</Form.Label>
                  <div className="border rounded p-2 bg-light" style={{ minHeight: '120px' }}>
                    {imagePreview && isValidImageUrl(imagePreview) ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fluid
                        rounded
                        style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Invalid+Image+URL';
                        }}
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                        <div className="text-center">
                          <i className="fas fa-image fa-2x mb-2"></i>
                          <p>Image preview will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                Download URL <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="url"
                name="downloadUrl"
                value={productFormData.downloadUrl}
                onChange={onProductFormChange}
                placeholder="https://example.com/download"
                required
              />
              <Form.Text className="text-muted">
                Direct download link for the product file
              </Form.Text>
            </Form.Group>

            <Form.Check
              type="checkbox"
              name="featured"
              label="Featured Product"
              checked={productFormData.featured}
              onChange={onProductFormChange}
              className="mb-3"
            />
          </Modal.Body>
          
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowProductModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading || flatCategories.length === 0}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Category Modal (SIMPLIFIED) */}
      <Modal 
        show={showCategoryModal} 
        onHide={() => setShowCategoryModal(false)} 
        size="md"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-sitemap me-2"></i>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </Modal.Title>
        </Modal.Header>
        
        <Form onSubmit={handleCategorySubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>
                Category Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={categoryFormData.name}
                onChange={onCategoryFormChange}
                placeholder="e.g., WordPress, Themes, etc."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Parent Category</Form.Label>
              <Form.Select
                name="parent"
                value={categoryFormData.parent}
                onChange={onCategoryFormChange}
              >
                <option value="">None (Parent Category)</option>
                {parentCategories.map(category => (
                  <option 
                    key={category._id} 
                    value={category._id}
                    disabled={editingCategory && category._id === editingCategory._id}
                  >
                    {category.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Leave empty to create a parent category. Select a parent to create a subcategory.
              </Form.Text>
            </Form.Group>

            <Form.Check
              type="checkbox"
              name="isActive"
              label="Active Category"
              checked={categoryFormData.isActive}
              onChange={onCategoryFormChange}
            />
          </Modal.Body>
          
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowCategoryModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;