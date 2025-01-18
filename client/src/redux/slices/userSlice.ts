import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { User } from "../../shared/user.interface";

export interface IAuthState {
    isLoaded: boolean;
    isAuthenticated: boolean;
    user: User | null;
}

const initialState : IAuthState = {
    isLoaded: false,
    isAuthenticated: false,
    user: null,
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loadUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true; // Assuming user is authenticated when loaded
            state.isLoaded = true; // Assuming user data loading is complete
        },
        logoutUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        }
    }
})

export const { loadUser, logoutUser, updateUser } = userSlice.actions;

export default userSlice.reducer;