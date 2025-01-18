import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import GuildMiniCard from "../GuildMiniCard/GuildMiniCard";
import { Link } from "react-router-dom";
import { GuildPartial } from "../../shared/guild.interface";
import { loadGuild } from "../../redux/slices/guildsSlice";
import { getGuildsByUserId } from "../../services/user.service";

export const GuildList = () => {
    const guilds = useSelector((state: any) => state.guilds.guilds);
    const dispatch = useDispatch();
    const fetchGuilds = async () => {
        try {
            const guilds = await getGuildsByUserId();
            dispatch(loadGuild(guilds));
        }
        catch (error: any) {
            console.log(error);
        }
    }
    React.useEffect(() => {
        fetchGuilds();
        console.log(guilds);
        // guilds.forEach((guild: GuildPartial, _id: string, map: Map<string, GuildPartial>) => {
        //     console.log(guild);
        // })
    }, [])
    return <Box
        sx={{
            justifyContent: "center",
        }}
    >
        <Box sx={{

        }}>
            {guilds && guilds.map ? (
                guilds.map((guild: any, index: number) => (
                    <Box key={index}>
                        <Link to={`${guild._id}`} style={{ textDecoration: 'none', color: 'var(--color-foreground)' }}>
                            <GuildMiniCard {...guild} />
                        </Link>
                    </Box>
                ))
            ) : (
                <Skeleton variant="rounded" width={210} height={60} />
            )}
        </Box>
    </Box>
}