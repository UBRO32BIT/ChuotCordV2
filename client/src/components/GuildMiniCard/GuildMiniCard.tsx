import Box from "@mui/material/Box";
import { GuildPartial } from "../../shared/guild.interface";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";

export default function GuildMiniCard(guild: GuildPartial) {
    return <Box>
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    m: 1
                }}>
                    <Avatar 
                        src={guild.image ? guild.image : "https://th.bing.com/th/id/R.56a9da700dfa986e13e076e33f9f1c4b?rik=SvEcc5BdICdsPA&riu=http%3a%2f%2farlingtonva.s3.amazonaws.com%2fwp-content%2fuploads%2fsites%2f25%2f2013%2f12%2frat.jpg&ehk=d4vHlKTtIy9Xh8ONiLmI6fdVtQ6BsEHvB6cCq%2bX2ovY%3d&risl=&pid=ImgRaw&r=0"} 
                        alt={guild.name}
                        sx={{ width: 48, height: 48}}
                    />
                    <Box sx={{
                        textAlign: "start"
                    }}>
                        <Typography variant="subtitle1" fontWeight="bold">{guild.name}</Typography>
                        <Typography variant="body2">{guild.memberCounts} {guild.memberCounts > 1 ? "members" : "member"}</Typography>
                    </Box>
                </Box>
            </Box>
}