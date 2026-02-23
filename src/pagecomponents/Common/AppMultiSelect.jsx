import "./AppMultiSelect.css";

const defaultGetItemId = (item = {}) =>
  Number(
    item?.id ??
      item?.value ??
      item?.contact_Id ??
      item?.contact_Contact_Id ??
      item?.event_Id ??
      item?.family_group_Id ??
      0,
  );

const defaultGetItemLabel = (item = {}) =>
  String(
    item?.label ??
      item?.name ??
      item?.contact_name ??
      item?.contact_Primary_Full_Name ??
      item?.event_name ??
      item?.family_group_Name ??
      "",
  ).trim();

const AppMultiSelect = ({
  label = "",
  required = false,
  selectedItems = [],
  options = [],
  searchValue = "",
  onSearchChange,
  onToggleOption,
  onRemoveSelected,
  getItemId = defaultGetItemId,
  getItemLabel = defaultGetItemLabel,
  isOptionSelected = () => false,
  isOptionDisabled = () => false,
  isSelectedDisabled = () => false,
  renderSelectedSuffix,
  renderOptionSuffix,
  getRemoveButtonLabel,
  searchPlaceholder = "Search...",
  loading = false,
  loadingText = "Loading...",
  emptyText = "No options found.",
  className = "",
  error = "",
  hint = "",
  idPrefix = "app-multi-select",
}) => {
  const safeSelectedItems = Array.isArray(selectedItems) ? selectedItems : [];
  const safeOptions = Array.isArray(options) ? options : [];
  const hasError = Boolean(error);

  return (
    <div className={`app-multi-select ${className}`.trim()}>
      {label ? (
        <label className="app-multi-select-label">
          {label}
          {required ? <span className="app-multi-select-required">*</span> : null}
        </label>
      ) : null}

      <div className={`app-multi-select-search-shell ${hasError ? "has-error" : ""}`.trim()}>
        <div className="app-multi-select-chip-container">
          {safeSelectedItems.map((item, index) => {
            // console.log(item.displayName);
            
            const itemId = getItemId(item);
            const itemLabel = getItemLabel(item) || `Item ${index + 1}`;
            const chipDisabled = Boolean(isSelectedDisabled(item));
            const removeButtonLabel = getRemoveButtonLabel ? getRemoveButtonLabel(item) : "x";

            return (
              <span
                key={`${idPrefix}-chip-${itemId || index}`}
                className={`app-multi-select-chip ${chipDisabled ? "is-disabled" : ""}`.trim()}
              >
                <span className="app-multi-select-chip-label">{itemLabel}</span>
                {renderSelectedSuffix ? (
                  <span className="app-multi-select-chip-suffix">{renderSelectedSuffix(item)}</span>
                ) : null}
                <button
                  type="button"
                  className="app-multi-select-chip-remove"
                  onClick={() => onRemoveSelected?.(item)}
                  disabled={chipDisabled}
                  aria-label={`Remove ${itemLabel}`}
                >
                  {removeButtonLabel}
                </button>
              </span>
            );
          })}

          <input
            type="text"
            className="app-multi-select-search-input"
            value={searchValue}
            placeholder={searchPlaceholder}
            onChange={(event) => onSearchChange?.(event.target.value)}
          />
        </div>

        <span className="app-multi-select-search-icon" aria-hidden="true">
          <i className="fe fe-search" />
        </span>
      </div>

      <div className="app-multi-select-option-list">
        {loading ? <div className="app-multi-select-empty">{loadingText}</div> : null}

        {!loading && safeOptions.length === 0 ? <div className="app-multi-select-empty">{emptyText}</div> : null}

        {!loading &&
          safeOptions.map((item, index) => {
            const itemId = getItemId(item);
            const optionId = `${idPrefix}-option-${itemId || index}`;
            const optionLabel = getItemLabel(item) || `Item ${index + 1}`;
            const checked = Boolean(isOptionSelected(item));
            const disabled = Boolean(isOptionDisabled(item));

            return (
              <label
                key={optionId}
                htmlFor={optionId}
                className={`app-multi-select-option ${checked ? "is-selected" : ""} ${
                  disabled ? "is-disabled" : ""
                }`.trim()}
              >
                <input
                  id={optionId}
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggleOption?.(item)}
                />
                <span className="app-multi-select-option-label">{optionLabel}</span>
                {/* {renderOptionSuffix ? (
                  <span className="app-multi-select-option-suffix">{renderOptionSuffix(item)}</span>
                ) : null} */}
              </label>
            );
          })}
      </div>

      {hasError ? <div className="app-multi-select-error">{error}</div> : hint ? <div className="app-multi-select-hint">{hint}</div> : null}
    </div>
  );
};

export default AppMultiSelect;

