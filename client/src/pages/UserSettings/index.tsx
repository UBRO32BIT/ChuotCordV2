import { yupResolver } from "@hookform/resolvers/yup";
import { Avatar, Button, FormControl, FormLabel, TextField, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as yup from "yup";
import { changePassword, updateInformation } from "../../services/user.service";
import { useSnackbar } from "notistack";

const updateProfileSchema = yup.object().shape({
    description: yup.string()
        .max(1000, "Description cannot exceed 1000 characters!"),
})
const updateUserInformationSchema = yup.object().shape({
    email: yup.string().email("Invalid email!").required("Email is required!"),
    phoneNumber: yup.string().matches(/^[0-9]{10}$/, "Invalid phone number!").required("Phone number is required!"),
});
const changePasswordSchema = yup.object().shape({
    currentPassword: yup.string().required("Current password is required!"),
    newPassword: yup.string().required("New password is required!"),
    repeatPassword: yup.string().oneOf([yup.ref("newPassword"), undefined], "Passwords must match!"),
});

export default function UserSettings() {
    const user = useSelector((state: any) => state.user.user);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [guildImageSrc, setGuildImageSrc] = React.useState<string>('');
    const [profilePicture, setProfilePicture] = React.useState<File>();
    const [isProfileChanged, setIsProfileChanged] = useState(false);

    const {
        register: registerUpdateProfile,
        handleSubmit: handleUpdateProfile,
        setValue: setUpdateGuildValue,
        watch: watchUpdateProfile,
        formState: { errors: updateGuildErrors }
    } = useForm({
        resolver: yupResolver(updateProfileSchema),
        defaultValues: {
            description: user.description,
        }
    })

    const {
        register: registerUserInformation,
        handleSubmit: handleUserInformationSubmit,
        setValue: setUserInformationValue,
        formState: { errors: userInformationErrors }
    } = useForm({
        resolver: yupResolver(updateUserInformationSchema),
    });
    const {
        register: registerLogin,
        handleSubmit: handleLoginSubmit,
        setValue,
        formState: { errors: loginErrors },
    } = useForm({
        resolver: yupResolver(changePasswordSchema),
    });

    const watchDescription = watchUpdateProfile("description");

    useEffect(() => {
        if (watchDescription !== user.description || profilePicture) {
            setIsProfileChanged(true);
        } else {
            setIsProfileChanged(false);
        }
    }, [watchDescription, profilePicture, user.description]);

    const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setProfilePicture(e.target.files[0]);
        }
    };

    const onUserProfileUpdate = async (data: any) => {
        try {
            const formData = new FormData();
            formData.append("profileDescription", data.description);
            if (profilePicture) {
                formData.append("profilePicture", profilePicture);
            }
            await updateInformation(formData);
            enqueueSnackbar("User profile updated successfully!", { variant: "success" });
            setIsProfileChanged(false); // Reset the change detection after successful update
        } catch (error: any) {
            enqueueSnackbar(error.message || "Failed to update user information.", { variant: "error" });
        }
    };

    const onChangePassword = async (data: any) => {
        try {
            await changePassword(data.currentPassword, data.newPassword);
            enqueueSnackbar("Password changed successfully!", { variant: "success" });
        } catch (error: any) {
            enqueueSnackbar(error.message || "Failed to change password.", { variant: "error" });
        }
    };

    React.useEffect(() => {
        if (profilePicture) {
            const objectUrl = URL.createObjectURL(profilePicture);
            setGuildImageSrc(objectUrl);

            // Clean up the object URL when the component unmounts or the file changes
            return () => URL.revokeObjectURL(objectUrl);
        } else if (user.profilePicture) {
            setGuildImageSrc(user.profilePicture);
        }
    }, [user, profilePicture])

    return <Grid container sx={{ height: "100vh" }}>
        <Grid item md={1}></Grid>
        <Grid
            item
            md={10}
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
            }}
        >
            <Box sx={{
                textAlign: "start"
            }}>
                <Typography variant="h2">Profile</Typography>
                <form onSubmit={handleUpdateProfile(onUserProfileUpdate)}>
                    <Box sx={{
                        py: 1,
                        rowGap: 1,
                    }}>
                        <Avatar
                            src={guildImageSrc}
                            alt="Profile picture"
                            sx={{ width: 64, height: 64 }}
                        />
                        <Box sx={{
                            pb: 3
                        }}>
                            <input
                                type="file"
                                onChange={handleProfilePictureChange}
                                accept="image/*"
                            />
                            <div>{profilePicture && `${profilePicture.name} - ${profilePicture.type}`}</div>
                        </Box>
                        <TextField
                            id="description"
                            label="Description"
                            fullWidth
                            variant="outlined"
                            error={!!updateGuildErrors.description}
                            helperText={updateGuildErrors.description?.message}
                            {...registerUpdateProfile("description")}
                            defaultValue={user.description}
                        />
                    </Box>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={!isProfileChanged}
                    >
                        Confirm changes
                    </Button>
                </form>
            </Box>
            <Box sx={{
                textAlign: "start"
            }}>
                <Typography variant="h2">User information</Typography>
                {user.isEmailVerified ? (
                    <Typography variant="h6">Email is verified</Typography>
                ) : (
                    <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}>
                        <Typography variant="h6">Email is not verified</Typography>
                        <Button variant="contained" size="small">Verify now</Button>
                    </Box>
                )}
                <Box
                    component="form"
                    onSubmit={handleUserInformationSubmit(onUserProfileUpdate)}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "start",
                        width: "100%",
                        gap: 2,
                    }}
                >
                    <FormControl>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <TextField
                            fullWidth
                            id="email"
                            type="email"
                            autoFocus
                            variant="outlined"
                            error={!!loginErrors.currentPassword}
                            helperText={loginErrors.currentPassword?.message}
                            color={loginErrors.currentPassword ? "error" : "primary"}
                            defaultValue={user.email}
                            {...registerUserInformation("email")}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="phoneNumber">Phone number</FormLabel>
                        <TextField
                            fullWidth
                            type="tel"
                            id="phoneNumber"
                            autoFocus
                            variant="outlined"
                            error={!!loginErrors.newPassword}
                            helperText={loginErrors.newPassword?.message}
                            defaultValue={user.phoneNumber}
                            {...registerUserInformation("phoneNumber")}
                        />
                    </FormControl>

                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        style={{ margin: "8px 0" }}
                        fullWidth
                    >
                        Update
                    </Button>
                </Box>
            </Box>
            <Box sx={{
                textAlign: "start"
            }}>
                <Typography variant="h2">Change password</Typography>
                <Box
                    component="form"
                    onSubmit={handleLoginSubmit(onChangePassword)}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "start",
                        width: "100%",
                        gap: 2,
                    }}
                >
                    <FormControl>
                        <FormLabel htmlFor="currentPassword">Current password</FormLabel>
                        <TextField
                            fullWidth
                            id="currentPassword"
                            type="password"
                            autoFocus
                            variant="outlined"
                            error={!!loginErrors.currentPassword}
                            helperText={loginErrors.currentPassword?.message}
                            color={loginErrors.currentPassword ? "error" : "primary"}
                            {...registerLogin("currentPassword")}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="newPassword">New password</FormLabel>
                        <TextField
                            fullWidth
                            type="password"
                            id="newPassword"
                            autoFocus
                            variant="outlined"
                            error={!!loginErrors.newPassword}
                            helperText={loginErrors.newPassword?.message}
                            {...registerLogin("newPassword")}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="repeatPassword">Repeat new password</FormLabel>
                        <TextField
                            fullWidth
                            type="password"
                            id="repeatPassword"
                            autoFocus
                            variant="outlined"
                            error={!!loginErrors.repeatPassword}
                            helperText={loginErrors.repeatPassword?.message}
                            {...registerLogin("repeatPassword")}
                        />
                    </FormControl>

                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        style={{ margin: "8px 0" }}
                        fullWidth
                    >
                        Change password
                    </Button>
                </Box>
            </Box>
        </Grid>
        <Grid item md={1}></Grid>
    </Grid>
}