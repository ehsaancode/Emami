import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { postReq } from "../../helpers/api";
import { baseApiUrl } from "../../helpers/constants";

export const getData = createAsyncThunk(
    "family-group/list",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/family/all', payload);
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

export const addData = createAsyncThunk(
    "family-group/add",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/family/add', payload);
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

export const updateData = createAsyncThunk(
    "family-group/update",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/family/update', payload);
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

export const deleteData = createAsyncThunk(
    "family-group/delete",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/family/delete', payload);
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

export const assignMember = createAsyncThunk(
    "family-group/assign-member",
    async (payload, {rejectWithValue}) => {
        try{
            let resp = await postReq(baseApiUrl+'/family/assign-member', payload);
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

export const removeMember = createAsyncThunk(
    "family-group/remove-member",
    async (payload, {rejectWithValue}) => {
        try{
            let resp = await postReq(baseApiUrl+'/family/remove-member', payload);
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

const familyGroupSlice = createSlice({
    name: "family-group",
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

export const { clearThisState } = familyGroupSlice.actions;
export default familyGroupSlice.reducer;

