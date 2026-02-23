import React, { useEffect, useState } from "react";
import { Card, FormGroup } from "react-bootstrap";
import TableData from "../../pagecomponents/Elements/TableData/TableData";
import {
  Dialog,
  DialogTitle,
} from "@mui/material";
import CustomButton from "../../pagecomponents/Elements/Buttons/CustomButton";
import { deleteJob } from "../../redux/slices/JobSlice";
import { Toastslideerror, Toastslidesucc } from "../../helpers/utility";
import { ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { pagesizeArray, takes } from "../../helpers/constants";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { format } from "date-fns";


const Confirm = ({title= 'Confirm', leaveCallBack}) => {
  const [open, setOpen] = useState(false);
  const [scroll, setscroll] = useState("paper");

  const noLeave = () => {
    setOpen(false);
  };

  const yesLeave = () => {
    setOpen(false);
    leaveCallBack();
  };
  

  return (
    <>
       <Dialog
          open={open}
          scroll={scroll}
          aria-labelledby="scroll-dialog-title"
          aria-describedby="scroll-dialog-description"
        >
          <div className="header-wrapper">
            <Card.Header>
              <h4 className="card-title mb-1"> {title}</h4>
            </Card.Header>
          </div>

          <Card.Body className=" pt-0">
            <div className="form-group">
              <div className="row align-items-center">
                <DialogTitle id="scroll-dialog-title">
                Are you sure you want to leave this pop-up?{" "}
                </DialogTitle>
              </div>
            </div>
          </Card.Body>

          <div className="footer-wrapper">
            <FormGroup className="form-group col mb-0 mt-3 d-flex justify-content-between pb-18">
              <CustomButton
                type="button"
                className="btn btn-sm me-2 btn-secondary"
                onClick={noLeave}
                title="No"
              />
              <CustomButton
                type="submit"
                className=" btn-lg btn-primary"
                onClick={yesLeave}
                title="Yes"
              />
            </FormGroup>
          </div>
        </Dialog>
    </>
  );
};

export default Confirm;

