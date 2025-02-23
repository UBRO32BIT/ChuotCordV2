import { LoginData, RefreshTokenData, RegisterData } from "../shared/auth.interface"
import axiosClient from "./apiService"

const LoginWithCredentials = async (data: LoginData) => {
    return axiosClient.post(`/auth/login`, data)
        .then((res) => {
            return res.data.data;
        })
        .catch((error) => {
            console.error(error);
            throw Error(error.response.data.message)
        })
}

const RegisterAccount = async (data: RegisterData) => {
    return axiosClient.post(`/auth/register`, data)
        .then((res) => {
            return res.data.data;
        })
        .catch((error) => {
            throw Error(error.response.data.message)
        })
}

const RefreshToken = async () => {
    return axiosClient.post(`/auth/refresh-token`, {}, {
        withCredentials: true
    })
    .then((res) => {
        return res.data.data.token;
    })
    .catch((error) => {
        throw Error(error.response.data.message)
    })
}

export {
    LoginWithCredentials,
    RegisterAccount,
    RefreshToken,
}