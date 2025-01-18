import { AccessTokenActionTypes, REFRESH_TOKEN, INVALIDATE_TOKEN } from "../actions/token";

export interface RootState {
    token: string;
    expire: Date | null;
}

const initialState : RootState = {
    token: '',
    expire: null,
}

const accessTokenReducer = (state = initialState, action: AccessTokenActionTypes) => {
    switch (action.type) {
        case REFRESH_TOKEN:
            return {
                token: action.payload.token,
                expire: action.payload.expire,
            }
        case INVALIDATE_TOKEN:
            return {
                token: null,
                expire: null,
            };
        default:
            return state;
    }
};

export default accessTokenReducer;