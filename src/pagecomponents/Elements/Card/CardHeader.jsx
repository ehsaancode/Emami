import React from "react";
import { Card, Col, Row, Button } from "react-bootstrap";
import CustomButton from "../Buttons/CustomButton";

const CardHeader = ({ pageName, addButtonOnClick, addEnable='Yes' }) => {
  return (
    <>
      <Card.Header className="d-flex justify-content-between">
        <h4 className="card-title mg-b-0">Manage {pageName}</h4>
       
        {
          addEnable=='Yes' && pageName=='Report' &&  (
            <CustomButton
            className="btn btn-sm me-2 btn-dark float-end"
            type="button"
            title={"+ Add Invoice" }
            onClick={addButtonOnClick}
          />
          )
        }

          {
          addEnable=='Yes' && pageName!='Report' &&  (
            <CustomButton
            className="btn btn-sm me-2 btn-dark float-end"
            type="button"
            title={"+ Add " + pageName}
            onClick={addButtonOnClick}
          />
          )
        }
       
      </Card.Header>
    </>
  );
};

export default CardHeader;

