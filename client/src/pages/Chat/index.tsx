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
import { ReconnectManager } from '../../utils/reconnect';
import { Helmet } from 'react-helmet';

export default function Chat() {
    const socket = useSocket();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [isReconnecting, setIsReconnecting] = React.useState(false);
    const reconnectManager = React.useRef(new ReconnectManager());
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

      const fetchSocketStatus = React.useCallback(() => {
        if (!socket.connected && !isReconnecting) {
            const snackbarId = enqueueSnackbar('Socket disconnected', {
                variant: "error",
                preventDuplicate: true,
                persist: true,
                action: (snackbarId) => (
                    <Button 
                        onClick={() => handleReconnect()}
                        disabled={isReconnecting || !reconnectManager.current.canRetry()}
                    >
                        <Typography color="white">
                            {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
                        </Typography>
                    </Button>
                )
            });
        }
    }, [socket, isReconnecting]);

    const handleReconnect = React.useCallback(async () => {
        if (!reconnectManager.current.canRetry() || isReconnecting) {
            enqueueSnackbar('Maximum reconnection attempts reached. Please refresh the page.', 
                { variant: 'error' });
            return;
        }

        try {
            setIsReconnecting(true);
            const delay = reconnectManager.current.getDelay();
            const attempts = reconnectManager.current.getAttempts();
            
            enqueueSnackbar(`Attempting to reconnect in ${delay/1000}s... (Attempt ${attempts}/5)`, 
                { variant: 'info' });

            await new Promise(resolve => setTimeout(resolve, delay));

            const accessToken = await RefreshToken();
            setAccessToken(accessToken);
            socket.auth = { token: "Bearer " + accessToken };
            socket.connect();

        } catch (error) {
            console.error("Reconnect failed", error);
            if (reconnectManager.current.canRetry()) {
                handleReconnect();
            }
        } finally {
            setIsReconnecting(false);
        }
    }, [socket, enqueueSnackbar, isReconnecting]);

    React.useEffect(() => {
        socket.on("connect", () => {
            if (reconnectManager.current.getAttempts() > 0) {
                enqueueSnackbar("Reconnected to the server", { variant: "success" });
            }
            reconnectManager.current.reset();
            setIsReconnecting(false);
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
            if (reason === "io server disconnect" || reason === "io client disconnect") {
                // Server/client initiated the disconnect, don't reconnect automatically
                return;
            }
            handleReconnect();
        });

        socket.on("connect_error", (error) => {
            console.log("Connection error:", error);
            handleReconnect();
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("connect_error");
            reconnectManager.current.reset();
        };
    }, [socket, handleReconnect, enqueueSnackbar]);

    const sidebar = (
        <Box sx={{ 
            height: "100vh", 
            display: "flex", 
            flexDirection: "column", 
            backgroundColor: "var(--guild-sidebar-background)",
        }}>
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
                    <Box sx={{ width: 240 }}>
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
