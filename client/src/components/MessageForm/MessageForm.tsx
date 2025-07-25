import { FormControl, IconButton, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import React, { ChangeEvent } from "react";
import { useSocket } from "../../context/SocketProvider";
import { Channel } from "../../shared/guild.interface";
import { Cancel01Icon } from "hugeicons-react";
import { AddMessage } from "../../services/message.service";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SendIcon from '@mui/icons-material/Send';
import MemberTyping from "../MemberTyping/MemberTyping";
import { CustomEmojiPicker } from "../CustomEmojiPicker";

// Utility function to debounce events
const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

export default function MessageForm({ guildId, ...channel }: { guildId: string } & Channel) {
    const [fileList, setFileList] = React.useState<File[]>([]);
    const [previewUrlList, setPreviewUrlList] = React.useState<string[]>([]);
    const [isDragging, setIsDragging] = React.useState(false);
    const [message, setMessage] = React.useState<string>('');
    const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
    const socket = useSocket();

    const emitTypingEvent = React.useCallback(
        debounce(() => {
            socket.emit("user_typing", { channelId: channel._id });
        }, 300),
        [channel._id, socket]
    );

    const onMessageChange = (event: any) => {
        setMessage(event.target.value)
        emitTypingEvent();
    }
    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFileList(Array.from(event.target.files));
        }
    }
    const onPaste = (event: ClipboardEvent) => {
        if (event.clipboardData?.files.length) {
            const pastedFiles = Array.from(event.clipboardData.files);
            setFileList((prev) => [...prev, ...pastedFiles]);
        }
    };

    // drag event handlers
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        setFileList(prev => [...prev, ...droppedFiles]);
    };

    const insertEmoji = (emoji: string) => {
        const textarea = document.querySelector(".message-input-field") as HTMLTextAreaElement;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newMessage = message.slice(0, start) + emoji + message.slice(end);
            setMessage(newMessage);
    
            // Restore focus and cursor position
            setTimeout(() => {
                textarea.focus();
                textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
            }, 0);
        }
    };

    const removeImage = (index: number) => {
        // Remove the image from previewUrlList
        const updatedPreviewUrlList = previewUrlList.filter((_, i) => i !== index);
        setPreviewUrlList(updatedPreviewUrlList);

        if (fileList) {
            // Convert FileList to an array
            const fileArray = Array.from(fileList);

            // Remove the file at the specified index
            const updatedFileArray = fileArray.filter((_, i) => i !== index);

            // Update fileList state with the new FileList
            setFileList(updatedFileArray);
        }
    };
    const onChatSubmit = async (event: any) => {
        try {
            event.preventDefault();
            const messageContent = event.target.message.value.trim();
            if (messageContent === '' && fileList.length === 0) return;

            const formData = new FormData();
            formData.append("channelId", channel._id);
            formData.append("message", messageContent);

            // Append files to formData
            fileList.forEach((file) => {
                formData.append("files", file);
            });

            setMessage('');
            setFileList([]);
            setPreviewUrlList([]);

            // Send message and files to the server
            const response = await AddMessage(guildId, channel._id, formData);
        }
        catch (error) {
            console.error("Error uploading message and files:", error);
        }
    };

    React.useEffect(() => {
        if (!fileList) {
            setPreviewUrlList([]);
            return;
        }

        const urls = fileList.map((file) => URL.createObjectURL(file));
        setPreviewUrlList(urls);
    }, [fileList]);

    return <Box sx={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        px: 3,
    }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
    >
        {/* Image append */}
        {previewUrlList && (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "start",
                    flexWrap: "wrap",
                }}
            >
                {isDragging && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            zIndex: 10,
                            borderRadius: '8px',
                            border: '2px dashed white'
                        }}
                    >
                        Drop files here
                    </Box>
                )}
                {fileList.map((file, index) => {
                    const fileType = file.type.split("/")[0]; // Get the type (e.g., "image", "video")
                    return (
                        <Box
                            key={index}
                            sx={{
                                position: "relative",
                                display: "inline-flex", // Prevent the box from expanding to full width
                                flexDirection: "column", // Ensure the image and button stack correctly
                                alignItems: "center", // Align content horizontally to the center of the box
                                margin: 1,
                                width: "25%",
                            }}
                        >
                            <Box sx={{ display: "inline-block", width: "100%" }}>
                                {fileType === "image" ? (
                                    <img
                                        src={previewUrlList[index]}
                                        alt={`Preview ${index}`}
                                        style={{ width: "100%" }}
                                    />
                                ) : fileType === "video" ? (
                                    <video
                                        controls
                                        src={previewUrlList[index]}
                                        style={{ width: "100%" }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "rgba(0,0,0,0.1)",
                                            height: "100px",
                                            borderRadius: "8px",
                                        }}
                                    >
                                        <InsertDriveFileIcon sx={{ fontSize: 40 }} />
                                        <Typography variant="body2">{file.name}</Typography>
                                    </Box>
                                )}
                            </Box>
                            <IconButton
                                onClick={() => removeImage(index)} // Pass the index to the removeImage function
                                sx={{
                                    position: "absolute",
                                    right: 0,
                                    top: 0,
                                    backgroundColor: "rgba(255,255,255,0.7)",
                                }}
                            >
                                <Cancel01Icon />
                            </IconButton>
                        </Box>
                    );
                })}
            </Box>
        )}
        <form onSubmit={onChatSubmit}>
            <Box sx={{
                display: "flex",
                alignItems: "center",
            }}
            className="message-form">
                <textarea
                    name="message"
                    value={message}
                    onChange={onMessageChange}
                    autoComplete="off"
                    placeholder="Type something..."
                    onPaste={onPaste as any}
                    className="message-input-field"
                    rows={1}
                    onInput={(e: any) => {
                        e.target.style.height = "auto"; // Reset height to recalculate
                        e.target.style.height = `${e.target.scrollHeight}px`; // Adjust height dynamically
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault(); // Prevent default Enter behavior
                            (e.target as HTMLTextAreaElement).form?.requestSubmit(); // Submit the form
                        }
                    }}
                />
                <div className="message-form-actions">
                <button className="emoji-picker-button" type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                            <EmojiEmotionsIcon/>
                        </button>
                    {showEmojiPicker && (
                        <div style={{ position: "absolute", bottom: "110%", right: "5%", zIndex: 10, border: "solid", borderRadius: "8px"}}>
                            <CustomEmojiPicker onSelect={insertEmoji} />
                        </div>
                    )}
                    <div className="file-upload-wrapper">
                        <button className="file-input-field">
                            <InsertDriveFileIcon />
                        </button>
                        <input type="file" id="file-input" onChange={onFileChange} multiple />
                    </div>
                    <button type="submit" className="submit-button">
                        <SendIcon />
                    </button>
                </div>
            </Box>
        </form>

        <Box>
            <MemberTyping />
        </Box>
    </Box>
}