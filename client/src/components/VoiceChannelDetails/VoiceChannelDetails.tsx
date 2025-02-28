import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketProvider";
import SimplePeer from "simple-peer";
import { Box, Typography } from "@mui/material";

interface Peer {
  peer: SimplePeer.Instance;
  socketId: string;
}

export default function VoiceChannelDetails() {
  const { channelId } = useParams();
  const socket = useSocket();
  const [peers, setPeers] = useState<Peer[]>([]);
  const localStream = useRef<MediaStream | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    const getUserMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream.current = stream;

        socket.emit("join_voice_channel", { channelId });

        socket.on("user_joined_voice_channel", (socketId) => {
          if (socket.id) {
            const peer = createPeer(socketId, socket.id, localStream.current!);
            setPeers(prevPeers => [...prevPeers, { peer, socketId }]);
          }
        });

        socket.on("user_left_voice_channel", (socketId) => {
          setPeers(prevPeers => prevPeers.filter(peer => peer.socketId !== socketId));
        });

        socket.on("signal", ({ signalData, fromSocketId }) => {
          const peer = peers.find((p) => p.socketId === fromSocketId)?.peer;
          if (peer) {
            peer.signal(signalData);
          } else {
            const newPeer = addPeer(signalData, fromSocketId, stream);
            setPeers((prev) => [...prev, { peer: newPeer, socketId: fromSocketId }]);
          }
        });
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    };

    getUserMedia();

    return () => {
      socket.emit("leave_voice_channel", { channelId });
      peers.forEach(({ peer }) => peer.destroy());
      socket.off("user_joined");
      socket.off("signal");
      socket.off("user_left_voice_channel");
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [channelId, socket]);

  const createPeer = (socketId: string, initiatorSocketId: string, stream: MediaStream) => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: true,
      stream,
    });

    peer.on("signal", (signalData) => {
      socket.emit("signal", { channelId, signalData, toSocketId: socketId });
    });

    peer.on("stream", (remoteStream) => {
      if (!audioRefs.current[socketId]) {
        audioRefs.current[socketId] = new Audio();
        audioRefs.current[socketId].srcObject = remoteStream;
        audioRefs.current[socketId].play().catch(err => console.error("Autoplay error:", err));
      }
    });

    return peer;
  };

  const addPeer = (signalData: SimplePeer.SignalData, socketId: string, stream: MediaStream) => {
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("signal", { channelId, signalData: signal, toSocketId: socketId });
    });

    peer.on("stream", (remoteStream) => {
      if (!audioRefs.current[socketId]) {
        audioRefs.current[socketId] = new Audio();
        audioRefs.current[socketId].srcObject = remoteStream;
        audioRefs.current[socketId].play();
      }
    });

    peer.signal(signalData);

    return peer;
  };

  return (
    <Box>
      <Typography variant="h6">Voice Channel</Typography>
      {peers.map((peer) => (
        <Typography key={peer.socketId}>User: {peer.socketId}</Typography>
      ))}
      {peers.length === 0 && (
        <Typography>No one is in the voice chat yet</Typography>
      )}
    </Box>
  );
}