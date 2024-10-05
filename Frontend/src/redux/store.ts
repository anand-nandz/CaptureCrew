import {configureStore} from '@reduxjs/toolkit';
import {persistReducer,persistStore} from "redux-persist";
import storage from 'redux-persist/lib/storage';
import userReducer from './slices/UserSlice';
import vendorReducer from './slices/VendorSlice';

const persistConfigUser = {
    storage,
    key : 'user'
}

const persistConfigVendor = {
    storage,
    key : 'vendor'
}

const persistedUserReducer = persistReducer(persistConfigUser,userReducer)
const persistedVendorReducer = persistReducer(persistConfigVendor,vendorReducer)

export const store = configureStore({
    reducer :{
        user: persistedUserReducer,
        vendor : persistedVendorReducer
    }
})

export const persistor = persistStore(store)