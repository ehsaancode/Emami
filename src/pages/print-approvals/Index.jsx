import PageWrapper from "../../pagecomponents/Common/PageWrapper";

const PrintApprovals = () => {
    const pageTitle = "Print Approval";
    const pageSubTitle = "Review and approve event printing";
    const searchFieldPlaceholder = "Search event name...";

    const filterIcon = [
        { iconName: "si si-grid" },
        { iconName: "si si-list" },
        { iconName: "si si-equalizer" }
    ];

    return(
        <>
            <PageWrapper
                pageName={pageTitle}
                pageSubTitle={pageSubTitle}
                searchFieldPlaceholder={searchFieldPlaceholder}
                filterIcon={filterIcon}
            >

            </PageWrapper>
        </>
    );
};

export default PrintApprovals;
