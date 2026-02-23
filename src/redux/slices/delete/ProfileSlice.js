import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { postReq } from "../../../helpers/api";
import { baseApiUrl } from "../../../helpers/constants";


export const getProfileData = createAsyncThunk(
    "master/get_staff-profile",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/client-project/al-fadly/get_staff-profile', payload);
            
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

export const updateProfileData = createAsyncThunk(
    "master/update_staff-profile",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/client-project/al-fadly/update-staff-profile', payload);
            
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

const profileDataSlice = createSlice({
    name: "staff-profile",
    initialState:{
      data:[],
      loading:false,
      isSuccess: false
    },
    reducers:{
      clearThisState(state, { xxx }) {
        state.data = {};
      },
    },
    extraReducers: {
    },
});

export const { clearThisState } = profileDataSlice.actions;
export default profileDataSlice.reducer;
