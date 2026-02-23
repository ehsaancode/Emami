import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {getReq, postReq} from "../../../helpers/api";
import { baseApiUrl } from "../../../helpers/constants";


export const getMasterData = createAsyncThunk(
  "master/get",
  async (inputObj, {rejectWithValue}) => {
     
      try{
          let resp = await postReq(baseApiUrl+'/client-project/al-fadly/get-master-list', inputObj);
          
          return resp;
      } catch(error){
          rejectWithValue(error.response.data);
      }
  }
); 







const masterSlice = createSlice({
    name: "master",
    initialState:{
      data:[],
      loading:false,
      isSuccess: false
    },
    reducers:{
      clearThisState(state, { payload }) {
        state.data = {};
      },
    },
    extraReducers: {

      [getMasterData.pending]: (state, { payload }) => {
        state.loading = true;
      },
      [getMasterData.fulfilled]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = true;
        state.data = payload;
      },
      [getMasterData.rejected]: (state, { payload }) => {
        state.loading = false;
        state.isSuccess = false;
      },





      




      
    },
  });





export const { clearThisState } = masterSlice.actions;
export default masterSlice.reducer;




