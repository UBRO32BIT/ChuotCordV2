import React from "react";
import { Avatar, Box, Button, Checkbox, FormControl, FormControlLabel, FormLabel, Grid, Link, Paper, TextField, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoginWithCredentials, RegisterAccount } from "../../services/auth.service";
import { LoginData, RegisterData } from "../../shared/auth.interface";
import { User } from "../../shared/user.interface";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import { setAccessToken } from "../../utils/localStorage";
import useAuth from "../../hooks/useAuth";
import { loadUser } from "../../redux/slices/userSlice";
import { loadGuild } from "../../redux/slices/guildsSlice";

const loginSchema = yup.object().shape({
    username: yup
        .string()
        .matches(/^[a-zA-Z0-9]+$/, "Username can only contain alphanumeric characters!")
        .min(3, "Username must be at least 3 characters long!")
        .max(32, "Username cannot exceed 32 characters!")
        .required("Username is required!"),
    email: yup.string().email("Email is not valid!").required("Email is required!"),
    password: yup.string().required("Password is required!"),
    repeatPassword: yup.string().oneOf([yup.ref("password"), undefined], "Passwords must match!"),
});

export default function Register() {
    const { setAuth } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);
    const { enqueueSnackbar } = useSnackbar();
    const [errorResponse, setErrorResponse] = React.useState<string>("");
    const [uploading, setUploading] = React.useState(false);
    const {
        register: registerLogin,
        handleSubmit: handleRegisterSubmit,
        setValue,
        formState: { errors: registerErrors },
    } = useForm({
        resolver: yupResolver(loginSchema),
    });

    const onRegisterSubmit = async (event: any) => {
        try {
            setUploading(true);
            const data: RegisterData = {
                username: event.username,
                password: event.password,
                email: event.email,
                repeatPassword: event.repeatPassword,
            };
            const result = await RegisterAccount(data);

            const userData: User = {
                _id: result.user._id,
                username: result.user.username,
                email: result.user.email,
                phoneNumber: result.user.phone_number,
                profilePicture: result.user.profilePicture,
                isEmailVerified: result.user.is_email_verified,
                onlinePresence: result.user.onlinePresence,
            };

            dispatch(loadUser(userData));
            const guilds = result.user.guilds;
            dispatch(loadGuild(guilds));

            setAccessToken(result.tokens.accessToken.token);
            navigate("/chat");
        } catch (error: any) {
            setValue("password", "");
            if (error && error.message) {
                setErrorResponse(error.message);
            } 
            else setErrorResponse(error);
        }
    };

    if (isAuthenticated) {
        // Redirect to a different page if the user is already authenticated
        return <Navigate to="/" />;
    }

    return (
        <Grid
            container
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                backgroundImage:
                    "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://upload.wikimedia.org/wikipedia/commons/c/c1/Rat_agouti.jpg)",
                backgroundSize: "cover",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                minHeight: "100vh",
                overflow: "auto",
                padding: 2,
            }}
        >
            <Paper
                elevation={10}
                style={{
                    padding: 20,
                    width: 350,
                    margin: "20px auto",
                    maxHeight: "90vh",
                    overflowY: "auto",
                }}
            >
                <Grid alignItems="center" justifyContent="center">
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
                    >
                        Sign up
                    </Typography>
                    <Typography variant="body2" color={"red"}>
                        {errorResponse}
                    </Typography>
                </Grid>
                <Box
                    component="form"
                    onSubmit={handleRegisterSubmit(onRegisterSubmit)}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "start",
                        width: "100%",
                        gap: 2,
                    }}
                >
                    <FormControl>
                        <FormLabel htmlFor="username">Username</FormLabel>
                        <TextField
                            fullWidth
                            id="username"
                            autoComplete="email"
                            autoFocus
                            required
                            variant="outlined"
                            error={!!registerErrors.username}
                            helperText={registerErrors.username?.message}
                            color={registerErrors.username ? "error" : "primary"}
                            {...registerLogin("username")}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <TextField
                            fullWidth
                            id="email"
                            type="email"
                            autoFocus
                            variant="outlined"
                            error={!!registerErrors.email}
                            helperText={registerErrors.email?.message}
                            color={registerErrors.email ? "error" : "primary"}
                            {...registerLogin("email")}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <TextField
                            fullWidth
                            type="password"
                            id="password"
                            autoFocus
                            required
                            variant="outlined"
                            autoComplete="current-password"
                            error={!!registerErrors.password}
                            helperText={registerErrors.password?.message}
                            {...registerLogin("password")}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="repeatPassword">Repeat password</FormLabel>
                        <TextField
                            fullWidth
                            type="password"
                            id="repeatPassword"
                            autoFocus
                            required
                            variant="outlined"
                            autoComplete="current-password"
                            error={!!registerErrors.repeatPassword}
                            helperText={registerErrors.repeatPassword?.message}
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
                        Create an account
                    </Button>
                </Box>
                <Typography>
                    <Link href="#" variant="body2">
                        Forgot password?
                    </Link>
                </Typography>
                <Typography variant="body2">Already have an account?</Typography>
                <Link href="/login" variant="body2">
                    Login now
                </Link>
            </Paper>
        </Grid>
    );
}