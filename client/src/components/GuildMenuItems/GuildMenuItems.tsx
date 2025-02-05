import React from "react";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EditIcon from '@mui/icons-material/Edit';
import AddLinkIcon from '@mui/icons-material/AddLink';
import ShieldIcon from '@mui/icons-material/Shield';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LogoutIcon from '@mui/icons-material/Logout';
import TransferOwnershipIcon from '@mui/icons-material/TransferWithinAStation';
import { Guild } from "../../shared/guild.interface";

interface GuildMenuItemProps {
    icon: React.ReactNode;
    text: string;
    onClick: () => void;
}

const GuildMenuItem: React.FC<GuildMenuItemProps> = ({ icon, text, onClick }) => (
    <MenuItem onClick={onClick}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText>{text}</ListItemText>
    </MenuItem>
);

interface GuildMenuItemsProps {
    guild: Guild;
    user: any;
    onEdit: () => void;
    onInvite: () => void;
    onManageRoles: () => void;
    onDisband: () => void;
    onLeave: () => void;
    onTransferOwnership: () => void;
}

export const GuildMenuItems: React.FC<GuildMenuItemsProps> = ({
    guild,
    user,
    onEdit,
    onInvite,
    onManageRoles,
    onDisband,
    onLeave,
    onTransferOwnership,
}) => (
    <>
        <GuildMenuItem icon={<EditIcon />} text="Edit guild profile" onClick={onEdit} />
        <GuildMenuItem icon={<AddLinkIcon />} text="Invite people" onClick={onInvite} />
        <GuildMenuItem icon={<ShieldIcon />} text="Manage roles" onClick={onManageRoles} />
        {guild.owner === user._id ? (
            <>
                <GuildMenuItem icon={<DeleteForeverIcon />} text="Disband guild" onClick={onDisband} />
                <GuildMenuItem icon={<TransferOwnershipIcon />} text="Transfer Ownership" onClick={onTransferOwnership} />
            </>
        ) : (
            <GuildMenuItem icon={<LogoutIcon />} text="Leave guild" onClick={onLeave} />
        )}
    </>
);