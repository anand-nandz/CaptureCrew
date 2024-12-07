import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserData } from "../../types/userTypes";

export interface UserState {
    userData : UserData | null ;
    isUserSignedIn : boolean
}

const initialState : UserState = {
    userData : null,
    isUserSignedIn : false
}


const userSlice = createSlice({
    name : 'user',
    initialState,
    reducers :{
        setUserInfo:(state,action: PayloadAction<UserData>)=>{
            state.userData = action.payload;
            state.isUserSignedIn = true
        },
        
        logout:(state)=>{
            state.userData = null;
            state.isUserSignedIn =false
        }
    }
})

export const {setUserInfo,logout} = userSlice.actions;
export default userSlice.reducer