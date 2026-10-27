import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null
    },
    reducers: {
        setUserData: (state, action) => {
            // from action's payload we took the data and put in state
            state.userData = action.payload
        }
    }

})


// this is redux syntax
export const { setUserData } = userSlice.actions
export default userSlice.reducer
