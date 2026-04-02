import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';

const RandomVideoChat = () => {
  const { user } = useAuthStore();
  const { socket, connect } = useSocket();

  const [status, setStatus] = useState('idle');
  const [partner, setPartner] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [streamReady, setStreamReady] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const pendingCandidates = useRef([]);
  const isInitiator = useRef(false);

  useEffect(() => {
    initializeMedia();

    return () => {
      cleanup();
    };
  }, []);

  const initializeMedia = async () => {
    if (localStream.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream.current;
      setStreamReady(true);
      return localStream.current;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStream.current = stream;
      setStreamReady(true);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera/microphone. Please check permissions.');
      return null;
    }
  };

  const toggleCamera = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  const createPeerConnection = (partnerId) => {
    if (!localStream.current) {
      console.error('localStream not available');
      return null;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    localStream.current.getTracks().forEach(track => {
      pc.addTrack(track, localStream.current);
    });

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit('webrtc_signal', {
          targetUserId: partnerId,
          signal: event.candidate,
          type: 'candidate'
        });
      }
    };

    peerConnection.current = pc;
    return pc;
  };

  const handleOffer = async (partnerId) => {
    const pc = createPeerConnection(partnerId);
    if (!pc) return;

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket?.emit('webrtc_signal', {
      targetUserId: partnerId,
      signal: offer,
      type: 'offer'
    });
  };

  const handleAnswer = async (signal, partnerId) => {
    if (!peerConnection.current) return;

    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));

    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket?.emit('webrtc_signal', {
      targetUserId: partnerId,
      signal: answer,
      type: 'answer'
    });
  };

  const handleCandidate = async (signal) => {
    if (!peerConnection.current) return;

    if (peerConnection.current.remoteDescription) {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(signal));
    } else {
      pendingCandidates.current.push(signal);
    }
  };

  const flushPendingCandidates = async () => {
    if (!peerConnection.current || !peerConnection.current.remoteDescription) return;

    for (const candidate of pendingCandidates.current) {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    }
    pendingCandidates.current = [];
  };

  useEffect(() => {
    if (!socket) {
      connect();
    }
  }, [socket, connect]);

  useEffect(() => {
    if (!socket) return;

    socket.on('waiting_for_partner', () => {
      setStatus('searching');
    });

    socket.on('random_partner_found', async (data) => {
      setSessionId(data.sessionId);
      setPartner(data.partner);
      setStatus('connected');
      setError(null);
      isInitiator.current = true;

      setTimeout(() => {
        handleOffer(data.partner._id);
      }, 500);
    });

    socket.on('partner_left', () => {
      handleEndSession();
    });

    socket.on('webrtc_signal', async (data) => {
      try {
        if (!peerConnection.current) {
          createPeerConnection(data.from._id);
        }

        if (data.type === 'offer') {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.signal));
          await flushPendingCandidates();

          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);

          socket?.emit('webrtc_signal', {
            targetUserId: data.from._id,
            signal: answer,
            type: 'answer'
          });
        } else if (data.type === 'answer') {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.signal));
          await flushPendingCandidates();
        } else if (data.type === 'candidate') {
          if (peerConnection.current.remoteDescription) {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.signal));
          } else {
            pendingCandidates.current.push(data.signal);
          }
        }
      } catch (err) {
        console.error('Error handling WebRTC signal:', err);
      }
    });

    socket.on('video_error', (data) => {
      setError(data.message);
    });

    socket.on('session_ended', () => {
      handleEndSession();
    });

    return () => {
      socket.off('waiting_for_partner');
      socket.off('random_partner_found');
      socket.off('partner_left');
      socket.off('webrtc_signal');
      socket.off('video_error');
      socket.off('session_ended');
    };
  }, [socket]);

  const startSearching = async () => {
    setError(null);
    const stream = await initializeMedia();
    if (!stream) return;
    socket?.emit('find_random_partner');
    setStatus('searching');
  };

  const cancelSearch = () => {
    socket?.emit('cancel_find_partner');
    cleanup();
    setStatus('idle');
    setPartner(null);
    setSessionId(null);
    initializeMedia();
  };

  const nextPartner = () => {
    cleanup();
    if (sessionId) {
      socket?.emit('next_random', { sessionId });
    } else {
      startSearching();
    }
    setStatus('searching');
    setPartner(null);
    setSessionId(null);
    isInitiator.current = false;
  };

  const handleEndSession = () => {
    if (sessionId && partner?._id) {
      socket?.emit('end_random_session', { sessionId, partnerId: partner._id });
    }
    cleanup();
    setStatus('idle');
    setPartner(null);
    setSessionId(null);
    initializeMedia();
  };

  const cleanup = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    pendingCandidates.current = [];
    isInitiator.current = false;
    setStreamReady(false);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const BG_PAGE = 'linear-gradient(180deg, #fff7f8 0%, #fff1f4 45%, #fff7f0 100%)';
  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid #fde2e7',
    borderRadius: 28,
    boxShadow: '0 24px 60px rgba(240, 82, 112, 0.18)'
  };
  const chips = [
    { label: 'Âm nhạc', icon: '🎵' },
    { label: 'Nghệ thuật', icon: '🎨' },
    { label: 'Ẩm thực', icon: '🍽️' },
    { label: 'Du lịch', icon: '🧭' },
  ];
  const showLanding = status === 'idle' || status === 'searching';

  return (
    <div className="min-h-screen" style={{ background: BG_PAGE }}>
      <Navbar />

      <main className="pt-10 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {showLanding && (
            <div className="text-center">
              <div className="flex items-center justify-center">
                <div style={{
                  width: 220,
                  height: 220,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #ffe6ec 45%, #f6b0c2 100%)',
                  boxShadow: '0 20px 50px rgba(240, 82, 112, 0.35)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 40% 30%, #2c2c2c 0%, #1f1f1f 70%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: 50,
                      height: 50,
                      borderRadius: 12,
                      background: 'rgba(255, 105, 130, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg width="26" height="26" fill="none" stroke="#ff5a7a" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: 18,
                    right: 16,
                    background: '#ff5a7a',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: 999
                  }}>
                    AI LIVE
                  </div>
                </div>
              </div>

              <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 22, color: '#2b1b1f' }}>
                Đang tìm kiếm người bạn tâm giao...
              </h1>
              <p style={{ color: '#8b6a72', fontSize: 13, marginTop: 8 }}>
                AI đang phân tích sở thích của bạn để kết nối với những tâm hồn đồng điệu nhất.
              </p>

              <div style={{ ...cardStyle, padding: 18, margin: '26px auto 0', maxWidth: 640 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#d14b66', letterSpacing: 1 }}>
                  BỘ LỌC AI THÔNG MINH
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 }}>
                  {chips.map((chip) => (
                    <div key={chip.label} style={{
                      padding: '10px 16px',
                      borderRadius: 999,
                      background: '#fff',
                      border: '1px solid #fde2e7',
                      boxShadow: '0 6px 18px rgba(240, 82, 112, 0.12)',
                      fontSize: 12,
                      color: '#6d4b53',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span style={{ fontSize: 14 }}>{chip.icon}</span>
                      {chip.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                {status === 'idle' ? (
                  <button
                    onClick={startSearching}
                    style={{
                      background: 'linear-gradient(135deg, #ff5a7a 0%, #cf1f4a 100%)',
                      color: '#fff',
                      borderRadius: 999,
                      padding: '14px 34px',
                      fontSize: 14,
                      fontWeight: 700,
                      border: 'none',
                      boxShadow: '0 14px 30px rgba(207, 31, 74, 0.35)',
                      cursor: 'pointer'
                    }}
                  >
                    Bắt đầu ngay →
                  </button>
                ) : (
                  <button
                    onClick={cancelSearch}
                    style={{
                      background: '#ffffff',
                      color: '#d14b66',
                      borderRadius: 999,
                      padding: '12px 28px',
                      fontSize: 13,
                      fontWeight: 700,
                      border: '1px solid #fde2e7',
                      boxShadow: '0 10px 22px rgba(240, 82, 112, 0.15)',
                      cursor: 'pointer'
                    }}
                  >
                    Hủy tìm kiếm
                  </button>
                )}
              </div>
            </div>
          )}

          {!showLanding && (
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-gray-900 rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
                <div className="absolute inset-0 bg-black">
                  {status === 'connected' && (
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )}

                  {streamReady && (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`absolute object-cover transition-all duration-300 ${
                        status === 'connected'
                          ? 'bottom-4 right-4 w-28 h-36 rounded-xl border-2 border-white/30'
                          : 'w-full h-full'
                      }`}
                    />
                  )}
                </div>

                {status === 'connected' && partner && (
                  <>
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {partner.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-white font-medium">{partner.username || partner.fullName}</p>
                    </div>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                      <button
                        onClick={nextPartner}
                        className="p-4 bg-gray-800/80 backdrop-blur-sm text-white rounded-full hover:bg-gray-700 transition-all"
                        title="Next (skip)"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={toggleCamera}
                        className={`p-4 rounded-full transition-all ${
                          cameraEnabled
                            ? 'bg-gray-800/80 backdrop-blur-sm text-white hover:bg-gray-700'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
                      >
                        {cameraEnabled ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={toggleMic}
                        className={`p-4 rounded-full transition-all ${
                          micEnabled
                            ? 'bg-gray-800/80 backdrop-blur-sm text-white hover:bg-gray-700'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
                      >
                        {micEnabled ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={handleEndSession}
                        className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                        title="Stop"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}

                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95">
                    <div className="w-20 h-20 mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="text-red-400 mb-6 text-center px-4">{error}</p>
                    <button
                      onClick={() => {
                        setError(null);
                        setStatus('idle');
                      }}
                      className="px-8 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RandomVideoChat;
