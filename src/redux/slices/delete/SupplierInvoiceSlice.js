import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {getReq, postReq} from "../../../helpers/api";
import { baseApiUrl } from "../../../helpers/constants";

export const fetchSupplierData = createAsyncThunk(
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

export const getSupplierInvoice = createAsyncThunk(
    "master/create-supplier-invoice",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/client-project/al-fadly/get-supplier-invoice', payload);
            
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

export const createSupplierInvoice = createAsyncThunk(
    "master/create-supplier-invoice",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/client-project/al-fadly/add-supplier-invoice', payload);
            
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

const supplierInvoiceSlice = createSlice({
    name: "supplier-invoice",
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

export const { clearThisState } = supplierInvoiceSlice.actions;
export default supplierInvoiceSlice.reducer;
