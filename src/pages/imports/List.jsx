import { useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../pagecomponents/Common/PageWrapper';
import DataTable from '../../pagecomponents/Common/DataTable';
import DeleteConfirmationModal from '../../pagecomponents/Common/DeleteConfirmationModal';
import ImportEmptyState from './ImportEmptyState';
import { postReq } from '../../helpers/api';
import { baseApiUrl } from '../../helpers/constants';
import { toastMessage } from '../../helpers/utility';
import './style.css';
import { red } from '@material-ui/core/colors';

const STATUS_CARD_CONFIG = [
  { key: 'unique', label: 'Valid Contact' },
  { key: 'duplicate', label: 'Duplicate Contact' },
  { key: 'error', label: 'Validation Error' },
];

const DUPLICATE_HANDLING_OPTIONS = [
  { value: 'skip', label: 'Skip Duplicates' },
  { value: 'merge', label: 'Merge with existing' },
  { value: 'create-duplicate', label: 'Import all (create duplicate)' },
];

const IMPORT_ACTION_ENDPOINTS = Object.freeze({
  IMPORT_UNIQUE: '/contact-imports/import-unique',
  IMPORT_DUPLICATE_WITHOUT_MERGE: '/contact-imports/import-duplicate-without-merge',
  MERGE_DUPLICATE_WITH_PARENT: '/contact-imports/merge-duplicate-with-parent',
  SKIP_DUPLICATE: '/contact-imports/skip-duplicate',
  CLEAR_INVALID: '/contact-imports/clear-invalid',
  SOFT_DELETE_DUPLICATE: '/contact-imports/soft-delete-duplicate',
  CLEAR_ALL: '/contact-imports/clear-all',
});

const INIT_PARAMS = {
  page: 1,
  limit: 5,
};

const IMPORT_ROW_STATUS = Object.freeze({
  UNIQUE: 'unique',
  DUPLICATE: 'duplicate',
  ERROR: 'error',
});

const VALID_ROW_STATUSES = Object.values(IMPORT_ROW_STATUS);
const IMPORT_PREVIEW_TABLE_ID = 'import-preview-table';
const DUPLICATE_HANDLING_HELPER_ID = 'duplicate-handling-helper';
console.log(process.env.REACT_APP_Env, 'process.env.REACT_APP_Env');
const IS_DEV_ENV = process.env.REACT_APP_IS_DEV_Env;

console.log(IS_DEV_ENV, 'IS_DEV_ENV', process.env.REACT_APP_Env, 'process.env.REACT_APP_Env');

const toDisplayText = (value) => {
  const text = String(value || '').trim();
  return text || '-';
};

const getNormalizedRowStatus = (value, fallback = IMPORT_ROW_STATUS.UNIQUE) => {
  const normalizedValue = String(value || '')
    .trim()
    .toLowerCase();
  return VALID_ROW_STATUSES.includes(normalizedValue) ? normalizedValue : fallback;
};

const mapContactRow = (contact = {}) => ({
  contact_Id: contact?.contact_Contact_Id ?? contact?.contact_Id ?? null,
  duplicate_contact_Id: contact?.duplicate_contact_Id ?? null,
  salutation: toDisplayText(contact?.salutation),
  first_name: toDisplayText(contact?.first_name),
  last_name: toDisplayText(contact?.last_name),
  spouse_name: toDisplayText(contact?.spouse_name),
  spouse_title: toDisplayText(contact?.spouse_title),
  address: toDisplayText(contact?.address),
  city: toDisplayText(contact?.city),
  pin_code: toDisplayText(contact?.pin_code),
  phone: toDisplayText(contact?.phone || contact?.mobile),
  duplicate_basis: toDisplayText(contact?.duplicate_basis),
});

const getStatusLabel = (status) => {
  const normalizedStatus = getNormalizedRowStatus(status);
  if (normalizedStatus === IMPORT_ROW_STATUS.UNIQUE) return 'Valid contact';
  if (normalizedStatus === IMPORT_ROW_STATUS.DUPLICATE) return 'Duplicate contact';
  return 'Validation error';
};

const statusToCardTitle = {
  unique: 'Valid Contacts',
  duplicate: 'Duplicate Contacts',
  error: 'Validation Error Contacts',
};

const statusToButtonLabel = {
  unique: 'Import All',
  duplicate: {
    skip: 'Skip',
    merge: 'Merge',
    'create-duplicate': 'Import All',
  },
  error: 'Fix',
};

const ImportList = () => {
  const navigate = useNavigate();
  const [params, setParams] = useState(INIT_PARAMS);
  const [showAll, setShowAll] = useState(true);
  const [statusFilter, setStatusFilter] = useState(null);
  const [duplicateHandling, setDuplicateHandling] = useState('skip');
  const [summary, setSummary] = useState({ unique: 0, duplicate: 0, error: 0 });
  const [groups, setGroups] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [duplicateRowPendingDelete, setDuplicateRowPendingDelete] = useState(null);
  const [isDeletingDuplicateRow, setIsDeletingDuplicateRow] = useState(false);
  const [mergeSelectionMap, setMergeSelectionMap] = useState({});
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const fetchDupList = useCallback(async () => {
    setIsLoading(true);
    setLiveAnnouncement('Loading import preview data.');
    try {
      const payload = {
        inputData: {
          filter: {
            selectAll: showAll,
            ...(showAll || !statusFilter ? {} : { status: statusFilter }),
          },
          pagination: {
            page: params.page,
            limit: params.limit,
          },
        },
      };

      const response = await postReq(`${baseApiUrl}/contact-imports/dup-list`, payload);

      if (response?.status !== 'success') {
        throw new Error(response?.msg || 'Failed to fetch import preview.');
      }

      setSummary(response?.data?.summary || { unique: 0, duplicate: 0, error: 0 });
      setGroups(Array.isArray(response?.data?.data) ? response.data.data : []);
      setTotalRecords(Number(response?.pagination?.total || 0));
      const refreshedCount = Number(response?.pagination?.total || 0);
      setLiveAnnouncement(`Import preview updated. ${refreshedCount} records available.`);
    } catch (error) {
      toastMessage('error', error?.message || 'Failed to fetch import preview.');
      setGroups([]);
      setTotalRecords(0);
      setLiveAnnouncement('Failed to load import preview.');
    } finally {
      setIsLoading(false);
    }
  }, [params.limit, params.page, showAll, statusFilter]);

  useEffect(() => {
    fetchDupList();
  }, [fetchDupList]);

  const rows = useMemo(() => {
    const flattenedRows = [];

    groups.forEach((group, groupIndex) => {
      const rowStatus = getNormalizedRowStatus(group?.row_status, statusFilter || IMPORT_ROW_STATUS.UNIQUE);
      const keySeed =
        group?.original_contact?.contact_Contact_Id ?? group?.contact?.contact_Contact_Id ?? `group-${groupIndex}`;
      const baseKey = `${groupIndex}-${keySeed}`;

      if (rowStatus === IMPORT_ROW_STATUS.DUPLICATE && group?.original_contact) {
        const parentContactId = group?.original_contact?.contact_Contact_Id ?? null;
        flattenedRows.push({
          ...mapContactRow(group.original_contact),
          row_status: rowStatus,
          row_type: 'parent',
          parent_contact_Id: parentContactId,
          _rowKey: `${baseKey}-parent`,
        });

        const duplicates = Array.isArray(group?.duplicates) ? group.duplicates : [];
        duplicates.forEach((duplicate, duplicateIndex) => {
          const duplicateContactId = duplicate?.duplicate_contact_Id ?? duplicate?.contact_Contact_Id ?? null;
          flattenedRows.push({
            ...mapContactRow(duplicate),
            row_status: rowStatus,
            row_type: 'duplicate',
            parent_contact_Id: parentContactId,
            duplicate_contact_Id: duplicateContactId,
            error_reason: toDisplayText(group?.error_reason),
            _rowKey: `${baseKey}-dup-${duplicateContactId || duplicateIndex}`,
          });
        });

        return;
      }

      const singleContact = group?.contact || group?.original_contact;
      if (!singleContact) return;

      flattenedRows.push({
        ...mapContactRow(singleContact),
        row_status: rowStatus,
        row_type: 'single',
        error_reason: toDisplayText(group?.error_reason),
        _rowKey: `${baseKey}-single-${singleContact?.contact_Contact_Id || groupIndex}`,
      });
    });

    return flattenedRows;
  }, [groups, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(totalRecords / params.limit));
  const activeStatus = showAll ? null : statusFilter;
  const showMergeCheckboxes = activeStatus === IMPORT_ROW_STATUS.DUPLICATE && duplicateHandling === 'merge';
  const summaryCountMap = useMemo(
    () => ({
      unique: Number(summary?.unique || 0),
      duplicate: Number(summary?.duplicate || 0),
      error: Number(summary?.error || 0),
    }),
    [summary],
  );
  const totalSummaryCount = summaryCountMap.unique + summaryCountMap.duplicate + summaryCountMap.error;
  const hasRecordsInOtherTabs = useMemo(() => {
    if (!activeStatus) return false;
    return STATUS_CARD_CONFIG.some((card) => card.key !== activeStatus && summaryCountMap[card.key] > 0);
  }, [activeStatus, summaryCountMap]);
  const isAllResolvedState = !isLoading && rows.length === 0 && totalSummaryCount === 0;
  const isFilteredEmptyState = !isLoading && rows.length === 0 && Boolean(activeStatus) && hasRecordsInOtherTabs;
  const shouldShowImportEmptyState = isAllResolvedState || isFilteredEmptyState;

  const handleAddAnotherFile = useCallback(() => {
    navigate(`${process.env.PUBLIC_URL}/import-contacts`);
  }, [navigate]);

  const handleTryOtherTabs = useCallback(() => {
    setShowAll(true);
    setStatusFilter(null);
    setParams((prev) => ({ ...prev, page: 1 }));
  }, []);

  useEffect(() => {
    if (!isLoading && rows.length === 0 && totalRecords > 0 && params.page > 1) {
      setParams((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [isLoading, params.page, rows.length, totalRecords]);

  useEffect(() => {
    if (!showMergeCheckboxes) {
      setMergeSelectionMap((prev) => (Object.keys(prev).length ? {} : prev));
      return;
    }

    setMergeSelectionMap((prev) => {
      const next = {};
      rows.forEach((row) => {
        if (row?.row_type === 'duplicate') {
          next[row._rowKey] = prev[row._rowKey] ?? false;
        }
      });
      return next;
    });
  }, [rows, showMergeCheckboxes]);

  const sectionTitle = activeStatus ? statusToCardTitle[activeStatus] || 'All Contacts' : 'All Contacts';

  const primaryButtonLabel = useMemo(() => {
    if (!activeStatus) return 'Import All';
    if (activeStatus !== 'duplicate') return statusToButtonLabel[activeStatus] || 'Import';
    return statusToButtonLabel.duplicate[duplicateHandling] || 'Import';
  }, [activeStatus, duplicateHandling]);

  const mergeCandidateRows = useMemo(() => rows.filter((row) => row?.row_type === 'duplicate'), [rows]);
  const selectedMergeRows = useMemo(
    () => mergeCandidateRows.filter((row) => mergeSelectionMap[row._rowKey]),
    [mergeCandidateRows, mergeSelectionMap],
  );
  const selectedMergeCount = useMemo(() => selectedMergeRows.length, [selectedMergeRows]);
  const selectedMergeParentCount = useMemo(() => {
    const selectedParentIds = selectedMergeRows
      .map((row) => row?.parent_contact_Id)
      .filter((id) => id !== null && id !== undefined);
    return new Set(selectedParentIds).size;
  }, [selectedMergeRows]);
  const mergeSelectionSummary = useMemo(() => {
    const selectedLabel = selectedMergeCount === 1 ? 'contact' : 'contacts';
    const parentLabel = selectedMergeParentCount === 1 ? 'contact' : 'contacts';
    return `${selectedMergeCount} ${selectedLabel} selected to merge with ${selectedMergeParentCount} ${parentLabel}.`;
  }, [selectedMergeCount, selectedMergeParentCount]);

  const duplicateHelperText = useMemo(() => {
    if (duplicateHandling === 'skip')
      return 'Ignores duplicate records and imports only the entries you choose to keep.';
    if (duplicateHandling === 'merge') return 'Merges selected duplicate records into the matched parent contact.';
    return 'Imports all duplicate entries as separate contacts.';
  }, [duplicateHandling]);

  const activeActionEndpoint = useMemo(() => {
    if (activeStatus === IMPORT_ROW_STATUS.ERROR) {
      return IMPORT_ACTION_ENDPOINTS.CLEAR_INVALID;
    }

    if (activeStatus === IMPORT_ROW_STATUS.DUPLICATE) {
      if (duplicateHandling === 'skip') {
        return IMPORT_ACTION_ENDPOINTS.SKIP_DUPLICATE;
      }
      if (duplicateHandling === 'create-duplicate') {
        return IMPORT_ACTION_ENDPOINTS.IMPORT_DUPLICATE_WITHOUT_MERGE;
      }
      return IMPORT_ACTION_ENDPOINTS.MERGE_DUPLICATE_WITH_PARENT;
    }

    return IMPORT_ACTION_ENDPOINTS.IMPORT_UNIQUE;
  }, [activeStatus, duplicateHandling]);

  const handlePrimaryAction = useCallback(async () => {
    if (isSubmittingAction) return;

    if (!activeActionEndpoint) {
      toastMessage('error', 'No action is configured for this selection.');
      setLiveAnnouncement('No action is configured for this selection.');
      return;
    }

    let requestPayload = null;
    if (
      activeStatus === IMPORT_ROW_STATUS.DUPLICATE &&
      duplicateHandling === 'merge' &&
      activeActionEndpoint === IMPORT_ACTION_ENDPOINTS.MERGE_DUPLICATE_WITH_PARENT
    ) {
      const groupedItems = {};

      selectedMergeRows.forEach((row) => {
        const parentId = Number(row?.parent_contact_Id || 0);
        const duplicateId = Number(row?.duplicate_contact_Id || 0);
        if (!Number.isFinite(duplicateId) || duplicateId <= 0) return;

        const key = parentId > 0 ? String(parentId) : `new-parent-${duplicateId}`;
        if (!groupedItems[key]) {
          groupedItems[key] = {
            parent_contact_Id: parentId > 0 ? parentId : 0,
            children: [],
          };
        }

        if (!groupedItems[key].children.includes(duplicateId)) {
          groupedItems[key].children.push(duplicateId);
        }
      });

      const items = Object.values(groupedItems).filter((item) => item.children.length > 0);
      if (!items.length) {
        toastMessage('error', 'Select at least one duplicate row to merge.');
        setLiveAnnouncement('Select at least one duplicate row to merge.');
        return;
      }

      requestPayload = {
        inputData: {
          items,
        },
      };
    }

    setIsSubmittingAction(true);
    setLiveAnnouncement('Processing import action.');
    try {
      const response = requestPayload
        ? await postReq(`${baseApiUrl}${activeActionEndpoint}`, requestPayload)
        : await postReq(`${baseApiUrl}${activeActionEndpoint}`);

      if (response?.status !== 'success') {
        throw new Error(response?.msg || 'Failed to process import.');
      }

      toastMessage('success', response?.msg || 'Import processed successfully.');
      await fetchDupList();
      setLiveAnnouncement(`${response?.msg || 'Import processed successfully.'} List refreshed.`);
    } catch (error) {
      toastMessage('error', error?.message || 'Failed to process import.');
      setLiveAnnouncement(error?.message || 'Failed to process import.');
    } finally {
      setIsSubmittingAction(false);
    }
  }, [
    activeActionEndpoint,
    activeStatus,
    duplicateHandling,
    fetchDupList,
    isSubmittingAction,
    selectedMergeRows,
  ]);

  const handleMergeRowToggle = useCallback((rowKey) => {
    setMergeSelectionMap((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  }, []);

  const handleMergeSelectAll = useCallback(() => {
    if (!mergeCandidateRows.length) return;
    const nextSelection = {};
    mergeCandidateRows.forEach((row) => {
      nextSelection[row._rowKey] = true;
    });
    setMergeSelectionMap(nextSelection);
  }, [mergeCandidateRows]);

  const handleMergeUnselectAll = useCallback(() => {
    if (!mergeCandidateRows.length) return;
    const nextSelection = {};
    mergeCandidateRows.forEach((row) => {
      nextSelection[row._rowKey] = false;
    });
    setMergeSelectionMap(nextSelection);
  }, [mergeCandidateRows]);

  const canSoftDeleteDuplicateRow = useCallback((row) => {
    const duplicateId = Number(row?.duplicate_contact_Id || 0);
    return Number.isFinite(duplicateId) && duplicateId > 0;
  }, []);

  const closeDuplicateDeleteModal = useCallback(() => {
    if (isDeletingDuplicateRow) return;
    setDuplicateRowPendingDelete(null);
  }, [isDeletingDuplicateRow]);

  const openDuplicateDeleteModal = useCallback(
    (row) => {
      if (!canSoftDeleteDuplicateRow(row) || isDeletingDuplicateRow) return;
      setDuplicateRowPendingDelete(row);
    },
    [canSoftDeleteDuplicateRow, isDeletingDuplicateRow],
  );

  const deletePendingDuplicateRow = useCallback(async () => {
    const duplicateId = Number(duplicateRowPendingDelete?.duplicate_contact_Id || 0);
    if (!Number.isFinite(duplicateId) || duplicateId <= 0) {
      toastMessage('error', 'Duplicate contact id not found.');
      setDuplicateRowPendingDelete(null);
      return;
    }

    setIsDeletingDuplicateRow(true);
    try {
      const response = await postReq(`${baseApiUrl}${IMPORT_ACTION_ENDPOINTS.SOFT_DELETE_DUPLICATE}`, {
        inputData: {
          duplicate_contact_Id: duplicateId,
        },
      });

      if (response?.status !== 'success') {
        throw new Error(response?.msg || 'Failed to delete duplicate contact.');
      }

      toastMessage('success', response?.msg || 'Duplicate contact deleted successfully.');
      setDuplicateRowPendingDelete(null);
      await fetchDupList();
      setLiveAnnouncement('Duplicate contact deleted and list refreshed.');
    } catch (error) {
      toastMessage('error', error?.message || 'Failed to delete duplicate contact.');
    } finally {
      setIsDeletingDuplicateRow(false);
    }
  }, [duplicateRowPendingDelete, fetchDupList]);

  const handleClearAllDuplicates = useCallback(async () => {
    if (!IS_DEV_ENV) return;
    const confirmed = window.confirm('Clear all duplicate queue records? This cannot be undone.');
    if (!confirmed) return;

    setIsSubmittingAction(true);
    setLiveAnnouncement('Clearing all duplicate queue records.');
    try {
      const response = await postReq(`${baseApiUrl}${IMPORT_ACTION_ENDPOINTS.CLEAR_ALL}`);
      if (response?.status !== 'success') {
        throw new Error(response?.msg || 'Failed to clear duplicate queue.');
      }
      toastMessage('success', response?.msg || 'Duplicate queue cleared.');
      await fetchDupList();
      setLiveAnnouncement('Duplicate queue cleared and list refreshed.');
    } catch (error) {
      toastMessage('error', error?.message || 'Failed to clear duplicate queue.');
      setLiveAnnouncement(error?.message || 'Failed to clear duplicate queue.');
    } finally {
      setIsSubmittingAction(false);
    }
  }, [fetchDupList]);

  const columns = useMemo(() => {
    const baseColumns = [
      {
        label: 'Status',
        accessor: 'row_status',
        width: '9%',
        headerClassName: 'text-center',
        cellClassName: 'text-center',
        render: (value) => {
          const statusLabel = getStatusLabel(value);
          return (
            <span className="import-status-cell">
              <span
                className={`import-status-indicator status-${String(value || '').toLowerCase()}`}
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">{statusLabel}</span>
            </span>
          );
        },
      },
      {
        label: 'Record',
        accessor: 'record_type',
        width: '10%',
        render: (_, row) => getRecordTypeLabel(row),
      },
      {
        label: 'Basis',
        accessor: 'duplicate_basis',
        width: '16%',
        render: (value, row) => {
          if (row?.row_type === 'parent') return '-';
          return toDisplayText(value);
        },
      },
      {
        label: 'ST',
        accessor: 'salutation',
        width: '10%',
      },
      {
        label: 'Name',
        accessor: 'first_name',
        width: '10%',
      },
      {
        label: 'Title',
        accessor: 'last_name',
        width: '9%',
      },
      {
        label: 'Spouse Name',
        accessor: 'spouse_name',
        width: '12%',
      },
      {
        label: 'Title',
        accessor: 'spouse_title',
        width: '9%',
      },
      {
        label: 'Address',
        accessor: 'address',
        width: '20%',
      },
      {
        label: 'City',
        accessor: 'city',
        width: '9%',
      },
      {
        label: 'Pin',
        accessor: 'pin_code',
        width: '7%',
      },
      {
        label: 'Mobile',
        accessor: 'phone',
        width: '10%',
      },
      {
        label: 'Action',
        accessor: 'duplicate_row_action',
        width: '10%',
        headerClassName: 'text-center',
        cellClassName: 'text-center',
        render: (_, row) => {
          if (!canSoftDeleteDuplicateRow(row)) return null;
          return (
            <div
              // className="import-duplicate-delete-btn"
              onClick={() => openDuplicateDeleteModal(row)}
              style={{ border: 'none', color: 'red' }}
              disabled={isDeletingDuplicateRow}
              aria-label={`Delete duplicate contact ${row?.first_name || ''} ${row?.last_name || ''}`}
            >
              <i className="fe fe-trash-2" aria-hidden="true"></i>
            </div>
          );
        },
      },
    ];

    if (!showMergeCheckboxes) return baseColumns;

    return [
      {
        label: 'Select',
        accessor: 'merge_select',
        width: '8%',
        headerClassName: 'text-center',
        cellClassName: 'text-center',
        render: (_, row) => {
          if (row?.row_type !== 'duplicate') return null;
          const isSelected = Boolean(mergeSelectionMap[row._rowKey]);
          return (
            <div className={`import-merge-cell ${isSelected ? 'is-selected' : 'is-unselected'}`}>
              <input
                type="checkbox"
                className="import-merge-checkbox"
                checked={isSelected}
                onChange={() => handleMergeRowToggle(row._rowKey)}
                aria-label={`Select ${row?.first_name || 'contact'} ${row?.last_name || ''} to merge with parent contact`}
              />
              <span className={`import-merge-selected-pill ${isSelected ? 'is-visible' : 'is-hidden'}`}>
                {isSelected ? 'Selected' : 'Not selected'}
              </span>
            </div>
          );
        },
      },
      ...baseColumns,
    ];
  }, [
    canSoftDeleteDuplicateRow,
    handleMergeRowToggle,
    isDeletingDuplicateRow,
    mergeSelectionMap,
    openDuplicateDeleteModal,
    showMergeCheckboxes,
  ]);

  const getRowClassName = (row) => {
    if (row?.row_status === 'duplicate' && row?.row_type === 'parent')
      return 'import-preview-row import-preview-row-parent';
    if (row?.row_status === 'duplicate') return 'import-preview-row import-preview-row-duplicate';
    if (row?.row_status === 'error') return 'import-preview-row import-preview-row-error';
    if (row?.row_status === 'unique') return 'import-preview-row import-preview-row-unique';
    return 'import-preview-row';
  };

  const handleCardClick = (status) => {
    setShowAll(false);
    setStatusFilter(status);
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const handleShowAllToggle = (event) => {
    const isChecked = event.target.checked;
    setShowAll(isChecked);
    setStatusFilter(isChecked ? null : statusFilter || 'unique');
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const handleRowsPerPageChange = (limit) => {
    setParams((prev) => ({ ...prev, page: 1, limit }));
  };

  const handlePageChange = (page) => {
    setParams((prev) => ({ ...prev, page }));
  };

  return (
    <>
      <ToastContainer />
      <div className="import-preview-page">
        <PageWrapper
          pageName="Validation & Preview"
          pageSubTitle="Review and resolve any issues before importing"
          filterIcon={[]}
        >
          <div className="import-preview-topbar">
            <Form.Check
              type="checkbox"
              id="import-show-all"
              label="Show All"
              checked={showAll}
              onChange={handleShowAllToggle}
            />

            {IS_DEV_ENV && (
              <button
                type="button"
                className="import-footer-btn import-footer-btn-danger"
                style={{ marginLeft: '1rem' }}
                onClick={handleClearAllDuplicates}
                disabled={isSubmittingAction}
              >
                Clear All (Dev)
              </button>
            )}
          </div>

          <p className="visually-hidden" role="status" aria-live="polite">
            {liveAnnouncement}
          </p>

          <div className="import-summary-grid">
            {STATUS_CARD_CONFIG.map((card) => {
              const isActive = !showAll && activeStatus === card.key;
              const count = Number(summary?.[card.key] || 0);

              return (
                <button
                  key={card.key}
                  type="button"
                  className={`import-summary-card ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleCardClick(card.key)}
                >
                  <div className="import-summary-card-title">{card.label}</div>
                  <div className="import-summary-card-count">{String(count).padStart(2, '0')}</div>
                  <div className="import-summary-card-manage">Manage</div>
                </button>
              );
            })}
          </div>

          {activeStatus === 'duplicate' && (
            <div className="import-duplicate-handling">
              <h4 className="import-duplicate-handling__title">Duplicate handling</h4>
              <div className="import-duplicate-handling__card">
                <label htmlFor="duplicate-handling-select">How should we handle duplicate contacts?</label>
                <Form.Select
                  id="duplicate-handling-select"
                  value={duplicateHandling}
                  aria-describedby={DUPLICATE_HANDLING_HELPER_ID}
                  onChange={(event) => setDuplicateHandling(event.target.value)}
                >
                  {DUPLICATE_HANDLING_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
                <small id={DUPLICATE_HANDLING_HELPER_ID}>{duplicateHelperText}</small>
              </div>
              {showMergeCheckboxes && (
                <div className="import-merge-selection-panel">
                  <p className="import-merge-selection-summary" role="status" aria-live="polite">
                    {mergeSelectionSummary}
                  </p>
                  <div className="import-merge-selection-actions">
                    <button
                      type="button"
                      className="import-merge-toggle-btn"
                      onClick={handleMergeSelectAll}
                      aria-controls={IMPORT_PREVIEW_TABLE_ID}
                      disabled={!mergeCandidateRows.length || selectedMergeCount === mergeCandidateRows.length}
                    >
                      Check All
                    </button>
                    <button
                      type="button"
                      className="import-merge-toggle-btn"
                      onClick={handleMergeUnselectAll}
                      aria-controls={IMPORT_PREVIEW_TABLE_ID}
                      disabled={!mergeCandidateRows.length || selectedMergeCount === 0}
                    >
                      Unselect All
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <h3 className="import-preview-section-title">{sectionTitle}</h3>

          {shouldShowImportEmptyState ? (
            <ImportEmptyState
              mode={isFilteredEmptyState ? 'filtered-empty' : 'all-resolved'}
              activeStatus={activeStatus}
              onTryOtherTabs={handleTryOtherTabs}
              onAddAnotherFile={handleAddAnotherFile}
            />
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              tableClassName="import-dup-list-table"
              tableId={IMPORT_PREVIEW_TABLE_ID}
              tableAriaLabel={`${sectionTitle} import preview table`}
              tableCaption={`${sectionTitle}. ${rows.length} visible rows.`}
              tableAriaBusy={isLoading}
              currentPage={params.page}
              totalPages={totalPages}
              rowsPerPage={params.limit}
              updateRowsPerPage={handleRowsPerPageChange}
              onPageChange={handlePageChange}
              loader={isLoading}
              showRowsPerPageTop={false}
              showPagination
              alwaysShowPagination
              paginationVariant="compact"
              rowsPerPageLabel="Rows per page"
              footerLeftContent={showMergeCheckboxes ? mergeSelectionSummary : null}
              rowClassName={getRowClassName}
              rowKeyAccessor="_rowKey"
            />
          )}

          {!shouldShowImportEmptyState && (
            <div className="import-preview-footer">
              <button
                type="button"
                className="import-footer-btn import-footer-btn-secondary"
                onClick={() => navigate(`${process.env.PUBLIC_URL}/import-contacts`)}
              >
                Back
              </button>

              <button
                type="button"
                className="import-footer-btn import-footer-btn-primary"
                onClick={handlePrimaryAction}
                disabled={isSubmittingAction || (showMergeCheckboxes && selectedMergeCount === 0)}
              >
                {isSubmittingAction ? 'Processing...' : primaryButtonLabel}
              </button>
            </div>
          )}
        </PageWrapper>
      </div>
      <DeleteConfirmationModal
        show={Boolean(duplicateRowPendingDelete)}
        onHide={closeDuplicateDeleteModal}
        onConfirm={deletePendingDuplicateRow}
        message={
          duplicateRowPendingDelete
            ? `Delete duplicate contact "${[duplicateRowPendingDelete?.first_name, duplicateRowPendingDelete?.last_name]
                .filter(Boolean)
                .join(' ')}"? This action cannot be undone.`
            : 'Delete this duplicate contact? This action cannot be undone.'
        }
      />
    </>
  );
};

const getRecordTypeLabel = (row = {}) => {
  if (row?.row_status === IMPORT_ROW_STATUS.DUPLICATE) {
    if (row?.row_type === 'parent') return 'Original';
    if (row?.row_type === 'duplicate') return 'Duplicate';
    return 'Duplicate';
  }
  if (row?.row_status === IMPORT_ROW_STATUS.ERROR) return 'Invalid';
  if (row?.row_status === IMPORT_ROW_STATUS.UNIQUE) return 'Unique';
  return '-';
};

export default ImportList;

