import { useCallback, useEffect, useRef, useState } from "react";
import CustomButton from "../../../pagecomponents/Elements/Buttons/CustomButton";
import ContactSearchSelect from "../../../pagecomponents/Common/ContactSearchSelect";
import FormField from "../../../pagecomponents/Common/FormField";
import ModalWrapper from "../../../pagecomponents/Common/ModalWrapper";
import { baseApiUrl } from "../../../helpers/constants";
import { postReq } from "../../../helpers/api";
import { formatEventDate } from "../../../helpers/utility";

const toArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const normalizeIdList = (value) =>
    toArray(value)
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item) && item > 0);

const buildFallbackSelection = (ids, prefix) =>
    ids.map((id) => ({
        id,
        name: `${prefix} #${id}`,
    }));

const mergeSelectionsWithOptions = (selectedItems = [], options = []) => {
    const optionMap = new Map(
        options.map((item) => [
            Number(item?.family_group_Id || item?.id || 0),
            item,
        ]),
    );

    return selectedItems.map((item) => {
        const id = Number(item?.id || 0);
        const matched = optionMap.get(id);
        if (!matched) return item;
        return {
            id,
            name: matched?.family_group_Name || matched?.name || item.name || `Family #${id}`,
        };
    });
};

const EventFilterModal = ({ visible, onClose, onApply, initialFilter }) => {
    const [formData, setFormData] = useState({
        eventName: initialFilter?.event_name ?? "",
        venue: initialFilter?.venue ?? "",
        startDate: null,
        startDateStartTime: initialFilter?.start_time ?? "",
        startDateEndTime: initialFilter?.end_time ?? "",
        endDate: null,
        endDateStartTime: initialFilter?.end_start_time ?? "",
        endDateEndTime: initialFilter?.end_end_time ?? "",
    });
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [selectedFamilies, setSelectedFamilies] = useState([]);
    const [familySearch, setFamilySearch] = useState("");
    const [familyOptions, setFamilyOptions] = useState([]);
    const [isFamiliesLoading, setIsFamiliesLoading] = useState(false);
    const familyRequestRef = useRef(0);
    const timeOptions = ["8:00 PM", "9:00 PM", "10:00 PM"];

    const fetchFamilies = useCallback(
        async (searchText = "") => {
            const requestId = familyRequestRef.current + 1;
            familyRequestRef.current = requestId;
            setIsFamiliesLoading(true);

            try {
                const response = await postReq(`${baseApiUrl}/family/all`, {
                    inputData: {
                        filter: {
                            family_group_Name: searchText.trim(),
                        },
                        pagination: {
                            page: 1,
                            limit: 50,
                        },
                    },
                });

                if (requestId !== familyRequestRef.current) return;

                const rows = Array.isArray(response?.data) ? response.data : [];
                setFamilyOptions(rows);
                setSelectedFamilies((prev) => mergeSelectionsWithOptions(prev, rows));
            } catch (error) {
                if (requestId !== familyRequestRef.current) return;
                setFamilyOptions([]);
            } finally {
                if (requestId === familyRequestRef.current) {
                    setIsFamiliesLoading(false);
                }
            }
        },
        [baseApiUrl, postReq],
    );

    useEffect(() => {
        if (!visible) return;
        setFormData({
            eventName: initialFilter?.event_name ?? "",
            venue: initialFilter?.venue ?? "",
            startDate: null,
            startDateStartTime: initialFilter?.start_time ?? "",
            startDateEndTime: initialFilter?.end_time ?? "",
            endDate: null,
            endDateStartTime: initialFilter?.end_start_time ?? "",
            endDateEndTime: initialFilter?.end_end_time ?? "",
        });

        const initialContactIds = normalizeIdList(initialFilter?.contact_Ids);
        const initialFamilyIds = normalizeIdList(initialFilter?.family_group_Ids);

        setSelectedContacts(buildFallbackSelection(initialContactIds, "Contact"));
        setSelectedFamilies(buildFallbackSelection(initialFamilyIds, "Family"));
        setFamilySearch("");
        fetchFamilies("");
    }, [fetchFamilies, initialFilter, visible]);

    useEffect(() => {
        if (!visible) return;
        const timer = setTimeout(() => {
            fetchFamilies(familySearch);
        }, 300);

        return () => clearTimeout(timer);
    }, [familySearch, fetchFamilies, visible]);

    const handleSubmit = () => {
        const filter = {
            event_name: formData.eventName,
            venue: formData.venue,
            start_date: formatEventDate(formData.startDate),
            end_date: formatEventDate(formData.endDate),
            start_time: formData.startDateStartTime || "",
            end_time: formData.startDateEndTime || "",
            end_start_time: formData.endDateStartTime || "",
            end_end_time: formData.endDateEndTime || "",
            contact_Ids: selectedContacts
                .map((item) => Number(item?.id || 0))
                .filter((item) => Number.isFinite(item) && item > 0),
            family_group_Ids: selectedFamilies
                .map((item) => Number(item?.id || 0))
                .filter((item) => Number.isFinite(item) && item > 0),
        };

        onApply?.(filter);
        onClose?.();
    };

    const footer = (
        <div className="d-flex justify-content-end gap-2 w-100">
            <button className="event-filter-cancel" type="button" onClick={onClose}>
                Cancel
            </button>
            <CustomButton title="Submit" onClick={handleSubmit} />
        </div>
    );

    return (
        <ModalWrapper
            visible={visible}
            onClose={onClose}
            modalTitle="Filter"
            modalSize="lg"
            footerFlag
            footerBody={footer}
            contentClassName="event-filter-modal"
            headerStyle={{ background: "#0b63f3", borderBottom: "0" }}
        >
            <style>
                {`
                .event-filter-modal {
                    border-radius: 12px;
                    overflow: hidden;
                }

                .event-filter-modal .modal-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: #fff;
                }

                .event-filter-modal .modal-header {
                    padding: 16px 20px;
                }

                .event-filter-modal .modal-body {
                    padding: 22px 24px 10px;
                    background: #fff;
                }

                .event-filter-modal .modal-footer {
                    border-top: 0;
                    padding: 16px 24px 22px;
                    background: #fff;
                }

                .event-filter-cancel {
                    border-radius: 999px;
                    border: 1px solid #e6e9ef;
                    background: #fff;
                    padding: 8px 22px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #2f343a;
                }
                `}
            </style>

            <div className="row">
                <div className="col-12 col-md-6">
                    <FormField
                        label="Event Name"
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

                <div className="col-12 col-md-6">
                    <FormField
                        label="Venue"
                        placeholder="Enter Venue"
                        value={formData.venue}
                        onChange={(event) =>
                            setFormData((prev) => ({
                                ...prev,
                                venue: event.target.value,
                            }))
                        }
                    />
                </div>

                <div className="col-12 col-md-6">
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

                <div className="col-12 col-md-3">
                    <FormField
                        label="Start Time"
                        required
                        type="time"
                        options={timeOptions}
                        placeholder="8:00 PM"
                        rightIconClassName="bi bi-clock"
                        value={formData.startDateStartTime}
                        onChange={(value) =>
                            setFormData((prev) => ({
                                ...prev,
                                startDateStartTime: value,
                            }))
                        }
                    />
                </div>

                <div className="col-12 col-md-3">
                    <FormField
                        label="End Time"
                        required
                        type="time"
                        options={timeOptions}
                        placeholder="8:00 PM"
                        rightIconClassName="bi bi-clock"
                        value={formData.startDateEndTime}
                        onChange={(value) =>
                            setFormData((prev) => ({
                                ...prev,
                                startDateEndTime: value,
                            }))
                        }
                    />
                </div>

                <div className="col-12 col-md-6">
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

                <div className="col-12 col-md-3">
                    <FormField
                        label="Start Time"
                        required
                        type="time"
                        options={timeOptions}
                        placeholder="8:00 PM"
                        rightIconClassName="bi bi-clock"
                        value={formData.endDateStartTime}
                        onChange={(value) =>
                            setFormData((prev) => ({
                                ...prev,
                                endDateStartTime: value,
                            }))
                        }
                    />
                </div>

                <div className="col-12 col-md-3">
                    <FormField
                        label="End Time"
                        required
                        type="time"
                        options={timeOptions}
                        placeholder="8:00 PM"
                        rightIconClassName="bi bi-clock"
                        value={formData.endDateEndTime}
                        onChange={(value) =>
                            setFormData((prev) => ({
                                ...prev,
                                endDateEndTime: value,
                            }))
                        }
                    />
                </div>

                <div className="col-12">
                    <div className="app-field">
                        <div className="app-field-label">Contact</div>
                        <ContactSearchSelect
                            id="event-filter-contacts"
                            name="event_filter_contacts"
                            value={selectedContacts}
                            onSelectionChange={(items) => setSelectedContacts(items)}
                            placeholder="Search contact"
                        />
                    </div>
                </div>

                <div className="col-12">
                    <div className="app-field">
                        <div className="app-field-label">Family Group</div>
                        <ContactSearchSelect
                            id="event-filter-family"
                            name="event_filter_family"
                            value={selectedFamilies}
                            options={familyOptions}
                            optionIdKey="family_group_Id"
                            optionLabelKey="family_group_Name"
                            useExternalOptions
                            loading={isFamiliesLoading}
                            onSearch={(value) => setFamilySearch(value)}
                            onSelectionChange={(items) => setSelectedFamilies(items)}
                            placeholder="Search family group"
                        />
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
};

export default EventFilterModal;

