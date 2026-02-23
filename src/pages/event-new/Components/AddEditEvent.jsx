import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import {
    addData as addEvent,
    addMultipleWithSubEvents,
    updateData as updateEvent,
} from "../../../redux/slices/EventSlice";
import {
    formatEventDate,
    parseDateValue,
    toastMessage,
    to24HourTime,
} from "../../../helpers/utility";
import addEditEventStyles from "./addEditEventStyles";
import ParentEventSummary from "./ParentEventSummary";
import SubEventListSection from "./SubEventListSection";
import EventDetailsForm from "./EventDetailsForm";
import EventFormActions from "./EventFormActions";

export default function AddEditEvent({
    mode,
    eventRaw: eventRawProp,
    parentDraft: parentDraftProp,
    parentPreview: parentPreviewProp,
    parentEvent: parentEventProp,
    onClose,
    onSaved,
    onOpenSubEvent,
    onSkipSubEvent: onSkipSubEventProp,
}) {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const eventRaw = eventRawProp ?? location.state?.eventRaw;
    const parentDraft = parentDraftProp ?? location.state?.parentDraft;
    const parentPreview = parentPreviewProp ?? location.state?.parentPreview;
    const parentEvent = parentEventProp ?? location.state?.parentEvent ?? parentPreview;
    const resolvedMode = mode ?? location.state?.mode;
    const isSubEventMode = resolvedMode === "sub-event";
    const isEditMode = resolvedMode === "edit" && eventRaw;
    const pageTitle = isSubEventMode
        ? "Create Sub Event"
        : isEditMode
            ? "Update Event"
            : "Create New Event";
    const pageSubTitle = isSubEventMode
        ? "Create and manage Sub Events"
        : isEditMode
            ? "Update and manage event details"
            : "Create and manage new events";
    const timeOptions = ["8:00 PM", "9:00 PM", "10:00 PM"];
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [subEvents, setSubEvents] = useState([]);
    const [editingSubEventId, setEditingSubEventId] = useState(null);
    const [formData, setFormData] = useState({
        eventName: "",
        location: "",
        startDate: null,
        startTime: "",
        endDate: null,
        endTime: "",
        description: "",
    });

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            navigate(-1);
        }
    };

    const {
        headerStyles,
        formStyles,
    } = addEditEventStyles;

    const normalizeStatus = (value) => {
        const normalized = String(value || "").trim().toLowerCase();
        if (normalized === "submit") return "submit";
        return "draft";
    };

    const formatTimeForDisplay = (value) => {
        if (!value) return "";
        if (/(AM|PM)/i.test(value)) return value.toUpperCase();
        const match = value.match(/^(\d{1,2}):(\d{2})$/);
        if (!match) return value;

        let hour = Number(match[1]);
        const minute = match[2];
        const period = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;
        return `${hour}:${minute} ${period}`;
    };

    const buildTimeRangeLabel = (startValue, endValue) => {
        const start = formatTimeForDisplay(startValue);
        const end = formatTimeForDisplay(endValue);
        if (start && end) {
            const startPeriod = start.match(/(AM|PM)$/i)?.[1]?.toUpperCase();
            const endPeriod = end.match(/(AM|PM)$/i)?.[1]?.toUpperCase();
            if (startPeriod && endPeriod && startPeriod === endPeriod) {
                return `${start.replace(/\s*(AM|PM)$/i, "")} - ${end}`;
            }
            return `${start} - ${end}`;
        }
        return start || end || "";
    };

    const buildSubEventDisplay = (payload = {}) => {
        const timeslots = payload?.event_date_Json?.timeslots ?? [];
        const firstSlot = timeslots[0] ?? {};
        const lastSlot = timeslots[timeslots.length - 1] ?? firstSlot;
        const startDate = parseDateValue(firstSlot?.date);
        const endDate = parseDateValue(lastSlot?.date) ?? startDate;

        const dateLabel =
            startDate && endDate && formatEventDate(startDate) !== formatEventDate(endDate)
                ? `${formatEventDate(startDate)} - ${formatEventDate(endDate)}`
                : formatEventDate(startDate);

        const startTime = firstSlot?.start_time ?? firstSlot?.startTime ?? "";
        const endTime =
            firstSlot?.end_time ??
            firstSlot?.endTime ??
            lastSlot?.end_time ??
            lastSlot?.endTime ??
            "";

        return {
            title: payload?.event_name ?? "",
            date: dateLabel,
            time: buildTimeRangeLabel(startTime, endTime),
            location: payload?.event_location ?? "",
            description: payload?.event_description ?? "",
            day: startDate ? String(startDate.getDate()) : "--",
            month: startDate
                ? startDate.toLocaleDateString("en-US", { month: "long" })
                : "",
            badgeTime: buildTimeRangeLabel(startTime, endTime),
        };
    };

    const toSubEventItem = (payload, uiId) => ({
        uiId: uiId ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        payload,
        display: buildSubEventDisplay(payload),
    });

    const getInviteeSummary = (value) => {
        if (Array.isArray(value)) {
            const count = value.length;
            return count ? `${count} invitee${count === 1 ? "" : "s"}` : "No invitees";
        }
        if (typeof value === "number") {
            return value ? `${value} invitee${value === 1 ? "" : "s"}` : "No invitees";
        }
        if (typeof value === "string") {
            return value.trim() || "No invitees";
        }
        return "No invitees";
    };

    useEffect(() => {
        if (!isEditMode || !eventRaw) return;

        const timeslots = eventRaw?.event_date_Json?.timeslots ?? [];
        const firstSlot = timeslots[0] ?? {};
        const lastSlot = timeslots[timeslots.length - 1] ?? firstSlot;
        const startDate = parseDateValue(firstSlot?.date);
        const endDate = parseDateValue(lastSlot?.date) ?? startDate;
        const startTime = firstSlot?.start_time ?? firstSlot?.startTime ?? "";
        const endTime =
            firstSlot?.end_time ??
            firstSlot?.endTime ??
            lastSlot?.end_time ??
            lastSlot?.endTime ??
            startTime;

        setFormData({
            eventName: eventRaw?.event_name ?? "",
            location: eventRaw?.event_location ?? "",
            startDate,
            startTime,
            endDate,
            endTime,
            description: eventRaw?.event_description ?? "",
        });
    }, [eventRaw, isEditMode]);

    useEffect(() => {
        if (isEditMode || isSubEventMode || !parentDraft?.inputData) return;

        const timeslots = parentDraft?.inputData?.event_date_Json?.timeslots ?? [];
        const firstSlot = timeslots[0] ?? {};
        const lastSlot = timeslots[timeslots.length - 1] ?? firstSlot;
        const startDate = parseDateValue(firstSlot?.date);
        const endDate = parseDateValue(lastSlot?.date) ?? startDate;
        const startTime = firstSlot?.start_time ?? firstSlot?.startTime ?? "";
        const endTime =
            firstSlot?.end_time ??
            firstSlot?.endTime ??
            lastSlot?.end_time ??
            lastSlot?.endTime ??
            startTime;

        setFormData({
            eventName: parentDraft?.inputData?.event_name ?? "",
            location: parentDraft?.inputData?.event_location ?? "",
            startDate,
            startTime,
            endDate,
            endTime,
            description: parentDraft?.inputData?.event_description ?? "",
        });
    }, [isEditMode, isSubEventMode, parentDraft]);

    useEffect(() => {
        if (!isSubEventMode) return;

        setFormData({
            eventName: "",
            location: "",
            startDate: null,
            startTime: "",
            endDate: null,
            endTime: "",
            description: "",
        });
        setEditingSubEventId(null);
    }, [isSubEventMode]);

    useEffect(() => {
        if (!isSubEventMode) return;

        const draftSubEvents = Array.isArray(parentDraft?.inputData?.sub_events)
            ? parentDraft.inputData.sub_events
            : [];

        const sourceSubEvents = draftSubEvents;

        if (!sourceSubEvents.length) {
            setSubEvents([]);
            return;
        }

        const normalizedSubEvents = sourceSubEvents.map((subEvent, index) => {
            const sourceTimeslots =
                subEvent?.event_date_Json?.timeslots ??
                subEvent?.event_date_json?.timeslots ??
                [];

            const payload = {
                event_name:
                    subEvent?.event_name ??
                    subEvent?.event_Name ??
                    subEvent?.title ??
                    "",
                event_description:
                    subEvent?.event_description ?? subEvent?.description ?? "",
                event_location:
                    subEvent?.event_location ?? subEvent?.location ?? "",
                event_date_Json: {
                    timezone:
                        subEvent?.event_date_Json?.timezone ??
                        subEvent?.event_date_json?.timezone ??
                        "Asia/Kolkata",
                    timeslots: sourceTimeslots.map((slot) => ({
                        date: slot?.date,
                        start_time: slot?.start_time ?? slot?.startTime ?? "",
                        end_time: slot?.end_time ?? slot?.endTime ?? "",
                    })),
                },
                status: normalizeStatus(subEvent?.status),
                ...(subEvent?.comments ? { comments: subEvent.comments } : {}),
                ...(subEvent?.event_Id ? { event_Id: subEvent.event_Id } : {}),
            };

            const rawId =
                subEvent?.event_Id ?? subEvent?.event_id ?? subEvent?.id ?? index;

            return toSubEventItem(payload, `existing-${rawId}`);
        });

        setSubEvents(normalizedSubEvents);
    }, [isSubEventMode, parentDraft]);

    const buildPayload = () => {
        const startDate = formatEventDate(formData.startDate);
        const endDate = formatEventDate(formData.endDate);
        const startTime = to24HourTime(formData.startTime);
        const endTime = to24HourTime(formData.endTime);

        const timeslots = [];
        if (startDate) {
            timeslots.push({
                date: startDate,
                start_time: startTime || "00:00",
                end_time: endTime || startTime || "00:00",
            });
        }

        if (endDate && endDate !== startDate) {
            timeslots.push({
                date: endDate,
                start_time: startTime || "00:00",
                end_time: endTime || startTime || "00:00",
            });
        }

        return {
            inputData: {
                event_name: formData.eventName,
                event_description: formData.description || "",
                event_location: formData.location,
                event_date_Json: {
                    timezone: "Asia/Kolkata",
                    timeslots,
                },
                status: "draft",
            },
        };
    };

    const buildUpdatePayload = () => {
        const startDate = formatEventDate(formData.startDate);
        const endDate = formatEventDate(formData.endDate) || startDate;
        const startTime = to24HourTime(formData.startTime);
        const endTime = to24HourTime(formData.endTime);

        const timeslots = [];
        if (startDate) {
            timeslots.push({
                date: startDate,
                start_time: startTime || "00:00",
                end_time: endTime || startTime || "00:00",
            });
        }

        if (endDate && endDate !== startDate) {
            timeslots.push({
                date: endDate,
                start_time: startTime || "00:00",
                end_time: endTime || startTime || "00:00",
            });
        }

        return {
            inputData: {
                event_Id: eventRaw?.event_Id,
                event_name: formData.eventName,
                event_description: formData.description || "",
                event_location: formData.location,
                event_date_Json: {
                    timezone:
                        eventRaw?.event_date_Json?.timezone ?? "Asia/Kolkata",
                    timeslots,
                },
                status: normalizeStatus(eventRaw?.status),
            },
        };
    };

    const handleCreateEvent = async () => {
        if (!formData.eventName || !formData.location || !formData.startDate) {
            toastMessage("error", "Please fill all required fields.");
            return;
        }
        if (isEditMode && !eventRaw?.event_Id) {
            toastMessage("error", "Event id is missing.");
            return;
        }

        setIsSubmitting(true);
        try {
            const { payload } = await dispatch(
                isEditMode ? updateEvent(buildUpdatePayload()) : addEvent(buildPayload())
            );
            if (payload?.status !== "success") {
                toastMessage(
                    "error",
                    payload?.msg ||
                    `Failed to ${isEditMode ? "update" : "create"} event.`
                );
                return;
            }

            toastMessage(
                "success",
                payload?.msg || `Event ${isEditMode ? "updated" : "created"}.`
            );
            onSaved?.(payload);
            if (onClose) {
                onClose();
            } else {
                navigate("/event-management");
            }
        } catch (error) {
            toastMessage(
                "error",
                error?.response?.data?.msg ||
                error?.message ||
                `Failed to ${isEditMode ? "update" : "create"} event.`
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const buildSubEventPayload = () => {
        const startDate = formatEventDate(formData.startDate);
        const endDate = formatEventDate(formData.endDate);
        const startTime = to24HourTime(formData.startTime);
        const endTime = to24HourTime(formData.endTime);

        const timeslots = [];
        if (startDate) {
            timeslots.push({
                date: startDate,
                start_time: startTime || "00:00",
                end_time: endTime || startTime || "00:00",
            });
        }

        if (endDate && endDate !== startDate) {
            timeslots.push({
                date: endDate,
                start_time: startTime || "00:00",
                end_time: endTime || startTime || "00:00",
            });
        }

        return {
            event_name: formData.eventName,
            event_description: formData.description || "",
            event_location: formData.location,
            event_date_Json: {
                timezone: "Asia/Kolkata",
                timeslots,
            },
            status: normalizeStatus("draft"),
        };
    };

    const resetSubEventForm = () => {
        setFormData({
            eventName: "",
            location: "",
            startDate: null,
            startTime: "",
            endDate: null,
            endTime: "",
            description: "",
        });
        setEditingSubEventId(null);
    };

    const addToSubEventList = () => {
        if (!formData.eventName || !formData.location || !formData.startDate) {
            toastMessage("error", "Please fill all required fields.");
            return;
        }

        const subEventPayload = buildSubEventPayload();

        if (editingSubEventId) {
            setSubEvents((prev) =>
                prev.map((item) => {
                    if (item.uiId !== editingSubEventId) return item;
                    const mergedPayload = {
                        ...item.payload,
                        ...subEventPayload,
                        status: item.payload?.status ?? subEventPayload.status,
                        ...(item.payload?.event_Id
                            ? { event_Id: item.payload.event_Id }
                            : {}),
                        ...(item.payload?.comments
                            ? { comments: item.payload.comments }
                            : {}),
                    };
                    return toSubEventItem(mergedPayload, item.uiId);
                })
            );
            toastMessage("success", "Sub event updated.");
            resetSubEventForm();
            return;
        }

        setSubEvents((prev) => [...prev, toSubEventItem(subEventPayload)]);
        resetSubEventForm();
        toastMessage("success", "Sub event added.");
    };

    const removeSubEvent = (uiId) => {
        setSubEvents((prev) => prev.filter((item) => item.uiId !== uiId));
        if (editingSubEventId === uiId) {
            resetSubEventForm();
        }
    };

    const editSubEvent = (uiId) => {
        const selectedSubEvent = subEvents.find((item) => item.uiId === uiId);
        if (!selectedSubEvent) return;

        const timeslots = selectedSubEvent?.payload?.event_date_Json?.timeslots ?? [];
        const firstSlot = timeslots[0] ?? {};
        const lastSlot = timeslots[timeslots.length - 1] ?? firstSlot;
        const startDate = parseDateValue(firstSlot?.date);
        const endDate = parseDateValue(lastSlot?.date) ?? startDate;
        const startTime = firstSlot?.start_time ?? firstSlot?.startTime ?? "";
        const endTime =
            firstSlot?.end_time ??
            firstSlot?.endTime ??
            lastSlot?.end_time ??
            lastSlot?.endTime ??
            startTime;

        setFormData({
            eventName: selectedSubEvent?.payload?.event_name ?? "",
            location: selectedSubEvent?.payload?.event_location ?? "",
            startDate,
            startTime: formatTimeForDisplay(startTime),
            endDate,
            endTime: formatTimeForDisplay(endTime),
            description: selectedSubEvent?.payload?.event_description ?? "",
        });
        setEditingSubEventId(uiId);
    };

    const normalizeParentPayload = () => {
        if (parentDraft?.inputData) {
            const parentInput = { ...parentDraft.inputData };
            const timeslots =
                parentInput?.event_date_Json?.timeslots?.map((slot) => ({
                    date: slot?.date,
                    start_time: slot?.start_time ?? slot?.startTime ?? "",
                    end_time: slot?.end_time ?? slot?.endTime ?? "",
                })) ?? [];

            const normalizedStatus = normalizeStatus(parentInput.status);

            return {
                event_name: parentInput.event_name,
                event_description: parentInput.event_description ?? "",
                event_location: parentInput.event_location,
                event_date_Json: {
                    timezone: parentInput?.event_date_Json?.timezone ?? "Asia/Kolkata",
                    timeslots,
                },
                status: normalizedStatus,
                ...(parentInput?.event_Id ? { event_Id: parentInput.event_Id } : {}),
            };
        }

        const raw = parentEvent?.raw ?? parentEvent;
        if (!raw) return null;

        const timeslots =
            raw?.event_date_Json?.timeslots?.map((slot) => ({
                date: slot?.date,
                start_time: slot?.start_time ?? slot?.startTime ?? "",
                end_time: slot?.end_time ?? slot?.endTime ?? "",
            })) ??
            raw?.event_date_json?.timeslots?.map((slot) => ({
                date: slot?.date,
                start_time: slot?.start_time ?? slot?.startTime ?? "",
                end_time: slot?.end_time ?? slot?.endTime ?? "",
            })) ??
            [];

        const rawEventId = raw?.event_Id ?? raw?.event_id ?? raw?.id;
        return {
            ...(rawEventId ? { event_Id: rawEventId } : {}),
            event_name: raw?.event_name ?? parentEvent?.title ?? "",
            event_description: raw?.event_description ?? "",
            event_location: raw?.event_location ?? parentEvent?.location ?? "",
            event_date_Json: {
                timezone: raw?.event_date_Json?.timezone ?? "Asia/Kolkata",
                timeslots,
            },
            status: normalizeStatus(raw?.status),
        };
    };
    const handleSubmitSubEvent = async () => {
        let list = subEvents.map((item) => item.payload);
        if (
            formData.eventName ||
            formData.location ||
            formData.startDate ||
            formData.startTime ||
            formData.endDate ||
            formData.endTime
        ) {
            if (!formData.eventName || !formData.location || !formData.startDate) {
                toastMessage("error", "Please fill all required fields.");
                return;
            }

            const draftPayload = buildSubEventPayload();
            if (editingSubEventId) {
                list = subEvents.map((item) =>
                    item.uiId === editingSubEventId
                        ? {
                            ...item.payload,
                            ...draftPayload,
                            status: item.payload?.status ?? draftPayload.status,
                            ...(item.payload?.event_Id
                                ? { event_Id: item.payload.event_Id }
                                : {}),
                            ...(item.payload?.comments
                                ? { comments: item.payload.comments }
                                : {}),
                        }
                        : item.payload
                );
            } else {
                list.push(draftPayload);
            }
        }

        if (list.length === 0) {
            toastMessage("error", "Please add at least one sub event.");
            return;
        }

        const parentPayload = normalizeParentPayload();
        if (!parentPayload) {
            toastMessage("error", "Parent event data is missing.");
            return;
        }
        if (!parentPayload?.event_date_Json?.timeslots?.length) {
            toastMessage("error", "Parent event date/time is missing.");
            return;
        }

        const createMainEvent = !Boolean(parentPayload?.event_Id);

        const payload = {
            inputData: {
                createMainEvent,
                events: [
                    {
                        ...parentPayload,
                        sub_events: list,
                    },
                ],
            },
        };

        setIsSubmitting(true);
        try {
            const { payload: apiPayload } = await dispatch(
                addMultipleWithSubEvents(payload)
            );
            if (apiPayload?.status !== "success") {
                toastMessage(
                    "error",
                    apiPayload?.msg || "Failed to create sub events."
                );
                return;
            }

            toastMessage("success", apiPayload?.msg || "Sub events saved.");
            onSaved?.(apiPayload);
            handleClose();
        } catch (error) {
            toastMessage(
                "error",
                error?.response?.data?.msg || error?.message || "Failed to create sub events."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoToSubEvent = () => {
        if (!formData.eventName || !formData.location || !formData.startDate) {
            toastMessage("error", "Please fill all required fields.");
            return;
        }

        const parentPreview = {
            title: formData.eventName,
            date:
                formData.startDate && formData.endDate
                    ? `${formatEventDate(formData.startDate)} - ${formatEventDate(
                        formData.endDate
                    )}`
                    : formatEventDate(formData.startDate),
            time:
                formData.startTime && formData.endTime
                    ? `${formData.startTime} - ${formData.endTime}`
                    : formData.startTime || formData.endTime || "",
            location: formData.location,
            invitees: "",
        };

        if (onOpenSubEvent) {
            onOpenSubEvent(buildPayload(), parentPreview);
            return;
        }

        navigate("/event-management/new-sub-event", {
            state: {
                parentDraft: buildPayload(),
                parentPreview,
            },
        });
    };

    const handleSkipSubEvent = () => {
        if (isSubEventMode && parentDraft?.inputData) {
            const resolvedParentPreview = parentPreview ?? parentEvent ?? null;

            if (onSkipSubEventProp) {
                onSkipSubEventProp(parentDraft, resolvedParentPreview);
                return;
            }

            navigate("/event-management/new-event", {
                state: {
                    parentDraft,
                    parentPreview: resolvedParentPreview,
                },
            });
            return;
        }

        handleClose();
    };

    const subEventInviteesText = getInviteeSummary(parentEvent?.invitees);


    return (
        <>
            <ToastContainer />
            <div
                className="breadcrumb-header justify-content-between align-items-center"
                style={headerStyles}
            >
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1 d-block">
                        {pageTitle}
                    </span>
                    <small>{pageSubTitle}</small>
                </div>
            </div>

            {isSubEventMode && (
                <ParentEventSummary
                    parentEvent={parentEvent}
                />
            )}

            {isSubEventMode && subEvents.length > 0 && (
                <SubEventListSection
                    subEvents={subEvents}
                    subEventInviteesText={subEventInviteesText}
                    onEditSubEvent={editSubEvent}
                    onRemoveSubEvent={removeSubEvent}
                />
            )}

            <div style={formStyles}>
                <EventDetailsForm
                    isSubEventMode={isSubEventMode}
                    formData={formData}
                    setFormData={setFormData}
                    timeOptions={timeOptions}
                />

                <EventFormActions
                    isSubEventMode={isSubEventMode}
                    isEditMode={isEditMode}
                    isSubmitting={isSubmitting}
                    editingSubEventId={editingSubEventId}
                    onSkipSubEvent={handleSkipSubEvent}
                    onAddOrUpdateSubEvent={addToSubEventList}
                    onSubmitSubEvents={handleSubmitSubEvent}
                    onAddSubEvent={handleGoToSubEvent}
                    onCancel={handleClose}
                    onSubmitEvent={handleCreateEvent}
                />
            </div>
        </>
    );
}

