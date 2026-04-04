import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';

const EMOJIS = ['😀', '😍', '🥰', '😂', '🤍', '🔥', '👏', '✨', '😭', '👍'];
const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80';

const STATUS_LABEL = {
  sent: 'Sent',
  received: 'Received',
  viewed: 'Viewed',
};

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const seedConversations = () => {
  const now = Date.now();
  return [
    {
      id: 'conv-1',
      participant: {
        id: 'u-11',
        name: 'Minh Anh',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
        isOnline: true,
        lastSeen: null,
      },
      messages: [
        { id: makeId(), sender: 'them', type: 'text', content: 'Hi! You free this weekend?', createdAt: new Date(now - 22 * 60000).toISOString() },
        { id: makeId(), sender: 'me', type: 'text', content: 'Yes, maybe coffee on Saturday?', createdAt: new Date(now - 18 * 60000).toISOString(), status: 'viewed' },
        { id: makeId(), sender: 'them', type: 'text', content: 'Perfect. I know a quiet place.', createdAt: new Date(now - 14 * 60000).toISOString() },
      ],
    },
    {
      id: 'conv-2',
      participant: {
        id: 'u-12',
        name: 'Duc Duy',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
        isOnline: false,
        lastSeen: new Date(now - 40 * 60000).toISOString(),
      },
      messages: [
        { id: makeId(), sender: 'me', type: 'text', content: 'Your hiking photos are great.', createdAt: new Date(now - 4 * 3600000).toISOString(), status: 'viewed' },
        { id: makeId(), sender: 'them', type: 'text', content: 'Thank you! We should go on a short trail.', createdAt: new Date(now - 3.7 * 3600000).toISOString() },
      ],
    },
    {
      id: 'conv-3',
      participant: {
        id: 'u-13',
        name: 'Phuong Linh',
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
        isOnline: true,
        lastSeen: null,
      },
      messages: [
        { id: makeId(), sender: 'them', type: 'text', content: 'Can I share a playlist with you?', createdAt: new Date(now - 2 * 3600000).toISOString() },
      ],
    },
    {
      id: 'conv-4',
      participant: {
        id: 'u-14',
        name: 'Thu Trang',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
        isOnline: false,
        lastSeen: new Date(now - 26 * 60000).toISOString(),
      },
      messages: [],
    },
  ];
};

const Messages = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState(seedConversations);
  const [selectedConversationId, setSelectedConversationId] = useState('conv-1');
  const [search, setSearch] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  const fileInputRef = useRef(null);
  const messagesRef = useRef(null);

  const activeConversation = useMemo(
    () => conversations.find((conv) => conv.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const filteredConversations = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const list = [...conversations].sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.createdAt || 0;
      const bLast = b.messages[b.messages.length - 1]?.createdAt || 0;
      return new Date(bLast).getTime() - new Date(aLast).getTime();
    });

    if (!keyword) return list;
    return list.filter((conv) => conv.participant.name.toLowerCase().includes(keyword));
  }, [conversations, search]);

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

  const lastMessagePreview = (conv) => {
    const last = conv.messages[conv.messages.length - 1];
    if (!last) return 'No messages yet';
    if (last.type === 'image') return 'Sent an image';
    return last.content;
  };

  const scrollToBottom = () => {
    const container = messagesRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversationId, activeConversation?.messages.length]);

  useEffect(() => {
    if (!statusNotice) return undefined;
    const timeout = setTimeout(() => setStatusNotice(''), 1800);
    return () => clearTimeout(timeout);
  }, [statusNotice]);

  const updateMessageStatus = (conversationId, messageId, status) => {
    setConversations((prev) => prev.map((conv) => {
      if (conv.id !== conversationId) return conv;
      return {
        ...conv,
        messages: conv.messages.map((msg) => (msg.id === messageId ? { ...msg, status } : msg)),
      };
    }));
  };

  const pushMessage = (conversationId, message) => {
    setConversations((prev) => prev.map((conv) => {
      if (conv.id !== conversationId) return conv;
      return {
        ...conv,
        messages: [...conv.messages, message],
      };
    }));
  };

  const simulateReply = (conversationId) => {
    const replies = [
      'Nice! I like that idea.',
      'Sounds good to me.',
      'Haha that made my day.',
      'Can we talk more tonight?',
      'I am here now.',
    ];

    const reply = {
      id: makeId(),
      sender: 'them',
      type: 'text',
      content: replies[Math.floor(Math.random() * replies.length)],
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      pushMessage(conversationId, reply);
    }, 1100 + Math.random() * 1200);
  };

  const sendMessage = ({ type, content, imageUrl }) => {
    if (!activeConversation) return;
    if (type === 'text' && !content.trim()) return;

    const newMsg = {
      id: makeId(),
      sender: 'me',
      type,
      content: content.trim(),
      imageUrl,
      createdAt: new Date().toISOString(),
      status: 'sent',
      senderName: user?.fullName || user?.username || 'You',
    };

    pushMessage(activeConversation.id, newMsg);
    setMessageText('');
    setShowEmojiPicker(false);

    setTimeout(() => updateMessageStatus(activeConversation.id, newMsg.id, 'received'), 700);
    setTimeout(() => updateMessageStatus(activeConversation.id, newMsg.id, 'viewed'), 2200);
    simulateReply(activeConversation.id);
  };

  const handleSendText = (event) => {
    event.preventDefault();
    sendMessage({ type: 'text', content: messageText, imageUrl: null });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage({ type: 'text', content: messageText, imageUrl: null });
    }
  };

  const handlePickImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    sendMessage({ type: 'image', content: '', imageUrl });
    setStatusNotice('Image sent (mock).');
    event.target.value = '';
  };

  useEffect(() => {
    const incomingInterval = setInterval(() => {
      setConversations((prev) => {
        if (!prev.length) return prev;
        const randomIndex = Math.floor(Math.random() * prev.length);
        const target = prev[randomIndex];
        const incoming = {
          id: makeId(),
          sender: 'them',
          type: 'text',
          content: 'Auto update message without reload.',
          createdAt: new Date().toISOString(),
        };

        return prev.map((conv, idx) => (idx === randomIndex ? { ...conv, messages: [...conv.messages, incoming] } : conv));
      });
    }, 18000);

    return () => clearInterval(incomingInterval);
  }, []);

  useEffect(() => {
    const presenceInterval = setInterval(() => {
      setConversations((prev) => prev.map((conv) => {
        const shouldFlip = Math.random() < 0.18;
        if (!shouldFlip) return conv;
        const isOnline = !conv.participant.isOnline;
        return {
          ...conv,
          participant: {
            ...conv.participant,
            isOnline,
            lastSeen: isOnline ? null : new Date().toISOString(),
          },
        };
      }));
    }, 12000);

    return () => clearInterval(presenceInterval);
  }, []);

  const renderPresence = (participant) => {
    if (participant.isOnline) return 'Online now';
    if (!participant.lastSeen) return 'Offline';
    return `Last seen ${formatConversationTime(participant.lastSeen)}`;
  };

  return (
    <div className="min-h-screen" style={{ background: '#fff7f7' }}>
      <Navbar />

      <main className="pt-6 pb-10 px-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <section className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-[28px] border border-rose-100 shadow-sm p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">Mock mode</span>
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
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search conversation..."
                  className="w-full h-10 pl-10 pr-3 rounded-full bg-rose-50 text-sm text-gray-700 placeholder-gray-400 border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              {filteredConversations.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">No conversations found</div>
              ) : (
                <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                  {filteredConversations.map((conv) => {
                    const last = conv.messages[conv.messages.length - 1];
                    const isActive = conv.id === selectedConversationId;

                    return (
                      <button
                        key={conv.id}
                        type="button"
                        onClick={() => setSelectedConversationId(conv.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                          isActive ? 'border-rose-200 bg-rose-50' : 'border-transparent hover:bg-rose-50/70'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={conv.participant.avatar || FALLBACK_AVATAR}
                            alt={conv.participant.name}
                            className={`w-12 h-12 rounded-full object-cover ring-2 ${isActive ? 'ring-rose-300' : 'ring-rose-200'}`}
                          />
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${conv.participant.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        </div>

                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-sm text-gray-900 truncate">{conv.participant.name}</p>
                            <span className="text-[10px] text-gray-400 shrink-0">{formatConversationTime(last?.createdAt)}</span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{lastMessagePreview(conv)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="col-span-12 lg:col-span-8" style={{ minHeight: 'calc(100vh - 120px)' }}>
            <div className="bg-white rounded-[28px] border border-rose-100 shadow-sm h-full flex flex-col overflow-hidden" style={{ minHeight: 'calc(100vh - 120px)' }}>
              <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between">
                {activeConversation ? (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={activeConversation.participant.avatar || FALLBACK_AVATAR}
                        alt={activeConversation.participant.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-rose-200"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{activeConversation.participant.name}</p>
                        <p className="text-xs text-gray-400">{renderPresence(activeConversation.participant)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center" aria-label="Call">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </button>
                      <button type="button" className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center" aria-label="Video">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Select a conversation to start chatting.</p>
                )}
              </div>

              <div ref={messagesRef} className="flex-1 px-6 py-5 overflow-y-auto bg-gradient-to-b from-white to-rose-50/30">
                {!activeConversation ? (
                  <div className="h-full flex items-center justify-center text-sm text-gray-400">No active conversation</div>
                ) : activeConversation.messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-gray-400">No messages yet. Send the first one.</div>
                ) : (
                  <div className="space-y-4">
                    {activeConversation.messages.map((msg) => {
                      const isOwn = msg.sender === 'me';
                      return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[78%] ${isOwn ? 'text-right' : 'text-left'}`}>
                            <div className={`rounded-2xl px-4 py-2.5 text-sm ${isOwn ? 'bg-rose-600 text-white rounded-br-sm' : 'bg-rose-100 text-gray-700 rounded-bl-sm'}`}>
                              {msg.type === 'image' ? (
                                <img src={msg.imageUrl} alt="sent" className="w-48 h-48 object-cover rounded-xl" />
                              ) : (
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              )}
                            </div>

                            <div className="mt-1 text-[10px] text-gray-400 flex items-center gap-2 justify-end">
                              <span>{formatClock(msg.createdAt)}</span>
                              {isOwn && msg.status && <span>{STATUS_LABEL[msg.status]}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <form onSubmit={handleSendText} className="px-6 pb-6 pt-4 border-t border-rose-100 bg-white">
                {showEmojiPicker && (
                  <div className="mb-3 rounded-2xl border border-rose-100 bg-rose-50 p-3 flex flex-wrap gap-2">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setMessageText((prev) => `${prev}${emoji}`)}
                        className="w-9 h-9 rounded-lg hover:bg-white text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePickImage}
                  className="hidden"
                />

                <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-full px-4 py-2">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className="text-rose-400 hover:text-rose-600"
                    aria-label="Emoji"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-rose-400 hover:text-rose-600"
                    aria-label="Image"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>

                  <textarea
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none resize-none max-h-24"
                  />

                  <button
                    type="submit"
                    disabled={!activeConversation || !messageText.trim()}
                    className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center disabled:opacity-50"
                    aria-label="Send"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>

                <p className="text-[11px] text-gray-400 mt-2">Press Enter to send, Shift+Enter for newline.</p>
              </form>
            </div>
          </section>
        </div>
      </main>

      {statusNotice && (
        <div className="fixed bottom-5 right-5 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">
          {statusNotice}
        </div>
      )}
    </div>
  );
};

export default Messages;
