import Grid from "@mui/material/Grid";
import GuildInfo from "../GuildInfo/GuildInfo";
import Box from "@mui/material/Box";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import React from "react";
import { useSnackbar } from "notistack";
import { Guild } from "../../shared/guild.interface";
import ChannelDetails from "../ChannelDetails/ChannelDetails";
import GuildOverview from "../GuildOverview/GuildOverview";
import { Button, Typography } from "@mui/material";
import { useSocket } from "../../context/SocketProvider";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchGuildById } from "../../redux/slices/guildsSlice";

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
  const updateGuild = (updatedAttributes: any) => {
    setGuild(prevGuild => ({
        ...prevGuild,
        ...updatedAttributes
    }));
  };

  const fetchGuildDetails = async (guildId: string) => {
    try {
      setIsLoadedGuild(false);
      const result = await dispatch(fetchGuildById(guildId));
      setGuild(result.payload);
      setIsLoadedGuild(true);
    }
    catch (error: any) {
      enqueueSnackbar(`${error.message}`, { variant: "error" });
      navigate("/chat");
    }
  }
  const joinGuildSocket = () => {
    if (guildId && isLoadedGuild) {
      socket.emit('user_connect_guild', {
        guildId: guildId,
      })
      console.log("guild loaded");
    }
  }
  
  React.useEffect(() => {
    if (guildId) {
      fetchGuildDetails(guildId);
      joinGuildSocket();
    }
  }, [guildId])

  return <Grid container>
    {guild && isLoadedGuild ? (
      <>
        <Grid item md={9.5}>
          <Box>
            <Routes>
              <Route>
                <Route path="/" element={<GuildOverview />} />
                <Route path="/channels/:channelId" element={<ChannelDetails />} />
              </Route>
            </Routes>
          </Box>
        </Grid>

        <Grid item md={2.5}>
          <Box sx={{ borderLeft: '1px solid grey', height: '100vh' }}>
            <GuildInfo guild={guild} updateGuild={updateGuild} />
          </Box>
        </Grid>
      </>
    ) : (
      <Typography>LOADING</Typography>
    )}
  </Grid>
}