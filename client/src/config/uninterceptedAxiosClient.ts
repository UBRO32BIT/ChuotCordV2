import axios from "axios";

const chatServerHost = process.env.REACT_APP_CHAT_SERVER_HOST;
const chatServerApiUrl = process.env.REACT_APP_CHAT_SERVER_API_URL;

// Axios instance
const uninterceptedAxiosClient = axios.create({
    baseURL: chatServerApiUrl,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": chatServerHost,
    },
    withCredentials: true,
});

export default uninterceptedAxiosClient;