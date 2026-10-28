import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null
    },
    reducers: {
        setUserData: (state, action) => {
            if (action.payload && action.payload.user) {
                state.userData = action.payload.user;
            } else {
                state.userData = action.payload;
            }
        },
        clearUserData: (state) => {
            state.userData = null;
        }
    }

})


// this is redux syntax
export const { setUserData, clearUserData } = userSlice.actions
export default userSlice.reducer
