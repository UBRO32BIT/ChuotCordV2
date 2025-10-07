import React, { createContext, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { logoutUser } from "../redux/slices/userSlice";
import { RefreshToken } from "../services/auth.service";
import { setAccessToken, removeAccessToken } from "../utils/localStorage";

if (!process.env.REACT_APP_CHAT_SERVER_HOST) {
  throw new Error("REACT_APP_CHAT_SERVER_HOST is not defined in the environment variables.");
}

const socket = io(process.env.REACT_APP_CHAT_SERVER_HOST, {
  auth: {
    token: `Bearer ${localStorage.getItem("accessToken")}`
  },
  transports: ['websocket'], 
  rejectUnauthorized: false,
});

const SocketContext = createContext(socket);

export const SocketProvider = ({ children }: any) => {
  const dispatch = useDispatch<AppDispatch>();

  const logout = () => {
    dispatch(logoutUser());
    removeAccessToken();
    window.location.href = `${process.env.REACT_APP_CLIENT_HOST}/login`;
  };

  useEffect(() => {
    const handleConnectError = async (err: any) => {
      console.log("Socket connect error:", err.message);
      if (err.message.includes("invalid token") || err.message.includes("jwt expired")) {
        try {
          const newToken = await RefreshToken();
          if (newToken) {
            setAccessToken(newToken);
            socket.auth = { token: `Bearer ${newToken}` };
            socket.connect();
          } else {
            logout();
          }
        } catch (error) {
          console.error("Refresh token failed:", error);
          logout();
        }
      }
    };

    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect_error', handleConnectError);
    };
  }, [dispatch]);

  useEffect(() => {
    socket.on("reconnect_attempt", () => {
      socket.auth = {
        token: `Bearer ${localStorage.getItem("accessToken")}`,
      };
    });

    return () => {
      socket.off("reconnect_attempt");
    };
  }, []);
  
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};