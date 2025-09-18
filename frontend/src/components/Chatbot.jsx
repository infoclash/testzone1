// components/Chatbot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Badge, ProgressBar, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../config/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [downloadStats, setDownloadStats] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isAuthenticated && user && isOpen) {
      fetchDownloadStats();
    }
  }, [isAuthenticated, user, isOpen]);

  const initializeChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      text: isAuthenticated && user 
        ? `👋 Welcome back, ${user.name}! I'm your WordPress assistant. I can help you find amazing themes and plugins!`
        : '👋 Hi! I\'m your WordPress assistant. I can help you discover amazing themes and plugins! Login to download (15/day, 350/month free!).',
      timestamp: new Date(),
      quickActions: [
       
        ...(isAuthenticated && user ? [{ text: '📊 My Stats', action: 'show_stats' }] : [])
      ]
    };
    setMessages([welcomeMessage]);
  };

  const fetchDownloadStats = async () => {
    if (!isAuthenticated || !user) {
      console.log('❌ Cannot fetch stats - user not authenticated');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('📊 Fetching download stats for user:', user.email);
      
      const response = await api.get('/chatbot/stats');
      if (response.data.success) {
        setDownloadStats(response.data.stats);
        console.log('✅ Stats fetched:', response.data.stats);
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      if (error.response?.status === 401) {
        toast.error('Please login again to view your stats');
      } else {
        toast.error('Failed to load download statistics');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev, { ...message, id: Date.now() + Math.random() }]);
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || message.trim();
    if (!textToSend) return;

    const userMessage = {
      type: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    addMessage(userMessage);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await api.post('/chatbot/chat', { 
        message: textToSend,
        context: {
          isLoggedIn: isAuthenticated,
          userId: user?.id,
          userEmail: user?.email
        }
      });
      
      setTimeout(() => {
        if (response.data.success) {
          const botMessage = {
            type: 'bot',
            ...response.data.response,
            timestamp: new Date()
          };
          addMessage(botMessage);
          
          if (!isOpen) {
            setUnreadCount(prev => prev + 1);
          }
        }
        setIsTyping(false);
      }, 800 + Math.random() * 800);

    } catch (error) {
      console.error('❌ Chat error:', error);
      const errorMessage = {
        type: 'bot',
        text: '😅 Sorry, I\'m having technical difficulties. Please try again in a moment!',
        timestamp: new Date(),
        isError: true,
        quickActions: [
          { text: '🔄 Try Again', action: 'help' },
          { text: '🎨 Browse Themes', action: 'show_themes' }
        ]
      };
      addMessage(errorMessage);
      setIsTyping(false);
      toast.error('Chat temporarily unavailable');
    }
  };

  const handleQuickAction = async (action) => {
    const actionMap = {
      'show_themes': 'Show WordPress themes',
      'show_plugins': 'Show WordPress plugins',
      'show_featured': 'Show featured products',
      'show_stats': 'Show my download statistics',
      'show_latest': 'Show latest products',
      'help': 'I need help'
    };

    if (action === 'show_stats') {
      if (!isAuthenticated || !user) {
        const loginMessage = {
          type: 'bot',
          text: '🔐 Please login to view your download statistics.\n\n**Why login?**\n• Track your downloads (15/day limit)\n• Access premium features\n• Personalized recommendations\n• Download history',
          timestamp: new Date(),
          requiresLogin: true
        };
        addMessage(loginMessage);
        return;
      }
      
      await fetchDownloadStats();
      
      if (downloadStats) {
        const statsMessage = {
          type: 'bot',
          text: '📊 Here are your current download statistics:',
          showStats: true,
          stats: downloadStats,
          timestamp: new Date()
        };
        addMessage(statsMessage);
      } else {
        const errorMessage = {
          type: 'bot',
          text: '❌ Unable to load your statistics right now. Please try again later.',
          timestamp: new Date(),
          isError: true
        };
        addMessage(errorMessage);
      }
    } else {
      handleSendMessage(actionMap[action] || action);
    }
  };

  const handleDownload = async (product) => {
    if (!isAuthenticated || !user) {
      const loginMessage = {
        type: 'bot',
        text: '🔐 **Please login to download products!**\n\nRegistration is completely free and includes:\n\n• **15 downloads per day**\n• **350 downloads per month**\n• Access to premium themes & plugins\n• Download history tracking\n• Priority support\n\nUpgrade to Premium for **500 downloads/month**!',
        timestamp: new Date(),
        requiresLogin: true,
        quickActions: [
          { text: '🔑 Go to Login', action: 'login' },
          { text: '📝 Register Free', action: 'register' }
        ]
      };
      addMessage(loginMessage);
      toast.warning('Please login to download products');
      return;
    }

    try {
      console.log('📥 Attempting download:', {
        productId: product._id,
        productTitle: product.title,
        userEmail: user.email
      });

      const response = await api.post(`/chatbot/download/${product._id}`);
      
      if (response.data.success) {
        const downloadMessage = {
          type: 'bot',
          text: response.data.message,
          timestamp: new Date(),
          downloadSuccess: true,
          downloadData: {
            productTitle: product.title,
            downloadUrl: response.data.downloadUrl,
            limits: response.data.limits
          }
        };
        
        addMessage(downloadMessage);
        
        // Refresh stats
        await fetchDownloadStats();
        
        // Open download in new tab
        setTimeout(() => {
          window.open(response.data.downloadUrl, '_blank');
        }, 500);
        
        toast.success(`🎉 ${product.title} download started!`, {
          position: "bottom-right",
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('❌ Download error:', error);
      const errorData = error.response?.data;
      
      if (errorData?.limitReached) {
        const limitMessage = {
          type: 'bot',
          text: `🚫 **Download Limit Reached!**\n\n${errorData.message}\n\n📊 **Current Usage:**\n• Daily: ${errorData.limits.daily.used}/${errorData.limits.daily.limit} downloads\n• Monthly: ${errorData.limits.monthly.used}/${errorData.limits.monthly.limit} downloads\n\n💡 **Tip:** Limits reset automatically every 24 hours (daily) and monthly.`,
          timestamp: new Date(),
          limitReached: true,
          limits: errorData.limits,
          quickActions: [
            { text: '📊 Check My Stats', action: 'show_stats' },
            { text: '⭐ Browse Featured', action: 'show_featured' }
          ]
        };
        addMessage(limitMessage);
        toast.error('Download limit reached!', {
          position: "bottom-right",
          autoClose: 5000
        });
      } else if (error.response?.status === 404) {
        const notFoundMessage = {
          type: 'bot',
          text: `❌ Sorry, "${product.title}" was not found or is no longer available for download. It may have been removed or temporarily disabled.`,
          timestamp: new Date(),
          isError: true,
          quickActions: [
            { text: '🔄 Browse Similar', action: product.category === 'themes' ? 'show_themes' : 'show_plugins' },
            { text: '⭐ Show Featured', action: 'show_featured' }
          ]
        };
        addMessage(notFoundMessage);
        toast.error('Product not found');
      } else {
        const errorMessage = {
          type: 'bot',
          text: `❌ Sorry, couldn't download "${product.title}". ${errorData?.message || 'Please try again later.'}\n\nIf this problem persists, please contact support.`,
          timestamp: new Date(),
          isError: true,
          quickActions: [
            { text: '🔄 Try Again', action: 'help' },
            { text: '📧 Contact Support', action: 'support' }
          ]
        };
        addMessage(errorMessage);
        toast.error(errorData?.message || 'Download failed');
      }
    }
  };

  const handlePreview = (product) => {
    if (product.previewUrl) {
      window.open(product.previewUrl, '_blank');
      const previewMessage = {
        type: 'bot',
        text: `🔍 Opening live preview for "${product.title}" in a new tab! Take your time to explore all the features.`,
        timestamp: new Date()
      };
      addMessage(previewMessage);
      toast.info('Preview opened in new tab', {
        position: "bottom-right",
        autoClose: 2000
      });
    } else {
      const noPreviewMessage = {
        type: 'bot',
        text: `😔 Sorry, live preview is not available for "${product.title}" at the moment. You can still download it to see all its features!`,
        timestamp: new Date()
      };
      addMessage(noPreviewMessage);
      toast.info('Preview not available for this product');
    }
  };

  // Closed chatbot button
  if (!isOpen) {
    return (
      <div 
        className="smart-chat-widget"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000
        }}
      >
        <div className="smart-chat-toggle">
          <Button 
            onClick={() => {
              setIsOpen(true);
              setUnreadCount(0);
            }}
            className="smart-chat-fab"
          >
            <div className="smart-chat-icon">💬</div>
            <div className="smart-chat-pulse"></div>
          </Button>
          {unreadCount > 0 && (
            <Badge 
              bg="danger" 
              pill 
              className="smart-chat-badge"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Main chat interface
  return (
    <div 
      className="smart-chat-wrapper"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '420px',
        height: '650px',
        zIndex: 1000,
        maxWidth: '90vw',
        maxHeight: '90vh'
      }}
    >
      <Card className="smart-chat-container">
        {/* Header */}
        <Card.Header className="smart-chat-header">
          <div className="smart-chat-header-content">
            <div className="smart-chat-avatar">
              <div className="smart-chat-status"></div>
              <div className="smart-chat-avatar-icon">🤖</div>
            </div>
            <div className="smart-chat-header-info">
              <h6 className="smart-chat-title">WordPress Assistant</h6>
              <small className="smart-chat-subtitle">
                {isAuthenticated && user && downloadStats ? 
                  `${downloadStats.daily.remaining}/${downloadStats.daily.limit} downloads left today` : 
                  'Login for downloads'
                }
              </small>
            </div>
          </div>
          <Button 
            variant="link" 
            className="smart-chat-close"
            onClick={() => setIsOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        </Card.Header>

        {/* Download Progress */}
        {downloadStats && isAuthenticated && user && (
          <div className="smart-chat-progress">
            <div className="smart-chat-progress-header">
              <span className="smart-chat-progress-label">Daily Downloads</span>
              <span className="smart-chat-progress-value">
                {downloadStats.daily.used}/{downloadStats.daily.limit}
              </span>
            </div>
            <ProgressBar 
              now={(downloadStats.daily.used / downloadStats.daily.limit) * 100}
              className="smart-chat-progress-bar"
              variant={
                downloadStats.daily.remaining > 10 ? 'success' : 
                downloadStats.daily.remaining > 5 ? 'info' :
                downloadStats.daily.remaining > 0 ? 'warning' : 'danger'
              }
            />
            <div className="smart-chat-progress-footer">
              <small>{downloadStats.daily.remaining} remaining</small>
              <small>Monthly: {downloadStats.monthly.used}/{downloadStats.monthly.limit}</small>
            </div>
          </div>
        )}
        
        {/* Messages */}
        <Card.Body className="smart-chat-messages">
          <div className="smart-chat-messages-container">
            {messages.map((msg) => (
              <div key={msg.id} className={`smart-chat-message ${msg.type === 'user' ? 'smart-chat-user-message' : 'smart-chat-bot-message'}`}>
                <div className={`smart-chat-bubble ${msg.type === 'user' ? 'smart-chat-user-bubble' : 'smart-chat-bot-bubble'} ${msg.isError ? 'smart-chat-error-bubble' : ''}`}>
                  {/* Message text */}
                  <div className="smart-chat-text">
                    {msg.text}
                  </div>

                  {/* Quick Actions */}
                  {msg.quickActions && (
                    <div className="smart-chat-actions">
                      <div className="smart-chat-action-buttons">
                        {msg.quickActions.map((action, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            className="smart-chat-action-btn"
                            onClick={() => handleQuickAction(action.action)}
                          >
                            {action.text}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="smart-chat-products">
                      {msg.products.map(product => (
                        <div key={product._id} className="smart-product-card">
                          <div className="smart-product-header">
                            <div className="smart-product-info">
                              <h6 className="smart-product-title">{product.title}</h6>
                              <div className="smart-product-badges">
                                <Badge className={`smart-badge ${product.category === 'themes' ? 'smart-badge-theme' : 'smart-badge-plugin'}`}>
                                  {product.category === 'themes' ? '🎨' : '🔌'} {product.category}
                                </Badge>
                                {product.featured && (
                                  <Badge className="smart-badge smart-badge-featured">⭐ Featured</Badge>
                                )}
                              </div>
                              <div className="smart-product-stats">
                                📥 {(product.downloads || 0).toLocaleString()} downloads
                              </div>
                            </div>
                          </div>
                          
                          <div className="smart-product-actions">
                            {product.previewUrl && (
                              <Button 
                                size="sm" 
                                className="smart-product-btn smart-preview-btn"
                                onClick={() => handlePreview(product)}
                              >
                                👁️ Preview
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              className={`smart-product-btn ${
                                isAuthenticated && user && downloadStats?.daily.remaining > 0 
                                  ? 'smart-download-btn' 
                                  : 'smart-disabled-btn'
                              }`}
                              onClick={() => handleDownload(product)}
                              disabled={isAuthenticated && user && downloadStats?.daily.remaining <= 0}
                            >
                              {isAuthenticated && user 
                                ? downloadStats?.daily.remaining > 0 
                                  ? '📥 Download' 
                                  : '⏰ Limit Reached'
                                : '🔐 Login Required'
                              }
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {msg.noResults && (
                    <div className="smart-chat-no-results">
                      <div className="smart-no-results-icon">🔍</div>
                      <div className="smart-no-results-title">No products found</div>
                      {msg.suggestions && (
                        <div className="smart-suggestions">
                          <small className="smart-suggestions-label">Try these popular searches:</small>
                          <div className="smart-suggestions-buttons">
                            {msg.suggestions.map((suggestion, idx) => (
                              <Button
                                key={idx}
                                size="sm"
                                className="smart-suggestion-btn"
                                onClick={() => handleSendMessage(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Download Success */}
                  {msg.downloadSuccess && (
                    <div className="smart-success-card">
                      <div className="smart-success-title">🎉 Download Started Successfully!</div>
                      <div className="smart-success-product">
                        <strong>{msg.downloadData.productTitle}</strong>
                      </div>
                      {msg.downloadData.limits && (
                        <div className="smart-success-limits">
                          <strong>Remaining Today:</strong> {msg.downloadData.limits.daily.remaining}/{msg.downloadData.limits.daily.limit}<br/>
                          <strong>Monthly:</strong> {msg.downloadData.limits.monthly.remaining}/{msg.downloadData.limits.monthly.limit}
                        </div>
                      )}
                      <div className="smart-success-tip">
                        💡 Download will open in a new tab automatically
                      </div>
                    </div>
                  )}

                  {/* Limit Reached */}
                  {msg.limitReached && (
                    <div className="smart-warning-card">
                      <div className="smart-warning-title">⏰ Download Limit Reached</div>
                      <div className="smart-warning-text">
                        Your download limits will reset automatically. Daily limits reset every 24 hours, monthly limits reset on the 1st of each month.
                      </div>
                    </div>
                  )}

                  {/* Stats Display */}
                  {msg.showStats && downloadStats && (
                    <div className="smart-stats-card">
                      <div className="smart-stats-title">📊 Your Download Statistics</div>
                      <div className="smart-stats-grid">
                        <div className="smart-stat-item">
                          <div className="smart-stat-value smart-stat-total">{downloadStats.total}</div>
                          <small className="smart-stat-label">Total</small>
                        </div>
                        <div className="smart-stat-item">
                          <div className="smart-stat-value smart-stat-today">{downloadStats.daily.used}</div>
                          <small className="smart-stat-label">Today</small>
                        </div>
                        <div className="smart-stat-item">
                          <div className="smart-stat-value smart-stat-remaining">{downloadStats.daily.remaining}</div>
                          <small className="smart-stat-label">Remaining</small>
                        </div>
                      </div>
                      <div className="smart-stats-footer">
                        <div className="smart-stats-monthly">
                          <strong>Monthly Usage:</strong> {downloadStats.monthly.used}/{downloadStats.monthly.limit}
                        </div>
                        <div className="smart-stats-subscription">
                          <strong>Subscription:</strong> {downloadStats.subscription.charAt(0).toUpperCase() + downloadStats.subscription.slice(1)}
                          {downloadStats.subscription === 'free' && (
                            <span className="smart-upgrade-text"> (Upgrade for 500/month!)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Login Required */}
                  {msg.requiresLogin && (
                    <div className="smart-login-card">
                      <div className="smart-login-icon">🔐</div>
                      <div className="smart-login-title">Login Required</div>
                      <small className="smart-login-text">
                        Join our community for free downloads and exclusive content!
                      </small>
                    </div>
                  )}
                </div>
                
                <div className={`smart-chat-timestamp ${msg.type === 'user' ? 'smart-timestamp-right' : 'smart-timestamp-left'}`}>
                  <small>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="smart-chat-message smart-chat-bot-message">
                <div className="smart-chat-bubble smart-chat-bot-bubble">
                  <div className="smart-typing-indicator">
                    <div className="smart-typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <small className="smart-typing-text">Assistant is typing...</small>
                  </div>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="smart-loading-indicator">
                <Spinner animation="border" size="sm" className="smart-spinner" />
                <small className="smart-loading-text">Loading...</small>
              </div>
            )}
          </div>
          
          <div ref={messagesEndRef} />
        </Card.Body>
        
        {/* Input */}
        <Card.Footer className="smart-chat-footer">
          <Form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
            <div className="smart-chat-input-group">
              <Form.Control
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Search themes, plugins, or ask for help..."
                disabled={isTyping || isLoading}
                className="smart-chat-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                type="submit" 
                disabled={!message.trim() || isTyping || isLoading}
                className={`smart-chat-send-btn ${message.trim() && !isTyping && !isLoading ? 'smart-send-active' : 'smart-send-inactive'}`}
              >
                {isTyping || isLoading ? <Spinner size="sm" /> : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                  </svg>
                )}
              </Button>
            </div>
          </Form>
        </Card.Footer>
      </Card>

      <style jsx>{`
        /* Smart Chat Widget Styles */
        .smart-chat-widget {
          position: relative;
        }

        .smart-chat-toggle {
          position: relative;
        }

        .smart-chat-fab {
          width: 64px !important;
          height: 64px !important;
          border-radius: 50% !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          border: none !important;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          position: relative !important;
          overflow: hidden !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .smart-chat-fab:hover {
          transform: scale(1.05) translateY(-2px) !important;
          box-shadow: 0 12px 40px rgba(102, 126, 234, 0.6) !important;
        }

        .smart-chat-icon {
          font-size: 1.8rem;
          z-index: 2;
          position: relative;
        }

        .smart-chat-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          animation: smart-pulse 2s infinite;
        }

        @keyframes smart-pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
          }
        }

        .smart-chat-badge {
          position: absolute !important;
          top: -8px !important;
          right: -8px !important;
          min-width: 24px !important;
          height: 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 0.75rem !important;
          font-weight: 700 !important;
          border: 2px solid #ffffff !important;
        }

        /* Main Chat Container */
        .smart-chat-wrapper {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .smart-chat-container {
          height: 100% !important;
          border-radius: 24px !important;
          overflow: hidden !important;
          border: none !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
          backdrop-filter: blur(20px) !important;
        }

        /* Header */
        .smart-chat-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          border: none !important;
          padding: 20px !important;
          color: #ffffff !important;
        }

        .smart-chat-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .smart-chat-avatar {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .smart-chat-avatar-icon {
          font-size: 1.2rem;
        }

        .smart-chat-status {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          background: #10b981;
          border: 3px solid #ffffff;
          border-radius: 50%;
        }

        .smart-chat-header-info {
          flex: 1;
        }

        .smart-chat-title {
          margin: 0 !important;
          font-size: 1.1rem !important;
          font-weight: 700 !important;
          color: #ffffff !important;
        }

        .smart-chat-subtitle {
          color: rgba(255, 255, 255, 0.8) !important;
          font-size: 0.85rem !important;
        }

        .smart-chat-close {
          color: #ffffff !important;
          padding: 8px !important;
          border-radius: 12px !important;
          transition: all 0.3s ease !important;
          text-decoration: none !important;
        }

        .smart-chat-close:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          color: #ffffff !important;
        }

        /* Progress Section */
        .smart-chat-progress {
          background: #ffffff !important;
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 16px 20px !important;
          color: #1e293b !important;
        }

        .smart-chat-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .smart-chat-progress-label {
          font-weight: 600;
          font-size: 0.9rem;
          color: #475569;
        }

        .smart-chat-progress-value {
          font-weight: 700;
          color: #667eea;
          font-size: 0.9rem;
        }

        .smart-chat-progress-bar {
          height: 8px !important;
          border-radius: 4px !important;
        }

        .smart-chat-progress-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
        }

        .smart-chat-progress-footer small {
          font-size: 0.75rem;
          color: #64748b;
        }

        /* Messages */
        .smart-chat-messages {
          height: 500px !important;
          overflow-y: auto !important;
          background: #ffffff !important;
          padding: 0 !important;
          color: #1e293b !important;
        }

        .smart-chat-messages-container {
          padding: 20px;
        }

        .smart-chat-message {
          margin-bottom: 20px;
        }

        .smart-chat-user-message {
          text-align: right;
        }

        .smart-chat-bot-message {
          text-align: left;
        }

        .smart-chat-bubble {
          display: inline-block;
          max-width: 85%;
          padding: 16px 20px;
          border-radius: 20px;
          font-size: 0.95rem;
          line-height: 1.5;
          white-space: pre-line;
          word-wrap: break-word;
          color: #1e293b !important;
        }

        .smart-chat-user-bubble {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: #ffffff !important;
          border-bottom-right-radius: 6px !important;
        }

        .smart-chat-bot-bubble {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-bottom-left-radius: 6px !important;
          color: #1e293b !important;
        }

        .smart-chat-error-bubble {
          background: #fef2f2 !important;
          border-color: #fecaca !important;
        }

        .smart-chat-text {
          margin-bottom: 0;
        }

        .smart-chat-timestamp {
          margin-top: 6px;
        }

        .smart-timestamp-right {
          text-align: right;
        }

        .smart-timestamp-left {
          text-align: left;
        }

        .smart-chat-timestamp small {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        /* Quick Actions */
        .smart-chat-actions {
          margin-top: 16px;
        }

        .smart-chat-action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .smart-chat-action-btn {
          background: #ffffff !important;
          border: 1px solid #667eea !important;
          color: #667eea !important;
          border-radius: 20px !important;
          font-size: 0.8rem !important;
          font-weight: 600 !important;
          padding: 6px 16px !important;
          transition: all 0.3s ease !important;
        }

        .smart-chat-action-btn:hover {
          background: #667eea !important;
          color: #ffffff !important;
          transform: translateY(-1px) !important;
        }

        /* Products */
        .smart-chat-products {
          margin-top: 16px;
        }

        .smart-product-card {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 16px !important;
          padding: 16px !important;
          margin-bottom: 12px !important;
          transition: all 0.3s ease !important;
          color: #1e293b !important;
        }

        .smart-product-card:hover {
          border-color: #667eea !important;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15) !important;
          transform: translateY(-2px) !important;
        }

        .smart-product-header {
          margin-bottom: 12px;
        }

        .smart-product-title {
          font-weight: 700 !important;
          color: #1e293b !important;
          font-size: 0.95rem !important;
          margin-bottom: 8px !important;
        }

        .smart-product-badges {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
        }

        .smart-badge {
          font-size: 0.7rem !important;
          padding: 4px 10px !important;
          border-radius: 12px !important;
        }

        .smart-badge-theme {
          background: #ddd6fe !important;
          color: #6d28d9 !important;
        }

        .smart-badge-plugin {
          background: #dcfce7 !important;
          color: #166534 !important;
        }

        .smart-badge-featured {
          background: #fef3c7 !important;
          color: #92400e !important;
        }

        .smart-product-stats {
          font-size: 0.75rem;
          color: #64748b;
        }

        .smart-product-actions {
          display: flex;
          gap: 8px;
        }

        .smart-product-btn {
          flex: 1 !important;
          font-size: 0.8rem !important;
          font-weight: 600 !important;
          border-radius: 12px !important;
          padding: 8px 12px !important;
          transition: all 0.3s ease !important;
        }

        .smart-preview-btn {
          background: #f0f9ff !important;
          border: 1px solid #0ea5e9 !important;
          color: #0ea5e9 !important;
        }

        .smart-preview-btn:hover {
          background: #0ea5e9 !important;
          color: #ffffff !important;
        }

        .smart-download-btn {
          background: #667eea !important;
          border: 1px solid #667eea !important;
          color: #ffffff !important;
        }

        .smart-download-btn:hover {
          background: #5a67d8 !important;
          transform: translateY(-1px) !important;
        }

        .smart-disabled-btn {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          color: #94a3b8 !important;
        }

        /* Special Message Cards */
        .smart-chat-no-results {
          text-align: center;
          margin-top: 16px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .smart-no-results-icon {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .smart-no-results-title {
          font-weight: 700;
          color: #64748b;
          margin-bottom: 12px;
        }

        .smart-suggestions-label {
          display: block;
          margin-bottom: 8px;
          color: #64748b;
        }

        .smart-suggestions-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
        }

        .smart-suggestion-btn {
          background: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          color: #475569 !important;
          border-radius: 16px !important;
          font-size: 0.75rem !important;
          padding: 4px 12px !important;
        }

        .smart-suggestion-btn:hover {
          background: #f1f5f9 !important;
          border-color: #667eea !important;
          color: #667eea !important;
        }

        .smart-success-card {
          margin-top: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #d1fae5 0%, #ecfccb 100%);
          border-radius: 12px;
          color: #166534;
        }

        .smart-success-title {
          font-weight: 700;
          margin-bottom: 8px;
        }

        .smart-success-product {
          color: #15803d;
          margin-bottom: 8px;
        }

        .smart-success-limits {
          font-size: 0.85rem;
          color: #166534;
          margin-bottom: 8px;
        }

        .smart-success-tip {
          font-size: 0.85rem;
          color: #0ea5e9;
        }

        .smart-warning-card {
          margin-top: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 12px;
          color: #92400e;
        }

        .smart-warning-title {
          font-weight: 700;
          margin-bottom: 8px;
        }

        .smart-warning-text {
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .smart-stats-card {
          margin-top: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 12px;
          color: #0c4a6e;
        }

        .smart-stats-title {
          font-weight: 700;
          text-align: center;
          margin-bottom: 16px;
        }

        .smart-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 16px;
          text-align: center;
        }

        .smart-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .smart-stat-value {
          font-weight: 700;
          font-size: 1.5rem;
          margin-bottom: 4px;
        }

        .smart-stat-total {
          color: #667eea;
        }

        .smart-stat-today {
          color: #10b981;
        }

        .smart-stat-remaining {
          color: #0ea5e9;
        }

        .smart-stat-label {
          color: #64748b;
          font-size: 0.75rem;
        }

        .smart-stats-footer {
          text-align: center;
          border-top: 1px solid rgba(14, 165, 233, 0.2);
          padding-top: 12px;
        }

        .smart-stats-monthly {
          font-size: 0.85rem;
          margin-bottom: 4px;
        }

        .smart-stats-subscription {
          font-size: 0.85rem;
        }

        .smart-upgrade-text {
          color: #667eea;
        }

        .smart-login-card {
          margin-top: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          border-radius: 12px;
          text-align: center;
          color: #3730a3;
        }

        .smart-login-icon {
          font-size: 1.5rem;
          margin-bottom: 8px;
        }

        .smart-login-title {
          font-weight: 700;
          margin-bottom: 8px;
        }

        .smart-login-text {
          color: #4338ca;
        }

        /* Typing Indicator */
        .smart-typing-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .smart-typing-dots {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .smart-typing-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #667eea;
          animation: smart-typing-bounce 1.4s infinite ease-in-out;
        }

        .smart-typing-dots span:nth-child(1) { 
          animation-delay: -0.32s; 
        }
        .smart-typing-dots span:nth-child(2) { 
          animation-delay: -0.16s; 
        }

        @keyframes smart-typing-bounce {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .smart-typing-text {
          color: #64748b;
          margin-left: 8px;
        }

        /* Loading Indicator */
        .smart-loading-indicator {
          text-align: center;
          margin-bottom: 16px;
        }

        .smart-spinner {
          color: #667eea !important;
        }

        .smart-loading-text {
          margin-left: 12px;
          color: #64748b;
        }

        /* Footer Input */
        .smart-chat-footer {
          background: #ffffff !important;
          border-top: 1px solid #f1f5f9 !important;
          padding: 20px !important;
        }

        .smart-chat-input-group {
          display: flex;
          gap: 12px;
          align-items: end;
        }

        .smart-chat-input {
          flex: 1 !important;
          border-radius: 24px !important;
          border: 2px solid #e2e8f0 !important;
          padding: 12px 20px !important;
          font-size: 0.9rem !important;
          color: #1e293b !important;
          background: #ffffff !important;
          transition: all 0.3s ease !important;
        }

        .smart-chat-input:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
          outline: none !important;
        }

        .smart-chat-input::placeholder {
          color: #94a3b8 !important;
        }

        .smart-chat-send-btn {
          width: 48px !important;
          height: 48px !important;
          border-radius: 50% !important;
          border: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s ease !important;
        }

        .smart-send-active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: #ffffff !important;
          transform: scale(1) !important;
        }

        .smart-send-active:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4) !important;
        }

        .smart-send-inactive {
          background: #f1f5f9 !important;
          color: #cbd5e1 !important;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .smart-chat-wrapper {
            width: 100vw !important;
            height: 100vh !important;
            bottom: 0 !important;
            right: 0 !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
          }
          
          .smart-chat-container {
            border-radius: 0 !important;
            height: 100vh !important;
          }

          .smart-chat-messages {
            height: calc(100vh - 200px) !important;
          }

          .smart-product-actions {
            flex-direction: column;
          }
        }

        /* Scrollbar Styling */
        .smart-chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .smart-chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .smart-chat-messages::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .smart-chat-messages::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;