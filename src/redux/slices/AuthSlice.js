import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getReq, postReq } from "../../helpers/api";
import { baseApiUrl } from "../../helpers/constants";
import { clearStorage } from "../../helpers/utility";

const initialState = {
  userdata: {},
  jjpi: '',
  uuid: '',
  profile: null,
  roles: [],
  permissions: [],
  profileLoading: false,
  profileError: null,
  loading: false,
  isSuccess: false
};

export const checkLogin = createAsyncThunk(
  "auth/checklogin",
  async (checkLoginPayload, { rejectWithValue }) => {
    try {
      let resp = await postReq(baseApiUrl + '/api/auth/checklogin', checkLoginPayload);
      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);

export const doLogin = createAsyncThunk(
  "auth/login",
  async ({ inputData }, { rejectWithValue }) => {
    try {

      const response = await postReq(baseApiUrl + '/auth/login', { inputData: inputData });
      return response;

    } catch (error) {

      return rejectWithValue(
        error.response?.data || { msg: "Login failed" }
      );

    }
  }
);

export const fetchAuthUser = createAsyncThunk(
  "user/auth/user",
  async (_, { rejectWithValue }) => {
    try {
      const response = await postReq(`${baseApiUrl}/user/auth/user`);
      if (response?.response) {
        return rejectWithValue(response.response?.data || response);
      }

      return response?.data ?? response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Unable to fetch user profile" });
    }
  }
);



const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    doLogout(state, { payload }) {
      clearStorage();
      state = initialState;
    }
  },
  extraReducers: {
    [checkLogin.pending]: (state, { payload }) => {
      state.loading = true;
    },
    [checkLogin.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = true;
      state.userdata = payload.userdata;
      state.jjpi = payload.jjpi;
      state.uuid = payload.uuid;
    },
    [checkLogin.rejected]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = false;
    },


    [doLogin.pending]: (state, { payload }) => {
      state.loading = true;
    },
    [doLogin.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = true;
      state.userdata = payload.userdata;
      state.jjpi = payload.jjpi;
      state.uuid = payload.uuid;
    },
    [doLogin.rejected]: (state, { payload }) => {
      state.loading = false;
      state.isSuccess = false;
    },


    [fetchAuthUser.pending]: (state) => {
      state.profileLoading = true;
      state.profileError = null;
    },
    [fetchAuthUser.fulfilled]: (state, { payload }) => {
      state.profileLoading = false;
      state.profile = payload?.data?.user || payload?.user || null;
      state.roles = payload?.data?.roles || payload?.roles || [];
      state.permissions = payload?.data?.permissions || payload?.permissions || [];
    },
    [fetchAuthUser.rejected]: (state, { payload }) => {
      state.profileLoading = false;
      state.profileError = payload || { msg: "Unable to fetch user profile" };
    },
  },
});

export const { doLogout } = authSlice.actions;
export default authSlice.reducer;

