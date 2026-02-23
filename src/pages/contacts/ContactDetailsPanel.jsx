import React from "react";
import { toArray, normalizeText } from "../../helpers/utility";

const getContactId = (contact = {}) =>
  contact?.contact_Contact_Id ?? contact?.contact_Id ?? contact?.id ?? "-";

const getContactName = (contact = {}) => {
  const fullName = normalizeText(contact?.full_name);
  if (fullName) return fullName;

  const firstName = normalizeText(contact?.contact_Primary_Full_Name);
  const lastName = normalizeText(contact?.contact_Last_Name);

  return [firstName, lastName].filter(Boolean).join(" ") || "-";
};

const getContactType = (contact = {}) =>
  normalizeText(contact?.contact_Type) || normalizeText(contact?.type) || "-";

const getSalutation = (contact = {}) =>
  normalizeText(contact?.contact_Salutation) || normalizeText(contact?.salutation) || "-";

const getContactStatus = (contact = {}) =>
  Number(contact?.is_active) === 1 ? "Active" : "Inactive";

const formatPhone = (phone = {}) => {
  const cc = normalizeText(phone?.country_code);
  const pn = normalizeText(phone?.phone_number);
  const value = [cc, pn].filter(Boolean).join(" ");
  return value || "-";
};

const formatAddress = (address = {}) => {
  const parts = [
    normalizeText(address?.address_line1),
    normalizeText(address?.address_line2),
    normalizeText(address?.address_line3),
    normalizeText(address?.city),
    normalizeText(address?.pin_code),
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "-";
};

const parseEventDatePayload = (value) => {
  if (!value) return null;

  if (typeof value === "object") {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    try {
      return JSON.parse(trimmed);
    } catch (error) {
      return { raw: trimmed };
    }
  }

  return null;
};

const formatDisplayDate = (value) => {
  const raw = normalizeText(value);
  if (!raw) return "";

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const formatDisplayTime = (value) => {
  const raw = normalizeText(value);
  if (!raw) return "";

  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(raw)) {
    const normalized = raw.length === 5 ? `${raw}:00` : raw;
    const parsed = new Date(`1970-01-01T${normalized}`);
    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      }).format(parsed);
    }
  }

  return raw;
};

const buildScheduleSlot = (slot = {}) => {
  const dateLabel = formatDisplayDate(slot?.date || slot?.event_date || slot?.start_date || slot?.startDate);
  const startTime = formatDisplayTime(slot?.start_time || slot?.startTime || slot?.from_time || slot?.from);
  const endTime = formatDisplayTime(slot?.end_time || slot?.endTime || slot?.to_time || slot?.to);

  const timeLabel = startTime && endTime ? `${startTime} - ${endTime}` : startTime || endTime;

  return {
    dateLabel,
    timeLabel,
  };
};

const renderEventSchedule = (value) => {
  const parsed = parseEventDatePayload(value);
  if (!parsed) return "-";

  if (parsed?.raw) {
    return parsed.raw;
  }

  const timeslots = toArray(parsed?.timeslots);
  const normalizedSlots = timeslots.length
    ? timeslots
    : [parsed].filter(
        (slot) =>
          normalizeText(slot?.date || slot?.event_date || slot?.start_date || slot?.startDate) ||
          normalizeText(slot?.start_time || slot?.startTime || slot?.from_time || slot?.from) ||
          normalizeText(slot?.end_time || slot?.endTime || slot?.to_time || slot?.to),
      );

  if (!normalizedSlots.length) return "-";

  const timezone = normalizeText(parsed?.timezone);

  return (
    <div className="contacts-event-schedule">
      {normalizedSlots.slice(0, 3).map((slot, index) => {
        const { dateLabel, timeLabel } = buildScheduleSlot(slot);
        return (
          <div key={`slot-${index}`} className="contacts-event-slot">
            <span className="contacts-event-slot-date">{dateLabel || "-"}</span>
            {timeLabel && <span className="contacts-event-slot-time">{timeLabel}</span>}
          </div>
        );
      })}
      {normalizedSlots.length > 3 && (
        <div className="contacts-event-slot-more">+{normalizedSlots.length - 3} more slot(s)</div>
      )}
      {timezone && <div className="contacts-event-timezone">TZ: {timezone}</div>}
    </div>
  );
};

const renderChipList = (items = [], fallback = "None") => {
  const cleaned = toArray(items).map((item) => normalizeText(item)).filter(Boolean);
  if (!cleaned.length) {
    return <span className="contacts-view-empty-text">{fallback}</span>;
  }

  return (
    <>
      {cleaned.map((item, index) => (
        <span key={`${item}-${index}`} className="badge bg-dark me-1">
          {item}
        </span>
      ))}
    </>
  );
};

const ContactChannels = ({ contactData = {} }) => {
  const contactBlock = contactData?.contact || {};
  const phones = toArray(contactBlock?.phones);
  const emails = toArray(contactBlock?.emails);
  const addresses = toArray(contactBlock?.addresses);
  const metadata = contactBlock?.metadata || null;

  return (
    <div className="contacts-view-section">
      <h6 className="contacts-view-section-title">Contact Channels</h6>

      <div className="contacts-view-subsection">
        <p className="contacts-view-subtitle">Phones</p>
        {phones.length === 0 ? (
          <div className="contacts-view-empty-text">No phones.</div>
        ) : (
          <ul className="contacts-view-list">
            {phones.map((phone, index) => (
              <li key={`phone-${getContactId(contactData)}-${index}`}>
                <span>{formatPhone(phone)}</span>
                {Number(phone?.is_default) === 1 && (
                  <span className="contacts-view-badge">Default</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="contacts-view-subsection">
        <p className="contacts-view-subtitle">Emails</p>
        {emails.length === 0 ? (
          <div className="contacts-view-empty-text">No emails.</div>
        ) : (
          <ul className="contacts-view-list">
            {emails.map((email, index) => (
              <li key={`email-${getContactId(contactData)}-${index}`}>
                <span>{normalizeText(email?.email_address) || "-"}</span>
                {Number(email?.is_default) === 1 && (
                  <span className="contacts-view-badge">Default</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="contacts-view-subsection">
        <p className="contacts-view-subtitle">Addresses</p>
        {addresses.length === 0 ? (
          <div className="contacts-view-empty-text">No addresses.</div>
        ) : (
          <ul className="contacts-view-list">
            {addresses.map((address, index) => (
              <li key={`address-${getContactId(contactData)}-${index}`}>
                <span>{formatAddress(address)}</span>
                {Number(address?.is_default) === 1 && (
                  <span className="contacts-view-badge">Default</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="contacts-view-subsection">
        <p className="contacts-view-subtitle">Remark</p>
        <div className="contacts-view-empty-text">
          {normalizeText(metadata?.contact_Remark) || "No remark."}
        </div>
      </div>
    </div>
  );
};

const ContactCard = ({ title, data }) => {
  if (!data) {
    return (
      <div className="contacts-view-section">
        <h6 className="contacts-view-section-title">{title}</h6>
        <div className="contacts-view-empty-text">No details found.</div>
      </div>
    );
  }

  const tags = toArray(data?.tags)
    .map((tag) =>
      normalizeText(tag?.tag_name) ||
      normalizeText(tag?.name) ||
      normalizeText(tag?.label),
    )
    .filter(Boolean);

  const fallbackTagNames = toArray(data?.tag_names)
    .map((tag) => normalizeText(tag))
    .filter(Boolean);

  return (
    <div className="contacts-view-section">
      <h6 className="contacts-view-section-title">{title}</h6>

      <div className="contacts-view-kpi-grid">
        <div className="contacts-view-kpi">
          <span className="contacts-view-kpi-label">Salutation</span>
          <span className="contacts-view-kpi-value">{getSalutation(data)}</span>
        </div>
        <div className="contacts-view-kpi">
          <span className="contacts-view-kpi-label">Name</span>
          <span className="contacts-view-kpi-value">{getContactName(data)}</span>
        </div>
        <div className="contacts-view-kpi">
          <span className="contacts-view-kpi-label">Type</span>
          <span className="contacts-view-kpi-value">{getContactType(data)}</span>
        </div>
        <div className="contacts-view-kpi">
          <span className="contacts-view-kpi-label">Status</span>
          <span className="contacts-view-kpi-value">{getContactStatus(data)}</span>
        </div>
      </div>

      <div className="contacts-view-subsection">
        <p className="contacts-view-subtitle">Tags</p>
        {renderChipList(tags.length ? tags : fallbackTagNames, "No tags.")}
      </div>

      <div className="contacts-view-subsection">
        <p className="contacts-view-subtitle">Family Groups</p>
        {renderChipList(data?.family_group_names, "No family group.")}
      </div>
    </div>
  );
};

const ContactDetailsPanel = ({ data }) => {
  if (!data) {
    return <div className="contacts-view-empty-text">No contact details found.</div>;
  }

  const spouseChildren = toArray(data?.spouse_children);
  const family = toArray(data?.family);
  const associatedEvents = toArray(data?.associated_events);
  const requestedName = getContactName(data);

  return (
    <div className="contacts-view-container">
      <ContactCard title={`Contact: ${requestedName}`} data={data} />

      <ContactChannels contactData={data} />

      {data?.main_contact && <ContactCard title="Main Contact" data={data.main_contact} />}

      <div className="contacts-view-section">
        <h6 className="contacts-view-section-title">Associated Events</h6>
        {associatedEvents.length === 0 ? (
          <div className="contacts-view-empty-text">No events associated.</div>
        ) : (
          <div className="contacts-view-table-wrap">
            <table className="contacts-view-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Invite Type</th>
                  <th>Schedule</th>
                </tr>
              </thead>
              <tbody>
                {associatedEvents.map((event, index) => (
                  <tr key={`${event?.event_Id || "event"}-${index}`}>
                    <td>{normalizeText(event?.event_name) || `Event #${event?.event_Id || "-"}`}</td>
                    <td>{normalizeText(event?.event_location) || "-"}</td>
                    <td>{normalizeText(event?.status) || "-"}</td>
                    <td>{normalizeText(event?.invite_type) || "-"}</td>
                    <td>{renderEventSchedule(event?.event_date_Json)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="contacts-view-section">
        <h6 className="contacts-view-section-title">Spouse</h6>
        {spouseChildren.length === 0 ? (
          <div className="contacts-view-empty-text">No spouse records.</div>
        ) : (
          <div className="contacts-view-stack">
            {spouseChildren.map((member) => (
              <ContactCard
                key={`spouse-child-${getContactId(member)}`}
                title={getContactType(member)}
                data={member}
              />
            ))}
          </div>
        )}
      </div>

      <div className="contacts-view-section">
        <h6 className="contacts-view-section-title">Family</h6>
        {family.length === 0 ? (
          <div className="contacts-view-empty-text">No family members found.</div>
        ) : (
          <div className="contacts-view-stack">
            {family.map((member) => (
              <ContactCard
                key={`family-${getContactId(member)}`}
                title={getContactType(member)}
                data={member}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactDetailsPanel;

