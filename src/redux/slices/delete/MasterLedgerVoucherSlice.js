import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {getReq, postReq} from "../../../helpers/api";
import { baseApiUrl } from "../../../helpers/constants";

export const searchData = createAsyncThunk(
    "master/search-ledger",
    async (payload, {rejectWithValue}) => {
        try{
            let resp = await postReq(baseApiUrl+'/client-project/al-fadly/search-ledger', payload);
            
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

const masterLedgerVoucherSlice = createSlice({
    name: "ledger-voucher",
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

export const { clearThisState } = masterLedgerVoucherSlice.actions;
export default masterLedgerVoucherSlice.reducer;
