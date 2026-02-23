import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {getReq, postReq} from "../../helpers/api";
import { baseApiUrl } from "../../helpers/constants";

export const getData = createAsyncThunk(
    "user/role-list",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/role/list', payload);
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

export const addData = createAsyncThunk(
    "user/role-add",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/role/add', payload);
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

export const updateData = createAsyncThunk(
    "user/role-update",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/role/update', payload);
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

export const getPermissionData = createAsyncThunk(
    "user/permission-data",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/permission/module-wise-permission', payload);
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

export const getPermissionDataForEdit = createAsyncThunk(
    "user/permission-data-for-edit",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/permission/module-wise-permission-for-edit', payload);
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

export const updateStatusData = createAsyncThunk(
    "user/role-status-update",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/role/status-update', payload);
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

export const deleteData = createAsyncThunk(
    "user/role-delete",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/role/delete', payload);
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

const masterUserRoleSlice = createSlice({
    name: "user-role",
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

export const { clearThisState } = masterUserRoleSlice.actions;
export default masterUserRoleSlice.reducer;

