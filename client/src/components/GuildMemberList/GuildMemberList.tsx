import Box from "@mui/material/Box";
import { Guild, Member } from "../../shared/guild.interface";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import React from "react";
import { useSocket } from "../../context/SocketProvider";
import { OnlinePresence } from "../OnlinePresences/OnlinePresence";
import Chip from "@mui/material/Chip";

interface GuildInfoProps {
    guild: Guild;
    updateGuild: (updatedAttributes: Partial<Guild>) => void;
}

export default function GuildMemberList({ guild, updateGuild }: GuildInfoProps) {
    const [onlineMembers, setOnlineMembers] = React.useState<Member[]>([]);
    const [offlineMembers, setOfflineMembers] = React.useState<Member[]>([]);
    const [isLoadedMembers, setIsLoadedMembers] = React.useState<boolean>(false);
    const [isLoadedOnlineMembers, setIsLoadedOnlineMembers] = React.useState<boolean>(false);
    const socket = useSocket();

    React.useEffect(() => {
        setOnlineMembers([]);
        setOfflineMembers(guild.members);
        setIsLoadedMembers(true);
        setIsLoadedOnlineMembers(false);
    }, [guild._id]);

    React.useEffect(() => {
        if (socket && guild.members && isLoadedMembers && !isLoadedOnlineMembers) {
            socket.emit("request_online_members", { guildId: guild._id });

            return () => {
                socket.off("request_online_members");
            };
        }
    }, [socket, guild.members, onlineMembers, offlineMembers]);

    React.useEffect(() => {
        socket.on("online_members", (data) => {
            const onlineMemberSet = new Set(data);
            const filteredOnlineMembers = guild.members.filter(member => onlineMemberSet.has(member.memberId._id));
            const filteredOfflineMembers = guild.members.filter(member => !onlineMemberSet.has(member.memberId._id));
            setOnlineMembers(filteredOnlineMembers);
            setOfflineMembers(filteredOfflineMembers);
            setIsLoadedOnlineMembers(true);
        });
        return () => {
            socket.off("online_members");
        }
    }, [socket, guild.members, onlineMembers, offlineMembers]);

    React.useEffect(() => {
        socket.on('user_online', (data) => {
            if (data.guildId === guild._id) {
                console.log(guild.members);
                const member = guild.members.find((member) => member.memberId._id === data.memberId);
                if (member) {
                    setOnlineMembers((prevMembers) => [...prevMembers, member]);
                    setOfflineMembers((prevMembers) => prevMembers.filter((member) => member.memberId._id !== data.memberId));
                }
            }
        })
        socket.on('user_offline', (data) => {
            if (data.guildId === guild._id) {
                const member = guild.members.find((member) => member.memberId._id === data.memberId);
                if (member) {
                    setOfflineMembers((prevMembers) => [...prevMembers, member]);
                    setOnlineMembers((prevMembers) => prevMembers.filter((member) => member.memberId._id !== data.memberId));
                }
            }
        })
        return () => {
            socket.off("user_online");
            socket.off("user_offline");
        }
    }, [socket, guild._id, guild.members]);

    React.useEffect(() => {
        socket.on('user_joined_guild', (data) => {
            if (data.guildId === guild._id) {
                setOfflineMembers((prevMembers) => [...prevMembers, data.member]);
            }
        });

        return () => {
            socket.off('user_joined_guild');
        };
    }, [socket, guild._id]);

    return <Box sx={{gap: 2, display: "flex", flexDirection: "column"}}>
        <Box>
            <Typography
                color="var(--guild-sidebar-primary-text)" 
                sx={{ mx: 1 }}>
                    Online - {onlineMembers && onlineMembers.length}
                </Typography>
            {onlineMembers && onlineMembers.map && onlineMembers.map((member) => (
                <Box
                    key={member._id}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1
                    }}>
                    <Box sx={{ position: "relative", width: 36, height: 36 }}>
                        <Avatar
                            src={member.memberId.profilePicture}
                            alt={member.memberId.username}
                            sx={{ width: 36, height: 36 }}
                        />
                        {member.memberId.onlinePresence && <OnlinePresence onlinePresence={member.memberId.onlinePresence} />}
                    </Box>
                    <Typography>{member.memberId.username}</Typography>
                    {member.roles.map((role) => (
                        <Chip
                            key={role._id}
                            label={role.name}
                            size="small"
                            style={{
                                backgroundColor: role.color,
                                color: "#FFFFFF", // Ensures text contrast
                                fontWeight: "bold",
                            }}
                        />
                    ))}
                </Box>
            ))}
        </Box>
        <Box>
            <Typography 
                color="var(--guild-sidebar-primary-text)"  
                sx={{ mx: 1 }}>
                    Offline - {offlineMembers && offlineMembers.length}
                </Typography>
            {offlineMembers && offlineMembers.map && offlineMembers.map((member) => (
                <Box
                    key={member._id}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1
                    }}>
                    <Avatar
                        src={member.memberId.profilePicture}
                        alt={member.memberId.username}
                        sx={{ width: 36, height: 36 }}
                    />
                    <Typography>{member.memberId.username}</Typography>
                </Box>
            ))}
        </Box>
    </Box>
}