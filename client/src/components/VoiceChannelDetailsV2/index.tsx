import { useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  Device,
} from "mediasoup-client";
import { Consumer } from "mediasoup-client/lib/Consumer";
import { Producer } from "mediasoup-client/lib/Producer";
import { DtlsParameters, Transport } from "mediasoup-client/lib/Transport";
import { RtpCapabilities, RtpParameters } from "mediasoup-client/lib/RtpParameters";

interface ConsumeParams {
  error?: string;
  id?: string;
  producerId?: string;
  kind?: string;
  rtpParameters?: RtpParameters;
}

interface TransportParams {
  id: string;
  iceParameters: any;
  iceCandidates: any;
  dtlsParameters: DtlsParameters;
}

interface NewProducerData {
  producerId: string;
  producerSocketId: string;
  kind: string;
  appData: { mediaType: string };
}

interface PeerInfo {
  socketId: string;
  username: string;
}

interface ResolutionOption {
  label: string;
  width: number;
  height: number;
}

export default function VoiceChannelDetailsV2() {
  const { channelId } = useParams<{ channelId: string }>();
  const socket = useRef<Socket | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [sendTransport, setSendTransport] = useState<Transport | null>(null);
  const [recvTransport, setRecvTransport] = useState<Transport | null>(null);
  const [audioProducer, setAudioProducer] = useState<Producer | null>(null);
  const [videoProducer, setVideoProducer] = useState<Producer | null>(null);
  const [screenVideoProducer, setScreenVideoProducer] = useState<Producer | null>(null);
  const [screenAudioProducer, setScreenAudioProducer] = useState<Producer | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [localScreenVideoStream, setLocalScreenVideoStream] = useState<MediaStream | null>(null);
  const [localScreenAudioStream, setLocalScreenAudioStream] = useState<MediaStream | null>(null);
  const [remoteAudios, setRemoteAudios] = useState<Record<string, MediaStream>>({});
  const [remoteVideos, setRemoteVideos] = useState<Record<string, MediaStream>>({});
  const [remoteScreenAudios, setRemoteScreenAudios] = useState<Record<string, MediaStream>>({});
  const [remoteScreenVideos, setRemoteScreenVideos] = useState<Record<string, MediaStream>>({});
  const [producerToSocket, setProducerToSocket] = useState<Record<string, string>>({});
  const consumers = useRef<Map<string, Consumer>>(new Map());
  const [peers, setPeers] = useState<Record<string, string>>({});
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [muted, setMuted] = useState(false);
  const [pendingProducers, setPendingProducers] = useState<NewProducerData[]>([]);
  const resolutions: ResolutionOption[] = [
    { label: '720p', width: 1280, height: 720 },
    { label: '1080p', width: 1920, height: 1080 },
    { label: '4K', width: 3840, height: 2160 }, // Assuming 2140p is a typo for 2160p (4K)
  ];
  const framerates = [15, 30, 60, 120];
  const [selectedResolution, setSelectedResolution] = useState<ResolutionOption>(resolutions[0]);
  const [selectedFramerate, setSelectedFramerate] = useState<number>(30);
  const [pinnedCam, setPinnedCam] = useState<string | null>(null);
  const [pinnedScreen, setPinnedScreen] = useState<string | null>(null);

  useEffect(() => {
    socket.current = io(process.env.REACT_APP_CHAT_SERVER_HOST || "http://localhost:8080", {
      path: "/rtc",
      auth: {
        token: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      transports: ["websocket"],
      rejectUnauthorized: false,
    });

    socket.current.on("connect", () => {
      if (channelId) {
        socket.current?.emit("joinChannel", { channelId });
      }
    });

    socket.current.on("routerRtpCapabilities", async (rtpCapabilities: RtpCapabilities) => {
      const dev = new Device();
      await dev.load({ routerRtpCapabilities: rtpCapabilities });
      setDevice(dev);
    });

    socket.current.on("peerList", (list: PeerInfo[]) => {
      const map: Record<string, string> = {};
      list.forEach((p) => {
        map[p.socketId] = p.username;
      });
      setPeers(map);
    });

    socket.current.on("newMicProducer", (data: NewProducerData) => {
      const { producerId, producerSocketId, kind, appData } = data;
      if (producerSocketId === socket.current?.id) {
        return;
      }
      setProducerToSocket((prev) => ({
        ...prev,
        [producerId]: producerSocketId,
      }));
      if (!recvTransport || !device) {
        setPendingProducers((prev) => [...prev, data]);
        return;
      }
      consumeProducer(data);
    });

    socket.current.on("newCamProducer", (data: NewProducerData) => {
      const { producerId, producerSocketId, kind, appData } = data;
      if (producerSocketId === socket.current?.id) {
        return;
      }
      setProducerToSocket((prev) => ({
        ...prev,
        [producerId]: producerSocketId,
      }));
      if (!recvTransport || !device) {
        setPendingProducers((prev) => [...prev, data]);
        return;
      }
      consumeProducer(data);
    });

    socket.current.on("newScreenVideoProducer", (data: NewProducerData) => {
      const { producerId, producerSocketId, kind, appData } = data;
      if (producerSocketId === socket.current?.id) {
        return;
      }
      setProducerToSocket((prev) => ({
        ...prev,
        [producerId]: producerSocketId,
      }));
      if (!recvTransport || !device) {
        setPendingProducers((prev) => [...prev, data]);
        return;
      }
      consumeProducer(data);
    });

    socket.current.on("newScreenAudioProducer", (data: NewProducerData) => {
      const { producerId, producerSocketId, kind, appData } = data;
      if (producerSocketId === socket.current?.id) {
        return;
      }
      setProducerToSocket((prev) => ({
        ...prev,
        [producerId]: producerSocketId,
      }));
      if (!recvTransport || !device) {
        setPendingProducers((prev) => [...prev, data]);
        return;
      }
      consumeProducer(data);
    });

    socket.current.on("micProducerClosed", (producerId: string) => {
      const consumer = consumers.current.get(producerId);
      if (consumer) {
        consumer.close();
        consumers.current.delete(producerId);
      }
      const sockId = producerToSocket[producerId];
      if (sockId) {
        setRemoteAudios((prev) => {
          const newAudios = { ...prev };
          delete newAudios[sockId];
          return newAudios;
        });
      }
      setProducerToSocket((prev) => {
        const newMap = { ...prev };
        delete newMap[producerId];
        return newMap;
      });
    });

    socket.current.on("camProducerClosed", (producerId: string) => {
      const consumer = consumers.current.get(producerId);
      if (consumer) {
        consumer.close();
        consumers.current.delete(producerId);
      }
      const sockId = producerToSocket[producerId];
      if (sockId) {
        setRemoteVideos((prev) => {
          const newVideos = { ...prev };
          delete newVideos[sockId];
          return newVideos;
        });
      }
      setProducerToSocket((prev) => {
        const newMap = { ...prev };
        delete newMap[producerId];
        return newMap;
      });
    });

    socket.current.on("screenVideoProducerClosed", (producerId: string) => {
      const consumer = consumers.current.get(producerId);
      if (consumer) {
        consumer.close();
        consumers.current.delete(producerId);
      }
      const sockId = producerToSocket[producerId];
      if (sockId) {
        setRemoteScreenVideos((prev) => {
          const newVideos = { ...prev };
          delete newVideos[sockId];
          return newVideos;
        });
      }
      setProducerToSocket((prev) => {
        const newMap = { ...prev };
        delete newMap[producerId];
        return newMap;
      });
    });

    socket.current.on("screenAudioProducerClosed", (producerId: string) => {
      const consumer = consumers.current.get(producerId);
      if (consumer) {
        consumer.close();
        consumers.current.delete(producerId);
      }
      const sockId = producerToSocket[producerId];
      if (sockId) {
        setRemoteScreenAudios((prev) => {
          const newAudios = { ...prev };
          delete newAudios[sockId];
          return newAudios;
        });
      }
      setProducerToSocket((prev) => {
        const newMap = { ...prev };
        delete newMap[producerId];
        return newMap;
      });
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [channelId]);

  useEffect(() => {
    if (!device || !socket.current || !channelId) return;

    // Create send transport
    socket.current.emit("createWebRtcTransport", { channelId }, (params: TransportParams) => {
      const trans = device.createSendTransport(params);
      trans.on("connect", ({ dtlsParameters }, cb) => {
        socket.current?.emit(
          "connectTransport",
          { transportId: trans.id, dtlsParameters, channelId },
          (response: { success?: boolean; error?: string }) => {
            if (response.error) {
              console.error(response.error);
              return;
            }
            cb();
          }
        );
      });
      trans.on("produce", ({ kind, rtpParameters, appData }, cb) => {
        socket.current?.emit(
          "produce",
          { transportId: trans.id, kind, rtpParameters, appData, channelId },
          (response: { id?: string; error?: string }) => {
            if (response.error) {
              console.error(response.error);
              return;
            }
            if (response.id) {
              cb({ id: response.id });
            }
          }
        );
      });
      setSendTransport(trans);
    });

    // Create recv transport
    socket.current.emit("createWebRtcTransport", { channelId }, (params: TransportParams) => {
      const trans = device.createRecvTransport(params);
      trans.on("connect", ({ dtlsParameters }, cb) => {
        socket.current?.emit(
          "connectTransport",
          { transportId: trans.id, dtlsParameters, channelId },
          (response: { success?: boolean; error?: string }) => {
            if (response.error) {
              console.error(response.error);
              return;
            }
            cb();
          }
        );
      });
      setRecvTransport(trans);
    });
  }, [device, channelId]);

  useEffect(() => {
    if (recvTransport && device && pendingProducers.length > 0) {
      pendingProducers.forEach((data) => {
        consumeProducer(data);
      });
      setPendingProducers([]);
    }
  }, [recvTransport, device, pendingProducers]);

  const consumeProducer = (data: NewProducerData) => {
    const { producerId, producerSocketId, kind, appData } = data;
    const mediaType = appData.mediaType;
    socket.current?.emit(
      "consume",
      {
        producerId,
        transportId: recvTransport!.id,
        rtpCapabilities: device!.rtpCapabilities,
        channelId,
      },
      async (params: ConsumeParams) => {
        if (params.error || !params.id || !params.producerId || !params.kind || !params.rtpParameters) {
          console.error(params.error || "Invalid consume params");
          return;
        }
        if (params.kind !== 'audio' && params.kind !== 'video') {
          throw new Error('Invalid kind parameter');
        }
        const consumer = await recvTransport!.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters,
        });
        socket.current?.emit("resumeConsumer", { consumerId: consumer.id, channelId });
        const stream = new MediaStream([consumer.track]);
        if (mediaType === "mic" && kind === "audio") {
          setRemoteAudios((prev) => ({ ...prev, [producerSocketId]: stream }));
        } else if (mediaType === "cam" && kind === "video") {
          setRemoteVideos((prev) => ({ ...prev, [producerSocketId]: stream }));
        } else if (mediaType === "screen_audio" && kind === "audio") {
          setRemoteScreenAudios((prev) => ({ ...prev, [producerSocketId]: stream }));
        } else if (mediaType === "screen_video" && kind === "video") {
          setRemoteScreenVideos((prev) => ({ ...prev, [producerSocketId]: stream }));
        }
        consumers.current.set(producerId, consumer);
      }
    );
  };

  useEffect(() => {
    if (!sendTransport) return;

    const startAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
        const track = stream.getAudioTracks()[0];
        const prod = await sendTransport.produce({ track, appData: { mediaType: "mic" } });
        setAudioProducer(prod);
      } catch (error) {
        console.error("Error producing audio:", error);
      }
    };

    startAudio();

    return () => {
      if (audioProducer) {
        audioProducer.close();
        if (socket.current && channelId && audioProducer.id) {
          socket.current.emit("closeProducer", { producerId: audioProducer.id, channelId });
        }
      }
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
      if (videoProducer) {
        videoProducer.close();
        if (socket.current && channelId && videoProducer.id) {
          socket.current.emit("closeProducer", { producerId: videoProducer.id, channelId });
        }
      }
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
      if (screenVideoProducer) {
        screenVideoProducer.close();
        if (socket.current && channelId && screenVideoProducer.id) {
          socket.current.emit("closeProducer", { producerId: screenVideoProducer.id, channelId });
        }
      }
      if (screenAudioProducer) {
        screenAudioProducer.close();
        if (socket.current && channelId && screenAudioProducer.id) {
          socket.current.emit("closeProducer", { producerId: screenAudioProducer.id, channelId });
        }
      }
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
      if (sendTransport) {
        sendTransport.close();
      }
      if (recvTransport) {
        recvTransport.close();
      }
      consumers.current.forEach((cons) => cons.close());
      consumers.current.clear();
    };
  }, [sendTransport, channelId]);

  useEffect(() => {
    const enableVideo = async () => {
      if (videoEnabled && !videoStream && sendTransport) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setVideoStream(stream);
          const track = stream.getVideoTracks()[0];
          const prod = await sendTransport.produce({ track, appData: { mediaType: "cam" } });
          setVideoProducer(prod);
        } catch (error) {
          console.error("Error enabling video:", error);
          setVideoEnabled(false);
        }
      } else if (!videoEnabled && videoStream) {
        if (videoProducer) {
          videoProducer.close();
          if (socket.current && channelId && videoProducer.id) {
            socket.current.emit("closeProducer", { producerId: videoProducer.id, channelId });
          }
        }
        videoStream.getTracks().forEach((track) => track.stop());
        setVideoStream(null);
        setVideoProducer(null);
      }
    };
    enableVideo();
  }, [videoEnabled, sendTransport, channelId]);

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    if (audioStream) {
      audioStream.getAudioTracks()[0].enabled = !newMuted;
    }
  };

  const handleScreenShare = async () => {
    if (screenStream) {
      stopScreenShare();
      return;
    }
    const constraints: MediaStreamConstraints = {
      video: {
        width: { max: selectedResolution.width },
        height: { max: selectedResolution.height },
        frameRate: { max: selectedFramerate },
      } as MediaTrackConstraints,
      audio: true,
    };
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      setScreenStream(stream);
      const videoTrack = stream.getVideoTracks()[0];
      const audioTracks = stream.getAudioTracks();
      const audioTrack = audioTracks.length > 0 ? audioTracks[0] : null;
      const screenVideoProd = await sendTransport!.produce({
        track: videoTrack,
        appData: { mediaType: "screen_video" },
      });
      setScreenVideoProducer(screenVideoProd);
      if (audioTrack) {
        const screenAudioProd = await sendTransport!.produce({
          track: audioTrack,
          appData: { mediaType: "screen_audio" },
        });
        setScreenAudioProducer(screenAudioProd);
        setLocalScreenAudioStream(new MediaStream([audioTrack]));
      }
      setLocalScreenVideoStream(new MediaStream([videoTrack]));
      stream.getTracks().forEach((track) => {
        track.onended = stopScreenShare;
      });
    } catch (error) {
      console.error("Error starting screen share:", error);
    }
  };

  const stopScreenShare = () => {
    if (screenVideoProducer) {
      screenVideoProducer.close();
      if (socket.current && channelId && screenVideoProducer.id) {
        socket.current.emit("closeProducer", { producerId: screenVideoProducer.id, channelId });
      }
      setScreenVideoProducer(null);
    }
    if (screenAudioProducer) {
      screenAudioProducer.close();
      if (socket.current && channelId && screenAudioProducer.id) {
        socket.current.emit("closeProducer", { producerId: screenAudioProducer.id, channelId });
      }
      setScreenAudioProducer(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }
    setScreenStream(null);
    setLocalScreenVideoStream(null);
    setLocalScreenAudioStream(null);
  };

  const localId = socket.current?.id || '';

  const activeCamIds = useMemo(() => {
    const ids: string[] = [];
    if (videoStream) {
      ids.push(localId);
    }
    Object.keys(remoteVideos).forEach((sid) => {
      ids.push(sid);
    });
    return ids;
  }, [videoStream, remoteVideos, localId]);

  const audioOnlyIds = useMemo(() => {
    const videoSet = new Set(activeCamIds);
    const ids: string[] = [];
    if (audioStream && !videoStream) {
      ids.push(localId);
    }
    Object.keys(remoteAudios).forEach((sid) => {
      if (!videoSet.has(sid)) {
        ids.push(sid);
      }
    });
    return ids;
  }, [activeCamIds, audioStream, videoStream, remoteAudios, localId]);

  useEffect(() => {
    if (activeCamIds.length === 1 && pinnedCam === null) {
      setPinnedCam(activeCamIds[0]);
    } else if (pinnedCam !== null && !activeCamIds.includes(pinnedCam)) {
      setPinnedCam(null);
    }
  }, [activeCamIds, pinnedCam]);

  const activeScreenIds = useMemo(() => {
    const ids: string[] = [];
    if (localScreenVideoStream) {
      ids.push(localId);
    }
    Object.keys(remoteScreenVideos).forEach((sid) => {
      ids.push(sid);
    });
    return ids;
  }, [localScreenVideoStream, remoteScreenVideos, localId]);

  useEffect(() => {
    if (activeScreenIds.length === 1 && pinnedScreen === null) {
      setPinnedScreen(activeScreenIds[0]);
    } else if (pinnedScreen !== null && !activeScreenIds.includes(pinnedScreen)) {
      setPinnedScreen(null);
    }
  }, [activeScreenIds, pinnedScreen]);

  return (
    <div>
      <h1>Voice Channel Details for {channelId}</h1>
      <button onClick={toggleMute}>{muted ? "Unmute" : "Mute"}</button>
      <button onClick={() => setVideoEnabled((prev) => !prev)}>
        {videoEnabled ? "Disable Webcam" : "Enable Webcam"}
      </button>
      <div>
        <label>Resolution:</label>
        <select
          value={selectedResolution.label}
          onChange={(e) =>
            setSelectedResolution(
              resolutions.find((r) => r.label === e.target.value) || resolutions[0]
            )
          }
          disabled={!!screenStream}
        >
          {resolutions.map((res) => (
            <option key={res.label} value={res.label}>
              {res.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Framerate:</label>
        <select
          value={selectedFramerate}
          onChange={(e) => setSelectedFramerate(Number(e.target.value))}
          disabled={!!screenStream}
        >
          {framerates.map((fps) => (
            <option key={fps} value={fps}>
              {fps} fps
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleScreenShare}>
        {screenStream ? "Stop Screen Share" : "Start Screen Share"}
      </button>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {activeCamIds.map((sid) => {
          const isLocal = sid === localId;
          const camStream = isLocal ? videoStream : remoteVideos[sid];
          const audioStr = isLocal ? audioStream : remoteAudios[sid];
          const isLarge = pinnedCam === sid || (activeCamIds.length === 1 && pinnedCam === null);
          const videoStyle = {
            width: isLarge ? "800px" : "300px",
            height: isLarge ? "450px" : "169px",
            backgroundColor: "black",
          };
          return (
            <div
              key={sid}
              style={{ margin: "10px", textAlign: "center" }}
              onClick={() => setPinnedCam(sid)}
            >
              <h3>
                {peers[sid]} {isLocal ? "(You)" : ""}
              </h3>
              <video
                autoPlay
                playsInline
                muted={isLocal}
                ref={(el: HTMLVideoElement | null) => {
                  if (el) {
                    el.srcObject = camStream;
                  }
                }}
                style={videoStyle}
              />
              {audioStr && (
                <audio
                  autoPlay
                  muted={isLocal}
                  ref={(el: HTMLAudioElement | null) => {
                    if (el) el.srcObject = audioStr;
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <h2>Voice-Only Participants</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {audioOnlyIds.map((sid) => {
          const isLocal = sid === localId;
          const audioStr = isLocal ? audioStream : remoteAudios[sid];
          return (
            <div
              key={sid}
              style={{ margin: "10px", textAlign: "center" }}
            >
              <h3>
                {peers[sid]} {isLocal ? "(You)" : ""} (Voice Only)
              </h3>
              <div style={{ width: "300px", height: "169px", backgroundColor: "black", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white" }}>No Video</span>
              </div>
              {audioStr && (
                <audio
                  autoPlay
                  muted={isLocal}
                  ref={(el: HTMLAudioElement | null) => {
                    if (el) el.srcObject = audioStr;
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <h2>Shared Screens</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {activeScreenIds.map((sid) => {
          const isLocal = sid === localId;
          const videoStr = isLocal ? localScreenVideoStream : remoteScreenVideos[sid];
          const audioStr = isLocal ? localScreenAudioStream : remoteScreenAudios[sid];
          const isLarge = pinnedScreen === sid || (activeScreenIds.length === 1 && pinnedScreen === null);
          const videoStyle = {
            width: isLarge ? "800px" : "300px",
            height: isLarge ? "450px" : "169px",
            backgroundColor: "black",
          };
          return (
            <div
              key={sid}
              style={{ margin: "10px", textAlign: "center" }}
              onClick={() => setPinnedScreen(sid)}
            >
              <h3>{isLocal ? "Your Screen" : `${peers[sid]}'s Screen`}</h3>
              <video
                autoPlay
                playsInline
                muted={isLocal}
                ref={(el) => {
                  if (el) el.srcObject = videoStr;
                }}
                style={videoStyle}
              />
              {audioStr && (
                <audio
                  autoPlay
                  muted={isLocal}
                  ref={(el) => {
                    if (el) el.srcObject = audioStr;
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}