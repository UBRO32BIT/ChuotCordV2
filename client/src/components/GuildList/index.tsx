import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import GuildMiniCard from "../GuildMiniCard/GuildMiniCard";
import { Link } from "react-router-dom";
import { AppDispatch, RootState } from "../../store";
import { fetchGuilds, setGuild } from "../../redux/slices/guildsSlice";
import { useSnackbar } from "notistack";
import { useSocket } from "../../context/SocketProvider";

export const GuildList = () => {
    const { guilds, loading, error } = useSelector((state: RootState) => state.guilds);
    const dispatch = useDispatch<AppDispatch>();
    const { enqueueSnackbar } = useSnackbar();
    const socket = useSocket();

    const fetchGuildList = async () => {
        await dispatch(fetchGuilds());
    }

    React.useEffect(() => {
        fetchGuildList();
    }, [dispatch]);
    
    React.useEffect(() => {
        socket.on("guild_updated", (data) => {
            dispatch(setGuild(data.data));
        });
        return () => {
            socket.off("guild_updated");
        }
    }, [dispatch, socket])

    React.useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
        }
    }, [error, enqueueSnackbar]);
    return <Box
        sx={{
            justifyContent: "center",
        }}
    >
        <Box>
            {loading ? (
                <Skeleton variant="rounded" width={210} height={60} />
            ) : (
                guilds.map((guild: any, index: number) => (
                    <Box 
                    key={index}
                    className="guild-item">
                        <Link to={`${guild._id}`} style={{ textDecoration: 'none', color: 'var(--color-foreground)' }}>
                            <GuildMiniCard {...guild} />
                        </Link>
                    </Box>
                ))
            )}
        </Box>
    </Box>
}