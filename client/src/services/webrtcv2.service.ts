import { Socket } from "socket.io-client";

export type UserInfo = {
    socketId: string;
    info: any;
};

export class WebRTCService {
    private static instance: WebRTCService;
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

    }

    public joinVoiceChannel(
        channelId: string, 
        enableVideo: boolean,
        enableAudio: boolean,
    ) {
        this.socket.emit('request-join-voice-channel', { channelId, enableVideo, enableAudio });
    }
}