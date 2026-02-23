import { useEffect, useMemo, useRef, useState } from "react";

const styles = {
    wrapper: {
        position: "relative",
        width: "100%",
    },
    input: {
        cursor: "pointer",
    },
    panel: {
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        zIndex: 1055,
        width: 250,
        borderRadius: 12,
        background: "#fff",
        boxShadow: "0 10px 18px rgba(16, 24, 40, 0.18)",
        overflow: "hidden",
    },
    header: {
        padding: "10px 12px",
        background: "linear-gradient(180deg, #3b82ff 0%, #2563eb 100%)",
        color: "#fff",
        fontSize: 16,
        fontWeight: 700,
    },
    body: {
        padding: "12px 12px 8px",
        background: "#fff",
    },
    controlsRow: {
        display: "flex",
        alignItems: "center",
        flexWrap: "nowrap",
        gap: 8,
        marginBottom: 10,
    },
    selectWrap: {
        position: "relative",
        minWidth: 56,
        flex: "0 0 auto",
    },
    select: {
        height: 34,
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        padding: "0 28px 0 12px",
        fontSize: 12,
        fontWeight: 600,
        background: "#fff",
        color: "#374151",
        width: 60,
        appearance: "none",
        cursor: "pointer",
        boxShadow: "0 1px 4px rgba(16, 24, 40, 0.08)",
    },
    selectIcon: {
        position: "absolute",
        right: 10,
        top: "50%",
        transform: "translateY(-50%)",
        color: "#6b7280",
        fontSize: 12,
        pointerEvents: "none",
    },
    separator: {
        fontSize: 14,
        fontWeight: 700,
        color: "#6b7280",
    },
    ampmGroup: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        padding: 3,
        background: "#f8fafc",
        flexShrink: 0,
        maxWidth: "100%",
    },
    ampmButton: {
        border: "none",
        borderRadius: 999,
        padding: "4px 8px",
        fontSize: 10,
        fontWeight: 700,
        color: "#6b7280",
        background: "transparent",
        cursor: "pointer",
    },
    ampmActive: {
        background: "#0b63f3",
        color: "#fff",
        boxShadow: "0 4px 8px rgba(11, 99, 243, 0.3)",
    },
    footer: {
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        padding: "10px 12px 14px",
        background: "#fff",
    },
    cancel: {
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        background: "#fff",
        padding: "6px 16px",
        fontSize: 12,
        fontWeight: 600,
        color: "#3f3f46",
        minWidth: 90,
    },
    selectButton: {
        borderRadius: 999,
        border: "none",
        padding: "6px 18px",
        fontSize: 12,
        fontWeight: 600,
        color: "#fff",
        background: "linear-gradient(180deg, #3b82ff 0%, #2563eb 100%)",
        boxShadow:
            "0 6px 12px rgba(37, 99, 235, 0.28), inset 0 -2px 0 rgba(0, 0, 0, 0.15)",
        minWidth: 100,
    },
    selectDisabled: {
        opacity: 0.6,
        boxShadow: "none",
        cursor: "not-allowed",
    },
};

const TimePicker = ({
    value,
    onChange,
    placeholder = "Select time",
    name,
    inputClassName = "",
    disabled = false,
    confirmable = true,
    options = [],
    format = "12",
    minuteInterval = 0,
}) => {
    const _options = options;
    void _options;
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const is12Hour = format === "12" || format === 12 || format === "12h";
    const minuteStep = Math.max(1, Number(minuteInterval) || 0);

    const [draftHour, setDraftHour] = useState(null);
    const [draftMinute, setDraftMinute] = useState(null);
    const [draftPeriod, setDraftPeriod] = useState("AM");

    const hours = useMemo(() => {
        if (is12Hour) {
            return Array.from({ length: 12 }, (_, idx) => idx + 1);
        }
        return Array.from({ length: 24 }, (_, idx) => idx);
    }, [is12Hour]);

    const minutes = useMemo(() => {
        const list = [];
        for (let i = 0; i < 60; i += minuteStep) {
            list.push(i);
        }
        return list;
    }, [minuteStep]);

    const formatTimeValue = (hour, minute, period) => {
        if (hour === null || minute === null) return "";
        const minuteLabel = String(minute).padStart(2, "0");
        if (is12Hour) {
            return `${hour}:${minuteLabel} ${period}`;
        }
        return `${String(hour).padStart(2, "0")}:${minuteLabel}`;
    };

    const parseTimeValue = (inputValue) => {
        if (!inputValue || typeof inputValue !== "string") return null;
        const trimmed = inputValue.trim();
        const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);

        if (match12) {
            const hour = Math.min(12, Math.max(1, Number(match12[1])));
            const minute = Math.min(59, Math.max(0, Number(match12[2])));
            const period = match12[3].toUpperCase();
            if (!is12Hour) {
                let hour24 = hour;
                if (period === "PM" && hour24 < 12) hour24 += 12;
                if (period === "AM" && hour24 === 12) hour24 = 0;
                return { hour: hour24, minute, period: "AM" };
            }
            return { hour, minute, period };
        }

        if (match24) {
            const hour24 = Math.min(23, Math.max(0, Number(match24[1])));
            const minute = Math.min(59, Math.max(0, Number(match24[2])));
            if (is12Hour) {
                const period = hour24 >= 12 ? "PM" : "AM";
                const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
                return { hour, minute, period };
            }
            return { hour: hour24, minute, period: "AM" };
        }

        return null;
    };

    const normalizeMinute = (minute) => {
        if (!Number.isFinite(minute)) return minutes[0] ?? 0;
        if (minuteStep <= 1) return minute;
        const normalized = Math.floor(minute / minuteStep) * minuteStep;
        return Math.min(59, Math.max(0, normalized));
    };

    useEffect(() => {
        const parsed = parseTimeValue(value);
        if (!parsed) {
            setDraftHour(null);
            setDraftMinute(null);
            setDraftPeriod("AM");
            return;
        }

        setDraftHour(parsed.hour);
        setDraftMinute(normalizeMinute(parsed.minute));
        setDraftPeriod(parsed.period);
    }, [value, minuteStep, is12Hour]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const handleClick = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                if (confirmable) {
                    const parsed = parseTimeValue(value);
                    if (parsed) {
                        setDraftHour(parsed.hour);
                        setDraftMinute(normalizeMinute(parsed.minute));
                        setDraftPeriod(parsed.period);
                    }
                }
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [confirmable, isOpen, value, minuteStep, is12Hour]);

    const openPicker = () => {
        if (!disabled) {
            if (draftHour === null || draftMinute === null) {
                setDraftHour(hours[0]);
                setDraftMinute(minutes[0] ?? 0);
            }
            setIsOpen(true);
        }
    };

    const commitValue = (hour, minute, period) => {
        onChange?.(formatTimeValue(hour, minute, period));
    };

    const handleCancel = () => {
        const parsed = parseTimeValue(value);
        if (parsed) {
            setDraftHour(parsed.hour);
            setDraftMinute(normalizeMinute(parsed.minute));
            setDraftPeriod(parsed.period);
        }
        setIsOpen(false);
    };

    const handleSelect = () => {
        if (confirmable && draftHour !== null && draftMinute !== null) {
            commitValue(draftHour, draftMinute, draftPeriod);
        }
        setIsOpen(false);
    };

    const activeValue =
        draftHour === null || draftMinute === null
            ? ""
            : formatTimeValue(draftHour, draftMinute, draftPeriod);

    return (
        <div className="app-time-picker" ref={wrapperRef} style={styles.wrapper}>
            <input
                type="text"
                name={name}
                className={`app-field-input app-time-picker-input ${inputClassName}`.trim()}
                placeholder={placeholder}
                value={activeValue || ""}
                onClick={openPicker}
                onFocus={openPicker}
                readOnly
                disabled={disabled}
                style={styles.input}
            />

            {isOpen && (
                <div className="app-time-picker-panel" role="dialog" style={styles.panel}>
                    <div className="app-time-picker-header" style={styles.header}>
                        Time
                    </div>
                    <div className="app-time-picker-body" style={styles.body}>
                        <div style={styles.controlsRow}>
                            <div style={styles.selectWrap}>
                                <select
                                    style={styles.select}
                                    value={draftHour ?? ""}
                                    onChange={(event) => {
                                        const nextHour = Number(event.target.value);
                                        setDraftHour(nextHour);
                                        if (!confirmable) {
                                            commitValue(
                                                nextHour,
                                                draftMinute ?? minutes[0] ?? 0,
                                                draftPeriod
                                            );
                                        }
                                    }}
                                >
                                    {hours.map((hour) => (
                                        <option key={hour} value={hour}>
                                            {is12Hour ? hour : String(hour).padStart(2, "0")}
                                        </option>
                                    ))}
                                </select>
                                <i className="bi bi-chevron-down" style={styles.selectIcon} />
                            </div>

                            <span style={styles.separator}>:</span>

                            <div style={styles.selectWrap}>
                                <select
                                    style={styles.select}
                                    value={draftMinute ?? ""}
                                    onChange={(event) => {
                                        const nextMinute = Number(event.target.value);
                                        setDraftMinute(nextMinute);
                                        if (!confirmable) {
                                            commitValue(
                                                draftHour ?? hours[0],
                                                nextMinute,
                                                draftPeriod
                                            );
                                        }
                                    }}
                                >
                                    {minutes.map((minute) => (
                                        <option key={minute} value={minute}>
                                            {String(minute).padStart(2, "0")}
                                        </option>
                                    ))}
                                </select>
                                <i className="bi bi-chevron-down" style={styles.selectIcon} />
                            </div>

                            {is12Hour && (
                                <div style={styles.ampmGroup}>
                                    {["AM", "PM"].map((period) => (
                                        <button
                                            key={period}
                                            type="button"
                                            style={{
                                                ...styles.ampmButton,
                                                ...(draftPeriod === period
                                                    ? styles.ampmActive
                                                    : {}),
                                            }}
                                            onClick={() => {
                                                setDraftPeriod(period);
                                                if (!confirmable) {
                                                    commitValue(
                                                        draftHour ?? hours[0],
                                                        draftMinute ?? minutes[0] ?? 0,
                                                        period
                                                    );
                                                }
                                            }}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {confirmable && (
                        <div className="app-time-picker-footer" style={styles.footer}>
                            <button
                                type="button"
                                className="app-time-picker-cancel"
                                onClick={handleCancel}
                                style={styles.cancel}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="app-time-picker-select"
                                onClick={handleSelect}
                                disabled={draftHour === null || draftMinute === null}
                                style={{
                                    ...styles.selectButton,
                                    ...(draftHour === null || draftMinute === null
                                        ? styles.selectDisabled
                                        : {}),
                                }}
                            >
                                Select
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TimePicker;

