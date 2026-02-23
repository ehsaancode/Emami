import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import CustomButton from "../../../../pagecomponents/Elements/Buttons/CustomButton";
import FormField from "../../../../pagecomponents/Common/FormField";
import {
    addMultipleWithSubEvents,
    updateData as updateEvent,
} from "../../../../redux/slices/EventSlice";
import {
    formatEventDate,
    parseDateValue,
    toastMessage,
    to24HourTime,
} from "../../../../helpers/utility";

export default function CreateNewSubEvents() {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const subEventRaw = location.state?.subEventRaw ?? location.state?.eventRaw;
    const isEditMode = location.state?.mode === "edit" && subEventRaw;
    const pageTitle = isEditMode ? "Update Sub Event" : "Create Sub Event";
    const pageSubTitle = isEditMode
        ? "Update and manage sub events"
        : "Create and manage Sub Events";
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

    const parentDraft = location.state?.parentDraft;
    const parentPreview = location.state?.parentPreview;
    const parentEvent = location.state?.parentEvent ?? parentPreview ?? {
        id: null,
        title: "Parent Event",
        date: "",
        time: "",
        location: "",
        invitees: "",
    };
    const [subEvents, setSubEvents] = useState([]);

    /* ---------- styles ---------- */

    const parentStyles = {
        marginBottom: "16px",
    };

    const parentTitleStyles = {
        fontSize: "16px",
        fontWeight: 700,
        color: "#1f2a8a",
        marginBottom: "4px",
    };

    const parentMetaStyles = {
        fontSize: "12px",
        color: "#7280a7",
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        alignItems: "center",
    };

    const dotStyles = {
        width: "2px",
        height: "15px",
        background: "#c7d2fe",
    };

    const textareaStyles = {
        height: "96px",
        borderRadius: "18px",
        padding: "12px 16px",
        resize: "none",
    };

    const actionsStyles = {
        marginTop: "20px",
    };

    const outlineButtonStyles = {
        borderRadius: "999px",
        border: "1px solid #e6e9ef",
        background: "#fff",
        padding: "8px 26px",
        fontSize: "13px",
        fontWeight: 600,
        color: "#2f343a",
        minWidth: "110px",
        cursor: "pointer",
    };

    useEffect(() => {
        if (!isEditMode || !subEventRaw) return;
        const timeslots = subEventRaw?.event_date_Json?.timeslots ?? [];
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
            eventName: subEventRaw?.event_name ?? "",
            location: subEventRaw?.event_location ?? "",
            startDate,
            startTime,
            endDate,
            endTime,
            description: subEventRaw?.event_description ?? "",
        });
    }, [isEditMode, subEventRaw]);

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
            status: "draft",
        };
    };

    const addToSubEventList = () => {
        if (!formData.eventName || !formData.location || !formData.startDate) {
            toastMessage("error", "Please fill all required fields.");
            return;
        }

        const subEventPayload = buildSubEventPayload();
        const uiId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setSubEvents((prev) => [
            ...prev,
            {
                uiId,
                payload: subEventPayload,
                display: {
                    title: formData.eventName,
                    date:
                        formData.startDate && formData.endDate
                            ? `${formatEventDate(
                                formData.startDate
                            )} - ${formatEventDate(formData.endDate)}`
                            : formatEventDate(formData.startDate),
                    time:
                        formData.startTime && formData.endTime
                            ? `${formData.startTime} - ${formData.endTime}`
                            : formData.startTime || formData.endTime || "",
                    location: formData.location,
                },
            },
        ]);
        setFormData((prev) => ({
            ...prev,
            eventName: "",
            location: "",
            startDate: null,
            startTime: "",
            endDate: null,
            endTime: "",
            description: "",
        }));
        toastMessage("success", "Sub event added.");
    };

    const removeSubEvent = (uiId) => {
        setSubEvents((prev) => prev.filter((item) => item.uiId !== uiId));
    };

    const normalizeParentDraft = (draft) => {
        if (!draft?.inputData) return null;
        const parentInput = { ...draft.inputData };
        const timeslots =
            parentInput?.event_date_Json?.timeslots?.map((slot) => ({
                date: slot?.date,
                start_time: slot?.start_time ?? slot?.startTime ?? "",
                end_time: slot?.end_time ?? slot?.endTime ?? "",
            })) ?? [];

        return {
            event_name: parentInput.event_name,
            event_description: parentInput.event_description ?? "",
            event_location: parentInput.event_location,
            event_date_Json: {
                timezone: parentInput?.event_date_Json?.timezone ?? "Asia/Kolkata",
                timeslots,
            },
            status: parentInput.status ?? "draft",
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
                event_Id: subEventRaw?.event_Id,
                event_name: formData.eventName,
                event_description: formData.description || "",
                event_location: formData.location,
                event_date_Json: {
                    timezone:
                        subEventRaw?.event_date_Json?.timezone ?? "Asia/Kolkata",
                    timeslots,
                },
                status: subEventRaw?.status ?? "draft",
            },
        };
    };

    const handleSubmit = async () => {
        if (isEditMode) {
            if (!formData.eventName || !formData.location || !formData.startDate) {
                toastMessage("error", "Please fill all required fields.");
                return;
            }
            if (!subEventRaw?.event_Id) {
                toastMessage("error", "Sub event id is missing.");
                return;
            }

            setIsSubmitting(true);
            try {
                const { payload: apiPayload } = await dispatch(
                    updateEvent(buildUpdatePayload())
                );
                if (apiPayload?.status !== "success") {
                    toastMessage(
                        "error",
                        apiPayload?.msg || "Failed to update sub event."
                    );
                    return;
                }
                toastMessage("success", apiPayload?.msg || "Sub event updated.");
                navigate("/event-management");
            } catch (error) {
                toastMessage("error", "Failed to update sub event.");
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        if (!parentDraft) {
            toastMessage("error", "Please create the parent event first.");
            return;
        }

        const list = subEvents.map((item) => item.payload);
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
            list.push(buildSubEventPayload());
        }

        if (list.length === 0) {
            toastMessage("error", "Please add at least one sub event.");
            return;
        }

        const parentPayload = normalizeParentDraft(parentDraft);
        if (!parentPayload) {
            toastMessage("error", "Parent event data is missing.");
            return;
        }

        const payload = {
            inputData: {
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
                    apiPayload?.msg || "Failed to create event with sub events."
                );
                return;
            }

            toastMessage("success", apiPayload?.msg || "Event created.");
            navigate("/event-management");
        } catch (error) {
            toastMessage("error", "Failed to create event with sub events.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackToParent = () => {
        navigate("/event-management/new-event", {
            state: {
                parentDraft,
                parentPreview,
            },
        });
    };

    /* ---------- JSX ---------- */

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

            <div style={parentStyles}>
                <div style={parentTitleStyles}>{parentEvent?.title}</div>

                <div style={parentMetaStyles}>
                    <span>{parentEvent?.date}</span>
                    <span style={dotStyles} />
                    <span>{parentEvent?.time}</span>
                    <span style={dotStyles} />
                    <span>{parentEvent?.location}</span>
                    <span style={dotStyles} />
                    <span>{parentEvent?.invitees}</span>
                </div>
            </div>

            {!isEditMode && subEvents.length > 0 && (
                <div >
                    <div
                        style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#2f343a",
                            marginBottom: "8px",
                        }}
                    >
                        Sub Events
                    </div>
                    <div className="d-flex flex-column gap-2">
                        {subEvents.map((item) => (
                            <div
                                key={item.uiId}
                                style={{
                                    border: "1px solid #eef1f5",
                                    borderRadius: "12px",
                                    padding: "10px 14px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "12px",
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: 700,
                                            color: "#2f343a",
                                        }}
                                    >
                                        {item.display.title}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#7280a7",
                                            marginTop: "2px",
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: "8px",
                                        }}
                                    >
                                        <span>{item.display.date}</span>
                                        <span>{item.display.time}</span>
                                        <span>{item.display.location}</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeSubEvent(item.uiId)}
                                    style={{
                                        border: "1px solid #e6e9ef",
                                        background: "#fff",
                                        borderRadius: "999px",
                                        padding: "6px 14px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#ef4444",
                                        cursor: "pointer",
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{marginTop: "20px"}}>
                <div className="row">
                    <div className="col-12 col-lg-6">
                        <FormField
                            label="Sub Event Name"
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
                            <label
                                className="app-field-label"
                                htmlFor="sub_event_description"
                            >
                                Add Description
                                <span className="app-field-required">*</span>
                            </label>

                            <textarea
                                id="sub_event_description"
                                name="sub_event_description"
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
                            onClick={handleBackToParent}
                            disabled={isSubmitting}
                        >
                            Skip Sub Event
                        </button>
                    )}

                    {!isEditMode && (
                        <button
                            type="button"
                            style={outlineButtonStyles}
                            onClick={addToSubEventList}
                            disabled={isSubmitting}
                        >
                            Add
                        </button>
                    )}

                    <CustomButton
                        title={isEditMode ? "Update" : "Submit"}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    />
                </div>


            </div>


        </>
    );
}

