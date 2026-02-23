import React, { Fragment, useState, useEffect, useRef, useCallback } from 'react';
import { fetchSidebarMenu, getMemoizedSidebarMenu, getSidebarIcon, memoizeSidebarMenu } from './SideMenu';
// import {SAURAB_SIDE_MENU} from './SaurabSideMenu';

import Scrollbars from 'react-custom-scrollbars';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Breadcrumb from '../../pagecomponents/Breadcrumb/Breadcrumb';
import { checkEmpty, getStorage } from '../../helpers/utility';
import Loader from '../../pagecomponents/Common/Loader';

const normalizePath = (path = '') => {
  const cleanedPath = String(path || '').replace(/\/+$/, '');
  return cleanedPath || '/';
};

const resolveMenuPath = (path = '') => {
  if (!path) return `${process.env.PUBLIC_URL || ''}/`;

  const rootPath = process.env.PUBLIC_URL || '';
  const normalizedPath = String(path).startsWith('/') ? String(path) : `/${path}`;

  if (!rootPath) return normalizedPath;
  if (normalizedPath === rootPath || normalizedPath.startsWith(`${rootPath}/`)) return normalizedPath;

  return `${rootPath}${normalizedPath}`;
};

const Sidebar = () => {
  const location = useLocation();
  const initialSidebarMenu = getMemoizedSidebarMenu();
  const [menuSource, setMenuSource] = useState(initialSidebarMenu);
  const [menuitems, setMenuitems] = useState(initialSidebarMenu);
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const sidebarMenuVersionRef = useRef(JSON.stringify(initialSidebarMenu));
  const menuFetchRequestRef = useRef(0);
  // const [saurabMenuitems, setSaurabMenuitems] = useState(SAURAB_SIDE_MENU);

  let userid = getStorage('userid');
  let login_info = getStorage('login_info');
  const loginInfoData = (() => {
    try {
      return JSON.parse(getStorage('login_info') || '{}');
    } catch {
      return {};
    }
  })();
  const sidebarUserName = loginInfoData?.user_Name || loginInfoData?.staff_Name || 'Super Admin';
  const rawRoles = loginInfoData?.role_Names ?? loginInfoData?.role_Names;
  const sidebarRoles = Array.isArray(rawRoles) ? rawRoles.filter(Boolean).join(' • ') : rawRoles;

  const navigate = useNavigate();
  useEffect(() => {
    const isRootPath = normalizePath(location.pathname) === normalizePath(`${process.env.PUBLIC_URL || ''}/`);

    if (isRootPath) {
      if (checkEmpty(userid) || checkEmpty(login_info)) {
        navigate(`${process.env.PUBLIC_URL}/authentication/login`);
      } else {
        navigate(resolveMenuPath('/dashboard'));
      }
    }
  }, [location.pathname, login_info, navigate, userid]);

  useEffect(() => {
    setSidemenu(menuSource);

    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return undefined;

    mainContent.addEventListener('click', mainContentClickFn);
    return () => {
      mainContent.removeEventListener('click', mainContentClickFn);
    };
  }, [location.pathname, menuSource]);

  // location
  useEffect(() => {
    if (document.body.classList.contains('horizontal') && window.innerWidth >= 992) {
      clearMenuActive();
    }
  }, []);

  const refreshSidebarMenu = useCallback(async () => {
    const requestId = menuFetchRequestRef.current + 1;
    menuFetchRequestRef.current = requestId;
    setIsSidebarLoading(true);

    try {
      const apiMenu = await fetchSidebarMenu();
      const { changed, menu } = memoizeSidebarMenu(apiMenu);
      if (!changed) return;

      sidebarMenuVersionRef.current = JSON.stringify(menu);
      setMenuSource(menu);
    } catch (error) {
      const cachedMenu = getMemoizedSidebarMenu();
      const cachedMenuKey = JSON.stringify(cachedMenu);

      if (cachedMenuKey !== sidebarMenuVersionRef.current) {
        sidebarMenuVersionRef.current = cachedMenuKey;
        setMenuSource(cachedMenu);
      }
    } finally {
      if (menuFetchRequestRef.current === requestId) {
        setIsSidebarLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    refreshSidebarMenu();
  }, [location.pathname, refreshSidebarMenu]);

  //  In Horizontal When we click the body it should we Closed using in useEfffect Refer line No:16
  function mainContentClickFn() {
    if (document.body.classList.contains('horizontal') && window.innerWidth >= 992) {
      clearMenuActive();
    }
  }

  // --- helpers (keep near your other helpers) ---
  const normalizeMenuMatchPath = (p) => {
    if (!p) return '';
    return normalizePath(resolveMenuPath(p));
  };

  // supports exact + ":param" style (e.g. /contact/edit/:id)
  const pathToRegex = (pattern) => {
    const safe = String(pattern || '')
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape regex
      .replace(/\\:([A-Za-z0-9_]+)/g, '[^/]+'); // :id => one segment
    return new RegExp(`^${safe}$`);
  };

  const doesPathMatch = (currentPath, menuPath, alternatePath = []) => {
    const candidates = [menuPath, ...(Array.isArray(alternatePath) ? alternatePath : [])]
      .map(normalizeMenuMatchPath)
      .filter(Boolean);

    if (!candidates.length) return false;

    const current = normalizePath(currentPath);

    return candidates.some((candidate) => pathToRegex(candidate).test(current));
  };

  // ------------------ rewrites ------------------

  function setSidemenu(sourceMenu = menuSource) {
    const appRootPath = normalizePath(process.env.PUBLIC_URL || '/');
    const locationPath = normalizePath(location.pathname);
    const currentPath = locationPath === appRootPath ? normalizePath(resolveMenuPath('/dashboard')) : locationPath;

    const freshMenuitems = JSON.parse(JSON.stringify(sourceMenu || []));

    freshMenuitems.forEach((mainlevel) => {
      (mainlevel.Items || []).forEach((items) => {
        items.active = false;
        items.selected = false;

        if (doesPathMatch(currentPath, items?.path, items?.alternatePath)) {
          items.active = true;
          items.selected = true;
        }

        (items.children || []).forEach((submenu) => {
          submenu.active = false;
          submenu.selected = false;

          if (doesPathMatch(currentPath, submenu?.path, submenu?.alternatePath)) {
            items.active = true;
            items.selected = true;
            submenu.active = true;
            submenu.selected = true;
          }

          (submenu.children || []).forEach((submenu1) => {
            submenu1.active = false;
            submenu1.selected = false;

            if (doesPathMatch(currentPath, submenu1?.path, submenu1?.alternatePath)) {
              items.active = true;
              items.selected = true;
              submenu.active = true;
              submenu.selected = true;
              submenu1.active = true;
              submenu1.selected = true;
            }
          });
        });
      });
    });

    setMenuitems(freshMenuitems);
  }

  function toggleSidemenu(item) {
    // keep your existing horizontal behavior
    if (document.body.classList.contains('horizontalmenu-hover') && window.innerWidth >= 992) {
      setMenuitems((arr) => [...arr]);
      return;
    }

    // 1) if already open -> close only this item
    if (item?.active) {
      item.active = false;
      setMenuitems((arr) => [...arr]);
      return;
    }

    // 2) find the chain (ancestors) of the clicked item
    const chain = []; // will contain [level0, level1, level2, level3] upto the clicked node

    const findChain = () => {
      for (const mainlevel of menuitems) {
        for (const l0 of mainlevel.Items || []) {
          if (l0 === item) return (chain.push(l0), true);

          for (const l1 of l0.children || []) {
            if (l1 === item) return (chain.push(l0, l1), true);

            for (const l2 of l1.children || []) {
              if (l2 === item) return (chain.push(l0, l1, l2), true);

              for (const l3 of l2.children || []) {
                if (l3 === item) return (chain.push(l0, l1, l2, l3), true);
              }
            }
          }
        }
      }
      return false;
    };

    findChain();

    // 3) close everything
    menuitems.forEach((mainlevel) => {
      (mainlevel.Items || []).forEach((l0) => {
        l0.active = false;
        (l0.children || []).forEach((l1) => {
          l1.active = false;
          (l1.children || []).forEach((l2) => {
            l2.active = false;
            (l2.children || []).forEach((l3) => {
              l3.active = false;
            });
          });
        });
      });
    });

    // 4) open the chain + the clicked item
    chain.forEach((node) => {
      node.active = true;
    });

    // (if item wasn't found in chain for some reason, still open it)
    item.active = true;

    setMenuitems((arr) => [...arr]);
  }

  function clearMenuActive() {
    const freshMenuitems = JSON.parse(JSON.stringify(getMemoizedSidebarMenu() || []));

    freshMenuitems.forEach((mainlevel) => {
      (mainlevel.Items || []).forEach((items) => {
        items.active = false;
        items.selected = false;

        (items.children || []).forEach((submenu) => {
          submenu.active = false;
          submenu.selected = false;

          (submenu.children || []).forEach((submenu1) => {
            submenu1.active = false;
            submenu1.selected = false;
          });
        });
      });
    });

    setMenuitems(freshMenuitems);
  }

  //Hover effect
  function Onhover() {
    if (document.querySelector('.app')) {
      if (document.querySelector('.app').classList.contains('sidenav-toggled'))
        document.querySelector('.app').classList.add('sidenav-toggled-open');
    }
  }
  function Outhover() {
    if (document.querySelector('.app')) {
      document.querySelector('.app').classList.remove('sidenav-toggled-open');
    }
  }

  const handleSidebarLogout = () => {
    localStorage.removeItem('userid');
    localStorage.removeItem('login_info');
    navigate(`${process.env.PUBLIC_URL}/authentication/login`);
  };

  const fallbackIconByTitle = {
    Dashboard: 'dashboard',
    'Family Group': 'family',
    Contacts: 'contacts',
    Import: 'import',
    Events: 'events',
    'Event Approvals': 'eventApproval',
    'Print Approvals': 'printApproval',
    Reports: 'reports',
    'User Management': 'userManagement',
  };

  const renderMenuIcon = (menuItem) => {
    const iconName = menuItem?.iconName || fallbackIconByTitle[menuItem?.title];
    return getSidebarIcon(iconName);
  };

  const getMenuBadgeText = (menuItem) => {
    if (!menuItem) return null;

    const badgeText =
      menuItem.badgetxt ?? menuItem.badgeText ?? menuItem.btnCount ?? menuItem.btn_count ?? menuItem.badge_count;

    if (badgeText === undefined || badgeText === null || badgeText === '') return null;

    return badgeText;
  };

  const renderMenuBadge = (menuItem, extraClassName = '') => {
    const badgeText = getMenuBadgeText(menuItem);
    if (badgeText === null) return null;

    const badgeClassName = menuItem?.badge || 'nav-badge sidebar-count-badge';
    const className = [badgeClassName, extraClassName].filter(Boolean).join(' ');

    return <label className={className}>{badgeText}</label>;
  };

  return (
    <div className="sticky">
      <aside className="app-sidebar " onMouseOver={() => Onhover()} onMouseOut={() => Outhover()}>
        <Scrollbars options={{ suppressScrollX: true }} className="hor-scroll" style={{ position: 'absolute' }}>
          <div className="main-sidebar-header active">
            <NavLink className="header-logo active" to={`${process.env.PUBLIC_URL}/`}>
              <img
                src="https://imgcdn.kuick.com/cms-designer/emami/emami-logo.svg"
                className="main-logo  desktop-logo"
                alt="logo"
              />
              <img
                src="https://imgcdn.kuick.com/cms-designer/emami/emami-logo.svg"
                className="main-logo  desktop-dark"
                alt="logo"
              />
              <img
                src="https://imgcdn.kuick.com/cms-designer/emami/emami-logo.svg"
                className="main-logo  mobile-logo"
                alt="logo"
              />
              <img
                src="https://imgcdn.kuick.com/cms-designer/emami/emami-logo.svg"
                className="main-logo  mobile-dark"
                alt="logo"
              />
            </NavLink>
            {isSidebarLoading ? (
              <span className="sidebar-menu-loader" title="Loading menu">
                <i className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></i>
                <span className="sr-only">Loading menu</span>
              </span>
            ) : null}
          </div>
          <div className="sidebar-user-card">
            <h4 className="sidebar-user-name">{sidebarUserName}</h4>
            <p className="sidebar-user-meta">{sidebarRoles}</p>
          </div>
          <div className="main-sidemenu">
            <div className="slide-left disabled" id="slide-left">
              <svg xmlns="http://www.w3.org/2000/svg" fill="#7b8191" width="24" height="24" viewBox="0 0 24 24">
                <path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z" />
              </svg>
            </div>

            {!menuitems.length && isSidebarLoading ? (
              <div className="sidebar-menu-loading-panel">
                <Loader />
              </div>
            ) : (
              <ul className="side-menu">
                {menuitems.map((Item, itemi) => (
                  <Fragment key={`menu-group-${itemi}`}>
                    {Item.menutitle && <li className="side-item side-item-category">{Item.menutitle}</li>}

                    {Item.Items.map((menuItem, i) => (
                      <li
                        className={`slide ${
                          menuItem.selected ? 'is-expanded' : ''
                        }  ${menuItem.active ? 'is-expanded' : ''}`}
                        key={i}
                      >
                        {menuItem.type === 'link' ? (
                          <NavLink
                            to={resolveMenuPath(menuItem.path)}
                            className={`side-menu__item ${menuItem.selected ? ' active' : ''}`}
                          >
                            {renderMenuIcon(menuItem)}
                            <span className="side-menu__label">{menuItem.title}</span>
                            {renderMenuBadge(menuItem)}
                          </NavLink>
                        ) : (
                          ''
                        )}
                        {menuItem.type === 'sub' ? (
                          <a
                            href="javascript"
                            onClick={(event) => {
                              event.preventDefault();
                              toggleSidemenu(menuItem);
                            }}
                            className={`side-menu__item ${menuItem.selected ? 'active is-expanded' : ''}`}
                          >
                            {renderMenuIcon(menuItem)}
                            <span className="side-menu__label">
                              {menuItem.title}
                              {menuItem.active}
                            </span>
                            {renderMenuBadge(menuItem, 'side-badge')}
                            <i className="angle fe fe-chevron-right"></i>
                          </a>
                        ) : (
                          ''
                        )}

                        {menuItem.children ? (
                          <ul
                            className={`slide-menu ${menuItem.active ? 'open' : ''}`}
                            style={menuItem.active ? { display: 'block' } : { display: 'none' }}
                          >
                            {menuItem.children.map((childrenItem, index) => {
                              return (
                                <li
                                  key={index}
                                  className={`sub-slide ${
                                    childrenItem.selected ? 'is-expanded' : ''
                                  } ${childrenItem.active ? 'is-expanded' : ''}`}
                                >
                                  {childrenItem.type === 'sub' ? (
                                    <a
                                      href="javascript"
                                      className={`slide-item ${childrenItem.selected ? 'active is-expanded' : ''}`}
                                      onClick={(event) => {
                                        event.preventDefault();
                                        toggleSidemenu(childrenItem);
                                      }}
                                    >
                                      <span className="sub-side-menu__label">
                                        {childrenItem.title}
                                        {childrenItem.active}
                                      </span>
                                      {renderMenuBadge(childrenItem)}

                                      <i className="sub-angle fe fe-chevron-right"></i>
                                    </a>
                                  ) : (
                                    ''
                                  )}
                                  {childrenItem.type === 'link' ? (
                                    <span as="li">
                                      <NavLink
                                        to={resolveMenuPath(childrenItem.path)}
                                        className={`slide-item ${childrenItem.selected ? 'active' : ''}`}
                                      >
                                        {childrenItem.title}
                                        {childrenItem.active}
                                        {renderMenuBadge(childrenItem)}
                                      </NavLink>
                                    </span>
                                  ) : (
                                    ''
                                  )}
                                  {childrenItem.children ? (
                                    <ul
                                      className={`sub-slide-menu ${childrenItem.selected ? 'open' : ''}`}
                                      style={childrenItem.active ? { display: 'block' } : { display: 'none' }}
                                    >
                                      {childrenItem.children.map((childrenSubItem, key) => (
                                        <li key={key}>
                                          {childrenSubItem.type === 'link' ? (
                                            <NavLink
                                              to={resolveMenuPath(childrenSubItem.path)}
                                              className="sub-side-menu__item"
                                            >
                                              <span className="sub-side-menu__label">
                                                {childrenSubItem.title}
                                                {childrenSubItem.active}
                                              </span>
                                              {renderMenuBadge(childrenSubItem)}
                                            </NavLink>
                                          ) : (
                                            ''
                                          )}
                                          {childrenSubItem.type === 'sub' ? (
                                            <span
                                              as="li"
                                              className={`sub-slide2 ${childrenSubItem.selected ? 'is-expanded' : ''} ${
                                                childrenSubItem.active ? 'is-expanded' : ''
                                              }`}
                                            >
                                              <NavLink
                                                to="#"
                                                className="sub-side-menu__item"
                                                onClick={(event) => {
                                                  event.preventDefault();
                                                  toggleSidemenu(childrenSubItem);
                                                }}
                                              >
                                                <span className="sub-side-menu__label">
                                                  {childrenSubItem.title}
                                                  {childrenSubItem.active}
                                                </span>
                                                {renderMenuBadge(childrenSubItem)}
                                                <i className="sub-angle2 fe fe-chevron-down"></i>
                                              </NavLink>
                                              {childrenItem.children.map((childrenSubItemsub, key) => (
                                                <ul
                                                  key={key}
                                                  className={`sub-slide-menu1 ${
                                                    childrenSubItemsub.selected ? 'open' : ''
                                                  }`}
                                                  style={
                                                    childrenSubItemsub.active
                                                      ? { display: 'block' }
                                                      : { display: 'none' }
                                                  }
                                                >
                                                  {childrenItem.children.map((childrenSubItemsubs, key) => (
                                                    <li key={key}>
                                                      <NavLink className="sub-slide-item2" to="#">
                                                        {childrenSubItemsubs.title}
                                                        {childrenSubItemsubs.active}
                                                      </NavLink>
                                                    </li>
                                                  ))}
                                                </ul>
                                              ))}
                                            </span>
                                          ) : (
                                            ''
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    ''
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          ''
                        )}
                      </li>
                    ))}
                  </Fragment>
                ))}
              </ul>
            )}
            <div className="slide-right" id="slide-right">
              <svg xmlns="http://www.w3.org/2000/svg" fill="#7b8191" width="24" height="24" viewBox="0 0 24 24">
                <path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z" />
              </svg>
            </div>
          </div>
          <button type="button" className="sidebar-logout-btn" onClick={handleSidebarLogout}>
            <i className="fe fe-log-out sidebar-logout-icon" aria-hidden="true"></i>
            <span>Logout</span>
          </button>
        </Scrollbars>
      </aside>
      <Breadcrumb />
    </div>
  );
};
Sidebar.propTypes = {};

Sidebar.defaultProps = {};
export default Sidebar;

