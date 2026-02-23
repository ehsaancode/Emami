import React from 'react';
import loaderSvg from '../../assets/img/loader.svg';

const Loader = () => {
  return (
    <div id="global-loader">
      <img src={loaderSvg} className="loader-img" alt="Loader" />
    </div>
  );
};

export default Loader;
