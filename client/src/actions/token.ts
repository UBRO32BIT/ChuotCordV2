import { RootState } from "../reducers/token";

//Actions for access token
export const REFRESH_TOKEN = 'REFRESH_TOKEN';
export const INVALIDATE_TOKEN = 'INVALIDATE_TOKEN';

interface RefreshTokenAction {
    type: typeof REFRESH_TOKEN;
    payload: RootState;
}
interface InvalidateTokenAction {
    type: typeof INVALIDATE_TOKEN;
}
export type AccessTokenActionTypes = RefreshTokenAction | InvalidateTokenAction;