import { LOAD_USER, REGISTER_USER, LOGIN_USER, LOGOUT_USER, UPDATE_USER, UserActionTypes } from "../actions/user";
import { User } from "../shared/user.interface";

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

const userReducer = (state = initialState, action: UserActionTypes) => {
    switch (action.type) {
        case LOAD_USER:
            return {
                ...state,
                isLoaded: true,
            }
        case REGISTER_USER:
        case LOGIN_USER:
            return {
                ...state,
                user: action.payload,
            };
        case LOGOUT_USER:
            return {
                ...state,
                user: null,
            };
        case UPDATE_USER:
            return {
                ...state,
                user: {
                    ...state.user!,
                    ...action.payload,
                },
            };
        default:
            return state;
    }
};

export default userReducer;