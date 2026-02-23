import { useEffect, useMemo, useRef, useState } from "react";

const cleanText = (value) => (value === null || value === undefined ? "" : String(value).trim());

const normalizeOption = (option = {}, index = 0) => {
  if (typeof option === "string" || typeof option === "number") {
    const value = cleanText(option);
    if (!value) return null;

    return {
      id: `contact-auto-fill-${index}`,
      value,
      label: value,
      searchText: value.toLowerCase(),
      meta: null,
    };
  }

  const value = cleanText(option?.value ?? option?.label ?? option?.name ?? "");
  if (!value) return null;

  const label = cleanText(option?.label ?? option?.name ?? value) || value;
  const searchText = cleanText(option?.searchText ?? `${label} ${value}`).toLowerCase();

  return {
    id: option?.id ?? `contact-auto-fill-${index}`,
    value,
    label,
    searchText,
    meta: option?.meta ?? null,
  };
};

const ContactAutoFillSelect = ({
  id,
  name,
  value = "",
  onChange = () => {},
  onOptionSelect,
  options = [],
  placeholder = "Type to search...",
  inputClassName = "",
  emptyText = "No matches found",
  maxVisibleOptions = 8,
  disabled = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const inputValue = cleanText(value);
  const normalizedInputValue = inputValue.toLowerCase();

  const normalizedOptions = useMemo(() => {
    const preparedOptions = Array.isArray(options) ? options : [];
    return preparedOptions
      .map((option, index) => normalizeOption(option, index))
      .filter(Boolean);
  }, [options]);

  const filteredOptions = useMemo(() => {
    const matches = normalizedInputValue
      ? normalizedOptions.filter((option) => option.searchText.includes(normalizedInputValue))
      : normalizedOptions;

    const safeMaxCount = Number.isFinite(Number(maxVisibleOptions)) && Number(maxVisibleOptions) > 0
      ? Number(maxVisibleOptions)
      : 8;

    return matches.slice(0, safeMaxCount);
  }, [maxVisibleOptions, normalizedInputValue, normalizedOptions]);

  useEffect(() => {
    if (!showDropdown || !filteredOptions.length) {
      setHighlightedIndex(-1);
      return;
    }

    setHighlightedIndex((prev) => {
      if (prev < 0) return 0;
      if (prev >= filteredOptions.length) return filteredOptions.length - 1;
      return prev;
    });
  }, [filteredOptions, showDropdown]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const emitChange = (nextValue) => {
    onChange({
      target: {
        name,
        value: nextValue,
      },
    });
  };

  const handleInputChange = (event) => {
    emitChange(event.target.value);
    setShowDropdown(true);
  };

  const handleSelectOption = (option) => {
    emitChange(option?.value || "");
    setShowDropdown(false);
    setHighlightedIndex(-1);

    if (typeof onOptionSelect === "function") {
      onOptionSelect(option);
    }

    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setShowDropdown(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setShowDropdown(true);
      setHighlightedIndex((prev) => {
        if (!filteredOptions.length) return -1;
        if (prev < 0 || prev >= filteredOptions.length - 1) return 0;
        return prev + 1;
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setShowDropdown(true);
      setHighlightedIndex((prev) => {
        if (!filteredOptions.length) return -1;
        if (prev <= 0) return filteredOptions.length - 1;
        return prev - 1;
      });
      return;
    }

    if (event.key === "Enter" && showDropdown && highlightedIndex >= 0) {
      event.preventDefault();
      const selectedOption = filteredOptions[highlightedIndex];
      if (selectedOption) {
        handleSelectOption(selectedOption);
      }
    }
  };

  const shouldShowDropdown = showDropdown && normalizedInputValue.length > 0;

  const styles = {
    wrapper: {
      position: "relative",
      width: "100%",
    },
    control: {
      position: "relative",
    },
    input: {
      paddingRight: 36,
    },
    icon: {
      position: "absolute",
      right: 14,
      top: "50%",
      transform: "translateY(-50%)",
      color: "#98a2b3",
      fontSize: 14,
      pointerEvents: "none",
    },
    dropdown: {
      position: "absolute",
      left: 0,
      right: 0,
      marginTop: 8,
      borderRadius: 12,
      border: "1px solid #e4e7ec",
      background: "#fff",
      boxShadow: "0 12px 24px rgba(15, 23, 42, 0.1)",
      maxHeight: 220,
      overflowY: "auto",
      zIndex: 2100,
      padding: "6px",
    },
    option: {
      width: "100%",
      border: "none",
      borderRadius: 8,
      background: "transparent",
      color: "#344054",
      textAlign: "left",
      fontSize: 13,
      padding: "8px 10px",
      cursor: "pointer",
    },
    optionActive: {
      background: "#eff6ff",
      color: "#1d4ed8",
      fontWeight: 600,
    },
    empty: {
      fontSize: 12,
      color: "#98a2b3",
      padding: "8px 10px",
    },
  };

  return (
    <div style={styles.wrapper} ref={containerRef}>
      <div style={styles.control}>
        <input
          id={id}
          ref={inputRef}
          type="text"
          name={name}
          className={`app-field-input ${inputClassName}`.trim()}
          value={value || ""}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={styles.input}
          autoComplete="off"
          disabled={disabled}
        />
      </div>

      {shouldShowDropdown ? (
        <div style={styles.dropdown}>
          {filteredOptions.length === 0 ? (
            <div style={styles.empty}>{emptyText}</div>
          ) : (
            filteredOptions.map((option, index) => (
              <button
                key={`${option.id}-${index}`}
                type="button"
                style={{
                  ...styles.option,
                  ...(highlightedIndex === index ? styles.optionActive : null),
                }}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelectOption(option)}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ContactAutoFillSelect;
