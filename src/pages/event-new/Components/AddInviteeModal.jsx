import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { FiSearch, FiX } from "react-icons/fi";
import { ToastContainer } from "react-toastify";
import ModalWrapper from "../../../pagecomponents/Common/ModalWrapper";
import CustomButton from "../../../pagecomponents/Elements/Buttons/CustomButton";
import { toastMessage } from "../../../helpers/utility";
import { getData as getContactData } from "../../../redux/slices/ContactSlice";
import { getData as getFamilyGroupData } from "../../../redux/slices/FamilyGroupSlice";
import { getData as getTagData } from "../../../redux/slices/TagSlice";
import { sendInvite } from "../../../redux/slices/EventSlice";

const INVITEE_MODE_OPTIONS = [
    {
        value: "contact",
        label: "Add by Contact",
        emptyState: "No contacts found.",
    },
    {
        value: "tags",
        label: "Add by Tags",
        emptyState: "No tags found.",
    },
    {
        value: "family_group",
        label: "Add by Family Group",
        emptyState: "No family groups found.",
    },
];

const CONTACT_LIST_PARAMS = {
    filter: {
        contact_type: "ALL",
        name: "",
        email: [],
        address: "",
        mobile: [],
        event_Ids: [],
        family_group_Ids: [],
    },
    sorting: {
        Key: "created_At",
        value: "desc",
    },
    pagination: {
        page: 1,
        limit: 200,
    },
    shouldExport: false,
};

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed || trimmed === "[]") return [];
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed;
        } catch (error) {
            return [trimmed];
        }
        return [trimmed];
    }
    return [];
};

const cleanText = (value) => String(value ?? "").trim();
const toIdKey = (value) => String(value ?? "");
const toPositiveNumber = (value) => {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue) && numericValue > 0) return numericValue;
    return null;
};

const resolveTargetEventId = (target = {}) =>
    target?.raw?.event_Id ??
    target?.eventRaw?.event_Id ??
    target?.event_Id ??
    target?.event_id ??
    target?.id ??
    null;

const resolveContactId = (row = {}) =>
    row?.contact_Contact_Id ??
    row?.contact_Id ??
    row?.contact_id ??
    row?.contactId ??
    row?.contact?.contact_Contact_Id ??
    row?.contact?.contact_Id ??
    row?.contact?.contact_id ??
    row?.contact?.contactId ??
    row?.id ??
    row?._id ??
    null;

const resolveContactName = (row = {}) => {
    const directName =
        cleanText(row?.contact_name) ||
        cleanText(row?.contact_Primary_Full_Name) ||
        cleanText(row?.full_name) ||
        cleanText(row?.name);

    if (directName) return directName;

    const firstName = cleanText(row?.first_name ?? row?.firstName);
    const lastName = cleanText(row?.last_name ?? row?.lastName);
    return cleanText(`${firstName} ${lastName}`) || "Unnamed Contact";
};

const resolveExistingInviteeSelections = (invitees = []) => {
    const uniqueMap = new Map();

    toArray(invitees).forEach((invitee, index) => {
        const id =
            invitee?.contact_Id ??
            invitee?.contact_id ??
            invitee?.contactId ??
            invitee?.id ??
            invitee?._id;

        if (id === undefined || id === null || id === "") return;

        const label = resolveContactName(invitee) || `Contact ${index + 1}`;
        const key = toIdKey(id);
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, { id, label });
        }
    });

    return Array.from(uniqueMap.values());
};

const AddInviteeModal = ({
    visible,
    onClose,
    target,
    existingInvitees = [],
    onInvitesAdded,
}) => {
    const dispatch = useDispatch();
    const [step, setStep] = useState(1);
    const [selectedMode, setSelectedMode] = useState("contact");
    const [searchValue, setSearchValue] = useState("");
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [contactRows, setContactRows] = useState([]);
    const [contactOptions, setContactOptions] = useState([]);
    const [familyGroupOptions, setFamilyGroupOptions] = useState([]);
    const [tagOptions, setTagOptions] = useState([]);
    const [selectedByMode, setSelectedByMode] = useState({
        contact: [],
        tags: [],
        family_group: [],
    });

    const eventId = resolveTargetEventId(target);
    const modeConfig =
        INVITEE_MODE_OPTIONS.find((item) => item.value === selectedMode) ||
        INVITEE_MODE_OPTIONS[0];
    const selectedItems = selectedByMode[selectedMode] ?? [];
    const existingContactSelections = useMemo(
        () => resolveExistingInviteeSelections(existingInvitees),
        [existingInvitees]
    );
    const existingContactIdLookup = useMemo(() => {
        const ids = new Set();
        existingContactSelections.forEach((item) => {
            ids.add(toIdKey(item.id));
        });
        return ids;
    }, [existingContactSelections]);

    const selectedItemLookup = useMemo(() => {
        const map = new Set();
        selectedItems.forEach((item) => map.add(toIdKey(item.id)));
        return map;
    }, [selectedItems]);
    const hasSelectableItems = useMemo(() => {
        if (selectedMode === "contact") {
            return selectedItems.some(
                (item) => !existingContactIdLookup.has(toIdKey(item.id))
            );
        }
        return selectedItems.length > 0;
    }, [selectedItems, selectedMode, existingContactIdLookup]);

    const optionList = useMemo(() => {
        if (selectedMode === "contact") return contactOptions;
        if (selectedMode === "family_group") return familyGroupOptions;
        return tagOptions;
    }, [selectedMode, contactOptions, familyGroupOptions, tagOptions]);

    const filteredOptions = useMemo(() => {
        const normalizedSearch = cleanText(searchValue).toLowerCase();
        if (!normalizedSearch) return optionList;

        return optionList.filter((item) =>
            cleanText(item?.label).toLowerCase().includes(normalizedSearch)
        );
    }, [optionList, searchValue]);

    useEffect(() => {
        if (!visible) return;

        setStep(1);
        setSelectedMode("contact");
        setSearchValue("");
        setSelectedByMode({
            contact: existingContactSelections,
            tags: [],
            family_group: [],
        });
    }, [visible, existingContactSelections]);

    useEffect(() => {
        if (!visible || step !== 2) return;

        const loadOptions = async () => {
            setIsLoadingOptions(true);
            try {
                if (selectedMode === "contact") {
                    await ensureContactsLoaded();
                    return;
                }

                if (selectedMode === "family_group") {
                    await ensureFamilyGroupsLoaded();
                    return;
                }

                await ensureTagsLoaded();
            } catch (error) {
                toastMessage("error", error?.message || "Failed to load options.");
            } finally {
                setIsLoadingOptions(false);
            }
        };

        void loadOptions();
    }, [visible, step, selectedMode]);

    const ensureContactsLoaded = async () => {
        if (contactOptions.length) {
            return { rows: contactRows, options: contactOptions };
        }

        const { payload } = await dispatch(
            getContactData({ inputData: CONTACT_LIST_PARAMS })
        );

        if (payload?.status !== "success") {
            throw new Error(payload?.msg || "Failed to fetch contacts.");
        }

        const rows = Array.isArray(payload?.data) ? payload.data : [];
        const uniqueMap = new Map();

        rows.forEach((row, index) => {
            const id = resolveContactId(row);
            const label = resolveContactName(row);

            if (id === undefined || id === null || id === "") return;

            const key = toIdKey(id);
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, {
                    id,
                    label: label || `Contact ${index + 1}`,
                });
            }
        });

        const options = Array.from(uniqueMap.values());
        setContactRows(rows);
        setContactOptions(options);

        return { rows, options };
    };

    const ensureFamilyGroupsLoaded = async () => {
        if (familyGroupOptions.length) return familyGroupOptions;

        const { payload } = await dispatch(
            getFamilyGroupData({
                inputData: {
                    filter: {
                        contact_type: "",
                    },
                    pagination: {
                        page: 1,
                        limit: 200,
                    },
                },
            })
        );

        if (payload?.status !== "success") {
            throw new Error(payload?.msg || "Failed to fetch family groups.");
        }

        const list = Array.isArray(payload?.data) ? payload.data : [];
        const options = list
            .map((item) => {
                const normalizedId = toPositiveNumber(
                    item?.family_group_Id ??
                    item?.family_group_id ??
                    item?.id ??
                    item?._id
                );

                return {
                    id: normalizedId,
                    label: cleanText(item?.family_group_Name ?? item?.name),
                };
            })
            .filter((item) => item.id && item.label);

        setFamilyGroupOptions(options);
        return options;
    };

    const ensureTagsLoaded = async () => {
        if (tagOptions.length) return tagOptions;

        const { payload } = await dispatch(
            getTagData({
                inputData: {
                    filter: {
                        tag_key: "",
                        tag_name: "",
                    },
                    pagination: {
                        page: 1,
                        limit: 200,
                    },
                },
            })
        );

        if (payload?.status !== "success") {
            throw new Error(payload?.msg || "Failed to fetch tags.");
        }

        const rows = Array.isArray(payload?.data) ? payload.data : [];
        const tagMap = new Map();

        rows.forEach((item, index) => {
            const rawId = item?.tag_Id ?? item?.tag_id ?? item?.id ?? item?._id;
            const parentId = toPositiveNumber(
                item?.parent_Id ?? item?.parent_id ?? item?.parentId
            );
            const childCount = toPositiveNumber(
                item?.child_count ?? item?.childCount ?? item?.children_count
            );
            const isParentTagFlag = Boolean(
                item?.is_parent ?? item?.isParent ?? childCount
            );
            const rawInviteType = cleanText(
                item?.invite_type ?? item?.inviteType
            ).toLowerCase();
            const inviteType =
                rawInviteType === "parent-tag"
                    ? "parent-tag"
                    : rawInviteType === "tag"
                        ? "tag"
                        : parentId
                            ? "tag"
                            : isParentTagFlag
                                ? "parent-tag"
                                : "tag";
            const label =
                cleanText(item?.tag_name) ||
                cleanText(item?.name) ||
                cleanText(item?.label) ||
                cleanText(item?.tag_key) ||
                `Tag ${index + 1}`;

            const normalizedNumericId = toPositiveNumber(rawId);
            const normalizedId = normalizedNumericId ?? cleanText(rawId);
            const key = toIdKey(normalizedId || label.toLowerCase());

            if (!key || !label || tagMap.has(key)) return;

            tagMap.set(key, {
                id: normalizedId || key,
                label,
                parentId,
                inviteType,
            });
        });

        const options = Array.from(tagMap.values());
        setTagOptions(options);
        return options;
    };

    const toggleSelection = (option) => {
        const optionKey = toIdKey(option.id);

        setSelectedByMode((prev) => {
            const currentList = prev[selectedMode] ?? [];
            const exists = currentList.some(
                (selected) => toIdKey(selected.id) === optionKey
            );

            const nextList =
                selectedMode === "family_group"
                    ? exists
                        ? []
                        : [option]
                    : exists
                        ? currentList.filter(
                            (selected) => toIdKey(selected.id) !== optionKey
                        )
                        : [...currentList, option];

            return {
                ...prev,
                [selectedMode]: nextList,
            };
        });
    };

    const removeSelected = (itemId) => {
        const itemKey = toIdKey(itemId);
        setSelectedByMode((prev) => ({
            ...prev,
            [selectedMode]: (prev[selectedMode] ?? []).filter(
                (item) => toIdKey(item.id) !== itemKey
            ),
        }));
    };

    const getHeaderTitle = () => {
        if (step === 1) return "Add Invitee";

        if (selectedMode === "family_group") return "Add by Family Group";
        if (selectedMode === "tags") return "Add by Tags";
        return "Add by Contact";
    };

    const getHeaderSubtitle = () => {
        if (step === 1) return "";

        const singularLabel =
            selectedMode === "family_group"
                ? "family group"
                : selectedMode === "tags"
                    ? "tag"
                    : "contact";

        return selectedItems.length
            ? `You have already selected ${singularLabel}`
            : `Select ${singularLabel}`;
    };

    const buildPayload = () => {
        const numericEventId = Number(eventId);

        if (!numericEventId) {
            throw new Error("Event id is missing.");
        }

        if (!selectedItems.length) {
            throw new Error("Please select at least one invitee.");
        }

        if (selectedMode === "contact") {
            const newContactSelections = selectedItems.filter(
                (item) => !existingContactIdLookup.has(toIdKey(item.id))
            );

            const contactIds = newContactSelections
                .map((item) => Number(item.id))
                .filter((id) => Number.isFinite(id) && id > 0);

            if (!contactIds.length) {
                throw new Error("Please select at least one new contact.");
            }

            return {
                inputData: {
                    event_Id: numericEventId,
                    invite_type: "contact",
                    contact_Ids: contactIds,
                    invite_label: "Guests",
                },
            };
        }

        if (selectedMode === "family_group") {
            const familyGroupId = selectedItems
                .map((item) => toPositiveNumber(item.id))
                .find(Boolean);

            if (!familyGroupId) {
                throw new Error("No valid family group selected.");
            }

            return {
                inputData: {
                    event_Id: numericEventId,
                    invite_type: "family-group",
                    family_group_Id: familyGroupId,
                    invite_label: "Family Group",
                },
            };
        }

        const tagPayloads = selectedItems
            .map((item) => ({
                tagId: toPositiveNumber(item.id),
                inviteType:
                    cleanText(item?.inviteType).toLowerCase() === "parent-tag"
                        ? "parent-tag"
                        : "tag",
                inviteLabel: cleanText(item.label) || "Tags",
            }))
            .filter((item) => item.tagId);

        if (!tagPayloads.length) {
            throw new Error("No valid tags selected.");
        }

        return tagPayloads.map((item) => ({
            inputData: {
                event_Id: numericEventId,
                tag_Id: item.tagId,
                invite_type: item.inviteType,
                invite_label: item.inviteLabel,
            },
        }));
    };

    const handleContinue = () => {
        setStep(2);
        setSearchValue("");
    };

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            const addedSelections =
                selectedMode === "contact"
                    ? selectedItems.filter(
                        (item) => !existingContactIdLookup.has(toIdKey(item.id))
                    )
                    : selectedItems;
            const payload = buildPayload();

            if (Array.isArray(payload)) {
                const responses = await Promise.all(
                    payload.map(async (item) => {
                        const { payload: response } = await dispatch(
                            sendInvite(item)
                        );
                        return response;
                    })
                );

                const failedResponse = responses.find(
                    (response) => response?.status !== "success"
                );
                if (failedResponse) {
                    throw new Error(
                        failedResponse?.msg || "Failed to add invitee."
                    );
                }

                toastMessage(
                    "success",
                    responses[0]?.msg || "Invitees added."
                );
                await Promise.resolve(
                    onInvitesAdded?.({
                        eventId: Number(eventId),
                        mode: selectedMode,
                        selectedItems: addedSelections,
                    })
                );
                onClose?.();
                return;
            }

            const { payload: response } = await dispatch(sendInvite(payload));

            if (response?.status !== "success") {
                throw new Error(response?.msg || "Failed to add invitee.");
            }

            toastMessage("success", response?.msg || "Invitees added.");
            await Promise.resolve(
                onInvitesAdded?.({
                    eventId: Number(eventId),
                    mode: selectedMode,
                    selectedItems: addedSelections,
                })
            );
            onClose?.();
        } catch (error) {
            toastMessage("error", error?.message || "Failed to add invitee.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <ToastContainer />
            <ModalWrapper
                visible={visible}
                onClose={onClose}
                modalTitle={
                    step === 1 ? (
                        getHeaderTitle()
                    ) : (
                        <div className="add-invitee-title-wrap">
                            <span className="add-invitee-title-main">{getHeaderTitle()}</span>
                            <span className="add-invitee-title-sub">{getHeaderSubtitle()}</span>
                        </div>
                    )
                }
                modalSize="lg"
                dialogClassName={`add-invitee-modal ${step === 2 ? "add-invitee-modal-step-two" : ""
                    }`}
            >
            <style>
                {`
                .add-invitee-modal .modal-dialog {
                    max-width: 560px;
                }

                .add-invitee-modal.add-invitee-modal-step-two .modal-dialog {
                    max-width: 620px;
                }

                .add-invitee-modal .modal-content {
                    border-radius: 12px;
                    border: none;
                    overflow: hidden;
                    background: #f3f4f6;
                }

                .add-invitee-modal .modal-header {
                    background: #0b63f3;
                    border-bottom: 0;
                    padding: 12px 16px;
                }

                .add-invitee-modal .modal-header .text-primary {
                    color: #475569 !important;
                }

                .add-invitee-modal .modal-title {
                    color: #fff;
                    font-size: 18px;
                    font-weight: 700;
                    margin: 0;
                }

                .add-invitee-modal .modal-body {
                    background: #f3f4f6;
                    padding: 18px 20px 20px;
                }

                .add-invitee-title-wrap {
                    display: flex;
                    flex-direction: column;
                    line-height: 1.15;
                }

                .add-invitee-title-main {
                    color: #fff;
                    font-size: 18px;
                    font-weight: 700;
                }

                .add-invitee-title-sub {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 12px;
                    font-weight: 500;
                    margin-top: 2px;
                }

                .add-invitee-step-one-options {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .add-invitee-mode-item {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 18px;
                    color: #4b5563;
                    cursor: pointer;
                }

                .add-invitee-step-one-footer,
                .add-invitee-step-two-footer {
                    margin-top: 22px;
                    display: flex;
                    justify-content: flex-end;
                }

                .add-invitee-continue-btn,
                .add-invitee-confirm-btn {
                    min-width: 136px !important;
                    height: 38px !important;
                    font-size: 16px !important;
                    font-weight: 700 !important;
                    box-shadow: 0 8px 18px rgba(37, 99, 235, 0.3) !important;
                }

                .add-invitee-search {
                    border: 1px solid #d5dae3;
                    border-radius: 999px;
                    background: #f7f8fa;
                    min-height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    padding: 6px 12px;
                }

                .add-invitee-chip-wrap {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                    flex: 1;
                    min-width: 0;
                }

                .add-invitee-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    border: 1px solid #3b82f6;
                    color: #0b63f3;
                    background: #eef5ff;
                    border-radius: 999px;
                    padding: 2px 8px;
                    font-size: 12px;
                    line-height: 1.2;
                    white-space: nowrap;
                }

                .add-invitee-chip-remove {
                    border: 0;
                    background: transparent;
                    color: #0b63f3;
                    width: 16px;
                    height: 16px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    cursor: pointer;
                }

                .add-invitee-search-input {
                    border: 0;
                    outline: none;
                    background: transparent;
                    min-width: 120px;
                    flex: 1;
                    font-size: 13px;
                    color: #4b5563;
                }

                .add-invitee-search-input::placeholder {
                    color: #9aa5b1;
                }

                .add-invitee-search-icon {
                    color: #8a95a5;
                    font-size: 20px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    flex: 0 0 auto;
                }

                .add-invitee-list {
                    margin-top: 10px;
                    border: 1px solid #d9dee7;
                    border-radius: 10px;
                    background: #f5f6f8;
                    min-height: 260px;
                    max-height: 360px;
                    overflow: auto;
                    padding: 10px 12px;
                }

                .add-invitee-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-height: 34px;
                    font-size: 17px;
                    color: #5f6b7a;
                    cursor: pointer;
                }

                .add-invitee-row + .add-invitee-row {
                    margin-top: 6px;
                }

                .add-invitee-row.is-selected {
                    color: #374151;
                    font-weight: 600;
                }

                .add-invitee-row input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                }

                .add-invitee-empty,
                .add-invitee-loading {
                    min-height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #8a95a5;
                    font-size: 14px;
                    padding: 32px 8px;
                    text-align: center;
                }

                @media (max-width: 767px) {
                    .add-invitee-modal .modal-body {
                        padding: 12px;
                    }

                    .add-invitee-mode-item {
                        font-size: 16px;
                    }

                    .add-invitee-row {
                        font-size: 15px;
                    }

                    .add-invitee-search-input {
                        min-width: 80px;
                    }
                }
                `}
            </style>

            {step === 1 ? (
                <>
                    <div className="add-invitee-step-one-options">
                        {INVITEE_MODE_OPTIONS.map((modeOption) => (
                            <label
                                key={modeOption.value}
                                className="add-invitee-mode-item"
                            >
                                <input
                                    type="radio"
                                    name="invitee_mode"
                                    checked={selectedMode === modeOption.value}
                                    onChange={() => setSelectedMode(modeOption.value)}
                                />
                                <span>{modeOption.label}</span>
                            </label>
                        ))}
                    </div>

                    <div className="add-invitee-step-one-footer">
                        <CustomButton
                            title="Continue"
                            className="add-invitee-continue-btn"
                            onClick={handleContinue}
                        />
                    </div>
                </>
            ) : (
                <>
                    <div className="add-invitee-search">
                        <div className="add-invitee-chip-wrap">
                            {selectedItems.map((item) => (
                                <span
                                    className="add-invitee-chip"
                                    key={`${selectedMode}-${item.id}`}
                                >
                                    <span>{item.label}</span>
                                    <button
                                        type="button"
                                        className="add-invitee-chip-remove"
                                        onClick={() => removeSelected(item.id)}
                                        aria-label={`Remove ${item.label}`}
                                    >
                                        <FiX size={12} />
                                    </button>
                                </span>
                            ))}

                            <input
                                type="text"
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                placeholder={`Search ${modeConfig.label.toLowerCase().replace("add by ", "")}`}
                                className="add-invitee-search-input"
                            />
                        </div>

                        <span className="add-invitee-search-icon">
                            <FiSearch />
                        </span>
                    </div>

                    <div className="add-invitee-list">
                        {isLoadingOptions ? (
                            <div className="add-invitee-loading">Loading options...</div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="add-invitee-empty">{modeConfig.emptyState}</div>
                        ) : (
                            filteredOptions.map((option) => {
                                const isChecked = selectedItemLookup.has(
                                    toIdKey(option.id)
                                );

                                return (
                                    <label
                                        key={`${selectedMode}-${option.id}`}
                                        className={`add-invitee-row ${isChecked ? "is-selected" : ""
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => toggleSelection(option)}
                                        />
                                        <span>{option.label}</span>
                                    </label>
                                );
                            })
                        )}
                    </div>

                    <div className="add-invitee-step-two-footer">
                        <CustomButton
                            title="Confirm"
                            className="add-invitee-confirm-btn"
                            onClick={handleConfirm}
                            loading={isSubmitting}
                            disabled={isSubmitting || !hasSelectableItems}
                        />
                    </div>
                </>
            )}
            </ModalWrapper>
        </>
    );
};

export default AddInviteeModal;
