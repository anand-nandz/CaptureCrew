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
        updateUserImage: (state, action: PayloadAction<string>) => {
            if (state.userData) {
                state.userData.imageUrl = action.payload;
            }
        },
        logout:(state)=>{
            state.userData = null;
            state.isUserSignedIn =false
        }
    }
})

export const {setUserInfo,logout} = userSlice.actions;
export default userSlice.reducer