import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userSlice from "./redux/slices/userSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import guildsSlice from "./redux/slices/guildsSlice";
import { enableMapSet } from "immer";
import darkModeSlice from "./redux/slices/darkModeSlice";

enableMapSet();

const rootReducer = combineReducers({
    user: userSlice,
    guilds: guildsSlice,
    darkMode: darkModeSlice,
});

const persistConfig = {
    key: 'root',
    storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;