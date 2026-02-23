import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {postReq} from "../../../helpers/api";
import { baseApiUrl } from "../../../helpers/constants";

export const getDayBook = createAsyncThunk(
    "master/get-income-statement",
    async (payload, {rejectWithValue}) => {
        try{
            let resp = await postReq(baseApiUrl+'/client-project/al-fadly/day-book-report', payload);
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
);

const masterDayBookSlice = createSlice({
    name: "day-book",
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

export const { clearThisState } = masterDayBookSlice.actions;
export default masterDayBookSlice.reducer;
