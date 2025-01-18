import Box from "@mui/material/Box";
import React from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketProvider";

export default function MemberTyping() {
    const {guildId, channelId} = useParams();
    const [typingUsers, setTypingUsers] = React.useState<string[]>([]);
    const socket = useSocket();
    
    React.useEffect(() => {
        const timers: Record<string, NodeJS.Timeout> = {}; // Store timers for each user
    
        // Listen for "user_typing" events
        socket.on("user_typing", (data: { channelId: string; userId: string }) => {
            console.log(data);
          if (data.channelId === channelId) {
            setTypingUsers((prev) => {
              // Add the user if not already in the list
              if (!prev.includes(data.userId)) {
                return [...prev, data.userId];
              }
              return prev;
            });
    
            // Clear any existing timer for this user
            if (timers[data.userId]) {
              clearTimeout(timers[data.userId]);
            }
    
            // Set a new timer to remove the user after 5 seconds
            timers[data.userId] = setTimeout(() => {
              setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
              delete timers[data.userId]; // Clean up the timer
            }, 5000);
          }
        });
    
        return () => {
          socket.off("user_typing"); // Cleanup the socket listener
          // Clear all active timers
          Object.values(timers).forEach(clearTimeout);
        };
      }, [channelId]);
    
      // Generate a string representation of typing users
      const typingMessage = () => {
        if (typingUsers.length === 0) return ""; // No users typing, return an empty string
        if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
        return `${typingUsers.join(", ")} are typing...`;
      };
    return <Box sx={{
        textAlign: "start",
        pb: 0.5,
    }}>
        {typingMessage() && <div>{typingMessage()}</div>}
    </Box>
}