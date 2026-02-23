import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {getReq, postReq} from "../../../helpers/api";
import { baseApiUrl } from "../../../helpers/constants";

export const addClient = createAsyncThunk(
  "client/add",
  async (inputObj, {rejectWithValue}) => {
     
      try{
        //let inputData = {"inputData":inputObj};
          let resp = await postReq(baseApiUrl+'/clientpanel/add-client', inputObj);
          
          return resp;
      } catch(error){
          rejectWithValue(error.response.data);
      }
  }
); 


export const getClientData = createAsyncThunk(
  "client/get",
  async (blank,{rejectWithValue}) => {
      try{
          let resp = await postReq(baseApiUrl+'/clientpanel/get-clients');
          return resp;
      } catch(error){
          rejectWithValue(error.response.data);
      }
  }
); 


export const editClient = createAsyncThunk(
  "client/edit",
  async (inputObj, {rejectWithValue}) => {
     
      try{
        //let inputData = {"inputData":inputObj};
          let resp = await postReq(baseApiUrl+'/clientpanel/update-clients', inputObj);
          
          return resp;
      } catch(error){
          rejectWithValue(error.response.data);
      }
  }
); 



export const deleteClient = createAsyncThunk(
  "client/delete",
  async (inputObj, {rejectWithValue}) => {
     
      try{
        //let inputData = {"inputData":inputObj};
          let resp = await postReq(baseApiUrl+'/clientpanel/delete-clients', inputObj);
          
          return resp;
      } catch(error){
          rejectWithValue(error.response.data);
      }
  }
); 






const clientSlice = createSlice({
    name: "client",
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

      [addClient.pending]: (state, { payload }) => {
        state.loading = true;
      },
      [addClient.fulfilled]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = true;
        state.data = payload;
      },
      [addClient.rejected]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = false;
      },



      [getClientData.pending]: (state, { payload }) => {
        state.loading = true;
      },
      [getClientData.fulfilled]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = true;
        state.data = payload;

      },
      [getClientData.rejected]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = false;
      },



      [editClient.pending]: (state, { payload }) => {
        state.loading = true;
      },
      [editClient.fulfilled]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = true;
        state.data = payload;

      },
      [editClient.rejected]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = false;
      },

      

      [deleteClient.pending]: (state, { payload }) => {
        state.loading = true;
      },
      [deleteClient.fulfilled]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = true;
        state.data = payload;

      },
      [deleteClient.rejected]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = false;
      },



      
    },
  });





export const { clearThisState } = clientSlice.actions;
export default clientSlice.reducer;




