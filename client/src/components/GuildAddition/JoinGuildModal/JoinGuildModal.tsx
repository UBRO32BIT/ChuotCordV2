import React, { useState } from 'react';
import { 
    Modal, Box, Typography, Button, TextField,
    Avatar, Divider
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { GetInviteByCode, JoinGuildByCode } from '../../../services/invite.service';
import { GuildPartial } from '../../../shared/guild.interface';

interface JoinGuildModalProps {
    open: boolean;
    onClose: () => void;
    onJoinSuccess: () => void;
}

export default function JoinGuildModal({ open, onClose, onJoinSuccess }: JoinGuildModalProps) {
    const [inviteInput, setInviteInput] = useState('');
    const [guildPreview, setGuildPreview] = useState<GuildPartial>();
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const extractInviteCode = (input: string) => {
        // Handle both direct codes and URLs
        const urlMatch = input.match(/\/invites\/([^\/\s]+)/);
        return urlMatch ? urlMatch[1] : input;
    };

    const handleCheckInvite = async () => {
        setLoading(true);
        try {
            const inviteCode = extractInviteCode(inviteInput);
            const inviteData = await GetInviteByCode(inviteCode);
            setGuildPreview(inviteData.guild);
        } catch (error: any) {
            enqueueSnackbar(error.message, { variant: 'error' });
        }
        setLoading(false);
    };

    const handleJoinGuild = async () => {
        setLoading(true);
        try {
            const inviteCode = extractInviteCode(inviteInput);
            await JoinGuildByCode(inviteCode);
            enqueueSnackbar('Successfully joined guild!', { variant: 'success' });
            onJoinSuccess();
            onClose();
        } catch (error: any) {
            enqueueSnackbar(error.message, { variant: 'error' });
        }
        setLoading(false);
    };

    const handleReset = () => {
        setInviteInput('');
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                width: 400,
                borderRadius: 2,
            }}>
                {!guildPreview ? (
                    <>
                        <Typography variant="h6" mb={2}>
                            Join a Guild
                        </Typography>
                        <TextField
                            fullWidth
                            label="Enter invite code or URL"
                            value={inviteInput}
                            onChange={(e) => setInviteInput(e.target.value)}
                            margin="normal"
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleCheckInvite}
                            disabled={!inviteInput || loading}
                        >
                            Check Invite
                        </Button>
                    </>
                ) : (
                    <>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Avatar src={guildPreview.image? guildPreview.image : "https://th.bing.com/th/id/R.56a9da700dfa986e13e076e33f9f1c4b?rik=SvEcc5BdICdsPA&riu=http%3a%2f%2farlingtonva.s3.amazonaws.com%2fwp-content%2fuploads%2fsites%2f25%2f2013%2f12%2frat.jpg&ehk=d4vHlKTtIy9Xh8ONiLmI6fdVtQ6BsEHvB6cCq%2bX2ovY%3d&risl=&pid=ImgRaw&r=0"} alt={guildPreview.name}>
                                {guildPreview.name}
                            </Avatar>
                            <Typography variant="h6">{guildPreview.name}</Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box display="flex" gap={1}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleJoinGuild}
                                disabled={loading}
                            >
                                Join Guild
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleReset}
                                disabled={loading}
                            >
                                Back
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Modal>
    );
}