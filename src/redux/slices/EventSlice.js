import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { postReq } from "../../helpers/api";
import { baseApiUrl } from "../../helpers/constants";

export const getEventData = createAsyncThunk(
    "event/list",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(baseApiUrl + "/event/list-new", payload);
            return resp;
        } catch (error) {
            rejectWithValue(error.response?.data ?? error);
        }
    }
);

export const addData = createAsyncThunk(
    "event/add",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(baseApiUrl + "/event/add", payload);
            return resp;
        } catch (error) {
            rejectWithValue(error.response?.data ?? error);
        }
    }
);

export const addMultipleWithSubEvents = createAsyncThunk(
    "event/add-multiple-with-sub-events",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(
                baseApiUrl + "/event/add-multiple-with-sub-events",
                payload
            );
            return resp;
        } catch (error) {
            rejectWithValue(error.response?.data ?? error);
        }
    }
);

export const updateData = createAsyncThunk(
    "event/update",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(baseApiUrl + "/event/update", payload);
            return resp;
        } catch (error) {
            rejectWithValue(error.response?.data ?? error);
        }
    }
);

export const updateWithSubEvents = createAsyncThunk(
    "event/update-with-sub-events",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(
                baseApiUrl + "/event/update-with-sub-events",
                payload
            );
            return resp;
        } catch (error) {
            rejectWithValue(error.response?.data ?? error);
        }
    }
);

export const deleteData = createAsyncThunk(
    "event/delete",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(baseApiUrl + "/event/delete", payload);
            return resp;
        } catch (error) {
            rejectWithValue(error.response?.data ?? error);
        }
    }
);

export const getById = createAsyncThunk(
    "event/get-by-id",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(baseApiUrl + "/event/get-by-id", payload);
            return resp;
        } catch (error) {
            rejectWithValue(error.response?.data ?? error);
        }
    }
);

export const getByIdWithSubEvents = createAsyncThunk(
    "event/get-by-id-with-sub-events",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(
                baseApiUrl + "/event/get-by-id-with-sub-events",
                payload
            );
            return resp;
        } catch (error) {
            rejectWithValue(error.response?.data ?? error);
        }
    }
);

export const searchData = createAsyncThunk(
    "event/search",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(baseApiUrl + "/event/search", payload);
            return resp;
        } catch (error) {
            rejectWithValue(error.response?.data ?? error);
        }
    }
);

export const listMainWithSubEvents = createAsyncThunk(
    "event/list-main-with-sub-events",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(
                baseApiUrl + "/event/list-main-with-sub-events",
                payload
            );
            return resp;
        } catch (error) {
            rejectWithValue(error.response?.data ?? error);
        }
    }
);

export const sendInvite = createAsyncThunk(
    "event-invite/send-invite",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(
                baseApiUrl + "/event-invite/send-invite",
                payload
            );
            return resp;
        } catch (error) {
            rejectWithValue(error.response?.data ?? error);
        }
    }
);

export const changeInviteStatus = createAsyncThunk(
    "event-invite/status-change",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(
                baseApiUrl + "/event-invite/status-change",
                payload
            );
            return resp;
        } catch (error) {
            rejectWithValue(error.response?.data ?? error);
        }
    }
);

export const changeEventStatus = createAsyncThunk(
    "event/status-change",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(
                baseApiUrl + "/event-invite/status-change",
                payload
            );
            return resp;
        } catch (error) {
            rejectWithValue(error.response?.data ?? error);
        }
    }
);

export const listInvites = createAsyncThunk(
    "event-invite/list",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(baseApiUrl + "/event-invite/list", payload);
            return resp;
        } catch (error) {
            rejectWithValue(error.response?.data ?? error);
        }
    }
);

export const deleteInvite = createAsyncThunk(
    "event-invite/delete",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(
                baseApiUrl + "/event-invite/delete",
                payload
            );
            return resp;
        } catch (error) {
            rejectWithValue(error.response?.data ?? error);
        }
    }
);

export const sendForApproval = createAsyncThunk(
    "event/approval",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(
                baseApiUrl + "/event/event-approval",
                payload
            );
            return resp;
        } catch (error) {
            rejectWithValue(error.response?.data ?? error);
        }
    }
);

export const searchInvite = createAsyncThunk(
    "event-invite/search",
    async (payload, { rejectWithValue }) => {
        try {
            let resp = await postReq(
                baseApiUrl + "/event-invite/search",
                payload
            );
            return resp;
        } catch (error) {
            rejectWithValue(error.response?.data ?? error);
        }
    }
);

const eventSlice = createSlice({
    name: "event",
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

export const { clearThisState } = eventSlice.actions;
export default eventSlice.reducer;

