import { Row, Col } from "react-bootstrap";
import PageWrapper from "../../pagecomponents/Common/PageWrapper";
import SummaryCards from "./components/SummaryCards";
import InviteesChart from "./components/InviteesChart";
import RecentActivity from "./components/RecentActivity";

const Dashboard = () => {
    const pageTitle = "System Overview";
    const pageSubTitle = "Complete system statics & activity";

    const summaryData = [
        {
            title: "Total Contacts",
            value: "08",
            increasedBy: "+2 contacts added recently",
            iconName: "bi bi-people",
        },
        {
            title: "Total Live Events",
            value: "05",
            increasedBy: "+2 events added recently",
            iconName: "bi bi-calendar3",
        },
        {
            title: "Pending Approvals",
            value: "05",
            increasedBy: "+3 approvals pending",
            iconName: "bi bi-clock-history",
        },
        {
            title: "Print Jobs",
            value: "03",
            increasedBy: "+3 print jobs added recently",
            iconName: "bi bi-printer",
        },
    ];

    const chartData = [
        { month: "January", value: 62 },
        { month: "February", value: 76 },
        { month: "March", value: 79 },
        { month: "April", value: 88 },
        { month: "May", value: 70 },
    ];

    const activityItems = [
        {
            status: "approved",
            title: "Event Approved",
            subtitle: "Annual Gala 2026",
            time: "1 Day ago",
        },
        {
            status: "rejected",
            title: "Event Rejected",
            subtitle: "Marketing Meetup 2026",
            time: "2 Days ago",
        },
        {
            status: "approved",
            title: "Print Approved",
            subtitle: "Event Brochure",
            time: "4 Days ago",
        },
        {
            status: "approved",
            title: "New Contact Added",
            subtitle: "Contact Drake Jane",
            time: "5 Days ago",
        },
        {
            status: "approved",
            title: "New Role Assigned",
            subtitle: "Event Manager",
            time: "10 Days ago",
        },
    ];

    const styles = {
        dashboardOverview: {
            paddingBottom: 10,
        },
    };

    return (
        <>
            <PageWrapper pageName={pageTitle} pageSubTitle={pageSubTitle}>
                <div style={styles.dashboardOverview}>
                    <SummaryCards items={summaryData} />

                    <Row className="g-3 mt-1">
                        <Col xl={8} lg={12}>
                            <InviteesChart chartData={chartData} />
                        </Col>
                        <Col xl={4} lg={12}>
                            <RecentActivity items={activityItems} />
                        </Col>
                    </Row>
                </div>
            </PageWrapper>
        </>
    );
};

export default Dashboard;

