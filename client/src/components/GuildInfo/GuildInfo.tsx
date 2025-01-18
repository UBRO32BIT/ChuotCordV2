import Box from "@mui/material/Box";
import { Guild } from "../../shared/guild.interface";
import GuildMemberList from "../GuildMemberList/GuildMemberList";
import ChannelList from "../ChannelList/ChannelList";
import GuildSettingsDropdown from "../GuildSettingsDropdown/GuildSettingsDropdown";
import Divider from "@mui/material/Divider";
interface GuildInfoProps {
    guild: Guild;
    updateGuild: (updatedAttributes: Partial<Guild>) => void;
}
export default function GuildInfo({ guild, updateGuild }: GuildInfoProps) {
    return <Box sx={{textAlign: "left"}}>
        <Box>
            <GuildMemberList guild={guild} updateGuild={updateGuild}/>
        </Box>
        <Box sx={{textAlign: "left"}}>
            <ChannelList guild={guild} updateGuild={updateGuild}/>
        </Box>
        <Divider/>
        <Box>
            <GuildSettingsDropdown key={guild._id} guild={guild} updateGuild={updateGuild}/>
        </Box>
    </Box>
}