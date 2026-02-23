export const SALUTATION_OPTIONS = ["Mrs.", "Mr.", "Ms.", "Dr."];
export const PHONE_TYPE_OPTIONS = ["Mobile", "Home", "Work", "Other"];
export const EMAIL_TYPE_OPTIONS = ["Personal", "Work", "School", "Other"];
export const ADDRESS_TYPE_OPTIONS = ["Home", "Work", "Other"];
export const SEARCH_DEBOUNCE_MS = 300;

export const CONTACT_SEARCH_FIELDS = Object.freeze({
  MAIN: "main",
  SPOUSE: "spouse",
  ADDRESS: "address",
});

const PHONE_NUMBER_REGEX = /^[0-9]{10}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const cleanText = (value) => (value === null || value === undefined ? "" : String(value).trim());
export const toArray = (value) => (Array.isArray(value) ? value : []);
export const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const toBoolean = (value) => value === true || value === 1 || String(value) === "1";
export const toDigits = (value, maxLength) =>
  String(value || "")
    .replace(/\D/g, "")
    .slice(0, typeof maxLength === "number" ? maxLength : undefined);

const normalizeOptionValue = (options = [], rawValue, fallbackValue) => {
  const normalizedRaw = cleanText(rawValue).toLowerCase().replace(/\./g, "");
  const matched = options.find((option) => cleanText(option).toLowerCase().replace(/\./g, "") === normalizedRaw);
  return matched || fallbackValue;
};

const ensureSingleDefault = (rows = [], defaultKey = "isDefault") => {
  if (!rows.length) return [];
  if (rows.some((row) => Boolean(row?.[defaultKey]))) return rows;
  return rows.map((row, index) => ({
    ...row,
    [defaultKey]: index === 0,
  }));
};

export const createPhone = () => ({
  contact_phone_Id: 0,
  type: "Mobile",
  code: "+91",
  number: "",
  isDefault: true,
});

export const createEmail = () => ({
  contact_email_Id: 0,
  type: "Personal",
  email: "",
  isDefault: true,
});

export const createAddress = () => ({
  contact_address_Id: 0,
  type: "Home",
  addressLine1: "",
  addressLine2: "",
  addressLine3: "",
  city: "",
  pincode: "",
  isDefault: true,
});

export const createSectionData = ({ withAddress = false, defaultSalutation = "Mrs." } = {}) => ({
  contactId: 0,
  metadataId: 0,
  tags: [],
  salutation: defaultSalutation,
  firstName: "",
  lastName: "",
  phones: [createPhone()],
  emails: [createEmail()],
  addresses: withAddress ? [createAddress()] : [],
  remark: "",
});

const normalizePhoneRows = (rows = [], keepAtLeastOne = true) => {
  const normalized = ensureSingleDefault(
    toArray(rows).map((row) => ({
      contact_phone_Id: toNumber(row?.contact_phone_Id),
      type: normalizeOptionValue(PHONE_TYPE_OPTIONS, row?.phone_type, "Mobile"),
      code: cleanText(row?.country_code) || "+91",
      number: toDigits(row?.phone_number, 10),
      isDefault: toBoolean(row?.is_default),
    })),
  );

  if (normalized.length) return normalized;
  return keepAtLeastOne ? [createPhone()] : [];
};

const normalizeEmailRows = (rows = [], keepAtLeastOne = true) => {
  const normalized = ensureSingleDefault(
    toArray(rows).map((row) => ({
      contact_email_Id: toNumber(row?.contact_email_Id),
      type: normalizeOptionValue(EMAIL_TYPE_OPTIONS, row?.email_type, "Personal"),
      email: cleanText(row?.email_address),
      isDefault: toBoolean(row?.is_default),
    })),
  );

  if (normalized.length) return normalized;
  return keepAtLeastOne ? [createEmail()] : [];
};

const normalizeAddressRows = (rows = [], keepAtLeastOne = true) => {
  const normalized = ensureSingleDefault(
    toArray(rows).map((row) => ({
      contact_address_Id: toNumber(row?.contact_address_Id),
      type: normalizeOptionValue(ADDRESS_TYPE_OPTIONS, row?.address_type, "Home"),
      addressLine1: cleanText(row?.address_line1),
      addressLine2: cleanText(row?.address_line2),
      addressLine3: cleanText(row?.address_line3),
      city: cleanText(row?.city),
      pincode: toDigits(row?.pin_code, 6),
      isDefault: toBoolean(row?.is_default),
    })),
  );

  if (normalized.length) return normalized;
  return keepAtLeastOne ? [createAddress()] : [];
};

const getNormalizedRootPayload = (payload = {}) =>
  payload && typeof payload === "object" && payload?.inputData && typeof payload.inputData === "object"
    ? payload.inputData
    : payload;

const getContactIdValue = (payload = {}) =>
  toNumber(payload?.contact_Contact_Id || payload?.contact_Id);

const getNameValue = (payload = {}) =>
  cleanText(payload?.first_name || payload?.full_name || payload?.contact_Primary_Full_Name);

const getLastNameValue = (payload = {}) =>
  cleanText(payload?.last_name || payload?.contact_Last_Name || payload?.contact_last_name);

const getSalutationValue = (payload = {}) =>
  cleanText(payload?.salutation || payload?.contact_Salutation);

const parsePhoneParts = (value = "") => {
  const rawValue = cleanText(value);
  if (!rawValue) {
    return {
      countryCode: "+91",
      phoneNumber: "",
    };
  }

  const match = rawValue.match(/^(\+\d{1,4})\s*(.*)$/);
  if (match) {
    return {
      countryCode: cleanText(match[1]) || "+91",
      phoneNumber: toDigits(match[2], 10),
    };
  }

  return {
    countryCode: "+91",
    phoneNumber: toDigits(rawValue, 10),
  };
};

const buildPhoneRowsFromFlat = (value = "") => {
  const { countryCode, phoneNumber } = parsePhoneParts(value);
  if (!phoneNumber) return [];

  return [
    {
      country_code: countryCode,
      phone_number: phoneNumber,
      phone_type: "MOBILE",
      is_default: true,
    },
  ];
};

const buildEmailRowsFromFlat = (value = "") => {
  const emailValue = cleanText(value);
  if (!emailValue) return [];

  return [
    {
      email_address: emailValue,
      email_type: "PERSONAL",
      is_default: true,
    },
  ];
};

const buildAddressRowsFromFlat = (payload = {}) => {
  const addressLine1 = cleanText(payload?.address);
  if (!addressLine1) return [];

  return [
    {
      address_line1: addressLine1,
      city: cleanText(payload?.city),
      pin_code: cleanText(payload?.pin_code),
      address_type: "HOME",
      is_default: true,
    },
  ];
};

const buildContactBlock = (payload = {}, contact = {}) => {
  const hasStructuredRows =
    toArray(contact?.phones).length > 0 ||
    toArray(contact?.emails).length > 0 ||
    toArray(contact?.addresses).length > 0;

  if (hasStructuredRows) return contact;

  return {
    ...contact,
    phones: buildPhoneRowsFromFlat(payload?.phone),
    emails: buildEmailRowsFromFlat(payload?.email),
    addresses: buildAddressRowsFromFlat(payload),
  };
};

const buildSpousePayloadFromFlat = (payload = {}) => {
  const spouseFirstName = cleanText(payload?.spouse_first_name);
  const spouseLastName = cleanText(payload?.spouse_last_name);
  const spouseSalutation = cleanText(payload?.spouse_salutation);
  const spouseContactId = toNumber(payload?.spouse_contact_Id);
  const spousePhones = buildPhoneRowsFromFlat(payload?.spouse_phone);
  const spouseEmails = buildEmailRowsFromFlat(payload?.spouse_email);

  const hasSpouseInput =
    Boolean(spouseFirstName) ||
    Boolean(spouseLastName) ||
    Boolean(spouseSalutation) ||
    spouseContactId > 0 ||
    spousePhones.length > 0 ||
    spouseEmails.length > 0;

  if (!hasSpouseInput) return {};

  return {
    contact_Contact_Id: spouseContactId,
    salutation: spouseSalutation,
    first_name: spouseFirstName,
    last_name: spouseLastName,
    contact: {
      phones: spousePhones,
      emails: spouseEmails,
      metadata: null,
    },
  };
};

const normalizeMainSection = (payload = {}) => {
  const defaults = createSectionData({ withAddress: true, defaultSalutation: "Mr." });
  const contact = buildContactBlock(payload, payload?.contact || {});

  return {
    ...defaults,
    contactId: getContactIdValue(payload),
    metadataId: toNumber(contact?.metadata?.contact_metadata_Id),
    tags: toArray(contact?.tags),
    salutation: normalizeOptionValue(SALUTATION_OPTIONS, getSalutationValue(payload), defaults.salutation),
    firstName: getNameValue(payload),
    lastName: getLastNameValue(payload),
    phones: normalizePhoneRows(contact?.phones, true),
    emails: normalizeEmailRows(contact?.emails, true),
    addresses: normalizeAddressRows(contact?.addresses, true),
    remark: cleanText(contact?.metadata?.contact_Remark),
  };
};

const normalizeSpouseSection = (payload = {}) => {
  const defaults = createSectionData({ withAddress: false, defaultSalutation: "Mrs." });
  const contact = buildContactBlock(payload, payload?.contact || {});

  return {
    ...defaults,
    contactId: getContactIdValue(payload),
    metadataId: toNumber(contact?.metadata?.contact_metadata_Id),
    salutation: normalizeOptionValue(SALUTATION_OPTIONS, getSalutationValue(payload), defaults.salutation),
    firstName: getNameValue(payload),
    lastName: getLastNameValue(payload),
    phones: normalizePhoneRows(contact?.phones, true),
    emails: normalizeEmailRows(contact?.emails, true),
    addresses: [],
    remark: cleanText(contact?.metadata?.contact_Remark),
  };
};

export const normalizeFormPayload = (payload = {}) => {
  const normalizedPayload = getNormalizedRootPayload(payload);
  const familyRows = toArray(normalizedPayload?.family).length
    ? toArray(normalizedPayload?.family)
    : toArray(normalizedPayload?.spouse_children);
  const spousePayloadFromFamily =
    familyRows.find((row) => cleanText(row?.type || row?.contact_Type).toUpperCase() === "SPOUSE") ||
    familyRows[0];
  const spousePayload =
    spousePayloadFromFamily ||
    buildSpousePayloadFromFlat(normalizedPayload) ||
    {};

  return {
    main: normalizeMainSection(normalizedPayload),
    spouse: normalizeSpouseSection(spousePayload),
  };
};

export const toApiSalutation = (value) => cleanText(value).replace(/\.+$/, "");
export const toApiName = (firstName, lastName) => cleanText([cleanText(firstName), cleanText(lastName)].filter(Boolean).join(" "));

export const sanitizeApiPhones = (rows = []) => {
  const cleaned = toArray(rows)
    .map((row) => ({
      contact_phone_Id: toNumber(row?.contact_phone_Id),
      country_code: cleanText(row?.code) || "+91",
      phone_number: toDigits(row?.number, 10),
      phone_type: cleanText(row?.type).toUpperCase(),
      is_default: Boolean(row?.isDefault),
    }))
    .filter((row) => Boolean(row?.phone_number));

  return ensureSingleDefault(cleaned, "is_default");
};

export const sanitizeApiEmails = (rows = []) => {
  const cleaned = toArray(rows)
    .map((row) => ({
      contact_email_Id: toNumber(row?.contact_email_Id),
      email_address: cleanText(row?.email).toLowerCase(),
      email_type: cleanText(row?.type).toUpperCase(),
      is_default: Boolean(row?.isDefault),
    }))
    .filter((row) => Boolean(row?.email_address));

  return ensureSingleDefault(cleaned, "is_default");
};

export const sanitizeApiAddresses = (rows = []) => {
  const cleaned = toArray(rows)
    .map((row) => ({
      contact_address_Id: toNumber(row?.contact_address_Id),
      address_line1: cleanText(row?.addressLine1),
      address_line2: cleanText(row?.addressLine2),
      address_line3: cleanText(row?.addressLine3),
      city: cleanText(row?.city),
      pin_code: toDigits(row?.pincode, 6),
      address_type: cleanText(row?.type).toUpperCase(),
      is_default: Boolean(row?.isDefault),
    }))
    .filter((row) => Boolean(row?.address_line1));

  return ensureSingleDefault(cleaned, "is_default");
};

export const buildApiMetadata = (metadataId, remark) => {
  const contact_Remark = cleanText(remark);
  const contact_metadata_Id = toNumber(metadataId);

  if (!contact_Remark && !contact_metadata_Id) return null;

  return {
    contact_metadata_Id,
    contact_Remark,
  };
};

export const hasSpouseInput = (spouse = {}) =>
  Boolean(
    cleanText(spouse?.firstName) ||
    cleanText(spouse?.lastName) ||
    toArray(spouse?.phones).some((row) => Boolean(cleanText(row?.number))) ||
    toArray(spouse?.emails).some((row) => Boolean(cleanText(row?.email))) ||
    cleanText(spouse?.remark),
  );

const pickFirstValue = (...values) => {
  for (const value of values) {
    const normalizedValue = cleanText(value);
    if (normalizedValue) return normalizedValue;
  }

  return "";
};

const getDefaultAddressRow = (row = {}) => {
  const addresses = toArray(row?.contact?.addresses);
  return addresses.find((address) => toBoolean(address?.is_default)) || addresses[0] || {};
};

const getMainFirstNameFromRow = (row = {}) =>
  pickFirstValue(
    row?.contact_name,
    row?.full_name,
    row?.contact_Primary_Full_Name,
    row?.first_name,
  );

const getMainLastNameFromRow = (row = {}) =>
  pickFirstValue(row?.contact_last_name, row?.contact_Last_Name, row?.last_name);

const getSpouseFirstNameFromRow = (row = {}) =>
  pickFirstValue(
    row?.spouse_name,
    row?.spouse_first_name,
    row?.first_name,
  );

const getSpouseLastNameFromRow = (row = {}) =>
  pickFirstValue(row?.spouse_last_name, row?.contact_Last_Name, row?.last_name);

const getAddressLine1FromRow = (row = {}) => {
  const defaultAddress = getDefaultAddressRow(row);

  return pickFirstValue(
    row?.address_line1,
    row?.address,
    defaultAddress?.address_line1,
  );
};

export const getCityFromRow = (row = {}) => {
  const defaultAddress = getDefaultAddressRow(row);
  return pickFirstValue(row?.city, defaultAddress?.city);
};

export const getPincodeFromRow = (row = {}) => {
  const defaultAddress = getDefaultAddressRow(row);
  return toDigits(pickFirstValue(row?.pin_code, defaultAddress?.pin_code), 6);
};

const getContactUniqueId = (row = {}) =>
  row?.contact_Contact_Id ??
  row?.contact_Id ??
  row?.id ??
  null;

export const buildSearchOptions = (rows = [], field = CONTACT_SEARCH_FIELDS.MAIN) =>
  toArray(rows)
    .map((row, index) => {
      const contactId = toNumber(getContactUniqueId(row) || index + 1);
      const mainFirstName = getMainFirstNameFromRow(row);
      const mainLastName = getMainLastNameFromRow(row);
      const spouseFirstName = getSpouseFirstNameFromRow(row);
      const spouseLastName = getSpouseLastNameFromRow(row);
      const addressLine1 = getAddressLine1FromRow(row);
      const city = getCityFromRow(row);
      const pincode = getPincodeFromRow(row);

      if (field === CONTACT_SEARCH_FIELDS.ADDRESS) {
        const value = addressLine1 || mainFirstName;
        if (!value) return null;

        return {
          id: `address-${contactId}-${index}`,
          label: [value, city, pincode].filter(Boolean).join(", "),
          value,
          searchText: [value, city, pincode, mainFirstName, mainLastName].filter(Boolean).join(" "),
          meta: { row },
        };
      }

      const isSpouseField = field === CONTACT_SEARCH_FIELDS.SPOUSE;
      const value = isSpouseField ? spouseFirstName : mainFirstName;
      const lastName = isSpouseField ? spouseLastName : mainLastName;
      if (!value) return null;

      return {
        id: `${field}-${contactId}-${index}`,
        label: [value, lastName].filter(Boolean).join(" "),
        value,
        searchText: [value, lastName, mainFirstName, mainLastName, spouseFirstName, spouseLastName]
          .filter(Boolean)
          .join(" "),
        meta: { row },
      };
    })
    .filter(Boolean);

const pushError = (errors, key, shouldSet, message) => {
  if (shouldSet) {
    errors[key] = message;
  }
};

const validatePhoneRows = (rows = [], sectionKey, { requireNumber = false } = {}, errors = {}) => {
  rows.forEach((phone, rowIndex) => {
    const phoneType = cleanText(phone?.type);
    const phoneNumber = cleanText(phone?.number);
    const shouldValidateRow = requireNumber || Boolean(phoneNumber);

    if (!shouldValidateRow) return;

    pushError(errors, `${sectionKey}.phones.${rowIndex}.type`, !phoneType, "Number type is required.");
    pushError(errors, `${sectionKey}.phones.${rowIndex}.number`, !phoneNumber, "Phone number is required.");
    pushError(
      errors,
      `${sectionKey}.phones.${rowIndex}.number`,
      Boolean(phoneNumber) && !PHONE_NUMBER_REGEX.test(phoneNumber),
      "Phone number must be 10 digits.",
    );
  });
};

const validateEmailRows = (rows = [], sectionKey, errors = {}) => {
  rows.forEach((emailRow, rowIndex) => {
    const emailType = cleanText(emailRow?.type);
    const emailAddress = cleanText(emailRow?.email);
    const shouldValidateRow = Boolean(emailAddress);
    if (!shouldValidateRow) return;

    pushError(errors, `${sectionKey}.emails.${rowIndex}.type`, !emailType, "Email type is required.");
    pushError(errors, `${sectionKey}.emails.${rowIndex}.email`, !EMAIL_REGEX.test(emailAddress), "Email is invalid.");
  });
};

const validateAddressRows = (rows = [], sectionKey, errors = {}) => {
  rows.forEach((address, rowIndex) => {
    const addressType = cleanText(address?.type);
    const addressLine1 = cleanText(address?.addressLine1);
    const city = cleanText(address?.city);
    const pincode = cleanText(address?.pincode);

    pushError(errors, `${sectionKey}.addresses.${rowIndex}.type`, !addressType, "Address type is required.");
    pushError(errors, `${sectionKey}.addresses.${rowIndex}.addressLine1`, !addressLine1, "Address line 1 is required.");
    pushError(errors, `${sectionKey}.addresses.${rowIndex}.city`, !city, "City is required.");
    pushError(errors, `${sectionKey}.addresses.${rowIndex}.pincode`, !pincode, "Pincode is required.");
    pushError(
      errors,
      `${sectionKey}.addresses.${rowIndex}.pincode`,
      Boolean(pincode) && !PINCODE_REGEX.test(pincode),
      "Pincode must be 6 digits.",
    );
  });
};

export const validateFormData = (payload = {}) => {
  const nextErrors = {};
  const mainSection = payload?.main || {};
  const spouseSection = payload?.spouse || {};

  pushError(nextErrors, "main.salutation", !cleanText(mainSection?.salutation), "Salutation is required.");
  pushError(nextErrors, "main.firstName", !cleanText(mainSection?.firstName), "First name is required.");

  validatePhoneRows(toArray(mainSection?.phones), "main", { requireNumber: true }, nextErrors);
  validatePhoneRows(toArray(spouseSection?.phones), "spouse", { requireNumber: false }, nextErrors);
  validateEmailRows(toArray(mainSection?.emails), "main", nextErrors);
  validateEmailRows(toArray(spouseSection?.emails), "spouse", nextErrors);
  validateAddressRows(toArray(mainSection?.addresses), "main", nextErrors);

  return nextErrors;
};
