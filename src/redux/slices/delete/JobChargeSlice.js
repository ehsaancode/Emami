import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { postReq } from "../../../helpers/api";
import { baseApiUrl } from "../../../helpers/constants";


export const getData = createAsyncThunk(
    "master/get-job-charge",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/client-project/al-fadly/get-master-list', payload);
            
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

export const createEditJobCharge = createAsyncThunk(
    "master/modify-job-charge",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/client-project/al-fadly/update-job-charge-master', payload);
            
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

const masterJobChargeSlice = createSlice({
    name: "job-charge",
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

export const { clearThisState } = masterJobChargeSlice.actions;
export default masterJobChargeSlice.reducer;
