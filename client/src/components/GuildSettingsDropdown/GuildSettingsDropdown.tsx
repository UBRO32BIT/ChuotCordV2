import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LogoutIcon from '@mui/icons-material/Logout';
import AddLinkIcon from '@mui/icons-material/AddLink';
import ShieldIcon from '@mui/icons-material/Shield';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import GroupIcon from '@mui/icons-material/Group';
import MenuList from "@mui/material/MenuList";
import { ChannelPartial, Guild, InvitePartial, Member, Role } from "../../shared/guild.interface";
import { useDispatch, useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import React, { ChangeEvent } from "react";
import * as yup from "yup";
import { useSnackbar } from "notistack";
import { DeleteGuild, GetGuildRoles, TransferOwnership, UpdateGuild } from "../../services/guild.service";
import { removeGuild } from "../../redux/slices/guildsSlice";
import { useNavigate } from "react-router-dom";
import { Avatar, Chip, Divider, FormControl, FormControlLabel, InputLabel, Select, Switch, TextField } from "@mui/material";
import { GenerateInvite, GetInvitesByGuildId } from "../../services/invite.service";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

interface GuildInfoProps {
    guild: Guild;
    updateGuild: (updatedAttributes: Partial<Guild>) => void;
}

const updateGuildSchema = yup.object().shape({
    name: yup.string(),
    enableMemberVerification: yup.boolean(),
    enableJoinLog: yup.boolean(),
    canGenerateInvite: yup.boolean()
});

export default function GuildSettingsDropdown({ guild, updateGuild }: GuildInfoProps) {
    const user = useSelector((state: any) => state.user.user);
    const {
        register: registerUpdateGuild,
        handleSubmit: handleUpdateGuild,
        setValue: setUpdateGuildValue,
        formState: { errors: updateGuildErrors }
    } = useForm({
        resolver: yupResolver(updateGuildSchema),
    })
    const [invites, setInvites] = React.useState<InvitePartial[]>([]);
    const [roles, setRoles] = React.useState<Role[]>([]);
    const [guildImage, setGuildImage] = React.useState<File>();
    const [guildImageSrc, setGuildImageSrc] = React.useState<string>('');
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [openInviteDialog, setOpenInviteDialog] = React.useState(false);
    const [openManageRoleDialog, setOpenManageRoleDialog] = React.useState(false);
    const [openDisbandDialog, setOpenDisbandDialog] = React.useState(false);
    const [openTransferOwnershipDialog, setOpenTransferOwnershipDialog] = React.useState(false);
    const [members, setMembers] = React.useState<Member[]>([]);
    const [channels, setChannels] = React.useState<ChannelPartial[]>([]);
    const [selectedMemberId, setSelectedMemberId] = React.useState<string>('');
    const [selectedChannelId, setSelectedChannelId] = React.useState<string>('');
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fetchInvites = async () => {
        const result = await GetInvitesByGuildId(guild._id);
        setInvites(result);
    }

    const fetchMembers = async () => {
        try {
            setMembers(guild.members);
        } catch (error: any) {
            enqueueSnackbar(error.message, { variant: 'error' });
        }
    };
    const fetchChannels = async () => {
        try {
            setChannels(guild.channels);
        } catch (error: any) {
            enqueueSnackbar(error.message, { variant: 'error' });
        }
    }

    const fetchRoles = async () => {
        const result = await GetGuildRoles(guild._id);
        setRoles(result);
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setGuildImage(e.target.files[0]);
        }
    };

    const handleTransferOwnership = async () => {
        if (!selectedMemberId) {
            enqueueSnackbar('Please select a member to transfer ownership.', { variant: 'warning' });
            return;
        }
        try {
            await TransferOwnership(guild._id, selectedMemberId);
            enqueueSnackbar('Ownership transferred successfully!', { variant: 'success' });
            handleCloseTransferOwnershipDialog();
        } catch (error: any) {
            console.error(error);
            enqueueSnackbar(error.message, { variant: 'error' });
        }
    };

    const handleClickOpenEditDialog = async () => {
        await fetchChannels();
        setOpenEditDialog(true);
    }
    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
    }
    const handleClickOpenDisbandDialog = () => {
        setOpenDisbandDialog(true);
    };
    const handleCloseDisbandDialog = () => {
        setOpenDisbandDialog(false);
    };
    const handleClickOpenInviteDialog = async () => {
        await fetchInvites();
        setOpenInviteDialog(true);
    };
    const handleCloseInviteDialog = () => {
        setOpenInviteDialog(false);
    };
    const handleClickOpenManageRoleDialog = async () => {
        setOpenManageRoleDialog(true);
        await fetchRoles();
    }
    const handleClickOpenTransferOwnershipDialog = async () => {
        await fetchMembers();
        setOpenTransferOwnershipDialog(true);
    };

    const handleCloseTransferOwnershipDialog = () => {
        setOpenTransferOwnershipDialog(false);
    };

    const handleConfirmTransferOwnership = async () => {
        await handleTransferOwnership();
        handleCloseTransferOwnershipDialog();
    };

    const onUpdateGuild = async (data: any) => {
        try {
            const formData = new FormData();
            if (guildImage) {
                console.log("hello");
                formData.append('image', guildImage);
            }
            formData.append('name', data.name);
            formData.append('logChannel', selectedChannelId);
            formData.append('enableMemberVerification', data.enableMemberVerification);
            formData.append('enableJoinLog', data.enableJoinLog);
            formData.append('canGenerateInvite', data.canGenerateInvite);

            const result = await UpdateGuild(guild._id, formData);
            updateGuild(result); // Update UI state
            enqueueSnackbar('Guild updated successfully!', { variant: 'success' });
            handleCloseEditDialog();
        } catch (error: any) {
            console.error(error);
            enqueueSnackbar(error.message, { variant: 'error' });
        }
    };

    const onCreateInvite = async () => {
        try {
            const result = await GenerateInvite(guild._id);
            setInvites((prevInvites) => [...prevInvites, result]);
            enqueueSnackbar('Invite created successfully!', { variant: 'success' });
        }
        catch (error: any) {
            console.error(error);
            enqueueSnackbar(`${error.message}`, { variant: "error" });
        }
    }
    const disbandGuild = async () => {
        try {
            const result = await DeleteGuild(guild._id);
            dispatch(removeGuild(guild._id));
            handleCloseDisbandDialog();
            enqueueSnackbar(`Guild deleted successfully.`, { variant: "success" });
            navigate("/chat");
        }
        catch (error: any) {
            console.log(error);
            enqueueSnackbar(`${error.message}`, { variant: "error" });
        }
    }
    React.useEffect(() => {
        console.log(guildImage);
        if (guildImage) {
            const objectUrl = URL.createObjectURL(guildImage);
            setGuildImageSrc(objectUrl);

            // Clean up the object URL when the component unmounts or the file changes
            return () => URL.revokeObjectURL(objectUrl);
        } else if (guild.image) {
            setGuildImageSrc(guild.image);
        }
    }, [guild, guildImage])
    React.useEffect(() => {
        console.log(guild?.name);
    }, [guild])
    return <Box>
        <Accordion
            square={true}
            defaultExpanded>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
            >
                <Typography variant="button" fontWeight="bold">Guild Actions</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{
                m: 0,
                p: 0,
            }}>
                <MenuList>
                    {guild.owner === user._id && (
                        <MenuItem>
                            <Box
                                onClick={handleClickOpenEditDialog}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0,
                                }}>
                                <ListItemIcon><EditIcon /></ListItemIcon>
                                <ListItemText>Edit guild profile</ListItemText>
                            </Box>
                        </MenuItem>
                    )}
                    {guild.owner === user._id && (
                        <MenuItem>
                            <Box
                                onClick={handleClickOpenTransferOwnershipDialog}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0,
                                }}>
                                <ListItemIcon><GroupIcon /></ListItemIcon>
                                <ListItemText>Transfer Ownership</ListItemText>
                            </Box>
                        </MenuItem>
                    )}
                    <MenuItem>
                        <Box onClick={handleClickOpenInviteDialog}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0,
                            }}>
                            <ListItemIcon><AddLinkIcon /></ListItemIcon>
                            <ListItemText>Invite people</ListItemText>
                        </Box>
                    </MenuItem>
                    <MenuItem>
                        <Box onClick={handleClickOpenManageRoleDialog}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0,
                            }}>
                            <ListItemIcon><ShieldIcon /></ListItemIcon>
                            <ListItemText>Manage roles</ListItemText>
                        </Box>
                    </MenuItem>
                    <MenuItem>
                        {guild && guild.owner === user._id ? (
                            <Box
                                onClick={handleClickOpenDisbandDialog}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0,
                                }}>
                                <ListItemIcon><DeleteForeverIcon /></ListItemIcon>
                                <ListItemText>Disband guild</ListItemText>
                            </Box>
                        ) : (
                            <>
                                <ListItemIcon><LogoutIcon /></ListItemIcon>
                                <ListItemText>Leave guild</ListItemText>
                            </>
                        )}
                    </MenuItem>
                </MenuList>
            </AccordionDetails>
        </Accordion>

        <Dialog
            open={openDisbandDialog}
            keepMounted
            onClose={handleCloseDisbandDialog}
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle>Disband Confirmation</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    Are you sure to disband {guild?.name}? This action cannot be reverted
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={disbandGuild}>Yes</Button>
                <Button onClick={handleCloseDisbandDialog}>No</Button>
            </DialogActions>
        </Dialog>

        <Dialog
            open={openInviteDialog}
            keepMounted
            onClose={handleCloseInviteDialog}
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle>Manage invites</DialogTitle>
            <DialogContent>
                <Box>
                    <Button variant="contained"
                        color="secondary"
                        fullWidth
                        sx={{
                            gap: 1,
                        }}>
                        <Typography variant="button" onClick={onCreateInvite}>Generate new Invite</Typography>
                    </Button>
                </Box>
                <Divider />
                <Box sx={{
                    py: 1
                }}>
                    <Typography>Invites</Typography>
                    <Box>
                        {invites && invites.map((invite) => (
                            <Chip label={invite.string} />
                        ))}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseInviteDialog}>Done</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={openManageRoleDialog} keepMounted onClose={() => setOpenManageRoleDialog(false)}>
            <DialogTitle>Manage roles</DialogTitle>
            <DialogContent>
                <Box>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                    }}>
                        {roles && roles.map((role) => (
                            <Box
                                key={role._id}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1, // Space between the circle and the text
                                }}
                            >
                                {/* Circle representing the role color */}
                                <Box
                                    sx={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        backgroundColor: role.color,
                                        flexShrink: 0, // Prevent the circle from shrinking
                                    }}
                                />
                                {/* Role name */}
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        color: "#000000", // Customize text color if needed
                                    }}
                                >
                                    {role.name}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenManageRoleDialog(false)}>Done</Button>
            </DialogActions>
        </Dialog>

        <Dialog
            open={openEditDialog}
            keepMounted
            onClose={handleCloseEditDialog}
            aria-describedby="alert-dialog-slide-description"
            key={guild._id}
        >
            <DialogTitle>Edit Guild</DialogTitle>
            <form onSubmit={handleUpdateGuild(onUpdateGuild)}>
                <DialogContent>
                    <Box sx={{
                        py: 1,
                        rowGap: 1,
                    }}>
                        <Avatar
                            src={guildImageSrc}
                            alt={guild.name}
                            sx={{ width: 64, height: 64 }}
                        />
                        <Box sx={{
                            pb: 3
                        }}>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                            <div>{guildImage && `${guildImage.name} - ${guildImage.type}`}</div>
                        </Box>
                        <TextField
                            id="name"
                            label="Guild Name"
                            fullWidth
                            variant="outlined"
                            error={!!updateGuildErrors.name}
                            helperText={updateGuildErrors.name?.message}
                            {...registerUpdateGuild("name")}
                            defaultValue={guild.name}
                        />
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Logs Channel</InputLabel>
                            <Select
                                value={selectedChannelId}
                                onChange={(e) => setSelectedChannelId(e.target.value)}
                            >
                                {channels.map((channel) => (
                                    <MenuItem key={channel._id} value={channel._id}>
                                        {channel.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControlLabel
                            control={<Switch {...registerUpdateGuild("enableMemberVerification")} defaultChecked={guild.enableMemberVerification} />}
                            label="Enable Member Verification"
                        />

                        <FormControlLabel
                            control={<Switch {...registerUpdateGuild("enableJoinLog")} defaultChecked={guild.enableJoinLog} />}
                            label="Enable Join Log"
                        />

                        <FormControlLabel
                            control={<Switch {...registerUpdateGuild("canGenerateInvite")} defaultChecked={guild.canGenerateInvite} />}
                            label="Can Generate Invite"
                        />
                    </Box>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog}>Cancel</Button>
                    <Button type="submit" color="warning">Submit</Button>
                </DialogActions>
            </form>
        </Dialog>
        <Dialog
            open={openTransferOwnershipDialog}
            keepMounted
            onClose={handleCloseTransferOwnershipDialog}
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle>Transfer Ownership</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    Select a member to transfer ownership of {guild?.name}. This action cannot be undone.
                </DialogContentText>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Select Member</InputLabel>
                    <Select
                        value={selectedMemberId}
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                    >
                        {members.map((member) => (
                            <MenuItem key={member._id} value={member._id}>
                                {member.memberId.username}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseTransferOwnershipDialog}>Cancel</Button>
                <Button onClick={handleTransferOwnership} disabled={!selectedMemberId} color="warning">
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    </Box>
}