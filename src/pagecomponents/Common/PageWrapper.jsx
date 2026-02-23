import { useEffect, useRef, useState } from 'react';
import { Col, Row, Form } from 'react-bootstrap';
import CustomButton from '../Elements/Buttons/CustomButton';
import IconBox from './IconBox';

const PageWrapper = ({
  pageName,
  pageSubTitle,
  children,
  buttons,
  searchFieldPlaceholder,
  searchValue,
  onSearchChange,
  filterIcon,
  onClick,
}) => {
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const rightContentRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!rightContentRef.current) return;
      if (!rightContentRef.current.contains(event.target)) {
        setOpenMenuIndex(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const searchInputProps =
    typeof onSearchChange === 'function' ? { value: searchValue ?? '', onChange: onSearchChange } : {};
  const hasFilterIcons = Array.isArray(filterIcon) && filterIcon.length > 0;

  return (
    <div
      style={{
        width: '100%',
        padding: '0 1rem',
      }}
    >
      <div className="breadcrumb-header justify-content-between  align-items-center" style={{ marginBottom: '30px' }}>
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1 d-block">{pageName}</span>
          <small>{pageSubTitle}</small>
        </div>
        <div className="right-content" ref={rightContentRef}>
          {buttons?.map((btn, index) => (
            Array.isArray(btn?.menuItems) && btn.menuItems.length > 0 ? (
              <div key={index} className="mx-1" style={styles.menuWrap}>
                <CustomButton
                  title={`${btn.title}`}
                  onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                  style={{ backgroundColor: '#005FFF', color: '#fff' }}
                />
                {openMenuIndex === index && (
                  <div style={styles.menuPanel}>
                    {btn.menuItems.map((item, itemIndex) => (
                      <button
                        key={`${item.title}-${itemIndex}`}
                        type="button"
                        style={{
                          ...styles.menuItem,
                          ...(item?.disabled ? styles.menuItemDisabled : {}),
                        }}
                        onClick={() => {
                          if (item?.disabled) return;
                          item?.clickAction?.();
                          setOpenMenuIndex(null);
                        }}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <CustomButton
                key={index}
                title={`${btn.title}`}
                className="mx-1"
                onClick={btn.clickAction}
                style={{ backgroundColor: '#005FFF', color: '#fff' }}
              />
            )
          ))}
        </div>
      </div>

      {(searchFieldPlaceholder || hasFilterIcons) && (
        <div className="breadcrumb-header justify-content-between align-items-center">
          {searchFieldPlaceholder && (
            <div className="left-content" style={{ ...styles.leftContent }}>
              <div style={styles.searchWrapper}>
                <Form.Control
                  type="text"
                  className="form-control rounded-pill"
                  style={styles.searchInput}
                  placeholder={searchFieldPlaceholder}
                  {...searchInputProps}
                />
                <span className="input-group-text bg-white border-0">
                  <i className="si si-magnifier" style={styles.searchIcon}></i>
                </span>
              </div>
            </div>
          )}

          {hasFilterIcons && (
            <div style={styles.rightContent}>
              {filterIcon.map((icon, index) => (
                <IconBox key={index} iconName={icon.iconName} onClick={icon?.clickAction || onClick} />
              ))}
            </div>
          )}
        </div>
      )}
      <Row className="row-sm">
        <Col xl={12}>{children}</Col>
      </Row>
    </div>
  );
};

export default PageWrapper;

const styles = {
  searchWrapper: {
    position: 'relative',
    width: '100%',
  },
  searchInput: {
    paddingRight: '42px',
    fontSize: '14px',
  },
  searchIcon: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    fontSize: '16px',
    pointerEvents: 'none',
  },
  leftContent: {
    maxWidth: '420px',
    width: '100%',
  },
  rightContent: {
    width: '160px',
    height: '40px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconBox: {
    // position: "absolute",
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    background: '#fff',
    borderRadius: '50%',
    border: '1px solid #9da3af',
    marginRight: '5px',
  },
  iconGrid: {
    right: '96px',
  },
  iconList: {
    right: '48px',
  },
  iconFilter: {
    right: '0px',
  },
  menuWrap: {
    position: 'relative',
    display: 'inline-flex',
  },
  menuPanel: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    minWidth: '160px',
    border: '1px solid #e4e7ec',
    borderRadius: '12px',
    background: '#fff',
    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
    zIndex: 50,
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  menuItem: {
    border: 'none',
    background: '#fff',
    textAlign: 'left',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#1f2937',
    cursor: 'pointer',
  },
  menuItemDisabled: {
    color: '#98a2b3',
    cursor: 'not-allowed',
  },
};

