import React from "react";
import { Modal } from "react-bootstrap";
import CustomButton from "../Elements/Buttons/CustomButton";
import "./DeleteConfirmationModal.css";

const DeleteConfirmationModal = ({ show, onHide, onConfirm, message }) => {
  const handleConfirm = () => {
    if (typeof onConfirm === "function") {
      onConfirm();
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName="delete-confirmation-modal"
      contentClassName="delete-confirmation-modal__content"
    >
      <Modal.Body className="delete-confirmation-modal__body">
        <button
          type="button"
          className="delete-confirmation-modal__close"
          onClick={onHide}
          aria-label="Close"
        >
          <i className="fe fe-x"></i>
        </button>

        <div className="delete-confirmation-modal__icon-wrap" aria-hidden="true">
          <i className="fe fe-alert-triangle"></i>
        </div>

        <h4 className="delete-confirmation-modal__title">Confirm Delete</h4>
        <p className="delete-confirmation-modal__message">
          {message || "This action cannot be undone."}
        </p>

        <div className="delete-confirmation-modal__actions">
          <CustomButton
            title="Cancel"
            variant="secondary"
            onClick={onHide}
            className="delete-confirmation-modal__btn"
          />
          <CustomButton
            title="Delete"
            variant="danger"
            onClick={handleConfirm}
            className="delete-confirmation-modal__btn"
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteConfirmationModal;

