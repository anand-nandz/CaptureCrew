import {createSlice} from '@reduxjs/toolkit'
import { VendorData } from "../../types/vendorTypes";

export interface VendorState {
    vendorData : VendorData | null ;
    isVendorSignedIn : boolean
}

const initialState : VendorState = {
    vendorData : null,
    isVendorSignedIn : false
}


const vendorSlice = createSlice({
    name : 'vendor',
    initialState,
    reducers :{
        setVendorInfo:(state,action)=>{
            state.vendorData = action.payload;
            state.isVendorSignedIn = true
        },
        logout:(state)=>{
            state.vendorData = null;
            state.isVendorSignedIn =false
        }
    }
})

export const {setVendorInfo,logout} = vendorSlice.actions;
export default vendorSlice.reducer