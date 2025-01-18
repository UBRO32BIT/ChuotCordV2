import { ADD_GUILD, GuildActionTypes, LOAD_GUILDS, REMOVE_GUILD} from "../actions/guild";
import { GuildPartial } from "../shared/guild.interface";
export interface IGuildsState {
    guilds: Map<string, GuildPartial>
}

const initialState : IGuildsState = {
    guilds: new Map<string, GuildPartial>()
}

const guildReducer = (state = initialState, action: GuildActionTypes) => {
    switch (action.type) {
        case LOAD_GUILDS:
            return {
                ...state,
                guilds: action.payload.guilds,
            }
        case ADD_GUILD:
            const newGuild = action.payload as GuildPartial;
            state.guilds.set(newGuild._id, newGuild);
            return {
                ...state,
            }
        case REMOVE_GUILD:
            const guildId = action.payload as string;
            state.guilds.delete(guildId);
            return {
                ...state,
            };
        default:
            return state;
    }
};

export default guildReducer;