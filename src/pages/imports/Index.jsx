import { useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../pagecomponents/Common/PageWrapper';
import Loader from '../../pagecomponents/Common/Loader';
import { CONFIG, postReq } from '../../helpers/api';
import { baseApiUrl } from '../../helpers/constants';
import { toastMessage } from '../../helpers/utility';
import './style.css';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.xlsx', '.xls'];
const IMPORT_TEMPLATE_URL = 'https://imgcdn.kuick.com/emami/sample-data.xlsx';
const IMPORT_STEP = Object.freeze({
  IDLE: 'idle',
  CONFIRM: 'confirm',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
});

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  return `${(bytes / 1024).toFixed(1)} KB`;
};

const isSupportedExcelFile = (file) => {
  const fileName = String(file?.name || '').toLowerCase();
  return ALLOWED_EXTENSIONS.some((extension) => fileName.endsWith(extension));
};

const ImportContacts = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importStep, setImportStep] = useState(IMPORT_STEP.IDLE);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');
  const [isCheckingExistingImports, setIsCheckingExistingImports] = useState(true);
  const isUploading = importStep === IMPORT_STEP.UPLOADING;

  useEffect(() => {
    let isMounted = true;
    const checkExistingImportPreview = async () => {
      try {
        const response = await postReq(`${baseApiUrl}/contact-imports/dup-list`, {
          inputData: {
            filter: {
              selectAll: true,
            },
            pagination: {
              page: 1,
              limit: 1,
            },
          },
        });

        const existingRows = response?.data?.data;
        if (response?.status === 'success' && Array.isArray(existingRows) && existingRows.length > 0) {
          navigate(`${process.env.PUBLIC_URL}/import/list`, { replace: true });
          return;
        }
      } catch (error) {
        // Keep import page available if preview check fails.
      } finally {
        if (isMounted) {
          setIsCheckingExistingImports(false);
        }
      }
    };

    checkExistingImportPreview();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const resetSelectedFile = () => {
    setSelectedFile(null);
    setSelectedFileName('');
    setSelectedFileSize('');
    setImportStep(IMPORT_STEP.IDLE);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const prepareFileForImport = (file) => {
    if (!file) return;

    if (!isSupportedExcelFile(file)) {
      toastMessage('error', 'Please select a valid Excel file (.xlsx or .xls).');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toastMessage('error', 'Maximum allowed file size is 2 MB.');
      return;
    }

    setSelectedFile(file);
    setSelectedFileName(file.name);
    setSelectedFileSize(formatFileSize(file.size));
    setImportStep(IMPORT_STEP.CONFIRM);
  };

  const submitImportFile = async (event) => {
    event?.stopPropagation();
    if (!selectedFile || isUploading) return;

    setImportStep(IMPORT_STEP.UPLOADING);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await postReq(`${baseApiUrl}/contact-imports/import`, formData, {
        ...CONFIG,
        'Content-Type': 'multipart/form-data',
      });

      if (response?.status !== 'success') {
        throw new Error(response?.msg || 'Failed to import contacts.');
      }

      toastMessage('success', response?.msg || 'Contacts imported successfully.');
      setImportStep(IMPORT_STEP.SUCCESS);
    } catch (error) {
      const apiMessage =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.data?.msg ||
        error?.msg ||
        error?.message ||
        'Failed to import contacts.';
      toastMessage('error', apiMessage);
      setImportStep(IMPORT_STEP.CONFIRM);
    }
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files?.[0];
    prepareFileForImport(selectedFile);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    if (importStep !== IMPORT_STEP.IDLE || isUploading) return;
    const droppedFile = event.dataTransfer?.files?.[0];
    prepareFileForImport(droppedFile);
  };

  const handleBrowseClick = () => {
    if (importStep === IMPORT_STEP.IDLE && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleChangeFile = (event) => {
    event.stopPropagation();
    resetSelectedFile();
    fileInputRef.current?.click();
  };

  return (
    <>
      <ToastContainer />
      <div className="import-contacts-page">
        <PageWrapper pageName="Import Contacts" pageSubTitle="Upload an Excel file to import contacts in bulk">
          {isCheckingExistingImports ? (
            <div className="import-preview-loading">
              <Loader />
            </div>
          ) : (
            <div className="import-contacts-content">
              <div className="import-contacts-card">
                <h3 className="import-contacts-title">Import Excel File</h3>
                <p className="import-contacts-subtitle">Import your contact list in Excel format (.xlsx, .xls)</p>

                <div
                  className={`import-dropzone ${isDragOver ? 'is-drag-over' : ''} ${
                    isUploading ? 'is-uploading' : ''
                  } ${importStep !== IMPORT_STEP.IDLE ? 'has-selection' : ''} ${
                    importStep === IMPORT_STEP.SUCCESS ? 'is-success' : ''
                  }`}
                  onClick={handleBrowseClick}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (!isUploading && importStep === IMPORT_STEP.IDLE) setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (
                      (event.key === 'Enter' || event.key === ' ') &&
                      importStep === IMPORT_STEP.IDLE &&
                      !isUploading
                    ) {
                      event.preventDefault();
                      handleBrowseClick();
                    }
                  }}
                >
                  {importStep === IMPORT_STEP.UPLOADING ? (
                    <div className="import-progress-state">
                      <Loader />
                      <p className="import-dropzone-uploading">Uploading and importing contacts...</p>
                      {selectedFileName ? (
                        <p className="import-dropzone-file-name">
                          {selectedFileName}
                          {selectedFileSize ? ` (${selectedFileSize})` : ''}
                        </p>
                      ) : null}
                    </div>
                  ) : importStep === IMPORT_STEP.CONFIRM && selectedFile ? (
                    <div className="import-confirm-state">
                      <p className="import-dropzone-file-name">
                        {selectedFileName}
                        {selectedFileSize ? ` (${selectedFileSize})` : ''}
                      </p>
                      <p className="import-dropzone-confirm-text">
                        Please confirm and submit this file to import contacts.
                      </p>
                      <div className="import-dropzone-action-row">
                        <button type="button" className="import-btn import-btn-primary" onClick={submitImportFile}>
                          Confirm & Submit
                        </button>
                        <button type="button" className="import-btn import-btn-secondary" onClick={handleChangeFile}>
                          Change File
                        </button>
                      </div>
                    </div>
                  ) : importStep === IMPORT_STEP.SUCCESS ? (
                    <div className="import-confirm-state">
                      <p className="import-dropzone-file-name">
                        {selectedFileName}
                        {selectedFileSize ? ` (${selectedFileSize})` : ''}
                      </p>
                      <p className="import-dropzone-success-text">Import completed successfully.</p>
                      <div className="import-dropzone-action-row">
                        <button
                          type="button"
                          className="import-btn import-btn-primary"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`${process.env.PUBLIC_URL}/import/list`);
                          }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="import-dropzone-icon-wrap">
                        <i className="fe fe-file-text import-dropzone-file-icon"></i>
                        <span className="import-dropzone-upload-icon">
                          <i className="fe fe-arrow-up"></i>
                        </span>
                      </div>

                      <p className="import-dropzone-main-text">Click to import or drag and drop</p>
                      <p className="import-dropzone-meta-text">Excel files only (.xlsx, .xls)</p>
                      <p className="import-dropzone-meta-text">Maximum file size: 2 MB</p>
                    </>
                  )}

                  {selectedFileName && importStep === IMPORT_STEP.IDLE ? (
                    <p className="import-dropzone-file-name">
                      {selectedFileName}
                      {selectedFileSize ? ` (${selectedFileSize})` : ''}
                    </p>
                  ) : null}

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="import-file-input"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    disabled={isUploading || importStep === IMPORT_STEP.SUCCESS}
                  />
                </div>
              </div>

              <div className="import-contacts-required-fields">
                <div className="import-required-header">
                  <div>
                    <p className="import-required-title">Required Fields</p>
                    <p className="import-required-subtitle">Use the template to avoid import errors.</p>
                  </div>
                  <a className="import-template-link" href={IMPORT_TEMPLATE_URL} target="_blank" rel="noreferrer">
                    Download Template
                  </a>
                </div>
                <ul className="import-required-list">
                  <li>
                    <span className="import-required-badge import-required-badge--primary">Required</span>
                    Name, City, Mobile, Email
                  </li>
                  <li>
                    <span className="import-required-badge import-required-badge--neutral">Optional</span>
                    Spouse, Family Group, Tags
                  </li>
                  <li>
                    <span className="import-required-badge import-required-badge--info">Tip</span>
                    Tags should be comma-separated (e.g., RSA, Rotary)
                  </li>
                </ul>
              </div>
            </div>
          )}
        </PageWrapper>
      </div>
    </>
  );
};

export default ImportContacts;
