import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {getReq, postReq} from "../../../helpers/api";
import { baseApiUrl } from "../../../helpers/constants";

export const getData = createAsyncThunk(
    "master/get-job-type",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/client-project/al-fadly/get-all-supplier', payload);
            
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

export const modifyData = createAsyncThunk(
    "master/modify-job-type",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/client-project/al-fadly/add-supplier', payload);
            
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

const masterSupplierSlice = createSlice({
    name: "job-type",
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

export const { clearThisState } = masterSupplierSlice.actions;
export default masterSupplierSlice.reducer;
