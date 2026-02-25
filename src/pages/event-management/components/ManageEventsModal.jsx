import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import CustomButton from "../../../pagecomponents/Elements/Buttons/CustomButton";
import ModalWrapper from "../../../pagecomponents/Common/ModalWrapper";
import { deleteData } from "../../../redux/slices/EventSlice";
import { toastMessage } from "../../../helpers/utility";
import DeleteEventModal from "./DeleteEventModal";

const ManageEventsModal = ({ visible, onClose, event, onDeleted }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!event) return null;

    const normalizedSubEvents = Array.isArray(event.subEvents)
        ? event.subEvents
        : [];

    const subEventItems = normalizedSubEvents
        .map((item) =>
            typeof item === "string"
                ? { title: item }
                : item
        )
        .filter((item) => item?.title);

    const resolveMeta = (item) => ({
        date: item?.date || event.date,
        time: item?.time || event.time,
        location: item?.location || event.location,
        invitees: item?.invitees || event.invitees,
    });

    const hasInviteesValue = (value) =>
        Array.isArray(value) ? value.length > 0 : Boolean(value);

    const handleEditClick = (target) => {
        const raw = target?.raw ?? target?.eventRaw;
        if (!raw) {
            toastMessage("error", "Event data is missing.");
            return;
        }
        if (target?.isSubEvent) {
            navigate("/event-management/new-sub-event", {
                state: {
                    mode: "edit",
                    subEventRaw: raw,
                    parentEvent: event,
                },
            });
        } else {
            navigate("/event-management/new-event", {
                state: {
                    mode: "edit",
                    eventRaw: raw,
                },
            });
        }
        onClose?.();
    };

    const handleAddInvitee = (target) => {
        const raw = target?.raw ?? target?.eventRaw ?? {};
        const eventId = raw?.event_Id ?? target?.id;
        if (!eventId) {
            toastMessage("error", "Event id is missing.");
            return;
        }
        navigate(`/contacts?ref=${eventId}`);
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

    return (
        <ModalWrapper
            visible={visible}
            onClose={onClose}
            modalTitle="Manage Events"
            modalSize="lg"
            dialogClassName="manage-events-modal"
        >
            <style>
                {`
                .manage-events-modal .modal-content {
                    border-radius: 14px;
                    border: none;
                    overflow: hidden;
                }

                .manage-events-modal .modal-header {
                    background: #0b63f3;
                    border-bottom: 0;
                    padding: 16px 20px;
                }

                .manage-events-modal .modal-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: #fff;
                }

                .manage-events-modal .modal-body {
                    padding: 20px 24px 26px;
                }

                .manage-events-section {
                    padding: 6px 0 10px;
                }

                .manage-events-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .manage-events-title-wrap {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                    min-width: 0;
                }

                .manage-events-chip {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 10px;
                    border-radius: 999px;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    line-height: 1;
                    white-space: nowrap;
                }

                .manage-events-chip.main {
                    color: #0b63f3;
                    background: #eaf1ff;
                    border: 1px solid #d7e6ff;
                }

                .manage-events-chip.sub {
                    color: #475569;
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                }

                .manage-events-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1f2a8a;
                    margin: 0;
                }

                .manage-events-title.sub-event {
                    font-size: 17px;
                    font-weight: 600;
                    color: #2f343a;
                }

                .manage-events-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .manage-events-icon-btn {
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

                .manage-events-icon-btn.delete {
                    color: #ff2b2b;
                }

                .manage-events-outline {
                    border-radius: 999px;
                    border: 1px solid #e6e9ef;
                    background: #fff;
                    padding: 7px 22px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #2f343a;
                }

                .manage-events-meta {
                    margin-top: 14px;
                    row-gap: 12px;
                }

                .manage-events-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #6b7280;
                }

                .manage-events-meta-icon {
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

                .manage-events-divider {
                    height: 1px;
                    background: #eef1f5;
                    margin: 16px 0;
                }

                .manage-events-section.sub-event-section .manage-events-meta-item {
                    font-size: 12px;
                    font-weight: 500;
                }

                .manage-events-sub-btn {
                    font-size: 12px !important;
                }
                `}
            </style>

            <div className="manage-events-section">
                <div className="manage-events-header">
                    <div className="manage-events-title-wrap">
                        <span className="manage-events-chip main">Main Event</span>
                        <h3 className="manage-events-title">{event.title}</h3>
                    </div>
                    <div className="manage-events-actions">
                        <button
                            type="button"
                            className="manage-events-icon-btn"
                            onClick={() =>
                                handleEditClick({
                                    ...event,
                                    raw: event.raw,
                                    isSubEvent: false,
                                })
                            }
                        >
                            <FiEdit2 />
                        </button>
                        <button
                            type="button"
                            className="manage-events-icon-btn delete"
                            onClick={() =>
                                handleDeleteClick({
                                    ...event,
                                    raw: event.raw,
                                })
                            }
                        >
                            <FiTrash2 />
                        </button>
                        <CustomButton
                            title="Add Invitee"
                            onClick={() =>
                                handleAddInvitee({
                                    ...event,
                                    raw: event.raw,
                                })
                            }
                        />
                    </div>
                </div>

                <div className="row manage-events-meta">
                    <div className="col-12 col-md-6">
                        <div className="manage-events-meta-item">
                            <span className="manage-events-meta-icon">
                                <i className="bi bi-calendar3" />
                            </span>
                            {event.date}
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="manage-events-meta-item">
                            <span className="manage-events-meta-icon">
                                <i className="bi bi-clock" />
                            </span>
                            {event.time}
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="manage-events-meta-item">
                            <span className="manage-events-meta-icon">
                                <i className="bi bi-geo-alt" />
                            </span>
                            {event.location}
                        </div>
                    </div>
                    {hasInviteesValue(event.invitees) && (
                        <div className="col-12 col-md-6">
                            <div className="manage-events-meta-item">
                                <span className="manage-events-meta-icon">
                                    <i className="bi bi-person" />
                                </span>
                                {event.invitees}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {subEventItems.length > 0 && (
                <>
                    {subEventItems.map((subEvent, index) => {
                        const meta = resolveMeta(subEvent);
                        return (
                            <div key={`${subEvent.title}-${index}`}>
                                <div className="manage-events-divider" />
                                <div className="manage-events-section sub-event-section">
                                    <div className="manage-events-header">
                                        <div className="manage-events-title-wrap">
                                            <span className="manage-events-chip sub">Sub Event</span>
                                            <h3 className="manage-events-title sub-event">
                                                {subEvent.title}
                                            </h3>
                                        </div>
                                        <div className="manage-events-actions">
                                            <button
                                                type="button"
                                                className="manage-events-icon-btn"
                                                onClick={() =>
                                                    handleEditClick({
                                                        ...subEvent,
                                                        raw: subEvent.raw,
                                                        isSubEvent: true,
                                                    })
                                                }
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                type="button"
                                                className="manage-events-icon-btn delete"
                                                onClick={() =>
                                                    handleDeleteClick({
                                                        ...subEvent,
                                                        raw: subEvent.raw,
                                                    })
                                                }
                                            >
                                                <FiTrash2 />
                                            </button>
                                            <CustomButton
                                                title="Add Invitee"
                                                className="manage-events-sub-btn"
                                                onClick={() =>
                                                    handleAddInvitee({
                                                        ...subEvent,
                                                        raw: subEvent.raw,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="row manage-events-meta">
                                        <div className="col-12 col-md-6">
                                            <div className="manage-events-meta-item">
                                                <span className="manage-events-meta-icon">
                                                    <i className="bi bi-calendar3" />
                                                </span>
                                                {meta.date}
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <div className="manage-events-meta-item">
                                                <span className="manage-events-meta-icon">
                                                    <i className="bi bi-clock" />
                                                </span>
                                                {meta.time}
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <div className="manage-events-meta-item">
                                                <span className="manage-events-meta-icon">
                                                    <i className="bi bi-geo-alt" />
                                                </span>
                                                {meta.location}
                                            </div>
                                        </div>
                                        {hasInviteesValue(meta.invitees) && (
                                            <div className="col-12 col-md-6">
                                                <div className="manage-events-meta-item">
                                                    <span className="manage-events-meta-icon">
                                                        <i className="bi bi-person" />
                                                    </span>
                                                    {meta.invitees}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </>
            )}

            <DeleteEventModal
                visible={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                loading={isDeleting}
                title={deleteTarget?.title ?? event.title}
            />
        </ModalWrapper>
    );
};

export default ManageEventsModal;

