/**
 * Chat Component - Real-time messaging with:
 * - Pagination (scroll up for older messages)
 * - Error retry UI
 * - Read receipts
 * - Media upload
 * - Typing indicators
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../context/SocketContext';
import { messageService, userService } from '../services/api';
import useChatPagination from '../hooks/useChatPagination';

const MAX_MESSAGE_LENGTH = 1000;

const Chat = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { socket, isConnected } = useSocket();

  // Pagination hook
  const {
    messages,
    loading,
    loadingMore,
    hasMore,
    error,
    messagesEndRef,
    messagesStartRef,
    fetchMessages,
    addMessage,
    updateMessageStatus,
    handleScroll
  } = useChatPagination(matchId);

  // UI State
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [failedMessages, setFailedMessages] = useState(new Map()); // tempId -> message
  const [otherUser, setOtherUser] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  
  // Video call state
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Format time helper
  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Fetch other user info
  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        const matchesResponse = await userService.getMatches();
        const matchList = matchesResponse?.matches || matchesResponse?.data || [];
        const match = Array.isArray(matchList) ? matchList.find(m => m._id === matchId) : null;

        if (match) {
          const other = match.users?.find(u => u._id !== user?._id) ||
            (match.user1Id?.toString() === user?._id?.toString() ? match.user2Id : match.user1Id);
          setOtherUser(other);
        }
      } catch (err) {
        // Error handled silently - user profile is not critical
      }
    };

    if (matchId) {
      fetchOtherUser();
    }
  }, [matchId, user?._id]);

  // Initial messages fetch
  useEffect(() => {
    fetchMessages();
    return () => {
      socket?.emit('leave_room', matchId);
    };
  }, [matchId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !matchId) return;

    // Join room
    socket.emit('join_room', { matchId });

    // New message received
    const handleReceiveMessage = (message) => {
      // Check if already exists (from optimistic update)
      if (!messages.some(m => m._id === message._id || m._tempId === message._tempId)) {
        addMessage(message);
        
        // Mark as read
        messageService.markAsRead(matchId).catch(() => {});
      }
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    // Typing indicator
    const handleTyping = ({ user: typer }) => {
      if (typer?._id !== user?._id) {
        setTypingUser(typer);
      }
    };

    const handleStopTyping = () => {
      setTypingUser(null);
    };

    // Read receipt
    const handleMessagesRead = ({ readAt }) => {
      // Update all messages to 'seen' status
      messages.forEach(msg => {
        if (msg.status !== 'seen' && msg.sender?._id !== user?._id) {
          updateMessageStatus(msg._id, 'seen');
        }
      });
    };

    // Unread update
    const handleUnreadUpdate = ({ increment }) => {
      // Could update unread count in parent Messages component
    };

    // Video call events
    const handleIncomingCall = (data) => setIncomingCall(data);
    const handleCallAccepted = (data) => handleCallAcceptedFn(data);
    const handleCallRejected = () => {
      alert('Call was rejected');
      endCall();
    };
    const handleCallEnded = () => endCall();
    const handleRemoteStream = (stream) => {
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    // Register listeners
    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);
    socket.on('messages_read', handleMessagesRead);
    socket.on('unread_update', handleUnreadUpdate);
    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_rejected', handleCallRejected);
    socket.on('call_ended', handleCallEnded);
    socket.on('remote_stream', handleRemoteStream);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
      socket.off('messages_read', handleMessagesRead);
      socket.off('unread_update', handleUnreadUpdate);
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('call_rejected', handleCallRejected);
      socket.off('call_ended', handleCallEnded);
      socket.off('remote_stream', handleRemoteStream);
    };
  }, [socket, matchId, user?._id]);

  // Handle typing
  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!typingTimeoutRef.current) {
      socket?.emit('typing', { matchId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('stop_typing', { matchId });
      typingTimeoutRef.current = null;
    }, 2000);
  };

  // Retry failed message
  const retryMessage = async (tempId, content) => {
    setFailedMessages(prev => {
      const newMap = new Map(prev);
      newMap.delete(tempId);
      return newMap;
    });
    
    setNewMessage(content);
    await sendMessage({ forceSend: true });
  };

  // Send message
  const sendMessage = async (e, options = {}) => {
    if (e) e.preventDefault();
    
    const content = newMessage.trim();
    const { forceSend = false } = options;
    
    if (!content && !forceSend) return;
    if (!content && forceSend) {
      setSendError('Message cannot be empty');
      return;
    }
    
    if (content.length > MAX_MESSAGE_LENGTH) {
      setSendError(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }

    setSending(true);
    setSendError(null);

    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    try {
      const response = await messageService.sendMessage(matchId, {
        content,
        type: 'text'
      });

      if (response.success) {
        // Add real message (remove temp if exists)
        setMessages(prev => prev.filter(m => m._tempId !== tempId));
        if (response.data) {
          addMessage(response.data);
        }
        
        setNewMessage('');
        socket?.emit('stop_typing', { matchId });
        
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (err) {
      // Error handled with user-friendly message
      let errorMsg = 'Failed to send message';
      if (err.response?.status === 429) {
        errorMsg = 'Too many messages. Please slow down.';
      } else if (err.response?.status === 400) {
        errorMsg = err.response.data?.message || 'Invalid message';
      }
      
      setSendError(errorMsg);
      
      setFailedMessages(prev => new Map(prev).set(tempId, content));
    } finally {
      setSending(false);
    }
  };

  // Handle media upload
  const handleMediaSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }

    setUploadingMedia(true);

    try {
      const response = await messageService.uploadMedia(matchId, file);

      if (response.success) {
        // Send message with image
        await messageService.sendMessage(matchId, {
          content: '',
          image: response.mediaUrl,
          messageType: 'image'
        });
        
        // Refresh to get the new message
        fetchMessages();
      }
    } catch (err) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Video call handlers
  const handleCallAcceptedFn = async (data) => {
    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.signal));
      setIsVideoCallActive(true);
    } catch {
      // Video call setup error handled silently
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
    } catch {
      alert('Could not start video call. Please check camera/microphone permissions.');
    }
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
    } catch {
      // Call acceptance error handled silently
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/messages')}
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
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
          <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 w-28 h-36 sm:w-36 sm:h-28 object-cover rounded-xl border-2 border-white/30 shadow-lg" />
          <button onClick={endCall} className="absolute top-4 right-4 p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg">
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
              <button onClick={() => { socket?.emit('reject_call', { callerId: incomingCall.caller._id }); setIncomingCall(null); }} className="p-5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </button>
              <button onClick={acceptCall} className="p-5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div 
        className="flex-1 overflow-y-auto p-4"
        onScroll={handleScroll}
        ref={messagesStartRef}
      >
        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        )}

        {/* Load more trigger */}
        {hasMore && !loadingMore && (
          <div className="flex justify-center py-2">
            <button 
              onClick={() => loadMoreMessages?.()}
              className="text-gray-500 text-sm hover:text-pink-500 transition-colors"
            >
              Load older messages
            </button>
          </div>
        )}

        <div className="max-w-lg mx-auto space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              // Get sender info
              const senderData = message.sender?._id ? message.sender : 
                                (message.senderId?._id ? message.senderId : null);
              const isOwnMessage = senderData?._id === user?._id || message.sender === user?._id;
              const senderName = senderData?.username || senderData?.fullName || 'Unknown';
              const senderAvatar = senderData?.avatar;

              // Check if this is a failed message
              const isFailed = failedMessages.has(message._tempId || message._id);

              return (
                <div
                  key={message._id || message._tempId || index}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[75%]`}>
                    {/* Avatar */}
                    {!isOwnMessage && (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-700">
                        {senderAvatar ? (
                          <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {senderName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className="relative">
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-sm'
                            : 'bg-gray-800 text-white rounded-bl-sm'
                        } ${isFailed ? 'border-2 border-red-500' : ''}`}
                      >
                        {/* Sender name */}
                        {!isOwnMessage && (
                          <p className="text-xs font-semibold text-pink-400 mb-1">
                            {senderName}
                          </p>
                        )}

                        {/* Message content */}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content || (message.image || message.mediaUrl ? '[Image]' : '')}
                        </p>

                        {/* Image */}
                        {(message.image || message.mediaUrl) && (
                          <img 
                            src={message.image || message.mediaUrl} 
                            alt="Shared image" 
                            className="mt-2 max-w-full rounded-lg cursor-pointer hover:opacity-90"
                            onClick={() => window.open(message.image || message.mediaUrl, '_blank')}
                          />
                        )}

                        {/* Time + Status */}
                        <div className={`flex items-center gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <span className={`text-xs ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
                            {formatTime(message.createdAt)}
                          </span>
                          
                          {/* Read receipt - sent/delivered/seen */}
                          {isOwnMessage && (
                            <span className="text-xs text-white/70">
                              {message.status === 'seen' ? '✓✓' : 
                               message.status === 'delivered' ? '✓✓' : 
                               message.status === 'sent' ? '✓' : '○'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Retry button for failed messages */}
                      {isFailed && (
                        <button
                          onClick={() => retryMessage(message._tempId || message._id, failedMessages.get(message._tempId || message._id))}
                          className="absolute -top-8 right-0 px-2 py-1 bg-red-500 text-white text-xs rounded-lg flex items-center gap-1 hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {typingUser && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>{typingUser.username || typingUser.fullName} is typing</span>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-3">
        {/* Error message */}
        {sendError && (
          <div className="mb-2 px-3 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center justify-between">
            <span>{sendError}</span>
            <button onClick={() => setSendError(null)} className="text-red-400 hover:text-red-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <form onSubmit={sendMessage} className="max-w-lg mx-auto">
          <div className="flex items-end gap-2">
            {/* Media upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingMedia}
              className="p-3 text-gray-400 hover:text-pink-500 hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
            >
              {uploadingMedia ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-pink-500"></div>
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                maxLength={MAX_MESSAGE_LENGTH}
                rows={1}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              
              {/* Character count */}
              {newMessage.length > 900 && (
                <span className={`absolute bottom-2 right-3 text-xs ${newMessage.length >= MAX_MESSAGE_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                  {MAX_MESSAGE_LENGTH - newMessage.length}
                </span>
              )}
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!newMessage.trim() || sending || !isConnected}
              className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-xs text-yellow-500 mt-2 text-center">
              ⚠️ Not connected. Messages will be sent when reconnected.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Chat;