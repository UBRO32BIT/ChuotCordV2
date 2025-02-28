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

    const newMessageCount = React.useRef(0);
    const lastMessageTime = React.useRef<number>(0);

    // Function to fetch messages, with cursor (optional)
    const fetchMessages = async (before?: string) => {
        if (guildId && channelId) {
            try {
                const result = await GetMessageByChannelId(guildId, channelId, before);
                console.log("Fetch messages");
                if (result.length === 0) {
                    setHasMoreMessages(false); // No more messages to load
                } else {
                    // Preserve scroll position when loading older messages
                    const prevScrollHeight = messagesRef.current?.scrollHeight || 0;
                    setMessages((prev) => [...result, ...prev]);
                    setTimeout(() => {
                        if (messagesRef.current) {
                            messagesRef.current.scrollTop =
                                messagesRef.current.scrollHeight - prevScrollHeight;
                        }
                    }, 0);
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
            if (messagesRef.current.scrollTop < 10 && hasMoreMessages && !loadingOlderMessages) {
                console.log("Scrolled to the top, getting older messages");
                setLoadingOlderMessages(true);
                const oldestMessageId = messages[0]?._id; // Get the ID of the oldest message
                fetchMessages(oldestMessageId);
            }
        }
    };

    React.useEffect(() => {
        setMessages([]);
        setHasMoreMessages(true);
        fetchMessages();
    }, [channelId, guildId]);

    // Scroll to bottom when messages are loaded initially
    React.useEffect(() => {
        if (isInitialLoaded && messages.length > 0 && bottomRef.current) {
            console.log("Auto scroll to bottom at default");
            bottomRef.current.scrollIntoView({ behavior: "instant" } as any);
            setIsInitialLoaded(false);
        }
    }, [messages]);

    // DEBUG SCROLL POSITION (UNCOMMENT ON TESTING)
    React.useEffect(() => {
        // const messagesContainer = messagesRef.current;
        // if (messagesContainer) {
        //     messagesContainer.addEventListener("scroll", () => {
        //         console.log(messagesContainer.scrollTop, messagesContainer.scrollHeight, messagesContainer.clientHeight);
        //     });
        // }

        // return () => {
        //     if (messagesContainer) {
        //         messagesContainer.removeEventListener("scroll", () => {
        //             console.log(messagesContainer.scrollTop, messagesContainer.scrollHeight, messagesContainer.clientHeight);
        //         });
        //     }
        // };
    }, []);

    // New message listener
    React.useEffect(() => {
        if (socket) {
            const handleNewMessage = (data: Message) => {
                if (messagesRef.current) {
                    const isAtBottom =
                        messagesRef.current.scrollHeight - messagesRef.current.scrollTop - messagesRef.current.clientHeight < 500;

                    // Track the time of the last message received
                    const now = Date.now();
                    if (now - lastMessageTime.current < 1000) {
                        newMessageCount.current += 1;
                    } else {
                        newMessageCount.current = 1;
                    }
                    lastMessageTime.current = now;

                    setMessages((prev) => [...prev, data]);

                    // If too many messages arrive in 1 second, scroll instantly
                    const scrollBehavior = newMessageCount.current > 3 ? "instant" : "smooth";

                    if (isAtBottom) {
                        setTimeout(() => {
                            bottomRef.current?.scrollIntoView({ behavior: scrollBehavior } as any);
                        }, 0);
                    }
                }
            };

            socket.on("chat_received", handleNewMessage);
            return () => {
                socket.off("chat_received", handleNewMessage);
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