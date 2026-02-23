import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import './FamilyHeadNameSearch.scss';
import { searchData } from '../../redux/slices/ContactSlice';

const normalizeText = (value) => String(value || '').trim();

const buildDisplayName = (firstName, lastName, contactId) => {
    const fullName = [normalizeText(firstName), normalizeText(lastName)].filter(Boolean).join(' ').trim();
    return fullName || `Contact ${contactId}`;
};

const mapContact = (contact = {}) => {
    const id = Number(contact.contact_Id || contact.contact_Contact_Id || 0);

    return {
        id,
        name: buildDisplayName(contact.contact_name, contact.contact_last_name, id),
        isSelectable: contact.isSelectable !== false,
        isExistInFamily: contact.isExistInFamily === true,
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
        if (String(prev[i]?.name || '') !== String(next[i]?.name || '')) return false;
    }

    return true;
};

const FamilyHeadNameSearch = ({
    id,
    name,
    value,
    onChange,
    placeholder = 'Search Family Head...',
    familyGroupId = null,
}) => {
    console.log(value);
    
    const dispatch = useDispatch();
    const [searchInput, setSearchInput] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [contactsCache, setContactsCache] = useState([]);
    const [queryResults, setQueryResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);
    const searchRequestRef = useRef(0);
    const queryCacheRef = useRef(new Map());

    const fetchContacts = useCallback(
        async (term = '') => {
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

                const mapped = Array.isArray(payload?.data)
                    ? payload.data
                          .map((contact) => mapContact(contact))
                          .filter((item) => Number.isFinite(Number(item?.id)) && Number(item?.id) > 0)
                    : [];

                queryCacheRef.current.set(cacheKey, mapped);
                setContactsCache((prev) => mergeById(prev, mapped));
                setQueryResults(mapped);
            } catch (error) {
                if (requestId !== searchRequestRef.current) return;
                console.error('Error fetching contacts:', error);
                setQueryResults([]);
            } finally {
                if (requestId === searchRequestRef.current) {
                    setLoading(false);
                }
            }
        },
        [dispatch, familyGroupId],
    );

    useEffect(() => {
        // const contactId = value.head_contact_Id;
        const selectedIds = Array.isArray(value)
            ? [...new Set(value.map((item) => Number(item)).filter((contactId) => Number.isFinite(contactId) && contactId > 0))]
            : [];

        setSelectedItems((prev) => {
            if (!selectedIds.length) {
                return prev.length ? [] : prev;
            }

            const nextSelected = selectedIds.map((selectedId) => {
                const cached = contactsCache.find((item) => Number(item.id) === selectedId);
                const prevSelected = prev.find((item) => Number(item.id) === selectedId);

                return (
                    cached ||
                    prevSelected || {
                        id: selectedId,
                        name: `Contact ${selectedId}`,
                        isSelectable: true,
                        isExistInFamily: false,
                    }
                );
            });

            return areSelectedItemsEqual(prev, nextSelected) ? prev : nextSelected;
        });
    }, [contactsCache, value]);

    const contactName = (id) => {
        return id;
    }

    // useEffect(() => {
    //     const selectedDataSet = value.headmembers;

    //     setSelectedItems((prev) => {
    //         if (!selectedDataSet.length) {
    //             return prev.length ? [] : prev;
    //         }

    //         const nextSelected = selectedDataSet.map((selectedData) => {
    //             const cached = contactsCache.find((item) => Number(item.id) === selectedData.contact.contact_Contact_Id);
    //             const prevSelected = prev.find((item) => Number(item.id) === selectedData.contact.contact_Contact_Id);

    //             return (
    //                 cached ||
    //                 prevSelected || {
    //                     id: selectedData.contact.contact_Contact_Id,
    //                     name: selectedData.contact.contact_Primary_Full_Name,
    //                     isSelectable: true,
    //                     isExistInFamily: false,
    //                 }
    //             );
    //         });

    //         return areSelectedItemsEqual(prev, nextSelected) ? prev : nextSelected;
    //     });
    // }, [contactsCache, value]);

    useEffect(() => {
        if (!showDropdown) return;

        const normalizedTerm = normalizeText(searchInput);
        if (!normalizedTerm) {
            setLoading(false);
            setQueryResults([]);
            return;
        }

        const timer = setTimeout(() => {
            fetchContacts(normalizedTerm);
        }, 350);

        return () => clearTimeout(timer);
    }, [fetchContacts, searchInput, showDropdown]);

    useEffect(() => {
        queryCacheRef.current = new Map();
        searchRequestRef.current = 0;
        setSearchInput('');
        setShowDropdown(false);
        setQueryResults([]);
        setLoading(false);
    }, [familyGroupId]);

    const suggestions = useMemo(() => {
        const selectedIdSet = new Set(selectedItems.map((item) => Number(item.id)));
        return queryResults.filter((item) => !selectedIdSet.has(Number(item.id)));
    }, [queryResults, selectedItems]);

    const handleInputChange = (e) => {
        const input = e.target.value;
        setSearchInput(input);
        setShowDropdown(true);
    };

    const handleSelectItem = (item) => {
        const alreadySelected = selectedItems.some((selectedItem) => Number(selectedItem.id) === Number(item?.id));
        const alreadyInFamily = item?.isExistInFamily === true;

        if (!item?.isSelectable || alreadyInFamily || alreadySelected) return;

        const newSelectedItems = [...selectedItems, item];
        setSelectedItems(newSelectedItems);
        setSearchInput('');
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

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="family-head-search-wrapper" ref={containerRef}>
            {selectedItems.length > 0 && (
                <div className="selected-items-container">
                    {selectedItems.map((item) => (
                        // console.log(item);
                        
                        <span key={item.id} className="selected-item">
                            {item.name}
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={() => handleRemoveItem(item.id)}
                                aria-label={`Remove ${item.name}`}
                            >
                                x
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <Form.Control
                id={id}
                type="text"
                className="form-control family-head-search-input"
                placeholder={placeholder}
                value={searchInput}
                onChange={handleInputChange}
                onFocus={() => {
                    setShowDropdown(true);
                }}
            />

            <span className="family-head-search-icon">
                <i className={`si ${loading ? 'si-loader spin' : 'si-magnifier'}`}></i>
            </span>

            {showDropdown && (
                <div className="family-head-search-dropdown dropdown-menu show">
                    {loading && <div className="family-head-search-empty">Searching contacts...</div>}

                    {!loading && normalizeText(searchInput).length === 0 && (
                        <div className="family-head-search-empty">Type to search contacts</div>
                    )}

                    {!loading && normalizeText(searchInput).length > 0 && suggestions.length > 0 &&
                        suggestions.map((item) => {
                            const alreadySelected = selectedItems.some(
                                (selectedItem) => Number(selectedItem.id) === Number(item.id),
                            );
                            const shouldDisable =
                                item.isSelectable === false || item.isExistInFamily === true || alreadySelected;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`dropdown-item ${shouldDisable ? 'is-disabled' : ''}`}
                                    onClick={() => handleSelectItem(item)}
                                    disabled={shouldDisable}
                                >
                                    <span className="family-head-option">
                                        <span className="family-head-option-name">{item.name}</span>
                                        {item.isExistInFamily && <span className="family-head-option-badge">Duplicate</span>}
                                    </span>
                                </button>
                            );
                        })}

                    {!loading && normalizeText(searchInput).length > 0 && suggestions.length === 0 && (
                        <div className="family-head-search-empty">No contacts found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FamilyHeadNameSearch;

