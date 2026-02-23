import { Link } from "react-router-dom";

const RecentActivity = ({
    title = "Recent Activity",
    rangeLabel = "Past 10 Days",
    items = [],
    viewAllHref = "#",
}) => {
    const styles = {
        overviewPanel: {
            background: "#fff",
            border: "1px solid #eef1f5",
            borderRadius: 14,
            padding: "16px 18px",
            height: "100%",
        },
        panelTitle: {
            fontSize: 16,
            fontWeight: 700,
            margin: 0,
            color: "#111827",
        },
        panelSubtitle: {
            fontSize: 10,
            fontWeight: 600,
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginTop: 2,
        },
        activityHeader: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
        },
        activityHeaderLink: {
            fontSize: 11,
            fontWeight: 600,
            color: "#2563eb",
            textDecoration: "none",
        },
        activityList: {
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginTop: 14,
        },
        activityItem: {
            border: "1px solid #eef1f5",
            borderRadius: 12,
            padding: "10px 12px",
            display: "flex",
            gap: 10,
            alignItems: "center",
            background: "#fff",
        },
        activityIcon: {
            width: 30,
            height: 30,
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
        },
        activityIconApproved: {
            background: "#e8f7ee",
            color: "#16a34a",
        },
        activityIconRejected: {
            background: "#feecec",
            color: "#dc2626",
        },
        activityContent: {
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
        },
        activityTitle: {
            fontSize: 12,
            fontWeight: 600,
            color: "#111827",
            margin: 0,
        },
        activitySubtitle: {
            fontSize: 10,
            color: "#6b7280",
            margin: "2px 0 0",
        },
        activityTime: {
            fontSize: 10,
            color: "#9ca3af",
            whiteSpace: "nowrap",
        },
    };

    return (
        <div style={styles.overviewPanel}>
            <div style={styles.activityHeader}>
                <div>
                    <h3 style={styles.panelTitle}>{title}</h3>
                    <div style={styles.panelSubtitle}>{rangeLabel}</div>
                </div>
                <Link to={viewAllHref} style={styles.activityHeaderLink}>
                    View All
                </Link>
            </div>
            <div style={styles.activityList}>
                {items.map((item, index) => (
                    <div key={`${item.title}-${index}`} style={styles.activityItem}>
                        <span
                            style={
                                item.status === "rejected"
                                    ? { ...styles.activityIcon, ...styles.activityIconRejected }
                                    : { ...styles.activityIcon, ...styles.activityIconApproved }
                            }
                        >
                            <i
                                className={
                                    item.status === "rejected"
                                        ? "bi bi-x-lg"
                                        : "bi bi-check-lg"
                                }
                            />
                        </span>
                        <div style={styles.activityContent}>
                            <div>
                                <p style={styles.activityTitle}>{item.title}</p>
                                <p style={styles.activitySubtitle}>{item.subtitle}</p>
                            </div>
                            <div style={styles.activityTime}>{item.time}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivity;

