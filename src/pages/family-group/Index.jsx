import React, { useState, useEffect } from "react";

import DataTable from "../../pagecomponents/Common/DataTable";
import PageWrapper from "../../pagecomponents/Common/PageWrapper";
import ModalWrapper from "../../pagecomponents/Common/ModalWrapper";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import { toastMessage } from "../../helpers/utility";
import { addData, getData, deleteData, updateData, assignMember, removeMember } from "../../redux/slices/FamilyGroupSlice";
import FamilyGroupAddEditForm from "./AddEditForm";
import AddMemberForm from "./AddMemberForm";
import FamilyGroupViewDetails from "./FamilyGroupViewDetails";
import Swal from "sweetalert2";
import EditIcon from "../../pagecomponents/Icons/EditIcon";
import DeleteIcon from "../../pagecomponents/Icons/DeleteIcon";
import ViewIcon from "../../pagecomponents/Icons/ViewIcon";
import "./style.css";
import AddMemberIcon from "../../pagecomponents/Icons/AddMemberIcon";
import { usePermission } from "../../helpers/useSectionPermissions";
import { PERMISSION_KEYS } from "../../helpers/permissionModules";

const INIT_FORM_DATA = {
    family_group_Name: "",
    head_contact_Id: [],
    address: {
        address_line1: "",
        address_line2: "",
        city: "",
        pin_code: "",
        address_type: "HOME",
        is_default: true
    }
};

const normalizeText = (value) => String(value ?? "").trim();

const getDefaultAddress = (familyAddress = []) => {
    if (!Array.isArray(familyAddress) || familyAddress.length === 0) return null;
    return familyAddress[0];
};

const getFamilyHeadContactIds = (row = {}) => {
    const source = Array.isArray(row?.headmembers) && row.headmembers.length > 0 ? row.headmembers : row?.members;
    if (!Array.isArray(source)) return [];

    const ids = source
        .map((member) => Number(member?.contact_Id || member?.contact?.contact_Contact_Id || 0))
        .filter((id) => Number.isFinite(id) && id > 0);

    return [...new Set(ids)];
};

const getFamilyHeadNames = (row = {}) => {
    const source = Array.isArray(row?.headmembers) && row.headmembers.length > 0 ? row.headmembers : row?.members;
    if (!Array.isArray(source) || source.length === 0) return "-";

    const seen = new Set();
    const names = [];

    source.forEach((member) => {
        const name = normalizeText(member?.contact?.contact_Primary_Full_Name);
        const contactId = Number(member?.contact_Id || member?.contact?.contact_Contact_Id || 0);
        const key = contactId > 0 ? `id-${contactId}` : `name-${name.toLowerCase()}`;

        if (!name || seen.has(key)) return;
        seen.add(key);
        names.push(name);
    });

    return names.length > 0 ? names.join(", ") : "-";
};

const getFamilyMembersCount = (row = {}) => {
    const apiCount = Number(row?.family_group_Members_Count);
    if (Number.isFinite(apiCount) && apiCount >= 0) return apiCount;
    return Array.isArray(row?.members) ? row.members.length : 0;
};

const getFamilyAddressText = (familyAddress = []) => {
    const defaultAddress = getDefaultAddress(familyAddress);
    if (!defaultAddress) return "-";

    const street = [
        normalizeText(defaultAddress.address_line1),
        normalizeText(defaultAddress.address_line2),
        normalizeText(defaultAddress.address_line3),
    ]
        .filter(Boolean)
        .join(", ");

    const city = normalizeText(defaultAddress.city);
    const pinCode = normalizeText(defaultAddress.pin_code);
    const cityPin = [city, pinCode].filter(Boolean).join(" - ");

    const combined = [street, cityPin].filter(Boolean).join(", ");
    return combined || "-";
};

const getMemberContactId = (member = {}) => {
    const contactId = Number(member?.contact_Id || member?.contact?.contact_Contact_Id || 0);
    return Number.isFinite(contactId) && contactId > 0 ? contactId : 0;
};

const removeContactFromFamilyGroup = (group = {}, contactId = 0) => {
    if (!group || !contactId) return group;

    const members = Array.isArray(group.members) ? group.members.filter((member) => getMemberContactId(member) !== contactId) : [];
    const headmembers = Array.isArray(group.headmembers)
        ? group.headmembers.filter((member) => getMemberContactId(member) !== contactId)
        : [];

    return {
        ...group,
        members,
        headmembers,
        family_group_Members_Count: members.length,
    };
};

const FamilyGroup = () => {
    const dispatch = useDispatch();
    const pageTitle = "Family Group";
    const pageSubTitle = "Organise contacts by family relationships under a single family group";
    const searchFieldPlaceholder = "Search family group by name...";

    const canCreateFamily = usePermission([PERMISSION_KEYS.FAMILY_CREATE, PERMISSION_KEYS.FAMILY_ALL], { mode: 'any' });
    const canUpdateFamily = usePermission([PERMISSION_KEYS.FAMILY_UPDATE, PERMISSION_KEYS.FAMILY_ALL], { mode: 'any' });
    const canDeleteFamily = usePermission([PERMISSION_KEYS.FAMILY_DELETE, PERMISSION_KEYS.FAMILY_ALL], { mode: 'any' });
    const canAssignMember = usePermission([PERMISSION_KEYS.FAMILY_ASSIGN_MEMBER, PERMISSION_KEYS.FAMILY_ALL], { mode: 'any' });
    const canReadFamily = usePermission([PERMISSION_KEYS.FAMILY_READ, PERMISSION_KEYS.FAMILY_ALL], { mode: 'any' });

    const pageButtons = canCreateFamily ? [
        {
            title: "Create Family Group +",
            clickAction: () => {
                openAddModal();
            },
        },
    ] : [];

    const PARAMS = {
        filter: {
            family_group_Name: "",
        },
        pagination: {
            page: 1,
            limit: 10
        }
    };

    const [params, setParams] = useState(PARAMS);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);
    const [totalPage, setTotalPage] = useState(0);
    const [formData, setFormData] = useState(INIT_FORM_DATA);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [isSaveDisabled, setIsSaveDisabled] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
    const [selectedFamilyGroup, setSelectedFamilyGroup] = useState(null);
    const [viewFamilyGroup, setViewFamilyGroup] = useState(null);
    const [removingMemberIds, setRemovingMemberIds] = useState([]);

    useEffect(() => {
        fetchFamilyGroupData();
    }, [params]);

    const fetchFamilyGroupData = async () => {
        setIsLoading(true);

        try {
            const { payload } = await dispatch(getData({ inputData: params }));
            console.log("API Response:", payload);

            if (payload?.status === "success" && payload?.data) {
                let data = payload.data;
                let pagination = payload.pagination;
                setData(Array.isArray(data) ? data : []);
                const totalRecords = Number(pagination?.total) || 0;
                const pageLimit = Number(pagination?.limit) > 0 ? Number(pagination?.limit) : params.pagination.limit;
                setTotalPage(Math.max(1, Math.ceil(totalRecords / pageLimit)));

                console.log(totalPage);

            } else {
                setData([]);
                toastMessage("error", payload?.msg || "Failed to fetch data");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setData([]);
            toastMessage("error", "Failed to fetch data");
        } finally {
            setIsLoading(false); // Stop loader
        }
    };

    const columns = [
        {
            label: "Family Group Name",
            accessor: "family_group_Name",
            sortable: true,
            width: "16%",
        },
        {
            label: "Family Head Name",
            accessor: "headmembers",
            sortable: false,
            width: "16%",
            render: (_, row) => {
                return getFamilyHeadNames(row);
            },
        },
        {
            label: "Members Count",
            accessor: "family_group_Members_Count",
            sortable: false,
            width: "12%",
            render: (_, row) => {
                const count = getFamilyMembersCount(row);
                return String(count).padStart(2, "0");
            },
        },
        {
            label: "Permanent Address",
            accessor: "familyAddress",
            sortable: true,
            width: "34%",
            render: (familyAddress) => {
                return getFamilyAddressText(familyAddress);
            },
        },
    ];

    const actions = [
        {
            label: "View",
            icon: <ViewIcon />,
            color: "#3A3F44",
            onClick: (row) => {
                setViewFamilyGroup(row);
                setViewModalVisible(true);
            },
            show: canReadFamily || canUpdateFamily,
            type: "icon",
        },
        {
            label: "Edit",
            icon: <EditIcon />,
            color: "#3A3F44",
            onClick: (row) => {
                // Format the data for editing
                const defaultAddress = getDefaultAddress(row?.familyAddress || []);
                const editData = {
                    family_group_Name: row.family_group_Name,
                    family_group_Id: row.family_group_Id,
                    head_contact_Id: getFamilyHeadContactIds(row),
                    headmembers: row.headmembers || [],
                    address: {
                        address_Id: defaultAddress?.address_Id || defaultAddress?.contact_address_Id || null,
                        address_line1: defaultAddress?.address_line1 || "",
                        address_line2: defaultAddress?.address_line2 || "",
                        city: defaultAddress?.city || "",
                        pin_code: defaultAddress?.pin_code || "",
                        address_type: defaultAddress?.address_type || "HOME",
                        is_default: defaultAddress?.is_default !== undefined ? defaultAddress?.is_default : true
                    }
                };
                setFormData(editData);
                setIsEdit(true);
                setModalVisible(true);
            },
            show: canUpdateFamily,
            type: "icon",
        },
        {
            label: "Delete",
            icon: <DeleteIcon />,
            color: "#dc3545",
            onClick: (row) => handleDelete(row),
            // requiresConfirmation: false,
            show: canDeleteFamily,
            type: "icon",
        },
        {
            label: "Add Member +",
            icon: <AddMemberIcon />,
            color: "#388224",
            onClick: (row) => handleAddMember(row),
            show: canAssignMember,
            type: "icon",
        },
    ];

    const openAddModal = () => {
        setIsEdit(false);
        setFormData(INIT_FORM_DATA);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setIsEdit(false);
        setFormData(INIT_FORM_DATA);
    };

    const closeViewModal = () => {
        setViewModalVisible(false);
        setViewFamilyGroup(null);
    };

    const handleAddMember = (row) => {
        setSelectedFamilyGroup(row);
        setAddMemberModalVisible(true);
    };

    const closeAddMemberModal = () => {
        setAddMemberModalVisible(false);
        setSelectedFamilyGroup(null);
    };

    const handleAddMemberSave = async (payload) => {
        console.log("Adding member:", payload);
        setIsSaveDisabled(true);

        try {
            const { payload: response } = await dispatch(assignMember(payload));

            if (response?.status === "error" || response?.status === false) {
                setIsSaveDisabled(false);
                toastMessage("error", response?.msg || response?.message || "An error occurred while adding member.");
            } else {
                setIsSaveDisabled(false);
                toastMessage("success", response?.msg || response?.message || "Member added successfully.");
                closeAddMemberModal();
                fetchFamilyGroupData(); // Refresh the list
            }
        } catch (error) {
            setIsSaveDisabled(false);
            console.error("Add member error:", error);
            toastMessage("error", error?.message || "An error occurred while adding member.");
        }
    };

    const handleSave = async (formData) => {
        console.log("Submitting:", formData);
        const isEditMode = Boolean(formData?.inputData?.family_group_Id);

        setIsSaveDisabled(true);

        try {
            let response;
            if (isEditMode) {
                // For edit, call updateData thunk
                const { payload } = await dispatch(updateData(formData));
                response = payload;
            } else {
                // For add, call addData thunk
                const { payload } = await dispatch(addData(formData));
                response = payload;
            }

            if (response?.status === "error" || response?.status === false) {
                setIsSaveDisabled(false);
                toastMessage("error", response?.msg || response?.message || "An error occurred while saving.");
            } else {
                setIsSaveDisabled(false);
                toastMessage("success", response?.msg || response?.message || `Family group ${isEditMode ? 'updated' : 'created'} successfully.`);
                closeModal();
                fetchFamilyGroupData(); // Refresh the list
            }
        } catch (error) {
            setIsSaveDisabled(false);
            console.error("Save error:", error);
            toastMessage("error", error?.message || "An error occurred while saving.");
        }
    };

    const handleDelete = async (row) => {
        const familyGroupId = row?.family_group_Id;
        if (!familyGroupId) {
            toastMessage("error", "Invalid family group selected.");
            return;
        }

        try {
            const payload = {
                inputData: {
                    family_group_Id: familyGroupId
                }
            };

            const { payload: response } = await dispatch(deleteData(payload));

            if (response?.status === "error" || response?.status === false) {
                toastMessage("error", response?.msg || response?.message || "An error occurred while deleting.");
            } else {
                toastMessage("success", response?.msg || response?.message || "Family group deleted successfully.");
                fetchFamilyGroupData(); // Refresh the list
            }
        } catch (error) {
            console.error("Delete error:", error);
            toastMessage("error", error?.message || "An error occurred while deleting.");
        }
    };

    const handleRemoveMemberFromView = async (member) => {
        const familyGroupId = Number(viewFamilyGroup?.family_group_Id || 0);
        const contactId = getMemberContactId(member);

        if (!familyGroupId || !contactId) {
            toastMessage("error", "Unable to remove this member.");
            return;
        }

        setRemovingMemberIds((prev) => (prev.includes(contactId) ? prev : [...prev, contactId]));

        try {
            const payload = {
                inputData: {
                    family_group_Id: familyGroupId,
                    contact_Ids: [contactId],
                },
            };

            const { payload: response } = await dispatch(removeMember(payload));

            if (response?.status === "error" || response?.status === false) {
                toastMessage("error", response?.msg || response?.message || "Failed to remove member.");
                return;
            }

            toastMessage("success", response?.msg || "Member removed successfully.");

            setViewFamilyGroup((prev) => removeContactFromFamilyGroup(prev, contactId));
            setData((prev) =>
                Array.isArray(prev)
                    ? prev.map((group) =>
                        Number(group?.family_group_Id) === familyGroupId
                            ? removeContactFromFamilyGroup(group, contactId)
                            : group,
                    )
                    : prev,
            );

            setSelectedFamilyGroup((prev) =>
                Number(prev?.family_group_Id) === familyGroupId ? removeContactFromFamilyGroup(prev, contactId) : prev,
            );

            fetchFamilyGroupData();
        } catch (error) {
            console.error("Remove member error:", error);
            toastMessage("error", error?.message || "Failed to remove member.");
        } finally {
            setRemovingMemberIds((prev) => prev.filter((id) => id !== contactId));
        }
    };

    const handleSort = (sortKey) => {
        setParams((prev) => ({
            ...prev,
            sorting: {
                key: sortKey,
                value: prev.sorting?.key === sortKey && prev.sorting?.value === "asc" ? "desc" : "asc",
            },
            pagination: {
                ...prev.pagination,
                page: 1,
            },
        }));
    };

    const handleRowsPerPageChange = (limit) => {
        setParams((prev) => ({
            ...prev,
            pagination: {
                ...prev.pagination,
                page: 1,
                limit,
            },
        }));
    };

    const handlePageChange = (page) => {
        setParams((prev) => ({
            ...prev,
            pagination: {
                ...prev.pagination,
                page,
            },
        }));
    };

    const handleSearchChange = (e) => {
        const value = e?.target?.value ?? "";
        setParams((prev) => ({
            ...prev,
            filter: {
                ...prev.filter,
                family_group_Name: value,
            },
            pagination: {
                ...prev.pagination,
                page: 1,
            },
        }));
    };

    return (
        <>
            <ToastContainer />
            <PageWrapper
                pageName={pageTitle}
                pageSubTitle={pageSubTitle}
                buttons={pageButtons}
                searchFieldPlaceholder={searchFieldPlaceholder}
                searchValue={params?.filter?.family_group_Name || ""}
                onSearchChange={handleSearchChange}
            >
                <DataTable
                    columns={columns}
                    data={data}
                    actions={actions}
                    tableClassName="family-group-table"
                    actionsColumnWidth="22%"
                    onSorting={handleSort}
                    sortingState={{ key: params.sorting?.key, order: params.sorting?.value }}
                    currentPage={params.pagination.page}
                    totalPages={totalPage}
                    rowsPerPage={params.pagination.limit}
                    updateRowsPerPage={handleRowsPerPageChange}
                    onPageChange={handlePageChange}
                    loader={isLoading}
                    showRowsPerPageTop={false}
                    showPagination
                    alwaysShowPagination
                    paginationVariant="compact"
                    rowsPerPageLabel="Rows per page"
                />
            </PageWrapper>

            {/* Add/Edit Modal */}
            <ModalWrapper
                visible={modalVisible}
                onClose={closeModal}
                modalTitle={isEdit ? "Edit Family Group" : "Create Family Group"}
                dialogClassName="role-form-modal-dialog"
            >
                <FamilyGroupAddEditForm
                    saveData={handleSave}
                    closeModal={closeModal}
                    formPayload={formData}
                    isSaveDisabled={isSaveDisabled}
                    isEdit={isEdit}
                />
            </ModalWrapper>

            {/* Add Member Modal */}
            <ModalWrapper
                visible={addMemberModalVisible}
                onClose={closeAddMemberModal}
                modalTitle={
                    <div className="contacts-manage-modal-title">
                        <span className="contacts-manage-modal-heading">{selectedFamilyGroup ? `Add Member to ${selectedFamilyGroup.family_group_Name}` : "Add Family Member"}</span>
                        <span className="contacts-manage-modal-subtitle">
                            You have already selected contact
                        </span>
                    </div>
                }
                dialogClassName="role-form-modal-dialog"
            >
                <div style={{ minHeight: 360 }}>
                    <AddMemberForm
                        saveData={handleAddMemberSave}
                        closeModal={closeAddMemberModal}
                        familyGroupId={selectedFamilyGroup?.family_group_Id}
                        existingMembers={selectedFamilyGroup?.members || []}
                        familyGroupName={selectedFamilyGroup?.family_group_Name}
                    />
                </div>
            </ModalWrapper>

            {/* View Details Modal */}
            <ModalWrapper
                visible={viewModalVisible}
                onClose={closeViewModal}
                modalTitle={viewFamilyGroup ? `Family Group Details - ${viewFamilyGroup.family_group_Name}` : "Family Group Details"}
                modalSize="xl"
                dialogClassName="family-group-view-modal"
            >
                <FamilyGroupViewDetails
                    familyGroup={viewFamilyGroup}
                    onRemoveMember={handleRemoveMemberFromView}
                    removingContactIds={removingMemberIds}
                />
            </ModalWrapper>
        </>
    );
};

export default FamilyGroup;

