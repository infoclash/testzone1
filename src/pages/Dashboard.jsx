// pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Table, Badge, Button, Alert, 
  Spinner, ProgressBar, Modal, Nav
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../config/api';

const dashboardStyles = {
  mainContainer: {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
    minHeight: '100vh',
    paddingTop: '20px',
    color: '#ffffff'
  },
  card: {
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
  },
  darkCard: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    border: '1px solid #333',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(255,255,255,0.1)'
  },
  headerCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '20px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
  },
  blackButton: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
    color: '#ffffff',
    borderRadius: '25px',
    padding: '10px 25px',
    fontWeight: '600'
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [downloads, setDownloads] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [error, setError] = useState(null);

  // Remove downloadStatus from dependency array to prevent infinite loop
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching dashboard data...');
      
      // Small delay to prevent rapid requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch status and history in parallel for better performance
      const [statusResponse, historyResponse] = await Promise.allSettled([
        api.get('/download/status'),
        api.get('/download/history')
      ]);
      
      // Handle status response
      if (statusResponse.status === 'fulfilled' && statusResponse.value.data.success) {
        setDownloadStatus(statusResponse.value.data.status);
        console.log('✅ Status loaded');
      } else {
        console.warn('⚠️ Status fetch failed');
      }
      
      // Handle history response
      if (historyResponse.status === 'fulfilled' && historyResponse.value.data.success) {
        setDownloads(historyResponse.value.data.downloads || []);
        console.log('✅ History loaded:', historyResponse.value.data.downloads?.length || 0);
        
        // Only set download status from history if status wasn't loaded above
        if (statusResponse.status === 'rejected' && historyResponse.value.data.downloadLimits) {
          setDownloadStatus(historyResponse.value.data.downloadLimits);
        }
      } else {
        console.warn('⚠️ History fetch failed');
        setDownloads([]);
      }
      
      // Set fallback status if both failed
      if (statusResponse.status === 'rejected' && 
          (historyResponse.status === 'rejected' || !historyResponse.value.data.downloadLimits)) {
        setDownloadStatus({
          subscription: 'free',
          daily: { used: 0, limit: 15, remaining: 15 },
          monthly: { used: 0, limit: 350, remaining: 350 },
          subscriptionStatus: { active: false, daysLeft: 0 },
          canDownload: true,
          total: 0
        });
      }
      
    } catch (error) {
      console.error('❌ Dashboard error:', error);
      setError('Failed to load dashboard data');
      
      // Set default status on error
      setDownloadStatus({
        subscription: 'free',
        daily: { used: 0, limit: 15, remaining: 15 },
        monthly: { used: 0, limit: 350, remaining: 350 },
        subscriptionStatus: { active: false, daysLeft: 0 },
        canDownload: true,
        total: 0
      });
    } finally {
      setLoading(false);
    }
  }, [user]); // Only depend on user, not downloadStatus

  // Only run once when user is available
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]); // Remove fetchDashboardData from dependencies

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  const handleDownloadAgain = async (productId) => {
    try {
      const response = await api.post(`/download/${productId}`);
      
      if (response.data.success) {
        toast.success(response.data.message);
        if (response.data.downloadUrl) {
          window.open(response.data.downloadUrl, '_blank');
        }
        // Manual refresh after download
        setTimeout(() => {
          handleRefresh();
        }, 1000);
      }
    } catch (error) {
      if (error.response?.status === 429) {
        const errorData = error.response.data;
        if (errorData.limits) {
          const { daily, monthly } = errorData.limits;
          if (daily.remaining <= 0) {
            toast.error(`📅 Daily limit reached! Used ${daily.used}/${daily.limit}. Try tomorrow!`);
          } else if (monthly.remaining <= 0) {
            toast.error(`📊 Monthly limit reached! Used ${monthly.used}/${monthly.limit}.`);
          }
        }
      } else {
        toast.error('Download failed');
      }
    }
  };

  // Safe defaults
  const subscription = downloadStatus?.subscription || 'free';
  const subscriptionStatus = downloadStatus?.subscriptionStatus || { active: false, daysLeft: 0 };
  const dailyUsage = downloadStatus?.daily || { used: 0, limit: 15, remaining: 15 };
  const monthlyUsage = downloadStatus?.monthly || { used: 0, limit: 350, remaining: 350 };
  const canDownload = downloadStatus?.canDownload !== false;
  const totalDownloads = downloadStatus?.total || downloads.length;

  if (loading) {
    return (
      <div style={dashboardStyles.mainContainer}>
        <Container className="mt-5">
          <div className="text-center">
            <div style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '50px', 
              padding: '40px',
              display: 'inline-block',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}>
              <Spinner animation="border" variant="dark" size="lg" />
              <h4 className="mt-3" style={{ color: '#1a1a1a' }}>Loading your dashboard...</h4>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div style={dashboardStyles.mainContainer}>
      <Container className="mt-4">
        {/* Header */}
        <div className="mb-5">
          <Card style={dashboardStyles.headerCard}>
            <Card.Body className="p-5">
              <Row className="align-items-center">
                <Col lg={8}>
                  <h1 className="display-6 fw-bold mb-2">
                    Welcome back, {user?.name || 'User'}! 👋
                  </h1>
                  <div className="d-flex gap-2 flex-wrap">
                    <Badge 
                      bg={subscriptionStatus.active ? 'dark' : 'secondary'} 
                      className="px-3 py-2"
                      style={{ fontSize: '0.9rem', borderRadius: '20px', fontWeight: '600' }}
                    >
                      <i className="fas fa-crown me-2"></i>
                      {subscription.toUpperCase()} MEMBER
                    </Badge>
                  </div>
                </Col>
                <Col lg={4} className="text-lg-end">
                  <Row>
                    <Col md={6} className="mb-3">
                      <Card style={{ backgroundColor: '#000', color: '#fff', borderRadius: '15px' }}>
                        <Card.Body className="text-center p-3">
                          <h5 className="mb-1">{dailyUsage.used}/{dailyUsage.limit}</h5>
                          <p className="mb-2 opacity-75" style={{ fontSize: '0.8rem' }}>Daily</p>
                          <ProgressBar 
                            now={(dailyUsage.used / dailyUsage.limit) * 100} 
                            variant={dailyUsage.used >= dailyUsage.limit ? 'danger' : 'light'}
                            style={{ height: '4px', borderRadius: '10px' }}
                          />
                          <small className="mt-1 d-block opacity-75" style={{ fontSize: '0.7rem' }}>
                            {dailyUsage.remaining} left
                          </small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Card style={{ backgroundColor: '#333', color: '#fff', borderRadius: '15px' }}>
                        <Card.Body className="text-center p-3">
                          <h5 className="mb-1">{monthlyUsage.used}/{monthlyUsage.limit}</h5>
                          <p className="mb-2 opacity-75" style={{ fontSize: '0.8rem' }}>Monthly</p>
                          <ProgressBar 
                            now={(monthlyUsage.used / monthlyUsage.limit) * 100} 
                            variant={monthlyUsage.used >= monthlyUsage.limit ? 'danger' : 'light'}
                            style={{ height: '4px', borderRadius: '10px' }}
                          />
                          <small className="mt-1 d-block opacity-75" style={{ fontSize: '0.7rem' }}>
                            {monthlyUsage.remaining} left
                          </small>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>

        {/* Alerts */}
        <div className="mb-4">
          {dailyUsage.used >= dailyUsage.limit && (
            <Alert variant="danger" style={{ borderRadius: '15px' }}>
              <Alert.Heading>Daily Limit Reached</Alert.Heading>
              <p>You've used all {dailyUsage.limit} daily downloads. Come back tomorrow!</p>
            </Alert>
          )}

          {monthlyUsage.used >= monthlyUsage.limit && dailyUsage.used < dailyUsage.limit && (
            <Alert variant="danger" style={{ borderRadius: '15px' }}>
              <Alert.Heading>Monthly Limit Reached</Alert.Heading>
              <p>You've used all {monthlyUsage.limit} monthly downloads.</p>
            </Alert>
          )}

          {dailyUsage.used >= dailyUsage.limit * 0.8 && dailyUsage.used < dailyUsage.limit && (
            <Alert variant="warning" style={{ borderRadius: '15px' }}>
              <Alert.Heading>Approaching Daily Limit</Alert.Heading>
              <p>You've used {dailyUsage.used} of {dailyUsage.limit} daily downloads. Only {dailyUsage.remaining} left today.</p>
            </Alert>
          )}
        </div>

        {/* Main Content */}
        <Card style={dashboardStyles.card}>
          <Card.Header className="border-0">
            <Nav variant="pills" activeKey={activeTab} onSelect={setActiveTab}>
              {['overview', 'downloads', 'subscription'].map((tab) => (
                <Nav.Item key={tab}>
                  <Nav.Link 
                    eventKey={tab}
                    style={{
                      backgroundColor: activeTab === tab ? '#1a1a1a' : 'transparent',
                      color: activeTab === tab ? '#ffffff' : '#1a1a1a',
                      borderRadius: '25px',
                      margin: '0 5px',
                      fontWeight: '600'
                    }}
                  >
                    <i className={`fas fa-${
                      tab === 'overview' ? 'chart-pie' :
                      tab === 'downloads' ? 'download' : 'crown'
                    } me-2`}></i>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === 'downloads' && ` (${downloads.length})`}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Card.Header>
          
          <Card.Body style={{ minHeight: '500px' }}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h4 className="mb-4">Your Download Statistics</h4>
                
                <Row className="mb-4">
                  {[
                    { 
                      title: "Daily Downloads", 
                      value: dailyUsage.used, 
                      subtitle: `out of ${dailyUsage.limit}`,
                      color: dailyUsage.used >= dailyUsage.limit ? '#dc3545' : '#1a1a1a'
                    },
                    { 
                      title: "Daily Remaining", 
                      value: dailyUsage.remaining, 
                      subtitle: "downloads left today",
                      color: dailyUsage.remaining <= 3 ? '#ffc107' : '#28a745'
                    },
                    { 
                      title: "Monthly Downloads", 
                      value: monthlyUsage.used, 
                      subtitle: `out of ${monthlyUsage.limit}`,
                      color: monthlyUsage.used >= monthlyUsage.limit ? '#dc3545' : '#007bff'
                    },
                    { 
                      title: "Monthly Remaining", 
                      value: monthlyUsage.remaining, 
                      subtitle: "downloads left this month",
                      color: monthlyUsage.remaining <= 50 ? '#ffc107' : '#28a745'
                    },
                    { 
                      title: "Total Downloads", 
                      value: totalDownloads, 
                      subtitle: "all time",
                      color: '#6c757d'
                    }
                  ].map((stat, index) => (
                    <Col lg={2} md={4} sm={6} key={index} className="mb-4">
                      <Card 
                        style={{
                          backgroundColor: stat.color,
                          color: '#ffffff',
                          borderRadius: '15px',
                          border: 'none'
                        }}
                        className="h-100"
                      >
                        <Card.Body className="text-center p-3">
                          <h3 className="mb-2" style={{ fontWeight: 'bold' }}>{stat.value}</h3>
                          <p className="mb-1 fw-semibold" style={{ fontSize: '0.9rem' }}>{stat.title}</p>
                          <small className="opacity-75" style={{ fontSize: '0.8rem' }}>{stat.subtitle}</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Progress Cards */}
                <Row>
                  <Col md={6}>
                    <Card style={dashboardStyles.darkCard}>
                      <Card.Body className="p-4">
                        <h5 className="mb-3">Daily Usage</h5>
                        <div className="d-flex justify-content-between mb-3">
                          <span>Used: <strong>{dailyUsage.used}</strong></span>
                          <span>Left: <strong>{dailyUsage.remaining}</strong></span>
                        </div>
                        <ProgressBar 
                          now={(dailyUsage.used / dailyUsage.limit) * 100}
                          variant={dailyUsage.used >= dailyUsage.limit * 0.9 ? 'danger' : 'light'}
                          style={{ height: '15px', borderRadius: '10px' }}
                        />
                        <small className="mt-2 d-block opacity-75">
                          Daily Limit: {dailyUsage.limit} downloads
                        </small>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card style={dashboardStyles.darkCard}>
                      <Card.Body className="p-4">
                        <h5 className="mb-3">Monthly Usage</h5>
                        <div className="d-flex justify-content-between mb-3">
                          <span>Used: <strong>{monthlyUsage.used}</strong></span>
                          <span>Left: <strong>{monthlyUsage.remaining}</strong></span>
                        </div>
                        <ProgressBar 
                          now={(monthlyUsage.used / monthlyUsage.limit) * 100}
                          variant={monthlyUsage.used >= monthlyUsage.limit * 0.9 ? 'danger' : 'light'}
                          style={{ height: '15px', borderRadius: '10px' }}
                        />
                        <small className="mt-2 d-block opacity-75">
                          Monthly Limit: {monthlyUsage.limit} downloads
                        </small>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {/* Downloads Tab */}
            {activeTab === 'downloads' && (
              <div>
                <h4 className="mb-4">Your Download History</h4>
                
                {downloads.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover>
                      <thead style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
                        <tr>
                          <th style={{ padding: '15px' }}>Product</th>
                          <th style={{ padding: '15px' }}>Category</th>
                          <th style={{ padding: '15px' }}>Downloaded</th>
                          <th style={{ padding: '15px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {downloads.map((download, index) => (
                          <tr key={download._id}>
                            <td style={{ padding: '20px' }}>
                              <h6 className="mb-1 fw-bold">
                                {download.productId?.title || 'Product Unavailable'}
                              </h6>
                            </td>
                            <td style={{ padding: '20px' }}>
                              <Badge bg="primary" style={{ borderRadius: '20px', padding: '8px 15px' }}>
                                {download.productId?.category || 'Unknown'}
                              </Badge>
                            </td>
                            <td style={{ padding: '20px' }}>
                              <div>
                                <div className="fw-bold">
                                  {new Date(download.downloadDate).toLocaleDateString()}
                                </div>
                                <small className="text-muted">
                                  {new Date(download.downloadDate).toLocaleTimeString()}
                                </small>
                              </div>
                            </td>
                            <td style={{ padding: '20px' }}>
                              <Button 
                                size="sm" 
                                variant={canDownload && (dailyUsage.remaining > 0 && monthlyUsage.remaining > 0) ? "outline-success" : "outline-danger"}
                                style={{ borderRadius: '25px' }}
                                onClick={() => handleDownloadAgain(download.productId?._id)}
                                disabled={!canDownload || dailyUsage.remaining <= 0 || monthlyUsage.remaining <= 0}
                                title={!canDownload ? "Download limit reached" : "Download again"}
                              >
                                <i className="fas fa-download"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <h4 className="mb-3">No downloads yet</h4>
                    <p className="text-muted mb-4">Start exploring our collection!</p>
                    <Button style={dashboardStyles.blackButton} href="/products">
                      <i className="fas fa-search me-2"></i>
                      Browse Products
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div>
                <h4 className="mb-4">Your Subscription</h4>
                
                <Card style={dashboardStyles.darkCard}>
                  <Card.Body>
                    <div className="d-flex align-items-center mb-4">
                      <div 
                        style={{
                          width: '80px',
                          height: '80px',
                          backgroundColor: subscription === 'premium' ? '#ffc107' : '#6c757d',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '20px'
                        }}
                      >
                        <i className={`fas fa-${subscription === 'premium' ? 'crown' : 'user'} text-white`} style={{ fontSize: '2rem' }}></i>
                      </div>
                      <div>
                        <h3 className="mb-1 text-capitalize">{subscription} Plan</h3>
                        <p className="text-muted mb-0">
                          {subscription === 'premium' 
                            ? `500 downloads per month` 
                            : `15 daily, 350 monthly downloads`
                          }
                        </p>
                      </div>
                    </div>

                    {subscription === 'free' && (
                      <Alert variant="light" style={{ borderRadius: '15px' }}>
                        <h6>Free Plan Features:</h6>
                        <ul className="mb-3">
                          <li>15 downloads per day</li>
                          <li>350 downloads per month</li>
                          <li>Access to free products</li>
                          <li>Basic support</li>
                        </ul>
                        <Button 
                          style={dashboardStyles.blackButton}
                          onClick={() => setShowUpgradeModal(true)}
                        >
                          Upgrade to Premium
                        </Button>
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Refresh Button */}
        <div className="text-center mt-4 mb-4">
          <Button 
            variant="outline-light"
            onClick={handleRefresh}
            style={{ borderRadius: '25px', padding: '12px 30px' }}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh Dashboard
          </Button>
        </div>
      </Container>

      {/* Upgrade Modal */}
      <Modal show={showUpgradeModal} onHide={() => setShowUpgradeModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
          <Modal.Title>Upgrade to Premium</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <h3>Unlock More Downloads!</h3>
            <p className="text-muted">Get 500 downloads per month with premium</p>
          </div>
          
          <Row>
            <Col md={6}>
              <div className="p-3 text-center" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                <h5>Free Plan</h5>
                <ul className="text-start">
                  <li>15 downloads/day</li>
                  <li>350 downloads/month</li>
                </ul>
                <h4>$0/month</h4>
              </div>
            </Col>
            <Col md={6}>
              <div className="p-3 text-center" style={{ backgroundColor: '#1a1a1a', color: '#fff', borderRadius: '10px' }}>
                <h5 className="text-warning">Premium Plan</h5>
                <ul className="text-start">
                  <li>15 downloads/day</li>
                  <li><strong>500 downloads/month</strong></li>
                  <li>Priority support</li>
                </ul>
                <h4 className="text-warning">$9.99/month</h4>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowUpgradeModal(false)}>
            Maybe Later
          </Button>
          <Button style={dashboardStyles.blackButton} href="mailto:admin@example.com">
            Contact Admin
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
