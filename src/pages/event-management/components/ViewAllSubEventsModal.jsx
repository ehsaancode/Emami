import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import CustomButton from "../../../pagecomponents/Elements/Buttons/CustomButton";
import ModalWrapper from "../../../pagecomponents/Common/ModalWrapper";
import { deleteData } from "../../../redux/slices/EventSlice";
import { toastMessage } from "../../../helpers/utility";
import DeleteEventModal from "./DeleteEventModal";

const ViewAllSubEventsModal = ({ visible, onClose, event, onDeleted }) => {
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

    const handleAddInvitee = (target) => {
        const raw = target?.raw ?? target?.eventRaw ?? {};
        const eventId = raw?.event_Id ?? target?.id;
        if (!eventId) {
            toastMessage("error", "Event id is missing.");
            return;
        }
        navigate(`/contacts?ref=${eventId}`);
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

    const headerContent = (
        <div className="view-all-header">
            <div className="view-all-header-title">{event.title}</div>
            <div className="view-all-header-meta">
                <span>{event.date}</span>
                <span className="view-all-sep" />
                <span>{event.time}</span>
                <span className="view-all-sep" />
                <span>{event.location}</span>
                {hasInviteesValue(event.invitees) && (
                    <>
                        <span className="view-all-sep" />
                        <span>{event.invitees}</span>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <ModalWrapper
            visible={visible}
            onClose={onClose}
            modalTitle={headerContent}
            modalSize="lg"
            dialogClassName="view-all-modal"
        >
            <style>
                {`
                .view-all-modal .modal-content {
                    border-radius: 14px;
                    border: none;
                    overflow: hidden;
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
                    return (
                        <div key={`${subEvent.title}-${index}`}>
                            {index > 0 && <div className="view-all-divider" />}
                            <div className="view-all-section">
                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                    <h3 className="view-all-title">{subEvent.title}</h3>
                                    <div className="view-all-actions">
                                        <button
                                            type="button"
                                            className="view-all-icon-btn"
                                            onClick={() =>
                                                handleEditClick({
                                                    ...subEvent,
                                                    raw: subEvent.raw,
                                                })
                                            }
                                        >
                                            <FiEdit2 />
                                        </button>
                                        <button
                                            type="button"
                                            className="view-all-icon-btn delete"
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
                                            onClick={() =>
                                                handleAddInvitee({
                                                    ...subEvent,
                                                    raw: subEvent.raw,
                                                })
                                            }
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
                                    {hasInviteesValue(meta.invitees) && (
                                        <div className="col-12 col-md-6">
                                            <div className="view-all-meta-item">
                                                <span className="view-all-meta-icon">
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
                })
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

export default ViewAllSubEventsModal;

