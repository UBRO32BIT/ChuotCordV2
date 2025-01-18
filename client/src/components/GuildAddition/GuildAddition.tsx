import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AddIcon from '@mui/icons-material/Add';
import Button from "@mui/material/Button";
import GroupsIcon from '@mui/icons-material/Groups';
import { Divider, Modal, TextField } from "@mui/material";
import React from "react";
import * as yup from "yup";
import { CreateGuild } from "../../services/guild.service";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { GuildPartial } from "../../shared/guild.interface";
import { addGuild } from "../../redux/slices/guildsSlice";
import { useDispatch, useSelector } from "react-redux";

const createGuildSchema = yup.object().shape({
    name: yup.string()
        .required("Guild name is required!"),
})

export default function GuildAddition() {
    const guilds = useSelector((state: any) => state.guilds.guilds);
    const [openCreateGuildModal, setOpenCreateGuildModal] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const {
        register: registerCreateGuild,
        handleSubmit: handleCreateGuildSubmit,
        formState: { errors: createGuildErrors }
    } = useForm({
        resolver: yupResolver(createGuildSchema),
    })
    const handleOpenCreateGuildModal = () => setOpenCreateGuildModal(true);
    const handleCloseCreateGuildModal = () => setOpenCreateGuildModal(false);
    const onCreateGuildSubmit = async (event: any) => {
        try {
            setUploading(true);
            const data = {
                name: event.name,
            }
            const result = await CreateGuild(data);
            const newGuild: GuildPartial = {
                _id: result._id,
                name: result.name,
                image: result.image,
                memberCounts: 1,
            }
            console.log(guilds);
            dispatch(addGuild(newGuild));
            enqueueSnackbar(`Guild created successfully.`, { variant: "success" });
        }
        catch (error: any) {
            console.log(error);
            enqueueSnackbar(`${error.message}`, { variant: "error" });
        }
        finally {
            setUploading(false);
            setOpenCreateGuildModal(false);
        }
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
    // return <Box component="section" sx={{
    //     display: "flex",
    //     justifyContent: "center",
    //     alignItems: "center", 
    //     p: 1,
    //     m: 1,
    //     gap: 1,
    //     border: '2px dashed grey',
    // }}>
    //     <AddIcon/>
    //     <Typography variant="button">New Guild</Typography>
    // </Box>
    return <Box>
        <Box sx={{
            m: 1,
        }}>
            <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={handleOpenCreateGuildModal}
                sx={{
                    gap: 1,
                }}>
                <AddIcon />
                <Typography variant="button">New Guild</Typography>
            </Button>
        </Box>
        <Box sx={{
            m: 1,
        }}>
            <Button variant="contained"
                color="secondary"
                fullWidth
                sx={{
                    gap: 1,
                }}>
                <GroupsIcon />
                <Typography variant="button">Join Existing Guild</Typography>
            </Button>
            <Modal
                open={openCreateGuildModal}
                onClose={handleCloseCreateGuildModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        New Guild
                    </Typography>
                    {/* <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                    </Typography> */}
                    <form onSubmit={handleCreateGuildSubmit(onCreateGuildSubmit)}>
                        <TextField
                            margin="normal"
                            fullWidth
                            id="name"
                            label="Guild name"
                            autoComplete="email"
                            autoFocus
                            error={!!createGuildErrors.name}
                            helperText={createGuildErrors.name?.message}
                            {...registerCreateGuild("name")}
                        />
                        <Button 
                            type='submit' 
                            color='primary' 
                            variant="contained" 
                            fullWidth
                        >Create new guild</Button>
                    </form>
                </Box>
            </Modal>
        </Box>
    </Box>
}