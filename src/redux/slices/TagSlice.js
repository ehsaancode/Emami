import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { postReq } from "../../helpers/api";
import { baseApiUrl } from "../../helpers/constants";

const getErrorPayload = (error, fallbackMessage) =>
    error?.response?.data || {
        status: "error",
        msg: fallbackMessage,
    };

export const getData = createAsyncThunk(
    "tag/list",
    async (payload, { rejectWithValue }) => {
        try {
            return await postReq(`${baseApiUrl}/tag/list`, payload);
        } catch (error) {
            return rejectWithValue(
                getErrorPayload(error, "Failed to fetch tags.")
            );
        }
    }
);

export const addData = createAsyncThunk(
    "tag/add",
    async (payload, { rejectWithValue }) => {
        try {
            return await postReq(`${baseApiUrl}/tag/add`, payload);
        } catch (error) {
            return rejectWithValue(
                getErrorPayload(error, "Failed to add tag.")
            );
        }
    }
);

export const updateData = createAsyncThunk(
    "tag/update",
    async (payload, { rejectWithValue }) => {
        try {
            return await postReq(`${baseApiUrl}/tag/update`, payload);
        } catch (error) {
            return rejectWithValue(
                getErrorPayload(error, "Failed to update tag.")
            );
        }
    }
);

export const deleteData = createAsyncThunk(
    "tag/delete",
    async (payload, { rejectWithValue }) => {
        try {
            return await postReq(`${baseApiUrl}/tag/delete`, payload);
        } catch (error) {
            return rejectWithValue(
                getErrorPayload(error, "Failed to delete tag.")
            );
        }
    }
);

export const getById = createAsyncThunk(
    "tag/get-by-id",
    async (payload, { rejectWithValue }) => {
        try {
            return await postReq(`${baseApiUrl}/tag/get-by-id`, payload);
        } catch (error) {
            return rejectWithValue(
                getErrorPayload(error, "Failed to fetch tag details.")
            );
        }
    }
);

export const assignToContact = createAsyncThunk(
    "tag/assign",
    async (payload, { rejectWithValue }) => {
        try {
            return await postReq(`${baseApiUrl}/tag/assign`, payload);
        } catch (error) {
            return rejectWithValue(
                getErrorPayload(error, "Failed to assign tag to contact.")
            );
        }
    }
);

export const assignData = assignToContact;

const tagSlice = createSlice({
    name: "tag",
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

export const { clearThisState } = tagSlice.actions;
export default tagSlice.reducer;
