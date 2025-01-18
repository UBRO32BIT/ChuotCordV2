import React from "react";
import { useSocket } from "../../context/SocketProvider";
import { Message } from "../../shared/message.interface";
import Box from "@mui/material/Box";
import MessageComponent from "../Message/MessageComponent";
import { GetMessageByChannelId } from "../../services/message.service";
import { useParams } from "react-router-dom";

export default function MessageList() {
    const { guildId, channelId } = useParams();
    const socket = useSocket();
    const messagesRef = React.useRef<HTMLDivElement | null>(null);
    const bottomRef = React.useRef<HTMLDivElement | null>(null);

    const [isInitialLoaded, setIsInitialLoaded] = React.useState<boolean>(true);
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [loadingOlderMessages, setLoadingOlderMessages] = React.useState(false);
    const [hasMoreMessages, setHasMoreMessages] = React.useState(true);

    // Function to fetch messages, with cursor (optional)
    const fetchMessages = async (before?: string) => {
        if (guildId && channelId) {
            try {
                const result = await GetMessageByChannelId(guildId, channelId, before);
                console.log("Fetch messages");
                if (result.length === 0) {
                    setHasMoreMessages(false); // No more messages to load
                } else {
                    // Prepend older messages to the existing list
                    setMessages((prev) => [...result, ...prev]);
                }
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            } finally {
                setLoadingOlderMessages(false);
            }
        }
    };

    // Handle scroll to load older messages
    const handleMessagesScroll = () => {
        if (messagesRef.current) {
            // Check if scrolled to the top
            if (messagesRef.current.scrollTop === 0 && hasMoreMessages && !loadingOlderMessages) {
                console.log("Scrolled to the top, getting older messages");
                setLoadingOlderMessages(true);
                const oldestMessageId = messages[0]?._id; // Get the ID of the oldest message
                fetchMessages(oldestMessageId);
            }
        }
    };

    // Fetch initial messages when the component loads
    React.useEffect(() => {
        setMessages([]); // Clear messages when the channel changes
        setHasMoreMessages(true); // Reset the `hasMoreMessages` flag
        fetchMessages(); // Fetch the latest messages
    }, [channelId, guildId]);

    // Scroll to bottom when messages are loaded
    React.useEffect(() => {
        if (isInitialLoaded && messages.length > 0 && bottomRef.current && messagesRef.current?.scrollTop === 0) {
            console.log("Auto scroll to bottom at default");
            bottomRef.current.scrollIntoView({ behavior: 'instant' } as any);
            setIsInitialLoaded(false);
        }
    }, [messages]);

    // Listen for new messages via the socket
    React.useEffect(() => {
        if (socket) {
            socket.on("chat_received", (data) => {
                const newMessage: Message = data;
                setMessages((prev) => [...prev, newMessage]);
            });

            // Cleanup socket listener
            return () => {
                socket.off("chat_received");
            };
        }
    }, [socket]);

    return (
        <Box
            ref={messagesRef}
            onScroll={handleMessagesScroll}
            sx={{
                textAlign: "left",
                pl: 1,
                overflowY: "auto",
                height: "100%", // Adjust height as per your layout
            }}
        >
            {loadingOlderMessages && (
                <Box sx={{ textAlign: "center", py: 1 }}>Loading...</Box>
            )}
            {messages.map((message) => (
                <MessageComponent key={message._id} {...message} />
            ))}
            {messages.length > 0 && <Box ref={bottomRef}></Box>}
        </Box>
    );
}
