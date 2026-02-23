import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getReq, postReq } from "../../../helpers/api";
import { baseApiUrl } from "../../../helpers/constants";

export const getData = createAsyncThunk(
  "master/get-income-statement",
  async (payload, { rejectWithValue }) => {
    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/income-statement",
        payload
      );
      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);

export const getStatementData = createAsyncThunk(
  "master/get-income-statement-data",
  async (payload, { rejectWithValue }) => {
    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/income-statement-data",
        payload
      );
      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);

const masterIncomeStatementSlice = createSlice({
  name: "income-statement",
  initialState: {
    data: [],
    loading: false,
    isSuccess: false,
  },
  reducers: {
    clearThisState(state, { xxx }) {
      state.data = {};
    },
  },
  extraReducers: {},
});

export const { clearThisState } = masterIncomeStatementSlice.actions;
export default masterIncomeStatementSlice.reducer;

