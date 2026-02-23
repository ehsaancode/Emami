import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import FormField from "../../pagecomponents/Common/FormField";
import ContactAutoFillSelect from "../../pagecomponents/Common/ContactAutoFillSelect";
import CustomButton from "../../pagecomponents/Elements/Buttons/CustomButton";
import { searchAddress, searchData } from "../../redux/slices/ContactSlice";
import {
  ADDRESS_TYPE_OPTIONS,
  CONTACT_SEARCH_FIELDS,
  EMAIL_TYPE_OPTIONS,
  PHONE_TYPE_OPTIONS,
  SALUTATION_OPTIONS,
  SEARCH_DEBOUNCE_MS,
  buildApiMetadata,
  buildSearchOptions,
  cleanText,
  createAddress,
  createEmail,
  createPhone,
  createSectionData,
  getCityFromRow,
  getPincodeFromRow,
  hasSpouseInput,
  normalizeFormPayload,
  sanitizeApiAddresses,
  sanitizeApiEmails,
  sanitizeApiPhones,
  toApiSalutation,
  toArray,
  toDigits,
  toNumber,
  validateFormData,
} from "./addEditForm.helpers";

const extractAddressSearchRows = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const normalizeAddressSearchRow = (row) => {
  if (typeof row === "string" || typeof row === "number") {
    const value = cleanText(row);
    if (!value) return null;

    return {
      address: value,
      address_line1: value,
    };
  }

  if (!row || typeof row !== "object") return null;

  const normalizedAddressLine1 = cleanText(
    row?.address_line1 ||
    row?.address,
  );

  if (!normalizedAddressLine1) return null;

  return {
    ...row,
    address: cleanText(row?.address) || normalizedAddressLine1,
    address_line1: cleanText(row?.address_line1) || normalizedAddressLine1,
    address_line2: cleanText(row?.address_line2),
    city: cleanText(row?.city),
    pin_code: cleanText(row?.pin_code),
  };
};

const getMainLastNameFromRow = (row = {}) =>
  cleanText(row?.contact_last_name || row?.contact_Last_Name || row?.last_name);

const getSpouseLastNameFromRow = (row = {}) =>
  cleanText(row?.spouse_last_name || row?.contact_Last_Name || row?.last_name);

const getAddressLine2FromRow = (row = {}) => {
  const addressRows = toArray(row?.contact?.addresses);
  const defaultAddress = addressRows.find((address) => Boolean(address?.is_default)) || addressRows[0] || {};

  return cleanText(row?.address_line2 || defaultAddress?.address_line2);
};

const createSearchTermState = () => ({
  [CONTACT_SEARCH_FIELDS.MAIN]: "",
  [CONTACT_SEARCH_FIELDS.SPOUSE]: "",
  [CONTACT_SEARCH_FIELDS.ADDRESS]: "",
});

const createSearchOptionState = () => ({
  [CONTACT_SEARCH_FIELDS.MAIN]: [],
  [CONTACT_SEARCH_FIELDS.SPOUSE]: [],
  [CONTACT_SEARCH_FIELDS.ADDRESS]: [],
});

const createSearchRequestState = () => ({
  [CONTACT_SEARCH_FIELDS.MAIN]: 0,
  [CONTACT_SEARCH_FIELDS.SPOUSE]: 0,
  [CONTACT_SEARCH_FIELDS.ADDRESS]: 0,
});

const AddEditForm = ({
  saveData,
  onSave,
  closeModal,
  formPayload,
  isSaveDisabled = false,
  isEdit = false,
}) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(() => normalizeFormPayload(formPayload));
  const [errors, setErrors] = useState({});
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [searchTerms, setSearchTerms] = useState(createSearchTermState);
  const [searchOptions, setSearchOptions] = useState(createSearchOptionState);
  const searchRequestRef = useRef(createSearchRequestState());

  const setSearchTerm = useCallback((field, value) => {
    setSearchTerms((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const setFieldOptions = useCallback((field, options) => {
    setSearchOptions((prev) => ({
      ...prev,
      [field]: Array.isArray(options) ? options : [],
    }));
  }, []);

  const searchContactsByField = useCallback(
    async (searchTerm, field) => {
      const normalizedTerm = cleanText(searchTerm);

      if (!normalizedTerm) {
        setFieldOptions(field, []);
        return;
      }

      const requestId = (searchRequestRef.current[field] || 0) + 1;
      searchRequestRef.current[field] = requestId;

      try {
        const isAddressField = field === CONTACT_SEARCH_FIELDS.ADDRESS;
        const requestAction = isAddressField
          ? searchAddress({
            inputData: {
              filter: {
                search: normalizedTerm,
              },
            },
          })
          : searchData({
            inputData: {
              filter: {
                name: normalizedTerm,
                family_group_Id: 0,
              },
            },
          });

        const { payload } = await dispatch(requestAction);

        if (requestId !== searchRequestRef.current[field]) return;

        if (payload?.status !== "success") {
          setFieldOptions(field, []);
          return;
        }

        if (isAddressField) {
          const normalizedAddressRows = extractAddressSearchRows(payload?.data)
            .map((row) => normalizeAddressSearchRow(row))
            .filter(Boolean);

          setFieldOptions(
            field,
            buildSearchOptions(normalizedAddressRows, CONTACT_SEARCH_FIELDS.ADDRESS),
          );
          return;
        }

        setFieldOptions(field, buildSearchOptions(payload?.data, field));
      } catch {
        if (requestId === searchRequestRef.current[field]) {
          setFieldOptions(field, []);
        }
      }
    },
    [dispatch, setFieldOptions],
  );

  const mainNameSearchTerm = searchTerms[CONTACT_SEARCH_FIELDS.MAIN];
  const spouseNameSearchTerm = searchTerms[CONTACT_SEARCH_FIELDS.SPOUSE];
  const addressSearchTerm = searchTerms[CONTACT_SEARCH_FIELDS.ADDRESS];

  useEffect(() => {
    const timer = setTimeout(() => {
      searchContactsByField(mainNameSearchTerm, CONTACT_SEARCH_FIELDS.MAIN);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [mainNameSearchTerm, searchContactsByField]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchContactsByField(spouseNameSearchTerm, CONTACT_SEARCH_FIELDS.SPOUSE);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchContactsByField, spouseNameSearchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchContactsByField(addressSearchTerm, CONTACT_SEARCH_FIELDS.ADDRESS);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [addressSearchTerm, searchContactsByField]);

  const mainNameOptions = searchOptions[CONTACT_SEARCH_FIELDS.MAIN] || [];
  const spouseNameOptions = searchOptions[CONTACT_SEARCH_FIELDS.SPOUSE] || [];
  const addressOptions = searchOptions[CONTACT_SEARCH_FIELDS.ADDRESS] || [];

  const getError = (key) => errors[key] || "";
  const hasError = (key) => Boolean(getError(key));

  const applyAddressAutoFill = (section, index, row = {}) => {
    if (!row || typeof row !== "object") return;

    const city = getCityFromRow(row);
    const pincode = getPincodeFromRow(row);
    const addressLine2 = getAddressLine2FromRow(row);
    if (!city && !pincode && !addressLine2) return;

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        addresses: toArray(prev[section]?.addresses).map((address, rowIndex) =>
          rowIndex === index
            ? {
              ...address,
              addressLine2: addressLine2 || address?.addressLine2 || "",
              city: city || address?.city || "",
              pincode: pincode || address?.pincode || "",
            }
            : address,
        ),
      },
    }));
  };

  useEffect(() => {
    if (!isSubmitAttempted) return;
    setErrors(validateFormData(formData));
  }, [formData, isSubmitAttempted]);

  useEffect(() => {
    setFormData(normalizeFormPayload(formPayload));
    setErrors({});
    setIsSubmitAttempted(false);
    searchRequestRef.current = createSearchRequestState();
    setSearchTerms(createSearchTermState());
    setSearchOptions(createSearchOptionState());
  }, [formPayload, isEdit]);

  const handleMemberFieldChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleListFieldChange = (section, listKey, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [listKey]: prev[section][listKey].map((item, rowIndex) =>
          rowIndex === index
            ? {
              ...item,
              [field]: value,
            }
            : item,
        ),
      },
    }));
  };

  const addListItem = (section, listKey) => {
    const factoryByList = {
      phones: createPhone,
      emails: createEmail,
      addresses: createAddress,
    };

    const rowFactory = factoryByList[listKey];
    if (!rowFactory) return;

    setFormData((prev) => {
      const existingRows = prev[section][listKey];
      const nextItem = {
        ...rowFactory(),
        isDefault: existingRows.length === 0,
      };

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [listKey]: [...existingRows, nextItem],
        },
      };
    });
  };

  const setDefaultRow = (section, listKey, index) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [listKey]: prev[section][listKey].map((item, rowIndex) => ({
          ...item,
          isDefault: rowIndex === index,
        })),
      },
    }));
  };


  const removeListItem = (section, listKey, index) => {
    setFormData((prev) => {
      const existingRows = prev[section][listKey];
      if (!Array.isArray(existingRows) || existingRows.length <= 1) {
        return prev;
      }

      const nextRows = existingRows.filter((_, rowIndex) => rowIndex !== index);
      const hasDefault = nextRows.some((item) => Boolean(item?.isDefault));
      const normalizedRows = hasDefault
        ? nextRows
        : nextRows.map((item, rowIndex) => ({
          ...item,
          isDefault: rowIndex === 0,
        }));

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [listKey]: normalizedRows,
        },
      };
    });
  };

  const buildPayload = () => {
    const mainSection = formData?.main || createSectionData({ withAddress: true, defaultSalutation: "Mr." });
    const spouseSection = formData?.spouse || createSectionData({ withAddress: false, defaultSalutation: "Mrs." });
    const tags = toArray(mainSection?.tags)
      .map((tag) => Number(tag))
      .filter((tag) => Number.isFinite(tag));

    const payload = {
      salutation: toApiSalutation(mainSection?.salutation) || "Mr",
      full_name: cleanText(mainSection?.firstName),
      last_name: cleanText(mainSection?.lastName),
      type: "MAIN",
      contact: {
        phones: sanitizeApiPhones(mainSection?.phones),
        emails: sanitizeApiEmails(mainSection?.emails),
        addresses: sanitizeApiAddresses(mainSection?.addresses),
        tags,
        metadata: buildApiMetadata(mainSection?.metadataId, mainSection?.remark),
      },
      family: [],
    };

    const mainContactId = toNumber(mainSection?.contactId);
    if (mainContactId > 0) {
      payload.contact_Contact_Id = mainContactId;
    }

    if (hasSpouseInput(spouseSection)) {
      const spousePayload = {
        salutation: toApiSalutation(spouseSection?.salutation) || "Mrs",
        full_name: cleanText(spouseSection?.firstName),
        last_name: cleanText(spouseSection?.lastName),
        type: "SPOUSE",
        contact: {
          phones: sanitizeApiPhones(spouseSection?.phones),
          emails: sanitizeApiEmails(spouseSection?.emails),
          metadata: buildApiMetadata(spouseSection?.metadataId, spouseSection?.remark),
        },
      };

      const spouseContactId = toNumber(spouseSection?.contactId);
      if (spouseContactId > 0) {
        spousePayload.contact_Contact_Id = spouseContactId;
      }

      payload.family = [spousePayload];
    }

    return payload;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitAttempted(true);
    const validationErrors = validateFormData(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload = buildPayload();
    const saveHandler = typeof saveData === "function" ? saveData : onSave;

    if (typeof saveHandler === "function") {
      saveHandler(payload);
      return;
    }
    if (typeof closeModal === "function") {
      closeModal();
    }
  };

  const renderPhoneRows = (sectionKey, rows = []) =>
    rows.map((phone, rowIndex) => (
      <div key={`${sectionKey}-phone-${rowIndex}`} className="contacts-new-row">
        <div className="contacts-new-inline-wrap">
          <div className="contacts-new-row-grid contacts-new-row-grid--phone">
            {(() => {
              const isMainSection = sectionKey === "main";
              const shouldShowRequired = isMainSection || Boolean(cleanText(phone?.number));

              return (
                <>
                  <div className="contacts-new-field-wrap">
                    <FormField
                      wrapperClassName="contacts-new-field"
                      label="Type"
                      required={shouldShowRequired}
                      type="select"
                      options={PHONE_TYPE_OPTIONS}
                      value={phone.type}
                      onChange={(event) =>
                        handleListFieldChange(sectionKey, "phones", rowIndex, "type", event.target.value)
                      }
                      inputClassName={hasError(`${sectionKey}.phones.${rowIndex}.type`) ? "contacts-new-input-error" : ""}
                    />
                    {hasError(`${sectionKey}.phones.${rowIndex}.type`) && (
                      <div className="contacts-new-field-error">{getError(`${sectionKey}.phones.${rowIndex}.type`)}</div>
                    )}
                  </div>
                  <div className="contacts-new-field-wrap">
                    <FormField
                      wrapperClassName="contacts-new-field"
                      label="Code"
                      value={phone.code}
                      onChange={(event) =>
                        handleListFieldChange(sectionKey, "phones", rowIndex, "code", event.target.value)
                      }
                      placeholder="Code"
                      inputMode="numeric"
                      maxLength={4}
                    />
                  </div>
                  <div className="contacts-new-field-wrap">
                    <FormField
                      wrapperClassName="contacts-new-field"
                      label="Number"
                      required={shouldShowRequired}
                      value={phone.number}
                      onChange={(event) =>
                        handleListFieldChange(sectionKey, "phones", rowIndex, "number", toDigits(event.target.value, 10))
                      }
                      placeholder="Enter Mobile Number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      inputClassName={hasError(`${sectionKey}.phones.${rowIndex}.number`) ? "contacts-new-input-error" : ""}
                    />
                    {hasError(`${sectionKey}.phones.${rowIndex}.number`) && (
                      <div className="contacts-new-field-error">{getError(`${sectionKey}.phones.${rowIndex}.number`)}</div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
          <div className="contacts-new-row-actions">
            <label className="contacts-new-default-check">
              <input
                type="checkbox"
                checked={Boolean(phone.isDefault)}
                onChange={() => setDefaultRow(sectionKey, "phones", rowIndex)}
              />
              <span>Make this Default</span>
            </label>
            {rows.length > 1 && (
              <button
                type="button"
                className="contacts-new-remove-btn"
                onClick={() => removeListItem(sectionKey, "phones", rowIndex)}
                aria-label="Remove mobile"
                title="Remove mobile"
              >
                <i className="bi bi-x" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        {rowIndex === rows.length - 1 && (
          <button
            type="button"
            className="contacts-new-add-link"
            onClick={() => addListItem(sectionKey, "phones")}
          >
            Add Mobile <span>+</span>
          </button>
        )}
      </div>
    ));

  const renderEmailRows = (sectionKey, rows = []) =>
    rows.map((email, rowIndex) => (
      <div key={`${sectionKey}-email-${rowIndex}`} className="contacts-new-row">
        <div className="contacts-new-inline-wrap">
          <div className="contacts-new-row-grid contacts-new-row-grid--email">
            {(() => {
              const shouldShowRequired = Boolean(cleanText(email?.email));

              return (
                <>
                  <div className="contacts-new-field-wrap">
                    <FormField
                      wrapperClassName="contacts-new-field"
                      label="Type"
                      required={shouldShowRequired}
                      type="select"
                      options={EMAIL_TYPE_OPTIONS}
                      value={email.type}
                      onChange={(event) =>
                        handleListFieldChange(sectionKey, "emails", rowIndex, "type", event.target.value)
                      }
                      inputClassName={hasError(`${sectionKey}.emails.${rowIndex}.type`) ? "contacts-new-input-error" : ""}
                    />
                    {hasError(`${sectionKey}.emails.${rowIndex}.type`) && (
                      <div className="contacts-new-field-error">{getError(`${sectionKey}.emails.${rowIndex}.type`)}</div>
                    )}
                  </div>
                  <div className="contacts-new-field-wrap">
                    <FormField
                      wrapperClassName="contacts-new-field"
                      label="Enter Your Email"
                      required={shouldShowRequired}
                      value={email.email}
                      onChange={(event) =>
                        handleListFieldChange(sectionKey, "emails", rowIndex, "email", event.target.value)
                      }
                      placeholder="Enter Email Id"
                      type="email"
                      inputClassName={hasError(`${sectionKey}.emails.${rowIndex}.email`) ? "contacts-new-input-error" : ""}
                    />
                    {hasError(`${sectionKey}.emails.${rowIndex}.email`) && (
                      <div className="contacts-new-field-error">{getError(`${sectionKey}.emails.${rowIndex}.email`)}</div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
          <div className="contacts-new-row-actions">
            <label className="contacts-new-default-check">
              <input
                type="checkbox"
                checked={Boolean(email.isDefault)}
                onChange={() => setDefaultRow(sectionKey, "emails", rowIndex)}
              />
              <span>Make this Default</span>
            </label>
            {rows.length > 1 && (
              <button
                type="button"
                className="contacts-new-remove-btn"
                onClick={() => removeListItem(sectionKey, "emails", rowIndex)}
                aria-label="Remove email"
                title="Remove email"
              >
                <i className="bi bi-x" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        {rowIndex === rows.length - 1 && (
          <button
            type="button"
            className="contacts-new-add-link"
            onClick={() => addListItem(sectionKey, "emails")}
          >
            Add Email <span>+</span>
          </button>
        )}
      </div>
    ));

  const renderAddressRows = (sectionKey, rows = []) =>
    rows.map((address, rowIndex) => (
      <div key={`${sectionKey}-address-${rowIndex}`} className="contacts-new-row">
        <div className="contacts-new-inline-wrap">
          <div className="contacts-new-row-grid contacts-new-row-grid--address">
            {(() => {
              const isMainSection = sectionKey === "main";
              const shouldShowRequired =
                isMainSection ||
                Boolean(
                  cleanText(address?.addressLine1) ||
                  cleanText(address?.addressLine2) ||
                  cleanText(address?.city) ||
                  cleanText(address?.pincode),
                );

              return (
                <>
                  <div className="contacts-new-field-wrap">
                    <FormField
                      wrapperClassName="contacts-new-field"
                      label="Type"
                      required={shouldShowRequired}
                      type="select"
                      options={ADDRESS_TYPE_OPTIONS}
                      value={address.type}
                      onChange={(event) =>
                        handleListFieldChange(sectionKey, "addresses", rowIndex, "type", event.target.value)
                      }
                      inputClassName={hasError(`${sectionKey}.addresses.${rowIndex}.type`) ? "contacts-new-input-error" : ""}
                    />
                    {hasError(`${sectionKey}.addresses.${rowIndex}.type`) && (
                      <div className="contacts-new-field-error">{getError(`${sectionKey}.addresses.${rowIndex}.type`)}</div>
                    )}
                  </div>
                  <div className="contacts-new-field-wrap">
                    <div className="app-field contacts-new-field">
                      <label className="app-field-label" htmlFor={`${sectionKey}-address-line1-${rowIndex}`}>
                        Address Line 1
                        {shouldShowRequired ? <span className="app-field-required">*</span> : null}
                      </label>
                      <ContactAutoFillSelect
                        id={`${sectionKey}-address-line1-${rowIndex}`}
                        name={`${sectionKey}-address-line1-${rowIndex}`}
                        value={address.addressLine1}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          handleListFieldChange(sectionKey, "addresses", rowIndex, "addressLine1", nextValue);
                          setSearchTerm(CONTACT_SEARCH_FIELDS.ADDRESS, nextValue);
                        }}
                        onOptionSelect={(option) => applyAddressAutoFill(sectionKey, rowIndex, option?.meta?.row)}
                        options={addressOptions}
                        placeholder="Enter Address Line 1"
                        inputClassName={hasError(`${sectionKey}.addresses.${rowIndex}.addressLine1`) ? "contacts-new-input-error" : ""}
                      />
                    </div>
                    {hasError(`${sectionKey}.addresses.${rowIndex}.addressLine1`) && (
                      <div className="contacts-new-field-error">{getError(`${sectionKey}.addresses.${rowIndex}.addressLine1`)}</div>
                    )}
                  </div>
                  <div className="contacts-new-field-wrap">
                    <FormField
                      wrapperClassName="contacts-new-field"
                      label="Address Line 2"
                      value={address.addressLine2}
                      onChange={(event) =>
                        handleListFieldChange(sectionKey, "addresses", rowIndex, "addressLine2", event.target.value)
                      }
                      placeholder="Enter Address Line 2"
                    />
                  </div>
                  <div className="contacts-new-field-wrap">
                    <FormField
                      wrapperClassName="contacts-new-field"
                      label="City"
                      required={shouldShowRequired}
                      value={address.city}
                      onChange={(event) =>
                        handleListFieldChange(sectionKey, "addresses", rowIndex, "city", event.target.value)
                      }
                      placeholder="Enter City"
                      inputClassName={hasError(`${sectionKey}.addresses.${rowIndex}.city`) ? "contacts-new-input-error" : ""}
                    />
                    {hasError(`${sectionKey}.addresses.${rowIndex}.city`) && (
                      <div className="contacts-new-field-error">{getError(`${sectionKey}.addresses.${rowIndex}.city`)}</div>
                    )}
                  </div>
                  <div className="contacts-new-field-wrap">
                    <FormField
                      wrapperClassName="contacts-new-field"
                      label="Pincode"
                      required={shouldShowRequired}
                      value={address.pincode}
                      onChange={(event) =>
                        handleListFieldChange(sectionKey, "addresses", rowIndex, "pincode", toDigits(event.target.value, 6))
                      }
                      placeholder="Enter Pincode"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      inputClassName={hasError(`${sectionKey}.addresses.${rowIndex}.pincode`) ? "contacts-new-input-error" : ""}
                    />
                    {hasError(`${sectionKey}.addresses.${rowIndex}.pincode`) && (
                      <div className="contacts-new-field-error">{getError(`${sectionKey}.addresses.${rowIndex}.pincode`)}</div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
          <label className="contacts-new-default-check">
            <input
              type="checkbox"
              checked={Boolean(address.isDefault)}
              onChange={() => setDefaultRow(sectionKey, "addresses", rowIndex)}
            />
            <span>Make this Default</span>
            {rows.length > 1 && (
              <button
                type="button"
                className="contacts-new-remove-btn"
                onClick={() => removeListItem(sectionKey, "addresses", rowIndex)}
                aria-label="Remove address"
                title="Remove address"
              >
                <i className="bi bi-x" aria-hidden="true" />
              </button>
            )}
          </label>
        </div>
        {rowIndex === rows.length - 1 && (
          <button
            type="button"
            className="contacts-new-add-link"
            onClick={() => addListItem(sectionKey, "addresses")}
          >
            Add Address <span>+</span>
          </button>
        )}
      </div>
    ));

  return (
    <form className="contacts-new-form" onSubmit={handleSubmit}>
      <section className="contacts-new-section">
        <h5 className="contacts-new-section-title">Main Contact Channels</h5>
        <div className="contacts-new-row-grid contacts-new-row-grid--person">
          <div className="contacts-new-field-wrap">
            <FormField
              wrapperClassName="contacts-new-field"
              label="Salutation"
              required
              type="select"
              options={SALUTATION_OPTIONS}
              value={formData.main.salutation}
              onChange={(event) => handleMemberFieldChange("main", "salutation", event.target.value)}
              inputClassName={hasError("main.salutation") ? "contacts-new-input-error" : ""}
            />
            {hasError("main.salutation") && (
              <div className="contacts-new-field-error">{getError("main.salutation")}</div>
            )}
          </div>
          <div className="contacts-new-field-wrap">
            <div className="app-field contacts-new-field">
              <label className="app-field-label" htmlFor="contact-main-first-name">
                First Name
                <span className="app-field-required">*</span>
              </label>
              <ContactAutoFillSelect
                id="contact-main-first-name"
                name="contact-main-first-name"
                value={formData.main.firstName}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  handleMemberFieldChange("main", "firstName", nextValue);
                  setSearchTerm(CONTACT_SEARCH_FIELDS.MAIN, nextValue);
                }}
                onOptionSelect={(option) => {
                  const nextLastName = getMainLastNameFromRow(option?.meta?.row);
                  if (nextLastName) {
                    handleMemberFieldChange("main", "lastName", nextLastName);
                  }
                }}
                options={mainNameOptions}
                placeholder="Enter First Name"
                inputClassName={hasError("main.firstName") ? "contacts-new-input-error" : ""}
              />
            </div>
            {hasError("main.firstName") && (
              <div className="contacts-new-field-error">{getError("main.firstName")}</div>
            )}
          </div>
          <div className="contacts-new-field-wrap">
            <FormField
              wrapperClassName="contacts-new-field"
              label="Last Name"
              value={formData.main.lastName}
              onChange={(event) => handleMemberFieldChange("main", "lastName", event.target.value)}
              placeholder="Enter Last Name"
            />
          </div>
        </div>

        {renderPhoneRows("main", formData.main.phones)}
        {renderEmailRows("main", formData.main.emails)}

        <h6 className="contacts-new-subtitle">Address</h6>
        {renderAddressRows("main", formData.main.addresses)}

        <div className="contacts-new-remark-wrap">
          <label className="contacts-new-subtitle" htmlFor="main_remark">
            Remark
          </label>
          <div className="app-field contacts-new-field contacts-new-field--remark">
            <div className="app-field-control">
              <textarea
                id="main_remark"
                className="app-field-input contacts-new-textarea"
                value={formData.main.remark}
                onChange={(event) => handleMemberFieldChange("main", "remark", event.target.value)}
                placeholder="Enter Remark"
                rows={3}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="contacts-new-section">
        <h5 className="contacts-new-section-title">Spouse Details</h5>
        <div className="contacts-new-row-grid contacts-new-row-grid--person">
          <FormField
            wrapperClassName="contacts-new-field"
            label="Salutation"
            type="select"
            options={SALUTATION_OPTIONS}
            value={formData.spouse.salutation}
            onChange={(event) => handleMemberFieldChange("spouse", "salutation", event.target.value)}

          />
          <div className="app-field contacts-new-field">
            <label className="app-field-label" htmlFor="contact-spouse-first-name">
              First Name
            </label>
            <ContactAutoFillSelect
              id="contact-spouse-first-name"
              name="contact-spouse-first-name"
              value={formData.spouse.firstName}
              onChange={(event) => {
                const nextValue = event.target.value;
                handleMemberFieldChange("spouse", "firstName", nextValue);
                setSearchTerm(CONTACT_SEARCH_FIELDS.SPOUSE, nextValue);
              }}
              onOptionSelect={(option) => {
                const nextLastName = getSpouseLastNameFromRow(option?.meta?.row);
                if (nextLastName) {
                  handleMemberFieldChange("spouse", "lastName", nextLastName);
                }
              }}
              options={spouseNameOptions}
              placeholder="Enter First Name"
            />
          </div>
          <FormField
            wrapperClassName="contacts-new-field"
            label="Last Name"
            value={formData.spouse.lastName}
            onChange={(event) => handleMemberFieldChange("spouse", "lastName", event.target.value)}
            placeholder="Enter Last Name"
          />
        </div>

        {renderPhoneRows("spouse", formData.spouse.phones)}
        {renderEmailRows("spouse", formData.spouse.emails)}

        <div className="contacts-new-remark-wrap">
          <label className="contacts-new-subtitle" htmlFor="spouse_remark">
            Spouse Remark
          </label>
          <div className="app-field contacts-new-field contacts-new-field--remark">
            <div className="app-field-control">
              <textarea
                id="spouse_remark"
                className="app-field-input contacts-new-textarea"
                value={formData.spouse.remark}
                onChange={(event) => handleMemberFieldChange("spouse", "remark", event.target.value)}
                placeholder="Enter Remark"
                rows={3}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="contacts-new-footer">
        <CustomButton type="button" variant="secondary" onClick={closeModal} disabled={isSaveDisabled}>
          Cancel
        </CustomButton>
        <CustomButton type="submit" loading={isSaveDisabled} showSpinner loadingText="Saving...">
          Save
        </CustomButton>
      </div>
    </form>
  );
};

export default AddEditForm;
