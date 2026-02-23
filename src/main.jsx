import React from 'react';
import ReactDOM from 'react-dom/client';
import Routers from './routes/Routers';
import 'react-datepicker/dist/react-datepicker.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './index.scss';
import { Provider } from 'react-redux';
import store from './redux/store/store';
import './assets/css/custom.css';
import './assets/css/custom-saurab.css';
import './assets/css/custom-rahul.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <React.Fragment>
      <Routers />
    </React.Fragment>
  </Provider>,
);

