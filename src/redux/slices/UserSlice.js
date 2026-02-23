import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { postReq } from "../../helpers/api";
import { baseApiUrl } from "../../helpers/constants";

const getErrorPayload = (error, fallbackMessage) => {
  return (
    error?.response?.data || {
      status: "error",
      msg: fallbackMessage,
    }
  );
};

export const getData = createAsyncThunk("user/list", async (payload, { rejectWithValue }) => {
  try {
    return await postReq(`${baseApiUrl}/user/list`, payload);
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, "Failed to fetch users."));
  }
});

export const addData = createAsyncThunk("user/add", async (payload, { rejectWithValue }) => {
  try {
    return await postReq(`${baseApiUrl}/user/add`, payload);
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, "Failed to add user."));
  }
});

export const updateData = createAsyncThunk("user/update", async (payload, { rejectWithValue }) => {
  try {
    return await postReq(`${baseApiUrl}/user/update`, payload);
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, "Failed to update user."));
  }
});

export const deleteData = createAsyncThunk("user/delete", async (payload, { rejectWithValue }) => {
  try {
    return await postReq(`${baseApiUrl}/user/delete`, payload);
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, "Failed to delete user."));
  }
});

export const updateStatusData = createAsyncThunk(
  "user/status",
  async (payload, { rejectWithValue }) => {
    try {
      return await postReq(`${baseApiUrl}/user/status`, payload);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to update user status."));
    }
  }
);

export const getRoleSearchList = createAsyncThunk(
  "user/role-search-list",
  async (payload, { rejectWithValue }) => {
    try {
      return await postReq(`${baseApiUrl}/role/search-list`, payload);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Failed to fetch role options."));
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    data: [],
    loading: false,
    isSuccess: false,
  },
  reducers: {
    clearThisState(state) {
      state.data = {};
    },
  },
  extraReducers: {},
});

export const { clearThisState } = userSlice.actions;
export default userSlice.reducer;

