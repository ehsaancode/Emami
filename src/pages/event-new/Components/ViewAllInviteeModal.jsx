import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import ModalWrapper from "../../../pagecomponents/Common/ModalWrapper";
import { toastMessage } from "../../../helpers/utility";
import { deleteInvite } from "../../../redux/slices/EventSlice";
import CustomButton from "../../../pagecomponents/Elements/Buttons/CustomButton";

const toArray = (value) => (Array.isArray(value) ? value : []);
const cleanText = (value) => String(value ?? "").trim();

const resolveAssociationValue = (value) => {
    if (value == null) return "";

    if (typeof value === "string" || typeof value === "number") {
        return cleanText(value);
    }

    if (typeof value === "object") {
        return cleanText(value?.name);
    }

    return "";
};

const resolveInviteeName = (invitee = {}) =>
    cleanText(invitee?.contact_name) || "Unnamed Contact";

const resolveInvitedBy = (invitee = {}) =>
    cleanText(invitee?.invited_by) ||
    "Invited Directly";

const resolveAssociations = (invitee = {}) =>
    toArray(invitee?.association)
        .map((item) => resolveAssociationValue(item))
        .filter(Boolean);

const resolveInviteId = (invitee = {}) => {
    const numberId = Number(invitee?.event_invite_Id);
    if (Number.isFinite(numberId) && numberId > 0) return numberId;
    return null;
};

const resolveContactId = (invitee = {}, index = 0) => {
    const numberId = Number(invitee?.contact_Id);
    if (Number.isFinite(numberId) && numberId > 0) return numberId;
    return `idx-${index}`;
};

const resolveMobile = (invitee = {}) => {
    const mobile = cleanText(invitee?.mobile);
    return mobile || "-";
};

const resolveAddress = (invitee = {}) => {
    const address = [
        invitee?.address_line1,
        invitee?.address_line2,
        invitee?.city,
        invitee?.pin_code,
    ]
        .map((item) => cleanText(item))
        .filter(Boolean)
        .join(", ");

    return address || "-";
};

const getAssociationTone = (value) => {
    const normalized = cleanText(value).toLowerCase();
    if (normalized.includes("family")) return "family";
    return "default";
};

const ViewAllInviteeModal = ({
    visible,
    onClose,
    invitees = [],
    targetEventId = null,
    onInviteDeleted,
    onAddInvitee,
}) => {
    const dispatch = useDispatch();
    const normalizedInvitees = useMemo(() => {
        const mapped = toArray(invitees).map((invitee, index) => {
            const name = resolveInviteeName(invitee);
            const inviteId = resolveInviteId(invitee);
            const contactId = resolveContactId(invitee, index);
            const uniqueKey =
                typeof contactId === "number"
                    ? `contact:${contactId}`
                    : typeof inviteId === "number"
                        ? `invite:${inviteId}`
                        : name
                            ? `name:${name.toLowerCase()}`
                            : `idx:${index}`;

            return {
                rowId: `${uniqueKey}-${index}`,
                uniqueKey,
                inviteId,
                contactId,
                serial: String(index + 1).padStart(2, "0"),
                name,
                mobile: resolveMobile(invitee),
                address: resolveAddress(invitee),
                invitedBy: resolveInvitedBy(invitee),
                associations: resolveAssociations(invitee),
                isDuplicate: false,
            };
        });

        const duplicateCounter = mapped.reduce((acc, row) => {
            acc[row.uniqueKey] = (acc[row.uniqueKey] ?? 0) + 1;
            return acc;
        }, {});

        const duplicateBadgeMarkedKeys = new Set();

        return mapped.map((row) => {
            const hasGroupDuplicate = duplicateCounter[row.uniqueKey] > 1;
            const shouldShowGroupDuplicateBadge =
                hasGroupDuplicate && !duplicateBadgeMarkedKeys.has(row.uniqueKey);

            if (hasGroupDuplicate) {
                duplicateBadgeMarkedKeys.add(row.uniqueKey);
            }

            return {
                ...row,
                isDuplicate:
                    shouldShowGroupDuplicateBadge ||
                    (!hasGroupDuplicate && row.isDuplicate),
            };
        });
    }, [invitees]);

    const [rows, setRows] = useState(normalizedInvitees);
    const [deletingRowId, setDeletingRowId] = useState("");
    const [isDeletingAll, setIsDeletingAll] = useState(false);
    const [selectedRowIds, setSelectedRowIds] = useState([]);

    useEffect(() => {
        setRows(normalizedInvitees);
        setSelectedRowIds([]);
    }, [normalizedInvitees, visible]);

    const selectableRowIds = useMemo(
        () => rows.filter((row) => row.inviteId).map((row) => row.rowId),
        [rows]
    );

    const isAllSelected =
        selectableRowIds.length > 0 &&
        selectableRowIds.every((rowId) => selectedRowIds.includes(rowId));

    const canDeleteAll = rows.some((row) => row.inviteId);

    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedRowIds([]);
            return;
        }

        setSelectedRowIds(selectableRowIds);
    };

    const handleToggleRowSelection = (rowId) => {
        setSelectedRowIds((prev) =>
            prev.includes(rowId)
                ? prev.filter((item) => item !== rowId)
                : [...prev, rowId]
        );
    };

    const handleRemove = async (row) => {
        if (!row?.inviteId) {
            toastMessage("error", "Invite id is missing.");
            return;
        }

        setDeletingRowId(row.rowId);
        try {
            const { payload } = await dispatch(
                deleteInvite({ inputData: { invite_Id: row.inviteId } })
            );

            if (payload?.status !== "success") {
                toastMessage("error", payload?.msg || "Failed to remove invitee.");
                return;
            }

            setRows((prev) => prev.filter((item) => item.rowId !== row.rowId));
            setSelectedRowIds((prev) => prev.filter((rowId) => rowId !== row.rowId));
            toastMessage("success", payload?.msg || "Invitee removed.");
            onInviteDeleted?.({
                ...row,
                targetEventId,
            });
        } catch (error) {
            toastMessage("error", "Failed to remove invitee.");
        } finally {
            setDeletingRowId("");
        }
    };

    const handleDeleteAll = async () => {
        const inviteIds = Array.from(
            new Set(rows.map((row) => row.inviteId).filter((inviteId) => Number.isFinite(Number(inviteId))))
        );

        if (!inviteIds.length) {
            toastMessage("error", "Invite id is missing.");
            return;
        }

        setIsDeletingAll(true);
        try {
            const { payload } = await dispatch(
                deleteInvite({ inputData: { invite_Id: inviteIds } })
            );

            if (payload?.status !== "success") {
                toastMessage("error", payload?.msg || "Failed to remove invitees.");
                return;
            }

            const removedRows = rows.filter((row) => inviteIds.includes(row.inviteId));
            setRows((prev) => prev.filter((row) => !inviteIds.includes(row.inviteId)));
            setSelectedRowIds([]);

            removedRows.forEach((row) => {
                onInviteDeleted?.({
                    ...row,
                    targetEventId,
                });
            });

            toastMessage("success", payload?.msg || "Invitees removed.");
        } catch (error) {
            toastMessage("error", "Failed to remove invitees.");
        } finally {
            setIsDeletingAll(false);
        }
    };

    const handlePrint = () => { };

    const handleAddInvitee = () => {
        onAddInvitee?.(targetEventId);
    };

    return (
        <ModalWrapper
            visible={visible}
            onClose={onClose}
            modalTitle="Customize Invitees"
            modalSize="xl"
            dialogClassName="view-all-invitee-modal"
        >
            <style>
                {`
                .view-all-invitee-modal .modal-content {
                    border-radius: 12px;
                    border: none;
                    overflow: hidden;
                    background: #f3f4f6;
                }

                .view-all-invitee-modal .modal-header {
                    background: #0b63f3;
                    border-bottom: 0;
                    padding: 14px 18px;
                }

                .view-all-invitee-modal .modal-title {
                    font-size: clamp(22px, 2vw, 32px);
                    font-weight: 700;
                    color: #fff;
                    line-height: 1.1;
                }

                .view-all-invitee-modal .modal-body {
                    background: #f3f4f6;
                    padding: 16px;
                }

                .view-all-invitee-toolbar {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                }

                .view-all-invitee-toolbar-btn {
                    border: 1px solid #d3d6de;
                    background: #f3f4f6;
                    color: #8091a3;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 700;
                    transition: all 0.2s ease;
                }

                .view-all-invitee-toolbar-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .view-all-invitee-toolbar-btn-plus {
                    width: 40px;
                    height: 40px;
                    border-radius: 999px;
                    font-size: 19px;
                    color: #4b5563;
                }

                .view-all-invitee-toolbar-btn-delete {
                    height: 40px;
                    border-radius: 999px;
                    padding: 0 18px;
                    font-size: 14px;
                    color: #8a97a7;
                    background: #eef1f5;
                }

                .view-all-invitee-toolbar-btn-print {
                    height: 40px;
                    border-radius: 999px;
                    padding: 0 20px;
                    border: 0;
                    background: linear-gradient(180deg, #2f74ff 0%, #1f5ddf 100%);
                    color: #fff;
                    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.35);
                    font-size: 14px;
                }

                .view-all-invitee-table-wrap {
                    border: 1px solid #dbe1ea;
                    border-radius: 8px;
                    overflow-x: auto;
                    background: #fff;
                }

                .view-all-invitee-head,
                .view-all-invitee-row {
                    display: grid;
                    grid-template-columns: 30px 54px minmax(140px, 1.3fr) minmax(120px, 1fr) minmax(180px, 1.8fr) minmax(110px, 1fr) minmax(120px, 1fr) 28px;
                    align-items: center;
                    column-gap: 10px;
                    padding: 0 12px;
                }

                .view-all-invitee-head {
                    min-height: 46px;
                    background: #c4cee2;
                    color: #0b63f3;
                    font-size: 15px;
                    font-weight: 700;
                }

                .view-all-invitee-row {
                    min-height: 54px;
                    border-bottom: 1px solid #e6ebf2;
                }

                .view-all-invitee-row:last-child {
                    border-bottom: 0;
                }

                .view-all-invitee-checkbox {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    accent-color: #0b63f3;
                }

                .view-all-invitee-cell {
                    color: #697786;
                    font-size: 14px;
                    font-weight: 500;
                    min-width: 0;
                    line-height: 1.4;
                }

                .view-all-invitee-cell-address {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .view-all-invitee-name-wrap {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                }

                .view-all-invitee-name {
                    color: #5e6c7b;
                    font-weight: 600;
                }

                .view-all-invitee-duplicate {
                    border: 1px solid #b7c3d1;
                    border-radius: 6px;
                    padding: 2px 7px;
                    font-size: 10px;
                    color: #8b9bad;
                    background: #f4f7fb;
                    line-height: 1.2;
                }

                .view-all-invitee-association {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .view-all-invitee-chip {
                    display: inline-flex;
                    align-items: center;
                    padding: 2px 8px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    border: 1px solid transparent;
                    line-height: 1.2;
                }

                .view-all-invitee-chip.family {
                    background: #fff4d6;
                    color: #b7791f;
                    border-color: #f3be4f;
                }

                .view-all-invitee-chip.default {
                    background: #dcfce7;
                    color: #166534;
                    border-color: #74d88a;
                }

                .view-all-invitee-association-empty {
                    color: #6f7d8c;
                }

                .view-all-invitee-remove {
                    border: 0;
                    background: transparent;
                    color: #ef4444;
                    width: 20px;
                    height: 20px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    font-size: 16px;
                }

                .view-all-invitee-empty {
                    padding: 18px 12px;
                    color: #64748b;
                    font-size: 14px;
                }

                @media (max-width: 1199px) {
                    .view-all-invitee-modal .modal-title {
                        font-size: 22px;
                    }

                    .view-all-invitee-modal .modal-body {
                        padding: 12px;
                    }

                    .view-all-invitee-toolbar {
                        justify-content: flex-end;
                        flex-wrap: wrap;
                    }

                    .view-all-invitee-toolbar-btn-plus {
                        width: 36px;
                        height: 36px;
                        font-size: 16px;
                    }

                    .view-all-invitee-toolbar-btn-delete,
                    .view-all-invitee-toolbar-btn-print {
                        height: 36px;
                        padding: 0 14px;
                        font-size: 13px;
                    }
                }

                @media (max-width: 575px) {
                    .view-all-invitee-modal .modal-header {
                        padding: 12px 14px;
                    }

                    .view-all-invitee-modal .modal-title {
                        font-size: 20px;
                    }

                    .view-all-invitee-toolbar {
                        justify-content: space-between;
                    }
                }
                `}
            </style>

            <div className="view-all-invitee-toolbar">
                <button
                    type="button"
                    className="view-all-invitee-toolbar-btn view-all-invitee-toolbar-btn-plus"
                    style={{ width: "30px", height: "30px" }}
                    onClick={handleAddInvitee}
                    aria-label="Add invitee"
                >
                    <FiPlus />
                </button>

                <CustomButton
                    variant="secondary"
                    onClick={handleDeleteAll}
                    disabled={!canDeleteAll || isDeletingAll || Boolean(deletingRowId)}
                >
                    Delete All
                </CustomButton>

                <CustomButton
                    onClick={handlePrint}
                >
                    Print
                </CustomButton>
            </div>

            <div className="view-all-invitee-table-wrap">
                <div className="view-all-invitee-head">
                    <input
                        className="view-all-invitee-checkbox"
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleToggleSelectAll}
                        aria-label="Select all invitees"
                    />
                    <div>S. No.</div>
                    <div>Name</div>
                    <div>Mobile</div>
                    <div>Address</div>
                    <div>Invited by</div>
                    <div>Association</div>
                    <div />
                </div>

                {rows.length === 0 ? (
                    <div className="view-all-invitee-empty">No invitees found.</div>
                ) : (
                    rows.map((row) => (
                        <div className="view-all-invitee-row" key={row.rowId}>
                            <input
                                className="view-all-invitee-checkbox"
                                type="checkbox"
                                checked={selectedRowIds.includes(row.rowId)}
                                onChange={() => handleToggleRowSelection(row.rowId)}
                                aria-label={`Select ${row.name}`}
                                disabled={!row.inviteId}
                            />

                            <div className="view-all-invitee-cell" data-label="S. No.">{row.serial}</div>

                            <div className="view-all-invitee-cell" data-label="Name">
                                <div className="view-all-invitee-name-wrap">
                                    <span className="view-all-invitee-name">{row.name}</span>
                                    {row.isDuplicate && (
                                        <span className="view-all-invitee-duplicate">Duplicate</span>
                                    )}
                                </div>
                            </div>

                            <div className="view-all-invitee-cell" data-label="Mobile">{row.mobile}</div>

                            <div
                                className="view-all-invitee-cell view-all-invitee-cell-address"
                                data-label="Address"
                                title={row.address}
                            >
                                {row.address}
                            </div>

                            <div className="view-all-invitee-cell" data-label="Invited by">
                                {row.invitedBy}
                            </div>

                            <div className="view-all-invitee-cell" data-label="Association">
                                <div className="view-all-invitee-association">
                                    {row.associations.length ? (
                                        row.associations.map((association, index) => (
                                            <span
                                                key={`${row.rowId}-association-${index}`}
                                                className={`view-all-invitee-chip ${getAssociationTone(association)}`}
                                            >
                                                {association}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="view-all-invitee-association-empty">
                                            Invited Directly
                                        </span>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                className="view-all-invitee-remove"
                                onClick={() => handleRemove(row)}
                                aria-label={`Remove ${row.name}`}
                                disabled={deletingRowId === row.rowId || isDeletingAll || !row.inviteId}
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </ModalWrapper>
    );
};

export default ViewAllInviteeModal;
