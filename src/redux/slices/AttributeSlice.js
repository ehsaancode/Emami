import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getReq, postReq, CONFIG } from "../../helpers/api";
import { baseApiUrl } from "../../helpers/constants";

export const addAttribute = createAsyncThunk(
  "attribute/add",
  async (payload, { rejectWithValue }) => {
    try {
      let resp = await postReq(baseApiUrl + "/api/attribute/add", payload);
      return resp;
    } catch (error) {
      rejectWithValue(error.response.data);
    }
  }
);

