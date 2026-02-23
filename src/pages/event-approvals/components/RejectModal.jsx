import { useEffect, useState } from "react";
import ModalWrapper from "../../../pagecomponents/Common/ModalWrapper";
import CustomButton from "../../../pagecomponents/Elements/Buttons/CustomButton";

const RejectModal = ({ visible, onClose, onSubmit, loading = false }) => {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const maxLength = 100;

    const handleSubmit = () => {
        const trimmed = reason.trim();
        if (!trimmed) {
            setError("Comments are required.");
            return;
        }
        onSubmit?.(trimmed);
    };

    useEffect(() => {
        if (!visible) return;
        setReason("");
        setError("");
    }, [visible]);

    return (
        <ModalWrapper
            visible={visible}
            onClose={onClose}
            modalTitle="Rejected"
            modalSize="md"
            dialogClassName="reject-modal"
        >
            <style>
                {`
                .reject-modal .modal-content {
                    border-radius: 14px;
                    border: none;
                    overflow: hidden;
                }
                .reject-modal .modal-header {
                    background: #0b63f3;
                    border-bottom: 0;
                    padding: 16px 20px;
                }
                .reject-modal .modal-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: #fff;
                }
                .reject-modal .modal-body {
                    padding: 20px 24px 26px;
                }
                .reject-field {
                    width: 100%;
                    border-radius: 12px;
                    border: 1px solid #d1d5db;
                    padding: 12px 14px;
                    font-size: 13px;
                    color: #4b5563;
                    resize: none;
                    min-height: 190px;
                }
                .reject-field:focus {
                    outline: none;
                    border-color: #93c5fd;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
                }
                .reject-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 10px;
                }
                .reject-count {
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                }
                .reject-error {
                    margin-top: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #dc2626;
                }
                `}
            </style>

            <textarea
                className="reject-field"
                placeholder="Description"
                maxLength={maxLength}
                value={reason}
                onChange={(event) => {
                    setReason(event.target.value);
                    if (error) setError("");
                }}
            />
            {error ? <div className="reject-error">{error}</div> : null}

            <div className="reject-footer">
                <div className="reject-count">{`${reason.length}/${maxLength}`}</div>
                <CustomButton
                    title="Reject"
                    variant="danger"
                    onClick={handleSubmit}
                    loading={loading}
                    loadingText="Rejecting..."
                />
            </div>
        </ModalWrapper>
    );
};

export default RejectModal;

