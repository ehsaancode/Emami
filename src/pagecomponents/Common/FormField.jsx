import DatePicker from "./DatePicker";
import TimePicker from "./TimePicker";

const normalizeOptions = (options) =>
    options.map((option) =>
        typeof option === "string"
            ? { value: option, label: option }
            : option
    );

const FormField = ({
    label,
    required = false,
    type = "text",
    placeholder,
    name,
    value,
    onChange,
    options = [],
    rightIconClassName,
    confirmable = true,
    wrapperClassName = "",
    inputClassName = "",
    ...rest
}) => {
    const isDate = type === "date";
    const isSelect = type === "select";
    const isTime = type === "time";
    const hasIcon = Boolean(rightIconClassName);

    const inputProps = {
        name,
        placeholder,
        className: `app-field-input ${inputClassName}`.trim(),
        ...(value !== undefined ? { value } : {}),
        ...(onChange ? { onChange } : {}),
        ...rest,
    };

    return (
        <div className={`app-field ${wrapperClassName}`.trim()}>
            <style>
                {`
                .app-field {
                    margin-bottom: 16px;
                }

                .app-field-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #3a3f46;
                    margin-bottom: 8px;
                    display: inline-block;
                }

                .app-field-required {
                    color: #ff2b2b;
                    margin-left: 2px;
                }

                .app-field-control {
                    position: relative;
                }

                .app-field-input,
                .app-field-select {
                    height: 40px;
                    border-radius: 999px;
                    border: 1px solid #e6e9ef;
                    padding: 0 16px;
                    font-size: 13px;
                    background: #fbfcfe;
                    color: #2f343a;
                    width: 100%;
                }

                .app-field-has-icon .app-field-input,
                .app-field-has-icon .app-field-select {
                    padding-right: 38px;
                }

                .app-field-input:focus,
                .app-field-select:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(11, 99, 243, 0.12);
                    border-color: #bcd3ff;
                    background: #fff;
                }

                .app-field-select {
                    padding-right: 32px;
                }

                .app-field-icon {
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9aa3af;
                    font-size: 14px;
                    pointer-events: none;
                }
                `}
            </style>
            {label ? (
                <label className="app-field-label" htmlFor={name}>
                    {label}
                    {required && <span className="app-field-required">*</span>}
                </label>
            ) : null}
            <div
                className={`app-field-control ${isDate ? "app-field-date" : ""} ${
                    hasIcon ? "app-field-has-icon" : ""
                }`.trim()}
            >
                {isDate ? (
                    <DatePicker
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        name={name}
                        inputClassName={inputClassName}
                        confirmable={confirmable}
                        disabled={rest.disabled}
                    />
                ) : isTime ? (
                    <TimePicker
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        name={name}
                        inputClassName={inputClassName}
                        confirmable={confirmable}
                        disabled={rest.disabled}
                        options={options}
                    />
                ) : isSelect ? (
                    <select
                        name={name}
                        className={`app-field-select ${inputClassName}`.trim()}
                        {...(value !== undefined ? { value } : {})}
                        {...(onChange ? { onChange } : {})}
                        {...rest}
                    >
                        {normalizeOptions(options).map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input type={type} {...inputProps} />
                )}
                {rightIconClassName && (
                    <i className={`app-field-icon ${rightIconClassName}`.trim()} />
                )}
            </div>
        </div>
    );
};

export default FormField;

