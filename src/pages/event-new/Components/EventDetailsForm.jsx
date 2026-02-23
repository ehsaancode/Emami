import FormField from "../../../pagecomponents/Common/FormField";
import addEditEventStyles from "./addEditEventStyles";

export default function EventDetailsForm({
    isSubEventMode,
    formData,
    setFormData,
    timeOptions,
}) {
    const { textareaStyles } = addEditEventStyles;

    return (
        <div className="row">
            <div className="col-12 col-lg-6">
                <FormField
                    label={isSubEventMode ? "Sub Event Name" : "Event Name"}
                    required
                    placeholder={isSubEventMode ? "Enter Sub Event Name" : "Enter Event Name"}
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
                        htmlFor={isSubEventMode ? "sub_event_description" : "event_description"}
                    >
                        Add Description
                        <span className="app-field-required">*</span>
                    </label>

                    <textarea
                        id={isSubEventMode ? "sub_event_description" : "event_description"}
                        name={isSubEventMode ? "sub_event_description" : "event_description"}
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
    );
}
