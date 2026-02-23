import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getReq, postReq } from "../../../helpers/api";
import { baseApiUrl } from "../../../helpers/constants";

export const getMasterList = createAsyncThunk(
  "ledger/master-list",
  async (inputObj, { rejectWithValue }) => {
    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/get-master-list",
        inputObj
      );

      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);

export const getLedger = createAsyncThunk(
  "ledger/get",
  async (inputObj, { rejectWithValue }) => {
    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/get-ledger",
        inputObj
      );

      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);

export const addLedger = createAsyncThunk(
  "ledger/add",
  async (inputObj, { rejectWithValue }) => {
    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/add-ledger",
        inputObj
      );

      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);

export const editLedger = createAsyncThunk(
  "ledger/edit",
  async (inputObj, { rejectWithValue }) => {
    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/update-ledger",
        inputObj
      );

      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);

export const deleteLedger = createAsyncThunk(
  "ledger/delete",
  async (inputObj, { rejectWithValue }) => {
    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/update-ledger",
        inputObj
      );

      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);

const ledgerSlice = createSlice({
  name: "master",
  initialState: {
    data: [],
    loading: false,
    isSuccess: false,
  },
  reducers: {
    clearThisState(state, { payload }) {
      state.data = {};
    },
  },
  extraReducers: {
    [getLedger.pending]: (state, { payload }) => {
      state.loading = true;
    },
    [getLedger.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = true;
      state.data = payload;
    },
    [getLedger.rejected]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = false;
    },

    [addLedger.pending]: (state, { payload }) => {
      state.loading = true;
    },
    [addLedger.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = true;
      state.data = payload;
    },
    [addLedger.rejected]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = false;
    },

    [editLedger.pending]: (state, { payload }) => {
      state.loading = true;
    },
    [editLedger.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = true;
      state.data = payload;
    },
    [editLedger.rejected]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = false;
    },

    [deleteLedger.pending]: (state, { payload }) => {
      state.loading = true;
    },
    [deleteLedger.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = true;
      state.data = payload;
    },
    [deleteLedger.rejected]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = false;
    },
  },
});

export const { clearThisState } = ledgerSlice.actions;
export default ledgerSlice.reducer;

