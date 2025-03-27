import React from "react";
import { useSocket } from "../../context/SocketProvider";
import { Message } from "../../shared/message.interface";
import Box from "@mui/material/Box";
import MessageComponent from "../Message/MessageComponent";
import { GetMessageByChannelId } from "../../services/message.service";
import { useParams } from "react-router-dom";
import MessageLoading from "../MessageLoading";

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

    const fetchMessages = async (before?: string) => {
        if (guildId && channelId) {
            try {
                setLoadingOlderMessages(true);
                const result = await GetMessageByChannelId(guildId, channelId, before);
                if (result.length === 0) {
                    setHasMoreMessages(false);
                } else {
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
                const oldestMessageId = messages[0]?._id;
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
                height: "100%",
            }}
        >
            {loadingOlderMessages && (
                <Box sx={{ textAlign: "center", py: 1 }}>
                    <MessageLoading/>
                </Box>
            )}
            {messages.map((message) => (
                <MessageComponent key={message._id} {...message} />
            ))}
            {messages.length > 0 && <Box ref={bottomRef}></Box>}
        </Box>
    );
}