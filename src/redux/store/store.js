import { configureStore } from "@reduxjs/toolkit";
import rootred from "../reducers/main";

export default configureStore({
    reducer:rootred,
});
