import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toastMessage } from '../../helpers/utility';
import { ToastContainer } from 'react-toastify';
import { addData, deleteData, getData, manageFamily, updateData } from '../../redux/slices/ContactSlice';
import DataTable from '../../pagecomponents/Common/DataTable';
import ModalWrapper from '../../pagecomponents/Common/ModalWrapper';
import Swal from 'sweetalert2';
import EditIcon from '../../pagecomponents/Icons/EditIcon';
import ViewIcon from '../../pagecomponents/Icons/ViewIcon';
import CustomButton from '../../pagecomponents/Elements/Buttons/CustomButton';
import './style.css';
import { getData as getFamilyGroups } from '../../redux/slices/FamilyGroupSlice';
import { sendInvite } from '../../redux/slices/EventSlice';
import DeleteIcon from '../../pagecomponents/Icons/DeleteIcon';
import { postReq } from '../../helpers/api';
import { baseApiUrl } from '../../helpers/constants';
import ContactDetailsPanel from './ContactDetailsPanel';
import ContactFilterModal from './ContactFilterModal';
import IconBox from '../../pagecomponents/Common/IconBox';
import { Form } from 'react-bootstrap';
import { PermissionGate } from '../../helpers/useSectionPermissions';
import ManageIcon from '../../pagecomponents/Icons/ManageIcon';
import AddEditForm from './AddEditForm';
import { usePermission } from '../../helpers/useSectionPermissions';
import { PERMISSION_KEYS } from '../../helpers/permissionModules';

const getInitFormData = () => ({
  salutation: 'Mr',
  full_name: '',
  last_name: '',
  type: 'MAIN',
  contact: {
    phones: [],
    emails: [],
    addresses: [],
    metadata: null,
  },
  family: [],
});

const Contacts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pageTitle = 'Contact Management';
  const pageSubTitle = 'Manage your contacts';
  const searchFieldPlaceholder = 'Search contacts by name, email, or city...';
  const inviteEventId = searchParams.get('ref') || '';
  
  const canReadContact = usePermission([PERMISSION_KEYS.CONTACT_READ, PERMISSION_KEYS.CONTACT_ALL], { mode: 'any' });
  const canUpdateContact = usePermission([PERMISSION_KEYS.CONTACT_UPDATE, PERMISSION_KEYS.CONTACT_ALL], { mode: 'any' });
  const canDeleteContact = usePermission([PERMISSION_KEYS.CONTACT_DELETE, PERMISSION_KEYS.CONTACT_ALL], { mode: 'any' });

  const normalizeToArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed || trimmed === '[]') return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fall through
      }
      return [trimmed];
    }
    return [];
  };

  const getTags = (row) => {
    const tags = normalizeToArray(row?.tags);
    return tags
      .map((tag) => {
        if (typeof tag === 'string') return tag.trim();
        if (typeof tag === 'number') return `Tag ${tag}`;
        return tag?.name || tag?.label || null;
      })
      .filter(Boolean);
  };

  const getFamilyGroupNames = (row) => {
    const familyGroups = normalizeToArray(row?.family_group_names);
    return familyGroups.map((item) => String(item || '').trim()).filter(Boolean);
  };

  const buildExportRows = (rows = []) =>
    rows.map((row) => ({
      Salutation: row?.salutation || row?.contact_Salutation || '',
      Name: [row?.first_name, row?.last_name].filter(Boolean).join(' '),
      Title: row?.last_name || '',
      Address: [row?.address, row?.city, row?.pin_code].filter(Boolean).join(', '),
      Mobile: row?.phone || '',
      Email: row?.email || '',
      'Family Group': getFamilyGroupNames(row).join(', '),
      Tags: getTags(row).join(', '),
    }));

  const downloadCsv = (rows = [], fileName = 'contacts_export.csv') => {
    if (!rows.length) {
      toastMessage('warning', 'No data available to export.');
      return;
    }

    const headers = Object.keys(rows[0]);
    const escapeCsv = (value) =>
      `"${String(value ?? '')
        .replace(/"/g, '""')
        .replace(/\r?\n/g, ' ')}"`;

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => headers.map((key) => escapeCsv(row[key])).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.setAttribute('download', fileName);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const DEFAULT_FILTER = {
    contact_type: 'ALL',
    name: '',
    email: [],
    address: '',
    mobile: [],
    event_Ids: [],
    family_group_Ids: [],
  };

  const PARAMS = {
    filter: { ...DEFAULT_FILTER },
    sorting: {
      Key: 'created_At',
      value: 'desc',
    },
    pagination: {
      page: 1,
      limit: 10,
    },
    shouldExport: false,
  };

  const [params, setParams] = useState(PARAMS);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [totalPage, setTotalPage] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [formData, setFormData] = useState(getInitFormData());
  const [modalVisible, setModalVisible] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [familySearchValue, setFamilySearchValue] = useState('');
  const [selectedFamilyGroup, setSelectedFamilyGroup] = useState(null);
  const [familyGroups, setFamilyGroups] = useState([]);
  const [familyGroupsLoading, setFamilyGroupsLoading] = useState(false);
  const [isInviteSending, setIsInviteSending] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewContactDetails, setViewContactDetails] = useState(null);
  const [isViewDetailsLoading, setIsViewDetailsLoading] = useState(false);
  const [isEditDataLoading, setIsEditDataLoading] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilterUi, setActiveFilterUi] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    events: [],
    families: [],
  });
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const rightContentRef = useRef(null);
  const [selectContactDetails, setSelectContactDetails] = useState([]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!rightContentRef.current) return;
      if (!rightContentRef.current.contains(event.target)) {
        setOpenMenuIndex(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getContactId = useCallback(
    (row) => row?.contact?.contact_Contact_Id);

  const selectableContactIds = data.map((row) => getContactId(row)).filter(Boolean);

  const isAllSelected =
    selectableContactIds.length > 0 && selectableContactIds.every((id) => selectedContacts.includes(id));

  const filteredFamilyGroups = familyGroups.filter((group) =>
    (group?.family_group_Name || '').toLowerCase().includes(familySearchValue.trim().toLowerCase()),
  );

  const handleSelectContact = useCallback((contactId) => {
    setSelectedContacts((prev) => {
      if (!contactId) {
        return prev;
      }
      if (prev.includes(contactId)) {
        return prev.filter((id) => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  }, []);

  const handleContactSelection = useCallback(
    (row) => {
      const contactId = getContactId(row);
      if (!contactId) {
        toastMessage('warning', 'Contact id not found.');
        return;
      }
      // const contactId = getContactId(row);
      handleSelectContact(contactId);
      setSelectContactDetails((prev) => [...prev, row]);
    },
    [getContactId, handleSelectContact],
  );

  const handleSelectAllContacts = useCallback(() => {
    setSelectedContacts((prev) => {
      if (isAllSelected) {
        return [];
      } else {
        return selectableContactIds;
      }
    });
  }, [isAllSelected, selectableContactIds]);

  useEffect(() => {
    fetchContactData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const fetchContactData = async () => {
    setIsLoading(true);
    setSelectedContacts([]);

    try {
      const { payload } = await dispatch(getData({ inputData: params }));
      if (payload?.status !== 'success') {
        throw new Error(payload?.msg || 'Failed to fetch contacts.');
      }
      const rows = Array.isArray(payload?.data) ? payload.data : [];
      const pagination = payload?.pagination || {};
      const total = Number(pagination.total || 0);

      setData(rows);
      setTotalPage(Math.max(Math.ceil(total / params.pagination.limit), 1));
    } catch (err) {
      setData([]);
      setTotalPage(1);
      toastMessage('error', err?.message || 'Failed to fetch contacts.');
    } finally {
      setIsLoading(false); // Stop loader
    }
  };

  const columns = [
    {
      label: (
        <div onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={isAllSelected} onChange={handleSelectAllContacts} title="Select all" />
        </div>
      ),
      accessor: 'checkbox',
      render: (value, row) => (
        <div onClick={(e) => e.stopPropagation()}>
          {(() => {
            const contactId = getContactId(row);
            return (
              <input
                type="checkbox"
                checked={contactId ? selectedContacts.includes(contactId) : false}
                onChange={() => handleContactSelection(row)}
                disabled={!contactId}
              />
            );
          })()}
        </div>
      ),
      width: '5%',
      sortable: false,
    },
    {
      label: 'ST',
      accessor: 'salutation',
      sortable: true,
      width: '10%',
      render: (value, row) => row?.salutation || '-',
    },
    {
      label: 'Name',
      accessor: 'first_name',
      sortable: true,
      width: '14%',
      // render: (value, row) => [row?.first_name, row?.last_name].filter(Boolean).join(' ') || '-',
      render: (value, row) => row?.first_name || '-',
    },
    {
      label: 'Title',
      accessor: 'last_name',
      sortable: false,
      width: '11%',
      render: (value, row) => row?.last_name || '-',
    },
    {
      label: 'Spouse Name',
      accessor: 'spouse_first_name',
      sortable: true,
      width: '16%',
      render: (value, row) => [row?.spouse_first_name, row?.spouse_last_name].filter(Boolean).join(' ') || '-',
    },
    {
      label: 'Spouse Mobile',
      accessor: 'spouse_phone',
      sortable: false,
      width: '12%',
      render: (value, row) => row?.spouse_phone || '-',
    },
    {
      label: 'Spouse Email',
      accessor: 'spouse_email',
      sortable: false,
      width: '16%',
      render: (value, row) => row?.spouse_email || '-',
    },
    {
      label: 'Address',
      accessor: 'address',
      sortable: false,
      width: '23%',
      render: (value, row) => [row?.address, row?.city, row?.pin_code].filter(Boolean).join(', ') || '-',
    },
    {
      label: 'Mobile',
      accessor: 'phone',
      sortable: false,
      width: '10%',
      render: (value) => value || '-',
    },
    {
      label: 'Email',
      accessor: 'email',
      sortable: false,
      width: '13%',
      render: (value) => value || '-',
    },
    {
      label: 'Family Group',
      accessor: 'family_group_names',
      sortable: false,
      width: '14%',
      render: (value, row) => {
        const familyGroups = getFamilyGroupNames(row);
        if (!familyGroups.length) return '-';

        return (
          <span className="contacts-tags">
            {familyGroups.map((group, index) => (
              <span key={`${group}-${index}`} className="contacts-family-badge">
                {group}
              </span>
            ))}
          </span>
        );
      },
    },
    {
      label: 'Tags',
      accessor: 'tags',
      sortable: false,
      width: '12%',
      render: (value, row) => {
        const tags = getTags(row);
        if (!tags.length) return '-';
        return (
          <span className="contacts-tags">
            {tags.map((tag, idx) => (
              <span key={`${tag}-${idx}`} className="contacts-tag">
                {tag}
              </span>
            ))}
          </span>
        );
      },
    },
  ];

  const actions = [
    {
      label: 'View',
      icon: <ViewIcon />,
      color: '#3A3F44',
      type: 'icon',
      onClick: (row) => openViewModal(row),
      show: canReadContact,
    },
    {
      label: 'Edit',
      icon: <EditIcon />,
      color: '#3A3F44',
      type: 'icon',
      onClick: (row) => openEditModal(row),
      show: canUpdateContact,
    },
    {
      label: 'Delete',
      icon: <DeleteIcon />,
      color: '#dc3545',
      type: 'icon',
      onClick: (row) => handleDelete(row),
      show: canDeleteContact,
    },
    {
      label: 'Manage',
      icon: <ManageIcon />,
      color: '#000000',
      type: 'icon',
      onClick: (row) => {
        // const contactId = getContactId(row);
        // if (!contactId) {
        //   toastMessage('warning', 'Contact id not found.');
        //   return;
        // }
        // setSelectedContacts([contactId]);
        handleContactSelection(row);
        setManageModalVisible(true);
      },
      show: canUpdateContact,
    },
  ];

  const openAddModal = () => {
    // setIsEdit(false);
    setFormData(getInitFormData());
    setIsEditMode(false);
    setModalVisible(true);
  };

  const closeViewModal = () => {
    setViewModalVisible(false);
    setViewContactDetails(null);
    setIsViewDetailsLoading(false);
  };

  const openViewModal = async (row) => {
    const contactId = getContactId(row);

    if (!contactId) {
      toastMessage('warning', 'Contact id not found.');
      return;
    }

    setViewModalVisible(true);
    setViewContactDetails(null);
    setIsViewDetailsLoading(true);

    try {
      const response = await postReq(`${baseApiUrl}/contact/get-by-id`, {
        inputData: {
          contact_Id: Number(contactId),
        },
      });

      if (response?.status !== 'success') {
        throw new Error(response?.msg || 'Failed to fetch contact details.');
      }

      setViewContactDetails(response?.data || null);
    } catch (error) {
      toastMessage('error', error?.response?.data?.msg || error?.message || 'Failed to fetch contact details.');
    } finally {
      setIsViewDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    // setValidated(false);
    setFormData(getInitFormData());
    setIsEditMode(false);
    setIsEditDataLoading(false);
  };

  async function openEditModal(row) {
    const contactId = getContactId(row);

    if (!contactId) {
      toastMessage('warning', 'Contact id not found.');
      return;
    }

    setIsEditMode(true);
    setIsEditDataLoading(true);
    setModalVisible(true);

    try {
      const response = await postReq(`${baseApiUrl}/contact/get-by-id`, {
        inputData: {
          contact_Id: Number(contactId),
        },
      });

      if (response?.status !== 'success') {
        throw new Error(response?.msg || 'Failed to fetch contact for edit.');
      }

      setFormData(response?.data || getInitFormData());
    } catch (error) {
      toastMessage('error', error?.response?.data?.msg || error?.message || 'Failed to fetch contact for edit.');
      closeModal();
    } finally {
      setIsEditDataLoading(false);
    }
  }

  const handleSave = async (formData) => {
    setIsSaveDisabled(true);
    try {
      const { payload } = await dispatch(
        isEditMode ? updateData({ inputData: formData }) : addData({ inputData: formData }),
      );

      console.log('Save response payload:', payload);
      if (!payload || payload?.status !== 'success') {
        toastMessage('error', payload?.msg || 'Failed to save contact.');
      }

      if (formData.type === 'delete') {
        Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
        return;
      }

      toastMessage(payload?.status || 'success', payload?.msg || 'Operation successful.');
      closeModal();
      await fetchContactData();
    } catch (error) {
      toastMessage('error', error?.msg || 'An error occurred while saving.');
    } finally {
      setIsSaveDisabled(false);
    }
  };

  const handleManageClick = () => {
    if (selectedContacts.length === 0) {
      toastMessage('warning', 'Please select at least one contact to manage');
      return;
    }
    setManageModalVisible(true);
  };

  const openFilterModal = () => {
    setFilterModalVisible(true);
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  const handleApplyFilter = (appliedFilter, appliedFilterUi = null) => {
    setParams((prev) => ({
      ...prev,
      filter: {
        ...prev.filter,
        ...appliedFilter,
      },
      pagination: {
        ...prev.pagination,
        page: 1,
      },
    }));
    setSearchValue(appliedFilter?.name || '');

    if (appliedFilterUi) {
      setActiveFilterUi({
        name: appliedFilterUi?.name || '',
        mobile: appliedFilterUi?.mobile || '',
        email: appliedFilterUi?.email || '',
        address: appliedFilterUi?.address || '',
        events: Array.isArray(appliedFilterUi?.events) ? appliedFilterUi.events : [],
        families: Array.isArray(appliedFilterUi?.families) ? appliedFilterUi.families : [],
      });
    }
  };

  const filterIcon = [{ iconName: 'si si-equalizer', clickAction: openFilterModal }];

  const handleImportClick = () => {
    navigate(`${process.env.PUBLIC_URL}/import-contacts`);
  };

  const handleExportClick = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      const exportLimit = Math.max(params.pagination.limit, totalPage * params.pagination.limit);
      const exportParams = {
        ...params,
        shouldExport: false,
        pagination: {
          ...params.pagination,
          page: 1,
          limit: exportLimit,
        },
      };

      const exportResponse = await postReq(`${baseApiUrl}/contact/list`, {
        inputData: exportParams,
      });

      if (exportResponse?.status === 'success' && Array.isArray(exportResponse?.data)) {
        const rows = buildExportRows(exportResponse.data);
        downloadCsv(rows, 'contacts_export.csv');
        toastMessage('success', 'Contacts exported successfully.');
        return;
      }

      const response = await postReq(`${baseApiUrl}/contact/list`, {
        inputData: {
          ...params,
          shouldExport: true,
        },
      });

      if (response?.status !== 'success') {
        throw new Error(response?.msg || 'Failed to export contacts.');
      }

      const fileUrl = response?.data?.fileUrl;
      const fileName = response?.data?.fileName;

      if (!fileUrl) {
        throw new Error('Export file URL not found.');
      }

      const anchor = document.createElement('a');
      anchor.href = fileUrl;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      if (fileName) {
        anchor.setAttribute('download', fileName);
      }
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      toastMessage('success', response?.msg || 'Contacts exported successfully.');
    } catch (error) {
      toastMessage('error', error?.response?.data?.msg || error?.message || 'Failed to export contacts.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEventId) {
      toastMessage('error', 'Event reference is missing.');
      return;
    }
    if (selectedContacts.length === 0) {
      toastMessage('warning', 'Please select at least one contact to invite.');
      return;
    }

    const eventId = Number(inviteEventId);
    if (!eventId) {
      toastMessage('error', 'Invalid event reference.');
      return;
    }

    setIsInviteSending(true);
    try {
      const { payload } = await dispatch(
        sendInvite({
          inputData: {
            event_Id: eventId,
            invite_type: 'contact',
            contact_Ids: selectedContacts,
            invite_label: 'Guests',
          },
        }),
      );
      if (payload?.status !== 'success') {
        toastMessage('error', payload?.msg || payload?.message || 'Failed to send invite.');
        return;
      }
      toastMessage('success', payload?.msg || payload?.message || 'Invites sent.');
    } catch (error) {
      toastMessage('error', error?.response?.data?.msg || error?.message || 'Failed to send invite.');
    } finally {
      setIsInviteSending(false);
    }
  };

  const fetchFamilyGroups = async () => {
    setFamilyGroupsLoading(true);
    try {
      const payload = {
        inputData: {
          filter: {
            contact_type: '',
          },
          pagination: {
            page: 1,
            limit: 50,
          },
        },
      };
      const { payload: response } = await dispatch(getFamilyGroups(payload));
      if (response?.status === 'success' && Array.isArray(response?.data)) {
        setFamilyGroups(response.data);
      } else {
        setFamilyGroups([]);
        toastMessage('error', response?.msg || response?.message || 'Failed to fetch family groups');
      }
    } catch (error) {
      setFamilyGroups([]);
      toastMessage('error', error?.response?.data?.msg || error?.message || 'Failed to fetch family groups');
    } finally {
      setFamilyGroupsLoading(false);
    }
  };

  const closeManageModal = () => {
    setManageModalVisible(false);
    setSelectedContacts([]);
  };

  useEffect(() => {
    if (manageModalVisible) {
      fetchFamilyGroups();
    } else {
      setFamilySearchValue('');
      setSelectedFamilyGroup(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manageModalVisible]);

  const handleSort = (sortKey) => {
    setParams((prev) => ({
      ...prev,
      sorting: {
        Key: sortKey,
        value: prev.sorting?.Key === sortKey && prev.sorting?.value === 'asc' ? 'desc' : 'asc',
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
    const value = e.target.value;
    setSearchValue(value);
    setActiveFilterUi((prev) => ({
      ...prev,
      name: value,
    }));
    setParams((prev) => ({
      ...prev,
      filter: {
        ...prev.filter,
        name: value,
      },
      pagination: {
        ...prev.pagination,
        page: 1,
      },
    }));
  };

  const handleDelete = async (row) => {
    // if (!roleAccess.canDelete) {
    //     toastMessage("error", "You don't have permission to delete roles.");
    //     return;
    // }

    const contact_Contact_Id = getContactId(row);
    if (!contact_Contact_Id) {
      toastMessage('error', 'Invalid contact selected.');
      return;
    }

    try {
      const { payload } = await dispatch(
        deleteData({
          inputData: {
            contact_Id: contact_Contact_Id,
            delete_reason: 'Wrong entry',
          },
        }),
      );

      if (payload?.status !== 'success') {
        throw new Error(payload?.msg || 'Failed to delete contact.');
      }

      toastMessage('success', payload?.msg || 'Contact deleted successfully.');
      await fetchContactData();
    } catch (error) {
      toastMessage('error', error?.message || 'Failed to delete contact.');
    }
  };

  const clearAllFilters = () => {
    setParams((prev) => ({
      ...prev,
      filter: { ...DEFAULT_FILTER },
      pagination: {
        ...prev.pagination,
        page: 1,
      },
    }));
    setSearchValue('');
    setActiveFilterUi({
      name: '',
      mobile: '',
      email: '',
      address: '',
      events: [],
      families: [],
    });
  };

  const activeEventNames = (activeFilterUi?.events || []).map((item) => item?.name).filter(Boolean);
  const activeFamilyNames = (activeFilterUi?.families || []).map((item) => item?.name).filter(Boolean);

  const activeFilterBadges = [
    activeFilterUi?.name ? `Name: ${activeFilterUi.name}` : null,
    activeFilterUi?.mobile ? `Mobile: ${activeFilterUi.mobile}` : null,
    activeFilterUi?.email ? `Email: ${activeFilterUi.email}` : null,
    activeFilterUi?.address ? `Address: ${activeFilterUi.address}` : null,
    activeEventNames.length ? `Event: ${activeEventNames.join(', ')}` : null,
    activeFamilyNames.length ? `Family: ${activeFamilyNames.join(', ')}` : null,
  ].filter(Boolean);

  const pageHeaderStyles = {
    container: {
      width: '100%',
      padding: '0 1rem',
    },
    searchWrapper: {
      position: 'relative',
      width: '100%',
    },
    searchInput: {
      paddingRight: '42px',
      fontSize: '14px',
    },
    searchIcon: {
      position: 'absolute',
      right: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
      fontSize: '16px',
      pointerEvents: 'none',
    },
    leftContent: {
      maxWidth: '420px',
      width: '100%',
    },
    rightContent: {
      width: '160px',
      height: '40px',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    menuWrap: {
      position: 'relative',
      display: 'inline-flex',
    },
    menuPanel: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '8px',
      minWidth: '160px',
      border: '1px solid #e4e7ec',
      borderRadius: '12px',
      background: '#fff',
      boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
      zIndex: 50,
      padding: '6px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    menuItem: {
      border: 'none',
      background: '#fff',
      textAlign: 'left',
      padding: '8px 12px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 600,
      color: '#1f2937',
      cursor: 'pointer',
    },
    menuItemDisabled: {
      color: '#98a2b3',
      cursor: 'not-allowed',
    },
    buttonBase: {
      backgroundColor: '#005FFF',
      color: '#fff',
    },
    addButton: {
      background: '#fff',
      color: '#2f343a',
      border: '1px solid #e5e7eb',
      borderRadius: '999px',
      padding: '8px 22px',
      fontWeight: 600,
    },
    manageButton: {
      background: 'linear-gradient(180deg, #3b82ff 0%, #2563eb 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '999px',
      padding: '8px 26px',
      fontWeight: 600,
      boxShadow: '0 6px 14px rgba(37, 99, 235, 0.28)',
    },
    iconButton: {
      width: '40px',
      height: '40px',
      padding: 0,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconPlainButton: {
      border: '1px solid #d0d5dd',
      background: '#fff',
      color: '#667085',
    },
    buttonIcon: {
      fontSize: '16px',
      lineHeight: 1,
    },
  };

  const handleManageFamily = () => {
    console.log(selectContactDetails, selectedFamilyGroup);
    const familyGroupId = selectedFamilyGroup.family_group_Id;
    const newSelectedMembers = selectContactDetails.map((contact) => ({
      contact_Id: contact.contact_Contact_Id,
      type: contact.contact_Type || 'MAIN',
    }));

    const payload = {
      inputData: {
        family_group_Id: familyGroupId,
        members: newSelectedMembers,
      },
    };

    dispatch(manageFamily(payload))
      .then(({ payload }) => {
        if (payload?.status === 'success') {
          toastMessage('success', payload?.msg || 'Family group updated successfully.');
          // setManageModalVisible(false);
          // fetchContactData();
          setSelectContactDetails([]);
          setManageModalVisible(false);
          fetchContactData();
        } else {
          // throw new Error(payload?.msg || 'Failed to update family group.');
          toastMessage('error', payload?.msg || 'Failed to update family group.');
        }
      })
      .catch((error) => {
        toastMessage('error', error?.message || 'Failed to update family group.');
      });
  };

  return (
    <>
      <ToastContainer />
      <div style={pageHeaderStyles.container}>
        <div className="breadcrumb-header justify-content-between  align-items-center" style={{ marginBottom: '30px' }}>
          <div className="left-content">
            <span className="main-content-title mg-b-0 mg-b-lg-1 d-block">{pageTitle}</span>
            <small>{pageSubTitle}</small>
          </div>
          <div
            className="right-content"
            ref={rightContentRef}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <PermissionGate permissions={['contact.create', 'contact.all']}>
              <CustomButton title="Add New Contact" onClick={openAddModal} style={pageHeaderStyles.addButton}>
                <span>
                  Add New Contact <span style={{ marginLeft: 6 }}>+</span>
                </span>
              </CustomButton>
            </PermissionGate>

            <PermissionGate permissions={['contact.update', 'contact.all']}>
              <CustomButton title="Manage" onClick={handleManageClick} style={pageHeaderStyles.manageButton}>
                Manage Family
              </CustomButton>
            </PermissionGate>

            {inviteEventId && (
              <CustomButton
                title="Send Invite"
                onClick={handleSendInvite}
                loading={isInviteSending}
                style={pageHeaderStyles.inviteButton}
              />
            )}

            <PermissionGate permissions={['contact.create', 'contact.all']}>
              <div style={pageHeaderStyles.menuWrap}>
                <button
                  type="button"
                  aria-label="More actions"
                  onClick={() => setOpenMenuIndex(openMenuIndex === 0 ? null : 0)}
                  style={{
                    ...pageHeaderStyles.iconButton,
                    ...pageHeaderStyles.iconPlainButton,
                  }}
                >
                  <i className="fe fe-more-vertical" style={pageHeaderStyles.buttonIcon} />
                </button>

                {openMenuIndex === 0 && (
                  <div style={pageHeaderStyles.menuPanel}>
                    <button
                      type="button"
                      style={pageHeaderStyles.menuItem}
                      onClick={() => {
                        handleImportClick();
                        setOpenMenuIndex(null);
                      }}
                    >
                      Import
                    </button>

                    <button
                      type="button"
                      style={{
                        ...pageHeaderStyles.menuItem,
                        ...(isExporting ? pageHeaderStyles.menuItemDisabled : {}),
                      }}
                      onClick={() => {
                        if (isExporting) return;
                        handleExportClick();
                        setOpenMenuIndex(null);
                      }}
                      disabled={isExporting}
                    >
                      {isExporting ? 'Exporting...' : 'Export'}
                    </button>
                  </div>
                )}
              </div>
            </PermissionGate>
          </div>
        </div>

        {(searchFieldPlaceholder || (Array.isArray(filterIcon) && filterIcon.length > 0)) && (
          <div className="breadcrumb-header justify-content-between align-items-center">
            {searchFieldPlaceholder && (
              <div className="left-content" style={pageHeaderStyles.leftContent}>
                <div style={pageHeaderStyles.searchWrapper}>
                  <Form.Control
                    type="text"
                    className="form-control rounded-pill"
                    style={pageHeaderStyles.searchInput}
                    placeholder={searchFieldPlaceholder}
                    value={searchValue ?? ''}
                    onChange={handleSearchChange}
                  />
                  <span className="input-group-text bg-white border-0">
                    <i className="si si-magnifier" style={pageHeaderStyles.searchIcon}></i>
                  </span>
                </div>
              </div>
            )}

            {Array.isArray(filterIcon) && filterIcon.length > 0 && (
              <div style={pageHeaderStyles.rightContent}>
                {filterIcon.map((icon, index) => (
                  <IconBox key={`${icon.iconName}-${index}`} iconName={icon.iconName} onClick={icon?.clickAction} />
                ))}
              </div>
            )}
          </div>
        )}
        {activeFilterBadges.length > 0 && (
          <div className="contacts-active-filters">
            <span className="contacts-active-filters-label">Applied Filters:</span>
            {activeFilterBadges.map((badge, index) => (
              <span key={`${badge}-${index}`} className="contacts-active-filter-chip">
                {badge}
              </span>
            ))}
            <button type="button" className="contacts-active-filter-clear" onClick={clearAllFilters}>
              Clear All
            </button>
          </div>
        )}

        <DataTable
          columns={columns}
          data={data}
          actions={actions}
          tableClassName="contacts-table"
          actionsHeaderLabel="Action"
          onSorting={handleSort}
          sortingState={{ key: params.sorting?.Key, order: params.sorting?.value }}
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
          footerLeftContent={`${selectedContacts.length} of ${data.length} row(s) selected.`}
        />
      </div>

      <ModalWrapper
        visible={modalVisible}
        onClose={closeModal}
        modalTitle={isEditMode ? 'Edit Contact' : 'Add New Contact'}
        dialogClassName="role-form-modal-dialog"
      >
        {isEditDataLoading ? (
          <div className="contacts-view-loading">Loading contact...</div>
        ) : (
          <AddEditForm
            key={formData?.contact_Contact_Id || 'new-contact'}
            saveData={handleSave}
            closeModal={closeModal}
            formPayload={formData}
            isSaveDisabled={isSaveDisabled}
            isEdit={isEditMode}
          />
        )}
      </ModalWrapper>

      <ModalWrapper
        visible={manageModalVisible}
        onClose={closeManageModal}
        modalTitle={
          <div className="contacts-manage-modal-title">
            <span className="contacts-manage-modal-heading">Manage Family</span>
            <span className="contacts-manage-modal-subtitle">You have already selected contact</span>
          </div>
        }
        dialogClassName="contacts-manage-modal-dialog"
      >
        <div className="contacts-manage-modal-body">
          <div className="contacts-family-search">
            {selectedFamilyGroup && (
              <span className="contacts-family-chip">
                {selectedFamilyGroup?.family_group_Name}
                <button
                  type="button"
                  className="contacts-family-chip-close"
                  onClick={() => setSelectedFamilyGroup(null)}
                  aria-label="Clear selected family group"
                >
                  x
                </button>
              </span>
            )}
            <input
              type="text"
              className="contacts-family-search-input"
              placeholder="Search family group"
              value={familySearchValue}
              onChange={(e) => setFamilySearchValue(e.target.value)}
            />
            <span className="contacts-family-search-icon">
              <i className="fe fe-search" />
            </span>
          </div>

          <div className="contacts-family-list">
            {familyGroupsLoading && <div className="contacts-family-empty">Loading family groups...</div>}
            {!familyGroupsLoading && filteredFamilyGroups.length === 0 && (
              <div className="contacts-family-empty">No family groups found.</div>
            )}
            {!familyGroupsLoading &&
              filteredFamilyGroups.map((group) => (
                <label
                  key={group.family_group_Id || group.family_group_Name}
                  className={`contacts-family-item ${selectedFamilyGroup?.family_group_Id === group.family_group_Id ? 'is-selected' : ''
                    }`}
                >
                  <input
                    type="radio"
                    name="familyGroup"
                    checked={selectedFamilyGroup?.family_group_Id === group.family_group_Id}
                    onChange={() => setSelectedFamilyGroup(group)}
                  />
                  <span className="contacts-family-label">{group.family_group_Name}</span>
                </label>
              ))}
          </div>

          <div className="contacts-manage-modal-footer">
            <CustomButton title="Continue" onClick={handleManageFamily} />
          </div>
        </div>
      </ModalWrapper>

      <ModalWrapper
        visible={viewModalVisible}
        onClose={closeViewModal}
        modalTitle="Contact Details"
        dialogClassName="contacts-view-modal-dialog"
      >
        {isViewDetailsLoading ? (
          <div className="contacts-view-loading">Loading contact details...</div>
        ) : (
          <ContactDetailsPanel data={viewContactDetails} />
        )}
      </ModalWrapper>

      <ContactFilterModal
        visible={filterModalVisible}
        onClose={closeFilterModal}
        onApply={handleApplyFilter}
        initialFilter={params.filter}
      />
    </>
  );
};

export default Contacts;
