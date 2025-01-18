import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketProvider";
import { useSnackbar } from "notistack";
import { Channel } from "../../shared/guild.interface";
import { getChannelById } from "../../services/channel.service";
import SimplePeer from "simple-peer";

const VoiceChannelDetails = () => {
    // const [peers, setPeers] = React.useState([]);
    // const audioRefs = React.useRef<any>({});
    // const localStream = React.useRef(null);

    // const { guildId } = useParams();
    // const { channelId } = useParams();
    // const socket = useSocket();
    // const { enqueueSnackbar } = useSnackbar();
    // const navigate = useNavigate();
    // const [channel, setChannel] = React.useState<Channel>();

    // const fetchChannelDetails = async (guildId: string, channelId: string) => {
    //     try {
    //         const result = await getChannelById(guildId, channelId);
    //         if (result) {
    //             setChannel(result);
    //         }
    //         else throw Error("Channel data not found");
    //     } catch (error: any) {
    //         enqueueSnackbar(`${error.message}`, { variant: "error" });
    //         navigate("/chat");
    //     }
    // };

    // React.useEffect(() => {
    //     // Join the room
    //     socket.emit("user_join_voice_channel", { channelId });

    //     // Get user's audio stream
    //     navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
    //         localStream.current = stream;

    //         // Listen for other users joining
    //         socket.on("user-joined", (userId) => {
    //             const peer = createPeer(userId, socket.id, stream);
    //             setPeers((prev) => [...prev, { peer, socketId }]);
    //         });

    //         // Listen for incoming signals
    //         socket.on("signal", ({ signalData, fromSocketId }) => {
    //             const peer = peers.find((p) => p.socketId === fromSocketId)?.peer;
    //             if (peer) {
    //                 peer.signal(signalData);
    //             } else {
    //                 const newPeer = addPeer(signalData, fromSocketId, stream);
    //                 setPeers((prev) => [...prev, { peer: newPeer, socketId: fromSocketId }]);
    //             }
    //         });
    //     });

    //     return () => {
    //         socket.disconnect();
    //     };
    // }, [roomId, userId]);

    // const createPeer = (socketId: string, initiatorSocketId: string, stream: MediaStream) => {
    //     const peer = new SimplePeer({
    //         initiator: true,
    //         trickle: false,
    //         stream,
    //     });

    //     peer.on("signal", (signalData) => {
    //         socket.emit("signal", { channelId, signalData, toSocketId: socketId });
    //     });

    //     peer.on("stream", (remoteStream) => {
    //         if (!audioRefs.current[socketId]) {
    //             audioRefs.current[socketId] = new Audio();
    //             audioRefs.current[socketId].srcObject = remoteStream;
    //             audioRefs.current[socketId].play();
    //         }
    //     });

    //     return peer;
    // };
    return <div></div>;
}