import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {getReq, postReq} from "../../../helpers/api";
import { baseApiUrl } from "../../../helpers/constants";

export const getData = createAsyncThunk(
    "master/get-payment-mode",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/client-project/al-fadly/get-master-list', payload);
            
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

export const modifyData = createAsyncThunk(
    "master/modify-payment-mode",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/client-project/al-fadly/update-payment-mode', payload);
            
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

const masterPaymentModeSlice = createSlice({
    name: "payment-mode",
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

export const { clearThisState } = masterPaymentModeSlice.actions;
export default masterPaymentModeSlice.reducer;




