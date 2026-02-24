import React, { useState, useEffect } from "react";

import ModalWrapper from "../../../pagecomponents/Common/ModalWrapper";
import PageWrapper from "../../../pagecomponents/Common/PageWrapper";
import RoleAddEditForm from "./AddEditForm";
import { ToastContainer } from "react-toastify";
import { toastMessage } from "../../../helpers/utility";
import { useDispatch } from "react-redux";
import { addData, deleteData, getData, updateData, updateStatusData } from "../../../redux/slices/MasterUserRoleSlice";
import DataTable from "../../../pagecomponents/Common/DataTable";
import EditIcon from "../../../pagecomponents/Icons/EditIcon";
import DeleteIcon from "../../../pagecomponents/Icons/DeleteIcon";
import { usePermission } from "../../../helpers/useSectionPermissions";
import { PERMISSION_KEYS } from "../../../helpers/permissionModules";
import "./style.css";

const INIT_FORM_DATA = { role_Name: "", role_Description: "", permission_Ids: [] };
const PARAMS = {
    filter: {
        role_Name: "",
    },
    sorting: {
        key: "created_at",
        value: "desc",
    },
    pagination: {
        page: 1,
        limit: 10,
    },
};

const UserRole = () => {
    const dispatch = useDispatch();
    const pageTitle = "Role Management";
    const pageSubTitle = "Easily manage your roles";
    const searchFieldPlaceholder = "Search role name...";

    const canCreateRole = usePermission([PERMISSION_KEYS.ROLE_CREATE]);
    const canUpdateRole = usePermission([PERMISSION_KEYS.ROLE_UPDATE]);
    const canDeleteRole = usePermission([PERMISSION_KEYS.ROLE_DELETE]);
    const canUpdateStatus = usePermission([PERMISSION_KEYS.ROLE_STATUS_UPDATE]);

    const pageButtons = canCreateRole ? [
        {
            title: "Create Role +",
            clickAction: () => {
                openAddModal();
            },
        },
    ] : [];

    const [formData, setFormData] = useState(INIT_FORM_DATA);
    const [modalVisible, setModalVisible] = useState(false);
    const [isSaveDisabled, setIsSaveDisabled] = useState(false);

    const getRolePermissionIds = (role = {}) => {
        if (!Array.isArray(role?.permission_Ids) || role.permission_Ids.length === 0) {
            return (role?.permissions || [])
                .map((permission) => (
                    permission?.permission_Id
                    ?? permission?.id
                    ?? permission?.role_permission_Permission_Id
                ))
                .filter((permissionId) => permissionId !== undefined && permissionId !== null);
        }

        return role.permission_Ids;
    };

    const openAddModal = () => {
        setFormData(INIT_FORM_DATA);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setFormData(INIT_FORM_DATA);
    };

    const handleSave = async (formData) => {
        const isEditMode = Boolean(formData?.role_Id);

        setIsSaveDisabled(true);
        const { payload } = await dispatch(
            (isEditMode ? updateData : addData)({ inputData: formData })
        );
        if (payload?.status === "error") {
            setIsSaveDisabled(false);
            toastMessage("error", payload.msg || "An error occurred while saving.");
        } else {
            setIsSaveDisabled(false);
            toastMessage(payload?.status || "success", payload?.msg || "Operation successful.");
            fetchRoleData();
            closeModal();
        }
    };

    const handleDelete = async (row) => {
        const roleId = row?.role_Id;
        if (!roleId) {
            toastMessage("error", "Invalid role selected.");
            return;
        }

        try {
            const { payload } = await dispatch(
                deleteData({
                    inputData: {
                        role_Id: roleId,
                    },
                })
            );

            if (payload?.status !== "success") {
                throw new Error(payload?.msg || "Failed to delete role.");
            }

            toastMessage("success", payload?.msg || "Role deleted successfully.");
            fetchRoleData();
        } catch (error) {
            toastMessage("error", error?.message || "Failed to delete role.");
        }
    };

    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);
    const [totalPage, setTotalPage] = useState(0);
    const [statusLoadingByRole, setStatusLoadingByRole] = useState({});
    const [params, setParams] = useState(PARAMS);

    useEffect(() => {
        fetchRoleData();
    }, [params]);

    const fetchRoleData = async () => {
        setIsLoading(true);

        try {
            const { payload } = await dispatch(getData({ inputData: params }));
            const apiData = payload?.data || [];
            const pagination = payload?.pagination || {};
            const total = Number(pagination.total || 0);
            setData(apiData);
            setTotalPage(Math.ceil(total / params.pagination.limit));
        } catch (err) {
            toastMessage("error", "Failed to fetch data");
        } finally {
            setIsLoading(false); // Stop loader
        }
    };

    const handleStatusToggle = async (row) => {
        const roleId = row?.role_Id;
        if (!roleId) {
            toastMessage("error", "Invalid role selected.");
            return;
        }

        const nextStatus = row.is_active === 1 ? 0 : 1;
        setStatusLoadingByRole((prev) => ({ ...prev, [roleId]: true }));

        try {
            const { payload } = await dispatch(
                updateStatusData({
                    inputData: {
                        role_Id: roleId,
                        is_active: nextStatus,
                    },
                })
            );

            if (payload?.status !== "success") {
                toastMessage("error", payload?.msg || "Failed to update role status.");
                return;
            }

            setData((prevData) =>
                prevData.map((item) =>
                    item.role_Id === roleId ? { ...item, is_active: nextStatus } : item
                )
            );
            toastMessage("success", payload?.msg || "Role status updated successfully.");
        } catch (error) {
            toastMessage("error", error?.message || "Failed to update role status.");
        } finally {
            setStatusLoadingByRole((prev) => ({ ...prev, [roleId]: false }));
        }
    };

    const handleSearchChange = (e) => {
        const roleName = e.target.value;
        setParams((prev) => ({
            ...prev,
            filter: {
                ...prev.filter,
                role_Name: roleName,
            },
            pagination: {
                ...prev.pagination,
                page: 1,
            },
        }));
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

    const columns = [
        {
            label: "Role Name",
            accessor: "role_Name",
            sortable: true,
            width: "24%",
        },
        {
            label: "Description",
            accessor: "role_Description",
            width: "34%",
            render: (value) => value || "-",
        },
        {
            label: "Users",
            accessor: "user_count",
            width: "8%",
            headerClassName: "text-center",
            cellClassName: "text-center",
            render: (value) => `${value} ${value === 1 ? "user" : "users"}`,
        },
        {
            label: "Status",
            accessor: "is_active",
            width: "8%",
            headerClassName: "text-center",
            cellClassName: "text-center",
            render: (value, row) => {
                return (
                    <label className="role-status-switch">
                        <input
                            type="checkbox"
                            checked={value === 1}
                            disabled={!canUpdateStatus || statusLoadingByRole[row?.role_Id]}
                            onChange={() => handleStatusToggle(row)}
                        />
                        <span className="role-status-slider"></span>
                    </label>
                );
            },
        },
        {
            label: "Permissions",
            accessor: "permissions",
            width: "12%",
            headerClassName: "text-center",
            cellClassName: "text-center",
            render: (permissions) => {
                const count = permissions?.length || 0;
                return `${String(count).padStart(2, "0")} Permissions`;
            },
        },
    ];

    const actions = [
        {
            label: "Edit",
            icon: <EditIcon />,
            color: "#3A3F44",
            type: "icon",
            onClick: (row) => {
                setFormData({
                    role_Id: row?.role_Id,
                    role_Name: row?.role_Name || "",
                    role_Description: row?.role_Description || "",
                    permission_Ids: getRolePermissionIds(row),
                });
                setModalVisible(true);
            },
            show: canUpdateRole,
        },
        {
            label: "Delete",
            icon: <DeleteIcon />,
            color: "#ef4444",
            type: "icon",
            onClick: (row) => handleDelete(row),
            show: canDeleteRole,
        },
    ];

    const isEditMode = Boolean(formData?.role_Id);

    return (
        <>
            <ToastContainer />
            <div className="role-management-page">
                <PageWrapper
                    pageName={pageTitle}
                    pageSubTitle={pageSubTitle}
                    buttons={pageButtons}
                    searchFieldPlaceholder={searchFieldPlaceholder}
                    searchValue={params.filter.role_Name}
                    onSearchChange={handleSearchChange}
                    filterIcon={[]}
                    onClick={() => { openAddModal() }}
                >
                    <DataTable
                        columns={columns}
                        data={data}
                        actions={actions}
                        tableClassName="role-list-table"
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
            </div>

            <ModalWrapper
                visible={modalVisible}
                onClose={closeModal}
                modalTitle={isEditMode ? "Edit Role" : "Add New Role"}
                dialogClassName="role-form-modal-dialog"
            >
                <RoleAddEditForm
                    saveData={handleSave}
                    closeModal={closeModal}
                    formPayload={formData}
                    isEdit={isEditMode}
                    isModalOpen={modalVisible}
                    isSaveDisabled={isSaveDisabled}
                />
            </ModalWrapper>
        </>
    );
};

export default UserRole;

