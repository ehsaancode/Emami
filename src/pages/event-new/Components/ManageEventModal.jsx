import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import CustomButton from "../../../pagecomponents/Elements/Buttons/CustomButton";
import ModalWrapper from "../../../pagecomponents/Common/ModalWrapper";
import DeleteConfirmationModal from "../../../pagecomponents/Common/DeleteConfirmationModal";
import { toastMessage } from "../../../helpers/utility";
import { deleteData } from "../../../redux/slices/EventSlice";
import ViewAllInviteeModal from "./ViewAllInviteeModal";
import AddInviteeModal from "./AddInviteeModal";

const resolveTargetEventId = (target = {}) =>
    target?.raw?.event_Id ??
    target?.eventRaw?.event_Id ??
    target?.event_Id ??
    target?.event_id ??
    target?.id ??
    null;

const resolveInviteeInviteId = (invitee = {}) =>
    invitee?.invite_Id ??
    invitee?.invite_id ??
    invitee?.inviteId ??
    invitee?.event_invite_Id ??
    invitee?.event_invite_id ??
    null;

const resolveInviteeContactId = (invitee = {}) =>
    invitee?.contact_Id ??
    invitee?.contact_id ??
    invitee?.contactId ??
    invitee?.id ??
    invitee?._id ??
    null;

const ManageEventsModal = ({
    visible,
    onClose,
    event,
    onDeleted,
    onRequestEdit,
    viewMode = "manage",
}) => {
    const dispatch = useDispatch();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isViewInviteeModalOpen, setIsViewInviteeModalOpen] = useState(false);
    const [isAddInviteeModalOpen, setIsAddInviteeModalOpen] = useState(false);
    const [activeInvitees, setActiveInvitees] = useState([]);
    const [activeInviteeTargetId, setActiveInviteeTargetId] = useState(null);
    const [inviteeTarget, setInviteeTarget] = useState(null);

    useEffect(() => {
        if (!visible) {
            setIsViewInviteeModalOpen(false);
            setIsAddInviteeModalOpen(false);
            setActiveInvitees([]);
            setActiveInviteeTargetId(null);
            setInviteeTarget(null);
        }
    }, [visible]);

    const normalizedSubEvents = Array.isArray(event?.subEvents)
        ? event.subEvents
        : [];

    const subEventItems = normalizedSubEvents
        .map((item) =>
            typeof item === "string"
                ? { title: item }
                : item
        )
        .filter((item) => item?.title);
    const isSubEventsMode = viewMode === "sub-events";

    const resolveTargetById = (targetId) => {
        if (
            targetId === undefined ||
            targetId === null ||
            targetId === ""
        ) {
            return null;
        }

        if (String(resolveTargetEventId(event)) === String(targetId)) {
            return event;
        }

        return (
            subEventItems.find(
                (item) =>
                    String(resolveTargetEventId(item)) === String(targetId)
            ) ?? null
        );
    };

    const resolveMeta = (item) => ({
        date: item?.date || event?.date,
        time: item?.time || event?.time,
        location: item?.location || event?.location,
        invitees: item?.invitees || event?.invitees,
    });

    const hasInviteesValue = (value) =>
        Array.isArray(value) ? value.length > 0 : Boolean(value);

    const toInviteesLabel = (value) => {
        if (Array.isArray(value)) {
            const count = value.length;
            return count ? `${count} invitee${count === 1 ? "" : "s"}` : "";
        }

        if (typeof value === "number") {
            return value ? `${value} invitee${value === 1 ? "" : "s"}` : "";
        }

        return value || "";
    };

    const handleEditClick = (target, isSubEvent = false) => {
        const raw = target?.raw ?? target?.eventRaw;

        if (!raw) {
            toastMessage("error", "Event data is missing.");
            return;
        }

        if (typeof onRequestEdit === "function") {
            onRequestEdit({
                raw,
                isSubEvent,
                parentEvent: event,
                target,
            });
            onClose?.();
            return;
        }

        toastMessage("error", "Edit action is unavailable.");
    };

    const handleAddInvitee = (target) => {
        const targetEventId = resolveTargetEventId(target);
        const latestTarget = resolveTargetById(targetEventId) ?? target;
        const eventId = resolveTargetEventId(latestTarget);

        if (!eventId) {
            toastMessage("error", "Event id is missing.");
            return;
        }

        setInviteeTarget({
            ...latestTarget,
            existingInvitees: resolveInvitees(latestTarget),
        });
        setIsAddInviteeModalOpen(true);
    };

    const handleDeleteClick = (target) => {
        setDeleteTarget(target);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (isDeleting) {
            return;
        }

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

    const resolveInvitees = (target) => {
        const raw = target?.raw ?? target?.eventRaw ?? {};
        const invitees =
            raw?.invited_users ??
            raw?.invitedUsers ??
            raw?.invitees ??
            target?.invited_users ??
            target?.invitees;

        return Array.isArray(invitees) ? invitees : [];
    };

    useEffect(() => {
        if (!event) return;
        if (
            !isViewInviteeModalOpen ||
            activeInviteeTargetId === undefined ||
            activeInviteeTargetId === null
        ) {
            return;
        }

        const latestTarget = resolveTargetById(activeInviteeTargetId);
        if (!latestTarget) return;
        setActiveInvitees(resolveInvitees(latestTarget));
    }, [event, isViewInviteeModalOpen, activeInviteeTargetId]);

    useEffect(() => {
        if (!event) return;
        if (!isAddInviteeModalOpen || !inviteeTarget) return;

        const targetId = resolveTargetEventId(inviteeTarget);
        const latestTarget = resolveTargetById(targetId);
        if (!latestTarget) return;

        setInviteeTarget({
            ...latestTarget,
            existingInvitees: resolveInvitees(latestTarget),
        });
    }, [event, isAddInviteeModalOpen]);

    const handleViewAllInvitees = (target) => {
        const inviteeRows = resolveInvitees(target);
        setActiveInviteeTargetId(resolveTargetEventId(target));
        setActiveInvitees(inviteeRows);
        setIsViewInviteeModalOpen(true);
    };

    const handleAddInviteeFromViewAll = (targetId) => {
        const resolvedTargetId =
            targetId !== undefined && targetId !== null && targetId !== ""
                ? targetId
                : activeInviteeTargetId;
        const target = resolveTargetById(resolvedTargetId);

        if (!target) {
            toastMessage("error", "Event data is missing.");
            return;
        }

        handleAddInvitee(target);
        setIsViewInviteeModalOpen(false);
    };

    const handleInviteDeleted = (removedInvite) => {
        const removedInviteId = resolveInviteeInviteId(removedInvite);
        const removedContactId = resolveInviteeContactId(removedInvite);
        const shouldKeepInvitee = (invitee) => {
            const currentInviteId = resolveInviteeInviteId(invitee);
            if (
                removedInviteId !== undefined &&
                removedInviteId !== null &&
                removedInviteId !== ""
            ) {
                return String(currentInviteId) !== String(removedInviteId);
            }

            const currentContactId = resolveInviteeContactId(invitee);
            if (
                removedContactId !== undefined &&
                removedContactId !== null &&
                removedContactId !== ""
            ) {
                return String(currentContactId) !== String(removedContactId);
            }

            return true;
        };

        setActiveInvitees((prev) => prev.filter(shouldKeepInvitee));
        setInviteeTarget((prev) => {
            if (!prev) return prev;
            const removedTargetEventId =
                removedInvite?.targetEventId ?? activeInviteeTargetId;
            if (
                removedTargetEventId === undefined ||
                removedTargetEventId === null ||
                String(resolveTargetEventId(prev)) !== String(removedTargetEventId)
            ) {
                return prev;
            }
            const existingInvitees = Array.isArray(prev.existingInvitees)
                ? prev.existingInvitees
                : [];
            return {
                ...prev,
                existingInvitees: existingInvitees.filter(shouldKeepInvitee),
            };
        });
        onDeleted?.();
    };

    const handleInvitesAdded = (result) => {
        const targetEventId = result?.eventId;
        const isContactMode = String(result?.mode || "") === "contact";
        const selectedItems = Array.isArray(result?.selectedItems)
            ? result.selectedItems
            : [];

        if (
            isContactMode &&
            selectedItems.length > 0 &&
            targetEventId !== undefined &&
            targetEventId !== null &&
            String(activeInviteeTargetId) === String(targetEventId)
        ) {
            const optimisticInvitees = selectedItems.map((item) => ({
                contact_Id: item?.id,
                contact_name: item?.label,
                invited_by: "Invited Directly",
                association: [],
            }));
            setActiveInvitees((prev) => [...prev, ...optimisticInvitees]);
        }

        if (isContactMode && selectedItems.length > 0) {
            setInviteeTarget((prev) => {
                if (!prev) return prev;
                if (
                    targetEventId === undefined ||
                    targetEventId === null ||
                    String(resolveTargetEventId(prev)) !== String(targetEventId)
                ) {
                    return prev;
                }

                const optimisticInvitees = selectedItems.map((item) => ({
                    contact_Id: item?.id,
                    contact_name: item?.label,
                    invited_by: "Invited Directly",
                    association: [],
                }));

                return {
                    ...prev,
                    existingInvitees: [
                        ...(Array.isArray(prev.existingInvitees)
                            ? prev.existingInvitees
                            : []),
                        ...optimisticInvitees,
                    ],
                };
            });
        }

        onDeleted?.();
    };

    const closeAddInviteeModal = () => {
        setIsAddInviteeModalOpen(false);
        setInviteeTarget(null);
    };

    const isOverlayModalOpen = isViewInviteeModalOpen || isAddInviteeModalOpen;

    const renderEventSection = ({ item, isSubEvent = false, meta }) => {
        const itemInvitees =
            String(resolveTargetEventId(item)) === String(activeInviteeTargetId)
                ? activeInvitees
                : resolveInvitees(item);
        const resolvedInvitees = itemInvitees.length ? itemInvitees : meta.invitees;
        const inviteesText = toInviteesLabel(resolvedInvitees);

        return (
            <div className="manage-events-section">
                <div className="manage-events-header">
                    <div className="manage-events-title-wrap">
                        <h3
                            className={`manage-events-title ${isSubEvent ? "sub-event" : "main-event"
                                }`}
                        >
                            {item.title}
                        </h3>

                        {item?.description && (
                            <p className="manage-events-description">{item.description}</p>
                        )}
                    </div>

                    <div className="manage-events-actions">
                        <button
                            type="button"
                            className="manage-events-icon-btn"
                            onClick={() => handleEditClick(item, isSubEvent)}
                            aria-label={`Edit ${item.title}`}
                        >
                            <FiEdit2 />
                        </button>

                        <button
                            type="button"
                            className="manage-events-icon-btn delete"
                            onClick={() =>
                                handleDeleteClick({
                                    ...item,
                                    raw: item.raw,
                                })
                            }
                            aria-label={`Delete ${item.title}`}
                            disabled={isDeleting}
                        >
                            <FiTrash2 />
                        </button>

                        <CustomButton
                            variant="secondary"
                            className="manage-events-add-btn"
                            title="Add Invitee"
                            onClick={() => handleAddInvitee(item)}
                        />
                    </div>
                </div>

                <div className="row manage-events-meta">
                    <div className="col-12 col-md-6">
                        <div className="manage-events-meta-item">
                            <span className="manage-events-meta-icon">
                                <i className="bi bi-calendar3" />
                            </span>
                            <span>{meta.date}</span>
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="manage-events-meta-item">
                            <span className="manage-events-meta-icon">
                                <i className="bi bi-clock" />
                            </span>
                            <span>{meta.time}</span>
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="manage-events-meta-item">
                            <span className="manage-events-meta-icon">
                                <i className="bi bi-geo-alt" />
                            </span>
                            <span>{meta.location}</span>
                        </div>
                    </div>

                    {hasInviteesValue(resolvedInvitees) && (
                        <div className="col-12 col-md-6">
                            <div className="manage-events-meta-item manage-events-meta-invitees">
                                <span className="manage-events-meta-icon">
                                    <i className="bi bi-person" />
                                </span>
                                <span>{inviteesText}</span>
                                <button
                                    type="button"
                                    className="manage-events-view-all"
                                    onClick={() => handleViewAllInvitees(item)}
                                >
                                    View All
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (!event) return null;

    return (
        <>
            <ModalWrapper
                visible={visible}
                onClose={onClose}
                modalTitle={isSubEventsMode ? "Sub Events Details" : "Manage Event"}
                modalSize="lg"
                dialogClassName={`manage-events-modal ${
                    isOverlayModalOpen ? "manage-events-modal-hidden" : ""
                }`}
            >
                <style>
                {`
                .manage-events-modal .modal-content {
                    border-radius: 14px;
                    border: none;
                    overflow: hidden;
                    background: #f3f4f6;
                    transition: opacity 0.2s ease;
                }

                .manage-events-modal.manage-events-modal-hidden .modal-content {
                    opacity: 0;
                    pointer-events: none;
                }

                .manage-events-modal .modal-header {
                    background: #0b63f3;
                    border-bottom: 0;
                    padding: 12px 16px;
                }

                .manage-events-modal .modal-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #fff;
                }

                .manage-events-modal .modal-header .text-primary {
                    color: #4b5563 !important;
                }

                .manage-events-modal .modal-body {
                    padding: 14px 16px 16px;
                    background: #f3f4f6;
                }

                .manage-events-stack {
                    display: flex;
                    flex-direction: column;
                }

                .manage-events-section {
                    padding: 0 0 4px;
                }

                .manage-events-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .manage-events-title-wrap {
                    flex: 1;
                    min-width: 220px;
                }

                .manage-events-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #0b63f3;
                    margin: 0;
                }

                .manage-events-title.main-event {
                    font-size: 18px;
                }

                .manage-events-title.sub-event {
                    font-size: 16px;
                    color: #343a40;
                }

                .manage-events-description {
                    margin: 8px 0 0;
                    font-size: 12px;
                    font-weight: 500;
                    color: #7b848f;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .manage-events-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .manage-events-icon-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 999px;
                    border: 1px solid #d8dde6;
                    background: #f5f6f8;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    color: #4b5563;
                    font-size: 12px;
                }

                .manage-events-icon-btn.delete {
                    color: #dc2626;
                }

                .manage-events-icon-btn:hover {
                    background: #ffffff;
                }

                .manage-events-add-btn {
                    min-width: 132px !important;
                    height: 36px !important;
                    padding: 0 14px !important;
                    font-size: 11.5px !important;
                    font-weight: 700 !important;
                    color: #0b63f3 !important;
                }

                .manage-events-meta {
                    margin-top: 10px;
                    row-gap: 8px;
                }

                .manage-events-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 11.5px;
                    font-weight: 600;
                    color: #67717e;
                }

                .manage-events-meta-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 999px;
                    border: 1.5px solid #0b63f3;
                    color: #0b63f3;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    background: #f5f9ff;
                    flex: 0 0 auto;
                }

                .manage-events-meta-invitees {
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .manage-events-view-all {
                    border: 0;
                    background: transparent;
                    padding: 0;
                    color: #3d434c;
                    font-size: 11.5px;
                    font-weight: 700;
                    text-decoration: underline;
                    text-underline-offset: 2px;
                    line-height: 1;
                }

                .manage-events-divider {
                    height: 1px;
                    background: #e3e7ee;
                    margin: 12px 0;
                }

                .manage-events-footer {
                    padding-top: 10px;
                    display: flex;
                    justify-content: flex-end;
                }

                .manage-events-approval-btn {
                    min-width: 154px !important;
                    height: 36px !important;
                    padding: 0 14px !important;
                    font-size: 11.5px !important;
                    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.32) !important;
                }

                @media (max-width: 767px) {
                    .manage-events-modal .modal-body {
                        padding: 12px;
                    }

                    .manage-events-actions {
                        width: 100%;
                        justify-content: flex-end;
                    }

                    .manage-events-add-btn {
                        min-width: 120px !important;
                    }

                    .manage-events-footer {
                        justify-content: center;
                    }
                }
                `}
                </style>

                <div className="manage-events-stack">
                    {!isSubEventsMode &&
                        renderEventSection({
                            item: event,
                            isSubEvent: false,
                            meta: {
                                date: event.date,
                                time: event.time,
                                location: event.location,
                                invitees: event.invitees,
                            },
                        })}

                    {isSubEventsMode && subEventItems.length === 0 && (
                        <div className="text-muted">No sub events found.</div>
                    )}

                    {subEventItems.map((subEvent, index) => (
                        <div key={`${subEvent.title}-${index}`}>
                            {(!isSubEventsMode || index > 0) && (
                                <div className="manage-events-divider" />
                            )}
                            {renderEventSection({
                                item: subEvent,
                                isSubEvent: true,
                                meta: resolveMeta(subEvent),
                            })}
                        </div>
                    ))}

                    {!isSubEventsMode && <div className="manage-events-divider" />}

                    {!isSubEventsMode && (
                        <div className="manage-events-footer">
                            <CustomButton
                                title="Send for Approval"
                                className="manage-events-approval-btn"
                            />
                        </div>
                    )}
                </div>

            </ModalWrapper>

            <DeleteConfirmationModal
                show={isDeleteModalOpen}
                onHide={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                message={`Are you sure you want to delete ${
                    deleteTarget?.title ?? event.title
                }?`}
            />

            <ViewAllInviteeModal
                visible={isViewInviteeModalOpen}
                onClose={() => {
                    setIsViewInviteeModalOpen(false);
                    setActiveInviteeTargetId(null);
                    setActiveInvitees([]);
                }}
                invitees={activeInvitees}
                targetEventId={activeInviteeTargetId}
                onInviteDeleted={handleInviteDeleted}
                onAddInvitee={handleAddInviteeFromViewAll}
            />

            <AddInviteeModal
                visible={isAddInviteeModalOpen}
                onClose={closeAddInviteeModal}
                target={inviteeTarget}
                existingInvitees={inviteeTarget?.existingInvitees ?? []}
                onInvitesAdded={handleInvitesAdded}
            />
        </>
    );
};

export default ManageEventsModal;

