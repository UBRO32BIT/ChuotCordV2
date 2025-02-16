import React from "react";
import { Box, Button, FormControl, FormLabel, Grid, Link, Paper, TextField, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoginWithCredentials } from "../../services/auth.service";
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import { setAccessToken } from "../../utils/localStorage";
import { loadUser } from "../../redux/slices/userSlice";
import { RootState } from "../../store";

const loginSchema = yup.object().shape({
    username: yup.string().required("Username is required!"),
    password: yup.string().required("Password is required!"),
});

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
    const [errorResponse, setErrorResponse] = React.useState("");
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
            const data = {
                username: event.username,
                password: event.password,
            };

            const result = await LoginWithCredentials(data);
            const userData = {
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
            } else {
                setErrorResponse(error);
            }
        } finally {
            setUploading(false);
        }
    };

    if (isAuthenticated) {
        return <Navigate to="/" />;
    }

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://upload.wikimedia.org/wikipedia/commons/c/c1/Rat_agouti.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: '#fff',
            fontFamily: "'Poppins', sans-serif"
        }}>
            <div style={{
                maxWidth: '440px',
                width: '100%',
                backgroundColor: 'rgba(42, 43, 56, 0.9)',
                padding: '32px',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}>
                <h4 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>Log In</h4>

                {errorResponse && (
                    <p style={{ color: '#ff4444', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1rem' }}>
                        {errorResponse}
                    </p>
                )}

                <form onSubmit={handleLoginSubmit(onLoginSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <span style={{ position: "absolute", left: "18px", color: "#ffeba7" }}>
                                <PersonIcon />
                            </span>
                            <input
                                {...registerLogin("username")}
                                type="text"
                                placeholder="Username"
                                style={{
                                    width: "100%",
                                    padding: "13px 20px 13px 48px",
                                    backgroundColor: "#1f2029",
                                    border: loginErrors.username ? "1px solid #ff4444" : "none",
                                    borderRadius: "4px",
                                    color: "#fff",
                                    fontSize: "14px",
                                    outline: "none",
                                    boxShadow: "0 4px 8px rgba(21,21,21,0.2)",
                                }}
                            />
                        </div>
                        {loginErrors.username && (
                            <p style={{ color: '#ff4444', fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: '0' }}>
                                {loginErrors.username.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <input
                                {...registerLogin("password")}
                                type="password"
                                placeholder="Password"
                                style={{
                                    width: '100%',
                                    padding: '13px 20px 13px 48px',
                                    backgroundColor: '#1f2029',
                                    border: loginErrors.password ? '1px solid #ff4444' : 'none',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxShadow: '0 4px 8px rgba(21,21,21,0.2)'
                                }}
                            />
                            <span style={{
                                position: 'absolute',
                                left: '18px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#ffeba7'
                            }}><LockIcon /></span>
                        </div>
                        {loginErrors.password && (
                            <p style={{ color: '#ff4444', fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: '0' }}>
                                {loginErrors.password.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: '#ffeba7',
                            color: '#102770',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            transition: 'all 0.3s ease',
                            opacity: uploading ? 0.7 : 1
                        }}
                    >
                        {uploading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <a
                        href="#"
                        style={{
                            textAlign: 'center',
                            color: '#c4c3ca',
                            fontSize: '0.875rem',
                            textDecoration: 'none'
                        }}
                    >
                        Forgot password?
                    </a>

                    <div style={{
                        textAlign: 'center',
                        marginTop: '1rem'
                    }}>
                        <span style={{ color: '#c4c3ca', fontSize: '0.875rem' }}>Don't have an account? </span>
                        <Link
                            href="/register"
                            style={{
                                color: '#ffeba7',
                                textDecoration: 'none',
                                fontSize: '0.875rem'
                            }}
                        >
                            Register now
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
