import { CCol, CForm } from "@coreui/react";
import { Row } from "react-bootstrap";
import { useState, useEffect, useMemo, useCallback } from "react";
import CustomButton from "../../pagecomponents/Elements/Buttons/CustomButton";
import { useDispatch } from "react-redux";
import { removeMember } from "../../redux/slices/FamilyGroupSlice";
import { toastMessage } from "../../helpers/utility";
import ContactSearchSelect from "../../pagecomponents/Common/ContactSearchSelect";
import { useNavigate } from "react-router-dom";

const normalizeText = (value) => String(value ?? "").trim();
const TYPE_SUFFIX_REGEX = /\s*\((MAIN|SPOUSE|CHILD|PARENT|OTHER)\)\s*$/i;

const sanitizeContactName = (value) => normalizeText(value).replace(TYPE_SUFFIX_REGEX, "").trim();

const getContactId = (contact = {}) => {
    const contactId = Number(contact.contact_Id || contact.contact_Contact_Id || contact?.contact?.contact_Contact_Id || 0);
    return Number.isFinite(contactId) && contactId > 0 ? contactId : 0;
};

const getContactType = (contact = {}) => {
    const type = contact.contact_Type || contact?.contact?.contact_Type || contact.type || contact.contactType || "";
    return normalizeText(type).toUpperCase() || null;
};

const getContactDisplayName = (contact = {}) => {
    const firstName = sanitizeContactName(
        contact.contact_name || contact.contactName || contact.first_name || contact.name || "",
    );
    const lastName = sanitizeContactName(
        contact.contact_last_name || contact.contactLastName || contact.last_name || contact.lastName || "",
    );

    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (fullName) return fullName;

    const fallbackName = sanitizeContactName(contact.contact_Primary_Full_Name || "");
    return fallbackName || `Contact #${getContactId(contact) || "-"}`;
};

const mapExistingMember = (member = {}) => {
    const contactId = getContactId(member);
    if (!contactId) return null;

    const contactType = getContactType(member) || member.family_group_member_Contact_Type || "MAIN";

    return {
        contact_Id: contactId,
        type: normalizeText(contactType).toUpperCase() || "MAIN",
        displayName:
            sanitizeContactName(member?.contact?.contact_Full_Name) ||
            getContactDisplayName(member) ||
            `Contact #${contactId}`,
    };
};
const mapSelectedItemToMember = (item = {}, fallback = {}) => {
    const contactId = Number(item?.id || item?.contact_Id || fallback?.contact_Id || 0);
    if (!contactId) return null;

    const name =
        sanitizeContactName(item?.name) ||
        sanitizeContactName(item?.displayName) ||
        sanitizeContactName(fallback?.displayName) ||
        `Contact #${contactId}`;

    const type = normalizeText(item?.type || fallback?.type || "MAIN").toUpperCase() || "MAIN";

    return {
        contact_Id: contactId,
        type,
        displayName: name,
    };
};

const AddMemberForm = ({ saveData, closeModal, familyGroupId, existingMembers = [], familyGroupName }) => {
    console.log("Existing Members: "+existingMembers);
    
    const dispatch = useDispatch();
    const [validated, setValidated] = useState(false);
    const [removingMemberIds, setRemovingMemberIds] = useState([]);
    const navigate = useNavigate()

    const [savedContacts, setSavedContacts] = useState([]);

    const initialSelectedMembers = useMemo(() => {
        if (!Array.isArray(existingMembers)) return [];

        const selectedMap = new Map();
        existingMembers.forEach((member) => {
            const mappedMember = mapExistingMember(member);
            setSavedContacts(prev => [...prev, mappedMember]);
            console.log("Mapped Member:", mappedMember);
            
            if (!mappedMember) return;
            if (!selectedMap.has(Number(mappedMember.contact_Id))) {
                selectedMap.set(Number(mappedMember.contact_Id), mappedMember);
            }
        });

        return Array.from(selectedMap.values());
    }, [existingMembers]);

    const [selectedMembers, setSelectedMembers] = useState(initialSelectedMembers);
    const initialPersistedMemberIds = useMemo(
        () => initialSelectedMembers.map((member) => Number(member.contact_Id)),
        [initialSelectedMembers],
    );
    const [persistedMemberIds, setPersistedMemberIds] = useState(initialPersistedMemberIds);
    const persistedMemberIdSet = useMemo(() => new Set(persistedMemberIds), [persistedMemberIds]);

    useEffect(() => {
        setSelectedMembers(initialSelectedMembers);
        setPersistedMemberIds(initialPersistedMemberIds);
    }, [initialSelectedMembers, initialPersistedMemberIds]);

    const handleRemoveSelectedMember = useCallback(
        async (member) => {
            const contactId = Number(member?.contact_Id || 0);
            if (!contactId) return;

            if (!persistedMemberIdSet.has(contactId)) {
                setSelectedMembers((prev) => prev.filter((itemMember) => Number(itemMember.contact_Id) !== contactId));
                return;
            }

            const normalizedFamilyGroupId = Number(familyGroupId) || 0;
            if (!normalizedFamilyGroupId) {
                toastMessage("error", "Unable to remove member right now.");
                return;
            }

            if (removingMemberIds.includes(contactId)) return;
            setRemovingMemberIds((prev) => [...prev, contactId]);

            try {
                const payload = {
                    inputData: {
                        family_group_Id: normalizedFamilyGroupId,
                        contact_Ids: [contactId],
                    },
                };

                const { payload: response } = await dispatch(removeMember(payload));

                if (response?.status === "error" || response?.status === false) {
                    toastMessage("error", response?.msg || response?.message || "Failed to remove member.");
                    return;
                }

                setSelectedMembers((prev) => prev.filter((itemMember) => Number(itemMember.contact_Id) !== contactId));
                setPersistedMemberIds((prev) => prev.filter((id) => Number(id) !== contactId));
                toastMessage("success", response?.msg || "Member removed successfully.");
            } catch (error) {
                toastMessage("error", error?.message || "Failed to remove member.");
            } finally {
                setRemovingMemberIds((prev) => prev.filter((id) => id !== contactId));
            }
        },
        [dispatch, familyGroupId, persistedMemberIdSet, removingMemberIds],
    );

    const handleSelectionChange = useCallback(
        (items = []) => {
            const normalizedItems = Array.isArray(items) ? items : [];
            const previousMap = new Map(
                selectedMembers.map((member) => [Number(member.contact_Id), member]),
            );

            const nextMembers = normalizedItems
                .map((item) => {
                    const contactId = Number(item?.id || item?.contact_Id || 0);
                    if (!contactId) return null;
                    return mapSelectedItemToMember(item, previousMap.get(contactId));
                })
                .filter(Boolean);

            const nextIdSet = new Set(nextMembers.map((member) => Number(member.contact_Id)));
            const removedMembers = selectedMembers.filter(
                (member) => !nextIdSet.has(Number(member.contact_Id)),
            );

            removedMembers.forEach((member) => {
                handleRemoveSelectedMember(member);
            });

            setSelectedMembers(nextMembers);
        },
        [handleRemoveSelectedMember, selectedMembers],
    );

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            const uniqueMembers = selectedMembers.filter(
            member =>
                !savedContacts.some(
                saved => saved.contact_Id === member.contact_Id
                )
            );

            if (uniqueMembers.length === 0) {
            console.log("No new members to save");
            return;
            }

            const payload = {
            inputData: {
                family_group_Id: familyGroupId,
                members: uniqueMembers.map(member => ({
                contact_Id: member.contact_Id,
                type: "SPOUSE",
                })),
            },
            };

            saveData(payload);
        }

        setValidated(true);
    };

    return (
        <>
            <CForm className="g-3 needs-validation" noValidate validated={validated} onSubmit={handleSubmit}>
                <Row className="row-xs mb-3">
                    <CCol md={12}>
                        <ContactSearchSelect
                            id={`family-member-${Number(familyGroupId) || 0}`}
                            name="family_member_Ids"
                            value={selectedMembers.map((member) => ({
                                id: member.contact_Id,
                                name: member.displayName,
                                type: member.type,
                            }))}
                            familyGroupId={familyGroupId}
                            onChange={() => { }}
                            onSelectionChange={handleSelectionChange}
                            placeholder="Search contacts by name..."
                            isDropDownFlowUpward={false}
                        />
                    </CCol>
                </Row>

                <Row className="row-xs mt-4">
                    <CCol md={12} className="d-flex gap-2 justify-content-end align-items-center">

                        <CustomButton
                        onClick={()=>{
                            navigate('/contacts');
                        }}
                            type="button"
                            variant="secondary"
                            size="sm"
                        >
                            Add New Contact +
                        </CustomButton>
                        <CustomButton type="submit" variant="primary" size="sm" style={{ marginLeft: 8 }}>
                            Continue
                        </CustomButton>

                    </CCol>
                </Row>
            </CForm>
        </>
    );
};

export default AddMemberForm;

