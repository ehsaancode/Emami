import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import CustomButton from "../../../pagecomponents/Elements/Buttons/CustomButton";
import ModalWrapper from "../../../pagecomponents/Common/ModalWrapper";
import { changeEventStatus, deleteData } from "../../../redux/slices/EventSlice";
import { toastMessage } from "../../../helpers/utility";
import { getStatusBadge } from "../../../helpers/statusBadge";
import RejectModal from "./RejectModal";

const normalizeSubEventItems = (sourceEvent) => {
    const normalizedSubEvents = Array.isArray(sourceEvent?.subEvents)
        ? sourceEvent.subEvents
        : [];

    return normalizedSubEvents
        .map((item) => {
            if (typeof item === "string") {
                return { title: item, status: "", raw: null, id: null };
            }
            const raw = item?.raw ?? item?.eventRaw ?? item;
            const id = item?.id ?? item?.event_Id ?? raw?.event_Id ?? raw?.event_id ?? null;
            return {
                ...item,
                id,
                title: item?.title ?? item?.event_name ?? item?.name ?? "",
                status: item?.status ?? item?.event_status ?? "",
                raw,
            };
        })
        .map((item) => ({
            ...item,
            title: item.title?.trim?.() ?? item.title,
        }))
        .filter((item) => item?.title);
};


const SubEventApprovalModal = ({ visible, onClose, event, onDeleted }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [statusUpdatingId, setStatusUpdatingId] = useState(null);
    const [pendingAction, setPendingAction] = useState("");
    const [rejectTarget, setRejectTarget] = useState(null);
    const [localSubEvents, setLocalSubEvents] = useState([]);

    useEffect(() => {
        if (!event || !visible) return;
        setLocalSubEvents(normalizeSubEventItems(event));
        setIsRejectOpen(false);
        setRejectTarget(null);
    }, [event, visible]);

    const subEventItems = localSubEvents;

    const resolveMeta = (item) => ({
        date: item?.date || event.date,
        time: item?.time || event.time,
        location: item?.location || event.location,
        invitees: item?.invitees || event.invitees,
    });

    const resolveApproveAction = (item) => {
        const statusText = String(item?.status || event?.status || "").toLowerCase();
        if (statusText.includes("active")) return "approve-manager";
        if (statusText.includes("approve-manager") || statusText.includes("manager")) {
            return "approve-admin";
        }
        return "approve-admin";
    };

    const mainEventRejected = String(event?.status || "").toLowerCase().includes("reject");

    const getApprovalUi = (status) => {
        const normalized = String(status || "").toLowerCase();
        const isRejected = normalized.includes("reject");
        const isApproved =
            normalized.includes("approve-admin") || normalized === "approved";
        const isManagerApproved = normalized.includes("approve-manager");

        return {
            approveLabel: isApproved
                ? "Approved"
                : isManagerApproved
                    ? "Approve Admin"
                    : "Approve",
            rejectLabel: isRejected ? "Rejected" : "Reject",
            approveDisabled: mainEventRejected || isApproved || isRejected,
            rejectDisabled: mainEventRejected || isRejected,
        };
    };

    const buildApproveComment = (action) => {
        if (action === "approve-manager") return "Approved by Manager";
        if (action === "approve-admin") return "Approved by Admin";
        return "Approved";
    };

    const getErrorMessage = (payload, error, fallback) =>
        payload?.msg ||
        payload?.message ||
        error?.response?.data?.msg ||
        error?.message ||
        fallback;

    const handleEditClick = (target) => {
        const raw = target?.raw ?? target?.eventRaw;
        if (!raw) {
            toastMessage("error", "Event data is missing.");
            return;
        }
        navigate("/event-management/new-sub-event", {
            state: {
                mode: "edit",
                subEventRaw: raw,
                parentEvent: event,
            },
        });
        onClose?.();
    };

    const handleDeleteClick = (target) => {
        setDeleteTarget(target);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        const rawId = deleteTarget?.raw?.event_Id ?? deleteTarget?.id;
        if (!rawId) {
            toastMessage("error", "Event id is missing.");
            return;
        }

        setIsDeleting(true);
        try {
            const { payload } = await dispatch(
                deleteData({ inputData: { event_Id: rawId } })
            );
            if (payload?.status !== "success") {
                toastMessage("error", payload?.msg || payload?.message || "Failed to delete event.");
                return;
            }
            toastMessage("success", payload?.msg || payload?.message || "Event deleted.");
            setIsDeleteModalOpen(false);
            onDeleted?.();
        } catch (error) {
            toastMessage("error", error?.response?.data?.msg || error?.message || "Failed to delete event.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleApprove = async (target) => {
        const rawId = target?.raw?.event_Id ?? target?.id;
        if (!rawId) {
            toastMessage("error", "Event id is missing.");
            return;
        }

        const action = resolveApproveAction(target);
        setStatusUpdatingId(rawId);
        setPendingAction("approve");
        try {
            const { payload } = await dispatch(
                changeEventStatus({
                    inputData: {
                        event_Id: rawId,
                        action,
                        comments: buildApproveComment(action),
                    },
                }),
            );
            if (payload?.status !== "success") {
                toastMessage(
                    "error",
                    getErrorMessage(payload, null, "Failed to approve event."),
                );
                return;
            }
            toastMessage("success", payload?.msg || "Event approved.");
            setLocalSubEvents((prev) =>
                prev.map((item) =>
                    Number(item?.id) === Number(rawId)
                        ? { ...item, status: action }
                        : item,
                ),
            );
            onDeleted?.();
        } catch (error) {
            toastMessage("error", getErrorMessage(null, error, "Failed to approve event."));
        } finally {
            setStatusUpdatingId(null);
            setPendingAction("");
        }
    };

    const handleRejectSubmit = async (comment) => {
        const rawId = rejectTarget?.raw?.event_Id ?? rejectTarget?.id;
        if (!rawId) {
            toastMessage("error", "Event id is missing.");
            return;
        }

        setStatusUpdatingId(rawId);
        setPendingAction("reject");
        try {
            const { payload } = await dispatch(
                changeEventStatus({
                    inputData: {
                        event_Id: rawId,
                        action: "reject",
                        comments: comment,
                    },
                }),
            );
            if (payload?.status !== "success") {
                toastMessage(
                    "error",
                    getErrorMessage(payload, null, "Failed to reject event."),
                );
                return;
            }
            toastMessage("success", payload?.msg || "Event rejected.");
            setLocalSubEvents((prev) =>
                prev.map((item) =>
                    Number(item?.id) === Number(rawId)
                        ? { ...item, status: "rejected" }
                        : item,
                ),
            );
            setIsRejectOpen(false);
            setRejectTarget(null);
            onDeleted?.();
        } catch (error) {
            toastMessage("error", getErrorMessage(null, error, "Failed to reject event."));
        } finally {
            setStatusUpdatingId(null);
            setPendingAction("");
        }
    };

    if (!event) return null;

    const headerContent = (
        <div className="view-all-header">
            <div className="view-all-header-title">{event.title}</div>
            <div className="view-all-header-meta">
                <span>{event.date}</span>
                <span className="view-all-sep" />
                <span>{event.time}</span>
                <span className="view-all-sep" />
                <span>{event.location}</span>
                <span className="view-all-sep" />
                <span>{event.invitees}</span>
            </div>
        </div>
    );

    return (
        <>
            <ModalWrapper
                visible={visible}
                onClose={onClose}
                modalTitle={headerContent}
                modalSize="lg"
                dialogClassName={`view-all-modal ${isRejectOpen ? "is-dimmed" : ""}`}
            >
                <style>
                    {`
                .view-all-modal .modal-content {
                    border-radius: 14px;
                    border: none;
                    overflow: hidden;
                }
                .view-all-modal.is-dimmed .modal-content {
                    opacity: 0;
                    pointer-events: none;
                }

                .view-all-modal .modal-header {
                    background: #0b63f3;
                    border-bottom: 0;
                    padding: 16px 20px 18px;
                    align-items: flex-start;
                }

                .view-all-modal .modal-title {
                    margin: 0;
                    width: 100%;
                }

                .view-all-header {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .view-all-header-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: #fff;
                    margin: 0;
                }

                .view-all-header-meta {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.9);
                }

                .view-all-sep {
                    width: 4px;
                    height: 4px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.6);
                    display: inline-block;
                }

                .view-all-modal .modal-body {
                    padding: 20px 24px 26px;
                }

                .view-all-section {
                    padding: 6px 0 10px;
                }

                .view-all-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #2f343a;
                    margin: 0;
                }

                .view-all-title-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .view-all-status {
                    font-size: 10px;
                    font-weight: 700;
                    padding: 4px 8px;
                    border-radius: 999px;
                    text-transform: capitalize;
                    white-space: nowrap;
                }

                .view-all-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .view-all-icon-btn {
                    width: 30px;
                    height: 30px;
                    border-radius: 999px;
                    border: 1px solid #e8eaee;
                    background: #fff;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    color: #1f2937;
                    font-size: 12px;
                }

                .view-all-icon-btn.delete {
                    color: #ff2b2b;
                }

                .view-all-outline {
                    border-radius: 999px;
                    border: 1px solid #e6e9ef;
                    background: #fff;
                    padding: 7px 22px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #2f343a;
                }

                .view-all-meta {
                    margin-top: 14px;
                    row-gap: 12px;
                }

                .view-all-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #6b7280;
                }

                .view-all-meta-icon {
                    width: 30px;
                    height: 30px;
                    border-radius: 999px;
                    border: 1.5px solid #0b63f3;
                    color: #0b63f3;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    background: #f3f7ff;
                }

                .view-all-divider {
                    height: 1px;
                    background: #eef1f5;
                    margin: 16px 0;
                }
                `}
                </style>

                {subEventItems.length === 0 ? (
                    <div className="text-muted">No sub events.</div>
                ) : (
                    subEventItems.map((subEvent, index) => {
                        const meta = resolveMeta(subEvent);
                        const statusMeta = getStatusBadge(subEvent.status);
                        const subEventId =
                            subEvent?.raw?.event_Id ?? subEvent?.id ?? subEvent?.event_Id;
                        const isUpdating =
                            statusUpdatingId !== null &&
                            Number(statusUpdatingId) === Number(subEventId);
                        const approvalUi = getApprovalUi(subEvent.status);
                        return (
                            <div key={`${subEvent.title}-${index}`}>
                                {index > 0 && <div className="view-all-divider" />}
                                <div className="view-all-section">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                        <div className="view-all-title-row">
                                            <h3 className="view-all-title">{subEvent.title}</h3>
                                            {statusMeta ? (
                                                <span
                                                    className="view-all-status"
                                                    style={{
                                                        background: statusMeta.bg,
                                                        color: statusMeta.color,
                                                    }}
                                                >
                                                    {statusMeta.label}
                                                </span>
                                            ) : null}
                                        </div>
                                        <div className="view-all-actions">
                                            <CustomButton
                                                title={approvalUi.rejectLabel}
                                                variant="secondary"
                                                onClick={() => {
                                                    setRejectTarget(subEvent);
                                                    setIsRejectOpen(true);
                                                }}
                                                disabled={isUpdating || approvalUi.rejectDisabled}
                                            />
                                            <CustomButton
                                                title={approvalUi.approveLabel}
                                                onClick={() => handleApprove(subEvent)}
                                                loading={isUpdating && pendingAction === "approve"}
                                                loadingText="Approving..."
                                                disabled={isUpdating || approvalUi.approveDisabled}
                                            />
                                        </div>
                                    </div>

                                    <div className="row view-all-meta">
                                        <div className="col-12 col-md-6">
                                            <div className="view-all-meta-item">
                                                <span className="view-all-meta-icon">
                                                    <i className="bi bi-calendar3" />
                                                </span>
                                                {meta.date}
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <div className="view-all-meta-item">
                                                <span className="view-all-meta-icon">
                                                    <i className="bi bi-clock" />
                                                </span>
                                                {meta.time}
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <div className="view-all-meta-item">
                                                <span className="view-all-meta-icon">
                                                    <i className="bi bi-geo-alt" />
                                                </span>
                                                {meta.location}
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <div className="view-all-meta-item">
                                                <span className="view-all-meta-icon">
                                                    <i className="bi bi-person" />
                                                </span>
                                                {meta.invitees}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}


            </ModalWrapper>
            <RejectModal
                visible={isRejectOpen}
                onClose={() => {
                    setIsRejectOpen(false);
                    setRejectTarget(null);
                }}
                onSubmit={handleRejectSubmit}
                loading={pendingAction === "reject" && Boolean(statusUpdatingId)}
            />
        </>
    );
};

export default SubEventApprovalModal;

