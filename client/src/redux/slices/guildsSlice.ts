import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Guild, GuildPartial } from "../../shared/guild.interface";
import { CreateGuild, DeleteGuild, GetGuildById, TransferOwnership, UpdateGuild } from "../../services/guild.service";
import { getGuildsByUserId } from "../../services/user.service";
import { JoinGuildByCode } from "../../services/invite.service";

export interface IGuildsState {
    guilds: Guild[];
    selectedGuild: Guild | null;
    loading: boolean;
    error: string | null;
}

// Initial state
const initialState: IGuildsState = {
    guilds: [],
    selectedGuild: null,
    loading: false,
    error: null,
};

export const fetchGuilds = createAsyncThunk(
    "guilds/fetchGuilds",
    async (_, { rejectWithValue }) => {
        try {
            return await getGuildsByUserId();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchGuildById = createAsyncThunk(
    "guilds/fetchGuildById",
    async (guildId: string, { getState, rejectWithValue }) => {
        try {
            return await GetGuildById(guildId);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateGuild = createAsyncThunk(
    "guilds/updateGuild",
    async ({ guildId, formData }: { guildId: string; formData: FormData }, { rejectWithValue }) => {
      try {
        return await UpdateGuild(guildId, formData);
      } catch (error: any) {
        return rejectWithValue(error.message);
      }
    }
  );

export const createGuild = createAsyncThunk(
    "guilds/createGuild",
    async (data: any, { rejectWithValue }) => {
        try {
            return await CreateGuild(data);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const joinGuild = createAsyncThunk(
    "guilds/joinGuild",
    async (code: string, { rejectWithValue }) => {
        try {
            return await JoinGuildByCode(code);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
)

export const transferOwnership = createAsyncThunk(
    "guilds/transferOwnership",
    async (data: any, { rejectWithValue }) => {
        try {
            return await TransferOwnership(data.guildId, data.newOwnerId);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
)

export const deleteGuild = createAsyncThunk(
    "guilds/deleteGuild",
    async (guildId: string, { rejectWithValue }) => {
        try {
            await DeleteGuild(guildId);
            return guildId;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const guildsSlice = createSlice({
    name: "guilds",
    initialState,
    reducers: {
        addGuild: (state, action: PayloadAction<Guild>) => {
            state.guilds.push(action.payload);
        },
        editGuild: (state, action: PayloadAction<{ _id: string; changes: Partial<GuildPartial> }>) => {
            const { _id, changes } = action.payload;
            const index = state.guilds.findIndex((guild) => guild._id === _id);
            if (index !== -1) {
                state.guilds[index] = { ...state.guilds[index], ...changes };
            }
        },
        setGuild: (state, action: PayloadAction<Guild>) => {
            const index = state.guilds.findIndex((guild) => guild._id === action.payload._id);
            if (index !== -1) {
                state.guilds[index] = action.payload;
            }
        },
        deleteGuild: (state, action: PayloadAction<string>) => {
            state.guilds = state.guilds.filter((guild) => guild._id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGuilds.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGuilds.fulfilled, (state, action) => {
                state.loading = false;
                state.guilds = action.payload;
            })
            .addCase(fetchGuilds.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchGuildById.fulfilled, (state, action) => {
                const existingIndex = state.guilds.findIndex(guild => guild._id === action.payload._id);
                if (existingIndex === -1) {
                    state.guilds.push(action.payload);
                }
            })
            
            .addCase(createGuild.fulfilled, (state, action) => {
                action.payload.memberCounts = 1;
                state.guilds.push(action.payload);
            })

            .addCase(joinGuild.fulfilled, (state, action) => {
                state.guilds.push(action.payload);
            })

            .addCase(transferOwnership.fulfilled, (state, action) => {
                const { guildId, newOwnerId } = action.payload;
                const index = state.guilds.findIndex((guild) => guild._id === guildId);
                if (index !== -1) {
                    state.guilds[index].owner = newOwnerId;
                }
            })

            .addCase(deleteGuild.fulfilled, (state, action) => {
                state.guilds = state.guilds.filter((guild) => guild._id !== action.payload);
            });
    },
});

export const { addGuild, editGuild, setGuild } = guildsSlice.actions;

export default guildsSlice.reducer;