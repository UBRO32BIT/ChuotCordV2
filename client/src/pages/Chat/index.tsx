import '../../styles/chat/chat.scss'
import React from "react";
import { Box, Button, Divider, Grid, Typography } from "@mui/material";
import { GuildList } from "../../components/GuildList";
import { UserMiniCard } from "../../components/UserProfileCard/UserMiniCard";
import { Route, Routes } from "react-router-dom";
import ChatOverview from "../../components/ChatOverview/ChatOverview";
import GuildDetails from "../../components/GuildDetails/GuildDetails";
import GuildAddition from "../../components/GuildAddition/GuildAddition";
import { useSnackbar } from "notistack";
import { useSocket } from "../../context/SocketProvider";
import { RefreshToken } from '../../services/auth.service';
import { setAccessToken } from '../../utils/localStorage';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Helmet } from 'react-helmet';

export default function Chat() {
    const socket = useSocket();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const isDarkMode = useSelector((state: RootState) => state.darkMode.isDarkMode);
    React.useEffect(() => {
        if (isDarkMode) {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
        console.log(isDarkMode);
      }, [isDarkMode]);

    const fetchSocketStatus = () => {
        if (!socket.connected) {
            console.log("disconnected");
            enqueueSnackbar(`You are disconnected`, {
                variant: "error",
                preventDuplicate: true,
                action: (snackbarId) => (
                    <Button onClick={() => handleReconnect(snackbarId)}>
                        <Typography color={"white"}>Reconnect</Typography>
                    </Button>
                ),
            });
            handleReconnect("");
        }
    };

    const handleReconnect = async (snackbarId: any) => {
        try {
            console.log("reconnecting");
            const accessToken = await RefreshToken();
            socket.auth = { token: "Bearer " + accessToken };
            setAccessToken(accessToken);

            // Attempt to reconnect the socket
            socket.connect();

            // Once the socket is connected, dismiss the snackbar
            socket.on("connect", () => {
                closeSnackbar(snackbarId);
                enqueueSnackbar("Reconnected successfully", { variant: "success", preventDuplicate: true });
            });

            // Handle potential reconnection errors
            socket.on("connect_error", (err) => {
                enqueueSnackbar(`Reconnect failed: ${err.message}`, { variant: "error", preventDuplicate: true });
            });
        }
        catch (error) {
            console.error("Reconnect failed", error);
        }
    };

    React.useEffect(() => {
        // Set up the interval to check socket status every second
        const intervalId = setInterval(fetchSocketStatus, 1000);

        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array ensures this runs once on mount

    return (
        <Grid container sx={{ height: "100vh" }} className="chat-container">
            <Helmet>
                <title> Chat | Chuotcord</title>
            </Helmet>
            <Grid
                item
                md={2}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    borderRight: "1px solid grey",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        overflowY: "auto",
                    }}
                >
                    <Box sx={{ flex: "0 1 auto" }}>
                        <UserMiniCard />
                    </Box>
                    <Divider variant="middle" />
                    <Box sx={{ flex: "1 1 auto", overflowY: "auto", overflowX: "hidden" }}>
                        <GuildList />
                    </Box>
                    <Box sx={{ flex: "0 1 auto" }}>
                        <Divider />
                        <GuildAddition />
                    </Box>
                </Box>
            </Grid>
            <Grid item md={10}>
                <Routes>
                    <Route path="/" element={<ChatOverview />} />
                    <Route path="/:guildId/*" element={<GuildDetails />} />
                </Routes>
            </Grid>
        </Grid>
    );
}
