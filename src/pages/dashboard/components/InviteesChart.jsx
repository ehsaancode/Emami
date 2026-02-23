const InviteesChart = ({
    title = "Invitees",
    rangeLabel = "Jan 2025 - May 2025",
    filterLabel = "Events",
    chartData = [],
    yAxisLabels = [89, 82, 76, 69, 63, 56],
}) => {
    const styles = {
        overviewPanel: {
            background: "#fff",
            border: "1px solid #eef1f5",
            borderRadius: 14,
            padding: "16px 18px",
            height: "100%",
        },
        panelHeader: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
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
        panelPill: {
            border: "1px solid #e5e7eb",
            background: "#fff",
            color: "#111827",
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
        },
        inviteesChart: {
            display: "flex",
            gap: 16,
            alignItems: "flex-end",
            position: "relative",
            padding: "12px 0 4px",
            minHeight: 210,
        },
        inviteesGrid: {
            position: "absolute",
            inset: "0 0 18px 48px",
            backgroundImage:
                "linear-gradient(to bottom, rgba(15, 23, 42, 0.06) 1px, transparent 1px)",
            backgroundSize: "100% 32px",
            pointerEvents: "none",
        },
        inviteesYAxis: {
            display: "flex",
            flexDirection: "column",
            gap: 24,
            fontSize: 11,
            color: "#9ca3af",
            minWidth: 40,
            paddingBottom: 18,
        },
        inviteesBars: {
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: 18,
            height: 180,
            paddingLeft: 4,
        },
        inviteesBar: {
            flex: 1,
            maxWidth: 56,
            height: 180,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 8,
        },
        inviteesBarFill: {
            width: "100%",
            borderRadius: "8px 8px 4px 4px",
            background: "linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)",
            boxShadow: "0 8px 12px rgba(37, 99, 235, 0.25)",
        },
        inviteesBarLabel: {
            fontSize: 11,
            color: "#6b7280",
        },
    };

    return (
        <div style={styles.overviewPanel}>
            <div style={styles.panelHeader}>
                <div>
                    <h3 style={styles.panelTitle}>{title}</h3>
                    <div style={styles.panelSubtitle}>{rangeLabel}</div>
                </div>
                <button type="button" style={styles.panelPill}>
                    {filterLabel} <i className="bi bi-caret-down-fill" />
                </button>
            </div>
            <div style={styles.inviteesChart}>
                <div style={styles.inviteesGrid} />
                <div style={styles.inviteesYAxis}>
                    {yAxisLabels.map((label) => (
                        <span key={label}>{label}</span>
                    ))}
                </div>
                <div style={styles.inviteesBars}>
                    {chartData.map((item) => (
                        <div key={item.month} style={styles.inviteesBar}>
                            <div
                                style={{
                                    ...styles.inviteesBarFill,
                                    height: `${item.value}%`,
                                }}
                            />
                            <span style={styles.inviteesBarLabel}>{item.month}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InviteesChart;

