import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import CustomButton from "../../pagecomponents/Elements/Buttons/CustomButton";
import SearchBar from "../../pagecomponents/Common/SearchBar";
import IconBar from "../../pagecomponents/Common/IconBar";
import TablePagination from "../../pagecomponents/Common/TablePagination";
import EventCard from "./Components/EventCard";
import AddEditEvent from "./Components/AddEditEvent";
import EventFilterModal from "../event-management/components/EventFilterModal";
import { getEventData } from "../../redux/slices/EventSlice";
import ManageEventsModal from "./Components/ManageEventModal";
import { PermissionGate } from "../../helpers/useSectionPermissions";

const EventManagement = () => {
    const dispatch = useDispatch();
    const [search, setSearch] = useState("");
    const [activeIcon, setActiveIcon] = useState(0);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const [activeEvent, setActiveEvent] = useState(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [manageModalView, setManageModalView] = useState("manage");
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [totalRows, setTotalRows] = useState(0);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorState, setEditorState] = useState({
        mode: "create",
        eventRaw: null,
        parentDraft: null,
        parentPreview: null,
        parentEvent: null,
    });

    const pageTitle = "Event Management";
    const pageSubTitle = "Create and manage events and invitations";

    const filterIcon = [
        { iconName: "si si-grid" },
        { iconName: "si si-list" },
        { iconName: "si si-equalizer" },
    ];

    const PARAMS = {
        filter: {
            event_name: "",
            venue: "",
            start_date: "",
            end_date: "",
            contact_Ids: [],
            family_group_Ids: [],
        },
        pagination: {
            page: 1,
            limit: 10,
        },
    };

    const [params, setParams] = useState(PARAMS);

    const isListView = activeIcon === 1;
    const openFilterModal = () => setIsFilterModalOpen(true);
    const closeFilterModal = () => setIsFilterModalOpen(false);
    const closeManageModal = () => {
        setIsManageModalOpen(false);
        setManageModalView("manage");
    };
    const normalizedSearch = search.trim().toLowerCase();

    useEffect(() => {
        fetchEventData();
    }, [params]);

    useEffect(() => {
        if (!activeEvent?.id || !events.length) return;

        const updatedActiveEvent = events.find(
            (item) => String(item?.id) === String(activeEvent.id)
        );

        if (!updatedActiveEvent) return;
        setActiveEvent(updatedActiveEvent);
    }, [events, activeEvent?.id]);

    const extractTimeslots = (event) => {
        if (!Array.isArray(event?.event_date_Json?.timeslots)) {
            return [];
        }
        return event.event_date_Json.timeslots;
    };

    const formatTimeRange = (slot) => {
        const startTime = slot?.start_time || "";
        const endTime = slot?.end_time || "";

        if (startTime && endTime) {
            return `${startTime} - ${endTime}`;
        }

        return startTime || endTime || "";
    };

    const formatDateRange = (timeslots) => {
        const firstSlot = timeslots[0];
        const lastSlot = timeslots[timeslots.length - 1];
        const startDate = firstSlot?.date || "";
        const endDate = lastSlot?.date || "";

        if (startDate && endDate && startDate !== endDate) {
            return `${startDate} - ${endDate}`;
        }

        return startDate;
    };

    const mapEventItem = (item, parent = null) => {
        const timeslots = extractTimeslots(item);
        const firstSlot = timeslots[0];

        return {
            id: item?.event_Id ?? item?.id,
            title: item?.event_name || "",
            date: formatDateRange(timeslots) || parent?.date || "",
            time: formatTimeRange(firstSlot) || parent?.time || "",
            location: item?.event_location || parent?.location || "",
            invitees: Array.isArray(item?.invited_users) ? item.invited_users : [],
            description: item?.event_description || "",
            raw: item,
        };
    };

    const normalizeEvent = (event) => {
        const normalized = mapEventItem(event);
        const children = Array.isArray(event?.children) ? event.children : [];

        return {
            ...normalized,
            subEvents: children.map((child) => mapEventItem(child, normalized)),
        };
    };

    const fetchEventData = async () => {
        setIsLoading(true);
        setLoadError("");
        try {
            const { payload } = await dispatch(
                getEventData({ inputData: params })
            );

            const responseData = Array.isArray(payload?.data)
                ? payload.data
                : [];
            const pagination = payload?.pagination;
            const normalized = responseData.map(normalizeEvent);
            setEvents(normalized);
            if (pagination?.total !== undefined) {
                setTotalRows(Number(pagination.total) || 0);
            } else {
                setTotalRows(normalized.length);
            }
        } catch (error) {
            setEvents([]);
            setTotalRows(0);
            setLoadError("No data found.");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredEvents = normalizedSearch
        ? events.filter((event) => {
            const haystack = [
                event.title,
                event.location,
                event.date,
                event.time,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return haystack.includes(normalizedSearch);
        })
        : events;
    const pageLimit = Math.max(1, Number(params.pagination.limit) || 1);
    const currentPage = Math.max(1, Number(params.pagination.page) || 1);
    const effectiveTotalRows = normalizedSearch.length
        ? filteredEvents.length
        : totalRows;
    const effectiveTotalPages = Math.max(
        1,
        Math.ceil(effectiveTotalRows / pageLimit)
    );
    const safePage = Math.min(currentPage, effectiveTotalPages);
    const displayEvents = filteredEvents;
    const handleReview = (event) => {
        setActiveEvent(event);
        setManageModalView("manage");
        setIsManageModalOpen(true);
    };

    const handleOpenSubEventsDetails = (event) => {
        setActiveEvent(event);
        setManageModalView("sub-events");
        setIsManageModalOpen(true);
    };

    const handleOpenCreate = () => {
        setEditorState({
            mode: "create",
            eventRaw: null,
            parentDraft: null,
            parentPreview: null,
            parentEvent: null,
        });
        setIsEditorOpen(true);
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
    };

    const handleOpenSubEventFromCard = (parentEvent) => {
        setEditorState({
            mode: "sub-event",
            eventRaw: null,
            parentDraft: null,
            parentPreview: null,
            parentEvent,
        });
        setIsEditorOpen(true);
    };

    const handleOpenSubEventFromDraft = (parentDraft, parentPreview) => {
        setEditorState({
            mode: "sub-event",
            eventRaw: null,
            parentDraft,
            parentPreview,
            parentEvent: parentPreview ?? null,
        });
        setIsEditorOpen(true);
    };

    const handleOpenEditFromManageModal = ({ raw }) => {
        if (!raw) {
            return;
        }

        setEditorState({
            mode: "edit",
            eventRaw: raw,
            parentDraft: null,
            parentPreview: null,
            parentEvent: null,
        });
        setIsEditorOpen(true);
    };

    const handleSkipSubEvent = (parentDraft, parentPreview) => {
        setEditorState({
            mode: "create",
            eventRaw: null,
            parentDraft: parentDraft ?? null,
            parentPreview: parentPreview ?? null,
            parentEvent: null,
        });
        setIsEditorOpen(true);
    };

    const styles = {
        cardsGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "16px",
            alignItems: "stretch",
        },
        cardItem: {
            minWidth: 0,
            display: "flex",
        },
    };

    if (isEditorOpen) {
        return (
            <AddEditEvent
                mode={editorState.mode}
                eventRaw={editorState.eventRaw}
                parentDraft={editorState.parentDraft}
                parentPreview={editorState.parentPreview}
                parentEvent={editorState.parentEvent}
                onClose={handleCloseEditor}
                onSaved={fetchEventData}
                onOpenSubEvent={handleOpenSubEventFromDraft}
                onSkipSubEvent={handleSkipSubEvent}
            />
        );
    }

    return (
        <>
            <div
                className="breadcrumb-header justify-content-between align-items-center"
                style={{ marginBottom: "22px" }}
            >
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1 d-block">
                        {pageTitle}
                    </span>
                    <small>{pageSubTitle}</small>
                </div>
                <div className="right-content">
                    <PermissionGate permissions={["event.create", "event.all"]}>
                        <CustomButton
                            title="Create Events +"
                            className="mx-1"
                            onClick={handleOpenCreate}
                            style={{ backgroundColor: "#005FFF", color: "#fff" }}
                        />
                    </PermissionGate>
                </div>
            </div>

            <div
                className="d-flex justify-content-between align-items-center"
                style={{ marginBottom: "22px", gap: "16px" }}
            >
                <div style={{ maxWidth: "560px", width: "100%" }}>
                    <SearchBar
                        placeholder="Search events by name, city, or date..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <IconBar
                    icons={filterIcon}
                    activeIndex={activeIcon}
                    onChange={(index) => {
                        if (index === 2) {
                            openFilterModal();
                            return;
                        }
                        setActiveIcon(index);
                    }}
                />
            </div>

            {/* Cards */}
            <div
                className={isListView ? "d-flex flex-column gap-3" : ""}
                style={isListView ? undefined : styles.cardsGrid}
            >
                {isLoading ? (
                    <div className="text-muted">Loading events...</div>
                ) : loadError ? (
                    <div className="text-muted">{loadError}</div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-muted">No events found.</div>
                ) : (
                    displayEvents.map((event) => (
                        <div
                            key={event.id}
                            style={isListView ? undefined : styles.cardItem}
                        >
                            <EventCard
                                layout={isListView ? "list" : "grid"}
                                event={event}
                                onDeleted={fetchEventData}
                                onReview={() => handleReview(event)}
                                onSubEventsClick={handleOpenSubEventsDetails}
                                onAddSubEvent={handleOpenSubEventFromCard}
                            />
                        </div>
                    ))

                )}
            </div>

            <TablePagination
                variant="compact"
                currentPage={safePage}
                totalPages={effectiveTotalPages}
                rowsPerPage={pageLimit}
                pageSizeOptions={[10, 20, 50]}
                rowsPerPageLabel="Rows per page"
                updateRowsPerPage={(value) =>
                    setParams((prev) => ({
                        ...prev,
                        pagination: { ...prev.pagination, page: 1, limit: value },
                    }))
                }
                onPageChange={(page) =>
                    setParams((prev) => ({
                        ...prev,
                        pagination: { ...prev.pagination, page },
                    }))
                }
            />

            <EventFilterModal
                visible={isFilterModalOpen}
                onClose={closeFilterModal}
                initialFilter={params.filter}
                onApply={(filter) =>
                    setParams((prev) => ({
                        ...prev,
                        filter,
                        pagination: { ...prev.pagination, page: 1 },
                    }))
                }
            />

            <ManageEventsModal
                visible={isManageModalOpen}
                onClose={closeManageModal}
                event={activeEvent}
                viewMode={manageModalView}
                onDeleted={fetchEventData}
                onRequestEdit={handleOpenEditFromManageModal}
            />
        </>
    );
};

export default EventManagement;

