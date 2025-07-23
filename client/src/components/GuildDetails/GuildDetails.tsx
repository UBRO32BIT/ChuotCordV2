import Grid from "@mui/material/Grid";
import GuildInfo from "../GuildInfo/GuildInfo";
import Box from "@mui/material/Box";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import React from "react";
import { useSnackbar } from "notistack";
import { Guild } from "../../shared/guild.interface";
import ChannelDetails from "../ChannelDetails/ChannelDetails";
import GuildOverview from "../GuildOverview/GuildOverview";
import { Button, Drawer, Fab, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useSocket } from "../../context/SocketProvider";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchGuildById } from "../../redux/slices/guildsSlice";
import InfoIcon from "@mui/icons-material/Info";
import VoiceChannelDetails from "../VoiceChannelDetails/VoiceChannelDetails";
import VoiceChannelDetailsV2 from "../VoiceChannelDetailsV2";

const action = (snackbarId: any) => (
  <>
    <Button>
      <Typography color={'white'}>Reconnect</Typography>
    </Button>
    {/* <button onClick={() => { alert(`I belong to snackbar with id ${snackbarId}`); }}>
      Undo
    </button>
    <button onClick={() => { closeSnackbar(snackbarId) }}>
      Dismiss
    </button> */}
  </>
);
export default function GuildDetails() {
  const { guildId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoadedGuild, setIsLoadedGuild] = React.useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const socket = useSocket();
  const navigate = useNavigate();
  const [guild, setGuild] = React.useState<Guild>();
  const [isGuildInfoOpen, setGuildInfoOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const updateGuild = (updatedAttributes: any) => {
    setGuild((prevGuild) => ({
      ...prevGuild,
      ...updatedAttributes,
    }));
  };

  const fetchGuildDetails = async (guildId: string) => {
    try {
      setIsLoadedGuild(false);
      const result = await dispatch(fetchGuildById(guildId));
      setGuild(result.payload);
      setIsLoadedGuild(true);
    } catch (error: any) {
      enqueueSnackbar(`${error.message}`, { variant: "error" });
      navigate("/chat");
    }
  };

  const joinGuildSocket = () => {
    if (guildId && isLoadedGuild) {
      socket.emit("user_connect_guild", { guildId });
    }
  };

  React.useEffect(() => {
    if (guildId) {
      fetchGuildDetails(guildId);
      joinGuildSocket();
    }
  }, [guildId]);

  return (
    <Grid container>
      {guild && isLoadedGuild ? (
        <>
          <Grid item md={9.5} xs={12}>
            <Box>
              <Routes>
                <Route path="/" element={<GuildOverview />} />
                <Route path="/channels/:channelId" element={<ChannelDetails />} />
                <Route path="/voice-channels/:channelId" element={<VoiceChannelDetailsV2 />} />
              </Routes>
            </Box>
          </Grid>

          {/* GuildInfo as a Drawer in Mobile, Sidebar in Desktop */}
          {!isMobile ? (
            <Grid item md={2.5}>
              <Box sx={{ borderLeft: "1px solid grey", height: "100vh", display: "flex" }}>
                <GuildInfo guild={guild} updateGuild={updateGuild} />
              </Box>
            </Grid>
          ) : (
            <>
              <Drawer
                anchor="right"
                open={isGuildInfoOpen}
                onClose={() => setGuildInfoOpen(false)}
                sx={{
                  "& .MuiDrawer-paper": {
                    width: 250,
                    backgroundColor: "var(--color-background)",
                    padding: 2,
                  },
                }}
              >
                <GuildInfo guild={guild} updateGuild={updateGuild} />
              </Drawer>

              <Fab
                color="primary"
                sx={{ position: "fixed", bottom: 80, right: 16, zIndex: 1000 }}
                onClick={() => setGuildInfoOpen(true)}
              >
                <InfoIcon />
              </Fab>
            </>
          )}
        </>
      ) : (
        <Typography>LOADING</Typography>
      )}
    </Grid>
  );
}