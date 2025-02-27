import axios from "axios";
import { getAccessToken } from "../utils/localStorage";

const chatServerHost = process.env.REACT_APP_CHAT_SERVER_HOST;
const chatServerApiUrl = process.env.REACT_APP_CHAT_SERVER_API_URL;

// Axios instance
const axiosClient = axios.create({
    baseURL: chatServerApiUrl,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": chatServerHost,
        "Authorization": `Bearer ${getAccessToken()}`,
    },
    withCredentials: true,
});

export default axiosClient;