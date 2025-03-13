import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import GuildMiniCard from "../GuildMiniCard/GuildMiniCard";
import { Link } from "react-router-dom";
import { AppDispatch, RootState } from "../../store";
import { fetchGuilds } from "../../redux/slices/guildsSlice";
import { useSnackbar } from "notistack";

export const GuildList = () => {
    const { guilds, loading, error } = useSelector((state: RootState) => state.guilds);
    const dispatch = useDispatch<AppDispatch>();
    const { enqueueSnackbar } = useSnackbar();

    const fetchGuildList = async () => {
        await dispatch(fetchGuilds());
    }

    React.useEffect(() => {
        fetchGuildList();
    }, [dispatch]);

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