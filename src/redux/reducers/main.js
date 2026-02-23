import {combineReducers} from "redux";
import { cartreducer } from "./reducer";
import authSlice from "../slices/AuthSlice";
//import basicDataSlice from "../slices/BasicDataSlice";
import HeaderSearchSlice from '../slices/HeaderSearchSlice';
//import clientSlice from '../slices/ManageClientSlice';
// import masterSlice from '../slices/MasterClientSlice';
// import customerSlice from '../slices/CustomerSlice';
// import jobSlice from '../slices/JobSlice';
// import invoiceSlice from '../slices/InvoiceSlice';
// import masterPaymentModeSlice from '../slices/MasterPaymentModeSlice';
// import masterJobTypeSlice from '../slices/MasterJobTypeSlice';
// import masterSupplierSlice from '../slices/MasterSupplierSlice';
// import masterIncomeStatementSlice from '../slices/MasterIncomeStatementSlice';
// import masterLedgerVoucherSlice from '../slices/MasterLedgerVoucherSlice';

const rootred = combineReducers({
    cartreducer,
    authSlice: authSlice,
    //basicDataSlice: basicDataSlice,
    HeaderSearchSlice:HeaderSearchSlice,
    //clientSlice:clientSlice,
    // masterSlice:masterSlice,
    // customerSlice:customerSlice,
    // jobSlice:jobSlice,
    // invoiceSlice: invoiceSlice,
    // masterPaymentModeSlice: masterPaymentModeSlice,
    // masterJobTypeSlice: masterJobTypeSlice,
    // masterSupplierSlice: masterSupplierSlice,
    // masterIncomeStatementSlice: masterIncomeStatementSlice,
    // masterLedgerVoucherSlice: masterLedgerVoucherSlice
    
});

export default rootred
