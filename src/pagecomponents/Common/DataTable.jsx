import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Table } from 'react-bootstrap';
import NoData from './NoData';
import Loader from './Loader';
import { checkEmpty } from '../../../src/helpers/utility';
import ActionIcon from './ActionIcon';
import TablePagination from './TablePagination';
import './DataTable.css';
import CustomButton from '../Elements/Buttons/CustomButton';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const DataTable = ({
  columns = [],
  data = [],
  onPrint,
  onEdit,
  onDelete,
  onSorting,
  sortingState,
  currentPage = 1,
  totalPages = 1,
  rowsPerPage = 10,
  pageSizeOptions = [5, 10, 15, 20, 50],
  rowsPerPageLabel = 'Rows per page',
  updateRowsPerPage,
  onPageChange,
  loader,
  actions = [],
  tableClassName = '',
  actionsHeaderLabel = 'Action',
  actionsColumnWidth = '20%',
  showRowsPerPageTop = false,
  showPagination = true,
  alwaysShowPagination = false,
  paginationVariant = 'compact',
  footerLeftContent = null,
  rowClassName,
  rowStyle,
  rowKeyAccessor,
  tableId,
  tableCaption,
  tableAriaLabel,
  tableAriaDescribedBy,
  tableAriaBusy,
}) => {
  const visibleActions = useMemo(() => actions.filter((action) => action.show !== false), [actions]);
  const lastNonEmptyDataRef = useRef([]);
  const [pendingAction, setPendingAction] = useState(null);

  const hasIncomingData = useMemo(() => !checkEmpty(data), [data]);

  const tableData = useMemo(() => {
    if (hasIncomingData) {
      lastNonEmptyDataRef.current = data;
      return data;
    }

    if (loader && !checkEmpty(lastNonEmptyDataRef.current)) {
      return lastNonEmptyDataRef.current;
    }

    return data;
  }, [data, hasIncomingData, loader]);

  const hasTableData = useMemo(() => !checkEmpty(tableData), [tableData]);
  const shouldShowInlineLoader = loader && hasTableData;
  const shouldShowStandaloneLoader = loader && !hasTableData;

  useEffect(() => {
    if (!loader && currentPage > 1 && checkEmpty(data)) {
      if (typeof onPageChange === 'function') {
        onPageChange(currentPage - 1);
      }
    }
  }, [currentPage, data, loader, onPageChange]);

  const getSortingIcon = (key) => {
    if (sortingState?.key === key) {
      return sortingState.order === 'asc' ? (
        <span className="datatable-sort-icon datatable-sort-icon--asc" aria-hidden="true">
          <i className="fe fe-chevron-up"></i>
        </span>
      ) : (
        <span className="datatable-sort-icon datatable-sort-icon--desc" aria-hidden="true">
          <i className="fe fe-chevron-down"></i>
        </span>
      );
    }

    return (
      <span className="datatable-sort-icon datatable-sort-icon--neutral" aria-hidden="true">
        <i className="fe fe-chevron-up"></i>
        <i className="fe fe-chevron-down"></i>
      </span>
    );
  };

  const resolveDeleteMessage = (action, item) => {
    if (typeof action?.confirmMessage === 'function') {
      return action.confirmMessage(item);
    }

    if (typeof action?.confirmMessage === 'string' && action.confirmMessage.trim() !== '') {
      return action.confirmMessage;
    }

    const rowLabel =
      item?.family_group_Name ||
      item?.role_Name ||
      item?.user_Name ||
      item?.event_name ||
      item?.contact_Primary_Full_Name ||
      item?.name ||
      item?.title;

    if (!checkEmpty(rowLabel)) {
      return `Are you sure you want to delete "${rowLabel}"? This action cannot be undone.`;
    }

    return 'Are you sure you want to delete this record? This action cannot be undone.';
  };

  const shouldConfirmAction = (action) => {
    if (!action || typeof action?.onClick !== 'function') {
      return false;
    }

    if (action.requiresConfirmation === false) {
      return false;
    }

    if (action.requiresConfirmation === true) {
      return true;
    }

    if (action.isDestructive || action.intent === 'delete' || action.intent === 'remove') {
      return true;
    }

    const normalizedLabel = String(action?.label || '').toLowerCase();
    return normalizedLabel.includes('delete') || normalizedLabel.includes('remove');
  };

  const handleActionClick = (action, item) => {
    if (!action || typeof action?.onClick !== 'function') {
      return;
    }

    if (shouldConfirmAction(action)) {
      setPendingAction({
        action,
        item,
        message: resolveDeleteMessage(action, item),
      });
      return;
    }

    action.onClick(item);
  };

  const closePendingAction = () => {
    setPendingAction(null);
  };

  const confirmPendingAction = () => {
    if (pendingAction?.action && typeof pendingAction.action.onClick === 'function') {
      pendingAction.action.onClick(pendingAction.item);
    }
    setPendingAction(null);
  };

  return (
    <>
      {shouldShowStandaloneLoader && <Loader />}

      {hasTableData && (
        <>
          {/* Report Table */}
          {showRowsPerPageTop && (
            <div className="d-flex">
              <label htmlFor="showRowsPerPage">Show</label>
              <select
                className=" mb-4 selectpage border me-1"
                id="showRowsPerPage"
                value={rowsPerPage}
                onChange={(e) => typeof updateRowsPerPage === 'function' && updateRowsPerPage(Number(e.target.value))}
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={`app-datatable-wrapper ${shouldShowInlineLoader ? 'is-loading' : ''}`}>
            <Table
              id={tableId}
              aria-label={tableAriaLabel}
              aria-describedby={tableAriaDescribedBy}
              aria-busy={Boolean(tableAriaBusy)}
              className={`table-bordered text-nowrap mb-0 border custom-table ${tableClassName}`}
            >
              {tableCaption ? <caption className="visually-hidden">{tableCaption}</caption> : null}

              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.accessor}
                      scope="col"
                      style={column.width ? { width: column.width } : undefined}
                      onClick={
                        column.sortable && typeof onSorting === 'function'
                          ? () => onSorting(column.accessor)
                          : undefined
                      }
                      className={`${column.sortable && typeof onSorting === 'function' ? 'cursor-pointer' : ''} ${column.headerClassName || ''}`.trim()}
                      // className={`cursor-pointer ${
                      //   column.sortable ? "text-blue-500" : "text-gray-500"
                      // }`}
                    >
                      <span className="datatable-header-content">
                        <span className="datatable-header-label">{column.label}</span>
                        {column.sortable && getSortingIcon(column.accessor)}
                      </span>
                    </th>
                  ))}
                  {visibleActions.length > 0 && (
                    <th className="text-center" style={{ width: actionsColumnWidth }}>
                      {actionsHeaderLabel}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {tableData?.map((item, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td
                        key={column.accessor}
                        style={column.width ? { width: column.width } : undefined}
                        data-label={column.label}
                        className={column.cellClassName || ''}
                      >
                        {column.render ? column.render(item[column.accessor], item) : item[column.accessor]}
                      </td>
                    ))}
                    {/* <td className="text-center">
                    <span className="">
                      <ActionIcon tooltip="Edit" color="#0d6efd" onClick={() => onEdit(item)}>
                        <EditIcon/>
                      </ActionIcon>
                      
                      <ActionIcon tooltip="Delete" color="#dc3545" onClick={() => deleteConfirmation(item)}>
                        <DeleteIcon/>
                      </ActionIcon>
                    </span>
                  </td> */}

                    {/* {visibleActions.length > 0 && (
                    <td className="text-center" data-label="Action">
                      <div className="datatable-actions-cell">
                        {visibleActions.map((action, i) => (
                          <ActionIcon
                            key={i}
                            tooltip={action.label}
                            color={action.color}
                            onClick={() => typeof action.onClick === "function" && action.onClick(item)}
                          >
                            {action.icon}
                          </ActionIcon>
                        ))}
                      </div>
                    </td>
                  )} */}

                    {visibleActions?.length > 0 && (
                      <td className="text-center" style={{ width: actionsColumnWidth }} data-label={actionsHeaderLabel}>
                        <div className="datatable-actions-cell">
                          {visibleActions.map((action, i) => {
                            if (action.show === false) return null;

                            if (action.type === 'icon' || (action.type !== 'button' && action.icon)) {
                              return (
                                <ActionIcon
                                  key={i}
                                  tooltip={action.label}
                                  color={action.color}
                                  onClick={() => handleActionClick(action, item)}
                                >
                                  {action.icon}
                                </ActionIcon>
                              );
                            }

                            if (action.type === 'button') {
                              const isDisabled =
                                typeof action.disabled === 'function'
                                  ? action.disabled(item)
                                  : Boolean(action.disabled);

                              return (
                                <CustomButton
                                  key={i}
                                  title={action.label}
                                  onClick={() => handleActionClick(action, item)}
                                  variant={action.variant || 'primary'}
                                  className={action.className || ''}
                                  style={action.style || {}}
                                  disabled={isDisabled}
                                />
                              );
                            }

                            return null;
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
            {shouldShowInlineLoader && (
              <div className="datatable-loader-overlay">
                <Loader />
              </div>
            )}
          </div>

          {showPagination && (alwaysShowPagination || totalPages > 1) && (
            <TablePagination
              variant={paginationVariant}
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              pageSizeOptions={pageSizeOptions}
              rowsPerPageLabel={rowsPerPageLabel}
              updateRowsPerPage={updateRowsPerPage}
              onPageChange={onPageChange}
              footerLeftContent={footerLeftContent}
            />
          )}
        </>
      )}

      {!loader && checkEmpty(data) && <NoData />}

      <DeleteConfirmationModal
        show={Boolean(pendingAction)}
        onHide={closePendingAction}
        onConfirm={confirmPendingAction}
        message={pendingAction?.message}
      />
    </>
  );
};

export default React.memo(DataTable);

