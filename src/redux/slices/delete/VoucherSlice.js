import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getReq, postReq } from "../../../helpers/api";
import { baseApiUrl } from "../../../helpers/constants";

export const getData = createAsyncThunk(
  "voucher/get",
  async (inputObj, { rejectWithValue }) => {
    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/voucher-list",
        inputObj
      );

      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);
export const printData = createAsyncThunk(
  "voucher/print",
  async (inputObj, { rejectWithValue }) => {
    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/voucher-detail-print",
        inputObj
      );

      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);
export const addData = createAsyncThunk(
  "voucher/add",
  async (inputObj, { rejectWithValue }) => {
    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/add-voucher",
        inputObj
      );

      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);

export const editVchData = createAsyncThunk(
  "voucher/edit",
  async (inputObj, { rejectWithValue }) => {
    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/update-voucher",
        inputObj
      );

      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);

export const deleteData = createAsyncThunk(
  "voucher/delete",
  async (inputObj, { rejectWithValue }) => {
    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/update-voucher",
        inputObj
      );

      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);

export const voucherStatement = createAsyncThunk(
  "voucher/statement",
  async (inputObj, { rejectWithValue }) => {
    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/voucher-statement",
        inputObj
      );

      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);

const voucherSlice = createSlice({
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
    [getData.pending]: (state, { payload }) => {
      state.loading = true;
    },
    [getData.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = true;
      state.data = payload;
    },
    [getData.rejected]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = false;
    },

    [addData.pending]: (state, { payload }) => {
      state.loading = true;
    },
    [addData.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = true;
      state.data = payload;
    },
    [addData.rejected]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = false;
    },

    [editVchData.pending]: (state, { payload }) => {
      state.loading = true;
    },
    [editVchData.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = true;
      state.data = payload;
    },
    [editVchData.rejected]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = false;
    },

    [deleteData.pending]: (state, { payload }) => {
      state.loading = true;
    },
    [deleteData.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = true;
      state.data = payload;
    },
    [deleteData.rejected]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = false;
    },

    [voucherStatement.pending]: (state, { payload }) => {
      state.loading = true;
    },
    [voucherStatement.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = true;
      state.data = payload;
    },
    [voucherStatement.rejected]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = false;
    },
  },
});

export const { clearThisState } = voucherSlice.actions;
export default voucherSlice.reducer;

