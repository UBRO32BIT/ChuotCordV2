import axios, { AxiosRequestConfig } from "axios";
import { RefreshToken } from "./auth.service";
import { getAccessToken, removeAccessToken, setAccessToken } from "../utils/localStorage";
import { AppDispatch } from "../store";// Import your app's `AppDispatch` type
import { logoutUser } from "../redux/slices/userSlice"; // Import the logout action

// Define the structure of a retry queue item
interface RetryQueueItem {
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
    config: AxiosRequestConfig;
}

// Create a list to hold the request queue
const refreshAndRetryQueue: RetryQueueItem[] = [];

// Flag to prevent multiple token refresh requests
let isRefreshing = false;

const chatServerHost = process.env.REACT_APP_CHAT_SERVER_HOST;
const chatServerApiUrl = process.env.REACT_APP_CHAT_SERVER_API_URL;
const clientHost = process.env.REACT_APP_CLIENT_HOST;
// Axios instance
const axiosClient = axios.create({
    baseURL: chatServerApiUrl,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": chatServerHost,
    },
    withCredentials: true,
});

export const setupAxiosInterceptors = (dispatch: AppDispatch) => {
    axiosClient.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            // Prevent infinite loops
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                
                if (!isRefreshing) {
                    isRefreshing = true;
                    try {
                        const newAccessToken = await RefreshToken();
                        setAccessToken(newAccessToken);

                        // Update authorization header
                        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                        axiosClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

                        // Process pending requests
                        refreshAndRetryQueue.forEach(({ config, resolve, reject }) => {
                            axiosClient(config).then(resolve).catch(reject);
                        });
                        refreshAndRetryQueue.length = 0;

                        return axiosClient(originalRequest);
                    } catch (refreshError: any) {
                        // Only logout if refresh token is invalid/expired
                        if (refreshError.response?.status === 401) {
                            dispatch(logoutUser());
                            removeAccessToken();
                            window.location.href = `${clientHost}/login`;
                        }
                        return Promise.reject(refreshError);
                    } finally {
                        isRefreshing = false;
                    }
                }

                return new Promise((resolve, reject) => {
                    refreshAndRetryQueue.push({
                        config: originalRequest,
                        resolve,
                        reject
                    });
                });
            }

            return Promise.reject(error);
        }
    );
};

export default axiosClient;