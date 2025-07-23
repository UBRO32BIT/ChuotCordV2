import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Grid,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  CallEnd as CallEndIcon,
} from '@mui/icons-material';
import { useSocket } from '../../context/SocketProvider';
import { WebRTCService } from '../../services/webrtc.service';
import { useParams } from 'react-router-dom';
import { store } from '../../store';

interface PeerStream {
  peerId: string;
  stream?: MediaStream;
}

const VoiceChat = () => {
  const theme = useTheme();
  const { channelId } = useParams<{ channelId: string }>();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [peerStreams, setPeerStreams] = useState<PeerStream[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerVideoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const socket = useSocket();
  const webrtcService = WebRTCService.getInstance(socket);

  useEffect(() => {
    if (channelId) {
      joinVoiceChannel();
    }
    return () => {
      if (channelId) {
        webrtcService.leaveVoiceChannel(channelId);
      }
    };
  }, [channelId]);

  const joinVoiceChannel = async () => {
    try {
      await webrtcService.joinVoiceChannel(channelId!);
      const localStream = webrtcService.getLocalStream();
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    } catch (error) {
      console.error('Failed to join voice channel:', error);
    }
  };

  const handleToggleAudio = async () => {
    await webrtcService.toggleAudio();
    setIsAudioEnabled(!isAudioEnabled);
  };

  const handleToggleVideo = async () => {
    await webrtcService.toggleVideo();
    setIsVideoEnabled(!isVideoEnabled);
  };

  const handleLeaveCall = () => {
    if (channelId) {
      webrtcService.leaveVoiceChannel(channelId);
    }
  };

  useEffect(() => {
    const updatePeerStreams = () => {
      const streams = webrtcService.getPeerStreams();
      setPeerStreams(streams);
    };

    // Update peer streams when they change
    const unsubscribe = store.subscribe(updatePeerStreams);
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Update peer video elements when streams change
    peerStreams.forEach(({ peerId, stream }) => {
      const videoElement = peerVideoRefs.current[peerId];
      if (videoElement && stream) {
        videoElement.srcObject = stream;
      }
    });
  }, [peerStreams]);

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.background.default,
    }}>
      <Grid container spacing={2} sx={{ flex: 1, p: 2 }}>
        {/* Local video */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            sx={{
              position: 'relative',
              paddingTop: '56.25%', // 16:9 aspect ratio
              backgroundColor: alpha(theme.palette.background.paper, 0.6),
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                color: 'white',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              You
            </Typography>
          </Paper>
        </Grid>

        {/* Peer videos */}
        {peerStreams.map(({ peerId, stream }) => (
          <Grid item xs={12} md={6} lg={4} key={peerId}>
            <Paper
              sx={{
                position: 'relative',
                paddingTop: '56.25%',
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <video
                ref={(el) => {
                  if (el) peerVideoRefs.current[peerId] = el;
                }}
                autoPlay
                playsInline
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <Typography
                variant="subtitle2"
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                User {peerId}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Controls */}
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
        }}
      >
        <IconButton
          onClick={handleToggleAudio}
          color={isAudioEnabled ? 'primary' : 'error'}
          sx={{ width: 48, height: 48 }}
        >
          {isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
        </IconButton>
        <IconButton
          onClick={handleToggleVideo}
          color={isVideoEnabled ? 'primary' : 'error'}
          sx={{ width: 48, height: 48 }}
        >
          {isVideoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
        </IconButton>
        <IconButton
          onClick={handleLeaveCall}
          color="error"
          sx={{ width: 48, height: 48 }}
        >
          <CallEndIcon />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default VoiceChat; 