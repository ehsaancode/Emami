import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getReq, postReq } from "../../../helpers/api";
import { baseApiUrl } from "../../../helpers/constants";


export const submitCreateLead = createAsyncThunk(
    "history/fetch",
    async (inputData, { rejectWithValue }) => {
        console.log(inputData);
        try {
            let resp = await postReq(baseApiUrl + '/api/sales/leads/create', inputData);
            console.log("resp::: ", resp);
            return resp;
        } catch (error) {
            rejectWithValue(error.response.data);
        }
    }
);

const historySlice = createSlice({
    name: "history",
    initialState: {
        data: [],
        loading: false,
        isSuccess: false
    },
    reducers: {
        clearThisState(state, { payload }) {
            state.data = {};
        },
    },
    extraReducers: {
        [submitCreateLead.pending]: (state, { payload }) => {
            state.loading = true;
        },
        [submitCreateLead.fulfilled]: (state, { payload }) => {
            state.loading = false;
            state.isSuccess = true;
            state.data = payload;
        },
        [submitCreateLead.rejected]: (state, { payload }) => {
            state.loading = false;
            state.isSuccess = false;
        },
    },
});


export const { clearThisState } = historySlice.actions;
export default historySlice.reducer;







