import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import ModalWrapper from "../../../pagecomponents/Common/ModalWrapper";
import CustomButton from "../../../pagecomponents/Elements/Buttons/CustomButton";
import RejectModal from "./RejectModal";
import InviteesModal from "./InviteesModal";
import { changeEventStatus } from "../../../redux/slices/EventSlice";
import { toastMessage } from "../../../helpers/utility";

const ReviewModal = ({
    visible,
    onClose,
    title,
    subtitle = "",
    date,
    time,
    location,
    invitees,
    description,
    inviteeList = [],
    inviteesData = [],
    eventId,
    eventRaw,
    onStatusChanged,
    approveAction,
}) => {
    const dispatch = useDispatch();
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isInviteesOpen, setIsInviteesOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingAction, setPendingAction] = useState("");
    const fallbackInvitees = [
        "Ronny Danial",
        "Doe Family",
        "Johnson Family",
        "Saraf Family",
    ];
    const hasInvitees =
        Boolean(invitees) ||
        inviteeList.length > 0 ||
        inviteesData.length > 0;
    const displayInvitees =
        inviteeList.length > 0
            ? inviteeList
            : hasInvitees
                ? fallbackInvitees
                : [];
    const fallbackInviteesData = [
        {
            name: "Ronny Danial",
            invitedBy: "Danny Brown",
            association: ["Smith Family"],
        },
        {
            name: "John Doe",
            invitedBy: "Ron Johnson",
            association: ["RSA", "Rotary"],
        },
        {
            name: "Zen Saraf",
            invitedBy: "Davis Roth",
            association: ["Invited Directly"],
        },
    ];
    const displayInviteesData =
        inviteesData.length > 0
            ? inviteesData
            : hasInvitees
                ? fallbackInviteesData
                : [];

    const resolvedEventId = useMemo(
        () => eventRaw?.event_Id ?? eventRaw?.event_id ?? eventId,
        [eventId, eventRaw],
    );

    const normalizedStatus = useMemo(
        () => String(eventRaw?.status || "").toLowerCase(),
        [eventRaw],
    );

    const resolvedApproveAction = useMemo(() => {
        if (approveAction) return approveAction;
        const rawAction = eventRaw?.approval_action || eventRaw?.action;
        if (typeof rawAction === "string" && rawAction.trim()) return rawAction;
        if (normalizedStatus.includes("active")) return "approve-manager";
        if (normalizedStatus.includes("approve-manager") || normalizedStatus.includes("manager")) {
            return "approve-admin";
        }
        return "approve-admin";
    }, [approveAction, eventRaw, normalizedStatus]);

    const approvalUi = useMemo(() => {
        const isRejected = normalizedStatus.includes("reject");
        const isApproved =
            normalizedStatus.includes("approve-admin") ||
            normalizedStatus === "approved";
        const isManagerApproved = normalizedStatus.includes("approve-manager");

        const approveLabel = isApproved
            ? "Approved"
            : isManagerApproved
                ? "Approve Admin"
                : "Approve";

        const rejectLabel = isRejected ? "Rejected" : "Reject";

        return {
            approveLabel,
            rejectLabel,
            approveDisabled: isApproved || isRejected,
            rejectDisabled: isRejected,
        };
    }, [normalizedStatus]);

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

    const handleApprove = async () => {
        if (!resolvedEventId) {
            toastMessage("error", "Event id is missing.");
            return;
        }
        setIsSubmitting(true);
        setPendingAction("approve");
        try {
            const { payload } = await dispatch(
                changeEventStatus({
                    inputData: {
                        event_Id: resolvedEventId,
                        action: resolvedApproveAction,
                        comments: buildApproveComment(resolvedApproveAction),
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
            onStatusChanged?.();
            onClose?.();
        } catch (error) {
            toastMessage("error", getErrorMessage(null, error, "Failed to approve event."));
        } finally {
            setIsSubmitting(false);
            setPendingAction("");
        }
    };

    const handleReject = async (comment) => {
        if (!resolvedEventId) {
            toastMessage("error", "Event id is missing.");
            return;
        }
        setIsSubmitting(true);
        setPendingAction("reject");
        try {
            const { payload } = await dispatch(
                changeEventStatus({
                    inputData: {
                        event_Id: resolvedEventId,
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
            setIsRejectOpen(false);
            onStatusChanged?.();
            onClose?.();
        } catch (error) {
            toastMessage("error", getErrorMessage(null, error, "Failed to reject event."));
        } finally {
            setIsSubmitting(false);
            setPendingAction("");
        }
    };
    return (
        <>
            <ModalWrapper
                visible={visible}
                onClose={onClose}
                modalTitle="Review"
                modalSize="lg"
                dialogClassName={`review-event-modal ${
                    isRejectOpen || isInviteesOpen ? "is-dimmed" : ""
                }`}
            >
                <style>
                    {`
                .review-event-modal .modal-content {
                    border-radius: 14px;
                    border: none;
                    overflow: hidden;
                }
                .review-event-modal.is-dimmed .modal-content {
                    opacity: 0;
                    pointer-events: none;
                }
                .review-event-modal .modal-header {
                    background: #0b63f3;
                    border-bottom: 0;
                    padding: 16px 20px;
                }
                .review-event-modal .modal-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: #fff;
                }
                .review-event-modal .modal-body {
                    padding: 20px 24px 26px;
                }
                .review-event-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #2f343a;
                    margin: 0;
                }
                .review-event-subtitle {
                    font-size: 14px;
                    font-weight: 600;
                    color: #6b7280;
                    margin-top: 8px;
                }
                .review-event-meta {
                    margin-top: 12px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 14px 24px;
                }
                .review-event-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                }
                .review-event-meta-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 999px;
                    border: 1.5px solid #0b63f3;
                    color: #0b63f3;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    background: #f3f7ff;
                }
                .review-event-description {
                    margin-top: 10px;
                    font-size: 12px;
                    color: #6b7280;
                    line-height: 1.6;
                }
                .review-event-row {
                    margin-top: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .review-event-row-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: #2f343a;
                }
                .review-event-viewall {
                    font-size: 12px;
                    font-weight: 600;
                    color: #0b63f3;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                }
                .review-event-avatars {
                    display: flex;
                    justify-content: space-around;
                    flex-wrap: wrap;
                    margin-top: 20px;
                }
                .review-event-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 999px;
                    border: 1.5px solid #0b63f3;
                    background: #f3f7ff;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: #0b63f3;
                    font-size: 20px;
                }
                .review-event-avatar-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: #6b7280;
                    text-align: center;
                    margin-top: 6px;
                }
                .review-event-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 22px;
                }
                `}
                </style>

                <div className="review-event-title">{title}</div>
                {subtitle ? <div className="review-event-subtitle">{subtitle}</div> : null}

                <div className="review-event-meta">
                    <div className="review-event-meta-item">
                        <span className="review-event-meta-icon">
                            <i className="bi bi-calendar3" />
                        </span>
                        {date}
                    </div>
                    <div className="review-event-meta-item">
                        <span className="review-event-meta-icon">
                            <i className="bi bi-clock" />
                        </span>
                        {time}
                    </div>
                    <div className="review-event-meta-item">
                        <span className="review-event-meta-icon">
                            <i className="bi bi-geo-alt" />
                        </span>
                        {location}
                    </div>
                </div>

                {description ? (
                    <div className="review-event-description">{description}</div>
                ) : null}

                {hasInvitees && (
                    <>
                        <div className="review-event-row">
                            <div className="review-event-row-title">{invitees}</div>
                            <div
                                className="review-event-viewall"
                                onClick={() => setIsInviteesOpen(true)}
                            >
                                View All <i className="bi bi-chevron-right" />
                            </div>
                        </div>

                        <div className="review-event-avatars">
                            {displayInvitees.map((name, idx) => (
                                <div key={`${name}-${idx}`} style={{ textAlign: "center" }}>
                                    <div className="review-event-avatar">
                                        <i className="bi bi-person-fill" />
                                    </div>
                                    <div className="review-event-avatar-label">{name}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div className="review-event-actions">
                    <CustomButton
                        title="Cancel"
                        variant="secondary"
                        onClick={onClose}
                    />
                    <CustomButton
                        title={approvalUi.approveLabel}
                        variant="primary"
                        onClick={handleApprove}
                        loading={isSubmitting && pendingAction === "approve"}
                        loadingText="Approving..."
                        disabled={isSubmitting || approvalUi.approveDisabled}
                    />
                    <CustomButton
                        title={approvalUi.rejectLabel}
                        variant="danger"
                        onClick={() => setIsRejectOpen(true)}
                        disabled={isSubmitting || approvalUi.rejectDisabled}
                    />
                </div>
            </ModalWrapper>

            <RejectModal
                visible={isRejectOpen}
                onClose={() => setIsRejectOpen(false)}
                onSubmit={handleReject}
                loading={isSubmitting && pendingAction === "reject"}
            />
            <InviteesModal
                visible={isInviteesOpen}
                onClose={() => setIsInviteesOpen(false)}
                invitees={displayInviteesData}
            />
        </>
    );
};

export default ReviewModal;

