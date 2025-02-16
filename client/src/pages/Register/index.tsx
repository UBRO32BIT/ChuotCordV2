import React from "react";
import { Link } from "@mui/material";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { RegisterAccount } from "../../services/auth.service";
import { RegisterData } from "../../shared/auth.interface";
import { User } from "../../shared/user.interface";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import { setAccessToken } from "../../utils/localStorage";
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import { loadUser } from "../../redux/slices/userSlice";

const registerSchema = yup.object().shape({
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
    const [errorResponse, setErrorResponse] = React.useState("");
    const [uploading, setUploading] = React.useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);

    const {
        register: registerForm,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(registerSchema)
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
                }}>Sign Up</h4>

                {errorResponse && (
                    <p style={{ color: '#ff4444', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1rem' }}>
                        {errorResponse}
                    </p>
                )}

                <form onSubmit={handleSubmit(onRegisterSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <div style={{ position: 'relative', display: "flex", alignItems: "center" }}>
                            <input
                                {...registerForm("username")}
                                type="text"
                                placeholder="Username"
                                style={{
                                    width: '100%',
                                    padding: '13px 20px 13px 48px',
                                    backgroundColor: '#1f2029',
                                    border: errors.username ? '1px solid #ff4444' : 'none',
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
                            }}><PersonIcon/></span>
                        </div>
                        {errors.username && (
                            <p style={{ color: '#ff4444', fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: '0' }}>
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <div style={{ position: 'relative', display: "flex", alignItems: "center" }}>
                            <input
                                {...registerForm("email")}
                                type="email"
                                placeholder="Email"
                                style={{
                                    width: '100%',
                                    padding: '13px 20px 13px 48px',
                                    backgroundColor: '#1f2029',
                                    border: errors.email ? '1px solid #ff4444' : 'none',
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
                            }}><AlternateEmailIcon/></span>
                        </div>
                        {errors.email && (
                                <p style={{ color: '#ff4444', fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: '0' }}>
                                    {errors.email.message}
                                </p>
                            )}
                    </div>

                    <div>
                        <div style={{ position: 'relative', display: "flex", alignItems: "center" }}>
                            <input
                                {...registerForm("password")}
                                type="password"
                                placeholder="Password"
                                style={{
                                    width: '100%',
                                    padding: '13px 20px 13px 48px',
                                    backgroundColor: '#1f2029',
                                    border: errors.password ? '1px solid #ff4444' : 'none',
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
                            }}><LockIcon/></span>
                        </div>
                        {errors.password && (
                            <p style={{ color: '#ff4444', fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: '0' }}>
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <div style={{ position: 'relative', display: "flex", alignItems: "center" }}>
                            <input
                                {...registerForm("repeatPassword")}
                                type="password"
                                placeholder="Repeat Password"
                                style={{
                                    width: '100%',
                                    padding: '13px 20px 13px 48px',
                                    backgroundColor: '#1f2029',
                                    border: errors.repeatPassword ? '1px solid #ff4444' : 'none',
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
                            }}><LockIcon/></span>
                        </div>
                        {errors.repeatPassword && (
                            <p style={{ color: '#ff4444', fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: '0' }}>
                                {errors.repeatPassword.message}
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
                        {uploading ? 'Signing up...' : 'Sign Up'}
                    </button>

                    <div style={{
                        textAlign: 'center',
                        marginTop: '1rem'
                    }}>
                        <span style={{ color: '#c4c3ca', fontSize: '0.875rem' }}>Already have an account? </span>
                        <Link
                            href="/login"
                            style={{
                                color: '#ffeba7',
                                textDecoration: 'none',
                                fontSize: '0.875rem'
                            }}
                        >
                            Login here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}