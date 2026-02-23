import { CCol, CForm } from '@coreui/react';
import { Row } from 'react-bootstrap';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Select from 'react-select';
import CustomButton from '../../../pagecomponents/Elements/Buttons/CustomButton';
import AppInputField from '../../../pagecomponents/Common/AppInputField';
import { postReq } from '../../../helpers/api';
import { baseApiUrl } from '../../../helpers/constants';
import { toastMessage } from '../../../helpers/utility';

const toNumberArray = (values) => {
  if (!Array.isArray(values)) return [];

  return values.map((value) => Number(value)).filter((value) => !Number.isNaN(value));
};

const normalizeInitialFormData = (payload = {}) => {
  return {
    user_Id: payload?.user_Id || '',
    user_Email: payload?.user_Email || '',
    user_Name: payload?.user_Name || '',
    user_Mobile: payload?.user_Mobile || '',
    user_Password: '',
    role_Ids: toNumberArray(payload?.role_Ids || []),
    confirm_Password: '',
  };
};

const UserAddEditForm = ({ saveData, closeModal, formPayload, isSaveDisabled, isEdit }) => {
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState(normalizeInitialFormData(formPayload));
  const [roleData, setRoleData] = useState([]);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState('');
  const [roleSearchKeyword, setRoleSearchKeyword] = useState('');
  const roleRequestRef = useRef(0);

  const isEditMode = useMemo(() => isEdit || Boolean(formData?.user_Id), [formData?.user_Id, isEdit]);
  const roleOptions = useMemo(
    () =>
      (Array.isArray(roleData) ? roleData : []).map((role) => ({
        value: Number(role.role_Id),
        label: role.role_Name,
      })),
    [roleData],
  );
  const selectedRoleOptions = useMemo(
    () =>
      toNumberArray(formData.role_Ids).map((roleId) => {
        const matchedOption = roleOptions.find((option) => option.value === roleId);
        return matchedOption || { value: roleId, label: `Role #${roleId}` };
      }),
    [formData.role_Ids, roleOptions],
  );
  const roleSelectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        minHeight: 44,
        borderRadius: 12,
        borderColor: roleError ? '#dc3545' : state.isFocused ? '#8cb3ff' : '#d9dee7',
        backgroundColor: '#fff',
        boxShadow: state.isFocused ? '0 0 0 3px rgba(11, 99, 246, 0.12)' : 'none',
        paddingLeft: 4,
        transition: 'border-color 120ms ease, box-shadow 120ms ease',
        '&:hover': {
          borderColor: roleError ? '#dc3545' : '#8cb3ff',
        },
      }),
      valueContainer: (base) => ({
        ...base,
        gap: 6,
        paddingTop: 6,
        paddingBottom: 6,
      }),
      placeholder: (base) => ({
        ...base,
        color: '#95a2b3',
        fontSize: 13,
      }),
      multiValue: (base) => ({
        ...base,
        margin: 0,
        borderRadius: 8,
        border: '1px solid #c7d7ff',
        backgroundColor: '#edf3ff',
      }),
      multiValueLabel: (base) => ({
        ...base,
        color: '#1f3f8f',
        fontSize: 12,
        fontWeight: 600,
        padding: '2px 6px 2px 8px',
      }),
      multiValueRemove: (base) => ({
        ...base,
        borderRadius: 6,
        color: '#4e628f',
        paddingLeft: 4,
        paddingRight: 4,
        ':hover': {
          backgroundColor: '#dce8ff',
          color: '#15317d',
        },
      }),
      input: (base) => ({
        ...base,
        margin: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }),
      indicatorSeparator: () => ({
        display: 'none',
      }),
      indicatorsContainer: (base) => ({
        ...base,
        paddingRight: 6,
      }),
      dropdownIndicator: (base, state) => ({
        ...base,
        color: '#64748b',
        transition: 'transform 120ms ease, color 120ms ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        ':hover': {
          color: '#334155',
        },
      }),
      menu: (base) => ({
        ...base,
        zIndex: 2000,
        borderRadius: 12,
        border: '1px solid #d9e3f5',
        overflow: 'hidden',
        boxShadow: '0 12px 24px rgba(15, 23, 42, 0.14)',
      }),
      menuList: (base) => ({
        ...base,
        padding: 6,
      }),
      option: (base, state) => ({
        ...base,
        borderRadius: 8,
        padding: '9px 10px',
        fontSize: 13,
        fontWeight: state.isSelected ? 600 : 500,
        backgroundColor: state.isSelected ? '#005fff' : state.isFocused ? '#eef4ff' : '#fff',
        color: state.isSelected ? '#fff' : '#111827',
      }),
    }),
    [roleError],
  );

  const normalizeRoleList = useCallback((responsePayload) => {
    const candidateLists = [
      responsePayload?.data,
      responsePayload?.data?.data,
      responsePayload?.data?.list,
      responsePayload?.list,
    ];

    const rawRoleList = candidateLists.find((value) => Array.isArray(value)) || [];

    return rawRoleList
      .map((role) => ({
        role_Id: Number(role?.role_Id ?? role?.id ?? role?.value),
        role_Name: String(role?.role_Name || role?.role_name || role?.name || role?.label || ''),
      }))
      .filter((role) => role.role_Id && role.role_Name);
  }, []);

  useEffect(() => {
    setFormData(normalizeInitialFormData(formPayload));
    setRoleError('');
    setValidated(false);
    setRoleSearchKeyword('');
  }, [formPayload]);

  const fetchRoleList = useCallback(async (searchText = '') => {
    const requestId = roleRequestRef.current + 1;
    roleRequestRef.current = requestId;

    try {
      setIsRoleLoading(true);
      const response = await postReq(`${baseApiUrl}/role/search-list`, {
        inputData: {
          filter: {
            role_Name: String(searchText || '').trim(),
          },
        },
      });

      if (response?.status !== 'success') {
        throw new Error(response?.msg || 'Unable to load roles.');
      }

      const parsedRoleList = normalizeRoleList(response);
      if (roleRequestRef.current !== requestId) return;
      setRoleData(parsedRoleList);
    } catch (error) {
      if (roleRequestRef.current !== requestId) return;
      setRoleData([]);
      toastMessage('error', error?.response?.data?.msg || 'Unable to load roles.');
    } finally {
      if (roleRequestRef.current !== requestId) return;
      setIsRoleLoading(false);
    }
  }, [normalizeRoleList]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRoleList(roleSearchKeyword);
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchRoleList, roleSearchKeyword]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (selectedOptions) => {
    const selectedRoleIds = Array.isArray(selectedOptions) ? selectedOptions.map((option) => Number(option.value)) : [];
    setFormData((prev) => ({ ...prev, role_Ids: selectedRoleIds }));
    if (selectedRoleIds.length) {
      setRoleError('');
    }
  };

  const handleRoleSearchInputChange = (inputValue, actionMeta) => {
    if (actionMeta?.action !== 'input-change') return inputValue;
    setRoleSearchKeyword(inputValue || '');
    return inputValue;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    const trimmedPassword = String(formData.user_Password || '').trim();
    const trimmedConfirmPassword = String(formData.confirm_Password || '').trim();

    if (!formData.role_Ids?.length) {
      setRoleError('Please select at least one role.');
      setValidated(true);
      return;
    }

    const hasPasswordInput = Boolean(trimmedPassword || trimmedConfirmPassword);

    if (!isEditMode && !hasPasswordInput) {
      setValidated(true);
      return;
    }

    if (hasPasswordInput && trimmedPassword !== trimmedConfirmPassword) {
      setValidated(true);
      return;
    }

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    const payload = {
      user_Email: String(formData.user_Email || '').trim(),
      user_Name: String(formData.user_Name || '').trim(),
      user_Mobile: String(formData.user_Mobile || '').trim(),
      role_Ids: toNumberArray(formData.role_Ids),
      designationId: null,
    };

    if (isEditMode) {
      payload.user_Id = formData.user_Id;
    }

    if (trimmedPassword) {
      payload.user_Password = trimmedPassword;
    }

    saveData(payload);
    setValidated(true);
  };

  const userNameError =
    validated && !String(formData.user_Name || '').trim() ? 'Enter user name' : '';
  const mobileError =
    validated && !String(formData.user_Mobile || '').trim() ? 'Enter mobile number' : '';
  const emailError =
    validated && !String(formData.user_Email || '').trim() ? 'Enter valid email id' : '';
  const passwordError =
    validated && !isEditMode && !String(formData.user_Password || '').trim() ? 'Enter password' : '';
  const confirmPasswordError =
    validated &&
    ((!isEditMode && !String(formData.confirm_Password || '').trim()) ||
      (Boolean(formData.confirm_Password || formData.user_Password) &&
        formData.user_Password !== formData.confirm_Password))
      ? 'Passwords do not match'
      : '';

  return (
    <CForm className="g-3 needs-validation" noValidate validated={validated} onSubmit={handleSubmit}>
      <Row className="row-xs mb-2">
        <CCol md={6}>
          <AppInputField
            label="User Name"
            type="text"
            id="user_Name"
            name="user_Name"
            value={formData.user_Name}
            onChange={handleInputChange}
            required
            error={userNameError}
          />
        </CCol>

        <CCol md={6}>
          <label className="app-input-label" htmlFor="role_Ids">
            Roles
          </label>
          <Select
            inputId="role_Ids"
            isMulti
            isClearable={false}
            isSearchable
            closeMenuOnSelect={false}
            isLoading={isRoleLoading}
            isDisabled={isSaveDisabled}
            classNamePrefix="user-role-select"
            options={roleOptions}
            value={selectedRoleOptions}
            onChange={handleRoleChange}
            onInputChange={handleRoleSearchInputChange}
            placeholder="Select role(s)..."
            noOptionsMessage={() => (isRoleLoading ? 'Loading roles...' : 'No roles found')}
            styles={roleSelectStyles}
          />
          <small className="text-muted d-block mt-1">Select one or more roles.</small>
          {roleError ? <div className="invalid-feedback d-block">{roleError}</div> : null}
        </CCol>
      </Row>

      <Row className="row-xs mb-2">
        <CCol md={6}>
          <AppInputField
            label="Mobile"
            type="text"
            id="user_Mobile"
            name="user_Mobile"
            value={formData.user_Mobile}
            onChange={handleInputChange}
            required
            error={mobileError}
          />
        </CCol>

        <CCol md={6}>
          <AppInputField
            label="Email ID"
            type="email"
            id="user_Email"
            name="user_Email"
            value={formData.user_Email}
            onChange={handleInputChange}
            required
            error={emailError}
          />
        </CCol>
      </Row>

      <Row className="row-xs mb-2">
        <CCol md={6}>
          <AppInputField
            label="Password"
            type="password"
            id="user_Password"
            name="user_Password"
            value={formData.user_Password}
            onChange={handleInputChange}
            required={!isEditMode}
            error={passwordError}
            hint={isEditMode ? 'Enter password only if you want to change it' : ''}
          />
        </CCol>

        <CCol md={6}>
          <AppInputField
            label="Confirm Password"
            type="password"
            id="confirm_Password"
            name="confirm_Password"
            value={formData.confirm_Password}
            onChange={handleInputChange}
            required={!isEditMode || Boolean(formData.user_Password)}
            error={confirmPasswordError}
          />
        </CCol>
      </Row>

      <Row className="row-xs mb-2 btn-animation">
        <CCol xs={12} className="mt-10">
          <CustomButton
            type="submit"
            className="float-end"
            style={{ backgroundColor: '#005FFF', color: '#fff' }}
            loading={isSaveDisabled}
            loadingText={isEditMode ? 'Save Changes' : 'Create User'}
            showSpinner
          >
            {isEditMode ? 'Save Changes' : 'Create User'}
          </CustomButton>

          <CustomButton
            className="btn-light btn-outline-primary float-end me-2"
            onClick={closeModal}
            disabled={isSaveDisabled}
          >
            Cancel
          </CustomButton>
        </CCol>
      </Row>
    </CForm>
  );
};

export default UserAddEditForm;

