const { Server } = require('socket.io');
const redisClient = require('../database/redis.database');
const onlineStatusService = require('../services/v1/onlineStatus.service');
const config = require('../config/config');
const jwt = require("jsonwebtoken");
const messageService = require('../services/v1/message.service');

let socket;

const createSocket = (httpServer) => {
    socket = new Server(httpServer, {
        cors: {
          origin: config.CLIENT_HOST,
          methods: ["GET", "POST"],
        }
    });

    socket.use((socket, next) => {
        try {
            const header = socket.handshake.auth.token;
            if (!header) {
              console.log(`[SOCKET]: There is no auth header`)
              return next(new Error("no token"));
            }
          
            if (!header.startsWith("Bearer ")) {
                console.log(`[SOCKET]: Invalid auth header`)
                return next(new Error("invalid token"));
            }
          
            const token = header.substring(7);
          
            jwt.verify(token, config.jwt.accessSecret, (err, decoded) => {
              if (err) {
                console.log(`[SOCKET]: Invalid access token: ${err.message}`)
                socket.disconnect();    
                return;
                //return next(new Error("invalid token"));
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

    socket.on("connection", async (socket) => {
        console.log(`[SOCKET]: User with ID ${socket.userId} connected`);
        await onlineStatusService.processUserOnline(socket.userId);

        socket.on("user_connect_guild", async (data) => {
            try {
                if (data && data.guildId) {
                    console.log(`[SOCKET]: User ${socket.userId} connected guild ${data.guildId}`);
                }
            }
            catch (error) {
                next(new Error(error.message));
            }
        })
        
        socket.on("signal", ({ channelId, signalData, toSocketId }) => {
            console.log("[SOCKET] Signal voice chat data", { channelId, signalData, toSocketId });
            socket.to(channelId).emit("signal", { signalData, fromSocketId: socket.id });
        });

        socket.on("request_online_members", async (data) => {
            try {
                if (data && data.guildId) {
                    const members = await onlineStatusService.getListMemberOnline(data.guildId);
                    socket.emit("online_members", members);
                }
            }
            catch (error) {
                console.error("[SOCKET]: Error while handle request_online_members event: " + error.message);
                next(new Error(error.message));
            }
        })

        socket.on("user_connect_channel", async (data) => {
            try {
                if (data && data.channelId) {
                    socket.join(data.channelId);
                    console.log(`[SOCKET]: User ${socket.userId} connected channel ${data.channelId}`);
                }
            }
            catch (error) {
                next(new Error(error.message));
            }
        })

        socket.on("join_voice_channel", async (data) => {
            try {
                if (data && data.channelId) {
                    socket.join(data.channelId);
                    socket.to(data.channelId).emit("user_joined_voice_channel", socket.userId);
                    console.log(`[SOCKET]: User ${socket.userId} connected voice channel ${data.channelId}`);
                }
            }
            catch (error) {
                next(new Error(error.message));
            }
        });

        socket.on("leave_voice_channel", async (data) => {
            try {
                if (data && data.channelId) {
                    socket.leave(data.channelId);
                    socket.to(data.channelId).emit("user_left_voice_channel", socket.userId);
                    console.log(`[SOCKET]: User ${socket.userId} left voice channel ${data.channelId}`);
                }
            }
            catch (error) {
                next(new Error(error.message));
            }
        });
        
        socket.on("chat", async (data) => {
            // try {
            //     if (data && data.channelId && data.message) {
            //         data.userId = socket.userId;
            //         const message = await messageService.AddMessage(data);
            //         console.log(message);
            //         socket.nsp.to(message.channelId.toString()).emit("chat_received", {
            //             userId: message.sender,
            //             content: message.content,
            //             replyId: message.replyId,
            //             attachments: message.attachments,
            //             timestamp: message.timestamp,
            //         });
            //     }
            // }
            // catch (error) {
            //     console.error("[SOCKET]: Error while handle chat event: " + error.message);
            // }
        })

        socket.on("user_typing", async (data) => {
            if (data && data.channelId) {
                socket.nsp.to(data.channelId).emit("user_typing", {
                    channelId: data.channelId,
                    userId: socket.username,
                });
            }
        })

        socket.on("user_done_typing", async (data) => {
            //if (data && data.)
        })

        socket.on("disconnect", async (data) => {
            console.log(`[SOCKET]: User disconnected ${socket.userId}`);
            await onlineStatusService.processUserOffline(socket.userId);
        })
    })
}

const getSocket = () => {
    if (!socket) {
        throw new Error("Socket.io is not initialized!");
    }
    return socket;
};

module.exports = {
    getSocket,
    createSocket,
};