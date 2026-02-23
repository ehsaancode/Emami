import { useEffect, useMemo, useRef, useState } from "react";

const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

const formatDate = (date) => {
    if (!date) return "";
    const day = `${date.getDate()}`.padStart(2, "0");
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    return `${day}/${month}/${date.getFullYear()}`;
};

const isSameDay = (a, b) => {
    if (!a || !b) return false;
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
};

const buildCalendar = (viewDate) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const startDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];
    for (let i = startDay - 1; i >= 0; i -= 1) {
        cells.push({ day: daysInPrevMonth - i, offset: -1 });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        cells.push({ day, offset: 0 });
    }

    let nextDay = 1;
    while (cells.length < 42) {
        cells.push({ day: nextDay, offset: 1 });
        nextDay += 1;
    }

    return cells;
};

const toDate = (value) => {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
};

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
        width: 240,
        borderRadius: 12,
        background: "#fff",
        boxShadow: "0 10px 18px rgba(16, 24, 40, 0.18)",
        overflow: "hidden",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 10px 6px",
        background: "linear-gradient(180deg, #3b82ff 0%, #2563eb 100%)",
        color: "#fff",
    },
    monthGroup: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 16,
        fontWeight: 700,
    },
    yearGroup: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 16,
        fontWeight: 700,
    },
    yearNav: {
        display: "flex",
        flexDirection: "column",
        lineHeight: 1,
    },
    nav: {
        border: "none",
        background: "transparent",
        color: "#fff",
        fontSize: 12,
        lineHeight: 1,
        padding: "0 4px",
        cursor: "pointer",
    },
    weekdays: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        padding: "8px 8px 0",
        background: "#fff",
    },
    weekday: {
        textAlign: "center",
        fontSize: 11,
        fontWeight: 600,
        color: "#98a2b3",
        paddingBottom: 4,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 2,
        padding: "0 8px 8px",
    },
    day: {
        width: 26,
        height: 26,
        borderRadius: 999,
        border: "none",
        background: "transparent",
        fontSize: 11,
        fontWeight: 600,
        color: "#4b5563",
        margin: "0 auto",
        cursor: "pointer",
    },
    dayOutside: {
        color: "#cbd5e1",
    },
    daySelected: {
        background: "#0b63f3",
        color: "#fff",
        boxShadow: "0 4px 10px rgba(11, 99, 243, 0.3)",
    },
    footer: {
        display: "flex",
        justifyContent: "space-between",
        gap: 8,
        padding: "8px 10px 12px",
        background: "#fff",
    },
    cancel: {
        borderRadius: 999,
        border: "1px solid #e6e9ef",
        background: "#fff",
        padding: "5px 14px",
        fontSize: 11,
        fontWeight: 600,
        color: "#2f343a",
        minWidth: 86,
    },
    select: {
        borderRadius: 999,
        border: "none",
        padding: "5px 18px",
        fontSize: 11,
        fontWeight: 600,
        color: "#fff",
        background: "linear-gradient(180deg, #3b82ff 0%, #2563eb 100%)",
        boxShadow:
            "0 6px 14px rgba(37, 99, 235, 0.32), inset 0 -2px 0 rgba(0, 0, 0, 0.15)",
        minWidth: 96,
    },
    selectDisabled: {
        opacity: 0.6,
        boxShadow: "none",
        cursor: "not-allowed",
    },
};

const DatePicker = ({
    value,
    onChange,
    placeholder = "dd/mm/yyyy",
    name,
    inputClassName = "",
    disabled = false,
    confirmable = true,
}) => {
    const normalizedValue = useMemo(() => toDate(value), [value]);
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(normalizedValue ?? new Date());
    const [draftDate, setDraftDate] = useState(normalizedValue ?? null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (normalizedValue) {
            setViewDate(normalizedValue);
        }
        setDraftDate(normalizedValue ?? null);
    }, [normalizedValue]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const handleClick = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                if (confirmable) {
                    setDraftDate(normalizedValue ?? null);
                }
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [confirmable, isOpen, value]);

    const openPicker = () => {
        if (!disabled) {
            setIsOpen(true);
        }
    };

    const commitDate = (date) => {
        onChange?.(date ?? null);
    };

    const handleDaySelect = (day, offset) => {
        const nextDate = new Date(
            viewDate.getFullYear(),
            viewDate.getMonth() + offset,
            day
        );
        if (offset !== 0) {
            setViewDate(
                new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1)
            );
        }

        if (confirmable) {
            setDraftDate(nextDate);
            return;
        }

        commitDate(nextDate);
        setIsOpen(false);
    };

    const handleCancel = () => {
        setDraftDate(normalizedValue ?? null);
        setIsOpen(false);
    };

    const handleSelect = () => {
        if (confirmable) {
            commitDate(draftDate ?? null);
        }
        setIsOpen(false);
    };

    const monthLabel = useMemo(
        () =>
            viewDate.toLocaleString("en-US", {
                month: "short",
            }),
        [viewDate]
    );

    const calendarCells = useMemo(() => buildCalendar(viewDate), [viewDate]);
    const activeDate = confirmable ? draftDate : normalizedValue;

    return (
        <div className="app-date-picker" ref={wrapperRef} style={styles.wrapper}>
            <input
                type="text"
                name={name}
                className={`app-field-input app-date-picker-input ${inputClassName}`.trim()}
                placeholder={placeholder}
                value={formatDate(activeDate)}
                onClick={openPicker}
                onFocus={openPicker}
                readOnly
                disabled={disabled}
                style={styles.input}
            />

            {isOpen && (
                <div className="app-date-picker-panel" role="dialog" style={styles.panel}>
                    <div className="app-date-picker-header" style={styles.header}>
                        <div className="app-date-picker-month-group" style={styles.monthGroup}>
                            <span>{monthLabel}</span>
                            <button
                                type="button"
                                className="app-date-picker-nav"
                                onClick={() =>
                                    setViewDate(
                                        new Date(
                                            viewDate.getFullYear(),
                                            viewDate.getMonth() - 1,
                                            1
                                        )
                                    )
                                }
                                style={styles.nav}
                            >
                                <i className="bi bi-chevron-left" />
                            </button>
                            <button
                                type="button"
                                className="app-date-picker-nav"
                                onClick={() =>
                                    setViewDate(
                                        new Date(
                                            viewDate.getFullYear(),
                                            viewDate.getMonth() + 1,
                                            1
                                        )
                                    )
                                }
                                style={styles.nav}
                            >
                                <i className="bi bi-chevron-right" />
                            </button>
                        </div>
                        <div className="app-date-picker-year-group" style={styles.yearGroup}>
                            <span>{viewDate.getFullYear()}</span>
                            <div className="app-date-picker-year-nav" style={styles.yearNav}>
                                <button
                                    type="button"
                                    className="app-date-picker-nav"
                                    onClick={() =>
                                        setViewDate(
                                            new Date(
                                                viewDate.getFullYear() + 1,
                                                viewDate.getMonth(),
                                                1
                                            )
                                        )
                                    }
                                    style={styles.nav}
                                >
                                    <i className="bi bi-chevron-up" />
                                </button>
                                <button
                                    type="button"
                                    className="app-date-picker-nav"
                                    onClick={() =>
                                        setViewDate(
                                            new Date(
                                                viewDate.getFullYear() - 1,
                                                viewDate.getMonth(),
                                                1
                                            )
                                        )
                                    }
                                    style={styles.nav}
                                >
                                    <i className="bi bi-chevron-down" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="app-date-picker-weekdays" style={styles.weekdays}>
                        {dayNames.map((dayName) => (
                            <div
                                key={dayName}
                                className="app-date-picker-weekday"
                                style={styles.weekday}
                            >
                                {dayName}
                            </div>
                        ))}
                    </div>

                    <div className="app-date-picker-grid" style={styles.grid}>
                        {calendarCells.map((cell, index) => {
                            const cellDate = new Date(
                                viewDate.getFullYear(),
                                viewDate.getMonth() + cell.offset,
                                cell.day
                            );
                            const isSelected = isSameDay(cellDate, activeDate);
                            const dayStyle = {
                                ...styles.day,
                                ...(cell.offset !== 0 ? styles.dayOutside : {}),
                                ...(isSelected ? styles.daySelected : {}),
                            };
                            return (
                                <button
                                    key={`${cell.day}-${cell.offset}-${index}`}
                                    type="button"
                                    className={`app-date-picker-day ${
                                        cell.offset !== 0 ? "outside" : ""
                                    } ${isSelected ? "selected" : ""}`.trim()}
                                    onClick={() => handleDaySelect(cell.day, cell.offset)}
                                    style={dayStyle}
                                >
                                    {cell.day}
                                </button>
                            );
                        })}
                    </div>

                    {confirmable && (
                        <div className="app-date-picker-footer" style={styles.footer}>
                            <button
                                type="button"
                                className="app-date-picker-cancel"
                                onClick={handleCancel}
                                style={styles.cancel}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="app-date-picker-select"
                                onClick={handleSelect}
                                disabled={!draftDate}
                                style={{
                                    ...styles.select,
                                    ...(!draftDate ? styles.selectDisabled : {}),
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

export default DatePicker;

