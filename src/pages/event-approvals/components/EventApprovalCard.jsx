import { useState } from "react";
import { useDispatch } from "react-redux";
import { toastMessage } from "../../../helpers/utility";
import { deleteData } from "../../../redux/slices/EventSlice";
import CustomButton from "../../../pagecomponents/Elements/Buttons/CustomButton";
import DeleteEventModal from "../../event-management/components/DeleteEventModal";
import ReviewModal from "./ReviewModal";
import { getStatusBadge } from "../../../helpers/statusBadge";

const EventApprovalCard = ({
    layout = "grid",
    title = "Annual Gala 2024",
    statusLabel = "Pending Approval",
    status = "",
    date = "March 15, 2024",
    time = "12:00 PM - 2:00 PM",
    location = "Grand Hall, New York",
    invitees = "4 invitees (3 families)",
    subEvents = ["Grand Inauguration", "Grand Inauguration"],
    eventId,
    eventRaw,
    onEdit,
    onDelete,
    onViewAll,
    showReview = true,
    onDeleted,
}) => {
    const dispatch = useDispatch();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const isListView = layout === "list";
    const normalizedSubEvents = Array.isArray(subEvents) ? subEvents : [];
    const subEventItems = normalizedSubEvents
        .map((item) => {
            if (typeof item === "string") {
                return { title: item, status: "" };
            }
            return {
                title: item?.title ?? item?.event_name ?? item?.name ?? "",
                status: item?.status ?? item?.event_status ?? "",
            };
        })
        .map((item) => ({
            ...item,
            title: item.title?.trim?.() ?? item.title,
        }))
        .filter((item) => item.title);
    const visibleSubEvents = isListView
        ? subEventItems
        : subEventItems.slice(0, 2);
    const inviteesText = Array.isArray(invitees)
        ? `${invitees.length} invitee${invitees.length === 1 ? "" : "s"}`
        : invitees;
    const hasInvitees = Boolean(
        Array.isArray(invitees) ? invitees.length : inviteesText
    );

    const getInviteeName = (invitee = {}) => {
        const first = String(
            invitee?.first_name ??
            invitee?.firstName ??
            invitee?.spouse_first_name ??
            invitee?.contact_name ??
            invitee?.contact_Primary_Full_Name ??
            invitee?.full_name ??
            invitee?.name ??
            "",
        ).trim();
        const last = String(
            invitee?.last_name ??
            invitee?.lastName ??
            invitee?.spouse_last_name ??
            invitee?.contact_last_name ??
            invitee?.contact_Last_Name ??
            "",
        ).trim();

        if (!first && !last) return "";
        if (!first) return last;
        if (!last) return first;

        const firstLower = first.toLowerCase();
        const lastLower = last.toLowerCase();
        if (firstLower === lastLower || firstLower.endsWith(` ${lastLower}`)) {
            return first;
        }
        return `${first} ${last}`;
    };

    const styles = {
        card: {
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 2px 10px rgba(16,24,40,0.06)",
        },

        body: { padding: "18px 20px" },

        title: {
            fontSize: 20,
            lineHeight: 1.25,
            fontWeight: 700,
            color: "#0b63f3",
            margin: 0,
        },

        titleRow: {
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
        },

        statusPill: {
            background: "#FFE9C7",
            color: "#F59E0B",
            fontSize: 12,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 10,
        },

        actionsWrap: { gap: 6 },

        circleBtn: {
            width: 28,
            height: 28,
            borderRadius: 999,
            border: "1px solid #e8eaee",
            background: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            color: "#1f2937",
            fontSize: 12,
        },

        viewAllBtn: {
            height: 28,
            borderRadius: 999,
            border: "1px solid #e8eaee",
            background: "#fff",
            padding: "0 10px",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontWeight: 600,
            color: "#2f343a",
            fontSize: 12,
        },

        metaRow: { marginTop: isListView ? 10 : 12, rowGap: 10 },
        metaItem: { gap: 8 },

        metaIcon: {
            width: 30,
            height: 30,
            borderRadius: 999,
            border: "1.5px solid #0d6efd",
            background: "#f3f7ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "#0d6efd",
            flex: "0 0 auto",
        },

        metaText: {
            fontSize: 11,
            fontWeight: 600,
            color: "#7a828c",
        },

        divider: {
            height: 1,
            background: "#eef1f5",
            margin: "12px 0 10px",
        },

        divider2: {
            height: 1,
            background: "#eef1f5",
            margin: "10px 0",
        },

        sectionTitle: {
            fontSize: 12,
            fontWeight: 700,
            color: "#2f343a",
            marginBottom: 2,
        },

        details: {
            fontSize: 11,
            fontWeight: 600,
            color: "#0d6efd",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
        },

        subEventsLabel: {
            fontSize: 12,
            fontWeight: 700,
            color: "#0d6efd",
            marginBottom: 6,
            cursor: "pointer",
        },

        subEventItem: {
            fontSize: 16,
            fontWeight: 700,
            color: "#2f343a",
            padding: "6px 0",
        },

        subEventRow: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
        },

        subEventStatus: {
            fontSize: 10,
            fontWeight: 700,
            padding: "4px 8px",
            borderRadius: 999,
            textTransform: "capitalize",
            whiteSpace: "nowrap",
        },

        subEventDivider: {
            height: 1,
            background: "#eef1f5",
        },
    };

    const statusMeta = getStatusBadge(status, statusLabel);


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

    return (
        <>
            <div className="card border-0" style={styles.card}>
                <div className="card-body" style={styles.body}>
                    {/* Header */}
                    <div className="d-flex align-items-start justify-content-between">
                        <div style={styles.titleRow}>
                            <h2 style={styles.title}>{title}</h2>
                            <span
                                style={{
                                    ...styles.statusPill,
                                    background: statusMeta.bg,
                                    color: statusMeta.color,
                                }}
                            >
                                {statusMeta.label}
                            </span>
                        </div>

                        <div className="d-flex align-items-center" style={styles.actionsWrap}>
                            {showReview && (
                                <CustomButton onClick={() => setIsReviewModalOpen(true)}>
                                    Review
                                </CustomButton>
                            )}
                        </div>
                    </div>

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
                                <div style={styles.metaText}>{location}</div>
                            </div>
                        </div>

                        {hasInvitees && (
                            <div className="col-12 col-md-6">
                                <div className="d-flex align-items-center" style={styles.metaItem}>
                                    <div style={styles.metaIcon}>
                                        <i className="bi bi-person" />
                                    </div>
                                    <div style={styles.metaText}>{inviteesText}</div>
                                </div>
                            </div>
                        )}
                    </div>


                    {visibleSubEvents.length > 0 && (
                        <div style={{ marginTop: 25 }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div style={styles.subEventsLabel}>Sub Events</div>
                                <div style={styles.subEventsLabel} onClick={onViewAll}>{`View All >`}</div>
                            </div>

                            <div>
                                {visibleSubEvents.map((item, index) => {
                                    const statusMeta = getStatusBadge(item.status);
                                    return (
                                        <div key={`${item.title}-${index}`}>
                                            {index > 0 && (
                                                <div
                                                    style={
                                                        isListView
                                                            ? styles.subEventDivider
                                                            : styles.divider2
                                                    }
                                                />
                                            )}
                                            <div
                                                style={{
                                                    ...(isListView
                                                        ? styles.subEventItem
                                                        : styles.sectionTitle),
                                                    ...styles.subEventRow,
                                                }}
                                            >
                                                <span>{item.title}</span>
                                                {statusMeta ? (
                                                    <span
                                                        style={{
                                                            ...styles.subEventStatus,
                                                            background: statusMeta.bg,
                                                            color: statusMeta.color,
                                                        }}
                                                    >
                                                        {statusMeta.label}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <DeleteEventModal
                visible={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                loading={isDeleting}
                title={title}
            />
            <ReviewModal
                visible={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                eventId={eventId}
                eventRaw={eventRaw}
                onStatusChanged={onDeleted}
                title={title}
                subtitle=""
                date={date}
                time={time}
                location={location}
                invitees={inviteesText}
                inviteeList={
                    Array.isArray(eventRaw?.invited_users)
                        ? eventRaw.invited_users.map((item) => getInviteeName(item)).filter(Boolean)
                        : []
                }
                inviteesData={
                    Array.isArray(eventRaw?.invited_users)
                        ? eventRaw.invited_users.map((item) => ({
                            name: getInviteeName(item),
                            invitedBy: item?.invited_by ?? "",
                            association: Array.isArray(item?.association)
                                ? item.association.map((assoc) => assoc?.name).filter(Boolean)
                                : [],
                        }))
                        : []
                }
                description={eventRaw?.event_description ?? ""}
            />
        </>
    );
};

export default EventApprovalCard;

