import { io, Socket } from 'socket.io-client';
import { store } from '../store';

interface PeerConnection {
    peerId: string;
    connection: RTCPeerConnection;
    stream?: MediaStream;
}

export class WebRTCService {
    private static instance: WebRTCService;
    private peerConnections: Map<string, PeerConnection> = new Map();
    private localStream?: MediaStream;
    private isVideoEnabled: boolean = false;
    private isAudioEnabled: boolean = true;
    private pendingUserJoins: string[] = [];
    private isLocalStreamReady: boolean = false;
    private streamInitializationFailed: boolean = false;
    private socket: Socket;

    private constructor(socket: Socket) {
        this.socket = socket;
        this.setupSocketListeners();
    }

    public static getInstance(socket: Socket): WebRTCService {
        if (!WebRTCService.instance) {
            WebRTCService.instance = new WebRTCService(socket);
        }
        return WebRTCService.instance;
    }

    private setupSocketListeners() {
        this.socket.on('connect', () => console.log('Socket.IO connected'));
        this.socket.on('connect_error', (error) => console.error('Socket.IO connect error:', error));

        this.socket.on('FE-user-join', (users: { userId: string, info: any }[] | { userId: string, info: any }) => {
            console.log('Received FE-user-join:', users);
            const usersArray = Array.isArray(users) ? users : [users];
            usersArray.forEach(({ userId }) => this.handleUserJoined({ userId }));
        });

        this.socket.on('FE-user-leave', ({ userId }) => {
            console.log('Received FE-user-leave:', userId);
            this.handleUserLeft({ userId });
        });

        this.socket.on('FE-receive-call', ({ signal, from, info }) => {
            console.log('Received FE-receive-call from:', from);
            this.handleOffer({ offer: signal, fromId: from });
        });

        this.socket.on('FE-call-accepted', ({ signal, answerId }) => {
            console.log('Received FE-call-accepted from:', answerId);
            this.handleAnswer({ answer: signal, fromId: answerId });
        });

        this.socket.on('ice-candidate', ({ candidate, fromId }) => {
            console.log('Received ICE candidate from:', fromId);
            this.handleIceCandidate({ candidate, fromId });
        });
    }

    public async joinVoiceChannel(channelId: string) {
        try {
            console.log('Joining voice channel:', channelId);
            this.socket.emit('join-voice-channel', { channelId });

            console.log('Starting local stream initialization');
            await this.initializeLocalStream();
            this.isLocalStreamReady = true;
            console.log('Local stream ready, processing pending joins');

            this.processPendingUserJoins();

            store.dispatch({ type: 'VOICE_CHANNEL_JOINED', payload: { channelId } });
        } catch (error: any) {
            console.error('Failed to join voice channel:', error);
            this.streamInitializationFailed = true;
            store.dispatch({
                type: 'VOICE_CHANNEL_JOIN_FAILED',
                payload: { channelId, error: error.message || 'Failed to initialize media stream' }
            });
            this.processPendingUserJoins();
            throw error;
        }
    }

    private processPendingUserJoins() {
        console.log('Processing pending user joins, queue length:', this.pendingUserJoins.length);
        while (this.pendingUserJoins.length > 0) {
            const userId = this.pendingUserJoins.shift();
            if (userId) {
                console.log('Processing queued user-joined:', userId);
                this.handleUserJoined({ userId });
            }
        }
    }

    public async leaveVoiceChannel(channelId: string) {
        this.socket.emit('leave-voice-channel', { channelId });
        this.cleanup();
    }

    private async initializeLocalStream() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: true,
            });
            console.log('Local stream initialized:', this.localStream);

            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) audioTrack.enabled = this.isAudioEnabled;

            this.peerConnections.forEach(({ connection }) => {
                this.localStream?.getTracks().forEach(track => {
                    console.log('Adding track to existing peer connection:', track);
                    connection.addTrack(track, this.localStream!);
                });
            });
        } catch (error: any) {
            console.error('Failed to get user media:', error.name, error.message);
            this.streamInitializationFailed = true;
            throw error;
        }
    }

    private async handleUserJoined({ userId }: { userId: string }) {
        if (userId === this.socket.id) {
            console.log('Ignoring self in user-joined:', userId);
            return;
        }

        if (!this.isLocalStreamReady && !this.streamInitializationFailed) {
            console.log('Queuing user-joined event for:', userId);
            this.pendingUserJoins.push(userId);
            return;
        }

        if (this.peerConnections.has(userId)) {
            console.log('Connection already exists for user:', userId);
            return;
        }

        console.log('Creating peer connection for:', userId);
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
            ],
        });
        this.setupPeerConnectionListeners(peerConnection, userId);
        this.peerConnections.set(userId, { peerId: userId, connection: peerConnection });

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                console.log('Adding track to peer:', userId, track);
                peerConnection.addTrack(track, this.localStream!);
            });
        } else {
            console.warn('No local stream available for peer:', userId, 'Proceeding as receive-only');
        }

        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            console.log('Sending BE-call-user to:', userId);
            this.socket.emit('BE-call-user', {
                userToCall: userId,
                from: this.socket.id,
                signal: offer
            });
        } catch (error) {
            console.error('Error creating offer for:', userId, error);
            peerConnection.close();
            this.peerConnections.delete(userId);
        }
        store.dispatch({ type: 'PEER_JOINED', payload: { peerId: userId } });
    }

    private handleUserLeft({ userId }: { userId: string }) {
        console.log('User left:', userId);
        const peerConnection = this.peerConnections.get(userId);
        if (peerConnection) {
            peerConnection.connection.close();
            this.peerConnections.delete(userId);
            store.dispatch({ type: 'PEER_LEFT', payload: { peerId: userId } });
        }
    }

    private async handleOffer({ offer, fromId }: { offer: RTCSessionDescriptionInit; fromId: string }) {
        console.log(`Handling offer from ${fromId}`);
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
            ],
        });
        this.setupPeerConnectionListeners(peerConnection, fromId);
        this.peerConnections.set(fromId, { peerId: fromId, connection: peerConnection });

        try {
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    console.log(`Adding track to peer ${fromId}:`, track);
                    peerConnection.addTrack(track, this.localStream!);
                });
            } else {
                console.warn('No local stream available for peer:', fromId);
            }

            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            console.log(`Sending BE-accept-call to ${fromId}`);
            this.socket.emit('BE-accept-call', {
                signal: answer,
                to: fromId
            });
        } catch (error) {
            console.error(`Error handling offer from ${fromId}:`, error);
            peerConnection.close();
            this.peerConnections.delete(fromId);
        }
    }

    private async handleAnswer({ answer, fromId }: { answer: RTCSessionDescriptionInit; fromId: string }) {
        const peerConnection = this.peerConnections.get(fromId);
        if (peerConnection) {
            await peerConnection.connection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    private async handleIceCandidate({ candidate, fromId }: { candidate: RTCIceCandidateInit; fromId: string }) {
        const peerConnection = this.peerConnections.get(fromId);
        if (peerConnection) {
            await peerConnection.connection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    }

    private setupPeerConnectionListeners(peerConnection: RTCPeerConnection, peerId: string) {
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('ice-candidate', {
                    targetId: peerId,
                    candidate: event.candidate,
                });
            }
        };

        peerConnection.ontrack = (event) => {
            const peerConnection = this.peerConnections.get(peerId);
            if (peerConnection) {
                event.streams[0].getAudioTracks().forEach(track => {
                    track.enabled = true;
                });
                peerConnection.stream = event.streams[0];
                store.dispatch({ type: 'UPDATE_PEER_STREAM', payload: { peerId, stream: event.streams[0] } });
            }
        };

        peerConnection.onconnectionstatechange = () => {
            console.log(`Connection state with peer ${peerId}:`, peerConnection.connectionState);
        };

        peerConnection.oniceconnectionstatechange = () => {
            console.log(`ICE connection state with peer ${peerId}:`, peerConnection.iceConnectionState);
        };
    }

    public async toggleVideo() {
        if (!this.localStream) return;

        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
            this.isVideoEnabled = !this.isVideoEnabled;
            videoTrack.enabled = this.isVideoEnabled;
        } else if (this.isVideoEnabled) {
            try {
                const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
                const newVideoTrack = newStream.getVideoTracks()[0];
                this.localStream.addTrack(newVideoTrack);
                this.peerConnections.forEach(({ connection }) => {
                    connection.addTrack(newVideoTrack, this.localStream!);
                });
            } catch (error) {
                console.error('Failed to enable video:', error);
                this.isVideoEnabled = false;
            }
        }
    }

    public async toggleAudio() {
        if (!this.localStream) return;

        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
            this.isAudioEnabled = !this.isAudioEnabled;
            audioTrack.enabled = this.isAudioEnabled;
            console.log('Audio track enabled:', this.isAudioEnabled);
        }
    }

    public getLocalStream() {
        return this.localStream;
    }

    public getPeerStreams() {
        return Array.from(this.peerConnections.values()).map(({ peerId, stream }) => ({
            peerId,
            stream,
        }));
    }

    private cleanup() {
        this.localStream?.getTracks().forEach(track => track.stop());
        this.peerConnections.forEach(({ connection }) => connection.close());
        this.peerConnections.clear();
        this.localStream = undefined;
    }
}
