export interface LoginData {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    repeatPassword: string;
}

export interface RefreshTokenData {
    refreshToken: string;
}