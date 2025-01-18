import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { GuildPartial } from "../../shared/guild.interface"

export interface IGuildsState {
    guilds: GuildPartial[],
}

const initialState : IGuildsState = {
    guilds: [],
}

export const guildsSlice = createSlice({
    name: 'guilds',
    initialState,
    reducers: {
        loadGuild: (state, action: PayloadAction<GuildPartial[]>) => {
            state.guilds = action.payload;
        },
        addGuild: (state, action: PayloadAction<GuildPartial>) => {
            state.guilds.push(action.payload);
        },
        editGuild: (state, action: PayloadAction<{ _id: string, changes: Partial<GuildPartial> }>) => {
            const { _id, changes } = action.payload;
            const index = state.guilds.findIndex(guild => guild._id === _id);
            if (index !== -1) {
                state.guilds[index] = { ...state.guilds[index], ...changes };
            }
        },
        removeGuild: (state, action: PayloadAction<string>) => {
            state.guilds = state.guilds.filter(guild => guild._id !== action.payload);
        }
    }
})

export const {loadGuild, addGuild, removeGuild} = guildsSlice.actions

export default guildsSlice.reducer;

export const getGuildById = (state: { guilds: IGuildsState }, _id: string) => {
    return state.guilds.guilds.find(guild => guild._id === _id);
};