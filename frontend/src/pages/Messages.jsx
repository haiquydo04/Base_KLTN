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
import SidebarMenu from '../components/SidebarMenu';

const EMOJIS = ['😀', '😍', '🥰', '😂', '🤍', '🔥', '👏', '✨', '😭', '👍', '❤️', '🎉', '💯', '🌟', '💪'];
const ICEBREAKERS = ['Say Hi 👋', "What's your weekend plan?", 'Bạn thích hẹn hò ở đâu?'];
const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80';
const MAX_MESSAGE_LENGTH = 1000;

const getDateLabel = (iso) => {
  if (!iso) return 'Today';
  const date = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((startToday - startDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'long', day: 'numeric' });
};

const Messages = () => {
  const { user } = useAuthStore();
  const { socket, isConnected } = useSocket();

  // State
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showComposerMenu, setShowComposerMenu] = useState(false);
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
  const [showSafetyMenu, setShowSafetyMenu] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [pendingImagePreview, setPendingImagePreview] = useState('');
  const [pendingImageName, setPendingImageName] = useState('');

  // Refs
  const messagesContainerRef = useRef(null);
  const messagesStartRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileAttachmentInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const pendingConversationAutoScrollRef = useRef(false);
  const prevMessageCountRef = useRef(0);
  const showScrollButtonRef = useRef(false);

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
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
    shouldAutoScrollRef.current = !isScrolledUp;

    if (isScrolledUp && !showScrollButtonRef.current) {
      showScrollButtonRef.current = true;
      setShowScrollButton(true);
    } else if (!isScrolledUp && showScrollButtonRef.current) {
      showScrollButtonRef.current = false;
      setShowScrollButton(false);
    }

    if (scrollTop < 100 && hasMoreMessages && !loadingMore) {
      loadMoreMessages();
    }
  }, [loadMoreMessages, hasMoreMessages, loadingMore]);

  // ============================================
  // SCROLL TO BOTTOM
  // ============================================
  const scrollToBottom = useCallback((behavior = 'smooth', force = false) => {
    if (!force && !shouldAutoScrollRef.current) return;
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
      if (showScrollButtonRef.current) {
        showScrollButtonRef.current = false;
        setShowScrollButton(false);
      }
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
      shouldAutoScrollRef.current = true;
      pendingConversationAutoScrollRef.current = true;
      prevMessageCountRef.current = 0;
      showScrollButtonRef.current = false;
      setShowScrollButton(false);
      setShowSafetyMenu(false);
      setShowComposerMenu(false);
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      });
    }
    return () => {
      if (selectedConversationId) {
        socket?.emit('leave_room', { matchId: selectedConversationId });
      }
    };
  }, [selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) return;

    if (pendingConversationAutoScrollRef.current) {
      scrollToBottom('auto', true);
      pendingConversationAutoScrollRef.current = false;
      prevMessageCountRef.current = messages.length;
      return;
    }

    if (loadingMore) {
      prevMessageCountRef.current = messages.length;
      return;
    }

    if (messages.length > prevMessageCountRef.current) {
      scrollToBottom('smooth');
    }

    prevMessageCountRef.current = messages.length;
  }, [messages, selectedConversationId, loadingMore, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (pendingImagePreview) {
        URL.revokeObjectURL(pendingImagePreview);
      }
    };
  }, [pendingImagePreview]);

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
        scrollToBottom('smooth');
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
    setTimeout(() => {
      handleSend();
    }, 0);
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

    if (pendingImagePreview) {
      URL.revokeObjectURL(pendingImagePreview);
    }

    setPendingImageFile(file);
    setPendingImageName(file.name);
    setPendingImagePreview(URL.createObjectURL(file));

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearPendingImage = useCallback(() => {
    if (pendingImagePreview) {
      URL.revokeObjectURL(pendingImagePreview);
    }
    setPendingImageFile(null);
    setPendingImagePreview('');
    setPendingImageName('');
  }, [pendingImagePreview]);

  const sendPendingImage = useCallback(async () => {
    if (!pendingImageFile || !selectedConversationId || uploadingMedia) return;

    setUploadingMedia(true);
    setSendError(null);
    try {
      const uploadRes = await messageService.uploadMedia(selectedConversationId, pendingImageFile);
      if (uploadRes?.success) {
        await messageService.sendMessage(selectedConversationId, {
          content: '',
          image: uploadRes?.mediaUrl,
          messageType: 'image'
        });
        fetchMessages(selectedConversationId);
        fetchConversations();
        clearPendingImage();
      }
    } catch {
      setSendError('Không thể gửi ảnh');
    } finally {
      setUploadingMedia(false);
    }
  }, [pendingImageFile, selectedConversationId, uploadingMedia, fetchMessages, fetchConversations, clearPendingImage]);

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
    if (activeFilter === 'unread' && !(conv?.unreadCount > 0)) return false;
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
    <div className="h-[100vh] w-screen bg-white overflow-hidden flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-row overflow-hidden min-h-0 relative w-full">
        <SidebarMenu />

        <main className="flex-1 overflow-hidden flex flex-col relative w-full min-w-0">
          <div className="flex h-full w-full">

          {/* ========== LEFT: Conversations List ========== */}
          <section 
            className="w-full md:w-[340px] lg:w-[360px] shrink-0 border-r border-gray-300 bg-white flex flex-col"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="shrink-0 px-4 pt-4 pb-3 border-b border-gray-300">
                <div className="flex items-center justify-between mb-3">
                  <h1 className="text-lg font-bold text-gray-900">Tin nhắn</h1>
                  {conversations.length > 0 && (
                    <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                      {conversations.length}
                    </span>
                  )}
                </div>

              {/* Search */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35" />
                    </svg>
                  </span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="w-full h-9 pl-10 pr-3 rounded-full bg-rose-50 text-sm text-gray-700 placeholder-gray-400 border border-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                  />
                </div>

                <div className="mt-3 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`pb-1 text-sm font-medium border-b-2 transition-colors ${activeFilter === 'all' ? 'text-rose-600 border-rose-500' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('unread')}
                    className={`pb-1 text-sm font-medium border-b-2 transition-colors ${activeFilter === 'unread' ? 'text-rose-600 border-rose-500' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                  >
                    Chưa đọc
                  </button>
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
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
                        className={`relative w-full flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-colors duration-200 ${
                          isActive ? 'bg-rose-100 border border-rose-200' : 'hover:bg-gray-50 border border-transparent'
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
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
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
                          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
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
            className="flex-1 min-w-0 h-full bg-white"
          >
            <div className="h-full flex flex-col overflow-hidden">

              {/* Chat Header */}
              {activeConversation ? (
                <div className="shrink-0 px-4 py-3 border-b border-gray-300 bg-white flex items-center justify-between">
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
                  <div className="relative flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowSafetyMenu((prev) => !prev)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                      title="More"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    <Link
                      to={`/chat/${activeConversation.matchId}`}
                      className="p-2 text-pink-500 hover:text-pink-600 hover:scale-110 hover:bg-rose-50 rounded-full transition-transform duration-200"
                      title="Gọi video"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </Link>

                    {showSafetyMenu && (
                      <div className="absolute right-0 top-12 z-20 min-w-[150px] rounded-xl border border-gray-300 bg-white shadow-lg p-1">
                        <button
                          type="button"
                          onClick={() => {
                            console.log('Unmatch clicked', activeConversation?.matchId);
                            setShowSafetyMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50"
                        >
                          Unmatch
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            console.log('Report User clicked', activeConversation?.userId?._id);
                            setShowSafetyMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50"
                        >
                          Report User
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="shrink-0 px-4 py-3 border-b border-gray-300 bg-white">
                  <p className="text-sm text-gray-500">Chọn cuộc trò chuyện để bắt đầu</p>
                </div>
              )}

              {/* Messages */}
              <div 
                ref={messagesStartRef}
                onScroll={handleMessagesScroll}
                className="relative flex-1 overflow-y-auto px-4 py-3 bg-gradient-to-b from-white to-rose-50/20 [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
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
                    <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-sm">
                      {ICEBREAKERS.map((icebreaker) => (
                        <button
                          key={icebreaker}
                          type="button"
                          onClick={() => setNewMessage(icebreaker)}
                          className="px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs text-rose-600 hover:bg-rose-100 transition-colors"
                        >
                          {icebreaker}
                        </button>
                      ))}
                    </div>
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
                      const showDateDivider = idx === 0 || getDateLabel(messages[idx - 1]?.createdAt) !== getDateLabel(msg?.createdAt);
                      const isLatestOwn = isOwn && idx === messages.length - 1;
                      const statusText = msg?.status
                        ? (msg.status === 'sending' ? 'Sending...' : msg.status === 'seen' ? 'Seen' : msg.status === 'delivered' ? 'Delivered' : 'Sent')
                        : (sending && isLatestOwn ? 'Sending...' : 'Sent');

                      return (
                        <div key={msg._id || msg._tempId || idx}>
                          {showDateDivider && (
                            <div className="sticky top-2 z-10 flex justify-center py-1">
                              <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-semibold text-gray-500 border border-rose-100 shadow-sm">
                                {getDateLabel(msg?.createdAt)}
                              </span>
                            </div>
                          )}

                          <div className={`flex animate-slide-up ${isOwn ? 'justify-end' : 'justify-start'}`}>
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
                                ? 'bg-pink-500 text-white rounded-br-sm'
                                : 'bg-pink-100 text-gray-900 rounded-bl-sm'
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
                                  onClick={() => setLightboxImage(msg.image || msg.mediaUrl)}
                                />
                              )}
                            </div>

                            {/* Time + Status + Retry */}
                            <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end pr-1' : 'justify-start pl-1'}`}>
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
                                  <span className="text-[10px] text-gray-500">
                                    {formatTime(msg.createdAt)}
                                  </span>
                                  {isOwn && (
                                    <span className="inline-flex items-center gap-0.5">
                                      {(msg?.status === 'seen' || msg?.status === 'delivered') && (
                                        <svg className={`w-3 h-3 ${msg?.status === 'seen' ? 'text-pink-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                      <svg
                                        className={`w-3 h-3 ${msg?.status === 'seen' ? 'text-pink-500' : msg?.status === 'sending' ? 'text-gray-300' : 'text-gray-400'}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          </div>
                        </div>
                      );
                    })}

                    {failedMessages.size > 0 && (
                      <div className="flex flex-col items-end gap-2">
                        {Array.from(failedMessages.entries()).map(([tempId, content]) => (
                          <div key={tempId} className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-[10px]" title="Retry">!</span>
                            <button
                              type="button"
                              onClick={() => retryMessage(tempId, content)}
                              className="text-[10px] text-red-500 hover:text-red-600 underline"
                              title="Retry"
                            >
                              Retry
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}

                {showScrollButton && (
                  <button
                    type="button"
                    onClick={() => scrollToBottom('smooth', true)}
                    className="absolute bottom-24 right-1/2 translate-x-1/2 w-10 h-10 bg-white rounded-full border border-gray-300 shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50"
                    title="Scroll to bottom"
                    aria-label="Scroll to bottom"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 10l5 5 5-5" />
                    </svg>
                  </button>
                )}
              </div>

              {/* ========== Input Area ========== */}
              {activeConversation && (
                <div className="shrink-0 bg-white relative">
                  {/* Send error */}
                  {sendError && (
                    <div className="mx-4 mt-2 mb-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-center justify-between">
                      <span>{sendError}</span>
                      <button onClick={() => setSendError(null)} className="text-red-400 hover:text-red-600">✕</button>
                    </div>
                  )}

                  {/* Emoji picker */}
                  {showEmojiPicker && (
                    <div className="mx-4 mb-2 rounded-xl border border-rose-100 bg-rose-50 p-2 flex flex-wrap gap-1">
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

                  {pendingImagePreview && (
                    <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 p-2">
                      <img src={pendingImagePreview} alt="Preview" className="w-12 h-12 rounded-md object-cover border border-rose-200" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600 truncate">{pendingImageName}</p>
                      </div>
                      <button
                        type="button"
                        onClick={clearPendingImage}
                        className="w-6 h-6 rounded-full bg-white text-gray-500 hover:text-gray-700 border border-rose-100"
                        title="Cancel"
                      >
                        ×
                      </button>
                      <button
                        type="button"
                        onClick={sendPendingImage}
                        disabled={uploadingMedia}
                        className="px-2 py-1 rounded-md bg-rose-500 text-white text-xs hover:bg-rose-600 disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  )}

                  {showComposerMenu && (
                    <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
                      <button type="button" onClick={() => setShowEmojiPicker((prev) => !prev)} className="p-2 text-pink-500 hover:bg-white rounded-lg" title="Smile">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-pink-500 hover:bg-white rounded-lg" title="Image">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </button>
                      <button type="button" onClick={() => fileAttachmentInputRef.current?.click()} className="p-2 text-pink-500 hover:bg-white rounded-lg" title="Paperclip">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 00-5.656-5.656L5.757 10.757a6 6 0 108.486 8.486L20 13" /></svg>
                      </button>
                      <button type="button" className="p-2 text-pink-500 hover:bg-white rounded-lg" title="Text">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M10 7v10m4-10v10" /></svg>
                      </button>
                      <button type="button" className="p-2 text-pink-500 hover:bg-white rounded-lg" title="AtSign">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8a6 6 0 10-4.47 9.71c1.34.31 2.75.14 4-.49M16 8v4a2 2 0 104 0V8a8 8 0 10-2.34 5.66" /></svg>
                      </button>
                      <button type="button" className="p-2 text-pink-500 hover:bg-white rounded-lg" title="List">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
                      </button>
                      <button type="button" className="p-2 text-pink-500 hover:bg-white rounded-lg" title="Bell">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.17V11a6 6 0 10-12 0v3.17a2 2 0 01-.6 1.42L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      </button>
                    </div>
                  )}

                  {/* Input row */}
                  <div className="flex flex-row items-center justify-between gap-3 p-4 border-t border-gray-300">
                    <button
                      type="button"
                      onClick={() => setShowComposerMenu((prev) => !prev)}
                      className="p-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
                      title="More"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleMediaSelect}
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                    />

                    <input
                      type="file"
                      ref={fileAttachmentInputRef}
                      className="hidden"
                      onChange={() => {
                        if (fileAttachmentInputRef.current) fileAttachmentInputRef.current.value = '';
                      }}
                    />

                    {/* Text input */}
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder="Enter message..."
                        maxLength={MAX_MESSAGE_LENGTH}
                        className="w-full flex-1 px-4 py-2 bg-pink-50 rounded-2xl text-sm text-gray-700 text-left placeholder:text-left placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                        style={{ minHeight: '40px', maxHeight: '100px' }}
                      />
                      {/* Character count */}
                      {newMessage.length > 900 && (
                        <span className={`absolute bottom-1.5 right-3 text-[10px] ${newMessage.length >= MAX_MESSAGE_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                          {MAX_MESSAGE_LENGTH - newMessage.length}
                        </span>
                      )}
                    </div>

                    {/* Send button */}
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sending || !isConnected}
                      className="p-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12h14m0 0l-4-4m4 4l-4 4" />
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
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50 flex items-center gap-2">
          {error}
          <button onClick={() => setError('')} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            ✕
          </button>
          <img
            src={lightboxImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Messages;