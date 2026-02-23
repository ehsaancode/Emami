import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {getReq, postReq} from "../../../helpers/api";
import { baseApiUrl } from "../../../helpers/constants";


export const addInvoice = createAsyncThunk(
  "invoice/add",
  async (inputObj, {rejectWithValue}) => {
     
      try{
          let resp = await postReq(baseApiUrl+'/client-project/al-fadly/add-invoice', inputObj);
          
          return resp;
      } catch(error){
          rejectWithValue(error.response.data);
      }
  }
); 

export const updateInvoice = createAsyncThunk(
  "invoice/add",
  async (inputObj, {rejectWithValue}) => {
     
      try{
          let resp = await postReq(baseApiUrl+'/client-project/al-fadly/update-invoice', inputObj);
          
          return resp;
      } catch(error){
          rejectWithValue(error.response.data);
      }
  }
); 


export const getInvoiceReport = createAsyncThunk(
  "invoice/get-report",
  async (inputObj, {rejectWithValue}) => {
     
      try{
          let resp = await postReq(baseApiUrl+'/client-project/al-fadly/get-invoice-report', inputObj);
          
          return resp;
      } catch(error){
          rejectWithValue(error.response.data);
      }
  }
); 


export const getInvoiceReportNew = createAsyncThunk(
  "invoice/get-report-new",
  async (inputObj, {rejectWithValue}) => {
      
    try{
      // var baseApiUrl = "https://stag.alfadly.api.redoq.host/api/";
      // var baseApiUrl = "https://43.205.160.192:1007/api";
      let resp = await postReq(baseApiUrl+'/client-project/al-fadly/get-invoice-report-new', inputObj);
      return resp;
    } catch(error) {
      rejectWithValue(error.response.data);
    }
  }
); 

export const printInvoiceReport = createAsyncThunk(
  "invoice/print-report",
  async (inputObj, {rejectWithValue}) => {
      
    try{
      // var baseApiUrl = "https://stag.alfadly.api.redoq.host/api/";
      // var baseApiUrl = "https://43.205.160.192:1007/api";
      let resp = await postReq(baseApiUrl+'/client-project/al-fadly/get-invoice-report-new', inputObj);
      return resp;
    } catch(error) {
      rejectWithValue(error.response.data);
    }
  }
);


export const getInvoiceReportById = createAsyncThunk(
  "invoice/get-report",
  async (inputObj, {rejectWithValue}) => {
     
      try{
          let resp = await postReq(baseApiUrl+'/client-project/al-fadly/get-invoice-data', inputObj);
          
          return resp;
      } catch(error){
          rejectWithValue(error.response.data);
      }
  }
); 





const invoiceSlice = createSlice({
    name: "invoice",
    initialState:{
      data:[],
      loading:false,
      isSuccess: false
    },
    reducers:{
      clearThisState(state, { payload }) {
        state.data = {};
      },
    },
    extraReducers: {

      [addInvoice.pending]: (state, { payload }) => {
        state.loading = true;
      },
      [addInvoice.fulfilled]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = true;
        state.data = payload;
      },
      [addInvoice.rejected]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = false;
      },

      [updateInvoice.pending]: (state, { payload }) => {
        state.loading = true;
      },
      [updateInvoice.fulfilled]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = true;
        state.data = payload;
      },
      [updateInvoice.rejected]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = false;
      },


      
      [getInvoiceReport.pending]: (state, { payload }) => {
        state.loading = true;
      },
      [getInvoiceReport.fulfilled]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = true;
        state.data = payload;
      },
      [getInvoiceReport.rejected]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = false;
      },


         
      [getInvoiceReportById.pending]: (state, { payload }) => {
        state.loading = true;
      },
      [getInvoiceReportById.fulfilled]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = true;
        state.data = payload;
      },
      [getInvoiceReportById.rejected]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = false;
      },
      
      

    },
  });





export const { clearThisState } = invoiceSlice.actions;
export default invoiceSlice.reducer;




