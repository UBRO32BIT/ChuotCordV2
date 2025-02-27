import { LoginData, RefreshTokenData, RegisterData } from "../shared/auth.interface"
import axiosClient from "../config/axiosClient"
import uninterceptedAxiosClient from "../config/uninterceptedAxiosClient"

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
            throw new Error(error.response.data.message)
        })
}

const RefreshToken = async () => {
    try {
        const res = await uninterceptedAxiosClient.post(`/auth/refresh-token`, {}, { withCredentials: true });
        return res.data.data.token;
    } catch (error: any) {
        throw error;
    }
}

export {
    LoginWithCredentials,
    RegisterAccount,
    RefreshToken,
}