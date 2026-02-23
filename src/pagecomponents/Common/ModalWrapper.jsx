import React from "react";
import { Modal } from "react-bootstrap";
import IconBox from "./IconBox";
import "./ModalWrapper.css";

const ModalWrapper = ({
    visible,
    onClose,
    modalTitle,
    modalSize,
    children,
    footerFlag = false,
    footerBody,
    dialogClassName
}) => {
    const mergedDialogClassName = `${dialogClassName ? `${dialogClassName} ` : ""}app-modal-dialog`;

    return(
        <Modal
            size={modalSize}
            show={visible}
            onHide={onClose}
            dialogClassName={mergedDialogClassName}
            contentClassName="app-modal-content"
            centered
        >
            <Modal.Header className="app-modal-header text-white">
                <Modal.Title>{modalTitle}</Modal.Title>
                {/* <Button variant="" className="btn btn-close text-white" onClick={onClose}>x</Button> */}
                {/* <CustomButton onClick={onClose}>x</CustomButton> */}
                {/* <i class="fe fe-x" title="fe fe-x"></i> */}
                <IconBox 
                    iconName="fe fe-x tx-14 text-primary"
                    onClick={onClose}
                />
            </Modal.Header>
            <Modal.Body className="app-modal-body"> {children} </Modal.Body>
            {footerFlag && <Modal.Footer className="app-modal-footer">{footerBody}</Modal.Footer>}
        </Modal>
    );
};
export default ModalWrapper;

