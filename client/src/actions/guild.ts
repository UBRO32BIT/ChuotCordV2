import { IGuildsState } from "../reducers/guild";
import { GuildPartial } from "../shared/guild.interface";

//Actions for access token
export const SET_GUILD_IDS = 'SET_GUILD_IDS';
export const LOAD_GUILDS = 'LOAD_GUILDS';
export const ADD_GUILD = 'ADD_GUILD';
export const REMOVE_GUILD = 'ADD_GUILD';

interface LoadGuildsFromUserAction {
    type: typeof LOAD_GUILDS;
    payload: IGuildsState;
}
interface AddGuildAction {
    type: typeof ADD_GUILD;
    payload: GuildPartial;
}
interface RemoveGuildAction {
    type: typeof REMOVE_GUILD;
    payload: string;
}
export type GuildActionTypes = LoadGuildsFromUserAction | AddGuildAction | RemoveGuildAction;