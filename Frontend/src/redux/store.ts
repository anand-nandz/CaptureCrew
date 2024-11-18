import {configureStore} from '@reduxjs/toolkit';
import {persistReducer,persistStore} from "redux-persist";
import storage from 'redux-persist/lib/storage';
import userReducer from './slices/UserSlice';
import vendorReducer from './slices/VendorSlice';
import adminReducer from './slices/AdminSlice';
import { createBlockCheckMiddleware } from '@/config/blockCheckMiddleware';

const persistConfigUser = {
    storage,
    key : 'user'
}

const persistConfigVendor = {
    storage,
    key : 'vendor'
}

const persistConfigAdmin = {
    storage,
    key : 'admin'
}

const persistedUserReducer = persistReducer(persistConfigUser,userReducer)
const persistedVendorReducer = persistReducer(persistConfigVendor,vendorReducer)
const persistedAdminReducer = persistReducer(persistConfigAdmin,adminReducer)

export const store = configureStore({
    reducer :{
        user: persistedUserReducer,
        vendor : persistedVendorReducer,
        admin : persistedAdminReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST']
            }
        }).concat(createBlockCheckMiddleware())
})

export const persistor = persistStore(store)
