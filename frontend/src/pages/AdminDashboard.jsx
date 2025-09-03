// pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, Modal, Form, 
  Badge, Alert, Spinner, Image
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalDownloads: 0 });
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    title: '',
    category: 'themes',
    imageUrl: '',
    previewUrl: '',
    downloadUrl: '',
    featured: false,
 
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
          (config.method === 'post' && config.url.includes('/products')) ||
          (config.method === 'put' && config.url.includes('/products')) ||
          (config.method === 'delete' && config.url.includes('/products'))) {
        config.headers.Authorization = adminToken;
      }
      return config;
    });

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [productsRes, statsRes] = await Promise.all([
        api.get('/products/admin'),
        api.get('/products/stats')
      ]);

      if (productsRes.data.success) {
        setProducts(productsRes.data.products || []);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.stats || { totalProducts: 0, totalDownloads: 0 });
      }

    } catch (error) {
      console.error('❌ Dashboard error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else {
        toast.error('Failed to load dashboard data');
        setProducts([]);
        setStats({ totalProducts: 0, totalDownloads: 0 });
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

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate required fields
      if (!productFormData.title.trim() || !productFormData.imageUrl.trim() || 
          !productFormData.previewUrl.trim() || !productFormData.downloadUrl.trim()) {
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
      featured: product.featured || false ,
     
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
      category: 'themes',
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

  // Safe access to stats
  const safeStats = {
    totalProducts: stats?.totalProducts || 0,
    totalDownloads: stats?.totalDownloads || 0
  };

  if (loading && products.length === 0) {
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
                    <Button 
                      variant="success" 
                      className="me-2"
                      onClick={() => {
                        resetProductForm();
                        setEditingProduct(null);
                        setShowProductModal(true);
                      }}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Add Product
                    </Button>
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
                  <i className="fas fa-palette"></i>
                </div>
                <h3 className="mb-1">{products.filter(p => p.category === 'themes').length}</h3>
                <p className="text-muted mb-0">Themes</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Products Table */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white">
            <h5 className="mb-0">
              <i className="fas fa-box me-2"></i>
              Products Management ({products.length})
            </h5>
          </Card.Header>
          
          <Card.Body className="p-0">
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
                          <Badge bg={product.category === 'themes' ? 'primary' : 'success'} className="text-capitalize">
                            {product.category}
                          </Badge>
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
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Product Modal */}
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
                    <option value="themes">Themes</option>
                    <option value="plugins">Plugins</option>
                  </Form.Select>
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
                  {editingProduct ? 'Update Product' : 'Create Product'}
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
