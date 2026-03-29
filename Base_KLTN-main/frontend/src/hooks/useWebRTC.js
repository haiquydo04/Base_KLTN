import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebRTC = (socket) => {
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

  const initializeMedia = useCallback(async () => {
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
  }, []);

  const toggleCamera = useCallback(() => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    }
  }, []);

  const toggleMic = useCallback(() => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  }, []);

  const createPeerConnection = useCallback((partnerId) => {
    if (!localStream.current) return null;

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
  }, [socket]);

  const handleOffer = useCallback(async (partnerId) => {
    const pc = createPeerConnection(partnerId);
    if (!pc) return;

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket?.emit('webrtc_signal', {
      targetUserId: partnerId,
      signal: offer,
      type: 'offer'
    });
  }, [createPeerConnection, socket]);

  const handleAnswer = useCallback(async (signal, partnerId) => {
    if (!peerConnection.current) return;

    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));

    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket?.emit('webrtc_signal', {
      targetUserId: partnerId,
      signal: answer,
      type: 'answer'
    });
  }, [socket]);

  const flushPendingCandidates = useCallback(async () => {
    if (!peerConnection.current || !peerConnection.current.remoteDescription) return;

    for (const candidate of pendingCandidates.current) {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    }
    pendingCandidates.current = [];
  }, []);

  const cleanup = useCallback(() => {
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
  }, []);

  const startSearching = useCallback(async () => {
    setError(null);
    const stream = await initializeMedia();
    if (!stream) return;
    socket?.emit('find_random_partner');
    setStatus('searching');
  }, [initializeMedia, socket]);

  const cancelSearch = useCallback(() => {
    socket?.emit('cancel_find_partner');
    cleanup();
    setStatus('idle');
    setPartner(null);
    setSessionId(null);
    initializeMedia();
  }, [socket, cleanup, initializeMedia]);

  const nextPartner = useCallback(() => {
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
  }, [sessionId, socket, cleanup, startSearching]);

  const handleEndSession = useCallback(() => {
    if (sessionId && partner?._id) {
      socket?.emit('end_random_session', { sessionId, partnerId: partner._id });
    }
    cleanup();
    setStatus('idle');
    setPartner(null);
    setSessionId(null);
    initializeMedia();
  }, [sessionId, partner, socket, cleanup, initializeMedia]);

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
  }, [socket, handleOffer, createPeerConnection, flushPendingCandidates, handleEndSession]);

  useEffect(() => {
    initializeMedia();
    return () => cleanup();
  }, [initializeMedia, cleanup]);

  return {
    status,
    partner,
    sessionId,
    error,
    cameraEnabled,
    micEnabled,
    streamReady,
    localVideoRef,
    remoteVideoRef,
    toggleCamera,
    toggleMic,
    startSearching,
    cancelSearch,
    nextPartner,
    handleEndSession,
    cleanup
  };
};
