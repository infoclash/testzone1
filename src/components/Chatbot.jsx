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
  const { user } = useAuth();
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
    if (user && isOpen) {
      fetchDownloadStats();
    }
  }, [user, isOpen]);

  const initializeChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      text: user 
        ? `👋 Welcome back, ${user.name}! I'm your personal WordPress product assistant. I can help you discover amazing themes and plugins!`
        : '👋 Hi there! I\'m your WordPress product assistant. I can help you discover amazing themes and plugins! Please login to download products.',
      timestamp: new Date(),
      quickActions: [
        { text: '🎨 Browse Themes', action: 'show_themes' },
        { text: '🔌 Browse Plugins', action: 'show_plugins' },
        { text: '⭐ Featured Products', action: 'show_featured' },
        ...(user ? [{ text: '📊 My Download Stats', action: 'show_stats' }] : [])
      ]
    };
    setMessages([welcomeMessage]);
  };

  const fetchDownloadStats = async () => {
    if (!user) return;
    
    try {
      const response = await api.get('/chatbot/stats');
      if (response.data.success) {
        setDownloadStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev, { ...message, id: Date.now() + Math.random() }]);
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || message.trim();
    if (!textToSend) return;

    // Add user message
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
          isLoggedIn: !!user,
          userId: user?.id
        }
      });
      
      // Simulate typing delay for better UX
      setTimeout(() => {
        if (response.data.success) {
          const botMessage = {
            type: 'bot',
            ...response.data.response,
            timestamp: new Date()
          };
          addMessage(botMessage);
          
          // Update unread count if chat is closed
          if (!isOpen) {
            setUnreadCount(prev => prev + 1);
          }
        }
        setIsTyping(false);
      }, 800 + Math.random() * 1200); // Variable typing delay

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        type: 'bot',
        text: '😅 Sorry, I\'m experiencing some technical difficulties. Please try again in a moment!',
        timestamp: new Date(),
        isError: true
      };
      addMessage(errorMessage);
      setIsTyping(false);
      toast.error('Chat service temporarily unavailable');
    }
  };

  const handleQuickAction = async (action) => {
    const actionMap = {
      'show_themes': 'Show me all WordPress themes',
      'show_plugins': 'Show me all WordPress plugins',
      'show_featured': 'Show me featured products',
      'show_stats': 'Show my download statistics',
      'show_latest': 'Show me latest products',
      'help': 'I need help'
    };

    if (action === 'show_stats') {
      if (!user) {
        const loginMessage = {
          type: 'bot',
          text: '🔐 Please login to view your download statistics.',
          timestamp: new Date(),
          requiresLogin: true
        };
        addMessage(loginMessage);
        return;
      }
      
      await fetchDownloadStats();
      const statsMessage = {
        type: 'bot',
        text: '📊 Here are your current download statistics:',
        showStats: true,
        stats: downloadStats,
        timestamp: new Date()
      };
      addMessage(statsMessage);
    } else {
      handleSendMessage(actionMap[action] || action);
    }
  };

  const handleDownload = async (product) => {
    if (!user) {
      const loginMessage = {
        type: 'bot',
        text: '🔐 Please login to download products. Registration is free and takes just a minute!',
        timestamp: new Date(),
        requiresLogin: true
      };
      addMessage(loginMessage);
      toast.warning('Please login to download products');
      return;
    }

    try {
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
            remainingDownloads: response.data.remainingDownloads
          }
        };
        
        addMessage(downloadMessage);
        
        // Refresh stats
        await fetchDownloadStats();
        
        // Open download in new tab
        window.open(response.data.downloadUrl, '_blank');
        
        toast.success(`🎉 ${product.title} download started!`);
      }
    } catch (error) {
      const errorData = error.response?.data;
      
      if (errorData?.limitReached) {
        const limitMessage = {
          type: 'bot',
          text: errorData.message,
          timestamp: new Date(),
          limitReached: true,
          resetTime: errorData.nextResetTime
        };
        addMessage(limitMessage);
        toast.error('⏰ Daily download limit reached!');
      } else {
        const errorMessage = {
          type: 'bot',
          text: `❌ Sorry, couldn't download "${product.title}". ${errorData?.message || 'Please try again later.'}`,
          timestamp: new Date(),
          isError: true
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
        text: `🔍 Opening preview for "${product.title}" in a new tab!`,
        timestamp: new Date()
      };
      addMessage(previewMessage);
    } else {
      toast.info('Preview not available for this product');
    }
  };

  const formatTimeUntilReset = (resetTime) => {
    const now = new Date();
    const reset = new Date(resetTime);
    const diff = Math.max(0, reset - now);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // Closed state
  if (!isOpen) {
    return (
      <div 
        className="chatbot-toggle"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000
        }}
      >
        <div className="position-relative">
          <Button 
            onClick={() => {
              setIsOpen(true);
              setUnreadCount(0);
            }}
            className="chat-toggle-btn shadow-lg"
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              fontSize: '1.8rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'pulse 2s infinite'
            }}
          >
            💬
          </Button>
          {unreadCount > 0 && (
            <Badge 
              bg="danger" 
              pill 
              className="position-absolute"
              style={{ 
                top: '-8px', 
                right: '-8px',
                minWidth: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}
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
      className="chatbot-container"
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
      <Card 
        className="chatbot-card shadow-lg"
        style={{ 
          height: '100%',
          borderRadius: '20px',
          overflow: 'hidden',
          border: 'none',
          background: '#ffffff'
        }}
      >
        {/* Header */}
        <Card.Header 
          className="chatbot-header text-white d-flex justify-content-between align-items-center"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '16px 20px',
            minHeight: '70px'
          }}
        >
          <div className="d-flex align-items-center">
            <div 
              className="online-indicator me-3"
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#4ade80',
                borderRadius: '50%',
                boxShadow: '0 0 0 3px rgba(74, 222, 128, 0.3)',
                animation: 'pulse 2s infinite'
              }}
            />
            <div>
              <h6 className="mb-0 fw-bold">WordPress Assistant</h6>
              <small className="opacity-75">
                {user ? `${downloadStats?.remainingDownloads || 0} downloads left today` : 'Login to download'}
              </small>
            </div>
          </div>
          <Button 
            variant="link" 
            className="text-white p-1"
            onClick={() => setIsOpen(false)}
            style={{ 
              fontSize: '1.2rem', 
              textDecoration: 'none',
              lineHeight: 1,
              minWidth: 'auto'
            }}
          >
            ✕
          </Button>
        </Card.Header>

        {/* Download Progress Bar */}
        {downloadStats && user && (
          <div 
            className="download-stats-bar px-3 py-2"
            style={{ 
              background: 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%)',
              borderBottom: '1px solid #dee2e6'
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="fw-semibold text-muted">Daily Downloads</small>
              <small className="fw-bold" style={{ color: downloadStats.remainingDownloads > 3 ? '#28a745' : downloadStats.remainingDownloads > 0 ? '#ffc107' : '#dc3545' }}>
                {downloadStats.todayDownloads}/{downloadStats.dailyLimit}
              </small>
            </div>
            <ProgressBar 
              now={(downloadStats.todayDownloads / downloadStats.dailyLimit) * 100}
              style={{ height: '6px' }}
              variant={downloadStats.remainingDownloads > 3 ? 'success' : downloadStats.remainingDownloads > 0 ? 'warning' : 'danger'}
              animated={downloadStats.remainingDownloads > 0}
            />
            <div className="text-end mt-1">
              <small className="text-muted">
                {downloadStats.remainingDownloads} remaining
                {downloadStats.remainingDownloads === 0 && downloadStats.nextResetTime && (
                  <span className="ms-2 text-warning">
                    • Resets in {formatTimeUntilReset(downloadStats.nextResetTime)}
                  </span>
                )}
              </small>
            </div>
          </div>
        )}
        
        {/* Messages Area */}
        <Card.Body 
          className="chat-messages p-0"
          style={{ 
            height: downloadStats && user ? '450px' : '500px',
            overflowY: 'auto',
            background: '#f8f9fa'
          }}
        >
          <div className="p-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-wrapper mb-4 ${msg.type === 'user' ? 'text-end' : 'text-start'}`}>
                <div 
                  className={`message-bubble d-inline-block p-3 ${
                    msg.type === 'user' 
                      ? 'user-message text-white' 
                      : 'bot-message bg-white shadow-sm'
                  }`}
                  style={{ 
                    maxWidth: '85%',
                    borderRadius: msg.type === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                    wordBreak: 'break-word',
                    background: msg.type === 'user' 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : msg.isError 
                        ? 'linear-gradient(135deg, #ff9a9a 0%, #ffd4d4 100%)'
                        : '#ffffff'
                  }}
                >
                  {/* Message Text */}
                  <div className="message-text" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {msg.text}
                  </div>

                  {/* Quick Actions */}
                  {msg.quickActions && (
                    <div className="quick-actions mt-3">
                      <div className="d-flex flex-wrap gap-2">
                        {msg.quickActions.map((action, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant="outline-primary"
                            className="quick-action-btn"
                            onClick={() => handleQuickAction(action.action)}
                            style={{
                              borderRadius: '20px',
                              padding: '6px 16px',
                              fontSize: '0.8rem',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {action.text}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products Grid */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="products-grid mt-3">
                      {msg.products.map(product => (
                        <div key={product._id} className="product-card mb-3 p-3 bg-light rounded-3 border">
                          <div className="product-header d-flex justify-content-between align-items-start mb-2">
                            <div className="flex-grow-1">
                              <h6 className="product-title fw-bold text-primary mb-1" style={{ fontSize: '0.9rem' }}>
                                {product.title}
                              </h6>
                              <div className="product-meta d-flex align-items-center gap-2 mb-2">
                                <Badge 
                                  bg={product.category === 'themes' ? 'primary' : 'success'} 
                                  className="category-badge"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  {product.category === 'themes' ? '🎨' : '🔌'} {product.category}
                                </Badge>
                                {product.featured && (
                                  <Badge bg="warning" style={{ fontSize: '0.7rem' }}>
                                    ⭐ Featured
                                  </Badge>
                                )}
                              </div>
                              <div className="product-stats text-muted" style={{ fontSize: '0.75rem' }}>
                                <i className="fas fa-download me-1"></i>
                                {(product.downloads || 0).toLocaleString()} downloads
                                {product.version && (
                                  <span className="ms-2">
                                    <i className="fas fa-code-branch me-1"></i>
                                    v{product.version}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Product Description */}
                          {product.description && (
                            <p className="product-description text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                              {product.description.length > 100 
                                ? `${product.description.substring(0, 100)}...` 
                                : product.description
                              }
                            </p>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="product-actions d-flex gap-2">
                            {product.previewUrl && (
                              <Button 
                                size="sm" 
                                variant="outline-info"
                                className="flex-fill"
                                onClick={() => handlePreview(product)}
                                style={{ fontSize: '0.75rem' }}
                              >
                                👁️ Preview
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant={user && downloadStats?.remainingDownloads > 0 ? 'primary' : 'outline-secondary'}
                              className="flex-fill"
                              onClick={() => handleDownload(product)}
                              disabled={user && downloadStats?.remainingDownloads <= 0}
                              style={{ fontSize: '0.75rem' }}
                            >
                              {user 
                                ? downloadStats?.remainingDownloads > 0 
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
                    <div className="no-results mt-3 p-3 bg-light rounded text-center">
                      <div className="mb-2" style={{ fontSize: '2rem' }}>🔍</div>
                      <div className="fw-bold text-muted mb-2">No products found</div>
                      {msg.suggestions && (
                        <div>
                          <small className="text-muted d-block mb-2">Try searching for:</small>
                          <div className="d-flex flex-wrap gap-1 justify-content-center">
                            {msg.suggestions.map((suggestion, idx) => (
                              <Button
                                key={idx}
                                size="sm"
                                variant="outline-secondary"
                                onClick={() => handleSendMessage(suggestion)}
                                style={{
                                  borderRadius: '15px',
                                  padding: '4px 12px',
                                  fontSize: '0.75rem'
                                }}
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
                    <div className="download-success mt-3 p-3 rounded" style={{ background: 'linear-gradient(135deg, #d4edda 0%, #f8f9fa 100%)' }}>
                      <div className="text-success fw-bold mb-2">
                        🎉 Download Ready!
                      </div>
                      <div className="small text-success mb-2">
                        {msg.downloadData.productTitle}
                      </div>
                      <div className="small text-muted">
                        {msg.downloadData.remainingDownloads} downloads remaining today
                      </div>
                    </div>
                  )}

                  {/* Limit Reached */}
                  {msg.limitReached && (
                    <div className="limit-reached mt-3 p-3 rounded" style={{ background: 'linear-gradient(135deg, #fff3cd 0%, #f8f9fa 100%)' }}>
                      <div className="text-warning fw-bold mb-2">
                        ⏰ Daily Limit Reached
                      </div>
                      <div className="small text-muted">
                        Downloads reset in: {formatTimeUntilReset(msg.resetTime)}
                      </div>
                    </div>
                  )}

                  {/* Download Stats */}
                  {msg.showStats && downloadStats && (
                    <div className="download-stats mt-3 p-3 bg-light rounded">
                      <div className="fw-bold mb-3 text-center">📊 Your Download Statistics</div>
                      <div className="row text-center">
                        <div className="col-4">
                          <div className="stat-item">
                            <div className="fw-bold text-primary fs-5">{downloadStats.totalDownloads}</div>
                            <small className="text-muted">Total Downloads</small>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="stat-item">
                            <div className="fw-bold text-success fs-5">{downloadStats.todayDownloads}</div>
                            <small className="text-muted">Today</small>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="stat-item">
                            <div className="fw-bold text-info fs-5">{downloadStats.remainingDownloads}</div>
                            <small className="text-muted">Remaining</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Login Required */}
                  {msg.requiresLogin && (
                    <div className="login-required mt-3 p-3 rounded" style={{ background: 'linear-gradient(135deg, #cce5ff 0%, #f8f9fa 100%)' }}>
                      <div className="text-center">
                        <div className="mb-2">🔐</div>
                        <div className="fw-bold text-primary mb-2">Login Required</div>
                        <div className="small text-muted">
                          Create a free account to download amazing WordPress products!
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Timestamp */}
                <div className={`message-time mt-1 ${msg.type === 'user' ? 'text-end' : 'text-start'}`}>
                  <small className="text-muted opacity-75" style={{ fontSize: '0.7rem' }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="typing-wrapper text-start mb-3">
                <div 
                  className="typing-bubble d-inline-block p-3 bg-white shadow-sm"
                  style={{ 
                    maxWidth: '85%',
                    borderRadius: '20px 20px 20px 5px'
                  }}
                >
                  <div className="typing-indicator d-flex align-items-center gap-1">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <small className="ms-2 text-muted">Assistant is typing...</small>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div ref={messagesEndRef} />
        </Card.Body>
        
        {/* Input Area */}
        <Card.Footer className="p-3 bg-white border-0">
          <Form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
            <div className="d-flex gap-2 align-items-end">
              <Form.Control
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message... (e.g., 'blog themes', 'SEO plugins')"
                className="border-0 bg-light message-input"
                disabled={isTyping}
                style={{ 
                  borderRadius: '25px',
                  padding: '12px 20px',
                  resize: 'none',
                  minHeight: '45px'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                type="submit" 
                disabled={!message.trim() || isTyping}
                className="send-button"
                style={{
                  borderRadius: '50%',
                  width: '45px',
                  height: '45px',
                  minWidth: '45px',
                  background: message.trim() && !isTyping 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : '#dee2e6',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isTyping ? <Spinner size="sm" /> : '📤'}
              </Button>
            </div>
          </Form>
        </Card.Footer>
      </Card>

      {/* Styles */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.05);
          }
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        .chat-toggle-btn:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6) !important;
        }

        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #667eea;
          animation: typing 1.4s infinite;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        .quick-action-btn:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          border-color: transparent !important;
          transform: translateY(-1px);
        }

        .product-card {
          transition: all 0.3s ease;
          border: 1px solid #e9ecef !important;
        }

        .product-card:hover {
          border-color: #667eea !important;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15) !important;
          transform: translateY(-2px);
        }

        .message-input:focus {
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
          border-color: #667eea !important;
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.1);
        }

        .user-message {
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .bot-message {
          border: 1px solid rgba(0,0,0,0.05);
        }

        @media (max-width: 768px) {
          .chatbot-container {
            width: 100vw !important;
            height: 100vh !important;
            bottom: 0 !important;
            right: 0 !important;
            border-radius: 0 !important;
          }
          
          .chatbot-card {
            border-radius: 0 !important;
            height: 100vh !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
