import React from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { ChannelPartial, Guild } from "../../shared/guild.interface";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TagIcon from '@mui/icons-material/Tag';
import AddIcon from '@mui/icons-material/Add';
import { Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { CreateChannel } from "../../services/channel.service";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { FormControl } from "@mui/material";

const createChannelSchema = yup.object().shape({
    name: yup.string()
        .required("Channel name is required!"),
})
interface GuildInfoProps {
    guild: Guild;
    updateGuild: (updatedAttributes: Partial<Guild>) => void;
}
export default function ChannelList({ guild, updateGuild }: GuildInfoProps) {
    const [channels, setChannels] = React.useState<ChannelPartial[]>();
    const [openCreateChannelModal, setOpenCreateChannelModal] = React.useState<boolean>(false);
    const [createChannelType, setCreateChannelType] = React.useState<string>("text");
    const [uploading, setUploading] = React.useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();
    const {
        register: registerCreateChannel,
        handleSubmit: handleCreateChannelSubmit,
        formState: { errors: createChannelErrors }
    } = useForm({
        resolver: yupResolver(createChannelSchema),
    })

    const handleOpenCreateChannelModal = () => setOpenCreateChannelModal(true);
    const handleCloseCreateChannelModal = () => setOpenCreateChannelModal(false);
    const onChannelTypeChange = (event: SelectChangeEvent) => {
        setCreateChannelType(event.target.value as string);
    }
    const onCreateChannelSubmit = async (event: any) => {
        try {
            setUploading(true);
            const data = {
                name: event.name,
                type: createChannelType,
            }
            const result = await CreateChannel(guild._id, data);
            const newChannel: ChannelPartial = {
                _id: result._id,
                name: result.name,
                type: result.type,
            }
            setChannels([...(channels || []), newChannel]);
            const updatedChannelList = [...(channels || []), newChannel];
            guild.channels = updatedChannelList;
            updateGuild(guild);
            enqueueSnackbar(`Create channel successfully`, { variant: "success" });
        }
        catch (error: any) {
            console.log(error);
            enqueueSnackbar(`${error.message}`, { variant: "error" });
        }
        finally {
            setUploading(false);
            setOpenCreateChannelModal(false);
        }
    }
    const handleVoiceChannelClick = (channelId: string) => {
        console.log(`Voice channel clicked: ${channelId}`);
    }
    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    React.useEffect(() => {
        setChannels(guild.channels);
    }, [guild])

    return <Box>
        <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        }}>
            <Typography variant="button" fontWeight="bold" sx={{ mx: 1 }}>Channels - {channels && channels.length}</Typography>
            <IconButton onClick={handleOpenCreateChannelModal}>
                <AddIcon fontSize="small" className="guild-addition-btn"/>
            </IconButton>
        </Box>
        {channels && channels.map && channels.map((channel) => (
            channel.type === "voice" ? (
                // Render voice channel as a non-link and call a function on click
                <Box
                    key={channel._id}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1,
                        cursor: "pointer",
                        '&:hover': { backgroundColor: "rgba(0, 0, 0, 0.1)" }
                    }}
                    onClick={() => handleVoiceChannelClick(channel._id)}
                >
                    <VolumeUpIcon />
                    <Typography>{channel.name}</Typography>
                </Box>
            ) : (
                // Render text channel as a Link
                <Link
                    key={channel._id}
                    to={`channels/${channel._id}`}
                    style={{
                        textDecoration: "none",
                        color: "var(--color-foreground)",
                    }}
                >
                    <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1,
                        cursor: "pointer",
                        '&:hover': { backgroundColor: "rgba(0, 0, 0, 0.1)" }
                    }}>
                        <TagIcon />
                        <Typography>{channel.name}</Typography>
                    </Box>
                </Link>
            )
        ))}

        <Modal
            open={openCreateChannelModal}
            onClose={handleCloseCreateChannelModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    New Channel
                </Typography>
                {/* <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                    </Typography> */}
                <form onSubmit={handleCreateChannelSubmit(onCreateChannelSubmit)}>
                    <TextField
                        margin="normal"
                        fullWidth
                        id="name"
                        label="Channel name"
                        autoComplete="email"
                        autoFocus
                        error={!!createChannelErrors.name}
                        helperText={createChannelErrors.name?.message}
                        {...registerCreateChannel("name")}
                    />
                    <FormControl fullWidth>
                        <InputLabel id="channel-type-select-lable">Channel type</InputLabel>
                        <Select
                            labelId="channel-type-select-lable"
                            id="demo-simple-select"
                            name="type"
                            value={createChannelType}
                            onChange={onChannelTypeChange}
                            label="Channel type"
                        >
                            <MenuItem value={"text"}>Text channel</MenuItem>
                            <MenuItem value={"voice"}>Voice channel</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        type='submit'
                        color='primary'
                        variant="contained"
                        fullWidth
                    >Create</Button>
                </form>
            </Box>
        </Modal>
    </Box>
}