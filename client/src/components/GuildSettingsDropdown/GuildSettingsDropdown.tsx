import React, { ChangeEvent } from "react";
import * as yup from "yup";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { ChannelPartial, Guild, InvitePartial, Member, Role } from "../../shared/guild.interface";
import { CreateGuildRoles, GetGuildRoles } from "../../services/guild.service";
import { GenerateInvite, GetInvitesByGuildId } from "../../services/invite.service";
import { deleteGuild, fetchGuildById, transferOwnership, updateGuild } from "../../redux/slices/guildsSlice";
import { ChevronDown, Edit, Users, Link, Shield, Trash2, LogOut, Plus, X } from 'lucide-react';
import { INVITE_EXPIRATIONS } from "../../enums/inviteExpiration";

interface GuildInfoProps {
  guildId: string;
}

const updateGuildSchema = yup.object().shape({
  name: yup.string().required("Guild name is required"),
  enableMemberVerification: yup.boolean().default(false),
  enableJoinLog: yup.boolean().default(false),
  canGenerateInvite: yup.boolean().default(false),
});

export default function GuildSettingsDropdown({ guildId }: GuildInfoProps) {
  const user = useSelector((state: any) => state.user.user);
  const { guilds, loading, error } = useSelector((state: RootState) => state.guilds);
  const [guild, setGuild] = React.useState<Guild>();
  const dispatch = useDispatch<AppDispatch>();
  const { register: registerUpdateGuild, handleSubmit: handleUpdateGuild, setValue: setUpdateGuildValue, formState: { errors: updateGuildErrors } } = useForm({
    resolver: yupResolver(updateGuildSchema),
  });
  const [invites, setInvites] = React.useState<InvitePartial[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [guildImage, setGuildImage] = React.useState<File>();
  const [guildImageSrc, setGuildImageSrc] = React.useState<string>('');
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  
  const [openInviteDialog, setOpenInviteDialog] = React.useState(false);
  const [selectedExpiration, setSelectedExpiration] = React.useState<string>("1h");

  const [openManageRoleDialog, setOpenManageRoleDialog] = React.useState(false);
  const [openCreateRoleDialog, setOpenCreateRoleDialog] = React.useState(false);
  const [newRole, setNewRole] = React.useState({ name: "", color: "#000000", permissionCodes: [], displayType: "none" });

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
  };

  const fetchInvites = async () => {
    if (guild) {
      const result = await GetInvitesByGuildId(guild._id);
      setInvites(result);
    }
  };

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
  };

  const fetchRoles = async () => {
    if (guild) {
      const result = await GetGuildRoles(guild._id);
      setRoles(result);
    }
  };

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
      await dispatch(transferOwnership({ guildId: guild?._id, newOwnerId: selectedMemberId })).unwrap();
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
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

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
  };

  const handleCloseManageRoleDialog = () => {
    setOpenManageRoleDialog(false);
  };

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
    console.log(data)
    try {
        const formData = new FormData();

        if (guildImage) {
            formData.append('image', guildImage);
        }
        
        formData.append('name', data.name);
        
        formData.append('enableMemberVerification', String(!!data.enableMemberVerification));
        formData.append('enableJoinLog', String(!!data.enableJoinLog));
        formData.append('canGenerateInvite', String(!!data.canGenerateInvite));
        
        // Only append logChannel if selected
        if (selectedChannelId) {
            formData.append('logChannel', selectedChannelId);
        }

        await dispatch(updateGuild({
          guildId: guildId,
          formData
        })).unwrap();

        enqueueSnackbar('Guild updated successfully!', { variant: 'success' });
        handleCloseEditDialog();
        await fetchGuild();
    } catch (error: any) {
        console.error(error);
        enqueueSnackbar(error.message || 'Failed to update guild', { variant: 'error' });
    }
  };

  const onCreateInvite = async () => {
    try {
      if (guild) {
        const result = await GenerateInvite(guild._id, selectedExpiration);
        setInvites((prevInvites) => [...prevInvites, result]);
        enqueueSnackbar('Invite created successfully!', { variant: 'success' });
      }
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handleCreateRole = async () => {
    try {
      await CreateGuildRoles(guildId, newRole);
      fetchRoles();
      setOpenCreateRoleDialog(false);
    } catch (error) {
      console.error(error);
    }
  };

  const disbandGuild = async () => {
    try {
      dispatch(deleteGuild(guildId));
      handleCloseDisbandDialog();
      enqueueSnackbar('Guild deleted successfully.', { variant: 'success' });
      navigate("/chat");
    } catch (error: any) {
      console.log(error);
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  React.useEffect(() => {
    fetchGuild();
  }, [guildId]);

  React.useEffect(() => {
    if (guildImage) {
      const objectUrl = URL.createObjectURL(guildImage);
      setGuildImageSrc(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (guild && guild.image) {
      setGuildImageSrc(guild.image);
    }
  }, [guild, guildImage]);

  const guildActions = [
    {
      label: "Edit guild profile",
      icon: <Edit className="w-5 h-5" />,
      onClick: handleClickOpenEditDialog,
      ownerOnly: true,
    },
    {
      label: "Transfer Ownership",
      icon: <Users className="w-5 h-5" />,
      onClick: handleClickOpenTransferOwnershipDialog,
      ownerOnly: true,
    },
    {
      label: "Invite people",
      icon: <Link className="w-5 h-5" />,
      onClick: handleClickOpenInviteDialog,
      ownerOnly: false,
    },
    {
      label: "Manage roles",
      icon: <Shield className="w-5 h-5" />,
      onClick: handleClickOpenManageRoleDialog,
      ownerOnly: false,
    },
  ];

  return (
    <>
      {guild && (
        <div className="w-full">
          <div className="rounded-lg bg-[var(--guild-sidebar-background)]">
            <div className="accordion">
              <div className="p-4 flex items-center justify-between cursor-pointer">
                <span className="font-bold text-[var(--guild-sidebar-primary-text)]">Guild Actions</span>
                <ChevronDown className="w-5 h-5 text-[var(--icon-primary)]" />
              </div>
              <div className="p-4">
                <div className="space-y-1">
                  {guildActions.map((action, index) => (
                    (!action.ownerOnly || guild.owner === user._id) && (
                      <button
                        key={index}
                        onClick={action.onClick}
                        className="w-full px-4 py-2 flex items-center gap-3 hover:bg-[var(--dropdown-hover)] rounded-lg text-[var(--guild-sidebar-primary-text)]"
                      >
                        {action.icon}
                        <span>{action.label}</span>
                      </button>
                    )
                  ))}
                  <button
                    onClick={guild.owner === user._id ? handleClickOpenDisbandDialog : undefined}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-[var(--dropdown-hover)] rounded-lg text-[var(--guild-sidebar-primary-text)]"
                  >
                    {guild.owner === user._id ? (
                      <>
                        <Trash2 className="w-5 h-5" />
                        <span>Disband guild</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="w-5 h-5" />
                        <span>Leave guild</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Disband Dialog */}
          {openDisbandDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-[var(--dialog-bg)] rounded-lg p-6 max-w-md w-full border-[var(--dialog-border)]">
                <h2 className="text-xl font-bold mb-4 text-[var(--dialog-text)]">Disband Confirmation</h2>
                <p className="mb-6 text-[var(--dialog-text)]">
                  Are you sure to disband {guild?.name}? This action cannot be reverted
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={disbandGuild}
                    className="px-4 py-2 rounded bg-[var(--button-danger)] hover:bg-[var(--button-danger-hover)] text-white"
                  >
                    Yes
                  </button>
                  <button
                    onClick={handleCloseDisbandDialog}
                    className="px-4 py-2 rounded bg-[var(--button-secondary)] hover:bg-[var(--button-secondary-hover)] text-[var(--dialog-text)]"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Invite Dialog */}
          {openInviteDialog && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" >
              <div className="bg-[var(--dialog-bg)] rounded-lg p-6 max-w-md w-full border-[var(--dialog-border)]">
                <h2 className="text-xl font-bold mb-4 text-[var(--dialog-text)]">Manage Invites</h2>

                {/* Expiration Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--dialog-text)] mb-1">
                    Expiration
                  </label>
                  <select
                    value={selectedExpiration}
                    onChange={(e) => setSelectedExpiration(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--input-background)] border border-[var(--input-border)] rounded text-[var(--input-color)]"
                  >
                    {INVITE_EXPIRATIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={onCreateInvite}
                  className="w-full px-4 py-2 bg-[var(--button-primary)] text-white rounded hover:bg-[var(--button-primary-hover)] flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Generate new Invite
                </button>

                <div className="mt-4">
                  <h3 className="font-medium mb-2 text-[var(--dialog-text)]">Invites</h3>
                  <div className="flex flex-wrap gap-2">
                    {invites?.map((invite) => (
                      <span
                        key={invite._id}
                        className="px-3 py-1 bg-[var(--input-background)] rounded-full text-sm text-[var(--input-color)]"
                      >
                        {invite.string} ({invite.expiration})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleCloseInviteDialog}
                    className="px-4 py-2 bg-[var(--button-secondary)] rounded hover:bg-[var(--button-secondary-hover)] text-[var(--dialog-text)]"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Manage Roles Dialog */}
          {openManageRoleDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-[var(--dialog-bg)] rounded-lg p-6 max-w-md w-full border-[var(--dialog-border)]">
                <h2 className="text-xl font-bold mb-4 text-[var(--dialog-text)]">Manage Roles</h2>
                <div className="space-y-2">
                  {roles?.map((role: Role) => (
                    <div key={role._id} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color }} />
                      <span className="font-medium text-[var(--dialog-text)]">{role.name}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setOpenCreateRoleDialog(true)}
                    className="px-4 py-2 bg-[var(--button-primary)] text-white rounded hover:bg-[var(--button-primary-hover)]"
                  >
                    Create Role
                  </button>
                  <button
                    className="px-4 py-2 bg-[var(--button-secondary)] rounded hover:bg-[var(--button-secondary-hover)] text-[var(--dialog-text)]"
                    onClick={handleCloseManageRoleDialog}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Role Modal */}
          {openCreateRoleDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="relative w-full max-w-md rounded-lg bg-[var(--dialog-bg)] p-6 shadow-lg border-[var(--dialog-border)]">
                <button
                  onClick={() => setOpenCreateRoleDialog(false)}
                  className="absolute right-4 top-4 text-[var(--dialog-text)] hover:text-[var(--input-focus)]"
                >
                  <X size={20} />
                </button>
                <h2 className="text-xl font-bold text-[var(--dialog-text)]">Create New Role</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--dialog-text)]">Role Name</label>
                    <input
                      type="text"
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-[var(--input-color)] shadow-sm focus:border-[var(--input-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--input-focus)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--dialog-text)]">Role Color</label>
                    <input
                      type="color"
                      value={newRole.color}
                      onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                      className="mt-1 h-10 w-full rounded-md border-[var(--input-border)] bg-[var(--input-background)] p-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--dialog-text)]">Display Type</label>
                    <select
                      value={newRole.displayType}
                      onChange={(e) => setNewRole({ ...newRole, displayType: e.target.value })}
                      className="mt-1 block w-full rounded-md border-[var(--input-border)] bg-[var(--input-background)] py-2 pl-3 pr-10 text-[var(--input-color)] shadow-sm focus:border-[var(--input-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--input-focus)]"
                    >
                      <option value="none">None</option>
                      <option value="only_icon">Only Icon</option>
                      <option value="standard">Standard</option>
                      <option value="combined">Combined</option>
                      <option value="seperate">Separate</option>
                    </select>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setOpenCreateRoleDialog(false)}
                      className="rounded-md border-[var(--input-border)] bg-[var(--button-secondary)] px-4 py-2 text-sm font-medium text-[var(--dialog-text)] hover:bg-[var(--button-secondary-hover)]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateRole}
                      className="flex items-center rounded-md bg-[var(--button-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--button-primary-hover)]"
                    >
                      <Plus size={16} className="mr-2" />
                      Create Role
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Guild Dialog */}
          {openEditDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-[var(--dialog-bg)] rounded-lg p-6 max-w-md w-full border-[var(--dialog-border)]">
                <h2 className="text-xl font-bold mb-4 text-[var(--dialog-text)]">Edit Guild</h2>
                <form onSubmit={handleUpdateGuild(onUpdateGuild)}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <img src={guildImageSrc} alt={guild.name} className="w-16 h-16 rounded-full object-cover" />
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="text-sm text-[var(--input-color)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--dialog-text)]">Guild Name</label>
                      <input
                        type="text"
                        {...registerUpdateGuild("name")}
                        defaultValue={guild.name}
                        className="w-full px-3 py-2 border-[var(--input-border)] bg-[var(--input-background)] rounded-md text-[var(--input-color)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--dialog-text)]">Logs Channel</label>
                      <select
                        value={selectedChannelId}
                        onChange={(e) => setSelectedChannelId(e.target.value)}
                        className="w-full px-3 py-2 border-[var(--input-border)] bg-[var(--input-background)] rounded-md text-[var(--input-color)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus)]"
                      >
                        {channels.map((channel) => (
                          <option key={channel._id} value={channel._id}>
                            {channel.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...registerUpdateGuild("enableMemberVerification")}
                        defaultChecked={guild.enableMemberVerification}
                        className="rounded border-[var(--input-border)] text-[var(--input-focus)] focus:ring-[var(--input-focus)]"
                      />
                      <span className="text-[var(--dialog-text)]">Enable Member Verification</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...registerUpdateGuild("enableJoinLog")}
                        defaultChecked={guild.enableJoinLog}
                        className="rounded border-[var(--input-border)] text-[var(--input-focus)] focus:ring-[var(--input-focus)]"
                      />
                      <span className="text-[var(--dialog-text)]">Enable Join Log</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...registerUpdateGuild("canGenerateInvite")}
                        defaultChecked={guild.canGenerateInvite}
                        className="rounded border-[var(--input-border)] text-[var(--input-focus)] focus:ring-[var(--input-focus)]"
                      />
                      <span className="text-[var(--dialog-text)]">Can Generate Invite</span>
                    </label>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseEditDialog}
                      className="px-4 py-2 bg-[var(--button-secondary)] rounded hover:bg-[var(--button-secondary-hover)] text-[var(--dialog-text)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[var(--button-primary)] text-white rounded hover:bg-[var(--button-primary-hover)]"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Transfer Ownership Dialog */}
          {openTransferOwnershipDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-[var(--dialog-bg)] rounded-lg p-6 max-w-md w-full border-[var(--dialog-border)]">
                <h2 className="text-xl font-bold mb-4 text-[var(--dialog-text)]">Transfer Ownership</h2>
                <p className="mb-4 text-[var(--dialog-text)]">
                  Select a member to transfer ownership of {guild?.name}. This action cannot be undone.
                </p>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 border-[var(--input-border)] bg-[var(--input-background)] rounded-md text-[var(--input-color)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus)]"
                >
                  <option value="">Select a member</option>
                  {members.map((member) => (
                    <option key={member.memberId._id} value={member.memberId._id}>
                      {member.memberId.username}
                    </option>
                  ))}
                </select>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={handleCloseTransferOwnershipDialog}
                    className="px-4 py-2 bg-[var(--button-secondary)] rounded hover:bg-[var(--button-secondary-hover)] text-[var(--dialog-text)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTransferOwnership}
                    disabled={!selectedMemberId}
                    className="px-4 py-2 bg-[var(--button-primary)] text-white rounded hover:bg-[var(--button-primary-hover)] disabled:opacity-50"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}