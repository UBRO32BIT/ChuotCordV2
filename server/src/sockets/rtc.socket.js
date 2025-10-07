const { Server } = require('socket.io');
const config = require('../config/config');
const jwt = require("jsonwebtoken");
const userService = require('../services/v1/user.service');
const mediasoup = require('mediasoup');
const os = require('os');

let io;
const mediasoupWorkers = [];
let nextWorker = 0;
const channels = new Map();

const mediaCodecs = [
    {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2
    },
    {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
            'x-google-start-bitrate': 1000
        }
    }
];

function getNewProducerEventName(mediaType) {
  switch (mediaType) {
    case 'mic':
      return 'newMicProducer';
    case 'cam':
      return 'newCamProducer';
    case 'screen_audio':
      return 'newScreenAudioProducer';
    case 'screen_video':
      return 'newScreenVideoProducer';
    default:
      throw new Error('Unknown mediaType');
  }
}

function getProducerClosedEventName(mediaType) {
  switch (mediaType) {
    case 'mic':
      return 'micProducerClosed';
    case 'cam':
      return 'camProducerClosed';
    case 'screen_audio':
      return 'screenAudioProducerClosed';
    case 'screen_video':
      return 'screenVideoProducerClosed';
    default:
      throw new Error('Unknown mediaType');
  }
}

async function initMediasoup() {
    const numWorkers = os.cpus().length;
    for (let i = 0; i < numWorkers; i++) {
        const worker = await mediasoup.createWorker({
            logLevel: 'warn',
            rtcMinPort: config.rtc.minPort || 40000,
            rtcMaxPort: config.rtc.maxPort || 49999,
        });
        worker.on('died', () => {
            console.error('[RTCSOCKET]: mediasoup worker died');
        });
        mediasoupWorkers.push(worker);
    }
    console.log(`[RTCSOCKET]: Created ${numWorkers} mediasoup workers`);
}

const createRTCSocket = async (httpServer) => {
    console.log("[RTCSOCKET]: Initializing mediasoup...");
    await initMediasoup();


    io = new Server(httpServer, {
        path: "/rtc",
        cors: {
            origin: config.CLIENT_HOST,
            methods: ["GET", "POST"],
        }
    });

    io.use((socket, next) => {
        try {
            const header = socket.handshake.auth.token;
            if (!header) {
                console.log(`[RTCSOCKET]: There is no auth header`)
                return next(new Error("no token"));
            }

            if (!header.startsWith("Bearer ")) {
                console.log(`[RTCSOCKET]: Invalid auth header`)
                return next(new Error("invalid token"));
            }

            const token = header.substring(7);

            jwt.verify(token, config.jwt.accessSecret, (err, decoded) => {
                if (err) {
                    console.log(`[RTCSOCKET]: Invalid access token: ${err.message}`)
                    socket.disconnect();
                    return;
                }

                socket.userId = decoded.sub;
                socket.username = decoded.username;
                next();
            });
        }
        catch (error) {
            next(new Error(error.message));
        }
    });

    io.on("connection", async (socket) => {
        console.log('[RTCSOCKET]: New client connected');

        socket.on('joinChannel', async ({ channelId }) => {
            console.log(`[RTCSOCKET]: Client ${socket.id} joining channel ${channelId}`);
            // create router per channel if not exist
            let room = channels.get(channelId);
            if (!room) {
                console.log(`[RTCSOCKET]: Creating new room for channel ${channelId}`);
                const worker = mediasoupWorkers[nextWorker];
                nextWorker = (nextWorker + 1) % mediasoupWorkers.length;
                const router = await worker.createRouter({ mediaCodecs });
                room = { router, producers: new Map(), consumers: new Map(), transports: new Map(), peers: new Map() };
                channels.set(channelId, room);
            }
            socket.join(channelId);
            socket.emit('routerRtpCapabilities', room.router.rtpCapabilities);

            // Add peer with username
            let peer = room.peers.get(socket.id) || { transports: [], producers: [], consumers: [], username: socket.username };
            room.peers.set(socket.id, peer);

            // Send existing producers to the new peer
            for (const [producerId, { producer, ownerId, appData }] of room.producers.entries()) {
                const eventName = getNewProducerEventName(appData.mediaType);
                socket.emit(eventName, { producerId, producerSocketId: ownerId, kind: producer.kind, appData });
            }

            // Emit updated peer list to the room
            const peerList = Array.from(room.peers.entries()).map(([sid, p]) => ({ socketId: sid, username: p.username }));
            io.to(channelId).emit('peerList', peerList);
            console.log(`[RTCSOCKET]: Emitted peerList to channel ${channelId}`);
        });

        socket.on('createWebRtcTransport', async ({ channelId }, callback) => {
            console.log(`[RTCSOCKET]: Client ${socket.id} creating WebRtcTransport in channel ${channelId}`);
            const room = channels.get(channelId);
            if (!room) {
                console.log(`[RTCSOCKET]: Room not found for channel ${channelId}`);
                return callback({ error: 'room not found' });
            }
            const transport = await createWebRtcTransport(room.router);
            room.transports.set(transport.id, transport);
            let peer = room.peers.get(socket.id) || { transports: [], producers: [], consumers: [], username: socket.username };
            peer.transports.push(transport.id);
            room.peers.set(socket.id, peer);
            callback({
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters
            });
            console.log(`[RTCSOCKET]: Created WebRtcTransport ${transport.id} for client ${socket.id}`);
        });

        socket.on('connectTransport', async ({ transportId, dtlsParameters, channelId }, callback) => {
            console.log(`[RTCSOCKET]: Client ${socket.id} connecting transport ${transportId} in channel ${channelId}`);
            const room = channels.get(channelId);
            const transport = room.transports.get(transportId);
            if (!transport) {
                console.log(`[RTCSOCKET]: Transport ${transportId} not found`);
                return callback({ error: 'transport not found' });
            }
            try {
                await transport.connect({ dtlsParameters });
                callback({ success: true });
                console.log(`[RTCSOCKET]: Transport ${transportId} connected`);
            } catch (error) {
                console.error(`[RTCSOCKET]: Error connecting transport ${transportId}: ${error.message}`);
                callback({ error: error.message });
            }
        });

        socket.on('produce', async ({ transportId, kind, rtpParameters, appData, channelId }, callback) => {
            console.log(`[RTCSOCKET]: Client ${socket.id} producing ${kind} on transport ${transportId} in channel ${channelId}`);
            const room = channels.get(channelId);
            const transport = room.transports.get(transportId);
            if (!transport) {
                console.log(`[RTCSOCKET]: Transport ${transportId} not found`);
                return callback({ error: 'transport not found' });
            }
            try {
                const producer = await transport.produce({ kind, rtpParameters, appData });
                room.producers.set(producer.id, { producer, ownerId: socket.id, appData });
                let peer = room.peers.get(socket.id);
                peer.producers.push(producer.id);
                const eventName = getNewProducerEventName(appData.mediaType);
                socket.to(channelId).emit(eventName, { producerId: producer.id, producerSocketId: socket.id, kind, appData });
                callback({ id: producer.id });
                console.log(`[RTCSOCKET]: Producer ${producer.id} created for ${kind}`);
            } catch (error) {
                console.error(`[RTCSOCKET]: Error producing ${kind}: ${error.message}`);
                callback({ error: error.message });
            }
        });

        socket.on('consume', async ({ producerId, transportId, rtpCapabilities, channelId }, callback) => {
            console.log(`[RTCSOCKET]: Client ${socket.id} consuming producer ${producerId} on transport ${transportId} in channel ${channelId}`);
            const room = channels.get(channelId);
            const prodData = room.producers.get(producerId);
            if (!prodData) {
                console.log(`[RTCSOCKET]: Producer ${producerId} not found`);
                return callback({ error: 'producer not found' });
            }
            const { producer } = prodData;
            if (!room.router.canConsume({ producerId: producer.id, rtpCapabilities })) {
                console.log(`[RTCSOCKET]: Cannot consume producer ${producerId}`);
                return callback({ error: 'cannot consume' });
            }
            const transport = room.transports.get(transportId);
            if (!transport) {
                console.log(`[RTCSOCKET]: Transport ${transportId} not found`);
                return callback({ error: 'transport not found' });
            }
            try {
                const consumer = await transport.consume({
                    producerId: producer.id,
                    rtpCapabilities,
                    paused: true,
                });
                room.consumers.set(consumer.id, consumer);
                let peer = room.peers.get(socket.id);
                if (!peer.consumers) peer.consumers = [];
                peer.consumers.push(consumer.id);

                consumer.on('producerclose', () => {
                    console.log(`[RTCSOCKET]: Producer closed for consumer ${consumer.id}`);
                    consumer.close();
                    socket.emit('consumerClosed', consumer.id);
                });

                callback({
                    id: consumer.id,
                    producerId: producer.id,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters,
                });
                console.log(`[RTCSOCKET]: Consumer ${consumer.id} created`);
            } catch (error) {
                console.error(`[RTCSOCKET]: Error consuming producer ${producerId}: ${error.message}`);
                callback({ error: error.message });
            }
        });

        socket.on('resumeConsumer', async ({ consumerId, channelId }) => {
            console.log(`[RTCSOCKET]: Resuming consumer ${consumerId} in channel ${channelId}`);
            const room = channels.get(channelId);
            const consumer = room.consumers.get(consumerId);
            if (consumer) {
                try {
                    await consumer.resume();
                    console.log(`[RTCSOCKET]: Consumer ${consumerId} resumed`);
                } catch (error) {
                    console.error(`[RTCSOCKET]: Error resuming consumer ${consumerId}: ${error.message}`);
                }
            } else {
                console.log(`[RTCSOCKET]: Consumer ${consumerId} not found`);
            }
        });

        socket.on('closeProducer', async ({ producerId, channelId }, callback) => {
            console.log(`[RTCSOCKET]: Closing producer ${producerId} in channel ${channelId}`);
            const room = channels.get(channelId);
            if (!room) {
                console.log(`[RTCSOCKET]: Room not found for channel ${channelId}`);
                return callback({ error: 'room not found' });
            }
            const prodData = room.producers.get(producerId);
            if (!prodData || prodData.ownerId !== socket.id) {
                console.log(`[RTCSOCKET]: Not owner or producer ${producerId} not found`);
                return callback({ error: 'not owner or not found' });
            }
            prodData.producer.close();
            room.producers.delete(producerId);
            const peer = room.peers.get(socket.id);
            if (peer) {
                peer.producers = peer.producers.filter(p => p !== producerId);
            }
            const closeEventName = getProducerClosedEventName(prodData.appData.mediaType);
            io.to(channelId).emit(closeEventName, producerId);

            console.log(`[RTCSOCKET]: Producer ${producerId} closed`);
            return callback({ success: true });
        });

        socket.on('disconnect', () => {
            console.log(`[RTCSOCKET]: Client ${socket.id} disconnected`);
            for (const [channelId, room] of channels.entries()) {
                const peer = room.peers.get(socket.id);
                if (peer) {
                    // Close producers
                    for (const prodId of peer.producers) {
                        const prodData = room.producers.get(prodId);
                        if (prodData) {
                            prodData.producer.close();
                            const closeEventName = getProducerClosedEventName(prodData.appData.mediaType);
                            io.to(channelId).emit(closeEventName, prodId);
                            room.producers.delete(prodId);
                            console.log(`[RTCSOCKET]: Producer ${prodId} closed on disconnect`);
                        }
                    }
                    // Close consumers
                    for (const consId of peer.consumers || []) {
                        const consumer = room.consumers.get(consId);
                        if (consumer) {
                            consumer.close();
                            room.consumers.delete(consId);
                            console.log(`[RTCSOCKET]: Consumer ${consId} closed on disconnect`);
                        }
                    }
                    // Close transports
                    for (const transId of peer.transports) {
                        const transport = room.transports.get(transId);
                        if (transport) {
                            transport.close();
                            room.transports.delete(transId);
                            console.log(`[RTCSOCKET]: Transport ${transId} closed on disconnect`);
                        }
                    }
                    room.peers.delete(socket.id);

                    // Emit updated peer list
                    const peerList = Array.from(room.peers.entries()).map(([sid, p]) => ({ socketId: sid, username: p.username }));
                    io.to(channelId).emit('peerList', peerList);
                    console.log(`[RTCSOCKET]: Emitted updated peerList to channel ${channelId} after disconnect`);

                    // Clean up room if empty
                    if (room.peers.size === 0) {
                        channels.delete(channelId);
                        console.log(`[RTCSOCKET]: Deleted empty room for channel ${channelId}`);
                    }
                }
            }
        });
    });
};

const getSocket = () => {
    if (!io) {
        throw new Error("Socket.io for WebRTC is not initialized!");
    }
    return io;
};

const createWebRtcTransport = async (router) => {
    const transport = await router.createWebRtcTransport({
        listenIps: [{ ip: '0.0.0.0', announcedIp: config.rtc.announcedIp }],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
    });

    transport.on('dtlsstatechange', dtlsState => {
        console.log(`[RTCSOCKET]: Transport DTLS state changed to ${dtlsState}`);
        if (dtlsState === 'closed') {
            transport.close();
        }
    });

    transport.on('close', () => {
        console.log('[RTCSOCKET]: Transport closed');
    });

    return transport;
};

module.exports = {
    getSocket,
    createRTCSocket,
};