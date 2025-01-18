import Box from "@mui/material/Box"
import { Online } from "./Online"
import { Idle } from "./Idle"
import { DoNotDisturb } from "./DoNotDisturb"

interface OnlinePresenceProps {
    onlinePresence: string; // Define the type of your prop
}

export const OnlinePresence = (onlinePresence: OnlinePresenceProps) => {
    return <Box
        sx={{
            position: "absolute",
            bottom: -2, // Adjust to align correctly
            right: -2, // Adjust to align correctly
            width: "14px", // Slightly larger than the img
            height: "14px",
            borderRadius: "50%",
            border: "2px solid white", // Outer border (highlight)
            backgroundColor: "green", // Match the image color or customize
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}
    >
        {onlinePresence.onlinePresence === "ONLINE" && <Online/>}
        {onlinePresence.onlinePresence === "IDLE" && <Idle/>}
        {onlinePresence.onlinePresence === "DO_NOT_DISTURB" && <DoNotDisturb/>}
    </Box>
}