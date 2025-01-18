import React, { createContext, useContext } from 'react';
import { io } from 'socket.io-client';

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
  React.useEffect(() => {
    // Update the auth header on reconnect
    socket.on("reconnect_attempt", () => {
      socket.auth = {
        token: `Bearer ${localStorage.getItem("accessToken")}`,
      };
    });

    return () => {
      socket.off("reconnect_attempt"); // Cleanup to avoid memory leaks
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