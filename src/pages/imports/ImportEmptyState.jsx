import React from "react";

const STATUS_LABEL_MAP = {
  unique: "Valid Contacts",
  duplicate: "Duplicate Contacts",
  error: "Validation Errors",
};

const ImportEmptyState = ({
  mode = "all-resolved",
  activeStatus,
  onTryOtherTabs,
  onAddAnotherFile,
}) => {
  const statusLabel = STATUS_LABEL_MAP[activeStatus] || "Selected tab";
  const isFilteredMode = mode === "filtered-empty";

  return (
    <div className={`import-empty-state ${isFilteredMode ? "is-filtered" : "is-resolved"}`}>
      <div className="import-empty-state-illustration" aria-hidden="true">
        <svg viewBox="0 0 220 120" role="img">
          <defs>
            <linearGradient id="emptyStateBlue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#66a6ff" />
              <stop offset="100%" stopColor="#0b63f6" />
            </linearGradient>
            <linearGradient id="emptyStateBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ecf4ff" />
            </linearGradient>
          </defs>

          <rect x="28" y="26" width="164" height="78" rx="12" fill="url(#emptyStateBg)" stroke="#cfe0ff" />
          <rect x="44" y="44" width="132" height="10" rx="5" fill="#d8e6ff" />
          <rect x="44" y="60" width="92" height="8" rx="4" fill="#e5efff" />
          <circle cx="164" cy="84" r="18" fill="url(#emptyStateBlue)" />
          <path d="M156 84l6 6 10-12" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="56" cy="20" r="6" fill="#bcd4ff" />
          <circle cx="174" cy="20" r="4" fill="#d4e3ff" />
        </svg>
      </div>

      <h4 className="import-empty-state-title">
        {isFilteredMode ? `All clear in ${statusLabel}` : "All records are resolved"}
      </h4>
      <p className="import-empty-state-text">
        {isFilteredMode
          ? "No pending records are left in this tab. Try another tab or switch to Show All."
          : "No pending import records remain. You can upload another file to continue."}
      </p>

      <div className="import-empty-state-actions">
        {isFilteredMode ? (
          <button type="button" className="import-footer-btn import-footer-btn-secondary" onClick={onTryOtherTabs}>
            Show All Records
          </button>
        ) : null}
        {!isFilteredMode ? (
          <button type="button" className="import-footer-btn import-footer-btn-primary" onClick={onAddAnotherFile}>
            Add Another File
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ImportEmptyState;

