import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { Attachment } from '../../shared/attachment.interface';
import { Message, MessageType } from '../../shared/message.interface';
import { formatDateTime } from '../../utils/date';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { getLanguageFromExtension } from '../../utils/file';

export default function MessageComponent(message: Message) {
    const renderAttachment = (attachment: Attachment) => {
        switch (attachment.type) {
            case 'image':
                return (
                    <Box
                        key={attachment._id}
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-start', // Align to the start
                            mt: 1,
                        }}
                    >
                        <img
                            src={attachment.fullUrl}
                            crossOrigin="anonymous"
                            alt="attachment"
                            style={{
                                maxWidth: '50%', // Dynamic width relative to the parent
                                borderRadius: '8px',
                            }}
                        />
                    </Box>
                );
            case 'video':
                return (
                    <Box
                        key={attachment._id}
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-start', // Align to the start
                            mt: 1,
                        }}
                    >
                        <video
                            controls
                            crossOrigin="anonymous"
                            style={{
                                maxWidth: '50%', // Dynamic width relative to the parent
                                borderRadius: '8px',
                            }}
                        >
                            <source src={attachment.fullUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </Box>
                );
            case 'code':
                const language = getLanguageFromExtension(attachment.fullUrl);
                return (
                    <Box
                        key={attachment._id}
                        sx={{
                            mt: 1,
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px',
                            overflow: 'auto',
                        }}
                    >
                        <SyntaxHighlighter
                            language={language}
                            showLineNumbers
                            wrapLongLines
                            customStyle={{
                                fontSize: '12px',
                            }}
                        >
                            {attachment.content || '// Code content not available'}
                        </SyntaxHighlighter>
                    </Box>
                );
            default:
                // Handle other types (e.g., files)
                return (
                    <Box
                        key={attachment._id}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mt: 1,
                        }}
                    >
                        <InsertDriveFileIcon sx={{ mr: 1 }} className='file-icon' />
                        <a
                            href={attachment.fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                textDecoration: 'none',
                                color: 'blue',
                            }}
                        >
                            {attachment.fullUrl.split('/').pop()}
                        </a>
                    </Box>
                );
        }
    };
    const renderMessageContent = () => {
        switch (message.type) {
            case MessageType.JOIN:
                return <>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center',
                        }}
                    >
                        <Typography>{message.sender.username} joined the guild.</Typography>
                        <Typography variant="body2" color="gray">
                            {formatDateTime(message.timestamp)}
                        </Typography>
                    </Box>
                </>

            case MessageType.LEAVE:
                return <Typography>{message.sender.username} left the guild.</Typography>;

            case MessageType.OWNERSHIP:
                return <Typography>{message.sender.username} is now the owner.</Typography>;

            case MessageType.KICK:
                return <Typography>{message.sender.username} was kicked from the guild.</Typography>;

            case MessageType.BAN:
                return <Typography>{message.sender.username} was banned from the guild.</Typography>;
            default:
                return <>
                    <Box>
                        <Avatar
                            src={message.sender.profilePicture}
                            alt=""
                            sx={{ width: 42, height: 42 }}
                        />
                    </Box>
                    <Box>
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 1,
                                alignItems: 'center',
                            }}
                        >
                            <Typography variant="body1" fontWeight="bold">
                                {message.sender.username}
                            </Typography>
                            <Typography variant="body2" color="gray">
                                {formatDateTime(message.timestamp)}
                            </Typography>
                        </Box>
                        <Box>{message.content}</Box>
                        <Box>
                            {message.attachments && message.attachments.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                    {message.attachments.map(renderAttachment)}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </>
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 1,
                py: 0.5,
            }}
        >
            {renderMessageContent()}
        </Box>
    );
}