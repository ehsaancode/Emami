import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { postReq } from "../../helpers/api";
import { baseApiUrl } from "../../helpers/constants";

export const getData = createAsyncThunk(
    "contact/list",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/contact/list', payload);
            return resp;
        } catch(error){
            return rejectWithValue(error?.response?.data || error);
        }
    }
);

export const addData = createAsyncThunk(
    "contact/add",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/contact/new', payload);
            return resp;
        } catch(error){
            return rejectWithValue(error?.response?.data || error);
        }
    }
);

export const updateData = createAsyncThunk(
    "contact/update",
    async (payload, {rejectWithValue}) => {
        try{
            const contactId =
                payload?.inputData?.contact_Contact_Id ||
                payload?.contact_Contact_Id ||
                payload?.id;
            if (!contactId) {
                return rejectWithValue({ msg: "Missing contact id for update." });
            }
            let resp = await postReq(baseApiUrl+`/contact/update/${contactId}`, payload);
            return resp;
        } catch(error){
            return rejectWithValue(error?.response?.data || error);
        }
    }
);

export const searchData = createAsyncThunk(
    "contact/search",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/contact/search', payload);
            return resp;
        } catch(error){
            return rejectWithValue(error?.response?.data || error);
        }
    }
);

export const searchAddress = createAsyncThunk(
    "contact/search-address",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(baseApiUrl + '/contact/search-address', payload);
            return resp;
        } catch (error) {
            return rejectWithValue(error?.response?.data || error);
        }
    }
);

export const deleteData = createAsyncThunk(
    "contact/delete",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/contact/delete', payload);
            return resp;
        } catch(error){
            return rejectWithValue(error?.response?.data || error);
        }
    }
);

export const manageFamily = createAsyncThunk(
    "contact/manageFamily",
    async (payload, {rejectWithValue}) => {
       
        try{
            let resp = await postReq(baseApiUrl+'/family/assign-member', payload);
            return resp;
        } catch(error){
            return rejectWithValue(error?.response?.data || error);
        }
    }
);

const contactSlice = createSlice({
    name: "contact",
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

export const { clearThisState } = contactSlice.actions;
export default contactSlice.reducer;

