import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {getReq, postReq} from "../../../helpers/api";
import { baseApiUrl } from "../../../helpers/constants";


export const addCustomer = createAsyncThunk(
  "customer/add",
  async (inputObj, {rejectWithValue}) => {
    
      try{
          let resp = await postReq(baseApiUrl+'/client-project/al-fadly/add-customer', inputObj);
          
          return resp;
      } catch(error){
          rejectWithValue(error.response.data);
      }
  }
); 


export const editCustomer = createAsyncThunk(
  "customer/edit",
  async (inputObj, {rejectWithValue}) => {
   
      try{
          let resp = await postReq(baseApiUrl+'/client-project/al-fadly/update-customer', inputObj);
          
          return resp;
      } catch(error){
          rejectWithValue(error.response.data);
      }
  }
); 


export const deleteCustomer = createAsyncThunk(
  "customer/delete",
  async (inputObj, {rejectWithValue}) => {
    
      try{
          let resp = await postReq(baseApiUrl+'/client-project/al-fadly/update-customer', inputObj);
          
          return resp;
      } catch(error){
          rejectWithValue(error.response.data);
      }
  }
); 



export const getCustomerData = createAsyncThunk(
  "customer/get",
  async (inputObj, {rejectWithValue}) => {
    
      try{
          let resp = await postReq(baseApiUrl+'/client-project/al-fadly/get-all-customer', inputObj);
          
          return resp;
      } catch(error){
          rejectWithValue(error.response.data);
      }
  }
);


export const getMasterData = createAsyncThunk(
  "master-data/get",
  async (inputObj, {rejectWithValue}) => {
      try{
          let resp = await postReq(baseApiUrl+'/client-project/al-fadly/get-master-list', inputObj);
          
          return resp;
      } catch(error){
          rejectWithValue(error.response.data);
      }
  }
);


export const getReceivableData = createAsyncThunk(
  "receivable-data/get",
  async (inputObj, {rejectWithValue}) => {
      try{
          let resp = await postReq(baseApiUrl+'/client-project/al-fadly/voucher-report', inputObj);
          
          return resp;
      } catch(error){
          rejectWithValue(error.response.data);
      }
  }
);


export const getPrintData = createAsyncThunk(
  "receivable-data/get",
  async (inputObj, {rejectWithValue}) => {
      try{
          let resp = await postReq(baseApiUrl+'/client-project/al-fadly/voucher-report', inputObj);
          
          return resp;
      } catch(error){
          rejectWithValue(error.response.data);
      }
  }
);










const customerSlice = createSlice({
    name: "master",
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

      [addCustomer.pending]: (state, { payload }) => {
        state.loading = true;
      },
      [addCustomer.fulfilled]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = true;
        state.data = payload;
      },
      [addCustomer.rejected]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = false;
      },


      [editCustomer.pending]: (state, { payload }) => {
        state.loading = true;
      },
      [editCustomer.fulfilled]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = true;
        state.data = payload;
      },
      [editCustomer.rejected]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = false;
      },


      [getCustomerData.pending]: (state, { payload }) => {
        state.loading = true;
      },
      [getCustomerData.fulfilled]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = true;
        state.data = payload;
      },
      [getCustomerData.rejected]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = false;
      },

      [deleteCustomer.pending]: (state, { payload }) => {
        state.loading = true;
      },
      [deleteCustomer.fulfilled]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = true;
        state.data = payload;
      },
      [deleteCustomer.rejected]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = false;
      },

      




      




      
    },
  });





export const { clearThisState } = customerSlice.actions;
export default customerSlice.reducer;




