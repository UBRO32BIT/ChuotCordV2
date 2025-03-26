const { Server } = require('socket.io');
const onlineStatusService = require('../services/v1/onlineStatus.service');
const config = require('../config/config');
const jwt = require("jsonwebtoken");
const userService = require('../services/v1/user.service');

let io;

const createSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: config.CLIENT_HOST,
            methods: ["GET", "POST"],
        }
    });

    io.use((socket, next) => {
        try {
            console.log(socket.handshake)
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
        console.log(`[SOCKET]: User with ID ${socket.userId} connected`);
        const guildIds = await onlineStatusService.processUserOnline(socket.userId);
        guildIds.forEach(guildId => {
            socket.join(`guild:${guildId}`);
            emitUserOnlineByGuildId(socket, guildId, socket.userId)
        })

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
                emitMemberTyping(socket, data.channelId, socket.username);
            }
        })

        socket.on("user_done_typing", async (data) => {
            //if (data && data.)
        })

        socket.on("disconnect", async (data) => {
            console.log(`[SOCKET]: User disconnected ${socket.userId}`);
            const user = await userService.GetUserById(socket.userId);
            user.guilds.forEach(guild => {
                emitUserOfflineByGuildId(socket, guild._id, socket.userId);
            });
            await onlineStatusService.processUserOffline(socket.userId);
        })
    })
}

const getSocket = () => {
    if (!io) {
        throw new Error("Socket.io is not initialized!");
    }
    return io;
};

const emitUserOnlineByGuildId = (socket, guildId, memberId) => {
    socket.to(`guild:${guildId}`).emit('user_online', {
        guildId: guildId,
        memberId: memberId,
    })
}

const emitUserOfflineByGuildId = (socket, guildId, memberId) => {
    socket.to(`guild:${guildId}`).emit('user_offline', {
        guildId: guildId,
        memberId: memberId,
    })
}

const emitJoinGuild = (socket, guildId, member) => {
    socket.to(`guild:${guildId}`).emit('user_joined_guild', {
        guildId: guildId,
        member: member,
    });
}

const emitLeaveGuild = (socket, guildId, memberId) => {
    socket.to(`guild:${guildId}`).emit("user_left_guild", {
        guildId: guildId,
        memberId: memberId,
    });
}

const emitGuildUpdated = (guild) => {
    io.to(`guild:${guild._id}`).emit("guild_updated", {
        guildId: guild._id,
        data: guild,
    });
}

const emitMemberTyping = (socket, channelId, username) => {
    socket.nsp.to(channelId).emit("user_typing", {
        channelId: channelId,
        userId: username,
    });
}

const emitMessage = (channelId, message) => {
    io.to(channelId).emit("chat_received", message);
}

module.exports = {
    getSocket,
    createSocket,
    emitMessage,
    emitJoinGuild,
    emitLeaveGuild,
    emitGuildUpdated,
};