import { Button, Divider, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { closeSnackbar, useSnackbar } from "notistack";
import { useNavigate, useParams } from "react-router-dom";
import { Channel } from "../../shared/guild.interface";
import React from "react";
import { getChannelById } from "../../services/channel.service";
import TagIcon from '@mui/icons-material/Tag';
import MessageList from "../MessageList/MessageList";
import MessageForm from "../MessageForm/MessageForm";
import MenuIcon from '@mui/icons-material/Menu';
import { useSocket } from "../../context/SocketProvider";

export default function ChannelDetails() {
    const { guildId } = useParams();
    const { channelId } = useParams();
    const socket = useSocket();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [channel, setChannel] = React.useState<Channel>();

    const fetchChannelDetails = async (guildId: string, channelId: string) => {
        try {
            const result = await getChannelById(guildId, channelId);
            if (result) {
                setChannel(result);
            }
            else throw Error("Channel data not found");
        } catch (error: any) {
            enqueueSnackbar(`${error.message}`, { variant: "error" });
            navigate("/chat");
        }
    };

    const joinChannelSocket = () => {
        if (channelId) {
            socket.emit('user_connect_channel', {
                channelId: channelId,
            });
        }
    };

    React.useEffect(() => {
        if (guildId && channelId) {
            fetchChannelDetails(guildId, channelId);
        }
        joinChannelSocket();
    }, [channelId]);

    return (
        <>
            {channel && guildId && (
                <Box
                    sx={{
                        height: '100vh',
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}
                >
                    {/* Header Section */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                            p: 1,
                            flexShrink: 0,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <TagIcon />
                            <Typography>{channel?.name}</Typography>
                        </Box>
                        <Box sx={{ px: 2 }}>
                            <MenuIcon />
                        </Box>
                    </Box>
                    <Divider variant="middle" />

                    {/* Message List Section */}
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: "auto",
                            overflowWrap: "break-word",
                        }}
                    >
                        <MessageList />
                    </Box>

                    {/* Footer Section */}
                    <Box
                        sx={{
                            flexShrink: 0,
                            borderTop: "1px solid rgba(0, 0, 0, 0.12)",
                        }}
                    >
                        <MessageForm guildId={guildId} {...channel} />
                    </Box>
                </Box>
            )}
        </>
    );
}
