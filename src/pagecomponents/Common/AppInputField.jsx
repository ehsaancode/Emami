import "./AppInputField.css";

const normalizeOptions = (options = []) =>
  options.map((option) => {
    if (typeof option === "string" || typeof option === "number") {
      return { value: String(option), label: String(option) };
    }
    return {
      value: String(option?.value ?? ""),
      label: String(option?.label ?? option?.value ?? ""),
    };
  });

const AppInputField = ({
  label,
  required = false,
  type = "text",
  as = "input",
  options = [],
  placeholder = "",
  name,
  id,
  value,
  onChange,
  disabled = false,
  rows = 3,
  rightIconClassName = "",
  wrapperClassName = "",
  labelClassName = "",
  inputClassName = "",
  error = "",
  hint = "",
  children,
  ...rest
}) => {
  const fieldId = id || name || undefined;
  const normalizedAs =
    as || (type === "select" ? "select" : type === "textarea" ? "textarea" : "input");
  const hasIcon = Boolean(rightIconClassName);
  const hasError = Boolean(error);

  const commonProps = {
    id: fieldId,
    name,
    placeholder,
    value: value ?? "",
    onChange,
    disabled,
    required,
    "aria-invalid": hasError,
    ...rest,
  };

  return (
    <div className={`app-input-field ${wrapperClassName}`.trim()}>
      {label ? (
        <label className={`app-input-label ${labelClassName}`.trim()} htmlFor={fieldId}>
          {label}
          {required ? <span className="app-input-required">*</span> : null}
        </label>
      ) : null}

      <div className={`app-input-control ${hasIcon ? "has-icon" : ""}`.trim()}>
        {normalizedAs === "select" ? (
          <select
            className={`app-input-select form-select ${hasError ? "is-invalid" : ""} ${inputClassName}`.trim()}
            {...commonProps}
          >
            {children || normalizeOptions(options).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : normalizedAs === "textarea" ? (
          <textarea
            className={`app-input-textarea form-control ${hasError ? "is-invalid" : ""} ${inputClassName}`.trim()}
            rows={rows}
            {...commonProps}
          />
        ) : (
          <input
            type={type}
            className={`app-input-element form-control ${hasError ? "is-invalid" : ""} ${inputClassName}`.trim()}
            {...commonProps}
          />
        )}

        {hasIcon ? <i className={`app-input-icon ${rightIconClassName}`.trim()} aria-hidden="true" /> : null}
      </div>

      {hasError ? <div className="app-input-error">{error}</div> : hint ? <div className="app-input-hint">{hint}</div> : null}
    </div>
  );
};

export default AppInputField;

