import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const ProductCard = ({ product }) => {
  const { isAuthenticated, user } = useAuth();

  const handleDownload = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to download products');
      return;
    }

    try {
      const res = await api.post(`/download/${product._id}`);
      
      if (res.data.downloadUrl) {
        // Create temporary link to trigger download
        const link = document.createElement('a');
        link.href = res.data.downloadUrl;
        link.target = '_blank';
        link.click();
        
        toast.success('Download started successfully!');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Download failed';
      toast.error(errorMsg);
      
      if (errorMsg.includes('limit')) {
        toast.info('Consider upgrading to premium for unlimited downloads!');
      }
    }
  };

  const handlePreview = () => {
    if (product.previewUrl) {
      window.open(product.previewUrl, '_blank');
    } else {
      toast.info('Preview not available for this product');
    }
  };

  return (
    <Card className="h-100 shadow-sm product-card">
      <Card.Img 
        variant="top" 
        src={product.imageUrl} 
        style={{ height: '200px', objectFit: 'cover' }}
        onError={(e) => {
          e.target.src = `https://via.placeholder.com/400x300/${product.category === 'themes' ? '007bff' : '28a745'}/ffffff?text=${product.title}`;
        }}
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title className="text-truncate" title={product.title}>
          {product.title}
        </Card.Title>
        <Card.Text className="text-muted small flex-grow-1">
          {product.description.length > 100 
            ? `${product.description.substring(0, 100)}...` 
            : product.description}
        </Card.Text>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Badge bg={product.category === 'themes' ? 'primary' : 'success'}>
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Badge>
          <small className="text-muted">
            {product.downloads} downloads
          </small>
        </div>
        
        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mb-3">
            {product.tags.slice(0, 3).map(tag => (
              <Badge key={tag} bg="outline-secondary" className="me-1 mb-1" style={{ fontSize: '0.7rem' }}>
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            size="sm"
            onClick={handleDownload}
            className="flex-grow-1"
          >
            {isAuthenticated ? 'Download' : 'Login to Download'}
          </Button>
          {product.previewUrl && (
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={handlePreview}
            >
              Preview
            </Button>
          )}
        </div>
        
       
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
