import '../../styles/chat/chat.scss'
import React from "react";
import { Box, Button, Divider, Drawer, Grid, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [mobileOpen, setMobileOpen] = React.useState(false);
    
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    React.useEffect(() => {
        if (isDarkMode) {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
      }, [isDarkMode]);

      const fetchSocketStatus = () => {
        if (!socket.connected) {
            const snackbarId = enqueueSnackbar(`Socket disconnected`, {
                variant: "error",
                preventDuplicate: true,
                action: (snackbarId) => (
                    <Button onClick={() => handleReconnect(snackbarId)}>
                        <Typography color={"white"}>Reconnect</Typography>
                    </Button>
                ),
            });
        }
    };

    const handleReconnect = async (snackbarId: any) => {
        try {
            const accessToken = await RefreshToken();
            setAccessToken(accessToken);
            socket.auth = { token: "Bearer " + accessToken };

            socket.off("connect");
            socket.off("connect_error");

            socket.on("connect", () => {
                closeSnackbar(snackbarId);
                enqueueSnackbar("Reconnected successfully", { variant: "success", preventDuplicate: true });
            });

            socket.on("connect_error", (err) => {
                enqueueSnackbar(`Reconnect failed: ${err.message}`, { variant: "error", preventDuplicate: true });
            });

            socket.connect();
        }
        catch (error) {
            console.error("Reconnect failed", error);
        }
    };

    React.useEffect(() => {
        const intervalId = setInterval(fetchSocketStatus, 3000);
        return () => clearInterval(intervalId);
    }, []);

    const sidebar = (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
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
    );

    return (
        <Box sx={{ display: 'flex', height: '100vh' }} className="chat-container">
            <Helmet>
                <title>Chat | Chuotcord</title>
            </Helmet>

            {/* Mobile hamburger menu */}
            {isMobile && (
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}
                >
                    <MenuIcon />
                </IconButton>
            )}

            {/* Sidebar - Responsive drawer for mobile */}
            <Box
                component="nav"
                sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
            >
                {isMobile ? (
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            '& .MuiDrawer-paper': { 
                                boxSizing: 'border-box', 
                                width: 240,
                                backgroundColor: 'var(--color-background)',
                                borderRight: '1px solid grey'
                            },
                        }}
                    >
                        {sidebar}
                    </Drawer>
                ) : (
                    <Box sx={{ width: 240, borderRight: '1px solid grey' }}>
                        {sidebar}
                    </Box>
                )}
            </Box>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { sm: `calc(100% - 240px)` }
                }}
            >
                <Routes>
                    <Route path="/" element={<ChatOverview />} />
                    <Route path="/:guildId/*" element={<GuildDetails />} />
                </Routes>
            </Box>
        </Box>
    );
}
