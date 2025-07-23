import { useParams } from "react-router-dom";
import { UserInfo, WebRTCService } from "../../services/webrtcv2.service";
import { useSocket } from "../../context/SocketProvider";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Peer from 'simple-peer';

export default function VoiceChannelDetailsV2() {
    const currentUser = useSelector((state: any) => state.user.user);
    const { channelId } = useParams<{ channelId: string }>();
    const socket = useSocket();
    const webrtcService = WebRTCService.getInstance(socket);
    
    function createPeer(userId: any, caller: any, stream: any) {
        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream,
        });
    
        peer.on('signal', (signal) => {
          socket.emit('BE-call-user', {
            userToCall: userId,
            from: caller,
            signal,
          });
        });
        peer.on('disconnect', () => {
          peer.destroy();
        });
    
        return peer;
      }
    
    useEffect(() => {
        if (channelId) {
            webrtcService.joinVoiceChannel(channelId, true, true);
        }
        return () => {

        };
    }, [channelId]);

    useEffect(() => {
        socket.on('receive_list_voice_user', (users: UserInfo[]) => {
            console.log('[WEBRTC]: USERS JOINED: ', users);
            const peers = [];
            users.forEach(user => {
                let { userName, video, audio } = user.info;
                if (userName !== currentUser.username) {
                    const stream = null;
                    const peer = createPeer(user.socketId, socket.id, stream);
      
                    // peer.userName = userName;
                    // peer.peerID = userId;
      
                    // peersRef.current.push({
                    //   peerID: userId,
                    //   peer,
                    //   userName,
                    // });
                    // peers.push(peer);
      
                    // setUserVideoAudio((preList) => {
                    //   return {
                    //     ...preList,
                    //     [peer.userName]: { video, audio },
                    //   };
                    // });
                  }
                });
            });
        });
        
    return (
        <div>
            <h1>Voice Channel Details for {channelId}</h1>
        </div>
    );
}