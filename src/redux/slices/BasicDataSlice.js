import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {getReq, postReq, CONFIG} from "../../helpers/api";
import { baseApiUrl } from "../../helpers/constants";

const initialState = {
    agentnamelist:{},
    all_staff:{},
    colorlist:{},
    common_cuisines:{},
    dineorder_country_list:{},
    dineorder_server_list:{},
    staff_departments:{},
    staffnamelist:{},
    loading:false,
    isSuccess: false
};

export const getBasicdata = createAsyncThunk(
    "basicdata/get",
    async (blank,{rejectWithValue}) => {
        try{
            let resp = await postReq(baseApiUrl+'/client-project/al-fadly/get_basic_data');
            return resp;
        } catch(error){
            rejectWithValue(error.response.data);
        }
    }
); 

const basicDataSlice = createSlice({
    name: "basicdata",
    initialState:initialState,
    reducers:{},
    extraReducers: {
      [getBasicdata.pending]: (state, { payload }) => {
        state.loading = true;
      },
      [getBasicdata.fulfilled]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = true;
        state.all_staff = payload.all_staff;
        state.colorlist = payload.colorlist;
        state.common_cuisines = payload.common_cuisines;
        state.agentnamelist = payload.agentnamelist;
        state.dineorder_country_list = payload.dineorder_country_list;
        state.dineorder_server_list = payload.dineorder_server_list;
        state.staff_departments = payload.staff_departments;
        state.staffnamelist = payload.staffnamelist;

      },
      [getBasicdata.rejected]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = false;
      },
    },
});

export default basicDataSlice.reducer;       
