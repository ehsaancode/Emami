import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import CustomButton from "../../../pagecomponents/Elements/Buttons/CustomButton";
import { deleteData } from "../../../redux/slices/EventSlice";
import { toastMessage } from "../../../helpers/utility";
import DeleteConfirmationModal from "../../../pagecomponents/Common/DeleteConfirmationModal";

const truncateToWordLimit = (value = "", wordLimit = 2) => {
    const normalized = String(value ?? "").trim().replace(/\s+/g, " ");
    if (!normalized) return "";

    const words = normalized.split(" ");
    if (words.length <= wordLimit) return normalized;

    return `${words.slice(0, wordLimit).join(" ")}...`;
};

const EventCard = ({
    event = {},
    layout = "grid",
    onEdit,
    onDelete,
    onReview,
    onSubEventsClick,
    onAddSubEvent,
    onDeleted,
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const isListView = layout === "list";

    const {
        title = "",
        description = "",
        date = "",
        time = "",
        location = "",
        invitees = [],
        subEvents = [],
        id: eventId,
        raw: eventRaw,
    } = event || {};

    const normalizedSubEvents = Array.isArray(subEvents) ? subEvents : [];
    const subEventCount = normalizedSubEvents.length;
    const inviteesCount = Array.isArray(invitees) ? invitees.length : 0;
    const displayTitle = truncateToWordLimit(title, 3);
    const displayDescription = truncateToWordLimit(description, 10);
    const displayLocation = truncateToWordLimit(location, 3);

    const styles = {
        card: {
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #e7eaf1",
            boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
        },

        body: { padding: isListView ? "20px" : "22px 20px", minHeight: "100%" },

        title: {
            fontSize: "20px",
            lineHeight: 1.3,
            fontWeight: 700,
            color: "#0b63f3",
            margin: 0,
            maxWidth: "100%",
            wordBreak: "break-word",
        },

        description: {
            marginTop: 8,
            fontSize: "clamp(12px, 1vw, 16px)",
            fontWeight: 500,
            color: "#7b8798",
            lineHeight: 1.45,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
        },

        actionsWrap: { gap: 8 },

        circleBtn: {
            width: 38,
            height: 38,
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            background: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            color: "#1f2937",
            fontSize: 16,
        },

        reviewButton: {
            padding: "8px 22px",
            borderRadius: 999,
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.1,
        },

        metaRow: { marginTop: 18, rowGap: 12 },
        metaItem: { gap: 10 },

        metaIcon: {
            width: 32,
            height: 32,
            borderRadius: 999,
            border: "1.5px solid #0b63f3",
            background: "#f3f7ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            color: "#0b63f3",
            flex: "0 0 auto",
        },

        metaText: {
            fontSize: "clamp(12px, 1vw, 18px)",
            fontWeight: 600,
            color: "#5f6b7a",
        },

        subEventsPanel: {
            marginTop: 22,
            paddingTop: 16,
            borderTop: "1px solid #e4e7ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
        },

        subEventsTitle: {
            fontSize: "clamp(12px, 1vw, 20px)",
            fontWeight: 700,
            color: "#6e7885",
        },

        subEventsAction: {
            border: "none",
            background: "transparent",
            padding: 0,
            fontSize: "clamp(12px, 1vw, 20px)",
            fontWeight: 700,
            color: "#0b63f3",
            textDecoration: "underline",
            lineHeight: 1.2,
            cursor: "pointer",
        },

        emptySubEvent: {
            fontSize: "clamp(12px, 0.95vw, 16px)",
            fontWeight: 700,
            color: "#b7b7b7",
        },
    };

    const handleEditClick = () => {
        if (onEdit) {
            onEdit();
            return;
        }

        navigate("/event-management/new-event", {
            state: {
                mode: "edit",
                eventRaw,
            },
        });
    };

    const handleAddSubEventClick = () => {
        if (onAddSubEvent) {
            onAddSubEvent(event);
            return;
        }

        handleEditClick();
    };

    const handleDeleteClick = () => {
        if (onDelete) {
            onDelete();
            return;
        }
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        const rawId = eventRaw?.event_Id ?? eventId;
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
                toastMessage("error", payload?.msg || "Failed to delete event.");
                return;
            }
            toastMessage("success", payload?.msg || "Event deleted.");
            setIsDeleteModalOpen(false);
            onDeleted?.();
        } catch (error) {
            toastMessage("error", "Failed to delete event.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSubEventsClick = () => {
        if (!subEventCount) {
            return;
        }

        if (onSubEventsClick) {
            onSubEventsClick(event);
            return;
        }

        if (onReview) {
            onReview();
        }
    };

    return (
        <>
            <div className="card border-0" style={styles.card}>
                <div className="card-body" style={styles.body}>
                    {/* Header */}
                    <div className="d-flex align-items-start justify-content-between gap-2">
                        <h2 style={styles.title}>{displayTitle}</h2>

                        <div
                            className="d-flex align-items-center flex-shrink-0"
                            style={styles.actionsWrap}
                        >
                            <button
                                className="btn"
                                type="button"
                                style={styles.circleBtn}
                                onClick={handleAddSubEventClick}
                                aria-label="Add sub event"
                            >
                                <FiPlus />
                            </button>

                            <button
                                className="btn"
                                type="button"
                                style={{ ...styles.circleBtn, color: "#ff2b2b" }}
                                onClick={handleDeleteClick}
                                disabled={isDeleting}
                                aria-label="Delete event"
                            >
                                <FiTrash2 />
                            </button>

                            {onReview && (
                                <CustomButton onClick={onReview} style={styles.reviewButton}>
                                    Review
                                </CustomButton>
                            )}
                        </div>
                    </div>

                    {description && <div style={styles.description}>{displayDescription}</div>}

                    {/* Meta */}
                    <div className="row" style={styles.metaRow}>
                        <div className="col-12 col-md-6">
                            <div className="d-flex align-items-center" style={styles.metaItem}>
                                <div style={styles.metaIcon}>
                                    <i className="bi bi-calendar3" />
                                </div>
                                <div style={styles.metaText}>{date}</div>
                            </div>
                        </div>

                        <div className="col-12 col-md-6">
                            <div className="d-flex align-items-center" style={styles.metaItem}>
                                <div style={styles.metaIcon}>
                                    <i className="bi bi-clock" />
                                </div>
                                <div style={styles.metaText}>{time}</div>
                            </div>
                        </div>

                        <div className="col-12 col-md-6">
                            <div className="d-flex align-items-center" style={styles.metaItem}>
                                <div style={styles.metaIcon}>
                                    <i className="bi bi-geo-alt" />
                                </div>
                                <div style={styles.metaText}>{displayLocation}</div>
                            </div>
                        </div>

                        <div className="col-12 col-md-6">
                            <div className="d-flex align-items-center" style={styles.metaItem}>
                                <div style={styles.metaIcon}>
                                    <i className="bi bi-person" />
                                </div>
                                <div style={styles.metaText}>{inviteesCount} invitees</div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.subEventsPanel}>
                        <span style={styles.subEventsTitle}>Sub Events</span>
                        {subEventCount ? (
                            <button
                                type="button"
                                onClick={handleSubEventsClick}
                                style={styles.subEventsAction}
                                aria-label="Open manage event modal"
                            >
                                {`${subEventCount} Sub Event${subEventCount > 1 ? "s" : ""}`}
                            </button>
                        ) : (
                            <span style={styles.emptySubEvent}>No Sub Event</span>
                        )}
                    </div>
                </div>
            </div>
            <DeleteConfirmationModal
                show={isDeleteModalOpen}
                onHide={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                message={`Are you sure you want to delete ${title}?`}
            />
        </>
    );
};

export default EventCard;

