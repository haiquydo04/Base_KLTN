import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../context/SocketContext';
import { messageService, userService } from '../services/api';

const Chat = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { socket, connect } = useSocket();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await messageService.getMessages(matchId);
      setMessages(response.messages || []);

      const matches = await userService.getMatches();
      const match = matches.matches?.find(m => m._id === matchId);
      if (match) {
        const other = match.users?.find(u => u._id !== user?._id);
        setOtherUser(other);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [matchId, user?._id]);

  useEffect(() => {
    fetchMessages();
    scrollToBottom();
  }, [fetchMessages]);

  useEffect(() => {
    if (!socket) {
      connect();
    }

    return () => {
      if (socket) {
        socket.emit('leave_room', matchId);
      }
    };
  }, [socket, connect, matchId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join_room', matchId);

    socket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();

      messageService.markAsRead(matchId).catch(console.error);
    });

    socket.on('user_typing', ({ user: typingUser }) => {
      setTypingUser(typingUser);
    });

    socket.on('user_stop_typing', () => {
      setTypingUser(null);
    });

    socket.on('incoming_call', (data) => {
      setIncomingCall(data);
    });

    socket.on('call_accepted', async (data) => {
      await handleCallAccepted(data);
    });

    socket.on('call_rejected', () => {
      alert('Call was rejected');
      endCall();
    });

    socket.on('call_ended', () => {
      endCall();
    });

    socket.on('remote_stream', (stream) => {
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
      socket.off('incoming_call');
      socket.off('call_accepted');
      socket.off('call_rejected');
      socket.off('call_ended');
      socket.off('remote_stream');
    };
  }, [socket, matchId]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('typing', { matchId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('stop_typing', { matchId });
    }, 2000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await messageService.sendMessage(matchId, {
        content: newMessage.trim(),
        type: 'text'
      });

      socket?.emit('send_message', {
        matchId,
        content: newMessage.trim(),
        type: 'text'
      });

      setNewMessage('');
      socket?.emit('stop_typing', { matchId });
      setIsTyping(false);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      stream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, stream);
      });

      peerConnection.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit('ice_candidate', {
            targetUserId: otherUser?._id,
            candidate: event.candidate
          });
        }
      };

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket?.emit('call_user', {
        targetUserId: otherUser?._id,
        signalData: offer,
        callType: 'video'
      });

      setIsVideoCallActive(true);
    } catch (err) {
      console.error('Error starting video call:', err);
      alert('Could not start video call. Please check camera/microphone permissions.');
    }
  };

  const handleCallAccepted = async (data) => {
    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.signal));

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, stream);
      });

      setIsVideoCallActive(true);
    } catch (err) {
      console.error('Error handling call accepted:', err);
    }
  };

  const acceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      stream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, stream);
      });

      peerConnection.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit('ice_candidate', {
            targetUserId: incomingCall.caller._id,
            candidate: event.candidate
          });
        }
      };

      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket?.emit('accept_call', {
        callerId: incomingCall.caller._id,
        signalData: answer
      });

      setIncomingCall(null);
      setIsVideoCallActive(true);
    } catch (err) {
      console.error('Error accepting call:', err);
    }
  };

  const rejectCall = () => {
    socket?.emit('reject_call', { callerId: incomingCall.caller._id });
    setIncomingCall(null);
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    setRemoteStream(null);
    setIsVideoCallActive(false);

    socket?.emit('end_call', { targetUserId: otherUser?._id });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/matches')}
              className="p-2 hover:bg-gray-700 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <Link to={`/profile/${otherUser?._id}`} className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gray-700 overflow-hidden">
                  {otherUser?.avatar ? (
                    <img src={otherUser.avatar} alt={otherUser.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-500">
                      <span className="text-xl font-bold text-white">
                        {otherUser?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {otherUser?.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-3 border-gray-800 rounded-full"></div>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-white">
                  {otherUser?.fullName || otherUser?.username}
                </h2>
                <p className="text-xs text-gray-400">
                  {otherUser?.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </Link>
          </div>

          {!isVideoCallActive && (
            <button
              onClick={startVideoCall}
              className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Video Call UI */}
      {isVideoCallActive && (
        <div className="relative bg-black h-64 sm:h-80">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 w-28 h-36 sm:w-36 sm:h-28 object-cover rounded-xl border-2 border-white/30 shadow-lg"
          />
          <button
            onClick={endCall}
            className="absolute top-4 right-4 p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>
        </div>
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-3xl p-8 max-w-sm w-full text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
              {incomingCall.caller.avatar ? (
                <img src={incomingCall.caller.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {incomingCall.caller.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{incomingCall.caller.username}</h3>
            <p className="text-gray-400 mb-8">Incoming video call...</p>
            <div className="flex justify-center gap-6">
              <button
                onClick={rejectCall}
                className="p-5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </button>
              <button
                onClick={acceptCall}
                className="p-5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all shadow-lg"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-lg mx-auto space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          ) : messages.length === 0 ? null : (
            messages.map((message, index) => {
              const isOwnMessage = message.sender?._id === user?._id || message.sender === user?._id;

              return (
                <div
                  key={message._id || index}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[75%]`}>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-sm'
                          : 'bg-gray-800 text-white rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {typingUser && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
          <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-600">Zz</span>
            <span>{otherUser?.fullName || otherUser?.username || 'User'} has paused their notifications</span>
          </div>

          <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 text-gray-500">
              <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 font-semibold">B</button>
              <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 italic">I</button>
              <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 underline">U</button>
              <button type="button" className="px-2 py-1 rounded hover:bg-gray-100">S</button>
              <span className="w-px h-5 bg-gray-200 mx-1" />
              <button type="button" className="px-2 py-1 rounded hover:bg-gray-100">1</button>
              <button type="button" className="px-2 py-1 rounded hover:bg-gray-100">•</button>
              <button type="button" className="px-2 py-1 rounded hover:bg-gray-100">≡</button>
              <span className="w-px h-5 bg-gray-200 mx-1" />
              <button type="button" className="px-2 py-1 rounded hover:bg-gray-100">&lt;/&gt;</button>
              <button type="button" className="px-2 py-1 rounded hover:bg-gray-100">&lt;/&gt;</button>
            </div>

            <textarea
              rows={3}
              value={newMessage}
              onChange={handleTyping}
              placeholder="Nhập tin nhắn..."
              className="w-full px-4 py-3 text-gray-800 placeholder-gray-400 resize-none focus:outline-none"
            />

            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 text-gray-500">
              <div className="flex items-center gap-3">
                <button type="button" className="w-8 h-8 rounded hover:bg-gray-100">+</button>
                <button type="button" className="w-8 h-8 rounded hover:bg-gray-100">Aa</button>
                <button type="button" className="w-8 h-8 rounded hover:bg-gray-100">😊</button>
                <button type="button" className="w-8 h-8 rounded hover:bg-gray-100">@</button>
                <button type="button" className="w-8 h-8 rounded hover:bg-gray-100">📹</button>
                <button type="button" className="w-8 h-8 rounded hover:bg-gray-100">🎤</button>
                <button type="button" className="w-8 h-8 rounded hover:bg-gray-100">▢</button>
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-3 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Gửi
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
