import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { postReq } from "../../../helpers/api";
import { baseApiUrl } from "../../../helpers/constants";

export const getPlData = createAsyncThunk(
    "master/get-profit-loss",
    async (payload, {rejectWithValue}) => {
        try{
            let resp = await postReq(baseApiUrl+'/client-project/al-fadly/get-pnl-report', payload);
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

export const getBsData = createAsyncThunk(
    "master/get-balance-sheet",
    async (payload, {rejectWithValue}) => {
        try{
            let resp = await postReq(baseApiUrl+'/client-project/al-fadly/get-balance-sheet-report', payload);
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

const profitLoss = createSlice({
    name: "profit-loss",
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

export const { clearThisState } = profitLoss.actions;
export default profitLoss.reducer;
