import { User } from "../shared/user.interface";

//Actions for current user
export const LOAD_USER = 'LOAD_USER';
export const REGISTER_USER = 'REGISTER_USER';
export const LOGIN_USER = 'LOGIN_USER';
export const LOGOUT_USER = 'LOGOUT_USER';
export const UPDATE_USER = 'UPDATE_USER';

interface LoadUserAction {
    type: typeof LOAD_USER;
}
interface RegisterUserAction {
    type: typeof REGISTER_USER;
    payload: User;
}

interface LoginUserAction {
    type: typeof LOGIN_USER;
    payload: User;
}

interface LogoutUserAction {
    type: typeof LOGOUT_USER;
}

interface UpdateUserAction {
    type: typeof UPDATE_USER;
    payload: Partial<User>;
}

export type UserActionTypes = LoadUserAction | RegisterUserAction | LoginUserAction | LogoutUserAction | UpdateUserAction;
