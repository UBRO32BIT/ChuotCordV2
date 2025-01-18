import { Dispatch, SetStateAction, createContext, useState } from "react";

interface AuthContextType {
    auth: any; // You should replace 'any' with the actual type of your authentication data
    setAuth: Dispatch<SetStateAction<any>>; // Replace 'any' with the type of your authentication setter
}

const AuthContext = createContext<AuthContextType>({ auth: {}, setAuth: () => {} });

export const AuthProvider = ({ children }: any) => {
    const [auth, setAuth] = useState<any>({});

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;