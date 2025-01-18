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

// Function to inject the logout dispatcher into axios interceptors
export const setupAxiosInterceptors = (dispatch: AppDispatch) => {
    // Add request interceptor to set Authorization header
    axiosClient.interceptors.request.use((config) => {
        config.headers.Authorization = `Bearer ${getAccessToken()}`;
        return config;
    });

    // Add response interceptor for handling 401 errors
    axiosClient.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest: AxiosRequestConfig = error.config;

            if (error.response && error.response.status === 401) {
                console.log("unauth");
                if (!isRefreshing) {
                    isRefreshing = true;
                    try {
                        // Refresh the access token
                        const newAccessToken = await RefreshToken();

                        // Update the request headers with the new access token
                        setAccessToken(newAccessToken);
                        error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;

                        // Retry all requests in the queue with the new token
                        refreshAndRetryQueue.forEach(({ config, resolve, reject }) => {
                            axiosClient
                                .request(config)
                                .then((response) => resolve(response))
                                .catch((err) => reject(err));
                        });

                        // Clear the queue
                        refreshAndRetryQueue.length = 0;

                        // Retry the original request
                        return axiosClient(originalRequest);
                    } catch (refreshError) {
                        console.error("Token refresh failed", refreshError);

                        // Dispatch logout action to update Redux state
                        dispatch(logoutUser());

                        // Clear the token and redirect to login
                        removeAccessToken();
                        window.location.href = `${clientHost}/login`;
                    } finally {
                        isRefreshing = false;
                    }
                }

                // Add the original request to the queue
                return new Promise<void>((resolve, reject) => {
                    refreshAndRetryQueue.push({ config: originalRequest, resolve, reject });
                });
            }

            // Return a Promise rejection if the status code is not 401
            return Promise.reject(error);
        }
    );
};

export default axiosClient;