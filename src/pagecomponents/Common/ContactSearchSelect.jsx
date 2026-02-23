import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { searchData } from "../../redux/slices/ContactSlice";

const normalizeText = (value) => String(value || "").trim();

const buildDisplayName = (firstName, lastName, contactId) => {
    const primary = normalizeText(firstName);
    const secondary = normalizeText(lastName);
    const hasLastNameInPrimary =
        primary &&
        secondary &&
        (primary.toLowerCase() === secondary.toLowerCase() ||
            primary.toLowerCase().endsWith(` ${secondary.toLowerCase()}`));
    const fullName = hasLastNameInPrimary
        ? primary
        : [primary, secondary].filter(Boolean).join(" ").trim();
    return fullName || `Contact ${contactId}`;
};

const getContactType = (contact = {}) => {
    const rawType =
        contact.contact_Type ||
        contact.contactType ||
        contact.type ||
        contact?.contact?.contact_Type ||
        "";
    const normalized = normalizeText(rawType).toUpperCase();
    return normalized || "MAIN";
};

const mapContact = (contact = {}) => {
    const id = Number(
        contact.contact_Id ||
        contact.contact_Contact_Id ||
        contact.contactId ||
        contact.id ||
        0,
    );

    return {
        id,
        name: buildDisplayName(
            contact.first_name ||
            contact.firstName ||
            contact.spouse_first_name ||
            contact.contact_name ||
            contact.contact_Primary_Full_Name ||
            contact.full_name ||
            contact.name,
            contact.last_name ||
            contact.lastName ||
            contact.spouse_last_name ||
            contact.contact_last_name ||
            contact.contact_Last_Name,
            id,
        ),
        type: getContactType(contact),
        isSelectable: contact.isSelectable !== false,
        isExistInFamily: contact.isExistInFamily === true,
    };
};

const buildExternalOption = (
    option = {},
    optionIdKey,
    optionLabelKey,
    mapOption,
) => {
    if (typeof mapOption === "function") {
        return mapOption(option);
    }

    const rawId =
        option?.[optionIdKey] ??
        option?.id ??
        option?.event_Id ??
        option?.family_group_Id ??
        option?.family_group_id ??
        0;
    const id = Number(rawId);
    if (!Number.isFinite(id) || id <= 0) return null;

    const rawName =
        option?.[optionLabelKey] ??
        option?.name ??
        option?.event_name ??
        option?.family_group_Name ??
        option?.family_group_name ??
        `Item ${id}`;

    return {
        id,
        name: normalizeText(rawName) || `Item ${id}`,
        type: getContactType(option),
        isSelectable: option?.isSelectable !== false,
        isExistInFamily: option?.isExistInFamily === true,
    };
};

const mapValueItem = (item = {}) => {
    const id = Number(
        item.id ||
        item.contact_Id ||
        item.contactId ||
        item.contact_Contact_Id ||
        0,
    );
    if (!Number.isFinite(id) || id <= 0) return null;

    const name =
        normalizeText(item.name) ||
        normalizeText(item.displayName) ||
        normalizeText(item.label) ||
        buildDisplayName(
            item.first_name ||
            item.firstName ||
            item.spouse_first_name ||
            item.contact_name ||
            item.contact_Primary_Full_Name ||
            item.full_name,
            item.last_name ||
            item.lastName ||
            item.spouse_last_name ||
            item.contact_last_name ||
            item.contact_Last_Name,
            id,
        );

    return {
        id,
        name: name || `Contact ${id}`,
        type: getContactType(item),
        isSelectable: item.isSelectable !== false,
        isExistInFamily: item.isExistInFamily === true,
    };
};

const mergeById = (existing = [], incoming = []) => {
    const map = new Map(existing.map((item) => [Number(item.id), item]));

    incoming.forEach((item) => {
        const id = Number(item?.id);
        if (Number.isFinite(id) && id > 0) {
            map.set(id, item);
        }
    });

    return Array.from(map.values());
};

const areSelectedItemsEqual = (prev = [], next = []) => {
    if (prev.length !== next.length) return false;

    for (let i = 0; i < prev.length; i += 1) {
        if (Number(prev[i]?.id) !== Number(next[i]?.id)) return false;
        if (String(prev[i]?.name || "") !== String(next[i]?.name || "")) return false;
        if (String(prev[i]?.type || "") !== String(next[i]?.type || "")) return false;
    }

    return true;
};

const ContactSearchSelect = ({
    id,
    name,
    value,
    onChange = () => {},
    onSelectionChange,
    placeholder = "Search",
    familyGroupId = null,
    isDropDownFlowUpward = true,
    options,
    onSearch,
    optionIdKey,
    optionLabelKey,
    mapOption,
    loading: externalLoading = false,
    useExternalOptions = false,
}) => {
    const dispatch = useDispatch();
    const [searchInput, setSearchInput] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [contactsCache, setContactsCache] = useState([]);
    const [queryResults, setQueryResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const searchRequestRef = useRef(0);
    const queryCacheRef = useRef(new Map());
    const isExternal = useExternalOptions || Array.isArray(options) || typeof onSearch === "function";

    const styles = {
        wrapper: {
            width: "100%",
            position: "relative",
        },
        searchBar: {
            minHeight: 42,
            borderRadius: 999,
            border: "1px solid #d9dee7",
            background: "#f8fafd",
            display: "flex",
            alignItems: "center",
            alignContent: "center",
            gap: 8,
            padding: "6px 44px 6px 12px",
            flexWrap: "nowrap",
            overflowX: "auto",
            overflowY: "hidden",
            boxShadow: "none",
            scrollbarWidth: "thin",
        },
        searchBarFocused: {
            borderColor: "#8cb3ff",
            background: "#ffffff",
            boxShadow: "0 0 0 3px rgba(11, 99, 246, 0.12)",
        },
        chip: {
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 999,
            border: "1px solid #4f6cf7",
            background: "#f2f5ff",
            color: "#1e40af",
            fontSize: 12,
            fontWeight: 600,
            flex: "0 0 auto",
        },
        chipRemove: {
            border: "none",
            background: "transparent",
            color: "#1e40af",
            fontSize: 14,
            cursor: "pointer",
            lineHeight: 1,
        },
        input: {
            flex: "1 0 180px",
            minWidth: 160,
            border: "none",
            outline: "none",
            fontSize: 13,
            color: "#1f2937",
            padding: "4px 0",
            background: "transparent",
        },
        searchIcon: {
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#98a2b3",
            fontSize: 16,
            pointerEvents: "none",
        },
        dropdown: {
            position: isDropDownFlowUpward ? "absolute" : "relative",
            left: 0,
            right: 0,
            marginTop: 10,
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            background: "#fff",
            padding: "10px 0",
            boxShadow: "0 14px 24px rgba(15, 23, 42, 0.08)",
            maxHeight: 280,
            overflowY: "auto",
            zIndex: 1055,
        },
        option: {
            width: "100%",
            padding: "10px 18px",
            border: "none",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 15,
            color: "#94a3b8",
            textAlign: "left",
            cursor: "pointer",
        },
        optionActive: {
            color: "#111827",
            fontWeight: 600,
        },
        optionDisabled: {
            color: "#cbd5f5",
            cursor: "not-allowed",
        },
        radio: {
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: "2px solid #9aa4b2",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
        },
        radioSelected: {
            borderColor: "#0b63f3",
        },
        radioDot: {
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#0b63f3",
        },
        empty: {
            padding: "12px 18px",
            fontSize: 13,
            color: "#94a3b8",
        },
        badge: {
            marginLeft: "auto",
            fontSize: 10,
            fontWeight: 700,
            color: "#be123c",
            background: "#fff1f2",
            border: "1px solid #f5b6b8",
            borderRadius: 999,
            padding: "2px 8px",
        },
    };

    const fetchContacts = useCallback(
        async (term = "") => {
            if (isExternal) return;
            const normalizedTerm = normalizeText(term);
            const cacheKey = `${Number(familyGroupId) || 0}::${normalizedTerm.toLowerCase()}`;
            const requestId = searchRequestRef.current + 1;
            searchRequestRef.current = requestId;

            const cachedResults = queryCacheRef.current.get(cacheKey);
            if (Array.isArray(cachedResults)) {
                if (requestId !== searchRequestRef.current) return;
                setQueryResults(cachedResults);
                setContactsCache((prev) => mergeById(prev, cachedResults));
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const params = {
                    inputData: {
                        filter: {
                            name: normalizedTerm,
                            family_group_Id: Number(familyGroupId) || 0,
                        },
                    },
                };

                const { payload } = await dispatch(searchData(params));
                if (requestId !== searchRequestRef.current) return;

                const uniqueById = (items = []) => {
                    const map = new Map();
                    items.forEach((item) => {
                        const id = Number(item?.id);
                        if (Number.isFinite(id) && id > 0) map.set(id, item);
                    });
                    return Array.from(map.values());
                };

                const mapped = Array.isArray(payload?.data)
                    ? payload.data
                        .map((contact) => mapContact(contact))
                        .filter((item) => Number.isFinite(Number(item?.id)) && Number(item?.id) > 0)
                    : [];

                const uniqueMapped = uniqueById(mapped);

                queryCacheRef.current.set(cacheKey, uniqueMapped);
                setContactsCache((prev) => mergeById(prev, uniqueMapped));
                setQueryResults(uniqueMapped);
            } catch (error) {
                if (requestId !== searchRequestRef.current) return;
                setQueryResults([]);
            } finally {
                if (requestId === searchRequestRef.current) {
                    setLoading(false);
                }
            }
        },
        [dispatch, familyGroupId, isExternal],
    );

    useEffect(() => {
        if (!isExternal) return;
        const externalOptions = Array.isArray(options) ? options : [];
        const mapped = externalOptions
            .map((option) => buildExternalOption(option, optionIdKey, optionLabelKey, mapOption))
            .filter((item) => Number.isFinite(Number(item?.id)) && Number(item?.id) > 0);

        setQueryResults(mapped);
        setContactsCache((prev) => mergeById(prev, mapped));
    }, [isExternal, mapOption, optionIdKey, optionLabelKey, options]);

    useEffect(() => {
        const valueArray = Array.isArray(value) ? value : [];
        const valueItems = valueArray
            .filter((item) => item && typeof item === "object")
            .map((item) => mapValueItem(item))
            .filter(Boolean);
        const valueItemMap = new Map(valueItems.map((item) => [Number(item.id), item]));

        const selectedIds = [
            ...new Set(
                valueArray
                    .map((item) => (item && typeof item === "object" ? item.id || item.contact_Id : item))
                    .map((item) => Number(item))
                    .filter((contactId) => Number.isFinite(contactId) && contactId > 0),
            ),
        ];

        setSelectedItems((prev) => {
            if (!selectedIds.length) {
                return prev.length ? [] : prev;
            }

            const nextSelected = selectedIds.map((selectedId) => {
                const valueItem = valueItemMap.get(selectedId);
                const cached = contactsCache.find((item) => Number(item.id) === selectedId);
                const prevSelected = prev.find((item) => Number(item.id) === selectedId);

                return (
                    valueItem ||
                    cached ||
                    prevSelected || {
                        id: selectedId,
                        name: `Contact ${selectedId}`,
                        type: "MAIN",
                        isSelectable: true,
                        isExistInFamily: false,
                    }
                );
            });

            return areSelectedItemsEqual(prev, nextSelected) ? prev : nextSelected;
        });
    }, [contactsCache, value]);

    useEffect(() => {
        if (!showDropdown || isExternal) return;

        const normalizedTerm = normalizeText(searchInput);
        const timer = setTimeout(() => {
            fetchContacts(normalizedTerm);
        }, 350);

        return () => clearTimeout(timer);
    }, [fetchContacts, isExternal, searchInput, showDropdown]);

    useEffect(() => {
        if (!showDropdown || !isExternal || typeof onSearch !== "function") return;
        const timer = setTimeout(() => {
            onSearch(searchInput);
        }, 300);

        return () => clearTimeout(timer);
    }, [isExternal, onSearch, searchInput, showDropdown]);

    useEffect(() => {
        queryCacheRef.current = new Map();
        searchRequestRef.current = 0;
        setSearchInput("");
        setShowDropdown(false);
        setQueryResults([]);
        setLoading(false);
    }, [familyGroupId]);

    const selectedIdSet = useMemo(
        () => new Set(selectedItems.map((item) => Number(item.id))),
        [selectedItems],
    );

    const isLoading = isExternal ? externalLoading : loading;
    const selectionRef = useRef([]);

    useEffect(() => {
        if (typeof onSelectionChange !== "function") return;
        if (areSelectedItemsEqual(selectionRef.current, selectedItems)) return;
        selectionRef.current = selectedItems;
        onSelectionChange(selectedItems);
    }, [onSelectionChange, selectedItems]);

    const handleInputChange = (e) => {
        console.log(e);
        
        const input = e.target.value;
        setSearchInput(input);
        setShowDropdown(true);
    };

    const handleSelectItem = (item) => {
        // console.log(item);
        
        const alreadySelected = selectedItems.some((selectedItem) => Number(selectedItem.id) === Number(item?.id));
        const alreadyInFamily = item?.isExistInFamily === true;

        if (!item?.isSelectable || alreadyInFamily || alreadySelected) return;

        const newSelectedItems = [...selectedItems, item];
        // const newSelectedItems = [item];
        // console.log("New Selected Items:", newSelectedItems);
        
        setSelectedItems(newSelectedItems);
        setSearchInput("");
        setQueryResults([]);
        setShowDropdown(false);

        onChange({
            target: {
                name,
                value: newSelectedItems.map((selectedItem) => selectedItem.id),
            },
        });
    };

    const handleRemoveItem = (contactId) => {
        const updated = selectedItems.filter((item) => Number(item.id) !== Number(contactId));
        setSelectedItems(updated);

        onChange({
            target: {
                name,
                value: updated.map((item) => item.id),
            },
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div style={styles.wrapper} ref={containerRef}>
            <div
                style={{
                    ...styles.searchBar,
                    ...(showDropdown ? styles.searchBarFocused : null),
                }}
                onClick={() => {
                    setShowDropdown(true);
                    inputRef.current?.focus();
                }}
            >
                {selectedItems.map((item) => (
                    <span key={item.id} style={styles.chip}>
                        {item.name}
                        <button
                            type="button"
                            style={styles.chipRemove}
                            onClick={(event) => {
                                event.stopPropagation();
                                handleRemoveItem(item.id);
                            }}
                            aria-label={`Remove ${item.name}`}
                        >
                            x
                        </button>
                    </span>
                ))}
                <input
                    id={id}
                    ref={inputRef}
                    type="text"
                    name={name}
                    placeholder={selectedItems.length ? "" : placeholder}
                    value={searchInput}
                    onChange={handleInputChange}
                    style={styles.input}
                />
                <span style={styles.searchIcon}>
                    <i className={`si ${isLoading ? "si-loader spin" : "si-magnifier"}`} />
                </span>
            </div>

            {showDropdown && (
                <div style={styles.dropdown}>
                    {isLoading && <div style={styles.empty}>Searching contacts...</div>}

                    {!isLoading && queryResults.length === 0 && (
                        <div style={styles.empty}>
                            {normalizeText(searchInput).length === 0
                                ? "Start typing to search contacts"
                                : "No contacts found"}
                        </div>
                    )}

                    {!isLoading && queryResults.length > 0 &&
                        queryResults.map((item) => {
                            const isSelected = selectedIdSet.has(Number(item.id));
                            const shouldDisable =
                                item.isSelectable === false || item.isExistInFamily === true;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    style={{
                                        ...styles.option,
                                        ...(isSelected ? styles.optionActive : null),
                                        ...(shouldDisable ? styles.optionDisabled : null),
                                    }}
                                    onClick={() => handleSelectItem(item)}
                                    disabled={shouldDisable}
                                >
                                    <span
                                        style={{
                                            ...styles.radio,
                                            ...(isSelected ? styles.radioSelected : null),
                                        }}
                                    >
                                        {isSelected ? <span style={styles.radioDot} /> : null}
                                    </span>
                                    {item.name}
                                    {item.isExistInFamily && <span style={styles.badge}>Duplicate</span>}
                                </button>
                            );
                        })}
                </div>
            )}
        </div>
    );
};

export default ContactSearchSelect;

