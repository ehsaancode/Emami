import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getReq, postReq } from "../../../helpers/api";
import { baseApiUrl } from "../../../helpers/constants";

export const addJob = createAsyncThunk(
  "job/add",
  async (inputObj, { rejectWithValue }) => {
    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/add-job",
        inputObj
      );

      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);
export const editJob = createAsyncThunk(
  "job/edit",

  async (inputObj, { rejectWithValue }) => {
    console.log("hii", inputObj);

    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/update-job",
        inputObj
      );

      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);

export const listJob = createAsyncThunk(
  "job/add",
  async (inputObj, { rejectWithValue }) => {
    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/get-joblist",
        inputObj
      );

      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);

export const deleteJob = createAsyncThunk(
  "job/delete",
  async (inputObj, { rejectWithValue }) => {
    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/update-job",
        inputObj
      );

      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);

export const getJobDocList = createAsyncThunk(
  "job/doc",
  async (inputObj, { rejectWithValue }) => {
    try {
      let resp = await postReq(
        baseApiUrl + "/client-project/al-fadly/get-job-docno",
        inputObj
      );

      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);

const jobSlice = createSlice({
  name: "job",
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
    [addJob.pending]: (state, { payload }) => {
      state.loading = true;
    },
    [addJob.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = true;
      state.data = payload;
    },
    [addJob.rejected]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = false;
    },

    [listJob.pending]: (state, { payload }) => {
      state.loading = true;
    },
    [listJob.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = true;
      state.data = payload;
    },
    [listJob.rejected]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = false;
    },

    [deleteJob.pending]: (state, { payload }) => {
      state.loading = true;
    },
    [deleteJob.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = true;
      state.data = payload;
    },
    [deleteJob.rejected]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = false;
    },

    [editJob.pending]: (state, { payload }) => {
      state.loading = true;
    },
    [editJob.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = true;
      state.data = payload;
    },
    [editJob.rejected]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = false;
    },

    [getJobDocList.pending]: (state, { payload }) => {
      state.loading = true;
    },
    [getJobDocList.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = true;
      state.data = payload;
    },
    [getJobDocList.rejected]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = false;
    },
  },
});

export const { clearThisState } = jobSlice.actions;
export default jobSlice.reducer;

