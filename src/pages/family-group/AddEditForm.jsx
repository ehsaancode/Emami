import { CCol, CForm } from "@coreui/react";
import { Row } from "react-bootstrap";
import { useState } from "react";
import CustomButton from "../../pagecomponents/Elements/Buttons/CustomButton";
import AppInputField from "../../pagecomponents/Common/AppInputField";
import ContactSearchSelect from "../../pagecomponents/Common/ContactSearchSelect";

const PIN_CODE_REGEX = /^[1-9][0-9]{5}$/;
const normalizeText = (value) => String(value ?? "").trim();

const getContactId = (item = {}) => {
    const id = Number(
        item?.id ??
        item?.contact_Id ??
        item?.contactId ??
        item?.contact_Contact_Id ??
        item?.contact?.contact_Contact_Id ??
        0,
    );
    return Number.isFinite(id) && id > 0 ? id : 0;
};

const getContactName = (item = {}) => {
    const contact = item?.contact || {};
    const fullName =
        normalizeText(item?.name) ||
        normalizeText(item?.displayName) ||
        normalizeText(item?.label) ||
        normalizeText(contact?.contact_Full_Name) ||
        normalizeText(item?.contact_Full_Name);

    if (fullName) return fullName;

    const firstName = normalizeText(
        contact?.contact_Primary_Full_Name || item?.contact_Primary_Full_Name,
    );
    const lastName = normalizeText(contact?.contact_Last_Name || item?.contact_Last_Name);
    const composedName = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (composedName) return composedName;

    const id = getContactId(item);
    return id ? `Contact ${id}` : "Unknown Contact";
};

const mapSelectionItem = (item = {}) => {
    const id = getContactId(item);
    if (!id) return null;

    const type = normalizeText(item?.type || item?.contact_Type || item?.contact?.contact_Type || "MAIN")
        .toUpperCase() || "MAIN";

    return {
        id,
        name: getContactName(item),
        type,
    };
};

const buildInitialHeadSelections = (headContactIds = [], headMembers = []) => {
    const optionsMap = new Map();

    (Array.isArray(headMembers) ? headMembers : []).forEach((member) => {
        const mapped = mapSelectionItem(member);
        if (!mapped) return;
        if (!optionsMap.has(mapped.id)) {
            optionsMap.set(mapped.id, mapped);
        }
    });

    const selectedIds = [
        ...new Set(
            (Array.isArray(headContactIds) ? headContactIds : [])
                .map((id) => Number(id))
                .filter((id) => Number.isFinite(id) && id > 0),
        ),
    ];

    return selectedIds.map((id) => {
        const fromMap = optionsMap.get(id);
        return fromMap || { id, name: `Contact ${id}`, type: "MAIN" };
    });
};

const FamilyGroupAddEditForm = ({saveData, closeModal, formPayload, isSaveDisabled, isEdit}) => {
    console.log(formPayload);
    
    const [validated, setValidated] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        family_group_Id: formPayload?.family_group_Id || null,
        family_group_Name: formPayload?.family_group_Name || '',
        head_contact_Id: formPayload?.head_contact_Id || [],
        headmembers: formPayload?.headmembers || [],
        address: {
            address_line1: formPayload?.address?.address_line1 || '',
            address_line2: formPayload?.address?.address_line2 || '',
            city: formPayload?.address?.city || '',
            pin_code: formPayload?.address?.pin_code || '',
            address_type: formPayload?.address?.address_type || 'HOME',
            is_default: formPayload?.address?.is_default !== undefined ? formPayload.address.is_default : true,
        }
    });
    const [selectedHeadContacts, setSelectedHeadContacts] = useState(() =>
        buildInitialHeadSelections(formPayload?.head_contact_Id, formPayload?.headmembers),
    );

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name] : value});
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleAddressChange = (e) => {
        const {name, value} = e.target;
        const nextValue = name === "pin_code"
            ? String(value || "").replace(/\D/g, "").slice(0, 6)
            : value;
        setFormData({
            ...formData,
            address: {
                ...formData.address,
                [name]: nextValue
            }
        });
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const nextErrors = {};
        const familyName = String(formData.family_group_Name || "").trim();
        const addressLine1 = String(formData?.address?.address_line1 || "").trim();
        const city = String(formData?.address?.city || "").trim();
        const pinCode = String(formData?.address?.pin_code || "").trim();

        if (!familyName) {
            nextErrors.family_group_Name = "Family Group Name is required.";
        }

        if (!addressLine1) {
            nextErrors.address_line1 = "Address Line 1 is required.";
        }

        if (!city) {
            nextErrors.city = "City is required.";
        }

        if (!pinCode) {
            nextErrors.pin_code = "PIN Code is required.";
        } else if (!PIN_CODE_REGEX.test(pinCode)) {
            nextErrors.pin_code = "Enter a valid 6-digit Indian PIN code.";
        }

        return nextErrors;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const nextErrors = validateForm();
        setErrors(nextErrors);

        if (form.checkValidity() === false || Object.keys(nextErrors).length > 0) {
            event.stopPropagation();
        } else {
            // Prepare payload according to API structure
            const inputData = {
                family_group_Name: formData.family_group_Name,
                address: formData.address,
                head_contact_Id: formData.head_contact_Id || []
            };

            // Add family_group_Id if editing
            if (formData.family_group_Id) {
                inputData.family_group_Id = formData.family_group_Id;
            }

            const payload = {
                inputData: inputData
            };
            console.log("Form Submission:", payload);
            saveData(payload);
        }
        setValidated(true);
    };
    
    return(
        <>
            <CForm
                className="g-3 needs-validation"
                noValidate
                validated={validated}
                onSubmit={handleSubmit}
            >
                {/* Row 1: Family Group Name & Family Head Name */}
                <Row className="row-xs mb-3">
                    <CCol md={6}>
                        <AppInputField
                            label="Family Group Name"
                            type="text"
                            id="family_group_Name"
                            name="family_group_Name"
                            placeholder="Enter Family Group Name"
                            value={formData.family_group_Name}
                            onChange={handleInputChange}
                            required
                            error={errors.family_group_Name}
                            wrapperClassName="family-form-field"
                        />
                    </CCol>
                    <CCol md={6}>
                        <label className="app-input-label" htmlFor="head_contact_Id">Family Head Name</label>
                        <ContactSearchSelect
                            id="head_contact_Id"
                            name="head_contact_Id"
                            value={selectedHeadContacts}
                            familyGroupId={formData.family_group_Id}
                            onChange={(e) => {
                                const nextIds = Array.isArray(e?.target?.value)
                                    ? e.target.value
                                        .map((item) => Number(item))
                                        .filter((item) => Number.isFinite(item) && item > 0)
                                    : [];

                                setFormData((prev) => ({
                                    ...prev,
                                    head_contact_Id: [...new Set(nextIds)],
                                }));
                            }}
                            onSelectionChange={(items = []) => {
                                const mappedItems = (Array.isArray(items) ? items : [])
                                    .map((item) => mapSelectionItem(item))
                                    .filter(Boolean);
                                const uniqueById = Array.from(
                                    mappedItems.reduce((acc, item) => {
                                        acc.set(Number(item.id), item);
                                        return acc;
                                    }, new Map()).values(),
                                );

                                setSelectedHeadContacts(uniqueById);
                                setFormData((prev) => ({
                                    ...prev,
                                    head_contact_Id: uniqueById.map((item) => Number(item.id)),
                                }));
                            }}
                            placeholder="Enter Head Name"
                        />
                    </CCol>
                </Row>

                {/* Row 2: Members Count - REMOVED as per API payload */}

                {/* Family Address Section */}
                <div className="family-address-section mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Family Address</h5>
                    </div>

                    {/* Permanent Address */}
                    <Row className="row-xs mb-3 mt-3">
                        <CCol md={12}>
                        <AppInputField
                            label="Address Line 1"
                            type="text"
                            id="address_line1"
                            name="address_line1"
                            placeholder="Enter Permanent Address"
                            value={formData.address.address_line1}
                            onChange={handleAddressChange}
                            required
                            error={errors.address_line1}
                            wrapperClassName="family-form-field"
                        />
                        </CCol>
                    </Row>

                    {/* Address Line 2 */}
                    <Row className="row-xs mb-3">
                        <CCol md={12}>
                            <AppInputField
                                label="Address Line 2"
                                type="text"
                                id="address_line2"
                                name="address_line2"
                                placeholder="Enter Landmark (Optional)"
                                value={formData.address.address_line2}
                                onChange={handleAddressChange}
                                wrapperClassName="family-form-field"
                            />
                        </CCol>
                    </Row>

                    {/* City & Pin Code */}
                    <Row className="row-xs mb-3">
                        <CCol md={6}>
                        <AppInputField
                            label="City"
                            type="text"
                            id="city"
                            name="city"
                            placeholder="Enter City Name"
                            value={formData.address.city}
                            onChange={handleAddressChange}
                            required
                            error={errors.city}
                            wrapperClassName="family-form-field"
                        />
                    </CCol>
                    <CCol md={6}>
                        <AppInputField
                            label="PIN Code"
                            type="text"
                            id="pin_code"
                            name="pin_code"
                            placeholder="Enter PIN Code"
                            value={formData.address.pin_code}
                            onChange={handleAddressChange}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            required
                            error={errors.pin_code}
                            wrapperClassName="family-form-field"
                        />
                    </CCol>
                </Row>
                </div>

                {/* Action Buttons */}
                <Row className="row-xs mb-2 btn-animation">
                    <CCol xs={12} className="mt-3">
                        <CustomButton
                            type="submit"
                            className="float-end"
                            style={{ backgroundColor: "#005FFF", color: "#fff" }}
                            loading={isSaveDisabled}
                            loadingText="Save Changes"
                            showSpinner
                        >
                            Save Changes
                        </CustomButton>

                        <CustomButton
                            className="btn-light btn-outline-primary float-end me-2"
                            onClick={closeModal}
                            disabled={isSaveDisabled}
                            variant="secondary"
                        >
                            Cancel
                        </CustomButton>
                    </CCol>
                </Row>
            </CForm>
        </>
    );
};

export default FamilyGroupAddEditForm;

