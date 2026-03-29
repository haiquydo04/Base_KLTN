import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';

const RandomVideoChat = () => {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <main className="pt-20 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Random Video Chat</h1>
            <p className="text-gray-400">Meet new people via random video calls</p>
          </div>

          {/* Video Area */}
          <div className="relative bg-gray-800 rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
            {/* Video Container */}
            <div className="absolute inset-0 bg-black">
              {/* Remote Video (when connected) */}
              {status === 'connected' && (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}

              {/* Local Video Preview */}
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

            {/* Idle State */}
            {status === 'idle' && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="w-28 h-28 mb-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <button
                  onClick={startSearching}
                  className="px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Start Random Chat
                </button>
              </div>
            )}

            {/* Searching State */}
            {status === 'searching' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90">
                <div className="relative w-28 h-28 mb-6">
                  <div className="absolute inset-0 border-4 border-pink-500/30 rounded-full animate-ping"></div>
                  <div className="absolute inset-2 border-4 border-transparent border-t-pink-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-white text-xl font-semibold mb-2">Finding someone...</p>
                <p className="text-gray-400 mb-8">Please wait while we connect you</p>
                <button
                  onClick={cancelSearch}
                  className="px-8 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Connected State */}
            {status === 'connected' && partner && (
              <>
                {/* Partner Info */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {partner.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-white font-medium">{partner.username || partner.fullName}</p>
                </div>

                {/* Controls */}
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

            {/* Error State */}
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

          {/* Tips */}
          {status === 'idle' && (
            <div className="mt-6 bg-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Tips for a great chat:</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Be respectful and friendly</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Make sure you're in a well-lit area</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Use the "Next" button to find someone new</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RandomVideoChat;
