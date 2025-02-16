import React from "react";
import { Box, Button, FormControl, FormLabel, Grid, Link, Paper, TextField, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoginWithCredentials } from "../../services/auth.service";
import { LoginData } from "../../shared/auth.interface";
import { User } from "../../shared/user.interface";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import { setAccessToken } from "../../utils/localStorage";
import useAuth from "../../hooks/useAuth";
import { loadUser } from "../../redux/slices/userSlice";

const loginSchema = yup.object().shape({
    username: yup.string().required("Username is required!"),
    password: yup.string().required("Password is required!"),
});

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);
    const [errorResponse, setErrorResponse] = React.useState<string>("");
    const [uploading, setUploading] = React.useState(false);
    const {
        register: registerLogin,
        handleSubmit: handleLoginSubmit,
        setValue,
        formState: { errors: loginErrors },
    } = useForm({
        resolver: yupResolver(loginSchema),
    });

    const onLoginSubmit = async (event: any) => {
        try {
            setUploading(true);
            const data: LoginData = {
                username: event.username,
                password: event.password,
            };
            const result = await LoginWithCredentials(data);

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
                        Sign in
                    </Typography>
                    <Typography variant="body2" color={"red"}>
                        {errorResponse}
                    </Typography>
                </Grid>
                <Box
                    component="form"
                    onSubmit={handleLoginSubmit(onLoginSubmit)}
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
                            error={!!loginErrors.username}
                            helperText={loginErrors.username?.message}
                            color={loginErrors.username ? "error" : "primary"}
                            {...registerLogin("username")}
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
                            error={!!loginErrors.password}
                            helperText={loginErrors.password?.message}
                            {...registerLogin("password")}
                        />
                    </FormControl>

                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        style={{ margin: "8px 0" }}
                        fullWidth
                    >
                        Sign in
                    </Button>
                </Box>
                <Typography>
                    <Link href="#" variant="body2">
                        Forgot password?
                    </Link>
                </Typography>
                <Typography variant="body2">Don't have an account?</Typography>
                <Link href="/register" variant="body2">
                    Register now
                </Link>
            </Paper>
        </Grid>
    );
}
