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
import { CreateGuildRoles, GetGuildRoles } from "../../services/guild.service";
import { useNavigate } from "react-router-dom";
import { Avatar, Chip, Divider, FormControl, FormControlLabel, InputLabel, Select, Switch, TextField } from "@mui/material";
import { GenerateInvite, GetInvitesByGuildId } from "../../services/invite.service";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AppDispatch, RootState } from "../../store";
import { deleteGuild, fetchGuildById, transferOwnership, updateGuild } from "../../redux/slices/guildsSlice";

interface GuildInfoProps {
    guildId: string;
}

const updateGuildSchema = yup.object().shape({
    name: yup.string(),
    enableMemberVerification: yup.boolean(),
    enableJoinLog: yup.boolean(),
    canGenerateInvite: yup.boolean()
});

export default function GuildSettingsDropdown({ guildId }: GuildInfoProps) {
    const user = useSelector((state: any) => state.user.user);
    const { guilds, loading, error } = useSelector((state: RootState) => state.guilds);
    const [guild, setGuild] = React.useState<Guild>();
    const dispatch = useDispatch<AppDispatch>();
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
    const [openCreateRoleDialog, setOpenCreateRoleDialog] = React.useState(false);
    const [newRole, setNewRole] = React.useState({
        name: "",
        color: "#000000",
        permissionCodes: [],
        displayType: "none",
    });
    const [openDisbandDialog, setOpenDisbandDialog] = React.useState(false);
    const [openTransferOwnershipDialog, setOpenTransferOwnershipDialog] = React.useState(false);
    const [members, setMembers] = React.useState<Member[]>([]);
    const [channels, setChannels] = React.useState<ChannelPartial[]>([]);
    const [selectedMemberId, setSelectedMemberId] = React.useState<string>('');
    const [selectedChannelId, setSelectedChannelId] = React.useState<string>('');
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const fetchGuild = async () => {
        try {
            const result = await dispatch(fetchGuildById(guildId)).unwrap();
            setGuild(result);
        } catch (error: any) {
            enqueueSnackbar(error.message, { variant: 'error' });
        }
    }

    const fetchInvites = async () => {
        if (guild) {
            const result = await GetInvitesByGuildId(guild._id);
            setInvites(result);
        }
    }

    const fetchMembers = async () => {
        try {
            if (guild) {
                setMembers(guild.members);
            }
        } catch (error: any) {
            enqueueSnackbar(error.message, { variant: 'error' });
        }
    };
    const fetchChannels = async () => {
        try {
            if (guild) {
                setChannels(guild.channels);
            }
        } catch (error: any) {
            enqueueSnackbar(error.message, { variant: 'error' });
        }
    }

    const fetchRoles = async () => {
        if (guild) {
            const result = await GetGuildRoles(guild._id);
            setRoles(result);
        }
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
            await dispatch(transferOwnership({
                guildId: guild?._id,
                newOwnerId: selectedMemberId
            })).unwrap();
            enqueueSnackbar('Ownership transferred successfully!', { variant: 'success' });
            await fetchGuild();
            handleCloseTransferOwnershipDialog();
        } catch (error: any) {
            console.error(error);
            enqueueSnackbar(error, { variant: 'error' });
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
                formData.append('image', guildImage);
            }
            formData.append('name', data.name);
            formData.append('logChannel', selectedChannelId);
            formData.append('enableMemberVerification', data.enableMemberVerification);
            formData.append('enableJoinLog', data.enableJoinLog);
            formData.append('canGenerateInvite', data.canGenerateInvite);

            dispatch(updateGuild({
                guildId: guild?._id,
                data: formData
            }))
            enqueueSnackbar('Guild updated successfully!', { variant: 'success' });
            handleCloseEditDialog();
        } catch (error: any) {
            console.error(error);
            enqueueSnackbar(error.message, { variant: 'error' });
        }
    };

    const onCreateInvite = async () => {
        try {
            if (guild) {
                const result = await GenerateInvite(guild._id);
                setInvites((prevInvites) => [...prevInvites, result]);
                enqueueSnackbar('Invite created successfully!', { variant: 'success' });
            }
        }
        catch (error: any) {
            console.error(error);
            enqueueSnackbar(`${error.message}`, { variant: "error" });
        }
    }
    const handleCreateRole = async () => {
        try {
            await CreateGuildRoles(guildId, newRole);
            fetchRoles(); // Refresh roles list
            setOpenCreateRoleDialog(false);
        } catch (error) {
            console.error(error);
        }
    };
    const disbandGuild = async () => {
        try {
            dispatch(deleteGuild(guildId));
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
        fetchGuild();
    }, [guildId]);
    React.useEffect(() => {
        if (guildImage) {
            const objectUrl = URL.createObjectURL(guildImage);
            setGuildImageSrc(objectUrl);

            // Clean up the object URL when the component unmounts or the file changes
            return () => URL.revokeObjectURL(objectUrl);
        } else if (guild && guild.image) {
            setGuildImageSrc(guild.image);
        }
    }, [guild, guildImage])

    const guildActions = [
        {
            label: "Edit guild profile",
            icon: <EditIcon />,
            onClick: handleClickOpenEditDialog,
            ownerOnly: true,
        },
        {
            label: "Transfer Ownership",
            icon: <GroupIcon />,
            onClick: handleClickOpenTransferOwnershipDialog,
            ownerOnly: true,
        },
        {
            label: "Invite people",
            icon: <AddLinkIcon />,
            onClick: handleClickOpenInviteDialog,
            ownerOnly: false,
        },
        {
            label: "Manage roles",
            icon: <ShieldIcon />,
            onClick: handleClickOpenManageRoleDialog,
            ownerOnly: false,
        },
    ];


    return <>
        {guild && (
            <Box>
                <Accordion
                    square={true}
                    defaultExpanded
                    sx={{
                        backgroundColor: "var(--color-background)",
                        color: "var(--color-foreground)",
                    }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: "var(--color-foreground)" }} />}
                    >
                        <Typography variant="button" fontWeight="bold">Guild Actions</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <MenuList>
                            {guildActions.map((action, index) => (
                                (!action.ownerOnly || guild.owner === user._id) && (
                                    <MenuItem key={index} onClick={action.onClick}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                            }}>
                                            <ListItemIcon sx={{
                                                color: "var(--color-foreground)",
                                            }}>{action.icon}</ListItemIcon>
                                            <ListItemText>{action.label}</ListItemText>
                                        </Box>
                                    </MenuItem>
                                )
                            ))}
                            <MenuItem onClick={guild.owner === user._id ? handleClickOpenDisbandDialog : undefined}>
                                {guild.owner === user._id ? (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <ListItemIcon sx={{
                                            color: "var(--color-foreground)",
                                        }}>
                                            <DeleteForeverIcon />
                                        </ListItemIcon>
                                        <ListItemText>Disband guild</ListItemText>
                                    </Box>
                                ) : (
                                    <>
                                        <ListItemIcon sx={{
                                            color: "var(--color-foreground)",
                                        }}>
                                            <LogoutIcon />
                                        </ListItemIcon>
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
                                    <Chip key={invite._id} label={invite.string} />
                                ))}
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseInviteDialog}>Done</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openManageRoleDialog} keepMounted onClose={() => setOpenManageRoleDialog(false)}>
                    <DialogTitle>Manage Roles</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                            {roles && roles.map((role: Role) => (
                                <Box key={role._id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Box sx={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: role.color, flexShrink: 0 }} />
                                    <Typography sx={{ fontWeight: "bold", color: "#000000" }}>{role.name}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenCreateRoleDialog(true)}>Create Role</Button>
                        <Button onClick={() => setOpenManageRoleDialog(false)}>Done</Button>
                    </DialogActions>
                </Dialog>

                {/* Create Role Modal */}
                <Dialog open={openCreateRoleDialog} onClose={() => setOpenCreateRoleDialog(false)}>
                    <DialogTitle>Create New Role</DialogTitle>
                    <DialogContent>
                        <TextField label="Role Name" fullWidth margin="dense" value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} />
                        <TextField type="color" fullWidth margin="dense" value={newRole.color} onChange={(e) => setNewRole({ ...newRole, color: e.target.value })} />
                        <Select
                            fullWidth
                            value={newRole.displayType}
                            onChange={(e) => setNewRole({ ...newRole, displayType: e.target.value })}
                            margin="dense"
                        >
                            <MenuItem value="none">None</MenuItem>
                            <MenuItem value="only_icon">Only Icon</MenuItem>
                            <MenuItem value="standard">Standard</MenuItem>
                            <MenuItem value="combined">Combined</MenuItem>
                            <MenuItem value="seperate">Separate</MenuItem>
                        </Select>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenCreateRoleDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateRole} color="primary">Create</Button>
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
                                    <MenuItem key={member.memberId._id} value={member.memberId._id}>
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
        )}
    </>
}