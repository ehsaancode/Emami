import { Row, Col } from "react-bootstrap";

const SummaryCards = ({ items = [] }) => {
    const styles = {
        overviewCard: {
            background: "#fff",
            border: "1px solid #eef1f5",
            borderRadius: 12,
            padding: "16px 18px",
            height: "100%",
            boxShadow: "0 8px 16px rgba(15, 23, 42, 0.04)",
        },
        overviewCardTop: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
        },
        overviewCardTitle: {
            fontSize: 12,
            fontWeight: 600,
            color: "#111827",
        },
        overviewCardIcon: {
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#eef5ff",
            color: "#2563eb",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
        },
        overviewCardValue: {
            fontSize: 36,
            fontWeight: 700,
            color: "#1d4ed8",
            lineHeight: 1,
            marginTop: 8,
        },
        overviewCardSub: {
            fontSize: 11,
            color: "#6b7280",
            marginTop: 6,
        },
    };

    return (
        <Row className="g-3">
            {items.map((data, index) => (
                <Col key={`${data.title}-${index}`} xs={12} md={6} xl={3}>
                    <div style={styles.overviewCard}>
                        <div style={styles.overviewCardTop}>
                            <span style={styles.overviewCardTitle}>{data.title}</span>
                            <span style={styles.overviewCardIcon}>
                                <i className={data.iconName} />
                            </span>
                        </div>
                        <div style={styles.overviewCardValue}>{data.value}</div>
                        <div style={styles.overviewCardSub}>{data.increasedBy}</div>
                    </div>
                </Col>
            ))}
        </Row>
    );
};

export default SummaryCards;

