/**
 * Messages Page - Trang tin nhắn với đầy đủ tính năng
 * Features:
 * - Full inline chat (không cần mở rộng)
 * - Media upload
 * - Emoji picker
 * - Read receipts
 * - Pagination (load more)
 * - Error retry
 * - Real-time updates
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../context/SocketContext';
import { messageService } from '../services/api';
import Navbar from '../components/Navbar';

const EMOJIS = ['😀', '😍', '🥰', '😂', '🤍', '🔥', '👏', '✨', '😭', '👍', '❤️', '🎉', '💯', '🌟', '💪'];
const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80';
const MAX_MESSAGE_LENGTH = 1000;

const Messages = () => {
  const { user } = useAuthStore();
  const { socket, isConnected } = useSocket();

  // State
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [failedMessages, setFailedMessages] = useState(new Map());

  // Refs
  const messagesContainerRef = useRef(null);
  const messagesStartRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ============================================
  // FETCH CONVERSATIONS
  // ============================================
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const response = await messageService.getConversations();
      const rawData = response?.conversations || response?.data?.conversations || response?.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      setConversations(list);

      // Auto select first conversation
      if (list.length > 0 && !selectedConversationId) {
        const firstConv = list[0];
        const convMatchId = firstConv.matchId || firstConv._id;
        setSelectedConversationId(convMatchId);
      }
      setError('');
    } catch (err) {
      console.error('[Messages] Error fetching conversations:', err);
      setError('Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setLoadingConversations(false);
    }
  }, [selectedConversationId]);

  // ============================================
  // FETCH MESSAGES (with pagination)
  // ============================================
  const fetchMessages = useCallback(async (matchId, pageNum = 1, append = false) => {
    if (!matchId) return;
    try {
      if (pageNum === 1) setLoadingMessages(true);
      else setLoadingMore(true);

      const response = await messageService.getMessages(matchId, pageNum, 50);
      const msgs = response?.messages || response?.data?.messages || response?.data || [];
      
      // Check pagination
      const pagination = response?.pagination || response?.data?.pagination || {};
      setHasMoreMessages(pagination.hasMore !== false && pagination.pages >= pageNum);

      if (append) {
        // Prepend older messages (backend already returns in chronological order)
        const container = messagesStartRef.current;
        const oldScrollHeight = container?.scrollHeight || 0;
        const oldScrollTop = container?.scrollTop || 0;

        setMessages(prev => [...msgs, ...prev]);

        // Restore scroll position
        setTimeout(() => {
          if (container) {
            container.scrollTop = oldScrollTop + (container.scrollHeight - oldScrollHeight);
          }
        }, 50);
      } else {
        setMessages(Array.isArray(msgs) ? msgs : []); // Backend already returns chronological order
        setPage(1);
      }

      // Mark as read
      await messageService.markAsRead(matchId).catch(() => {});
    } catch (err) {
      console.error('[Messages] Error fetching messages:', err);
      setError('Không thể tải tin nhắn');
    } finally {
      setLoadingMessages(false);
      setLoadingMore(false);
    }
  }, []);

  // ============================================
  // LOAD MORE (scroll up)
  // ============================================
  const loadMoreMessages = useCallback(() => {
    if (loadingMore || !hasMoreMessages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMessages(selectedConversationId, nextPage, true);
  }, [page, selectedConversationId, fetchMessages, loadingMore, hasMoreMessages]);

  // ============================================
  // HANDLE SCROLL
  // ============================================
  const handleMessagesScroll = useCallback((e) => {
    const { scrollTop } = e.target;
    if (scrollTop < 100 && hasMoreMessages && !loadingMore) {
      loadMoreMessages();
    }
  }, [loadMoreMessages, hasMoreMessages, loadingMore]);

  // ============================================
  // SCROLL TO BOTTOM
  // ============================================
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 100);
  }, []);

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
      socket?.emit('join_room', { matchId: selectedConversationId });
    }
    return () => {
      if (selectedConversationId) {
        socket?.emit('leave_room', { matchId: selectedConversationId });
      }
    };
  }, [selectedConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ============================================
  // SOCKET LISTENERS
  // ============================================
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.matchId === selectedConversationId || message.conversationId === selectedConversationId) {
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        scrollToBottom();
        messageService.markAsRead(selectedConversationId).catch(() => {});
      }
      fetchConversations();
    };

    const handleMessagesRead = ({ readAt }) => {
      setMessages(prev => prev.map(msg => ({
        ...msg,
        status: msg.status !== 'seen' && msg.sender !== user?._id ? msg.status : 'seen'
      })));
    };

    const handleTyping = ({ user: typer }) => {
      // Could show typing indicator
    };

    socket.on('receive_message', handleNewMessage);
    socket.on('messages_read', handleMessagesRead);
    socket.on('user_typing', handleTyping);

    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.off('messages_read', handleMessagesRead);
      socket.off('user_typing', handleTyping);
    };
  }, [socket, selectedConversationId, user?._id, scrollToBottom, fetchConversations]);

  // ============================================
  // SEND MESSAGE
  // ============================================
  const handleSend = async (e) => {
    e?.preventDefault();
    const content = newMessage.trim();

    if (!content) return;
    if (content.length > MAX_MESSAGE_LENGTH) {
      setSendError(`Tin nhắn không quá ${MAX_MESSAGE_LENGTH} ký tự`);
      return;
    }
    if (!selectedConversationId || sending) return;

    setSending(true);
    setSendError(null);

    const tempId = `temp-${Date.now()}`;

    try {
      const response = await messageService.sendMessage(selectedConversationId, {
        content,
        type: 'text'
      });

      if (response.success) {
        // Remove temp message, add real one
        setMessages(prev => [...prev.filter(m => m._tempId !== tempId), response.data].filter(Boolean));
        setNewMessage('');
        socket?.emit('stop_typing', { matchId: selectedConversationId });
        fetchConversations();
        scrollToBottom();
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('[Messages] Send error:', err);
      let errorMsg = 'Không thể gửi tin nhắn';
      if (err.response?.status === 429) {
        errorMsg = 'Gửi tin nhắn quá nhanh. Vui lòng chờ.';
      }
      setSendError(errorMsg);
      setFailedMessages(prev => new Map(prev).set(tempId, content));
    } finally {
      setSending(false);
    }
  };

  // Retry failed message
  const retryMessage = (tempId, content) => {
    setFailedMessages(prev => {
      const newMap = new Map(prev);
      newMap.delete(tempId);
      return newMap;
    });
    setNewMessage(content);
    handleSend();
  };

  // ============================================
  // TYPING HANDLER
  // ============================================
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!typingTimeoutRef.current) {
      socket?.emit('typing', { matchId: selectedConversationId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('stop_typing', { matchId: selectedConversationId });
      typingTimeoutRef.current = null;
    }, 2000);
  };

  // ============================================
  // MEDIA UPLOAD
  // ============================================
  const handleMediaSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ hỗ trợ ảnh JPG, PNG, GIF, WebP');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File quá lớn. Tối đa 5MB');
      return;
    }

    setUploadingMedia(true);
    try {
      const uploadRes = await messageService.uploadMedia(selectedConversationId, file);
      if (uploadRes.success) {
        await messageService.sendMessage(selectedConversationId, {
          content: '',
          image: uploadRes.mediaUrl,
          messageType: 'image'
        });
        fetchMessages(selectedConversationId);
        fetchConversations();
      }
    } catch (err) {
      console.error('[Messages] Upload error:', err);
      alert('Không thể tải ảnh lên');
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ============================================
  // HELPERS
  // ============================================
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatConversationTime = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return formatTime(iso);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Get active conversation
  const activeConversation = conversations.find(c => c.matchId === selectedConversationId);

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    if (!search.trim()) return true;
    const otherUser = conv.userId;
    const name = otherUser?.fullName || otherUser?.username || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const getLastMessage = (conv) => {
    if (conv.lastMessage) {
      const isMe = conv.lastMessage.sender === user?._id || conv.lastMessage.sender?._id === user?._id;
      const content = conv.lastMessage.content || '[Hình ảnh]';
      return isMe ? `Bạn: ${content}` : content;
    }
    return 'Chưa có tin nhắn';
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen" style={{ background: '#fff7f7' }}>
      <Navbar />

      <main className="pt-6 pb-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4" style={{ height: 'calc(100vh - 100px)' }}>

          {/* ========== LEFT: Conversations List ========== */}
          <section 
            className="col-span-12 md:col-span-4 lg:col-span-3"
            style={{ height: 'calc(100vh - 100px)' }}
          >
            <div className="bg-white rounded-[20px] border border-rose-100 shadow-sm p-4 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-lg font-bold text-gray-900">Tin nhắn</h1>
                {conversations.length > 0 && (
                  <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                    {conversations.length}
                  </span>
                )}
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35" />
                  </svg>
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full h-9 pl-9 pr-3 rounded-full bg-rose-50 text-sm text-gray-700 placeholder-gray-400 border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                {loadingConversations ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-rose-500 mx-auto"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">
                    {search ? 'Không tìm thấy' : 'Chưa có cuộc trò chuyện'}
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const otherUser = conv.userId;
                    const isActive = conv.matchId === selectedConversationId;

                    return (
                      <button
                        key={conv.matchId}
                        onClick={() => setSelectedConversationId(conv.matchId)}
                        className={`w-full flex items-center gap-2 p-2 rounded-xl transition-all ${
                          isActive ? 'bg-rose-100 border border-rose-200' : 'hover:bg-rose-50/70 border border-transparent'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-rose-100">
                            {otherUser?.avatar ? (
                              <img src={otherUser.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                {(otherUser?.fullName || otherUser?.username || '?').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          {otherUser?.isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                              {otherUser?.fullName || otherUser?.username || 'Unknown'}
                            </p>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {formatConversationTime(conv.lastActivity)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{getLastMessage(conv)}</p>
                        </div>

                        {/* Unread */}
                        {conv.unreadCount > 0 && (
                          <span className="flex-shrink-0 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* ========== RIGHT: Chat Area ========== */}
          <section 
            className="col-span-12 md:col-span-8 lg:col-span-9"
            style={{ height: 'calc(100vh - 100px)' }}
          >
            <div className="bg-white rounded-[20px] border border-rose-100 shadow-sm h-full flex flex-col overflow-hidden">

              {/* Chat Header */}
              {activeConversation ? (
                <div className="px-4 py-3 border-b border-rose-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-rose-200">
                      {activeConversation.userId?.avatar ? (
                        <img src={activeConversation.userId.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {(activeConversation.userId?.fullName || activeConversation.userId?.username || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {activeConversation.userId?.fullName || activeConversation.userId?.username || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        {activeConversation.userId?.isOnline ? (
                          <>
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            Đang hoạt động
                          </>
                        ) : 'Offline'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Video call button */}
                  <Link
                    to={`/chat/${activeConversation.matchId}`}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                    title="Gọi video"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="px-4 py-3 border-b border-rose-100">
                  <p className="text-sm text-gray-500">Chọn cuộc trò chuyện để bắt đầu</p>
                </div>
              )}

              {/* Messages */}
              <div 
                ref={messagesStartRef}
                onScroll={handleMessagesScroll}
                className="flex-1 overflow-y-auto px-4 py-3 bg-gradient-to-b from-white to-rose-50/20"
              >
                {/* Load more indicator */}
                {loadingMore && (
                  <div className="flex justify-center py-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-rose-500"></div>
                  </div>
                )}

                {/* Load older button */}
                {hasMoreMessages && !loadingMore && messages.length > 0 && (
                  <div className="flex justify-center pb-2">
                    <button 
                      onClick={loadMoreMessages}
                      className="text-xs text-rose-500 hover:text-rose-600 px-3 py-1 bg-rose-50 rounded-full"
                    >
                      Tải tin nhắn cũ hơn
                    </button>
                  </div>
                )}

                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-500"></div>
                  </div>
                ) : !activeConversation ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <svg className="w-16 h-16 mb-3 text-rose-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm">Chọn một cuộc trò chuyện</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <p className="text-sm">Bắt đầu cuộc trò chuyện</p>
                    <p className="text-xs mt-1">Gửi tin nhắn đầu tiên!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg, idx) => {
                      const senderData = msg.sender?._id ? msg.sender : 
                                        (msg.senderId?._id ? msg.senderId : null);
                      const isOwn = senderData?._id === user?._id || msg.sender === user?._id;
                      const senderName = senderData?.username || senderData?.fullName || 'Unknown';
                      const senderAvatar = senderData?.avatar;
                      const isFailed = failedMessages.has(msg._tempId || msg._id);

                      return (
                        <div 
                          key={msg._id || msg._tempId || idx} 
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isOwn && (
                            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mr-2">
                              {senderAvatar ? (
                                <img src={senderAvatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                                  <span className="text-white text-[10px] font-bold">
                                    {senderName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className={`max-w-[70%] ${isOwn ? 'text-right' : 'text-left'}`}>
                            {/* Sender name */}
                            {!isOwn && (
                              <p className="text-[10px] font-semibold text-rose-500 mb-0.5">
                                {senderName}
                              </p>
                            )}
                            
                            {/* Message bubble */}
                            <div className={`relative inline-block rounded-2xl px-3 py-2 ${
                              isOwn
                                ? 'bg-rose-600 text-white rounded-br-sm'
                                : 'bg-rose-100 text-gray-700 rounded-bl-sm'
                            } ${isFailed ? 'ring-2 ring-red-400' : ''}`}>
                              {/* Text content */}
                              {msg.content && (
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                              )}
                              
                              {/* Image content */}
                              {(msg.image || msg.mediaUrl) && (
                                <img 
                                  src={msg.image || msg.mediaUrl} 
                                  alt="" 
                                  className="mt-1 max-w-[200px] rounded-lg cursor-pointer hover:opacity-90"
                                  onClick={() => window.open(msg.image || msg.mediaUrl, '_blank')}
                                />
                              )}
                            </div>

                            {/* Time + Status + Retry */}
                            <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              {isFailed ? (
                                <button
                                  onClick={() => retryMessage(msg._tempId, failedMessages.get(msg._tempId))}
                                  className="text-[10px] text-red-500 hover:text-red-600 flex items-center gap-1"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Gửi lại
                                </button>
                              ) : (
                                <>
                                  <span className={`text-[10px] ${isOwn ? 'text-gray-400' : 'text-gray-400'}`}>
                                    {formatTime(msg.createdAt)}
                                  </span>
                                  {isOwn && (
                                    <span className="text-[10px] text-white/70">
                                      {msg.status === 'seen' ? '✓✓' : 
                                       msg.status === 'delivered' ? '✓✓' : 
                                       msg.status === 'sent' ? '✓' : '○'}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* ========== Input Area ========== */}
              {activeConversation && (
                <div className="px-4 pb-4 pt-2 border-t border-rose-100 bg-white">
                  {/* Send error */}
                  {sendError && (
                    <div className="mb-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-center justify-between">
                      <span>{sendError}</span>
                      <button onClick={() => setSendError(null)} className="text-red-400 hover:text-red-600">✕</button>
                    </div>
                  )}

                  {/* Emoji picker */}
                  {showEmojiPicker && (
                    <div className="mb-2 rounded-xl border border-rose-100 bg-rose-50 p-2 flex flex-wrap gap-1">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewMessage(prev => `${prev}${emoji}`)}
                          className="w-8 h-8 rounded-lg hover:bg-white text-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input row */}
                  <div className="flex items-end gap-2">
                    {/* Media button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingMedia}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                    >
                      {uploadingMedia ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-rose-500"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleMediaSelect}
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                    />

                    {/* Text input */}
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder="Nhắn tin..."
                        maxLength={MAX_MESSAGE_LENGTH}
                        className="w-full px-4 py-2 bg-rose-50 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none"
                        style={{ minHeight: '40px', maxHeight: '100px' }}
                      />
                      {/* Character count */}
                      {newMessage.length > 900 && (
                        <span className={`absolute bottom-1.5 right-3 text-[10px] ${newMessage.length >= MAX_MESSAGE_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                          {MAX_MESSAGE_LENGTH - newMessage.length}
                        </span>
                      )}
                    </div>

                    {/* Emoji toggle */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(prev => !prev)}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                    >
                      <span className="text-lg">😊</span>
                    </button>

                    {/* Send button */}
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sending || !isConnected}
                      className="p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Connection status */}
                  {!isConnected && (
                    <p className="text-[10px] text-yellow-500 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                      Đang kết nối lại...
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50 flex items-center gap-2">
          {error}
          <button onClick={() => setError('')} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}
    </div>
  );
};

export default Messages;