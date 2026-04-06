/**
 * Messages Page - Trang tin nhắn với backend API
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../context/SocketContext';
import { messageService } from '../services/api';
import Navbar from '../components/Navbar';

const EMOJIS = ['😀', '😍', '🥰', '😂', '🤍', '🔥', '👏', '✨', '😭', '👍'];
const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80';

const Messages = () => {
  const { user } = useAuthStore();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const response = await messageService.getConversations();
      const list = response.conversations || response.data || [];
      setConversations(Array.isArray(list) ? list : []);

      // Auto select first conversation
      if (list.length > 0) {
        setSelectedConversationId(list[0].matchId);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (matchId) => {
    if (!matchId) return;
    try {
      setLoadingMessages(true);
      const response = await messageService.getMessages(matchId);
      const msgs = response.messages || response.data || [];
      setMessages(Array.isArray(msgs) ? msgs : []);
      await messageService.markAsRead(matchId).catch(() => {});
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Không thể tải tin nhắn');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages when conversation selected
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

  // Socket listener for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.matchId === selectedConversationId || message.conversationId === selectedConversationId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
      // Update conversation list
      fetchConversations();
    };

    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, [socket, selectedConversationId]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedConversationId || sending) return;

    setSending(true);
    try {
      const response = await messageService.sendMessage(selectedConversationId, {
        content: newMessage.trim(),
        type: 'text'
      });

      const sentMessage = response.message || response.data;
      if (sentMessage) {
        setMessages(prev => [...prev, sentMessage]);
      }

      setNewMessage('');
      fetchConversations();
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  // Handle enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format time
  const formatClock = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatConversationTime = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return formatClock(iso);
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

  // Get last message preview
  const getLastMessage = (conv) => {
    if (conv.lastMessage) {
      const isMe = conv.lastMessage.sender === user?._id || conv.lastMessage.sender?._id === user?._id;
      return isMe ? `Bạn: ${conv.lastMessage.content}` : conv.lastMessage.content;
    }
    return 'Chưa có tin nhắn';
  };

  return (
    <div className="min-h-screen" style={{ background: '#fff7f7' }}>
      <Navbar />

      <main className="pt-6 pb-10 px-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6" style={{ minHeight: 'calc(100vh - 120px)' }}>

          {/* Conversations List */}
          <section className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-[28px] border border-rose-100 shadow-sm p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-900">Tin nhắn</h1>
                {conversations.length > 0 && (
                  <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
                    {conversations.length} cuộc trò chuyện
                  </span>
                )}
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35" />
                    <circle cx="11" cy="11" r="7" />
                  </svg>
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm kiếm cuộc trò chuyện..."
                  className="w-full h-10 pl-10 pr-3 rounded-full bg-rose-50 text-sm text-gray-700 placeholder-gray-400 border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              {loadingConversations ? (
                <div className="py-10 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-500 mx-auto"></div>
                  <p className="text-sm text-gray-400 mt-2">Đang tải...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">
                  {search ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}
                </div>
              ) : (
                <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                  {filteredConversations.map((conv) => {
                    const otherUser = conv.userId;
                    const isActive = conv.matchId === selectedConversationId;

                    return (
                      <button
                        key={conv.matchId}
                        type="button"
                        onClick={() => setSelectedConversationId(conv.matchId)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                          isActive ? 'border-rose-200 bg-rose-50' : 'border-transparent hover:bg-rose-50/70'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-rose-200">
                            {otherUser?.avatar ? (
                              <img
                                src={otherUser.avatar}
                                alt={otherUser.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                {(otherUser?.fullName || otherUser?.username || '?').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          {otherUser?.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                              {otherUser?.fullName || otherUser?.username || 'Unknown'}
                            </p>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {formatConversationTime(conv.lastActivity)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{getLastMessage(conv)}</p>
                        </div>

                        {/* Unread badge */}
                        {conv.unreadCount > 0 && (
                          <span className="flex-shrink-0 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                            {conv.unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Chat Area */}
          <section className="col-span-12 lg:col-span-8" style={{ minHeight: 'calc(100vh - 120px)' }}>
            <div className="bg-white rounded-[28px] border border-rose-100 shadow-sm h-full flex flex-col overflow-hidden" style={{ minHeight: 'calc(100vh - 120px)' }}>

              {/* Header */}
              <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between">
                {activeConversation ? (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-rose-200">
                        {activeConversation.userId?.avatar ? (
                          <img
                            src={activeConversation.userId.avatar}
                            alt={activeConversation.userId.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {(activeConversation.userId?.fullName || activeConversation.userId?.username || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {activeConversation.userId?.fullName || activeConversation.userId?.username || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {activeConversation.userId?.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/chat/${activeConversation.matchId}`}
                        className="px-3 py-1.5 bg-rose-500 text-white text-xs font-semibold rounded-full hover:bg-rose-600 transition-colors"
                      >
                        Mở chat đầy đủ
                      </Link>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Chọn một cuộc trò chuyện để bắt đầu</p>
                )}
              </div>

              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 px-6 py-5 overflow-y-auto bg-gradient-to-b from-white to-rose-50/30">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-500"></div>
                  </div>
                ) : !activeConversation ? (
                  <div className="h-full flex items-center justify-center text-sm text-gray-400">
                    Chọn một cuộc trò chuyện để bắt đầu nhắn tin
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-gray-400">
                    Chưa có tin nhắn. Hãy gửi tin nhắn đầu tiên!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isOwn = msg.sender === user?._id || msg.sender?._id === user?._id;
                      return (
                        <div key={msg._id || msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[78%] ${isOwn ? 'text-right' : 'text-left'}`}>
                            <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                              isOwn
                                ? 'bg-rose-600 text-white rounded-br-sm'
                                : 'bg-rose-100 text-gray-700 rounded-bl-sm'
                            }`}>
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            </div>
                            <div className="mt-1 text-[10px] text-gray-400 flex items-center gap-2 justify-end">
                              <span>{formatClock(msg.createdAt)}</span>
                              {isOwn && msg.status === 'seen' && <span>✓✓</span>}
                              {isOwn && msg.status === 'sent' && <span>✓</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              {activeConversation && (
                <form onSubmit={handleSend} className="px-6 pb-6 pt-4 border-t border-rose-100 bg-white">
                  {showEmojiPicker && (
                    <div className="mb-3 rounded-2xl border border-rose-100 bg-rose-50 p-3 flex flex-wrap gap-2">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewMessage(prev => `${prev}${emoji}`)}
                          className="w-9 h-9 rounded-lg hover:bg-white text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-full px-4 py-2">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(prev => !prev)}
                      className="text-rose-400 hover:text-rose-600"
                    >
                      😊
                    </button>

                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none resize-none max-h-24"
                    />

                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center disabled:opacity-50 hover:bg-rose-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-400 mt-2">Nhấn Enter để gửi, Shift+Enter để xuống dòng</p>
                </form>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-5 right-5 bg-red-500 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default Messages;
