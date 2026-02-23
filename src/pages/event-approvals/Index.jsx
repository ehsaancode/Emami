import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { getEventData } from "../../redux/slices/EventSlice";
import CustomButton from "../../pagecomponents/Elements/Buttons/CustomButton";
import SearchBar from "../../pagecomponents/Common/SearchBar";
import IconBar from "../../pagecomponents/Common/IconBar";
import EventCard from "./components/EventApprovalCard";
import TablePagination from "../../pagecomponents/Common/TablePagination";
import EventFilterModal from "../event-management/components/EventFilterModal";
import SubEventApprovalModal from "./components/SubEventApprovalModal";


const EventManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [activeIcon, setActiveIcon] = useState(0);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const [activeEvent, setActiveEvent] = useState(null);
    const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
    const [viewAllEvent, setViewAllEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [totalRows, setTotalRows] = useState(0);

    const pageTitle = "Approval Queue";
    const pageSubTitle = "Review and approve event invitations";

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
    const closeViewAllModal = () => setIsViewAllModalOpen(false);
    const normalizedSearch = search.trim().toLowerCase();

    useEffect(() => {
        fetchEventData();
    }, [params]);

    const extractTimeslots = (event) =>
        event?.event_date_Json?.timeslots ??
        event?.event_date_json?.timeslots ??
        event?.timeslots ??
        [];

    const getSlotTime = (slot) => ({
        start: slot?.start_time ?? slot?.startTime ?? "",
        end: slot?.end_time ?? slot?.endTime ?? "",
    });

    const formatTimeRange = (slot) => {
        if (!slot) return "";
        const { start, end } = getSlotTime(slot);
        if (start && end) return `${start} - ${end}`;
        return start || end || "";
    };

    const formatInvitees = (value) => {
        if (Array.isArray(value)) {
            const count = value.length;
            return count ? `${count} invitee${count === 1 ? "" : "s"}` : "";
        }
        if (typeof value === "number") {
            return value ? `${value} invitee${value === 1 ? "" : "s"}` : "";
        }
        if (typeof value === "string") {
            return value;
        }
        return "";
    };

    const resolveInviteesText = (event) => {
        const invitedUsers =
            event?.invited_users ??
            event?.invitedUsers ??
            event?.invitees ??
            null;
        if (Array.isArray(invitedUsers)) {
            return formatInvitees(invitedUsers);
        }
        if (event?.event_approval_count) {
            return formatInvitees(event.event_approval_count);
        }
        return formatInvitees(invitedUsers);
    };

    const normalizeChild = (child, parent) => {
        const timeslots = extractTimeslots(child);
        const firstSlot = timeslots[0];
        const lastSlot = timeslots[timeslots.length - 1];
        const date = firstSlot?.date ?? "";
        const multiDayDate =
            firstSlot?.date && lastSlot?.date && firstSlot?.date !== lastSlot?.date
                ? `${firstSlot.date} - ${lastSlot.date}`
                : date;

        return {
            id: child?.event_Id ?? child?.event_id ?? child?.id ?? child?._id,
            title: child?.event_name ?? child?.event_Name ?? "Sub Event",
            date: multiDayDate || parent?.date || "",
            time: formatTimeRange(firstSlot) || parent?.time || "",
            location: child?.event_location ?? parent?.location ?? "",
            invitees: resolveInviteesText(child) || parent?.invitees || "",
            description: child?.event_description ?? "",
            status: child?.status ?? "",
            raw: child,
        };
    };

    const normalizeEvent = (event) => {
        const timeslots = extractTimeslots(event);
        const firstSlot = timeslots[0];
        const lastSlot = timeslots[timeslots.length - 1];

        const date = firstSlot?.date ?? "";
        const multiDayDate =
            firstSlot?.date && lastSlot?.date && firstSlot?.date !== lastSlot?.date
                ? `${firstSlot.date} - ${lastSlot.date}`
                : date;

        const normalized = {
            id: event?.event_Id ?? event?.event_id ?? event?.id ?? event?._id,
            title: event?.event_name ?? event?.event_Name ?? "Untitled Event",
            date: multiDayDate,
            time: formatTimeRange(firstSlot),
            location: event?.event_location ?? event?.venue ?? "",
            invitees: resolveInviteesText(event),
            description: event?.event_description ?? "",
            status: event?.status ?? "",
            raw: event,
        };

        const children = Array.isArray(event?.children) ? event.children : [];
        return {
            ...normalized,
            subEvents: children.map((child) => normalizeChild(child, normalized)),
        };
    };

    const fetchEventData = async () => {
        setIsLoading(true);
        setLoadError("");
        try {
            const { payload } = await dispatch(
                getEventData({ inputData: params })
            );
            const responseData =
                payload?.data?.data ??
                payload?.data ??
                payload?.events ??
                [];
            const pagination = payload?.pagination ?? payload?.data?.pagination;
            const normalized = Array.isArray(responseData)
                ? responseData.map(normalizeEvent)
                : [];
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
    const isServerPaginated = totalRows > events.length;
    const effectiveTotalRows = normalizedSearch.length
        ? filteredEvents.length
        : isServerPaginated
            ? totalRows
            : filteredEvents.length;
    const effectiveTotalPages = Math.max(
        1,
        Math.ceil(effectiveTotalRows / pageLimit)
    );
    const safePage = Math.min(currentPage, effectiveTotalPages);
    const pageStart = (safePage - 1) * pageLimit;
    const pageEnd = pageStart + pageLimit;
    const displayEvents = isServerPaginated
        ? filteredEvents
        : filteredEvents.slice(pageStart, pageEnd);

    const handleViewAll = (event) => {
        setViewAllEvent(event);
        setIsViewAllModalOpen(true);
    };

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
            <div className={isListView ? "d-flex flex-column gap-3" : "row g-4"}>
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
                            className={isListView ? "" : "col-12 col-lg-6"}
                        >
                            <EventCard
                                layout={isListView ? "list" : "grid"}
                                title={event.title}
                                status={event.status}
                                date={event.date}
                                time={event.time}
                                location={event.location}
                                invitees={event.invitees}
                                subEvents={event.subEvents}
                                eventId={event.id}
                                eventRaw={event.raw}
                                onDeleted={fetchEventData}
                                onViewAll={() => handleViewAll(event)}
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


            <SubEventApprovalModal
                visible={isViewAllModalOpen}
                onClose={closeViewAllModal}
                event={viewAllEvent}
                onDeleted={fetchEventData}
            />
            <ToastContainer />
        </>
    );
};

export default EventManagement;

