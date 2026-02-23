import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import {postReq} from "../../helpers/api";
import { baseApiUrl } from "../../helpers/constants";

export const filterBusiness = createAsyncThunk("business/fetch",async (inputData, {rejectWithValue}) => {
    try{
        let resp = await postReq(baseApiUrl+'/api/autocomplete-topbar', inputData);
        
        return resp;
    } catch(error){
        rejectWithValue(error.response.data);
    }
  }
); 

const HeaderSearchSlice = createSlice({
    name:"headerSearchSlice",
    initialState:{
        data:[],
        loading:false,
        isSuccess: false,
        searchValue: '',
    },
    reducers:{
        clearThisState(state, { payload }) {
            state.data = {};
        },
        setSearchValue(state,action){
            state.searchValue = action.payload;
        },
        clearText(state,action){
            state.searchValue = ""
        }       
    },
    extraReducers:{
        [filterBusiness.pending]: (state, { payload }) => {
            state.loading = true;
        },
        [filterBusiness.fulfilled]: (state, { payload }) => {
            state.loading = false;
            state.isSuccess = true;
            state.data = payload;
        },
        [filterBusiness.rejected]: (state, { payload }) => {
            state.loading = false;
            state.isSuccess = false;
        },
    }
})
export const {clearThisState,setSearchValue,clearText} = HeaderSearchSlice.actions;
export default HeaderSearchSlice.reducer;
