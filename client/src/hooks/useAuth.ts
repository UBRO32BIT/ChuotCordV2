import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { RefreshToken } from "../services/auth.service";
import { getAccessToken, setAccessToken, removeAccessToken } from "../utils/localStorage";
import { AxiosResponse } from "axios";
import { AppDispatch } from "../store";
import axiosClient from "../config/axiosClient";
import { logoutUser } from "../redux/slices/userSlice";

export const useAuth = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const logout = () => {
    dispatch(logoutUser());
    removeAccessToken();
    window.location.href = `${process.env.REACT_APP_CLIENT_HOST}/login`;
  }

  axiosClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      if (error.response?.status === 401) {
        console.log("prepare to refresh token");
        try {
          const accessToken: any = await RefreshToken();
          if (accessToken) {
            setAccessToken(accessToken);
            axiosClient.defaults.headers.common["Authorization"] = 'Bearer ' + accessToken;
            error.config.headers["Authorization"] = 'Bearer ' + accessToken;
            return axiosClient(error.config);
          }
          else {
            logout();
          }
        } 
        catch (refreshError) {
          logout();
        }
      }
      return Promise.reject(error);
    });

  return { isRefreshing };
};