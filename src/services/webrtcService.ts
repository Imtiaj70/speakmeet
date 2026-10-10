/**
 * WebRTC Mesh Manager for SpeakMate Voice Chat
 * Handles RTCPeerConnection lifecycle, local/remote media tracks, ICE negotiation, and audio quality tuning.
 */

export interface WebRTCCallbacks {
  onIceCandidate: (targetUserId: string, candidate: RTCIceCandidateInit) => void;
  onRemoteStream: (targetUserId: string, stream: MediaStream) => void;
  onRemoteStreamRemoved: (targetUserId: string) => void;
  onConnectionStateChange: (targetUserId: string, state: RTCPeerConnectionState) => void;
  onScreenShareEnded?: () => void;
}

export function getIceServers(): RTCIceServer[] {
  const iceServers: RTCIceServer[] = [
    // 1. Google High-Availability Global STUN Servers
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ];

  // 2. STUN Server from environment
  const stunUrl =
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      typeof import.meta.env.VITE_STUN_SERVER === 'string' &&
      import.meta.env.VITE_STUN_SERVER.trim()) ||
    'stun:stun.relay.metered.ca:80';

  if (stunUrl) {
    iceServers.push({ urls: stunUrl });
  }

  // 3. TURN Server & Credentials Configuration
  const turnUrl =
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      typeof import.meta.env.VITE_TURN_SERVER === 'string' &&
      import.meta.env.VITE_TURN_SERVER.trim()) ||
    'turn:global.relay.metered.ca:80';

  const turnUsername =
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      typeof import.meta.env.VITE_TURN_USERNAME === 'string' &&
      import.meta.env.VITE_TURN_USERNAME.trim()) ||
    '35d80d95ebdb90ce04299524';

  const turnCredential =
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      typeof import.meta.env.VITE_TURN_CREDENTIAL === 'string' &&
      import.meta.env.VITE_TURN_CREDENTIAL.trim()) ||
    'cx06LOja30P3CtTg';

  if (turnUrl) {
    const urls: string[] = [turnUrl];

    if (turnUrl.includes('metered.ca')) {
      urls.push(
        'turn:global.relay.metered.ca:80?transport=tcp',
        'turn:global.relay.metered.ca:443',
        'turns:global.relay.metered.ca:443?transport=tcp'
      );
    }

    const turnConfig: RTCIceServer = {
      urls: Array.from(new Set(urls)),
    };

    if (turnUsername) {
      turnConfig.username = turnUsername;
    }
    if (turnCredential) {
      turnConfig.credential = turnCredential;
    }

    iceServers.push(turnConfig);
  }

  return iceServers;
}

/**
 * Optimize SDP for speech: tune Opus codec parameters to prevent clipping, improve bitrate and enable FEC
 */
function optimizeAudioSdp(sdp: string): string {
  // Find the Opus payload type number (typically 111)
  const opusMatch = sdp.match(/a=rtpmap:(\d+)\s+opus\/48000\/2/i);
  if (!opusMatch) return sdp;

  const payloadType = opusMatch[1];
  const fmtpRegex = new RegExp(`a=fmtp:${payloadType}\\s+(.*)`, 'i');
  const fmtpMatch = sdp.match(fmtpRegex);

  // High quality speech parameters: 64kbps, forward error correction, disable DTX clipping
  const desiredParams = 'minptime=10;useinbandfec=1;maxaveragebitrate=64000;stereo=0;sprop-stereo=0;cbr=1;dtx=0';

  if (fmtpMatch) {
    return sdp.replace(fmtpRegex, `a=fmtp:${payloadType} ${desiredParams}`);
  } else {
    // Insert new fmtp line directly after rtpmap
    return sdp.replace(
      new RegExp(`(a=rtpmap:${payloadType}\\s+opus\\/48000\\/2\r?\n)`, 'i'),
      `$1a=fmtp:${payloadType} ${desiredParams}\r\n`
    );
  }
}

export class WebRTCService {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private screenTrack: MediaStreamTrack | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();
  private pendingCandidates: Map<string, RTCIceCandidateInit[]> = new Map();
  private callbacks: WebRTCCallbacks;

  constructor(callbacks: WebRTCCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Request microphone access (audio only, no video).
   * Uses ideal audio constraints for crystal clear voice without robotic artifacts.
   */
  async requestMicrophone(): Promise<MediaStream> {
    if (this.localStream && this.localStream.active && this.localStream.getAudioTracks().length > 0) {
      return this.localStream;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'Your browser does not support WebRTC microphone capture. Please use a modern browser with HTTPS.'
      );
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: { ideal: true },
          channelCount: { ideal: 1 },
          sampleRate: { ideal: 48000 },
        },
        video: false,
      });

      this.localStream = stream;

      // Update any active peer connections with this local track
      this.attachLocalTracksToAllPeers();

      return stream;
    } catch (err: any) {
      console.warn('[WebRTCService] getUserMedia error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error(
          'Microphone permission was denied. Please allow microphone access in your browser settings to speak.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('No microphone hardware detected on your device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        throw new Error('Microphone is currently in use by another application.');
      } else {
        throw new Error('Could not access microphone: ' + (err.message || 'Unknown error'));
      }
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Mute or unmute the local microphone track
   */
  setMuted(muted: boolean): boolean {
    if (!this.localStream) return false;
    const tracks = this.localStream.getAudioTracks();
    tracks.forEach((track) => {
      track.enabled = !muted;
    });
    return true;
  }

  /**
   * Attach local stream tracks to all active peer connections
   */
  private attachLocalTracksToAllPeers() {
    if (!this.localStream) return;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (!audioTrack) return;

    for (const pc of this.peerConnections.values()) {
      if (pc.signalingState === 'closed') continue;
      const senders = pc.getSenders();
      const audioSender = senders.find((s) => s.track?.kind === 'audio' || (s as any).kind === 'audio');
      if (audioSender) {
        audioSender.replaceTrack(audioTrack).catch((e) => {
          console.warn('[WebRTCService] replaceTrack error:', e);
        });
      } else {
        try {
          pc.addTrack(audioTrack, this.localStream);
        } catch (addErr) {
          console.warn('[WebRTCService] addTrack error:', addErr);
        }
      }
    }
  }

  /**
   * Request screen capture (desktop/tab/window) and broadcast to peers
   */
  async startScreenShare(): Promise<MediaStream | null> {
    if (this.screenStream && this.screenStream.active) {
      return this.screenStream;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      throw new Error('Screen sharing is not supported by your current browser.');
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          frameRate: { ideal: 30, max: 60 },
        } as any,
        audio: false,
      });

      this.screenStream = stream;
      const videoTrack = stream.getVideoTracks()[0];
      this.screenTrack = videoTrack;

      // Broadcast screen video track to all active peer connections
      this.attachScreenTrackToAllPeers(videoTrack, stream);

      videoTrack.onended = () => {
        this.stopScreenShare();
        if (this.callbacks.onScreenShareEnded) {
          this.callbacks.onScreenShareEnded();
        }
      };

      return stream;
    } catch (err: any) {
      if (
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError' ||
        err.name === 'AbortError'
      ) {
        // User voluntarily dismissed or cancelled the screen picker dialog - return null gracefully
        return null;
      }
      console.warn('[WebRTC] getDisplayMedia error:', err);
      return null;
    }
  }

  /**
   * Stop screen sharing and restore audio-only mesh
   */
  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      this.screenStream = null;
    }
    if (this.screenTrack) {
      this.removeScreenTrackFromAllPeers(this.screenTrack);
      this.screenTrack = null;
    }
  }

  getScreenStream(): MediaStream | null {
    return this.screenStream;
  }

  isScreenSharingActive(): boolean {
    return !!(this.screenStream && this.screenStream.active && this.screenTrack && this.screenTrack.readyState === 'live');
  }

  private attachScreenTrackToAllPeers(videoTrack: MediaStreamTrack, stream: MediaStream) {
    for (const pc of this.peerConnections.values()) {
      if (pc.signalingState === 'closed') continue;
      const senders = pc.getSenders();
      const videoSender = senders.find((s) => s.track?.kind === 'video' || (s as any).kind === 'video');
      if (videoSender) {
        videoSender.replaceTrack(videoTrack).catch((e) => {
          console.warn('[WebRTCService] replaceTrack video error:', e);
        });
      } else {
        try {
          pc.addTrack(videoTrack, stream);
        } catch (addErr) {
          console.warn('[WebRTCService] addTrack video error:', addErr);
        }
      }
    }
  }

  private removeScreenTrackFromAllPeers(videoTrack: MediaStreamTrack) {
    for (const pc of this.peerConnections.values()) {
      if (pc.signalingState === 'closed') continue;
      const senders = pc.getSenders();
      const videoSender = senders.find((s) => s.track === videoTrack || s.track?.kind === 'video');
      if (videoSender) {
        try {
          pc.removeTrack(videoSender);
        } catch (e) {
          console.warn('[WebRTCService] removeTrack video error:', e);
        }
      }
    }
  }

  /**
   * Create or retrieve an RTCPeerConnection for a remote participant
   */
  createPeerConnection(targetUserId: string): RTCPeerConnection {
    const existing = this.peerConnections.get(targetUserId);
    if (existing && existing.connectionState !== 'closed') {
      return existing;
    }

    const config: RTCConfiguration = {
      iceServers: getIceServers(),
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    };

    const pc = new RTCPeerConnection(config);
    this.peerConnections.set(targetUserId, pc);

    // Add local microphone audio track to outgoing connection
    if (this.localStream && this.localStream.getAudioTracks().length > 0) {
      this.localStream.getAudioTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    } else {
      // Ensure audio transceiver is present to receive remote audio even if local mic is connecting
      try {
        pc.addTransceiver('audio', { direction: 'sendrecv' });
      } catch {}
    }

    // Attach active screen share track if currently sharing
    if (this.screenTrack && this.screenStream) {
      try {
        pc.addTrack(this.screenTrack, this.screenStream);
      } catch (err) {
        console.warn('[WebRTCService] error attaching screen track to new peer:', err);
      }
    }

    // ICE Candidate handler
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.callbacks.onIceCandidate(targetUserId, event.candidate.toJSON());
      }
    };

    // Remote Track handler: safely extracts audio track and updates stream
    pc.ontrack = (event) => {
      let stream = this.remoteStreams.get(targetUserId);
      if (!stream) {
        stream = (event.streams && event.streams[0]) ? event.streams[0] : new MediaStream();
        this.remoteStreams.set(targetUserId, stream);
      }

      if (event.track) {
        if (!stream.getTracks().includes(event.track)) {
          stream.addTrack(event.track);
        }
        event.track.enabled = true;
      }

      this.callbacks.onRemoteStream(targetUserId, stream);
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      this.callbacks.onConnectionStateChange(targetUserId, pc.connectionState);
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this.closePeerConnection(targetUserId);
      }
    };

    // ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') {
        console.warn(`[WebRTCService] ICE failed for peer ${targetUserId}, attempting restart...`);
        if (typeof pc.restartIce === 'function') {
          try {
            pc.restartIce();
          } catch {
            this.closePeerConnection(targetUserId);
          }
        }
      }
    };

    return pc;
  }

  /**
   * Create an SDP offer for a target peer (Initiator)
   */
  async createOffer(targetUserId: string): Promise<RTCSessionDescriptionInit> {
    const pc = this.createPeerConnection(targetUserId);
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false,
    });

    const optimizedSdp = optimizeAudioSdp(offer.sdp || '');
    const finalOffer = { type: offer.type, sdp: optimizedSdp };

    await pc.setLocalDescription(finalOffer);
    return pc.localDescription!;
  }

  /**
   * Handle an incoming SDP offer and return an SDP answer (Receiver)
   */
  async handleOffer(
    targetUserId: string,
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {
    const pc = this.createPeerConnection(targetUserId);

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    await this.flushPendingCandidates(targetUserId, pc);

    const answer = await pc.createAnswer();
    const optimizedSdp = optimizeAudioSdp(answer.sdp || '');
    const finalAnswer = { type: answer.type, sdp: optimizedSdp };

    await pc.setLocalDescription(finalAnswer);
    return pc.localDescription!;
  }

  /**
   * Handle incoming SDP answer from remote peer
   */
  async handleAnswer(
    targetUserId: string,
    answer: RTCSessionDescriptionInit
  ): Promise<void> {
    const pc = this.peerConnections.get(targetUserId);
    if (!pc) return;

    if (pc.signalingState === 'have-local-offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      await this.flushPendingCandidates(targetUserId, pc);
    }
  }

  /**
   * Add ICE Candidate received from remote peer
   */
  async handleIceCandidate(
    targetUserId: string,
    candidate: RTCIceCandidateInit
  ): Promise<void> {
    const pc = this.peerConnections.get(targetUserId);

    if (pc && pc.remoteDescription && pc.remoteDescription.type) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[WebRTCService] addIceCandidate error:', err);
      }
    } else {
      let queue = this.pendingCandidates.get(targetUserId);
      if (!queue) {
        queue = [];
        this.pendingCandidates.set(targetUserId, queue);
      }
      queue.push(candidate);
    }
  }

  private async flushPendingCandidates(
    targetUserId: string,
    pc: RTCPeerConnection
  ): Promise<void> {
    const queue = this.pendingCandidates.get(targetUserId);
    if (queue && queue.length) {
      for (const cand of queue) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (err) {
          console.warn('[WebRTCService] flushCandidate error:', err);
        }
      }
      this.pendingCandidates.delete(targetUserId);
    }
  }

  /**
   * Close peer connection for a specific user
   */
  closePeerConnection(targetUserId: string): void {
    const pc = this.peerConnections.get(targetUserId);
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.oniceconnectionstatechange = null;
      try {
        pc.close();
      } catch {}
      this.peerConnections.delete(targetUserId);
    }

    const stream = this.remoteStreams.get(targetUserId);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      this.remoteStreams.delete(targetUserId);
      this.callbacks.onRemoteStreamRemoved(targetUserId);
    }

    this.pendingCandidates.delete(targetUserId);
  }

  /**
   * Stop local microphone tracks
   */
  stopMicrophone(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      this.localStream = null;
    }
  }

  /**
   * Clean up all peer connections and local streams
   */
  cleanup(): void {
    this.stopScreenShare();
    for (const userId of Array.from(this.peerConnections.keys())) {
      this.closePeerConnection(userId);
    }
    this.stopMicrophone();
    this.peerConnections.clear();
    this.remoteStreams.clear();
    this.pendingCandidates.clear();
  }
}
