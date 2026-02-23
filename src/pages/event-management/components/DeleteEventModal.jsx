import ModalWrapper from "../../../pagecomponents/Common/ModalWrapper";
import CustomButton from "../../../pagecomponents/Elements/Buttons/CustomButton";

const DeleteEventModal = ({ visible, onClose, onConfirm, loading = false, title }) => {
    const cancelStyles = {
        borderRadius: "999px",
        border: "1px solid #e5e7eb",
        background: "#fff",
        padding: "7px 18px",
        fontSize: 13,
        fontWeight: 600,
        color: "#374151",
    };

    return (
        <ModalWrapper
            visible={visible}
            onClose={onClose}
            modalTitle="Delete Event"
            modalSize="sm"
        >
            <p style={{ marginBottom: 20, color: "#374151", fontSize: 14 }}>
                Are you sure you want to delete <strong>{title}</strong>?
            </p>
            <div className="d-flex justify-content-end gap-2">
                <button type="button" style={cancelStyles} onClick={onClose}>
                    Cancel
                </button>
                <CustomButton
                    title="Delete"
                    onClick={onConfirm}
                    disabled={loading}
                />
            </div>
        </ModalWrapper>
    );
};

export default DeleteEventModal;

