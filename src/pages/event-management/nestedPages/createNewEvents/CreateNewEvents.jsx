import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import CustomButton from "../../../../pagecomponents/Elements/Buttons/CustomButton";
import FormField from "../../../../pagecomponents/Common/FormField";
import {
    addData as addEvent,
    updateData as updateEvent,
} from "../../../../redux/slices/EventSlice";
import {
    formatEventDate,
    parseDateValue,
    toastMessage,
    to24HourTime,
} from "../../../../helpers/utility";

export default function CreateNewEvents() {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const eventRaw = location.state?.eventRaw;
    const parentDraft = location.state?.parentDraft;
    const isEditMode = location.state?.mode === "edit" && eventRaw;
    const pageTitle = isEditMode ? "Update Event" : "Create New Event";
    const pageSubTitle = isEditMode
        ? "Update and manage event details"
        : "Create and manage new events";
    const timeOptions = ["8:00 PM", "9:00 PM", "10:00 PM"];
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        eventName: "",
        location: "",
        startDate: null,
        startTime: "",
        endDate: null,
        endTime: "",
        description: "",
    });

    // ---------- inline styles ----------
    const formStyles = {
        background: "transparent",
    };

    const textareaStyles = {
        height: "96px",
        borderRadius: "18px",
        padding: "12px 16px",
        resize: "none",
    };

    const actionsStyles = {
        marginTop: "6px",
    };

    const outlineButtonStyles = {
        borderRadius: "999px",
        border: "1px solid #e6e9ef",
        background: "#fff",
        padding: "8px 22px",
        fontSize: "13px",
        fontWeight: 600,
        color: "#2f343a",
        cursor: "pointer",
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
        if (isEditMode || !parentDraft?.inputData) return;

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
    }, [isEditMode, parentDraft]);

    const buildPayload = () => {
        const startDate = formatEventDate(formData.startDate);
        const endDate = formatEventDate(formData.endDate);
        const startTime = to24HourTime(formData.startTime);
        const endTime = to24HourTime(formData.endTime);

        const timeslots = [];
        if (startDate) {
            timeslots.push({
                date: startDate,
                startTime: startTime || "00:00",
                endTime: endTime || startTime || "00:00",
                status: "planned",
            });
        }

        if (endDate && endDate !== startDate) {
            timeslots.push({
                date: endDate,
                startTime: startTime || "00:00",
                endTime: endTime || startTime || "00:00",
                status: "planned",
            });
        }

        return {
            inputData: {
                event_name: formData.eventName,
                event_description: formData.description || "",
                event_location: formData.location,
                event_date_Json: {
                    type: timeslots.length > 1 ? "multiday" : "singleday",
                    timezone: "Asia/Kolkata",
                    timeslots,
                },
                status: "active",
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
                    type: timeslots.length > 1 ? "multiday" : "singleday",
                    timezone:
                        eventRaw?.event_date_Json?.timezone ?? "Asia/Kolkata",
                    timeslots,
                },
                status: eventRaw?.status ?? "draft",
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
            navigate("/event-management");
        } catch (error) {
            toastMessage(
                "error",
                `Failed to ${isEditMode ? "update" : "create"} event.`
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

        navigate("/event-management/new-sub-event", {
            state: {
                parentDraft: buildPayload(),
                parentPreview,
            },
        });
    };


    return (
        <>
            <ToastContainer />
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

            <div style={formStyles}>
                <div className="row">
                    <div className="col-12 col-lg-6">
                        <FormField
                            label="Event Name"
                            required
                            placeholder="Enter Event Name"
                            value={formData.eventName}
                            onChange={(event) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    eventName: event.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="col-12 col-lg-6">
                        <FormField
                            label="Location"
                            required
                            placeholder="Enter Location"
                            value={formData.location}
                            onChange={(event) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    location: event.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="col-12 col-md-6 col-lg-3">
                        <FormField
                            label="Start Date"
                            required
                            type="date"
                            placeholder="dd/mm/yyyy"
                            rightIconClassName="bi bi-calendar3"
                            value={formData.startDate}
                            onChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    startDate: value,
                                }))
                            }
                        />
                    </div>

                    <div className="col-12 col-md-6 col-lg-3">
                        <FormField
                            label="Start Time"
                            required
                            type="time"
                            options={timeOptions}
                            placeholder="8:00 PM"
                            value={formData.startTime}
                            onChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    startTime: value,
                                }))
                            }
                        />
                    </div>

                    <div className="col-12 col-md-6 col-lg-3">
                        <FormField
                            label="End Date"
                            required
                            type="date"
                            placeholder="dd/mm/yyyy"
                            rightIconClassName="bi bi-calendar3"
                            value={formData.endDate}
                            onChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    endDate: value,
                                }))
                            }
                        />
                    </div>

                    <div className="col-12 col-md-6 col-lg-3">
                        <FormField
                            label="End Time"
                            required
                            type="time"
                            options={timeOptions}
                            placeholder="8:00 PM"
                            value={formData.endTime}
                            onChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    endTime: value,
                                }))
                            }
                        />
                    </div>

                    <div className="col-12">
                        <div className="app-field">
                            <label className="app-field-label" htmlFor="event_description">
                                Add Description
                                <span className="app-field-required">*</span>
                            </label>

                            <textarea
                                id="event_description"
                                name="event_description"
                                className="app-field-input"
                                placeholder="Add Description"
                                style={textareaStyles}
                                value={formData.description}
                                onChange={(event) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        description: event.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>
                </div>

                <div
                    className="d-flex justify-content-end gap-2"
                    style={actionsStyles}
                >
                    {!isEditMode && (
                        <button
                            type="button"
                            style={outlineButtonStyles}
                            onClick={handleGoToSubEvent}
                            disabled={isSubmitting}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#f8fafc")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "#fff")
                            }
                        >
                            Add Sub Event
                        </button>
                    )}

                    <CustomButton
                        title={isEditMode ? "Update" : "Submit"}
                        onClick={handleCreateEvent}
                        disabled={isSubmitting}
                    />
                </div>
            </div>
        </>
    );
}

