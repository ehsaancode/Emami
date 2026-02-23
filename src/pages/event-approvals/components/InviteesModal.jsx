import ModalWrapper from "../../../pagecomponents/Common/ModalWrapper";
import CustomButton from "../../../pagecomponents/Elements/Buttons/CustomButton";

const InviteesModal = ({ visible, onClose, invitees = [] }) => {
    const rows = invitees;

    return (
        <ModalWrapper
            visible={visible}
            onClose={onClose}
            modalTitle="Invitees"
            modalSize="lg"
            dialogClassName="invitees-modal"
        >
            <style>
                {`
                .invitees-modal .modal-content {
                    border-radius: 14px;
                    border: none;
                    overflow: hidden;
                }
                .invitees-modal .modal-header {
                    background: #0b63f3;
                    border-bottom: 0;
                    padding: 16px 20px;
                }
                .invitees-modal .modal-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: #fff;
                }
                .invitees-modal .modal-body {
                    padding: 20px 24px 26px;
                }
                .invitees-table {
                    width: 100%;
                    border-collapse: collapse;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06);
                }
                .invitees-table thead th {
                    background: #0b63f3;
                    color: #fff;
                    font-size: 13px;
                    font-weight: 700;
                    text-align: left;
                    padding: 12px 16px;
                }
                .invitees-table tbody td {
                    font-size: 13px;
                    font-weight: 600;
                    color: #6b7280;
                    padding: 14px 16px;
                }
                .invitees-table tbody tr:nth-child(even) {
                    background: #f7faff;
                }
                .invitees-tag {
                    display: inline-flex;
                    align-items: center;
                    border-radius: 999px;
                    border: 1px solid #f59e0b;
                    color: #f59e0b;
                    padding: 2px 8px;
                    font-size: 11px;
                    font-weight: 700;
                    margin-right: 6px;
                }
                .invitees-tag.green {
                    border-color: #22c55e;
                    color: #16a34a;
                    background: #ecfdf5;
                }
                .invitees-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 18px;
                }
                `}
            </style>

            {rows.length === 0 ? (
                <div className="text-muted">No invitees found.</div>
            ) : (
                <table className="invitees-table">
                    <thead>
                        <tr>
                            <th>Contact Name</th>
                            <th>Invited by</th>
                            <th>Association</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => {
                            const associations = Array.isArray(row.association)
                                ? row.association
                                : row.association
                                    ? [row.association]
                                    : [];
                            return (
                                <tr key={`${row.name}-${index}`}>
                                    <td>{row.name}</td>
                                    <td>{row.invitedBy}</td>
                                    <td>
                                        {associations.length === 0 ? (
                                            <span className="text-muted">-</span>
                                        ) : (
                                            associations.map((assoc, assocIndex) => (
                                                <span
                                                    key={`${assoc}-${assocIndex}`}
                                                    className={`invitees-tag ${
                                                        assocIndex > 0 ? "green" : ""
                                                    }`}
                                                >
                                                    {assoc}
                                                </span>
                                            ))
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            <div className="invitees-actions">
                <CustomButton title="Cancel" variant="secondary" onClick={onClose} />
                <CustomButton title="Print" variant="primary" />
            </div>
        </ModalWrapper>
    );
};

export default InviteesModal;

