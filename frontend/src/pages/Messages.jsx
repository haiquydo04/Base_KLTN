import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { messageService } from '../services/api';
import Navbar from '../components/Navbar';

const Messages = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const suggestions = [
    { name: 'Khanh Vy', score: '98%' },
  ];

  const getConversationId = (conv) => conv.matchId || conv._id;

  const getOtherUser = (conv) => {
    if (conv?.userId) return conv.userId;
    const users = conv.users || conv.participants || [];
    return users.find((u) => u._id !== user?._id) || users[0] || null;
  };

  const isOwnMessage = (msg) => {
    const senderId = msg?.sender?._id || msg?.senderId?._id || msg?.sender || msg?.senderId;
    return String(senderId) === String(user?._id);
  };

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const response = await messageService.getConversations();
      const list = response.conversations || [];
      setConversations(Array.isArray(list) ? list : []);
      setError('');
      if (!selectedId && list?.length) {
        setSelectedId(getConversationId(list[0]));
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (matchId) => {
    if (!matchId) return;
    try {
      setLoadingMessages(true);
      const response = await messageService.getMessages(matchId);
      setMessages(Array.isArray(response.messages) ? response.messages : []);
      await messageService.markAsRead(matchId).catch(() => {});
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Không thể tải tin nhắn');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
    } else {
      setMessages([]);
    }
  }, [selectedId]);

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedId || sending) return;
    setSending(true);
    try {
      const response = await messageService.sendMessage(selectedId, {
        content: newMessage.trim(),
        type: 'text'
      });
      const newMsg = response.message || {
        _id: Date.now().toString(),
        content: newMessage.trim(),
        sender: { _id: user?._id, username: user?.username, avatar: user?.avatar },
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage('');
      setConversations((prev) => prev.map((c) => {
        if (getConversationId(c) !== selectedId) return c;
        return { ...c, lastMessage: newMsg };
      }));
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const activeConversation = conversations.find((c) => getConversationId(c) === selectedId);
  const activeUser = activeConversation ? getOtherUser(activeConversation) : null;

  const filteredConversations = conversations.filter((conv) => {
    const other = getOtherUser(conv);
    const name = (other?.fullName || other?.username || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen" style={{ background: '#fff7f7' }}>
      <Navbar />

      <main className="pt-6 pb-10 px-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6" style={{ minHeight: 'calc(100vh - 120px)' }}>
          {/* Left column */}
          <section className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-[28px] border border-rose-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-900">Tin nhắn</h1>
                <button className="w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.121 2.121 0 113 3L8 18l-4 1 1-4 11.5-11.5z" />
                  </svg>
                </button>
              </div>

              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35" />
                    <circle cx="11" cy="11" r="7" />
                  </svg>
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm hội thoại..."
                  className="w-full h-10 pl-10 pr-3 rounded-full bg-rose-50 text-sm text-gray-700 placeholder-gray-400 border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              {loadingConversations ? (
                <div className="py-16 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full border-2 border-rose-300 border-t-rose-500 animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">Chưa có cuộc trò chuyện</div>
              ) : (
                <div className="space-y-3">
                  {filteredConversations.map((conv) => {
                    const other = getOtherUser(conv);
                    const lastMessage = conv.lastMessage;
                    const isActive = getConversationId(conv) === selectedId;
                    return (
                      <button
                        key={getConversationId(conv)}
                        onClick={() => setSelectedId(getConversationId(conv))}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                          isActive ? 'border-rose-200 bg-rose-50' : 'border-transparent hover:bg-rose-50/70'
                        }`}
                      >
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full overflow-hidden ring-2 ${isActive ? 'ring-rose-300' : 'ring-rose-200'}`}>
                            {other?.avatar ? (
                              <img src={other.avatar} alt={other.username} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold">
                                {other?.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          {other?.isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm text-gray-900 truncate">{other?.fullName || other?.username}</p>
                            <span className="text-[10px] text-gray-400">
                              {lastMessage?.createdAt ? formatTime(lastMessage.createdAt) : ''}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {lastMessage?.content || 'Chưa có tin nhắn'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-6">
                <p className="text-[10px] font-semibold text-rose-500 tracking-widest">GOI Y TU LOVEAI</p>
                <div className="mt-3 space-y-2">
                  {suggestions.map((s) => (
                    <div key={s.name} className="flex items-center justify-between bg-rose-50 rounded-2xl p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                          <p className="text-[11px] text-rose-400">Tuong hop {s.score}</p>
                        </div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Right column */}
          <section className="col-span-12 lg:col-span-8" style={{ minHeight: 'calc(100vh - 120px)' }}>
            <div className="bg-white rounded-[28px] border border-rose-100 shadow-sm h-full flex flex-col" style={{ minHeight: 'calc(100vh - 120px)' }}>
              {/* Header */}
              <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-rose-200 bg-rose-200">
                    {activeUser?.avatar ? (
                      <img src={activeUser.avatar} alt={activeUser.username} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{activeUser?.fullName || activeUser?.username || 'Chon hoi thoai'}</p>
                    <p className="text-xs text-gray-400">{activeUser?.isOnline ? 'Dang hoat dong' : 'Khong hoat dong'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                  <button className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 px-6 py-4 overflow-y-auto">
                {error && (
                  <div className="mb-4 text-sm text-red-500">{error}</div>
                )}
                {loadingMessages ? (
                  <div className="py-16 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full border-2 border-rose-300 border-t-rose-500 animate-spin" />
                  </div>
                ) : !selectedId ? (
                  <div className="py-16 text-center text-sm text-gray-400">Chua co tin nhan trong cuoc tro chuyen nay</div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center text-sm text-gray-400">Chua co tin nhan trong cuoc tro chuyen nay</div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, idx) => {
                      const isOwn = isOwnMessage(msg);
                      return (
                        <div key={msg._id || idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${isOwn ? 'text-right' : 'text-left'}`}>
                            <div className={`px-4 py-2 rounded-2xl text-sm ${
                              isOwn
                                ? 'bg-rose-600 text-white rounded-br-sm'
                                : 'bg-rose-50 text-gray-700 rounded-bl-sm'
                            }`}>
                              {msg.content}
                            </div>
                            <div className="mt-1 text-[10px] text-gray-400">
                              {formatDate(msg.createdAt)} {formatTime(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Composer */}
              <form onSubmit={handleSend} className="px-6 pb-6">
                <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-full px-4 py-2">
                  <button type="button" className="text-rose-400 hover:text-rose-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                    </svg>
                  </button>
                  <button type="button" className="text-rose-400 hover:text-rose-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <div className="relative flex-1">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Nhap tin nhan..."
                      className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none pr-8"
                    />
                    <button type="button" className="absolute right-1 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                      </svg>
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending || !selectedId}
                    className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Messages;
