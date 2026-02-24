import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { useDispatch } from 'react-redux';
import PageWrapper from '../../../pagecomponents/Common/PageWrapper';
import DataTable from '../../../pagecomponents/Common/DataTable';
import ModalWrapper from '../../../pagecomponents/Common/ModalWrapper';
import UserAddEditForm from './AddEditForm';
import { postReq } from '../../../helpers/api';
import { baseApiUrl } from '../../../helpers/constants';
import { toastMessage } from '../../../helpers/utility';
import { addData, deleteData, getData, updateData, updateStatusData } from '../../../redux/slices/UserSlice';
import EditIcon from '../../../pagecomponents/Icons/EditIcon';
import DeleteIcon from '../../../pagecomponents/Icons/DeleteIcon';
import { usePermission } from "../../../helpers/useSectionPermissions";
import { PERMISSION_KEYS } from "../../../helpers/permissionModules";
import './style.css';

const INIT_FORM_DATA = {
  user_Id: '',
  user_Email: '',
  user_Name: '',
  user_Mobile: '',
  user_Password: '',
  role_Ids: [],
  designation_Id: '',
};

const PARAMS = {
  filter: {
    user_Name: '',
    user_Email: '',
    designation_Id: [],
    role_Id: [],
  },
  sorting: {
    key: 'created_at',
    value: 'desc',
  },
  pagination: {
    page: 1,
    limit: 8,
  },
};

const USER_DETAILS_ENDPOINTS = ['/user/get-by-id'];

const toNumberArray = (values) => {
  if (!Array.isArray(values)) return [];

  return values.map((value) => Number(value)).filter((value) => !Number.isNaN(value));
};

const formatDisplayDate = (value) => {
  if (!value) return '-';

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return parsedDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getLastName = (row = {}) => {
  const directLastName =
    row?.user_Last_Name || row?.user_LastName || row?.last_Name || row?.lastName || row?.user_Surname;

  if (directLastName) return directLastName;

  const fullName = String(row?.user_Name || '').trim();
  if (!fullName) return '-';

  const nameParts = fullName.split(/\s+/);
  if (nameParts.length <= 1) return '-';

  return nameParts.slice(1).join(' ');
};

const getRoleIdsFromRow = (row = {}) => {
  if (Array.isArray(row?.role_Ids) && row.role_Ids.length) {
    return toNumberArray(row.role_Ids);
  }

  if (Array.isArray(row?.roles) && row.roles.length) {
    return toNumberArray(row.roles.map((role) => role?.role_Id ?? role?.id ?? role?.user_role_Role_Id));
  }

  if (row?.role_Id !== undefined && row?.role_Id !== null) {
    const roleId = Number(row.role_Id);
    return Number.isNaN(roleId) ? [] : [roleId];
  }

  return [];
};

const getRoleLabel = (value, row = {}) => {
  if (Array.isArray(value)) {
    const roleNames = value
      .map((item) => (typeof item === 'string' ? item : item?.role_Name || item?.name))
      .filter(Boolean);
    if (roleNames.length) return roleNames.join(', ');
  }

  if (typeof value === 'string' && value.trim()) return value;

  const roleNameFromObject = Array.isArray(row?.roles)
    ? row.roles
        .map((role) => role?.role_Name || role?.name)
        .filter(Boolean)
        .join(', ')
    : '';

  if (roleNameFromObject) return roleNameFromObject;

  return row?.role_Name || row?.role_Title || '-';
};

const toUserFormData = (user = {}) => ({
  user_Id: user?.user_Id || '',
  user_Email: user?.user_Email || '',
  user_Name: user?.user_Name || '',
  user_Mobile: user?.user_Mobile || '',
  user_Password: '',
  role_Ids: getRoleIdsFromRow(user),
  designation_Id: user?.designation_Id || '',
});

const User = () => {
  const dispatch = useDispatch();

  const [params, setParams] = useState(PARAMS);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [statusLoadingByUser, setStatusLoadingByUser] = useState({});

  const [formData, setFormData] = useState(INIT_FORM_DATA);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const [isEditUserLoading, setIsEditUserLoading] = useState(false);
  const editFetchRequestRef = useRef(0);
  const canCreateUser = usePermission([PERMISSION_KEYS.USER_CREATE]);
  const canUpdateUser = usePermission([PERMISSION_KEYS.USER_UPDATE]);
  const canDeleteUser = usePermission([PERMISSION_KEYS.USER_DELETE]);
  const canUpdateStatus = usePermission([PERMISSION_KEYS.USER_STATUS]);

  const pageButtons = canCreateUser ? [
    {
      title: 'Create User +',
      clickAction: () => {
        openAddModal();
      },
    },
  ] : [];

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);

    try {
      const { payload } = await dispatch(getData({ inputData: params }));
      if (payload?.status && payload.status !== 'success') {
        throw new Error(payload?.msg || 'Failed to fetch users.');
      }

      const list = Array.isArray(payload?.data) ? payload.data : [];
      const pagination = payload?.pagination || {};
      const total = Number(pagination.total || list.length || 0);

      setData(list);
      setTotalPage(Math.max(1, Math.ceil(total / params.pagination.limit)));
    } catch (error) {
      toastMessage('error', 'Failed to fetch users.');
      setData([]);
      setTotalPage(1);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, params]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleSave = async (payloadData) => {
    const isEditMode = Boolean(payloadData?.user_Id);

    setIsSaveDisabled(true);

    try {
      const action = isEditMode ? updateData : addData;
      const { payload } = await dispatch(action({ inputData: payloadData }));

      if (payload?.status !== 'success') {
        toastMessage('error', payload?.msg || 'Failed to save user.');
        return;
      }

      toastMessage('success', payload?.msg || 'User saved successfully.');
      closeModal();
      fetchUserData();
    } catch (error) {
      toastMessage('error', 'Failed to save user.');
    } finally {
      setIsSaveDisabled(false);
    }
  };

  const handleDelete = async (row) => {
    const userId = row?.user_Id;
    if (!userId) {
      toastMessage('error', 'Invalid user selected.');
      return;
    }

    try {
      const { payload } = await dispatch(
        deleteData({
          inputData: {
            user_Id: userId,
          },
        }),
      );

      if (payload?.status !== 'success') {
        throw new Error(payload?.msg || 'Failed to delete user.');
      }

      toastMessage('success', payload?.msg || 'User deleted successfully.');
      fetchUserData();
    } catch (error) {
      toastMessage('error', error?.message || 'Failed to delete user.');
    }
  };

  const handleStatusToggle = async (row) => {
    const userId = row?.user_Id;
    if (!userId) {
      toastMessage('error', 'Invalid user selected.');
      return;
    }

    const nextStatus = Number(row?.is_active) === 1 ? 0 : 1;
    setStatusLoadingByUser((prev) => ({ ...prev, [userId]: true }));

    try {
      const { payload } = await dispatch(
        updateStatusData({
          inputData: {
            user_Id: userId,
            is_active: nextStatus,
          },
        }),
      );

      if (payload?.status !== 'success') {
        toastMessage('error', payload?.msg || 'Failed to update user status.');
        return;
      }

      setData((prevData) =>
        prevData.map((item) => (item.user_Id === userId ? { ...item, is_active: nextStatus } : item)),
      );
      toastMessage('success', payload?.msg || 'User status updated successfully.');
    } catch (error) {
      toastMessage('error', error?.message || 'Failed to update user status.');
    } finally {
      setStatusLoadingByUser((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const openAddModal = () => {
    editFetchRequestRef.current += 1;
    setIsEditUserLoading(false);
    setFormData(INIT_FORM_DATA);
    setModalVisible(true);
  };

  const fetchUserDetailsForEdit = useCallback(async (userId) => {
    let lastError = null;

    for (const endpoint of USER_DETAILS_ENDPOINTS) {
      try {
        const response = await postReq(`${baseApiUrl}${endpoint}`, {
          inputData: {
            user_Id: userId,
          },
        });

        if (response?.status === 'success' && response?.data) {
          return response.data;
        }

        lastError = new Error(response?.msg || 'Unable to load user details.');
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Unable to load user details.');
  }, []);

  const openEditModal = async (row) => {
    const userId = row?.user_Id;
    const requestId = editFetchRequestRef.current + 1;
    editFetchRequestRef.current = requestId;

    setFormData(toUserFormData(row));
    setModalVisible(true);

    if (!userId) {
      return;
    }

    setIsEditUserLoading(true);

    try {
      const userDetails = await fetchUserDetailsForEdit(userId);
      if (editFetchRequestRef.current !== requestId) return;
      setFormData(toUserFormData(userDetails));
    } catch (error) {
      if (editFetchRequestRef.current !== requestId) return;
      toastMessage(
        'error',
        error?.response?.data?.msg || error?.msg || error?.message || 'Unable to load user details.',
      );
    } finally {
      if (editFetchRequestRef.current === requestId) {
        setIsEditUserLoading(false);
      }
    }
  };

  const closeModal = () => {
    editFetchRequestRef.current += 1;
    setIsEditUserLoading(false);
    setModalVisible(false);
    setFormData(INIT_FORM_DATA);
  };

  const handleSearchChange = (event) => {
    const keyword = event.target.value;

    setParams((prev) => ({
      ...prev,
      filter: {
        ...prev.filter,
        user_Name: keyword,
        user_Email: keyword,
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
        value: prev.sorting?.key === sortKey && prev.sorting?.value === 'asc' ? 'desc' : 'asc',
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
      label: 'Staff Name',
      accessor: 'user_Name',
      sortable: true,
      render: (value) => value || '-',
    },
    {
      label: 'Last Name',
      accessor: 'user_Last_Name',
      sortable: false,
      render: (_, row) => getLastName(row),
    },
    {
      label: 'User Roles',
      accessor: 'roleNames',
      sortable: false,
      render: (value, row) => getRoleLabel(value, row),
    },
    {
      label: 'Contact',
      accessor: 'user_Mobile',
      sortable: true,
      render: (value) => value || '-',
    },
    {
      label: 'Email ID',
      accessor: 'user_Email',
      sortable: true,
      render: (value) => value || '-',
    },
    {
      label: 'Joining Date',
      accessor: 'created_at',
      sortable: true,
      render: (value) => formatDisplayDate(value),
    },
    {
      label: 'Status',
      accessor: 'is_active',
      sortable: true,
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (value, row) => {
        return (
          <label className="user-status-switch">
            <input
              type="checkbox"
              checked={Number(value) === 1}
              disabled={!canUpdateStatus || statusLoadingByUser[row?.user_Id]}
              onChange={() => handleStatusToggle(row)}
            />
            <span className="user-status-slider"></span>
          </label>
        );
      },
    },
    {
      label: 'Last update on',
      accessor: 'updated_at',
      sortable: true,
      render: (value) => formatDisplayDate(value),
    },
  ];

  const actions = [
    {
      label: 'Edit',
      icon: <EditIcon />,
      color: '#3A3F44',
      type: 'icon',
      onClick: (row) => openEditModal(row),
      show: canUpdateUser,
    },
    {
      label: 'Delete',
      icon: <DeleteIcon />,
      color: '#ef4444',
      type: 'icon',
      onClick: (row) => handleDelete(row),
      show: canDeleteUser,
    },
  ];

  const isEditMode = Boolean(formData?.user_Id);

  return (
    <>
      <ToastContainer />
      <div className="user-management-page">
        <PageWrapper
          pageName="User Management"
          pageSubTitle="Easily manage your users"
          searchFieldPlaceholder="Search user name..."
          searchValue={params.filter.user_Name}
          onSearchChange={handleSearchChange}
          filterIcon={[]}
          buttons={pageButtons}
          onClick={openAddModal}
        >
          <DataTable
            columns={columns}
            data={data}
            actions={actions}
            tableClassName="user-list-table"
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

      <ModalWrapper visible={modalVisible} onClose={closeModal} modalTitle={isEditMode ? 'Edit User' : 'Add New User'}>
        <UserAddEditForm
          saveData={handleSave}
          closeModal={closeModal}
          formPayload={formData}
          isSaveDisabled={isSaveDisabled || isEditUserLoading}
          isEdit={isEditMode}
        />
      </ModalWrapper>
    </>
  );
};

export default User;

