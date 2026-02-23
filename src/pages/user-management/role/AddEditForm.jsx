import { useState, useEffect } from 'react';
import { Row } from 'react-bootstrap';
import { CForm, CCol } from '@coreui/react';
import CustomButton from '../../../pagecomponents/Elements/Buttons/CustomButton';
import AppInputField from '../../../pagecomponents/Common/AppInputField';
import { useDispatch } from 'react-redux';
import { getStorage } from '../../../helpers/utility';
import { getPermissionData, getPermissionDataForEdit } from '../../../redux/slices/MasterUserRoleSlice';

const RoleAddEditForm = ({ saveData, closeModal, formPayload, isEdit, isModalOpen, isSaveDisabled }) => {
  const dispatch = useDispatch();
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState(formPayload || {});
  const [isPermissionLoading, setIsPermissionLoading] = useState(false);

  const [permissionState, setPermissionState] = useState({
    wildcardEnabled: false,
    wildcardId: null,
    rows: [],
  });

  const normalizeModuleName = (value) =>
    String(value || '').trim().toLowerCase().replace(/\s+/g, '-');

  const isAllModuleName = (value) => normalizeModuleName(value) === 'all';

  const isAllAction = (action) => normalizeModuleName(action) === 'all';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isPermissionLoading) return;

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      const selectedPermissionIds = getSelectedPermissionIds();
      const payload = {
        role_Name: formData?.role_Name || '',
        role_Description: formData?.role_Description || '',
        permission_Ids: selectedPermissionIds,
      };

      if (formData?.role_Id) {
        payload.role_Id = formData.role_Id;
      }

      saveData(payload);
    }
    setValidated(true);
  };

  useEffect(() => {
    setFormData(formPayload || {});
    setValidated(false);
  }, [formPayload]);

  useEffect(() => {
    if (!isModalOpen) return;
    fetchRolePermissionData();
  }, [isModalOpen, isEdit, formPayload?.role_Id]);

  const fetchRolePermissionData = async () => {
    setIsPermissionLoading(true);
    try {
      const userId = Number(getStorage('userid')) || 1;
      const requestPayload = isEdit
        ? {
          inputData: {
            user_Id: userId,
            role_Id: formPayload?.role_Id,
          },
        }
        : undefined;

      const { payload } = await dispatch((isEdit ? getPermissionDataForEdit : getPermissionData)(requestPayload));

      normalizePermissions(payload?.data || []);
    } catch (err) {
      normalizePermissions([]);
    } finally {
      setIsPermissionLoading(false);
    }
  };

  const extractRolePermissionIds = () => {
    if (Array.isArray(formPayload?.permission_Ids) && formPayload.permission_Ids.length > 0) {
      return formPayload.permission_Ids;
    }

    return (formPayload?.permissions || [])
      .map((permission) => permission?.permission_Id ?? permission?.id ?? permission?.role_permission_Permission_Id)
      .filter((permissionId) => permissionId !== null && permissionId !== undefined);
  };

  const normalizePermissions = (apiData) => {
    const safeApiData = Array.isArray(apiData) ? apiData : [];
    const selectedPermissionIds = new Set(extractRolePermissionIds().map((permissionId) => String(permissionId)));

    const wildcard = safeApiData.find((x) => x.module === 'wildcard');
    const wildcardId = wildcard?.all?.id || null;
    const wildcardEnabled = false;

    let rows = safeApiData
      .filter((x) => x.module !== 'wildcard')
      .map((module) => {
        const actions = Object.entries(module)
          .filter(([action]) => action !== 'module')
          .map(([action, meta]) => {
            const permissionId = meta?.id ?? meta?.permission_Id ?? meta?.role_permission_Permission_Id ?? null;
            const isSelected =
              meta?.value === true || meta?.value === 1 || selectedPermissionIds.has(String(permissionId));

            return {
              ...meta,
              id: permissionId,
              action,
              label: String(action || '')
                .replace(/_/g, ' ')
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/^\w/, (c) => c.toUpperCase()),
              value: wildcardEnabled ? true : isSelected,
            };
          })
          .filter((item) => item.id !== null && item.id !== undefined);

        return {
          module: module.module,
          isAllModule: isAllModuleName(module.module),
          actions,
        };
      });

    setPermissionState({
      wildcardEnabled,
      wildcardId,
      rows,
    });
  };

  const toggleAction = (rowIndex, actionIndex, checked) => {
    setPermissionState((prev) => {
      const rows = [...prev.rows];
      const row = { ...rows[rowIndex] };
      const actions = [...row.actions];
      const isAllRow = row.isAllModule || isAllModuleName(row.module);
      const clickedAction = actions[actionIndex];
      const isAllActionClick =
        isAllRow && (isAllAction(clickedAction?.action) || isAllAction(clickedAction?.label));

      if (isAllActionClick) {
        const updatedActions = actions.map((action) => ({
          ...action,
          value: checked,
        }));
        rows[rowIndex] = { ...row, actions: updatedActions };

        const allSelected =
          rows.length > 0 && rows.every((item) => item.actions.every((action) => action.value === true));

        const syncedRows = allSelected
          ? rows
          : rows.map((item) =>
              item.isAllModule || isAllModuleName(item.module)
                ? {
                    ...item,
                    actions: item.actions.map((action) =>
                      isAllAction(action?.action) || isAllAction(action?.label)
                        ? { ...action, value: false }
                        : action,
                    ),
                  }
                : item,
            );

        return { ...prev, rows: syncedRows, wildcardEnabled: allSelected };
      }

      actions[actionIndex] = {
        ...actions[actionIndex],
        value: checked,
      };

      const updatedActions = actions.map((action) =>
        isAllRow && (isAllAction(action?.action) || isAllAction(action?.label))
          ? { ...action, value: actions.every((item) => item.value === true) }
          : action,
      );

      rows[rowIndex] = { ...row, actions: updatedActions };

      const allSelected =
        rows.length > 0 && rows.every((item) => item.actions.every((action) => action.value === true));

      const syncedRows = allSelected
        ? rows
        : rows.map((item) =>
            item.isAllModule || isAllModuleName(item.module)
              ? { ...item, actions: item.actions.map((action) => ({ ...action, value: false })) }
              : item,
          );

      return { ...prev, rows: syncedRows, wildcardEnabled: allSelected };
    });
  };

  const toggleWildcard = (checked) => {
    setPermissionState((prev) => ({
      ...prev,
      wildcardEnabled: checked,
      rows: prev.rows.map((row) => ({
        ...row,
        actions: row.actions.map((action) => ({ ...action, value: checked })),
      })),
    }));
  };

  const getSelectedPermissionIds = () => {
    const selectedPermissionIds = permissionState.rows.flatMap((row) =>
      row.actions.filter((item) => item.value === true).map((item) => item.id),
    );

    const uniqueIds = [...new Set(selectedPermissionIds.filter((id) => id !== null && id !== undefined))];

    if (permissionState.wildcardEnabled && permissionState.wildcardId) {
      return [permissionState.wildcardId];
    }

    return uniqueIds;
  };

  const primaryButtonText = isEdit ? 'Save Changes' : 'Create and Active';
  const primaryLoadingText = isEdit ? 'Saving...' : 'Create and Active';
  const secondaryButtonText = 'Cancel';
  const roleNameError =
    validated && !String(formData?.role_Name || '').trim() ? 'Enter role name' : '';

  return (
    <>
      <h5 className="modal-title mg-b-5">Role Identity</h5>

      <CForm className="g-3 needs-validation" noValidate validated={validated} onSubmit={handleSubmit}>
        <Row className="row-xs mb-2">
          <CCol md={12}>
            <AppInputField
              label="Role Name"
              type="text"
              id="role_Name"
              name="role_Name"
              value={formData.role_Name || ''}
              onChange={handleInputChange}
              required
              error={roleNameError}
            />
          </CCol>
        </Row>
        <Row className="row-xs mb-2">
          <CCol md={12}>
            <AppInputField
              label="Role Description"
              as="textarea"
              id="role_Description"
              name="role_Description"
              rows={3}
              value={formData.role_Description || ''}
              onChange={handleInputChange}
              placeholder="Enter role description"
            />
          </CCol>
        </Row>

        <h5 className="modal-title mg-b-5">Permissions Configuration</h5>

        <Row className="row-xs mb-2">
          <CCol md={12}>
            <div className="permission-config">
              <label className="permission-action">
                <input
                  type="checkbox"
                  checked={permissionState.wildcardEnabled}
                  disabled={isPermissionLoading}
                  onChange={(e) => toggleWildcard(e.target.checked)}
                />
                <span>Grant all permissions</span>
              </label>


              <div className="permission-modules">
                {permissionState.rows.map((row, rowIndex) => (
                  <div key={row.module} className="permission-module">
                    <div className="permission-module__header">
                      <h6 className="permission-module__title">{row.module}</h6>
                    </div>
                    <div className="permission-module__actions">
                      {row.actions.map((action, actionIndex) => (
                        <label key={action.id} className="permission-action">
                          <input
                            type="checkbox"
                            disabled={isPermissionLoading}
                            checked={action.value}
                            onChange={(e) => toggleAction(rowIndex, actionIndex, e.target.checked)}
                          />
                          <span>{action.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <small className="permission-help">
                Any selected permission is shown as checked. Click once to clear.
              </small>
            </div>
          </CCol>
        </Row>

        <Row className="row-xs mb-2 btn-animation">
          <CCol xs={12} className="mt-10">
            <CustomButton
              type="submit"
              className="float-end"
              style={{ backgroundColor: '#005FFF', color: '#fff' }}
              loading={isSaveDisabled || isPermissionLoading}
              loadingText={primaryLoadingText}
              showSpinner
              disabled={isSaveDisabled || isPermissionLoading}
            >
              {primaryButtonText}
            </CustomButton>

            <CustomButton
              type="button"
              className="btn-light btn-outline-primary float-end me-2"
              onClick={closeModal}
              disabled={isSaveDisabled || isPermissionLoading}
              variant='secondary'
            >
              {secondaryButtonText}
            </CustomButton>
          </CCol>
        </Row>
      </CForm>
    </>
  );
};

export default RoleAddEditForm;

