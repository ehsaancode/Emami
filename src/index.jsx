import React from "react";
import ReactDOM from "react-dom/client";
import Routers from "./routes/Routers";
import "./index.scss";
import { Provider } from "react-redux";
import store from "./redux/store/store";
import "./assets/css/custom.css";
import "./assets/css/custom-saurab.css";
import "./assets/css/custom-rahul.css";

//Form
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <React.Fragment>
      <Routers />
    </React.Fragment>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

