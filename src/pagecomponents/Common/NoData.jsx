import React from "react";
import noFoundImage from '../../assets/img/svgicons/notfound.svg';

const NoData = () => {
  return (
    <>
    <div style={{ textAlign: "center", padding: "20px" }}>
      <img 
        src={noFoundImage} 
        alt="Error Illustration" 
        style={{ maxWidth: "50%" }} 
      />
    </div>
    </>
  );
};

export default NoData;

