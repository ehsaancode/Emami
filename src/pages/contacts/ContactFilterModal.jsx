import { useEffect, useRef, useState } from "react";
import ModalWrapper from "../../pagecomponents/Common/ModalWrapper";
import CustomButton from "../../pagecomponents/Elements/Buttons/CustomButton";
import AppInputField from "../../pagecomponents/Common/AppInputField";
import ContactSearchSelect from "../../pagecomponents/Common/ContactSearchSelect";
import { baseApiUrl } from "../../helpers/constants";
import { postReq } from "../../helpers/api";

const toArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const normalizeIdList = (value) =>
  toArray(value)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);

const ContactFilterModal = ({ visible, onClose, onApply, initialFilter = {} }) => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
  });
  const [eventSearch, setEventSearch] = useState("");
  const [familySearch, setFamilySearch] = useState("");
  const [eventOptions, setEventOptions] = useState([]);
  const [familyOptions, setFamilyOptions] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedFamilies, setSelectedFamilies] = useState([]);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  const [isFamiliesLoading, setIsFamiliesLoading] = useState(false);

  const eventRequestRef = useRef(0);
  const familyRequestRef = useRef(0);

  const mergeSelectedWithOptions = (selectedItems, options, key, labelKey, fallbackPrefix) => {
    const optionMap = new Map(options.map((item) => [Number(item[key]), item]));
    return selectedItems.map((item) => {
      const id = Number(item[key]);
      const matched = optionMap.get(id);
      if (!matched) {
        return {
          ...item,
          [labelKey]: item[labelKey] || `${fallbackPrefix} #${id}`,
        };
      }
      return matched;
    });
  };

  const fetchEvents = async (searchText = "") => {
    const requestId = eventRequestRef.current + 1;
    eventRequestRef.current = requestId;
    setIsEventsLoading(true);

    try {
      const response = await postReq(`${baseApiUrl}/event/search`, {
        inputData: {
          filter: {
            approval_status: "submitted",
            contact_name: searchText.trim(),
          },
        },
      });

      if (requestId !== eventRequestRef.current) return;

      const rows = Array.isArray(response?.data) ? response.data : [];
      setEventOptions(rows);
      setSelectedEvents((prev) =>
        mergeSelectedWithOptions(prev, rows, "event_Id", "event_name", "Event"),
      );
    } catch (error) {
      if (requestId !== eventRequestRef.current) return;
      setEventOptions([]);
    } finally {
      if (requestId === eventRequestRef.current) {
        setIsEventsLoading(false);
      }
    }
  };

  const fetchFamilies = async (searchText = "") => {
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
      setSelectedFamilies((prev) =>
        mergeSelectedWithOptions(prev, rows, "family_group_Id", "family_group_Name", "Family"),
      );
    } catch (error) {
      if (requestId !== familyRequestRef.current) return;
      setFamilyOptions([]);
    } finally {
      if (requestId === familyRequestRef.current) {
        setIsFamiliesLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!visible) return;

    const initialEventIds = normalizeIdList(initialFilter?.event_Ids);
    const initialFamilyIds = normalizeIdList(initialFilter?.family_group_Ids);
    const firstEmail = Array.isArray(initialFilter?.email) ? initialFilter.email[0] : initialFilter?.email;
    const firstMobile = Array.isArray(initialFilter?.mobile) ? initialFilter.mobile[0] : initialFilter?.mobile;

    setFormData({
      name: String(initialFilter?.name || "").trim(),
      mobile: String(firstMobile || "").trim(),
      email: String(firstEmail || "").trim(),
      address: String(initialFilter?.address || "").trim(),
    });
    setSelectedEvents(
      initialEventIds.map((id) => ({
        event_Id: id,
        event_name: `Event #${id}`,
      })),
    );
    setSelectedFamilies(
      initialFamilyIds.map((id) => ({
        family_group_Id: id,
        family_group_Name: `Family #${id}`,
      })),
    );
    setEventSearch("");
    setFamilySearch("");

    fetchEvents("");
    fetchFamilies("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      fetchEvents(eventSearch);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventSearch, visible]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      fetchFamilies(familySearch);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familySearch, visible]);

  const handleEventSelectionChange = (items = []) => {
    const normalizedItems = Array.isArray(items) ? items : [];
    setSelectedEvents(
      normalizedItems.map((item) => ({
        event_Id: Number(item?.id || item?.event_Id || 0),
        event_name: item?.name || item?.event_name || `Event #${item?.id || "-"}`,
      })),
    );
  };

  const handleFamilySelectionChange = (items = []) => {
    const normalizedItems = Array.isArray(items) ? items : [];
    setSelectedFamilies(
      normalizedItems.map((item) => ({
        family_group_Id: Number(item?.id || item?.family_group_Id || 0),
        family_group_Name:
          item?.name || item?.family_group_Name || `Family #${item?.id || "-"}`,
      })),
    );
  };

  const handleSubmit = () => {
    const normalizedMobile = formData.mobile.replace(/[^\d]/g, "").trim();
    const normalizedEmail = formData.email.trim().toLowerCase();

    const appliedFilter = {
      name: formData.name.trim(),
      email: normalizedEmail ? [normalizedEmail] : [],
      address: formData.address.trim(),
      mobile: normalizedMobile ? [normalizedMobile] : [],
      event_Ids: selectedEvents
        .map((event) => Number(event?.event_Id || 0))
        .filter((item) => Number.isFinite(item) && item > 0),
      family_group_Ids: selectedFamilies
        .map((family) => Number(family?.family_group_Id || 0))
        .filter((item) => Number.isFinite(item) && item > 0),
    };

    const appliedFilterUi = {
      name: appliedFilter.name,
      mobile: normalizedMobile,
      email: normalizedEmail,
      address: appliedFilter.address,
      events: selectedEvents.map((event) => ({
        id: Number(event?.event_Id || 0),
        name: event?.event_name || `Event #${event?.event_Id || "-"}`,
      })),
      families: selectedFamilies.map((family) => ({
        id: Number(family?.family_group_Id || 0),
        name: family?.family_group_Name || `Family #${family?.family_group_Id || "-"}`,
      })),
    };

    onApply?.(appliedFilter, appliedFilterUi);
    onClose?.();
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      modalTitle="Filter"
      dialogClassName="contacts-filter-modal-dialog"
    >
      <div className="contacts-filter-modal">
        <div className="contacts-filter-grid">
          <AppInputField
            label="Name"
            name="name"
            type="text"
            placeholder="Enter Name"
            value={formData.name}
            onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
            wrapperClassName="contacts-filter-field"
          />
          <AppInputField
            label="Mobile"
            name="mobile"
            type="text"
            placeholder="Enter Mobile Number"
            value={formData.mobile}
            onChange={(event) => setFormData((prev) => ({ ...prev, mobile: event.target.value }))}
            wrapperClassName="contacts-filter-field"
          />
          <AppInputField
            label="Email"
            name="email"
            type="text"
            placeholder="Enter Email"
            value={formData.email}
            onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
            wrapperClassName="contacts-filter-field"
          />
          <AppInputField
            label="Address"
            name="address"
            type="text"
            placeholder="Enter Address"
            value={formData.address}
            onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))}
            wrapperClassName="contacts-filter-field"
          />
        </div>

        <div className="contacts-filter-section">
          <div className="app-input-label">Event</div>
          <ContactSearchSelect
            id="contact-filter-event"
            name="contact_filter_event"
            value={selectedEvents.map((event) => ({
              id: Number(event?.event_Id || 0),
              name: event?.event_name || `Event #${event?.event_Id || "-"}`,
            }))}
            options={eventOptions}
            optionIdKey="event_Id"
            optionLabelKey="event_name"
            useExternalOptions
            loading={isEventsLoading}
            onSearch={(value) => setEventSearch(value)}
            onSelectionChange={handleEventSelectionChange}
            placeholder="Search event"
          />
        </div>

        <div className="contacts-filter-section">
          <div className="app-input-label">Contact</div>
          <ContactSearchSelect
            id="contact-filter-family"
            name="contact_filter_family"
            value={selectedFamilies.map((family) => ({
              id: Number(family?.family_group_Id || 0),
              name: family?.family_group_Name || `Family #${family?.family_group_Id || "-"}`,
            }))}
            options={familyOptions}
            optionIdKey="family_group_Id"
            optionLabelKey="family_group_Name"
            useExternalOptions
            loading={isFamiliesLoading}
            onSearch={(value) => setFamilySearch(value)}
            onSelectionChange={handleFamilySelectionChange}
            placeholder="Search family"
          />
        </div>

        <div className="contacts-filter-footer">
          <CustomButton title="Cancel" variant="secondary" onClick={onClose} />
          <CustomButton title="Submit" onClick={handleSubmit} />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ContactFilterModal;

